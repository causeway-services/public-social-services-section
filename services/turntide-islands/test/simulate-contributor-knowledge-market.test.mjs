import assert from "node:assert/strict";
import test from "node:test";
import { simulateContributorKnowledgeMarket, verifyContributorMarketSimulationReceipt } from "../lib/management/simulate-contributor-knowledge-market.mjs";

test("closes the synthetic contributor circuit while forbidding revenue and profit recognition", async () => {
  const receipt = await simulateContributorKnowledgeMarket({ recordedAt: "2026-07-21T21:00:00.000Z" });
  assert.equal(receipt.designRuleVerification.status, "passed");
  assert.equal(receipt.simulatedCircuitExternalEffects, 0);
  assert.equal(receipt.recognition.revenue, "forbidden");
  assert.equal(receipt.recognition.profit, "forbidden");
  assert.equal(receipt.funnel.offerSessions, 1);
  assert.equal(receipt.funnel.candidates, 1);
  assert.equal(receipt.funnel.admissions, 1);
  assert.equal(receipt.funnel.offerToCandidateBasisPoints, 10_000);
  assert.equal(receipt.economics.grossRevenueMicros, 10_000_000);
  assert.equal(receipt.economics.receiptedDirectCostsMicros, 2_000_000);
  assert.equal(receipt.economics.contributorPoolMicros, 4_000_000);
  assert.equal(receipt.economics.retainedTTIMarginMicros, 4_000_000);
  assert.ok(receipt.cells.every((cell) => cell.outcome === "simulated-passed"));
  assert.doesNotMatch(JSON.stringify(receipt), /synthetic-contributor|synthetic Discord content|raised rows|session-token/u);
});

test("is deterministic for the same bounded fixtures and recorded instant", async () => {
  const first = await simulateContributorKnowledgeMarket({ recordedAt: "2026-07-21T21:00:00.000Z" });
  const second = await simulateContributorKnowledgeMarket({ recordedAt: "2026-07-21T21:00:00.000Z" });
  assert.equal(first.id, second.id);
  assert.deepEqual(first.semanticEvidence, second.semanticEvidence);
});

test("DRC refuses receipts that leak live authority, external effects, or synthetic recognition", async () => {
  const receipt = await simulateContributorKnowledgeMarket({ recordedAt: "2026-07-21T21:00:00.000Z" });
  const broken = structuredClone(receipt);
  broken.simulatedCircuitExternalEffects = 1;
  broken.authority.saleAuthority = true;
  broken.recognition.revenue = "recognized";
  const verification = verifyContributorMarketSimulationReceipt(broken);
  assert.equal(verification.status, "failed");
  assert.ok(verification.errors.includes("simulated-external-effects-nonzero"));
  assert.ok(verification.errors.includes("live-authority-leak"));
  assert.ok(verification.errors.includes("synthetic-economics-recognition-not-forbidden"));
});
