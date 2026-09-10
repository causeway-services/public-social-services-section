import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { recordDigest } from "../dist/management/ledger.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const EXECUTABLE = join(ROOT, "dist", "issue-pulse.mjs");
const CONFIG = join(ROOT, "producing-content.config.json");
const POLICY = JSON.parse(readFileSync(join(ROOT, "lib", "law", "publication-issue-policy.json"), "utf8"));

function run(input, territory) {
  return spawnSync(process.execPath, [
    EXECUTABLE,
    "--now", "2026-07-18T21:00:00.000Z",
    "--data-dir", join(territory, "data"),
    "--content-dir", join(territory, "content"),
    "--config", CONFIG,
  ], { cwd: ROOT, input, encoding: "utf8" });
}

test("the issue ingress cannot invent a pulser when no external activity arrives", () => {
  const territory = mkdtempSync(join(tmpdir(), "koios-pulse-empty-"));
  mkdirSync(join(territory, "data"), { recursive: true });
  mkdirSync(join(territory, "content"), { recursive: true });
  const result = run("", territory);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /requires one externally authored ActivityStreams object/u);
  assert.doesNotMatch(`${result.stdout}${result.stderr}`, /urn:emsenn:ant-colony-pulser/u);
});

test("an external but unadmitted trigger receives a typed refusal without becoming an assignment", () => {
  const territory = mkdtempSync(join(tmpdir(), "koios-pulse-unknown-"));
  mkdirSync(join(territory, "data"), { recursive: true });
  mkdirSync(join(territory, "content"), { recursive: true });
  const activity = {
    "@context": "https://www.w3.org/ns/activitystreams",
    id: "urn:test:external-pulse",
    type: "Create",
    actor: "urn:test:unadmitted-pulser",
    capability: "urn:test:unadmitted-capability",
    target: "https://koios.news/activitypub/actor",
    published: "2026-07-18T21:00:00.000Z",
    object: { type: "NewsroomIssueDemand", pulseId: "external-pulse", policy: POLICY, policyDigest: recordDigest(POLICY) },
  };
  const result = run(JSON.stringify(activity), territory);
  assert.equal(result.status, 0, result.stderr);
  const settlement = JSON.parse(result.stdout);
  assert.equal(settlement.type, "Reject");
  assert.equal(settlement.object.code, "unauthorized-trigger");
  assert.equal(settlement.target, activity.actor);
  assert.doesNotMatch(result.stdout, /urn:emsenn:ant-colony-pulser/u);
});
