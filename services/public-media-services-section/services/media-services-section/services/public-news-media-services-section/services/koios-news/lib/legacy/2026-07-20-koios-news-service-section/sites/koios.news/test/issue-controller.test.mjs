import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  ACTIVITYSTREAMS_CONTEXT,
  PUBLICATION_ACTOR,
  allocateWarrantedCandidates,
  inspectAdmittedIssuePulse,
  recentPublishedBeatCounts,
  settleIssuePulse,
} from "../dist/management/issue-controller.mjs";
import { appendDatedRecord, appendKoiosAct, recordDigest } from "../dist/management/ledger.mjs";
import { createAssignment, readActionableAssignments, recordAssignmentDisposition } from "../dist/researching/writing/assignments.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const CONFIG = join(ROOT, "producing-content.config.json");
const TEST_TRIGGER = Object.freeze({ actor: "urn:test:ant-colony-pulser", capability: "urn:test:capability:koios-issue-pulse" });
const BASE_POLICY = Object.freeze({
  ...JSON.parse(readFileSync(join(ROOT, "lib", "law", "publication-issue-policy.json"), "utf8")),
  triggerAuthorities: Object.freeze([TEST_TRIGGER]),
});

test("the standing publication cadence can produce four daily issues", () => {
  assert.equal(BASE_POLICY.minimumHoursBetweenNewIssues, 6);
  assert.equal(BASE_POLICY.maxIssuesPerPulse, 1);
});

test("the pure ingress witness identifies only an exactly admitted issue pulse", () => {
  const admitted = pulse(BASE_POLICY, "authority-witness");
  assert.deepEqual(inspectAdmittedIssuePulse(admitted), {
    actor: TEST_TRIGGER.actor,
    capability: TEST_TRIGGER.capability,
    pulseId: "authority-witness",
    policyDigest: recordDigest(BASE_POLICY),
    activityDigest: recordDigest(admitted),
  });
  assert.equal(inspectAdmittedIssuePulse({ ...admitted, actor: "urn:test:intruder" }), undefined);
  assert.equal(inspectAdmittedIssuePulse({ ...admitted, capability: "urn:test:wrong-capability" }), undefined);
});

test("issue allocation rotates across recently scarce desks only after warrant", () => {
  const posts = [
    { document: { frontMatter: { date: "2026-07-19", draft: false, categories: ["Technology"], koios: { beat: "technology" } } } },
    { document: { frontMatter: { date: "2026-07-18", draft: false, categories: ["technology"] } } },
    { document: { frontMatter: { date: "2026-07-18", draft: false, categories: ["Environment"] } } },
    { document: { frontMatter: { date: "2026-07-18", draft: true, categories: ["culture"] } } },
    { document: { frontMatter: { date: "2026-06-01", draft: false, categories: ["culture"] } } },
  ];
  const counts = recentPublishedBeatCounts(posts, "2026-07-19T15:40:00.000Z");
  assert.deepEqual(counts, { environment: 1, technology: 2 });

  const ranked = allocateWarrantedCandidates([
    { id: "freshest-technology", beat: "technology" },
    { id: "next-environment", beat: "environment" },
    { id: "scarce-culture", beat: "culture" },
    { id: "second-scarce-culture", beat: "Culture" },
  ], counts);
  assert.deepEqual(ranked.map(({ id }) => id), ["scarce-culture", "second-scarce-culture", "next-environment", "freshest-technology"]);
});

function pulse(policy, id = "test-pulse") {
  return Object.freeze({
    "@context": ACTIVITYSTREAMS_CONTEXT,
    id: `urn:test:${id}`,
    type: "Create",
    actor: TEST_TRIGGER.actor,
    capability: TEST_TRIGGER.capability,
    target: PUBLICATION_ACTOR,
    published: "2026-07-18T20:00:00.000Z",
    object: Object.freeze({ type: "NewsroomIssueDemand", pulseId: id, policy, policyDigest: recordDigest(policy) }),
  });
}

test("a new issue refuses without the exact evidence-provider deliveries and exact replay returns that durable settlement", async () => {
  const territory = mkdtempSync(join(tmpdir(), "koios-issue-controller-"));
  const dataDir = join(territory, "data");
  const contentDir = join(territory, "content");
  mkdirSync(dataDir, { recursive: true });
  mkdirSync(contentDir, { recursive: true });
  const policy = Object.freeze({
    ...BASE_POLICY,
    minimumHoursBetweenNewIssues: 0,
    sourceRefreshAuthorized: false,
    selectionMode: "source-driven",
  });
  const activity = pulse(policy);
  const first = await settleIssuePulse(activity, { now: "2026-07-18T20:00:00.000Z", dataDir, contentDir, configPath: CONFIG });
  assert.equal(first.type, "Reject");
  assert.equal(first.object.code, "source-intelligence-refused");
  assert.match(first.object.reason, /no exact Newscable provider delivery/u);
  assert.equal(readActionableAssignments(dataDir).length, 0);

  const replay = await settleIssuePulse(activity, { now: "2026-07-18T20:00:01.000Z", dataDir, contentDir, configPath: CONFIG });
  assert.deepEqual(replay, first);
});

