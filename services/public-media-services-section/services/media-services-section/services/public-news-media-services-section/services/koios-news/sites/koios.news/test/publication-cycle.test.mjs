import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { appendKoiosAct, readKoiosLedger, recordDigest } from "../dist/management/ledger.mjs";
import { acquireAssignmentCircuitLease, admitsSourceOriginalityRevalidation, deterministicAdmissionRefusal, editorialRepairBudgetExhausted, releaseAssignmentCircuitLease, runNewsroomCircuitSafely } from "../dist/management/newsroom-circuit.mjs";
import { sourceOriginalityMechanismDigest } from "../dist/researching/writing/editing/source-originality.mjs";
import { internalServiceAccount, settleInternalPublicationExchange } from "../dist/management/internal-publication-service.mjs";
import { readAssignmentDisposition, recordAssignmentDisposition, recordAssignmentDispositionRevalidation } from "../dist/researching/writing/assignments.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("publication cycle is an advertised contract rather than an ambient CLI", () => {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
  const operation = pkg["x-agentic-metro-enterprise"]["operation-catalog"]["operate-issue"];
  assert.equal(pkg.bin["operate-issue"], "./dist/operate-issue.mjs");
  assert.equal(operation.contract, "koios.news/publication-cycle/v1");
  assert.equal(operation.timeoutMs, 1800000);
});

test("publication cycle leaves typed failures for the independently clocked repair service", () => {
  const entrypoint = readFileSync(join(ROOT, "dist", "operate-issue.mjs"), "utf8");
  assert.doesNotMatch(entrypoint, /dispatchNewsroomRepair/u);
  assert.match(entrypoint, /separately clocked repair service/u);
});

test("the newsroom retains an accepted manuscript and resumes at single-article provenance", () => {
  const circuit = readFileSync(join(ROOT, "dist", "management", "newsroom-circuit.mjs"), "utf8");
  const publication = circuit.indexOf("publishManuscript(contentDir, slug)");
  const provenance = circuit.lastIndexOf("prepareArticle50Fingerprint");
  const completion = circuit.indexOf("completeAssignment(dataDir, assignment.assignmentId");
  assert.ok(publication >= 0 && provenance > publication && completion > provenance);
  assert.match(circuit, /replayFrom: "article50-provenance"/u);
  assert.match(circuit, /retainedManuscript: true/u);
});

test("deterministic body defects replay the writer before hiring the independent Editor", () => {
  const refusal = deterministicAdmissionRefusal([
    { severity: "error", gate: "copy-edited", code: "body-too-short", message: "A publishable article needs 600 words; found 370." },
    { severity: "warning", gate: "standards-cleared", code: "demand-lens-missing-h2", message: "Add a useful heading." },
  ]);
  assert.deepEqual(refusal, {
    failureLayer: "writer-model",
    replayFrom: "writer-model",
    findingCodes: ["body-too-short"],
    reason: "body-too-short: A publishable article needs 600 words; found 370.",
  });
  assert.equal(deterministicAdmissionRefusal([
    { severity: "warning", gate: "fact-checked", code: "no-body-reference-link", message: "Prefer a link." },
  ]), undefined);
});

test("unsettled deterministic carrier errors stay out of editorial inference", () => {
  const refusal = deterministicAdmissionRefusal([
    { severity: "error", gate: "fact-checked", code: "missing-references", message: "A references array is required." },
  ]);
  assert.equal(refusal?.failureLayer, "deterministic-gates");
  assert.equal(refusal?.replayFrom, "deterministic-gates");
});

test("terminal refusal bypass requires the exact old originality finding and changed gate identity", () => {
  const dataDir = mkdtempSync(join(tmpdir(), "koios-gate-revalidation-grant-"));
  const assignmentId = "urn:test:assignment:old-gate";
  const finding = appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-20T02:00:00.000Z", act: "newsroom.circuit.source-originality-refused", subject: assignmentId, data: { gateMechanismDigest: `sha256:${"0".repeat(64)}`, findingCount: 1 } });
  const grant = { refusalDigest: recordDigest(finding), priorMechanismDigest: `sha256:${"0".repeat(64)}`, currentMechanismDigest: sourceOriginalityMechanismDigest() };
  assert.equal(admitsSourceOriginalityRevalidation(dataDir, assignmentId, grant), true);
  assert.equal(admitsSourceOriginalityRevalidation(dataDir, assignmentId, { ...grant, refusalDigest: `sha256:${"f".repeat(64)}` }), false);
});

