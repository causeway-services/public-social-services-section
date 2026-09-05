#!/usr/bin/env node
// Reads a house feed list (RSS/Atom), fetches each feed with the existing
// syndication parser, and emits ONLY items not previously seen as a JSON
// array of CloudEvents on stdout. Never calls metroplat: composition with
// the journal-admitting CLI happens later in the shell via a pipe
// (`admit-set-of-feed-arrivals | infograph-admit-arrival --root <data root>`).
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { acquireSyndicationSource } from "../src/syndication.mjs";
import { isDirectEntrypoint, processEntrypointArgument } from "@red-cup-engineering/metroplat/integrations/process";

const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_FEEDS_PATH = join(PACKAGE_ROOT, "content", "feeds", "house-feeds.json");
const DEFAULT_CURSOR_PATH = join(PACKAGE_ROOT, "data", "state", "feed-arrivals-cursor.json");
const DEFAULT_MAX_ITEMS_PER_FEED = 40;
const SUMMARY_BYTE_LIMIT = 2048;
const TRUNCATION_MARKER = "… [truncated]";
// Bounds how many prior ids are retained per feed; large enough that a feed's
// unread window never re-surfaces a truly-seen item, small enough the cursor
// file stays cheap to read and rewrite each run.
const CURSOR_IDS_PER_FEED = 500;

function usage() {
  return "Usage: admit-set-of-feed-arrivals [--feeds <path>] [--cursor <path>]\n" +
    "Reads {feeds:[...]} or a bare feed array from stdin when no --feeds is given\n" +
    "and stdin carries content; otherwise reads --feeds, defaulting to\n" +
    "content/feeds/house-feeds.json under the package root.\n";
}

/**
 * Reads all bytes available on a stream without blocking when nothing is piped in.
 * @param {NodeJS.ReadStream} stream - stdin or an equivalent readable stream.
 * @returns {Promise<string>} the stream's full text, or "" when the stream is a TTY.
 */
function readStreamText(stream) {
  if (stream.isTTY) return Promise.resolve("");
  return new Promise((resolve) => {
    let text = "";
    stream.setEncoding("utf8");
    stream.on("data", (chunk) => { text += chunk; });
    stream.on("end", () => resolve(text));
    stream.on("error", () => resolve(text));
  });
}

/**
 * Normalizes a feeds document (bare array or {feeds:[...]}) into a flat array.
 * @param {unknown} value - parsed JSON from stdin or a feeds file.
 * @returns {Array<{id: string, url: string, kind: string}>} the feed list.
 * @throws {TypeError} when the value carries no usable feed array.
 */
export function normalizeFeedList(value) {
  const feeds = Array.isArray(value) ? value : value?.feeds;
  if (!Array.isArray(feeds)) throw new TypeError("feed list must be an array or {feeds:[...]}");
  return feeds.map((feed) => {
    if (typeof feed?.id !== "string" || feed.id === "" || typeof feed?.url !== "string" || feed.url === "") throw new TypeError("each feed requires a non-empty id and url");
    return { id: feed.id, url: feed.url, kind: feed.kind === "atom" ? "atom" : "rss" };
  });
}

/**
 * Computes the CloudEvent id for one syndication item.
 * @param {string} feedId - the feed's stable id.
 * @param {{id?: string, url: string}} item - a syndication item (id falls back to url upstream).
 * @returns {string} a `sha256:<hex>` id, stable across runs for the same feed/item pair.
 */
export function cloudEventId(feedId, item) {
  // Plain sha256: prefix, not an `ni:` URI: no `ni:`-identity primitive is
  // already a dependency of this package, and this alone doesn't earn one.
  const key = item.id ?? item.url;
  return `sha256:${createHash("sha256").update(`${feedId}\n${key}`, "utf8").digest("hex")}`;
}

/**
 * Truncates text to a byte budget under UTF-8, appending a truncation marker when cut.
 * @param {string} text - the text to bound.
 * @param {number} byteLimit - the maximum UTF-8 byte length of the result.
 * @returns {string} `text` unchanged if already within budget, else a truncated copy.
 */
export function boundSummary(text, byteLimit = SUMMARY_BYTE_LIMIT) {
  if (Buffer.byteLength(text, "utf8") <= byteLimit) return text;
  const markerBytes = Buffer.byteLength(TRUNCATION_MARKER, "utf8");
  const budget = Math.max(0, byteLimit - markerBytes);
  let buffer = Buffer.from(text, "utf8").subarray(0, budget);
  // Avoid splitting a multi-byte UTF-8 sequence: back off until the tail decodes cleanly.
  while (buffer.length > 0 && Buffer.from(buffer.toString("utf8"), "utf8").length !== buffer.length) buffer = buffer.subarray(0, buffer.length - 1);
  return `${buffer.toString("utf8")}${TRUNCATION_MARKER}`;
}

