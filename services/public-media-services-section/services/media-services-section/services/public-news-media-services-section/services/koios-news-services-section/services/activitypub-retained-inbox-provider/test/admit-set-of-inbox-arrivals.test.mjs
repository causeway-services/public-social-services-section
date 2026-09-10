import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  admitSetOfInboxArrivals,
  cloudEventId,
  loadCursor,
  stripSignatureFields,
} from "../scripts/admit-set-of-inbox-arrivals.mjs";
import { KOIOS_ACTOR_URI } from "../src/server.mjs";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const FIXTURE_DB_PATH = join(TEST_DIR, "fixtures", "inbox-fixture.sqlite");

function createScratchDatabase() {
  const workDir = mkdtempSync(join(tmpdir(), "inbox-arrivals-"));
  const dbPath = join(workDir, "activitypub.sqlite");
  const database = new DatabaseSync(dbPath);
  database.exec(`
    CREATE TABLE activitypub_verified_arrivals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_sha256 TEXT NOT NULL UNIQUE,
      activity_json TEXT NOT NULL,
      receipt_json TEXT NOT NULL,
      recipient TEXT,
      observed_at INTEGER NOT NULL
    )
  `);
  const insert = database.prepare("INSERT INTO activitypub_verified_arrivals (content_sha256, activity_json, receipt_json, recipient, observed_at) VALUES (?, ?, ?, ?, ?)");
  return {
    workDir,
    dbPath,
    insertActivity(hash, activity, observedAt) {
      insert.run(hash, JSON.stringify(activity), "{}", null, observedAt);
    },
    close: () => database.close(),
  };
}

test("reads the fixture inbox, redacts signature/key fields, and sets source to the actor inbox URL", () => {
  const cursor = loadCursor("/nonexistent/cursor.json");
  const { events, cursor: nextCursor } = admitSetOfInboxArrivals({ dbPath: FIXTURE_DB_PATH, cursor });
  assert.equal(events.length, 2);
  assert.equal(events[0].source, `${KOIOS_ACTOR_URI}/inbox`);
  assert.equal(events[0].type, "org.561-group.activitypub-inbox-activity.v1");
  assert.equal(events[0].data.type, "Follow");
  assert.match(events[0].id, /^sha256:[0-9a-f]{64}$/u);

  const createEvent = events[1];
  assert.equal(createEvent.data.signature, undefined);
  assert.equal(createEvent.data.object.attributedTo.publicKeyPem, undefined);
  assert.equal(createEvent.data.object.content, "hello");
  assert.equal(nextCursor.lastId, 2);
});

test("second run against the unchanged fixture db is idempotent and emits nothing new", () => {
  const first = admitSetOfInboxArrivals({ dbPath: FIXTURE_DB_PATH, cursor: loadCursor("/nonexistent/cursor.json") });
  const second = admitSetOfInboxArrivals({ dbPath: FIXTURE_DB_PATH, cursor: first.cursor });
  assert.equal(first.events.length, 2);
  assert.deepEqual(second.events, []);
});

test("a row inserted after the cursor is admitted while prior rows are not re-admitted", () => {
  const scratch = createScratchDatabase();
  try {
    scratch.insertActivity("h1", { id: "https://example.test/a/1", type: "Follow" }, Date.parse("2026-09-01T00:00:00Z"));
    const first = admitSetOfInboxArrivals({ dbPath: scratch.dbPath, cursor: loadCursor("/nonexistent/cursor.json") });
    assert.equal(first.events.length, 1);

    scratch.insertActivity("h2", { id: "https://example.test/a/2", type: "Like" }, Date.parse("2026-09-01T01:00:00Z"));
    const second = admitSetOfInboxArrivals({ dbPath: scratch.dbPath, cursor: first.cursor });
    assert.equal(second.events.length, 1);
    assert.equal(second.events[0].data.type, "Like");
  } finally {
    scratch.close();
    rmSync(scratch.workDir, { recursive: true, force: true });
  }
});

test("admitSetOfInboxArrivals returns an empty array when the database file does not exist yet", () => {
  const { events, cursor } = admitSetOfInboxArrivals({ dbPath: "/nonexistent/activitypub.sqlite", cursor: loadCursor("/nonexistent/cursor.json") });
  assert.deepEqual(events, []);
  assert.equal(cursor.lastId, 0);
});

test("stripSignatureFields removes signature and publicKey fields at any depth, case-insensitively", () => {
  const stripped = stripSignatureFields({ id: "x", Signature: { r: 1 }, nested: { publicKeyPem: "y", keep: "z" } });
  assert.equal(stripped.id, "x");
  assert.equal(stripped.Signature, undefined);
  assert.equal(stripped.nested.publicKeyPem, undefined);
  assert.equal(stripped.nested.keep, "z");
});

test("cloudEventId is stable for the same db+activity id and differs across activity ids", () => {
  const a = cloudEventId("/db.sqlite", 1, { id: "https://example.test/a" });
  const b = cloudEventId("/db.sqlite", 2, { id: "https://example.test/b" });
  assert.equal(a, cloudEventId("/db.sqlite", 1, { id: "https://example.test/a" }));
  assert.notEqual(a, b);
});
