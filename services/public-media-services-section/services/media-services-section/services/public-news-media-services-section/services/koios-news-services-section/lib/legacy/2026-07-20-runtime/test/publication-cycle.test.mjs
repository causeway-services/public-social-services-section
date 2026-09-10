import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { appendKoiosAct, readKoiosLedger } from "../dist/management/ledger.mjs";
import { runNewsroomCircuitSafely } from "../dist/management/newsroom-circuit.mjs";
import { internalServiceAccount, settleInternalPublicationExchange } from "../dist/management/internal-publication-service.mjs";

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

test("publication operation is Koios's internal node service and Clockkeeper is not its customer", () => {
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
