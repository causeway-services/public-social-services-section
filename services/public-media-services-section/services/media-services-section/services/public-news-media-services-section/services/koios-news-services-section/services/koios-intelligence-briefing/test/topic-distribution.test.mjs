import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { computeClaimTopicDistribution, listStoreCategories } from "../src/topic-distribution.mjs";

const FIXTURE_ROOT = fileURLToPath(new URL("./fixtures/store", import.meta.url));

test("lists the fixture store's categories", () => {
  assert.deepEqual(listStoreCategories(FIXTURE_ROOT), ["collapse-tech", "culture"]);
});

test("computes total file and claim counts across the fixture store", () => {
  const distribution = computeClaimTopicDistribution({ storeRoot: FIXTURE_ROOT });
  assert.equal(distribution.totals.categories, 2);
  assert.equal(distribution.totals.files, 3);
  assert.equal(distribution.totals.claims, 8);
});

test("computes correct per-category file and claim counts", () => {
  const distribution = computeClaimTopicDistribution({ storeRoot: FIXTURE_ROOT });
  assert.deepEqual(distribution.byCategory, {
    "collapse-tech": { files: 2, claims: 5 },
    culture: { files: 1, claims: 3 },
  });
});

test("breaks down claims by force and by status as actually observed", () => {
  const distribution = computeClaimTopicDistribution({ storeRoot: FIXTURE_ROOT });
  assert.deepEqual(distribution.byForce, { alleges: 7, disputes: 1 });
  assert.deepEqual(distribution.byStatus, { supported: 7, contested: 1 });
});

test("buckets claims into a recency histogram by asserted month", () => {
  const distribution = computeClaimTopicDistribution({ storeRoot: FIXTURE_ROOT });
  assert.deepEqual(distribution.recencyByMonth, { "2026-06": 4, "2026-07": 4 });
});

test("throws for a missing store root", () => {
  const missing = join(FIXTURE_ROOT, "does-not-exist");
  assert.throws(() => computeClaimTopicDistribution({ storeRoot: missing }), /does not exist/u);
});

test("throws for a malformed store root that is a file, not a directory", () => {
  const root = mkdtempSync(join(tmpdir(), "koios-intelligence-briefing-"));
  try {
    const notADirectory = join(root, "not-a-directory");
    writeFileSync(notADirectory, "not a directory");
    assert.throws(() => computeClaimTopicDistribution({ storeRoot: notADirectory }), /not a directory/u);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("throws for a category file that is not valid claim JSON", () => {
  const root = mkdtempSync(join(tmpdir(), "koios-intelligence-briefing-"));
  try {
    const categoryRoot = join(root, "bad-category");
    mkdirSync(categoryRoot, { recursive: true });
    writeFileSync(join(categoryRoot, "broken.json"), "{ not json");
    assert.throws(() => computeClaimTopicDistribution({ storeRoot: root }), /not valid JSON/u);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
