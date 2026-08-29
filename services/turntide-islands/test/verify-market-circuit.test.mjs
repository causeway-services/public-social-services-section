import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { verifyMarketCircuit } from "../lib/management/verify-market-circuit.mjs";

const circuit = JSON.parse(readFileSync(new URL("../content/circuits/founding-knowledge-vault-market-circuit.json", import.meta.url), "utf8"));
const contributorCircuit = JSON.parse(readFileSync(new URL("../content/circuits/contributor-knowledge-market-circuit.json", import.meta.url), "utf8"));

test("compiles the discovery loop and exposes the first open revenue cell", () => {
  const reading = verifyMarketCircuit(circuit, "2026-07-21T19:00:00.000Z");
  assert.equal(reading.structuralStatus, "passed");
  assert.equal(reading.discoveryLoopClosed, true);
  assert.equal(reading.revenuePathClosed, false);
  assert.equal(reading.nextCriticalCell, "stripe-checkout-provider");
  assert.equal(reading.inference, "discovery-operational-revenue-open-circuit");
});

test("contributor circuit exposes broker activation as the first open commercial cell", () => {
  const reading = verifyMarketCircuit(contributorCircuit, "2026-07-21T20:00:00.000Z");
  assert.equal(contributorCircuit.revenueProductId, "tti-locality-knowledge-answer-2026-01");
  for (const id of ["buyer-demand-ingress", "buyer-query-admission", "rights-compatible-matching", "human-attribution-review", "union-knowledge-offer", "knowledge-product-fulfillment"]) assert.ok(contributorCircuit.cells.some((cell) => cell.id === id), id);
  for (const id of ["DRC-TTI-KM-013", "DRC-TTI-KM-014", "DRC-TTI-KM-015", "DRC-TTI-KM-016", "DRC-TTI-KM-017", "DRC-TTI-KM-018", "DRC-TTI-KM-019", "DRC-TTI-KM-020"]) assert.ok(contributorCircuit.requiredDesignRules.includes(id), id);
  assert.equal(reading.structuralStatus, "passed");
  assert.equal(reading.discoveryLoopClosed, false);
  assert.equal(reading.buyerDiscoveryLoopClosed, true);
  assert.equal(reading.pathClosures.discordBuyerPilot, true);
  assert.equal(reading.pathClosures.directBuyerDemand, false);
  assert.equal(reading.revenuePathClosed, false);
  assert.equal(reading.nextCriticalCell, "discord-broker-mention-ingress");
  assert.ok(reading.openRevenueCells.find((cell) => cell.id === "direct-contribution-intake")?.blockers.includes("effective terms"));
  assert.ok(reading.openRevenueCells.find((cell) => cell.id === "buyer-demand-ingress")?.blockers.includes("production HTTPS deployment with one dedicated token per contracted buyer settlement"));
});

test("design-rule verification rejects broken nets and missing economic law", () => {
  const broken = structuredClone(circuit); broken.nets[0].from = "missing.port"; broken.designRules = broken.designRules.filter((rule) => rule.id !== "DRC-TTI-004");
  const reading = verifyMarketCircuit(broken, "2026-07-21T19:00:00.000Z");
  assert.equal(reading.structuralStatus, "failed");
  assert.ok(reading.errors.includes("invalid-net-source:n-demand-offer"));
  assert.ok(reading.errors.includes("missing-design-rule:DRC-TTI-004"));
});
