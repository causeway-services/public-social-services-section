#!/usr/bin/env node
// The broker owns the acquisition effect and durable replay cursor. News Media
// Engineering owns the portable source-arrival carrier delivered downstream.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { sourceArrivalFromObservation, syndicationFeed } from "@red-cup-engineering/news-media-engineering-services-section/source-arrival";
import { isDirectEntrypoint, processEntrypointArgument } from "@red-cup-engineering/metroplat/integrations/process";
import { acquireSyndicationSource } from "../src/syndication.mjs";

const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_FEEDS_PATH = join(PACKAGE_ROOT, "content", "feeds", "house-feeds.json");
const DEFAULT_CURSOR_PATH = join(PACKAGE_ROOT, "data", "state", "feed-arrivals-cursor.json");
const DEFAULT_MAX_ITEMS_PER_FEED = 40;
const SUMMARY_BYTE_LIMIT = 2048;
const TRUNCATION_MARKER = "… [truncated]";
const CURSOR_KEYS_PER_FEED = 500;

function usage() { return "Usage: admit-set-of-feed-arrivals [--feeds <path>] [--cursor <path>]\\nReads {feeds:[...]} or a bare feed array from stdin when no --feeds is given.\\n"; }
function readStreamText(stream) {
  if (stream.isTTY) return Promise.resolve("");
  return new Promise((resolve) => { let text = ""; stream.setEncoding("utf8"); stream.on("data", (chunk) => { text += chunk; }); stream.on("end", () => resolve(text)); stream.on("error", () => resolve(text)); });
}

/** Validate the configured directory at the shared feed-carrier boundary. */
export function normalizeFeedList(value) {
  const feeds = Array.isArray(value) ? value : value?.feeds;
  if (!Array.isArray(feeds)) throw new TypeError("feed list must be an array or {feeds:[...]}");
  return Object.freeze(feeds.map((feed) => syndicationFeed.assert({ id: feed?.id, url: feed?.url, kind: feed?.kind === "atom" ? "atom" : "rss" }, "configured syndication feed")));
}

/** Provider-specific payload policy remains at the network boundary. */
export function boundSummary(text, byteLimit = SUMMARY_BYTE_LIMIT) {
  if (Buffer.byteLength(text, "utf8") <= byteLimit) return text;
  const budget = Math.max(0, byteLimit - Buffer.byteLength(TRUNCATION_MARKER, "utf8"));
  let buffer = Buffer.from(text, "utf8").subarray(0, budget);
  while (buffer.length > 0 && Buffer.from(buffer.toString("utf8"), "utf8").length !== buffer.length) buffer = buffer.subarray(0, buffer.length - 1);
  return `${buffer.toString("utf8")}${TRUNCATION_MARKER}`;
}

function legacyCursorKey(feedId, item) { return `sha256:${createHash("sha256").update(`${feedId}\n${item.id ?? item.url}`, "utf8").digest("hex")}`; }
function itemObservation(feed, item, observedAt) {
  return sourceArrivalFromObservation({
    feed,
    observedAt,
    item: {
      externalId: item.id ?? item.url,
      url: item.url,
      title: item.title,
      ...(item.summary ? { summary: boundSummary(item.summary) } : {}),
      ...(item.published && Number.isFinite(Date.parse(item.published)) ? { published: new Date(item.published).toISOString() } : {}),
    },
  });
}

/** Load a legacy v1 cursor or the v2 canonical replay-key cursor. */
export function loadCursor(cursorPath) {
  if (!existsSync(cursorPath)) return { version: 2, feeds: {} };
  try {
    const parsed = JSON.parse(readFileSync(cursorPath, "utf8"));
    return { version: parsed?.version === 2 ? 2 : 1, feeds: parsed && typeof parsed === "object" && parsed.feeds && typeof parsed.feeds === "object" ? parsed.feeds : {} };
  } catch { return { version: 2, feeds: {} }; }
}
export function saveCursor(cursorPath, cursor) { mkdirSync(dirname(cursorPath), { recursive: true }); writeFileSync(cursorPath, `${JSON.stringify(cursor, null, 2)}\\n`); }

/** Fetch through the provider effect and emit only unseen shared carriers. */
export async function admitSetOfFeedArrivals({ feeds, cursor, io = {}, maxItemsPerFeed = DEFAULT_MAX_ITEMS_PER_FEED, now = () => new Date().toISOString() }) {
  const nextCursor = { version: 2, feeds: { ...cursor.feeds } };
  const events = [];
  for (const configuredFeed of feeds) {
    const feed = syndicationFeed.assert(configuredFeed, "configured syndication feed");
    const seen = new Set(nextCursor.feeds[feed.id] ?? []);
    const items = await acquireSyndicationSource({ adapter: "rss", url: feed.url, max: maxItemsPerFeed }, io);
    const freshKeys = [];
    for (const item of items) {
      const arrival = itemObservation(feed, item, now());
      const key = arrival.data.deduplicationKey;
      // The only v1 compatibility rule: avoid replaying already-seen legacy rows.
      if (seen.has(key) || (cursor.version === 1 && seen.has(legacyCursorKey(feed.id, item)))) continue;
      events.push(arrival); freshKeys.push(key); seen.add(key);
    }
    if (freshKeys.length > 0) nextCursor.feeds[feed.id] = [...(nextCursor.feeds[feed.id] ?? []), ...freshKeys].slice(-CURSOR_KEYS_PER_FEED);
  }
  return Object.freeze({ events: Object.freeze(events), cursor: Object.freeze(nextCursor) });
}

if (isDirectEntrypoint(import.meta.url, processEntrypointArgument())) {
  const argv = process.argv.slice(2);
  if (argv.includes("--help")) { process.stdout.write(usage()); process.exit(0); }
  const value = (flag) => { const index = argv.indexOf(flag); return index < 0 ? undefined : argv[index + 1]; };
  const feedsFlagPath = value("--feeds"); const cursorPath = value("--cursor") ?? DEFAULT_CURSOR_PATH;
  const stdinText = await readStreamText(process.stdin);
  const feedsSource = stdinText.trim() !== "" ? JSON.parse(stdinText) : JSON.parse(readFileSync(feedsFlagPath ?? DEFAULT_FEEDS_PATH, "utf8"));
  const { events, cursor } = await admitSetOfFeedArrivals({ feeds: normalizeFeedList(feedsSource), cursor: loadCursor(cursorPath) });
  saveCursor(cursorPath, cursor); process.stdout.write(`${JSON.stringify(events, null, 2)}\\n`);
}
