import assert from "node:assert/strict";
import { mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { arrivalLogPathForDate, readArrivalLogProjection } from "@red-cup-engineering/metroplat/integrations/filesystem";
import { admitArrivalCandidate, parseArrivalCandidates } from "../scripts/admit-set-of-arrivals.mjs";

function cloudEvent(overrides = {}) {
  return {
    specversion: "1.0",
    id: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    source: "https://example.test/wire/rss.xml",
    type: "org.561-group.feed.item.v1",
    time: "2026-09-02T10:00:00.000Z",
    datacontenttype: "application/json",
    data: { feed: "test-wire", title: "Alpha arrives", link: "https://example.test/alpha" },
    ...overrides,
  };
}

test("parseArrivalCandidates accepts a bare object and a JSON array", () => {
  assert.deepEqual(parseArrivalCandidates(JSON.stringify(cloudEvent())), [cloudEvent()]);
  const two = [cloudEvent(), cloudEvent({ id: "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" })];
  assert.deepEqual(parseArrivalCandidates(JSON.stringify(two)), two);
});

test("parseArrivalCandidates rejects empty stdin", () => {
  assert.throws(() => parseArrivalCandidates("   "), TypeError);
});

test("admitArrivalCandidate admits a valid CloudEvent into the metroplat journal at --root", (t) => {
  const root = mkdtempSync(join(tmpdir(), "admit-set-of-arrivals-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const event = cloudEvent();
  const line = admitArrivalCandidate(root, event, 0);
  assert.equal(line.index, 0);
  assert.equal(line.ok, true);
  assert.ok(line.arrivalReceiptHandle);
  const logPath = arrivalLogPathForDate(root, "2026-09-02");
  const projection = readArrivalLogProjection(logPath);
  assert.equal(projection.validPackets, 1);
});

test("admitting the same CloudEvent id twice is idempotent (no duplicate admission row)", (t) => {
  const root = mkdtempSync(join(tmpdir(), "admit-set-of-arrivals-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const event = cloudEvent();
  const first = admitArrivalCandidate(root, event, 0);
  const second = admitArrivalCandidate(root, event, 0);
  assert.equal(first.arrivalReceiptHandle.cloudEventIdentity, second.arrivalReceiptHandle.cloudEventIdentity);
  const logPath = arrivalLogPathForDate(root, "2026-09-02");
  const projection = readArrivalLogProjection(logPath);
  assert.equal(projection.validPackets, 1, "a repeat admission of the same id must not create a second admission row");
});

test("admitArrivalCandidate reports obstructions for a malformed candidate instead of throwing", (t) => {
  const root = mkdtempSync(join(tmpdir(), "admit-set-of-arrivals-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const line = admitArrivalCandidate(root, { not: "a cloud event" }, 3);
  assert.equal(line.index, 3);
  assert.equal(line.ok, false);
});

test("the CLI entrypoint admits input when invoked through a symlink, not only its real path (production releases invoke via a releases/<pkg>/current symlink)", (t) => {
  const root = mkdtempSync(join(tmpdir(), "admit-set-of-arrivals-symlink-root-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const linkDir = mkdtempSync(join(tmpdir(), "admit-set-of-arrivals-symlink-"));
  t.after(() => rmSync(linkDir, { recursive: true, force: true }));
  const scriptLink = join(linkDir, "admit-set-of-arrivals.mjs");
  symlinkSync(new URL("../scripts/admit-set-of-arrivals.mjs", import.meta.url).pathname, scriptLink);

  const event = cloudEvent({ id: "sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc" });
  const result = spawnSync(process.execPath, [scriptLink, "--root", root], {
    input: JSON.stringify(event),
    encoding: "utf8",
  });
  assert.equal(result.status, 0, `stderr: ${result.stderr}`);
  const lines = result.stdout.trim().split("\n").filter(Boolean);
  assert.equal(lines.length, 1, "invoking through a symlink must still run the CLI body and emit exactly one result line");
  const line = JSON.parse(lines[0]);
  assert.equal(line.ok, true);
});
