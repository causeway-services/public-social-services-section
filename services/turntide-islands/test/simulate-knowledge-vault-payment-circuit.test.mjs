import assert from "node:assert/strict";
import test from "node:test";
import { simulateKnowledgeVaultPaymentCircuit, verifyKnowledgeVaultPaymentSimulationReceipt } from "../lib/management/simulate-knowledge-vault-payment-circuit.mjs";

test("simulates the Vault payment seam without external effects or economic recognition", async () => {
  const receipt = await simulateKnowledgeVaultPaymentCircuit({ recordedAt: "2026-07-21T22:30:00.000Z" });
  assert.equal(receipt.designRuleVerification.status, "passed");
  assert.equal(receipt.simulatedCircuitExternalEffects, 0);
  assert.equal(receipt.recognition.charge, "forbidden");
  assert.equal(receipt.recognition.revenue, "forbidden");
  assert.equal(receipt.entitlement.evidenceClass, "synthetic-nonposting");
  assert.equal(receipt.discordFulfillment.vaultSubscriberRoleGranted, true);
  assert.equal(receipt.discordFulfillment.islanderRoleGranted, false);
});

test("Vault payment simulation is deterministic and its verifier rejects recognition leakage", async () => {
  const first = await simulateKnowledgeVaultPaymentCircuit({ recordedAt: "2026-07-21T22:30:00.000Z" });
  const second = await simulateKnowledgeVaultPaymentCircuit({ recordedAt: "2026-07-21T22:30:00.000Z" });
  assert.equal(first.id, second.id);
  const broken = structuredClone(first); broken.recognition.revenue = "recognized";
  assert.equal(verifyKnowledgeVaultPaymentSimulationReceipt(broken).status, "failed");
});