test("the controller refuses policy mutation and capabilities outside its boundary", async () => {
  const territory = mkdtempSync(join(tmpdir(), "koios-issue-controller-refusal-"));
  const dataDir = join(territory, "data");
  const contentDir = join(territory, "content");
  mkdirSync(dataDir, { recursive: true });
  mkdirSync(contentDir, { recursive: true });
  const policy = Object.freeze({ ...BASE_POLICY, sourceRefreshAuthorized: false });
  const original = pulse(policy, "changed-policy");
  const changed = { ...original, object: { ...original.object, policy: { ...policy, minimumHoursBetweenNewIssues: 0 } } };
  const result = await settleIssuePulse(changed, { now: "2026-07-18T20:01:00.000Z", dataDir, contentDir, configPath: CONFIG });
  assert.equal(result.type, "Reject");
  assert.equal(result.object.code, "policy-mismatch");

  const wrong = await settleIssuePulse({ ...pulse(policy, "wrong-boundary"), target: "urn:test:writer" }, { now: "2026-07-18T20:02:00.000Z", dataDir, contentDir, configPath: CONFIG });
  assert.equal(wrong.type, "Reject");
  assert.equal(wrong.object.code, "wrong-boundary");

  const unknown = await settleIssuePulse({ ...pulse(policy, "unknown-trigger"), actor: "urn:test:unknown" }, { now: "2026-07-18T20:02:01.000Z", dataDir, contentDir, configPath: CONFIG });
  assert.equal(unknown.type, "Reject");
  assert.equal(unknown.object.code, "unauthorized-trigger");
  assert.equal(readActionableAssignments(dataDir).length, 0);
});

test("the controller exposes an inherited draft backlog instead of silently treating it as a healthy queue", async () => {
  const territory = mkdtempSync(join(tmpdir(), "koios-issue-controller-capacity-"));
  const dataDir = join(territory, "data");
  const contentDir = join(territory, "content");
  mkdirSync(dataDir, { recursive: true });
  mkdirSync(contentDir, { recursive: true });
  createAssignment(dataDir, { term: "first warranted event", beat: "technology", sourceUrls: ["https://example.test/one"] }, [], "2026-07-18T18:00:00.000Z");
  createAssignment(dataDir, { term: "second warranted event", beat: "environment", sourceUrls: ["https://example.test/two"] }, [], "2026-07-18T18:01:00.000Z");
  const policy = Object.freeze({ ...BASE_POLICY, sourceRefreshAuthorized: false, maxOpenAssignments: 1 });
  const result = await settleIssuePulse(pulse(policy, "capacity"), { now: "2026-07-18T20:03:00.000Z", dataDir, contentDir, configPath: CONFIG });
  assert.equal(result.type, "Reject");
  assert.equal(result.object.code, "open-assignment-capacity-exceeded");
  assert.equal(result.object.openAssignments.length, 2);

  recordAssignmentDisposition(dataDir, {
    assignmentId: result.object.openAssignments[0].assignmentId,
    disposition: "refused",
    reason: "deterministic backlog fixture refusal",
    authority: "koios.news/editorial-operation",
    contract: "koios.news/backlog-settlement/v1",
  }, "2026-07-18T20:04:00.000Z");
  assert.equal(readActionableAssignments(dataDir).length, 1);
  assert.throws(() => recordAssignmentDisposition(dataDir, {
    assignmentId: result.object.openAssignments[0].assignmentId,
    disposition: "superseded",
    reason: "a contradictory terminal state",
    authority: "koios.news/editorial-operation",
    contract: "koios.news/backlog-settlement/v1",
  }, "2026-07-18T20:05:00.000Z"), /different terminal disposition/u);
});

test("an eligible issue pulse selects a repairable learned failure before forming another assignment", async () => {
  const territory = mkdtempSync(join(tmpdir(), "koios-issue-controller-repair-"));
  const dataDir = join(territory, "data");
  const contentDir = join(territory, "content");
  mkdirSync(dataDir, { recursive: true });
  mkdirSync(contentDir, { recursive: true });
  const assignmentId = "economy-repairable-example";
  const slug = "economy-repairable-story";
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-18T18:00:00.000Z", act: "newsroom.circuit.opened", subject: assignmentId, data: { slug } });
  appendDatedRecord({ dataRoot: dataDir, ledger: "editorial-judgments", instant: "2026-07-18T18:01:00.000Z", record: { kind: "koios.editorial-judgment", recordedAt: "2026-07-18T18:01:00.000Z", slug, disposition: "revise", failureLayer: "draft-repair" } });
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-18T18:02:00.000Z", act: "newsroom.circuit.refused", subject: assignmentId, data: { slug, reason: "draft repair exhausted" } });
  const policy = Object.freeze({ ...BASE_POLICY, minimumHoursBetweenNewIssues: 0, sourceRefreshAuthorized: false });
  const result = await settleIssuePulse(pulse(policy, "repair-backlog"), { now: "2026-07-18T20:06:00.000Z", dataDir, contentDir, configPath: CONFIG });
  assert.equal(result.type, "Accept");
  assert.equal(result.object.disposition, "repair-assigned");
  assert.equal(result.object.assignmentId, assignmentId);
  assert.equal(result.object.proposedMove, "repair-draft");
  assert.equal(result.object.next.requiredContract, "koios.news/newsroom-repair-replay/v1");
  assert.equal(readActionableAssignments(dataDir).length, 0);
});