test("lawful revalidation supersedes a refusal projection without deleting its witness", () => {
  const dataDir = mkdtempSync(join(tmpdir(), "koios-disposition-revalidation-"));
  const assignmentId = "urn:test:assignment:revalidate-disposition";
  recordAssignmentDisposition(dataDir, { assignmentId, disposition: "refused", reason: "old gate refused", authority: "old-gate", contract: "old/v1" }, "2026-07-20T02:00:00.000Z");
  assert.equal(readAssignmentDisposition(dataDir, assignmentId)?.disposition, "refused");
  recordAssignmentDispositionRevalidation(dataDir, { assignmentId, refusalDigest: `sha256:${"a".repeat(64)}`, priorGateMechanismDigest: null, gateMechanismDigest: `sha256:${"c".repeat(64)}`, authority: "changed-gate", contract: "revalidation/v1" }, "2026-07-20T02:01:00.000Z");
  assert.equal(readAssignmentDisposition(dataDir, assignmentId), undefined);
  assert.ok(readKoiosLedger(dataDir, "assignments").some((record) => record.kind === "koios.assignment-disposition-witness"));
});

test("editor-selected tool repair has its own bounded allowance", () => {
  assert.equal(editorialRepairBudgetExhausted({ repairs: 0, maxRepairs: 0, boundedEditorToolRepair: false }), true);
  assert.equal(editorialRepairBudgetExhausted({ repairs: 2, maxRepairs: 0, boundedEditorToolRepair: true }), false);
  assert.equal(editorialRepairBudgetExhausted({ repairs: 300, maxRepairs: 0, boundedEditorToolRepair: true }), false);
});

test("one assignment cannot be settled by two newsroom runners", () => {
  const dataDir = mkdtempSync(join(tmpdir(), "koios-assignment-circuit-lease-"));
  const assignmentId = "urn:test:assignment:single-runner";
  const first = acquireAssignmentCircuitLease(dataDir, assignmentId);
  assert.ok(first);
  assert.equal(acquireAssignmentCircuitLease(dataDir, assignmentId), undefined);
  releaseAssignmentCircuitLease(first);
  const resumed = acquireAssignmentCircuitLease(dataDir, assignmentId);
  assert.ok(resumed);
  releaseAssignmentCircuitLease(resumed);
});

test("publication operation is Koios's internal node service and ScheduleDelivery is not its customer", () => {
  const contract = JSON.parse(readFileSync(join(ROOT, "content", "contracts", "publication-cycle.json"), "utf8"));
  const account = internalServiceAccount({ pulseId: "urn:test:koios-standing-order", assignmentId: "urn:test:assignment" });
  assert.equal(account.customer, "urn:ame:koios.news");
  assert.equal(account.provider, "urn:micro-enterprise:koios.news:publication-operations");
  assert.equal(account.assignmentId, "urn:test:assignment");
  assert.equal(account.internalCustomerIsPurchaser, true);
  assert.equal(account.internalProviderIsSeller, true);
  assert.equal(account.consideration.amount, 1);
  assert.equal(account.consideration.unit, "publication-cycle-service-credit");
  assert.equal(account.consideration.monetaryClaim, false);
  assert.match(account.consolidationRule, /eliminate one-for-one/u);
  assert.equal(account.transportIsNotCustomer, true);
  assert.match(account.externalValueAccount.status, /unproven-until-reader-and-external-revenue-receipts-settle/u);
  assert.match(account.externalValueAccount.payoutBasis, /externally evidenced value-added/u);
  assert.equal(contract.transport.deliveryCheck.intervalSeconds, 1800);
  assert.ok(contract.transport.deliveryCheck.intervalSeconds < 6 * 60 * 60);
  assert.match(contract.transport.deliveryCheck.rule, /issue controller alone decides/u);
});

test("one settled cycle writes a bilateral internal sale without inventing outside revenue", () => {
  const dataDir = mkdtempSync(join(tmpdir(), "koios-internal-market-"));
  const settlement = settleInternalPublicationExchange({
    dataDir,
    pulseId: "urn:test:pulse",
    assignmentId: "urn:test:assignment",
    disposition: "published",
    fulfillmentDigest: "sha256:fulfillment",
    settledAt: "2026-07-19T20:00:00.000Z",
  });
  const records = readKoiosLedger(dataDir, "internal-market");
  assert.equal(records.length, 3);
  assert.deepEqual(records.map((entry) => entry.act), ["internal-service.receipt.settled", "internal-service.buyer.debited", "internal-service.seller.credited"]);
  assert.equal(settlement.receipt.buyer, "urn:ame:koios.news");
  assert.equal(settlement.receipt.seller, "urn:micro-enterprise:koios.news:publication-operations");
  assert.equal(settlement.receipt.payment.monetaryClaim, false);
  assert.equal(records[1].data.direction, "debit");
  assert.equal(records[2].data.direction, "credit");
  assert.equal(records[1].data.amount, records[2].data.amount);
  assert.equal(records[1].data.unit, records[2].data.unit);
  assert.equal(records[1].data.eliminatedOnKoiosConsolidation, true);
});

