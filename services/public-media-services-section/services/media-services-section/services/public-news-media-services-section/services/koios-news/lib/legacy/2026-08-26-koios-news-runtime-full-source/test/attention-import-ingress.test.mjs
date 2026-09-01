import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const root = resolve(import.meta.dirname, "..");

test("attention import is advertised and refuses an unadmitted trigger without mutation", () => {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  assert.equal(pkg.bin["operate-attention-import"], "./dist/operate-attention-import.mjs");
  assert.equal(pkg["x-agentic-metro-enterprise"]["operation-catalog"]["operate-attention-import"].contract, "koios-news/attention-import/v1");
  const dataDir = mkdtempSync(join(tmpdir(), "koios-attention-refusal-"));
  const activity = { "@context": "https://www.w3.org/ns/activitystreams", id: "urn:test:bad-attention-trigger", type: "Create", actor: "urn:test:not-clockkeeper", target: "https://koios.news/activitypub/actor", capability: "urn:test:none", object: { type: "AttentionImportDemand", contract: "koios-news/attention-import/v1", pulseId: "bad" } };
  const run = spawnSync(process.execPath, [join(root, "dist/operate-attention-import.mjs"), "--now", "2026-07-19T07:15:00.000Z", "--data-dir", dataDir], { input: JSON.stringify(activity), encoding: "utf8" });
  assert.equal(run.status, 2);
  const outcome = JSON.parse(run.stdout);
  assert.equal(outcome.type, "Reject");
  assert.equal(outcome.object.customerMutation, false);
});
