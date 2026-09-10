import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { fromFetch } from "@red-cup-engineering/http-server";
import { startWitnessJournalProviderProcess } from "@red-cup-engineering/witness-journal-document-service/test-provider";

import { createKoiosNewsSiteApp } from "../dist/index.mjs";
import { aAdsInventoryRouting, aAdsSupplierHealth, parseAAdsPublicStats, parseAAdsPublicUnitState } from "../dist/management/aads-public-performance.mjs";
import { appendKoiosAct } from "../dist/management/ledger.mjs";

const root = new URL("..", import.meta.url).pathname;
let priorWitnessJournalAgent;
let witnessJournal;

test.before(async () => {
  priorWitnessJournalAgent = process.env.WITNESS_JOURNAL_RDF_AGENT;
  witnessJournal = await startWitnessJournalProviderProcess();
  process.env.WITNESS_JOURNAL_RDF_AGENT = witnessJournal.agentCardUrl;
});

test.after(async () => {
  if (priorWitnessJournalAgent === undefined) delete process.env.WITNESS_JOURNAL_RDF_AGENT;
  else process.env.WITNESS_JOURNAL_RDF_AGENT = priorWitnessJournalAgent;
  await witnessJournal.close();
});

test("AADS public daily rows retain requests and do not invent revenue", () => {
  const html = `<table class='table-stats'><thead><tr><th>Date</th></tr></thead><tbody><tr><td><p>Total</p><span>2026-07-18 - 2026-07-19</span></td><td><span>12</span></td><td><span>2</span></td><td><span>1</span></td><td><span>16.67%</span></td><td><span>3</span></td><td><span>100.00%</span></td></tr><tr><td><span>2026-07-19</span></td><td><span>1,234</span></td><td><span>12</span></td><td><span>3</span></td><td><span>0.97%</span></td><td><span>2</span></td><td><span>13.33%</span></td></tr></tbody></table>`;
  assert.deepEqual(parseAAdsPublicStats(html, "2382512", "https://aads.example/stats"), [{ unitId: "2382512", day: "2026-07-19", adRequests: 1234, paidImpressions: 12, affiliateImpressions: 3, fillRateBasisPoints: 97, clicks: 2, ctrBasisPoints: 1333, sourceUrl: "https://aads.example/stats" }]);
});

test("public unit state exposes supplier health without claiming revenue", () => {
  const html = `<span class="status-bad trigger-sibling-tooltip">Not found</span><p><span>Page URL:</span><a href="https://koios.news/old">old</a> (display rate: ~0%)</p><p><span>Estimated daily income:</span><nobr>0.00000000 ₿</nobr><small>Since there are not enough paying advertisers, 100% of traffic is used to display affiliate ads</small></p>`;
  assert.deepEqual(parseAAdsPublicUnitState(html, "2381631", "https://aads.com/ad_units/2381631"), {
    unitId: "2381631",
    status: "Not found",
    pageUrl: "https://koios.news/old",
    displayRateBasisPoints: 0,
    estimatedDailyIncomeBtc: "0.00000000",
    affiliateTrafficBasisPoints: 10_000,
    sourceUrl: "https://aads.com/ad_units/2381631",
  });
});

test("supplier health separates provider verification from editorial performance", () => {
  const state = (unitId, status, displayRateBasisPoints) => ({ unitId, status, pageUrl: "https://koios.news/posts/story", displayRateBasisPoints, estimatedDailyIncomeBtc: "0.00000000", affiliateTrafficBasisPoints: 10_000, sourceUrl: `https://aads.com/ad_units/${unitId}` });
  const reading = aAdsSupplierHealth([state("1", "Not found", 0), state("2", "Low income", 10_000)]);
  assert.equal(reading.disposition, "verification-obstructed");
  assert.deepEqual(reading.notFoundUnits, ["1"]);
  assert.deepEqual(reading.zeroIncomeUnits, ["1", "2"]);
  assert.match(reading.requiredMoves.join(" "), /provider-side verification URL/u);
  assert.match(reading.requiredMoves.join(" "), /monetization supplier/u);
  assert.equal(reading.factualWarrant, false);
});

test("supplier health removes broken units from the next rendered inventory", async () => {
  const records = [
    { recordedAt: "2026-07-19T10:00:00.000Z", act: "advertising.aads-unit-state.observed", subject: "1", data: { unitId: "1", status: "Not found", displayRateBasisPoints: 0 } },
    { recordedAt: "2026-07-19T10:00:00.000Z", act: "advertising.aads-unit-state.observed", subject: "2", data: { unitId: "2", status: "Low income", displayRateBasisPoints: 8900 } },
  ];
  const routing = aAdsInventoryRouting(records, ["1", "2", "3"]);
  assert.equal(routing.mode, "provider-health-adapted");
  assert.deepEqual(routing.activeUnits, ["2"]);
  assert.deepEqual(routing.excludedUnits.map((entry) => entry.unitId), ["1", "3"]);

  const dataDir = mkdtempSync(join(tmpdir(), "koios-aads-routing-"));
  for (const record of records.slice(0, 2)) await appendKoiosAct({ dataRoot: dataDir, ledger: "advertising", instant: record.recordedAt, act: record.act, subject: record.subject, data: record.data });
  for (const [unitId, status, displayRateBasisPoints] of [["2381631", "Not found", 0], ["2382509", "Not found", 0], ["2382510", "Low income", 8900], ["2382512", "Low income", 10000]]) {
    await appendKoiosAct({ dataRoot: dataDir, ledger: "advertising", instant: "2026-07-19T10:01:00.000Z", act: "advertising.aads-unit-state.observed", subject: unitId, data: { unitId, status, displayRateBasisPoints } });
  }
  const fetchApp = fromFetch(createKoiosNewsSiteApp({ dataDir, editorialAdmission: "legacy" }));
  const response = await fetchApp(new Request("https://koios.news/"));
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.doesNotMatch(html, /data-aa="2381631"|data-aa="2382509"/u);
  assert.match(html, /data-aa="2382510"|data-aa="2382512"/u);
});

test("AADS import is advertised and refuses an unadmitted trigger without mutation", () => {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  assert.equal(pkg.bin["operate-aads-performance-import"], "./dist/operate-aads-performance-import.mjs");
  assert.equal(pkg["x-agentic-metro-enterprise"]["operation-catalog"]["operate-aads-performance-import"].contract, "koios-news/aads-performance-import/v1");
  const dataDir = mkdtempSync(join(tmpdir(), "koios-aads-refusal-"));
  const activity = { "@context": "https://www.w3.org/ns/activitystreams", id: "urn:test:bad-aads-trigger", type: "Create", actor: "urn:test:not-clockkeeper", target: "https://koios.news/activitypub/actor", capability: "urn:test:none", object: { type: "AAdsPerformanceImportDemand", contract: "koios-news/aads-performance-import/v1", pulseId: "bad" } };
  const run = spawnSync(process.execPath, [join(root, "dist/operate-aads-performance-import.mjs"), "--now", "2026-07-19T07:40:00.000Z", "--data-dir", dataDir], { input: JSON.stringify(activity), encoding: "utf8" });
  assert.equal(run.status, 2);
  assert.equal(JSON.parse(run.stdout).type, "Reject");
});
