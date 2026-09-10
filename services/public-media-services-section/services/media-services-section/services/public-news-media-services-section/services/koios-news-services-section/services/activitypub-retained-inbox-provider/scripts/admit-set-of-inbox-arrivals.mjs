#!/usr/bin/env node
// Reads the Koios actor's retained ActivityPub inbox (SQLite table
// activitypub_verified_arrivals at ACTIVITYPUB_SQLITE_PATH, written by
// activitypub-services-section's sqlite-custody) and emits ONLY rows not
// previously seen as a JSON array of CloudEvents on stdout, mirroring
// newscable-source-broker's admit-set-of-feed-arrivals.mjs shape (an
// id-based cursor). Read-only, never writes to the ActivityPub SQLite
// file. Never calls metroplat; composed later via a shell pipe.
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { KOIOS_ACTOR_URI } from "../src/server.mjs";

const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_CURSOR_PATH = join(PACKAGE_ROOT, "data", "state", "inbox-arrivals-cursor.json");
const TABLE_NAME = "activitypub_verified_arrivals";
const INBOX_URL = `${KOIOS_ACTOR_URI}/inbox`;
// Any key at any depth matching this pattern is dropped from the emitted
// activity object: signature envelopes and public-key material belong to
// verification, never to a Monitor-lane signal.
const SIGNATURE_KEY_PATTERN = /signature|publickey/iu;

function usage() {
  return "Usage: admit-set-of-inbox-arrivals [--db <sqlite-path>] [--cursor <path>]\n" +
    "Reads --db (default ACTIVITYPUB_SQLITE_PATH env) read-only and emits one\n" +
    "CloudEvent per row whose id is greater than the recorded cursor. When\n" +
    "the database file does not exist yet, emits an empty array.\n";
}

/**
 * Recursively removes any key matching `SIGNATURE_KEY_PATTERN` from a JSON value.
 * @param {unknown} value - a parsed ActivityPub activity object (or a nested part of one).
 * @returns {unknown} a deep copy of `value` with signature/key fields removed.
 */
export function stripSignatureFields(value) {
  if (Array.isArray(value)) return value.map((item) => stripSignatureFields(item));
  if (value !== null && typeof value === "object") {
    const out = {};
    for (const [key, nested] of Object.entries(value)) {
      if (SIGNATURE_KEY_PATTERN.test(key)) continue;
      out[key] = stripSignatureFields(nested);
    }
    return out;
  }
  return value;
}

/**
 * Computes the CloudEvent id for one inbox activity row.
 * @param {string} dbPath - the SQLite file's path, mixed in so ids never collide across databases.
 * @param {number} rowId - the row's autoincrement id.
 * @param {unknown} activity - the parsed (pre-redaction) activity object.
 * @returns {string} a `sha256:<hex>` id, stable for the same db+row.
 */
export function cloudEventId(dbPath, rowId, activity) {
  const activityId = activity && typeof activity === "object" && typeof activity.id === "string" ? activity.id : String(rowId);
  return `sha256:${createHash("sha256").update(`${dbPath}\n${activityId}`, "utf8").digest("hex")}`;
}

/**
 * Maps one retained-inbox row to a CloudEvent envelope.
 * @param {object} options
 * @param {string} options.dbPath - the SQLite file's path, used to compute a stable id.
 * @param {number} options.rowId - the row's autoincrement id.
 * @param {unknown} options.activity - the parsed activity object.
 * @param {number} options.observedAt - the row's `observed_at` epoch-milliseconds value.
 * @returns {object} a CloudEvents 1.0 envelope carrying the redacted activity as `data`.
 */
export function rowToCloudEvent({ dbPath, rowId, activity, observedAt }) {
  const published = activity && typeof activity === "object" ? activity.published : undefined;
  const time = typeof published === "string" && Number.isFinite(Date.parse(published)) ? new Date(published).toISOString() : new Date(observedAt).toISOString();
  return {
    specversion: "1.0",
    id: cloudEventId(dbPath, rowId, activity),
    source: INBOX_URL,
    type: "org.561-group.activitypub-inbox-activity.v1",
    time,
    datacontenttype: "application/json",
    data: stripSignatureFields(activity),
  };
}

/**
 * Loads the id-based dedup cursor from disk, tolerating a missing or empty file.
 * @param {string} cursorPath - path to the cursor JSON file.
 * @returns {{version: number, lastId: number}} the cursor document.
 */
export function loadCursor(cursorPath) {
  if (!existsSync(cursorPath)) return { version: 1, lastId: 0 };
  try {
    const parsed = JSON.parse(readFileSync(cursorPath, "utf8"));
    return { version: 1, lastId: Number.isSafeInteger(parsed?.lastId) ? parsed.lastId : 0 };
  } catch { return { version: 1, lastId: 0 }; }
}

/**
 * Writes the id-based dedup cursor to disk, creating parent directories as needed.
 * @param {string} cursorPath - path to the cursor JSON file.
 * @param {{version: number, lastId: number}} cursor - the cursor document to persist.
 * @returns {void}
 */
export function saveCursor(cursorPath, cursor) {
  mkdirSync(dirname(cursorPath), { recursive: true });
  writeFileSync(cursorPath, `${JSON.stringify(cursor, null, 2)}\n`);
}

/**
 * Reads rows past `cursor.lastId` from the retained-inbox SQLite table and maps them to CloudEvents.
 * @param {object} options
 * @param {string} options.dbPath - path to the ActivityPub SQLite state file.
 * @param {{version: number, lastId: number}} options.cursor - the prior dedup cursor.
 * @param {{open?: (dbPath: string) => {prepare: Function, close: () => void}}} [options.io] - test-only database-opener override.
 * @returns {{events: object[], cursor: {version: number, lastId: number}}}
 *   the new CloudEvents and the updated cursor to persist.
 */
export function admitSetOfInboxArrivals({ dbPath, cursor, io = {} }) {
  const open = io.open ?? ((path) => {
    const database = new DatabaseSync(path, { readOnly: true });
    return { prepare: (sql) => database.prepare(sql), close: () => database.close() };
  });
  if (!existsSync(dbPath)) return { events: [], cursor: { version: 1, lastId: cursor.lastId } };
  const database = open(dbPath);
  try {
    const rows = database.prepare(`SELECT id, activity_json, observed_at FROM "${TABLE_NAME}" WHERE id > ? ORDER BY id ASC`).all(cursor.lastId);
    const events = rows.map((row) => rowToCloudEvent({ dbPath, rowId: row.id, activity: JSON.parse(row.activity_json), observedAt: row.observed_at }));
    const lastId = rows.length > 0 ? rows[rows.length - 1].id : cursor.lastId;
    return { events, cursor: { version: 1, lastId } };
  } finally {
    database.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = process.argv.slice(2);
  if (argv.includes("--help")) { process.stdout.write(usage()); process.exit(0); }
  const value = (flag) => { const index = argv.indexOf(flag); return index < 0 ? undefined : argv[index + 1]; };
  const dbPath = value("--db") ?? process.env.ACTIVITYPUB_SQLITE_PATH;
  const cursorPath = value("--cursor") ?? DEFAULT_CURSOR_PATH;
  if (!dbPath) { process.stderr.write("admit-set-of-inbox-arrivals: --db or ACTIVITYPUB_SQLITE_PATH is required\n"); process.exit(1); }

  const cursor = loadCursor(cursorPath);
  const { events, cursor: nextCursor } = admitSetOfInboxArrivals({ dbPath, cursor });
  saveCursor(cursorPath, nextCursor);
  process.stdout.write(`${JSON.stringify(events, null, 2)}\n`);
}
