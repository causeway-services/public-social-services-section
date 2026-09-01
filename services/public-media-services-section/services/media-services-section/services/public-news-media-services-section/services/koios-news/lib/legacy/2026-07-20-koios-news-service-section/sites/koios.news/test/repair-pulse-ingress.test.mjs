import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { appendKoiosAct } from "../dist/management/ledger.mjs";

const root = new URL("..", import.meta.url).pathname;

test("background repair is advertised and refuses an unadmitted trigger without mutation", () => {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  assert.equal(pkg.bin["operate-repair-pulse"], "./dist/operate-repair-pulse.mjs");
  assert.equal(pkg["x-agentic-metro-enterprise"]["operation-catalog"]["operate-repair-pulse"].contract, "koios-news/newsroom-repair-pulse/v1");
  const dataDir = mkdtempSync(join(tmpdir(), "koios-repair-pulse-refusal-"));
  const activity = { "@context": "https://www.w3.org/ns/activitystreams", id: "urn:test:bad-repair-pulse", type: "Create", actor: "urn:test:not-clockkeeper", target: "https://koios.news/activitypub/actor", capability: "urn:test:none", object: { type: "NewsroomRepairPulseDemand", contract: "koios-news/newsroom-repair-pulse/v1", pulseId: "bad" } };
  const run = spawnSync(process.execPath, [join(root, "dist/operate-repair-pulse.mjs"), "--now", "2026-07-19T08:00:00.000Z", "--data-dir", dataDir], { input: JSON.stringify(activity), encoding: "utf8" });
  assert.equal(run.status, 2);
  assert.equal(JSON.parse(run.stdout).type, "Reject");
});

test("frequent pulses release pending work immediately but do not start inference repairs inside the cooldown", () => {
  const dataDir = mkdtempSync(join(tmpdir(), "koios-repair-pulse-cooldown-"));
  appendKoiosAct({
    dataRoot: dataDir,
    ledger: "contract-events",
    instant: "2026-07-19T08:00:00.000Z",
    act: "newsroom.repair-replay.settled",
    subject: "prior-repair",
    data: { disposition: "released" },
  });
  const activity = {
    "@context": "https://www.w3.org/ns/activitystreams",
    id: "urn:test:cooldown-repair-pulse",
    type: "Create",
    actor: "urn:colony:cold-red-gate:clockkeeper",
    target: "https://koios.news/activitypub/actor",
    capability: "urn:capability:koios-news:clockkeeper:cold-red-gate:newsroom-repair-pulse:v1",
    published: "2026-07-19T09:00:00.000Z",
    object: { type: "NewsroomRepairPulseDemand", contract: "koios-news/newsroom-repair-pulse/v1", pulseId: "cooldown" },
  };
  const run = spawnSync(process.execPath, [join(root, "dist/operate-repair-pulse.mjs"), "--now", "2026-07-19T09:00:00.000Z", "--data-dir", dataDir], { input: JSON.stringify(activity), encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  const outcome = JSON.parse(run.stdout);
  assert.equal(outcome.type, "Accept");
  assert.equal(outcome.object.disposition, "quiescent");
  assert.equal(outcome.object.code, "repair-start-cooldown");
  assert.equal(outcome.object.nextRepairEligibleAt, "2026-07-19T12:00:00.000Z");
  assert.equal(outcome.object.customerMutation, false);
});
