import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const root = resolve(import.meta.dirname, "..");

test("Search Console demand is advertised and an absent credential becomes a durable obstruction", () => {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  assert.equal(pkg.bin["operate-search-demand-import"], "./dist/operate-search-demand-import.mjs");
  assert.equal(pkg["x-agentic-metro-enterprise"]["operation-catalog"]["operate-search-demand-import"].contract, "koios-news/search-demand-import/v1");
  const territory = mkdtempSync(join(tmpdir(), "koios-search-demand-"));
  const dataDir = join(territory, "data");
  const activity = {
    "@context": "https://www.w3.org/ns/activitystreams",
    id: "urn:test:search-demand-pulse",
    type: "Create",
    actor: "urn:colony:cold-red-gate:clockkeeper",
    target: "https://koios.news/activitypub/actor",
    capability: "urn:capability:koios-news:clockkeeper:cold-red-gate:search-demand-import:v1",
    object: { type: "SearchDemandImportDemand", contract: "koios-news/search-demand-import/v1", pulseId: "search-demand-pulse" },
  };
  const run = spawnSync(process.execPath, [join(root, "dist/operate-search-demand-import.mjs"), "--now", "2026-07-19T16:00:00.000Z", "--data-dir", dataDir], {
    input: JSON.stringify(activity), encoding: "utf8", env: { ...process.env, HOME: territory, KOIOS_SEARCH_CONSOLE_KEY_FILE: "" },
  });
  assert.equal(run.status, 2);
  const outcome = JSON.parse(run.stdout);
  assert.equal(outcome.type, "Reject");
  assert.equal(outcome.object.code, "provider-obstructed");
  assert.equal(outcome.object.customerMutation, true);
  const ledgerDir = join(dataDir, "records", "audience-product", "2026", "07", "19");
  const record = JSON.parse(readFileSync(join(ledgerDir, readdirSync(ledgerDir)[0]), "utf8").trim());
  assert.equal(record.act, "search-demand.import-obstructed");
  assert.equal(record.data.factualWarrant, false);
});

test("an unadmitted caller cannot invoke Search Console demand", () => {
  const dataDir = mkdtempSync(join(tmpdir(), "koios-search-demand-refusal-"));
  const activity = { "@context": "https://www.w3.org/ns/activitystreams", type: "Create", actor: "urn:test:intruder", target: "https://koios.news/activitypub/actor", capability: "urn:test:none", object: { type: "SearchDemandImportDemand", contract: "koios-news/search-demand-import/v1", pulseId: "bad" } };
  const run = spawnSync(process.execPath, [join(root, "dist/operate-search-demand-import.mjs"), "--now", "2026-07-19T16:00:00.000Z", "--data-dir", dataDir], { input: JSON.stringify(activity), encoding: "utf8" });
  assert.equal(run.status, 2);
  assert.equal(JSON.parse(run.stdout).object.customerMutation, false);
});