/**
 * Maps one syndication item to a CloudEvent envelope.
 * @param {{id: string, url: string, kind: string}} feed - the source feed.
 * @param {{title: string, url: string, id?: string, summary?: string, published?: string}} item - a fetched item.
 * @returns {object} a CloudEvents 1.0 envelope carrying the item as `data`.
 */
export function itemToCloudEvent(feed, item) {
  const published = item.published ?? "";
  const time = Number.isFinite(Date.parse(published)) ? new Date(published).toISOString() : new Date(0).toISOString();
  return {
    specversion: "1.0",
    id: cloudEventId(feed.id, item),
    source: feed.url,
    type: "org.561-group.feed.item.v1",
    time,
    datacontenttype: "application/json",
    data: {
      feed: feed.id,
      title: item.title,
      link: item.url,
      ...(item.summary ? { summary: boundSummary(item.summary) } : {}),
      ...(item.published ? { published: item.published } : {}),
    },
  };
}

/**
 * Loads the dedup cursor from disk, tolerating a missing or empty file.
 * @param {string} cursorPath - path to the cursor JSON file.
 * @returns {{version: number, feeds: Record<string, string[]>}} the cursor document.
 */
export function loadCursor(cursorPath) {
  if (!existsSync(cursorPath)) return { version: 1, feeds: {} };
  try {
    const parsed = JSON.parse(readFileSync(cursorPath, "utf8"));
    return { version: 1, feeds: (parsed && typeof parsed === "object" && parsed.feeds && typeof parsed.feeds === "object") ? parsed.feeds : {} };
  } catch { return { version: 1, feeds: {} }; }
}

/**
 * Writes the dedup cursor to disk, creating parent directories as needed.
 * @param {string} cursorPath - path to the cursor JSON file.
 * @param {{version: number, feeds: Record<string, string[]>}} cursor - the cursor document to persist.
 * @returns {void}
 */
export function saveCursor(cursorPath, cursor) {
  mkdirSync(dirname(cursorPath), { recursive: true });
  writeFileSync(cursorPath, `${JSON.stringify(cursor, null, 2)}\n`);
}

/**
 * Fetches every configured feed and emits CloudEvents for items not already in the cursor.
 * @param {object} options
 * @param {Array<{id: string, url: string, kind: string}>} options.feeds - the feed list.
 * @param {{version: number, feeds: Record<string, string[]>}} options.cursor - the prior dedup cursor.
 * @param {object} [options.io] - `acquireSyndicationSource` io overrides (fetchImpl/backoff), for tests.
 * @param {number} [options.maxItemsPerFeed] - per-feed fetch bound passed through as `max`.
 * @returns {Promise<{events: object[], cursor: {version: number, feeds: Record<string, string[]>}}>}
 *   the new CloudEvents and the updated cursor to persist.
 */
export async function admitSetOfFeedArrivals({ feeds, cursor, io = {}, maxItemsPerFeed = DEFAULT_MAX_ITEMS_PER_FEED }) {
  const nextCursor = { version: 1, feeds: { ...cursor.feeds } };
  const events = [];
  for (const feed of feeds) {
    const seen = new Set(nextCursor.feeds[feed.id] ?? []);
    // syndication.mjs's "rss" adapter auto-detects Atom vs RSS from the XML
    // itself (<entry> vs <item>); "atom" is not a real adapter value there,
    // so feed.kind is carried for house-feeds.json readability only.
    const items = await acquireSyndicationSource({ adapter: "rss", url: feed.url, max: maxItemsPerFeed }, io);
    const freshIds = [];
    for (const item of items) {
      const id = cloudEventId(feed.id, item);
      if (seen.has(id)) continue;
      events.push(itemToCloudEvent(feed, item));
      freshIds.push(id);
      seen.add(id);
    }
    if (freshIds.length > 0) nextCursor.feeds[feed.id] = [...(cursor.feeds[feed.id] ?? []), ...freshIds].slice(-CURSOR_IDS_PER_FEED);
  }
  return { events, cursor: nextCursor };
}

if (isDirectEntrypoint(import.meta.url, processEntrypointArgument())) {
  const argv = process.argv.slice(2);
  if (argv.includes("--help")) { process.stdout.write(usage()); process.exit(0); }
  const value = (flag) => { const index = argv.indexOf(flag); return index < 0 ? undefined : argv[index + 1]; };
  const feedsFlagPath = value("--feeds");
  const cursorPath = value("--cursor") ?? DEFAULT_CURSOR_PATH;

  const stdinText = await readStreamText(process.stdin);
  let feedsSource;
  if (stdinText.trim() !== "") feedsSource = JSON.parse(stdinText);
  else feedsSource = JSON.parse(readFileSync(feedsFlagPath ?? DEFAULT_FEEDS_PATH, "utf8"));

  const feeds = normalizeFeedList(feedsSource);
  const cursor = loadCursor(cursorPath);
  const { events, cursor: nextCursor } = await admitSetOfFeedArrivals({ feeds, cursor });
  saveCursor(cursorPath, nextCursor);
  process.stdout.write(`${JSON.stringify(events, null, 2)}\n`);
}
