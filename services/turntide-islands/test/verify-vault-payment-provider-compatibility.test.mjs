import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { currentStripeProviderSourceObservation, verifyVaultPaymentProviderCompatibility } from "../lib/management/verify-vault-payment-provider-compatibility.mjs";

const solicitation = JSON.parse(readFileSync(new URL("../content/solicitations/founding-knowledge-vault-subscription-provider.json", import.meta.url), "utf8"));

test("current provider source observation is incompatible without pretending to be a provider refusal", () => {
  const reading = verifyVaultPaymentProviderCompatibility({ solicitation, observation: currentStripeProviderSourceObservation(), recordedAt: "2026-07-21T23:31:00.000Z" });
  assert.equal(reading.compatibility, "incompatible-current-observation");
  assert.equal(reading.providerAcceptance, false);
  assert.equal(reading.checkoutCreated, false);
  assert.equal(reading.revenueRecognized, false);
  assert.equal(reading.profitRecognized, false);
  assert.equal(reading.economics.observedProviderCost, "unknown");
  assert.ok(reading.checks.find((row) => row.requirementId === "REQ-PAY-005" && row.disposition === "compatible"));
  assert.ok(reading.checks.find((row) => row.requirementId === "REQ-PAY-006" && row.detail.includes("invoice.paid")));
  assert.ok(reading.operationalBlockers.includes("provider-credential-absent"));
});

test("a complete bounded provider offer can pass compatibility while still not becoming acceptance", () => {
  const base = currentStripeProviderSourceObservation();
  const observation = { ...base, credentialMode: "test", webhookSecretPresent: true, customerContractTokenPresent: true, offerings: [{ id: solicitation.product.offeringId, status: "test-active", mode: "subscription", currency: "usd", unitAmount: 500, billingPeriod: "P1M", quantity: { minimum: 1, maximum: 1 }, beneficiarySettlement: solicitation.beneficiarySettlement }], subscriptionCorrelationScopes: ["checkout", "subscription", "invoice"], supportedEventTypes: solicitation.eventConsequences.map((row) => row.eventType).flatMap((event) => event === "dispute.created-or-updated" ? [event] : [event]), authenticatedFullReceiptDelivery: true, providerCostQuote: { currency: "usd", unitAmount: 70, basis: "settled-subscriber-month" }, attributableCostReceiptSchema: "ni:///sha-256;AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" };
  const reading = verifyVaultPaymentProviderCompatibility({ solicitation, observation, recordedAt: "2026-07-21T23:32:00.000Z" });
  assert.equal(reading.compatibility, "compatible-observation-still-requires-provider-offer");
  assert.equal(reading.counts.compatible, 10);
  assert.equal(reading.providerAcceptance, false);
  assert.equal(reading.profitRecognized, false);
});