test("publication cycle entrypoint operates independently of caller cwd", () => {
  const foreignCwd = mkdtempSync(join(tmpdir(), "koios-publication-cycle-caller-"));
  const pulse = {
    "@context": "https://www.w3.org/ns/activitystreams",
    type: "Create",
    actor: "urn:test:wrong-clock",
    target: "urn:test:wrong-target",
    object: { type: "NewsroomIssueDemand" },
  };
  const execution = spawnSync(process.execPath, [join(ROOT, "dist/operate-issue.mjs"), "--data-dir", join(foreignCwd, "data"), "--now", "2026-07-19T01:20:00.000Z"], {
    cwd: foreignCwd,
    input: `${JSON.stringify(pulse)}\n`,
    encoding: "utf8",
  });
  assert.equal(execution.status, 0, execution.stderr);
  const response = JSON.parse(execution.stdout);
  assert.equal(response.type, "Reject");
  assert.equal(response.object.code, "wrong-boundary");
});

test("publication cycle preserves the issue controller's exact typed refusal", () => {
  const dataDir = mkdtempSync(join(tmpdir(), "koios-publication-cycle-"));
  const pulse = {
    "@context": "https://www.w3.org/ns/activitystreams",
    type: "Create",
    actor: "urn:test:wrong-clock",
    target: "urn:test:wrong-target",
    object: { type: "NewsroomIssueDemand" },
  };
  const execution = spawnSync(process.execPath, [join(ROOT, "dist/operate-issue.mjs"), "--data-dir", dataDir, "--now", "2026-07-19T01:20:00.000Z"], {
    cwd: ROOT,
    input: `${JSON.stringify(pulse)}\n`,
    encoding: "utf8",
  });
  assert.equal(execution.status, 0, execution.stderr);
  const response = JSON.parse(execution.stdout);
  assert.equal(response.type, "Reject");
  assert.equal(response.object.type, "IssuePulseSettlement");
  assert.equal(response.object.code, "wrong-boundary");
});

test("a pending candidate cannot bypass issue-pulse authority", () => {
  const root = mkdtempSync(join(tmpdir(), "koios-publication-cycle-pending-authority-"));
  const dataDir = join(root, "data");
  const candidateDir = join(root, "candidate");
  mkdirSync(candidateDir, { recursive: true });
  const manifest = JSON.stringify({ kind: "koios.static-publication-manifest", canonicalOrigin: "https://koios.news", artifacts: [] });
  writeFileSync(join(candidateDir, "manifest.json"), manifest);
  const manifestDigest = `sha256:${createHash("sha256").update(manifest).digest("hex")}`;
  appendKoiosAct({ dataRoot: dataDir, ledger: "shadow-deliveries", instant: "2026-07-19T01:19:00.000Z", act: "candidate.projected", subject: "urn:test:pending-assignment", data: { slug: "pending-story", manifestDigest } });
  const pulse = { "@context": "https://www.w3.org/ns/activitystreams", type: "Create", actor: "urn:test:intruder", target: "https://koios.news/activitypub/actor", object: { type: "NewsroomIssueDemand" } };
  const execution = spawnSync(process.execPath, [join(ROOT, "dist/operate-issue.mjs"), "--data-dir", dataDir, "--out", candidateDir, "--now", "2026-07-19T01:20:00.000Z"], { cwd: ROOT, input: `${JSON.stringify(pulse)}\n`, encoding: "utf8", env: { ...process.env, KOIOS_RESOURCE_BROKERAGE_TEAM_ROOT: join(root, "provider-that-must-not-run") } });
  assert.equal(execution.status, 0, execution.stderr);
  const response = JSON.parse(execution.stdout);
  assert.equal(response.type, "Reject");
  assert.equal(response.object.code, "invalid-demand");
  assert.equal(readKoiosLedger(dataDir, "deployments").length, 0);
});

test("an internal newsroom crash settles as a Koios-owned obstruction", async () => {
  const dataDir = mkdtempSync(join(tmpdir(), "koios-newsroom-obstruction-"));
  const result = await runNewsroomCircuitSafely({
    assignmentId: "urn:test:assignment:internal-service-crash",
    dataDir,
    now: "2026-07-19T18:00:00.000Z",
  }, async () => {
    throw new Error("provider socket vanished");
  });
  assert.equal(result.kind, "koios.newsroom-circuit");
  assert.equal(result.disposition, "obstructed");
  assert.equal(result.assignmentId, "urn:test:assignment:internal-service-crash");
  assert.match(result.reason, /unexpected internal newsroom service failure: provider socket vanished/u);
  assert.ok(result.transitions.includes("internal-service-failure-settled"));
});
