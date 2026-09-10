import assert from "node:assert/strict";
import { join } from "node:path";
import test from "node:test";
import { entityAddress } from "@red-cup-engineering/eavt";
import { storeFileToRows, storeToTrace, stratifyArticle, stratifyStore } from "../src/claim-rows.mjs";

const fixtures = join(import.meta.dirname, "fixtures", "claim-store");
const fourClaimFile = join(fixtures, "collapse-tech", "geopolitical-jitters-push-europe-s-internet-registry-away-from-cloud-first-strategy.json");
const threeClaimFile = join(fixtures, "economy", "forecasting-the-covid-surge-in-inflation-by-mark-w-watson.json");

test("storeFileToRows derives an article: address stable across runs, matching entityAddress(genesisRow)", () => {
  const first = storeFileToRows(fourClaimFile);
  const second = storeFileToRows(fourClaimFile);
  assert.equal(first.entity, second.entity);
  assert.match(first.entity, /^article:/u);
  const genesisRow = first.rows.find((row) => row.a === "constituted");
  assert.ok(genesisRow, "genesis row present");
  assert.equal(entityAddress(genesisRow), first.entity);
});

test("storeFileToRows emits the exact row count for a four-claim article (genesis + 4 base + 4x4 per-claim + category + slug)", () => {
  const { rows } = storeFileToRows(fourClaimFile);
  assert.equal(rows.length, 23);
  assert.deepEqual(rows.filter((row) => row.a === "title").map((row) => row.v), ["Geopolitical jitters push Europe's internet registry away from cloud-first strategy"]);
  assert.equal(rows.filter((row) => row.a === "published").length, 1);
  assert.equal(rows.filter((row) => row.a === "store-category").length, 1);
  assert.equal(rows.find((row) => row.a === "store-category").v, "collapse-tech");
  assert.equal(rows.find((row) => row.a === "store-slug").v, "geopolitical-jitters-push-europe-s-internet-registry-away-from-cloud-first-strategy");
});

test("storeFileToRows emits the exact row count for a three-claim article missing published (genesis + 3 base + 3x4 per-claim + category + slug)", () => {
  const { rows } = storeFileToRows(threeClaimFile);
  assert.equal(rows.length, 18);
  assert.equal(rows.filter((row) => row.a === "published").length, 0);
  assert.equal(rows.filter((row) => row.a === "title").length, 1);
  assert.equal(rows.filter((row) => row.a === "witness").length, 3);
});

test("storeToTrace walks all categories deterministically and returns a per-file receipt {file, entity, rows}", () => {
  const { rows, receipts } = storeToTrace(fixtures);
  assert.equal(receipts.length, 3);
  assert.deepEqual(receipts.map((receipt) => receipt.file.includes("collapse-tech") ? "collapse-tech" : "economy"), ["collapse-tech", "economy", "economy"]);
  for (const receipt of receipts) {
    assert.match(receipt.entity, /^article:/u);
    assert.ok(Array.isArray(receipt.rows) && receipt.rows.length > 0);
  }
  assert.equal(rows.length, receipts.reduce((sum, receipt) => sum + receipt.rows.length, 0));
  assert.equal(rows.length, 23 + 23 + 18);
});

test("stratifyArticle yields the three strata with the title row present at Level 0, settled equal to saturated since nothing is retracted", () => {
  const { rows, receipts } = storeToTrace(fixtures);
  for (const { entity } of receipts) {
    const strata = stratifyArticle(rows, entity);
    assert.equal(strata.entity, entity);
    assert.ok(strata.asserted.some((row) => row.a === "title"), "title row present at Level 0 asserted");
    assert.equal(strata.saturated.length, strata.asserted.length, "nothing retracted: saturated equals asserted in row count");
    assert.equal(strata.settled.fiber.length, strata.saturated.length, "nothing retracted: settled cell count equals saturated row count");
    for (const cell of strata.settled.fiber) {
      assert.equal(cell.value.neg, 0, "no denied/contradicted cells with no retraction or converse");
    }
  }
});

test("stratifyStore summarizes the corpus across every entity", () => {
  const { rows } = storeToTrace(fixtures);
  const { entities, summary } = stratifyStore(rows);
  assert.equal(entities.length, 3);
  assert.equal(summary.entities, 3);
  assert.equal(summary.rows, 64);
  assert.equal(summary.saturated, summary.asserted);
  assert.equal(summary.settled, summary.saturated);
});

test("stratifyStore rejects non-array rows", () => {
  assert.throws(() => stratifyStore("not-an-array"), /rows must be an/);
});
