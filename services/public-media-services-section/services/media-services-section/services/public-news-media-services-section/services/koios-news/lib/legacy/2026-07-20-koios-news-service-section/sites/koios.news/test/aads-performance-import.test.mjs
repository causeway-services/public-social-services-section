import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { parseAAdsPublicStats } from "../dist/management/aads-public-performance.mjs";

const root = new URL("..", import.meta.url).pathname;

test("AADS public daily rows retain requests and do not invent revenue", () => {
  const html = `<table class='table-stats'><thead><tr><th>Date</th></tr></thead><tbody><tr><td><p>Total</p><span>2026-07-18 - 2026-07-19</span></td><td><span>12</span></td><td><span>2</span></td><td><span>1</span></td><td><span>16.67%</span></td><td><span>3</span></td><td><span>100.00%</span></td></tr><tr><td><span>2026-07-19</span></td><td><span>1,234</span></td><td><span>12</span></td><td><span>3</span></td><td><span>0.97%</span></td><td><span>2</span></td><td><span>13.33%</span></td></tr></tbody></table>`;
  assert.deepEqual(parseAAdsPublicStats(html, "2382512", "https://aads.example/stats"), [{ unitId: "2382512", day: "2026-07-19", adRequests: 1234, paidImpressions: 12, affiliateImpressions: 3, fillRateBasisPoints: 97, clicks: 2, ctrBasisPoints: 1333, sourceUrl: "https://aads.example/stats" }]);
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
