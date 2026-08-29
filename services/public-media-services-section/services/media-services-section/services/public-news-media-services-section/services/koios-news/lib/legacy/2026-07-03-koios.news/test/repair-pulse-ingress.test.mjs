import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { appendKoiosAct } from "../dist/management/ledger.mjs";
import { newsroomRepairMechanismDigest } from "../dist/management/newsroom-repair-replay.mjs";
import { repairStartCooldownDecision } from "../dist/management/repair-start-cooldown.mjs";

const root = new URL("..", import.meta.url).pathname;

test("repair pulse purchases upstream source intelligence before prose repair", () => {
  const entrypoint = readFileSync(join(root, "dist", "operate-repair-pulse.mjs"), "utf8");
  assert.ok(entrypoint.indexOf("selectSourceIntelligenceBacklog(dataDir") < entrypoint.indexOf("selectRepairableBacklog(dataDir"));
});

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

test("an empty repair market does not misreport a global inference cooldown", () => {
  const dataDir = mkdtempSync(join(tmpdir(), "koios-repair-pulse-cooldown-"));
  appendKoiosAct({
    dataRoot: dataDir,
    ledger: "contract-events",
    instant: "2026-07-19T08:00:00.000Z",
    act: "newsroom.repair-replay.settled",
    subject: "prior-repair",
    data: { disposition: "released", repairMechanismDigest: newsroomRepairMechanismDigest() },
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
  assert.equal(outcome.object.code, undefined);
  assert.equal(outcome.object.customerMutation, false);
});

test("cooldown restrains a repeated repair lineage including legacy recursive successor ids", () => {
  const repeated = repairStartCooldownDecision({
    pulseAt: Date.parse("2026-07-19T09:00:00.000Z"),
    latestRepairAt: Date.parse("2026-07-19T08:00:00.000Z"),
    latestPurchasedAssignmentId: "assignment:predecessor",
    candidateAssignmentId: "assignment:predecessor",
    candidateCommodity: "manuscript-repair",
    sameMechanism: true,
  });
  assert.equal(repeated.blocked, true);
  assert.equal(repeated.nextEligibleAt, "2026-07-19T12:00:00.000Z");
  const successor = repairStartCooldownDecision({
    pulseAt: Date.parse("2026-07-19T09:00:00.000Z"),
    latestRepairAt: Date.parse("2026-07-19T08:00:00.000Z"),
    latestPurchasedAssignmentId: "assignment:predecessor",
    candidateAssignmentId: "assignment:predecessor:repair:successor",
    candidateCommodity: "manuscript-repair",
    sameMechanism: true,
  });
  assert.equal(successor.active, true);
  assert.equal(successor.repeatsPurchasedRepair, true);
  assert.equal(successor.blocked, true);
  const sourceWork = repairStartCooldownDecision({
    pulseAt: Date.parse("2026-07-19T09:00:00.000Z"),
    latestRepairAt: Date.parse("2026-07-19T08:00:00.000Z"),
    latestPurchasedAssignmentId: "assignment:predecessor",
    candidateAssignmentId: "assignment:source",
    candidateCommodity: "source-intelligence",
    sameMechanism: true,
  });
  assert.equal(sourceWork.blocked, false);
});

test("a changed executable remedy can cross the cooldown without repeating the old purchase", () => {
  const dataDir = mkdtempSync(join(tmpdir(), "koios-repair-pulse-remedy-change-"));
  appendKoiosAct({
    dataRoot: dataDir,
    ledger: "contract-events",
    instant: "2026-07-19T08:00:00.000Z",
    act: "newsroom.repair-replay.settled",
    subject: "prior-repair",
    data: { disposition: "refused", capacityConsumed: true, repairMechanismDigest: `sha256:${"d".repeat(64)}` },
  });
  const activity = {
    "@context": "https://www.w3.org/ns/activitystreams",
    id: "urn:test:changed-remedy-repair-pulse",
    type: "Create",
    actor: "urn:colony:cold-red-gate:clockkeeper",
    target: "https://koios.news/activitypub/actor",
    capability: "urn:capability:koios-news:clockkeeper:cold-red-gate:newsroom-repair-pulse:v1",
    published: "2026-07-19T09:00:00.000Z",
    object: { type: "NewsroomRepairPulseDemand", contract: "koios-news/newsroom-repair-pulse/v1", pulseId: "changed-remedy" },
  };
  const run = spawnSync(process.execPath, [join(root, "dist/operate-repair-pulse.mjs"), "--now", "2026-07-19T09:00:00.000Z", "--data-dir", dataDir], { input: JSON.stringify(activity), encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  const outcome = JSON.parse(run.stdout);
  assert.equal(outcome.object.code, undefined);
  assert.equal(outcome.object.selectedAssignmentId, null);
});

test("the repair mechanism identity includes deterministic prose carrier projection", () => {
  const mechanism = readFileSync(join(root, "dist", "management", "newsroom-repair-replay.mjs"), "utf8");
  assert.match(mechanism, /researching\/writing\/prose-contribution\.mjs/u);
});

test("a preflight repair refusal consumes no inference capacity and cannot close the repair market", () => {
  const dataDir = mkdtempSync(join(tmpdir(), "koios-repair-pulse-refusal-capacity-"));
  appendKoiosAct({
    dataRoot: dataDir,
    ledger: "contract-events",
    instant: "2026-07-19T08:30:00.000Z",
    act: "newsroom.repair-replay.settled",
    subject: "stale-repair-demand",
    data: { disposition: "refused", capacityConsumed: false },
  });
  const activity = {
    "@context": "https://www.w3.org/ns/activitystreams",
    id: "urn:test:refused-repair-pulse",
    type: "Create",
    actor: "urn:colony:cold-red-gate:clockkeeper",
    target: "https://koios.news/activitypub/actor",
    capability: "urn:capability:koios-news:clockkeeper:cold-red-gate:newsroom-repair-pulse:v1",
    published: "2026-07-19T09:00:00.000Z",
    object: { type: "NewsroomRepairPulseDemand", contract: "koios-news/newsroom-repair-pulse/v1", pulseId: "refusal-capacity" },
  };
  const run = spawnSync(process.execPath, [join(root, "dist/operate-repair-pulse.mjs"), "--now", "2026-07-19T09:00:00.000Z", "--data-dir", dataDir], { input: JSON.stringify(activity), encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  const outcome = JSON.parse(run.stdout);
  assert.equal(outcome.type, "Accept");
  assert.equal(outcome.object.disposition, "quiescent");
  assert.equal(outcome.object.code, undefined);
  assert.equal(outcome.object.selectedAssignmentId, null);
});
