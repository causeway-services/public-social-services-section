import assert from "node:assert/strict";
import test from "node:test";
import { EMPTY_WITNESS_ROOT, identifyJsonSemanticContent } from "@red-cup-engineering/semantic-content-identify-service";

const semanticId = (value) => identifyJsonSemanticContent({ objectKind: "turntide-islands.record", value, witnessRoot: EMPTY_WITNESS_ROOT }).token;
import {
  LOCALITY_KNOWLEDGE_PRICE_MICROS,
  admitKnowledgeAttributionReview,
  admitLocalityKnowledgeBuyerQuery,
  freezeLocalityKnowledgeOffer,
  matchLocalityKnowledgeContributions,
  prepareLocalityKnowledgeFulfillment,
} from "../lib/management/locality-knowledge-product.mjs";

const recordedAt = "2026-07-21T21:00:00.000Z";
function withId(body) { return { ...body, id: semanticId(body) }; }
function contribution(overrides = {}) {
  return withId({
    type: "TTIKnowledgeContribution", version: 1, contributorAccount: "urn:tti:contributor:garden-a",
    sourceProtocol: "tti-direct-intake-v1", discordContentImported: false,
    knowledge: "Raised rows reduced bean-root rot in dense clay soil after prolonged late-spring rain.",
    subject: "local bean gardening", geographicContext: "example-town", temporalContext: "late spring", evidence: [],
    license: { termsId: "effective-terms", scope: "union-licensed-pseudonymous", resaleAllowed: true, attribution: "pseudonymous" },
    consentedAt: recordedAt, corrections: [], status: "active", ...overrides,
  });
}
function queryInput(overrides = {}) {
  return {
    sourceProtocol: "tti-direct-buyer-query-v1", buyerSettlement: "urn:ame:union-garden-office",
    question: "What locally observed practice reduces bean-root rot in dense clay soil after prolonged rain?",
    subject: "local bean gardening", geographicContext: "example-town", temporalContext: "late spring",
    intendedUse: "local-practice-research", noPersonalDataAttested: true, buyerTermsAcknowledged: true,
    requestedAt: recordedAt, budget: { currency: "USD", maximumMicros: LOCALITY_KNOWLEDGE_PRICE_MICROS }, sensitiveClasses: [], ...overrides,
  };
}
function admittedPipeline() {
  const c = contribution();
  const query = admitLocalityKnowledgeBuyerQuery(queryInput(), { simulationMode: true });
  const match = matchLocalityKnowledgeContributions({ query, contributions: [c], recordedAt, simulationMode: true });
  const review = admitKnowledgeAttributionReview({
    type: "TTIKnowledgeAttributionReview", version: 1, status: "approved", humanReviewed: true,
    reviewerAuthority: "urn:tti:office:contributor-market", queryId: query.id, matchId: match.id,
    reviewedAt: recordedAt, simulation: true,
    weights: [{ contributionId: c.id, weightPpm: 1_000_000, rationale: "The sole exact locality match supplies every factual practice in the answer." }],
  }, { query, match, simulationMode: true });
  const offer = freezeLocalityKnowledgeOffer({ query, match, review, contributions: [c], recordedAt, expiresAt: "2026-07-22T21:00:00.000Z", simulationMode: true });
  return { c, query, match, review, offer };
}

