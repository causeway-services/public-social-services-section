import assert from "node:assert/strict";
import test from "node:test";
import { admitSetOfFeedArrivals, boundSummary, cloudEventId, itemToCloudEvent, loadCursor, normalizeFeedList } from "../scripts/admit-set-of-feed-arrivals.mjs";

const FEED_URL = "https://example.test/wire/rss.xml";
const FEED = { id: "test-wire", url: FEED_URL, kind: "rss" };

function rssItem({ title, link, description = "", pubDate = "Wed, 02 Sep 2026 10:00:00 GMT" }) {
  return `<item><title>${title}</title><link>${link}</link><description>${description}</description><pubDate>${pubDate}</pubDate></item>`;
}

function fetcherFor(xml) {
  return { fetchImpl: async () => ({ ok: true, status: 200, text: async () => xml }) };
}

test("first run emits all items as CloudEvents and the cursor records their ids", async () => {
  const xml = `<rss><channel>${rssItem({ title: "Alpha arrives", link: "https://example.test/alpha" })}${rssItem({ title: "Beta arrives", link: "https://example.test/beta" })}</channel></rss>`;
  const feed = { id: "test-wire", url: FEED_URL, kind: "rss" };
  const { events, cursor } = await admitSetOfFeedArrivals({ feeds: [feed], cursor: loadCursor("/nonexistent/cursor.json"), io: fetcherFor(xml) });
  assert.equal(events.length, 2);
  assert.equal(events[0].specversion, "1.0");
  assert.equal(events[0].type, "org.561-group.feed.item.v1");
  assert.equal(events[0].source, FEED_URL);
  assert.equal(events[0].data.feed, "test-wire");
  assert.equal(events[0].data.title, "Alpha arrives");
  assert.equal(events[0].data.link, "https://example.test/alpha");
  assert.match(events[0].id, /^sha256:[0-9a-f]{64}$/u);
  assert.equal(cursor.feeds["test-wire"].length, 2);
});

test("second run against the same feed data is idempotent and emits nothing new", async () => {
  const xml = `<rss><channel>${rssItem({ title: "Alpha arrives", link: "https://example.test/alpha" })}</channel></rss>`;
  const feed = { id: "test-wire", url: FEED_URL, kind: "rss" };
  const first = await admitSetOfFeedArrivals({ feeds: [feed], cursor: loadCursor("/nonexistent/cursor.json"), io: fetcherFor(xml) });
  const second = await admitSetOfFeedArrivals({ feeds: [feed], cursor: first.cursor, io: fetcherFor(xml) });
  assert.equal(first.events.length, 1);
  assert.deepEqual(second.events, []);
});

test("a new item appearing later is emitted while the previously-seen item is not", async () => {
  const feed = { id: "test-wire", url: FEED_URL, kind: "rss" };
  const firstXml = `<rss><channel>${rssItem({ title: "Alpha arrives", link: "https://example.test/alpha" })}</channel></rss>`;
  const secondXml = `<rss><channel>${rssItem({ title: "Beta arrives", link: "https://example.test/beta" })}${rssItem({ title: "Alpha arrives", link: "https://example.test/alpha" })}</channel></rss>`;
  const first = await admitSetOfFeedArrivals({ feeds: [feed], cursor: loadCursor("/nonexistent/cursor.json"), io: fetcherFor(firstXml) });
  const second = await admitSetOfFeedArrivals({ feeds: [feed], cursor: first.cursor, io: fetcherFor(secondXml) });
  assert.equal(second.events.length, 1);
  assert.equal(second.events[0].data.title, "Beta arrives");
});

test("summaries longer than 2 KB are truncated with a marker and shorter ones pass through unchanged", () => {
  const short = "A short summary.";
  assert.equal(boundSummary(short), short);
  const long = "x".repeat(3000);
  const truncated = boundSummary(long);
  assert.ok(Buffer.byteLength(truncated, "utf8") <= 2048);
  assert.match(truncated, /… \[truncated\]$/u);
  assert.notEqual(truncated, long);
});

test("cloudEventId is stable for the same feed+item and differs across feeds", () => {
  const item = { id: "https://example.test/alpha", url: "https://example.test/alpha" };
  const a = cloudEventId("wire-a", item);
  const b = cloudEventId("wire-b", item);
  assert.equal(a, cloudEventId("wire-a", item));
  assert.notEqual(a, b);
});

test("normalizeFeedList accepts both a bare array and a {feeds:[...]} document", () => {
  const fromBare = normalizeFeedList([{ id: "a", url: "https://example.test/a" }]);
  const fromWrapped = normalizeFeedList({ feeds: [{ id: "a", url: "https://example.test/a", kind: "atom" }] });
  assert.equal(fromBare[0].kind, "rss");
  assert.equal(fromWrapped[0].kind, "atom");
});

test("itemToCloudEvent falls back to the epoch when published is missing or unparseable", () => {
  const event = itemToCloudEvent(FEED, { title: "No date", url: "https://example.test/no-date" });
  assert.equal(event.time, new Date(0).toISOString());
});

test("a feed marked kind:atom is still fetched (syndication.mjs's 'rss' adapter auto-detects Atom XML)", async () => {
  const atomXml = `<feed><entry><title>Atom item</title><link href="https://example.test/atom-item"/><id>https://example.test/atom-item</id><updated>2026-09-02T10:00:00Z</updated></entry></feed>`;
  const feed = { id: "atom-wire", url: "https://example.test/wire/atom.xml", kind: "atom" };
  const { events } = await admitSetOfFeedArrivals({ feeds: [feed], cursor: loadCursor("/nonexistent/cursor.json"), io: fetcherFor(atomXml) });
  assert.equal(events.length, 1);
  assert.equal(events[0].data.title, "Atom item");
  assert.equal(events[0].data.link, "https://example.test/atom-item");
});
