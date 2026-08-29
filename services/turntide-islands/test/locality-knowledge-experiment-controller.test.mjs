import assert from "node:assert/strict";
import test from "node:test";
import { LOCALITY_EXPERIMENT_REMINDER_MARKER, localityExperimentDecision, localityExperimentReminderMessage } from "../lib/management/locality-knowledge-experiment-controller.mjs";

const product = { id: "tti-locality-knowledge-answer-2026-01", territory: { offerMarker: "TTI-LOCALITY-ANSWER-2026-01" }, nextExperiment: { id: "EXP-KM-LOCALITY-002", status: "live-observing", decisionAt: "2026-08-05T00:38:32.074Z" } };
function snapshot(changes = {}) { return { type: "TTILocalityKnowledgeDiscoverySnapshot", productId: product.id, offerMessageId: "1529240621334663199", distinctQualifiedInterestActors: 1, noChargeQueryPilotActors: 0, freeChatAnswerInterestActors: 0, persistentVaultInterestActors: 0, meteredPowerUserInterestActors: 0, buyerQueriesAdmitted: 0, externalRevenueReceiptCount: 0, recognizedRevenueMicros: 0, profitMicros: null, ...changes }; }

test("holds before 48 hours and calls for exactly one public reminder afterward", () => {
  assert.equal(localityExperimentDecision({ product, snapshot: snapshot(), recordedAt: "2026-07-23T20:00:00.000Z" }).action, "hold");
  const due = localityExperimentDecision({ product, snapshot: snapshot(), recordedAt: "2026-07-24T02:00:00.000Z" });
  assert.equal(due.action, "post-one-public-reminder"); assert.equal(due.economicEffect, "none"); assert.equal(due.unsolicitedDirectMessages, false);
  assert.equal(localityExperimentDecision({ product, snapshot: snapshot(), recordedAt: "2026-07-24T02:00:00.000Z", reminderObserved: true }).action, "hold");
});

test("passes early only at all three thresholds and fails into interviews at decision time", () => {
  const almost = localityExperimentDecision({ product, snapshot: snapshot({ distinctQualifiedInterestActors: 3, noChargeQueryPilotActors: 1 }), recordedAt: "2026-07-24T00:00:00.000Z", reminderObserved: true });
  assert.equal(almost.passThresholdsMet, false);
  const pass = localityExperimentDecision({ product, snapshot: snapshot({ distinctQualifiedInterestActors: 3, noChargeQueryPilotActors: 1, persistentVaultInterestActors: 1 }), recordedAt: "2026-07-24T00:00:00.000Z" });
  assert.equal(pass.state, "passed-early"); assert.equal(pass.action, "pilot-one-rights-compatible-free-answer-and-measure-cost");
  const fail = localityExperimentDecision({ product, snapshot: snapshot(), recordedAt: product.nextExperiment.decisionAt, reminderObserved: true });
  assert.equal(fail.state, "failed-at-decision"); assert.equal(fail.action, "interview-participants-before-product-change");
});

test("reminder is public, non-mentioning, and repeats the no-consent boundary", () => {
  const message = localityExperimentReminderMessage(product);
  assert.match(message, new RegExp(LOCALITY_EXPERIMENT_REMINDER_MARKER, "u")); assert.match(message, /old \$10 one-answer guess has been retired/u); assert.match(message, /not a query, purchase, contribution, license, payment/u); assert.doesNotMatch(message, /<@/u);
});