test("closes query, rights matching, human attribution, offer, and fulfillment without economic recognition", () => {
  const { c, query, match, review, offer } = admittedPipeline();
  assert.equal(query.type, "TTILocalityKnowledgeBuyerQuery");
  assert.equal(query.personalDataIncluded, false);
  assert.equal(match.type, "TTILocalityKnowledgeMatchReceipt");
  assert.deepEqual(match.candidateContributionIds, [c.id]);
  assert.equal(review.type, "TTIKnowledgeAttributionReview");
  assert.equal(offer.type, "TTILocalityKnowledgeProductOffer");
  assert.equal(offer.price.unitAmountMicros, 10_000_000);
  assert.equal(offer.saleFormed, false);
  const sale = { type: "TTIKnowledgeSaleReceipt", id: "urn:tti:synthetic-sale:locality", status: "settled", simulation: true, offerId: offer.id, productId: offer.productId, buyerSettlement: offer.buyerSettlement };
  const fulfillment = prepareLocalityKnowledgeFulfillment({
    offer, sale, contributions: [c], citedContributionIds: [c.id], recordedAt, simulationMode: true,
    answer: "For the stated late-spring conditions, the admitted local observation supports using raised rows to improve drainage around young bean roots. This is one bounded experiential report, not a universal agronomic guarantee.",
  });
  assert.equal(fulfillment.type, "TTILocalityKnowledgeFulfillmentPackage");
  assert.equal(fulfillment.deliveryStatus, "synthetic-nonposting");
  assert.equal(fulfillment.revenueRecognized, false);
  assert.equal(fulfillment.provenance[0].contributionId, c.id);
});

test("refuses personal fields, sensitive queries, weak budgets, and mismatched localities", () => {
  const personal = admitLocalityKnowledgeBuyerQuery({ ...queryInput(), discordUserId: "private-user" }, { simulationMode: true });
  assert.ok(personal.reasons.includes("buyer-query-contains-prohibited-discord-personal-or-secret-field"));
  const sensitive = admitLocalityKnowledgeBuyerQuery(queryInput({ sensitiveClasses: ["precise-home-location"] }), { simulationMode: true });
  assert.ok(sensitive.reasons.includes("sensitive-buyer-query-refused"));
  const c = contribution();
  const lowBudget = admitLocalityKnowledgeBuyerQuery(queryInput({ budget: { currency: "USD", maximumMicros: 1_000_000 } }), { simulationMode: true });
  assert.equal(lowBudget.type, "TTILocalityKnowledgeBuyerQuery");
  const mismatch = matchLocalityKnowledgeContributions({ query: lowBudget, contributions: [contribution({ geographicContext: "other-town" })], recordedAt, simulationMode: true });
  assert.ok(mismatch.reasons.includes("no-active-resale-contribution-matches-bounded-context"));
  const emptyMatch = matchLocalityKnowledgeContributions({ query: lowBudget, contributions: [c], recordedAt, simulationMode: true });
  const review = admitKnowledgeAttributionReview({ type: "TTIKnowledgeAttributionReview", version: 1, status: "approved", humanReviewed: false, queryId: lowBudget.id, matchId: emptyMatch.id, simulation: true, reviewedAt: recordedAt, reviewerAuthority: "urn:tti:office:contributor-market", weights: [] }, { query: lowBudget, match: emptyMatch, simulationMode: true });
  assert.ok(review.reasons.includes("human-approved-review-absent"));
});

test("offer freeze refuses a buyer budget below the fixed ten-dollar price", () => {
  const c = contribution();
  const query = admitLocalityKnowledgeBuyerQuery(queryInput({ budget: { currency: "USD", maximumMicros: 9_999_999 } }), { simulationMode: true });
  const match = matchLocalityKnowledgeContributions({ query, contributions: [c], recordedAt, simulationMode: true });
  const review = admitKnowledgeAttributionReview({ type: "TTIKnowledgeAttributionReview", version: 1, status: "approved", humanReviewed: true, reviewerAuthority: "urn:tti:office:contributor-market", queryId: query.id, matchId: match.id, reviewedAt: recordedAt, simulation: true, weights: [{ contributionId: c.id, weightPpm: 1_000_000, rationale: "The single exact contribution supplies the full bounded locality answer." }] }, { query, match, simulationMode: true });
  const offer = freezeLocalityKnowledgeOffer({ query, match, review, contributions: [c], recordedAt, expiresAt: "2026-07-22T21:00:00.000Z", simulationMode: true });
  assert.ok(offer.reasons.includes("buyer-budget-below-fixed-price"));
});
