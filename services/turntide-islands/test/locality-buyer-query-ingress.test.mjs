import assert from "node:assert/strict";
import test from "node:test";
import {
  LOCALITY_BUYER_QUERY_CATEGORY,
  LOCALITY_BUYER_QUERY_ADMISSION_CATEGORY,
  LOCALITY_BUYER_QUERY_INGRESS_CATEGORY,
  TTI_ACTOR,
  inspectLocalityBuyerQueryActivity,
  localityBuyerQueryRecorderFromSettlementStore,
  localityBuyerQueryHttpResponse,
  localityBuyerQueryRequestId,
} from "../lib/management/locality-buyer-query-ingress.mjs";
import { LOCALITY_KNOWLEDGE_CONTRACT, LOCALITY_KNOWLEDGE_PRODUCT_ID } from "../lib/management/locality-knowledge-product.mjs";

const token = "locality-buyer-contract-token-at-least-32-bytes";
const buyer = "urn:ame:union-garden-office";
const receivedAt = "2026-07-22T00:05:00.000Z";

function request(overrides = {}) {
  const body = {
    type: "TTILocalityKnowledgeBuyerQueryRequest",
    version: 1,
    productId: LOCALITY_KNOWLEDGE_PRODUCT_ID,
    buyerTermsId: LOCALITY_KNOWLEDGE_CONTRACT,
    buyerTermsAcknowledged: true,
    buyerSettlement: buyer,
    question: "What locally observed practice reduces bean-root rot in dense clay soil after prolonged rain?",
    subject: "local bean gardening",
    geographicContext: "example-town",
    temporalContext: "late spring",
    intendedUse: "local-practice-research",
    budget: { currency: "USD", maximumMicros: 10_000_000 },
    requestedAt: "2026-07-22T00:00:00.000Z",
    expiresAt: "2026-07-22T12:00:00.000Z",
    noPersonalDataAttested: true,
    sensitiveClasses: [],
    ...overrides,
  };
  return { ...body, id: localityBuyerQueryRequestId(body) };
}

function activity(object = request(), overrides = {}) {
  return { "@context": "https://www.w3.org/ns/activitystreams", type: "Create", actor: buyer, target: TTI_ACTOR, object, ...overrides };
}

function memoryRecorder() {
  const data = new Map([[LOCALITY_BUYER_QUERY_CATEGORY, []], [LOCALITY_BUYER_QUERY_INGRESS_CATEGORY, []]]);
  return {
    data,
    calls: 0,
    async findQuery(id) { return data.get(LOCALITY_BUYER_QUERY_CATEGORY).find((row) => row.id === id); },
    async recordAdmission({ ingressReceipt, query }) {
      this.calls += 1;
      data.get(LOCALITY_BUYER_QUERY_INGRESS_CATEGORY).push(ingressReceipt);
      if (query !== null) data.get(LOCALITY_BUYER_QUERY_CATEGORY).push(query);
    },
  };
}

function input(recorder, body = JSON.stringify(activity()), overrides = {}) {
  return {
    authorization: `Bearer ${token}`,
    expectedToken: token,
    authenticatedBuyerSettlement: buyer,
    buyerTermsEffective: true,
    contentType: "application/activity+json",
    body,
    recorder,
    recordedAt: receivedAt,
    ...overrides,
  };
}

test("admits an authenticated self-addressed ActivityStreams query as demand only and deduplicates replay", async () => {
  const recorder = memoryRecorder();
  const first = await localityBuyerQueryHttpResponse(input(recorder));
  assert.equal(first.status, 202);
  assert.equal(first.body.fixedPriceQualified, true);
  assert.equal(first.body.saleFormed, false);
  assert.equal(first.body.revenueRecognized, false);
  assert.equal(recorder.data.get(LOCALITY_BUYER_QUERY_CATEGORY).length, 1);
  assert.equal(recorder.data.get(LOCALITY_BUYER_QUERY_INGRESS_CATEGORY).length, 1);
  assert.equal(recorder.data.get(LOCALITY_BUYER_QUERY_CATEGORY)[0].buyerSettlement, buyer);
  assert.equal(recorder.data.get(LOCALITY_BUYER_QUERY_CATEGORY)[0].discordContentImported, false);
  assert.doesNotMatch(JSON.stringify(recorder.data), /locality-buyer-contract-token/u);
  const replay = await localityBuyerQueryHttpResponse(input(recorder));
  assert.equal(replay.status, 200);
  assert.equal(replay.body.replayed, true);
  assert.equal(recorder.calls, 1);
});

test("authenticates and checks effective terms before parsing or requesting witness mutation", async () => {
  const recorder = memoryRecorder();
  const unauthorized = await localityBuyerQueryHttpResponse(input(recorder, "not-json", { authorization: "Bearer wrong" }));
  assert.equal(unauthorized.status, 401);
  assert.equal(unauthorized.body.reason, "buyer-query-not-authenticated");
  const termsBlocked = await localityBuyerQueryHttpResponse(input(recorder, "not-json", { buyerTermsEffective: false }));
  assert.equal(termsBlocked.status, 503);
  assert.equal(termsBlocked.body.reason, "locality-buyer-terms-not-effective");
  assert.equal(recorder.calls, 0);
});

test("requires a contracted witness recorder for any authenticated query admission", async () => {
  const result = await localityBuyerQueryHttpResponse(input(undefined));
  assert.equal(result.status, 503);
  assert.equal(result.body.reason, "buyer-query-witness-service-unavailable");
  assert.equal(result.body.revenueRecognized, false);
});

test("adapts the hired settlement store to one atomic content-addressed admission bundle", async () => {
  const rows = [], store = {
    records(category) { return category === LOCALITY_BUYER_QUERY_ADMISSION_CATEGORY ? rows : []; },
    async record(input) { rows.push(input.record); assert.equal(input.category, LOCALITY_BUYER_QUERY_ADMISSION_CATEGORY); assert.equal(input.assertions.length, 2); },
  };
  const recorder = localityBuyerQueryRecorderFromSettlementStore(store);
  const result = await localityBuyerQueryHttpResponse(input(recorder));
  assert.equal(result.status, 202);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].type, "TTILocalityBuyerQueryAdmissionBundle");
  assert.equal(rows[0].atomicAdmission, true);
  assert.equal(rows[0].query.id, result.body.queryId);
  assert.equal(rows[0].ingressReceipt.admittedQueryId, result.body.queryId);
  assert.equal(rows[0].legalEffect, "admitted-buyer-demand-only-no-offer-sale-payment-entitlement-revenue-or-profit");
  const replay = await localityBuyerQueryHttpResponse(input(recorder));
  assert.equal(replay.status, 200);
  assert.equal(rows.length, 1);
});

test("refuses actor mismatch and unknown personal fields without admitting query inventory", async () => {
  const recorder = memoryRecorder();
  const personal = request({ buyerEmail: "somebody@example.invalid" });
  const result = await localityBuyerQueryHttpResponse(input(recorder, JSON.stringify(activity(personal, { actor: "urn:ame:other-office" }))));
  assert.equal(result.status, 422);
  assert.equal(recorder.data.get(LOCALITY_BUYER_QUERY_CATEGORY).length, 0);
  assert.equal(recorder.data.get(LOCALITY_BUYER_QUERY_INGRESS_CATEGORY).length, 1);
  const inspected = inspectLocalityBuyerQueryActivity({ activity: activity(personal, { actor: "urn:ame:other-office" }), authenticatedBuyerSettlement: buyer, receivedAt });
  assert.ok(inspected.reasons.includes("buyer-query-authenticated-actor-target-or-settlement-mismatch"));
  assert.ok(inspected.reasons.includes("buyer-query-request-field-not-admitted"));
  assert.equal(inspected.ingressReceipt.saleFormed, false);
});

test("admits sub-price demand but truthfully marks it unqualified for the frozen ten-dollar offer", async () => {
  const recorder = memoryRecorder();
  const lowBudget = request({ budget: { currency: "USD", maximumMicros: 9_000_000 } });
  const result = await localityBuyerQueryHttpResponse(input(recorder, JSON.stringify(activity(lowBudget))));
  assert.equal(result.status, 202);
  assert.equal(result.body.fixedPriceQualified, false);
  assert.equal(result.body.legalEffect, "buyer-demand-only-no-offer-sale-payment-entitlement-revenue-or-profit");
});

test("fails closed on changed content identity and stale request windows", () => {
  const changed = { ...request(), question: "This changed after the request was signed and must fail its content identity check." };
  const changedReading = inspectLocalityBuyerQueryActivity({ activity: activity(changed), authenticatedBuyerSettlement: buyer, receivedAt });
  assert.ok(changedReading.reasons.includes("buyer-query-request-content-identity-mismatch"));
  const stale = request({ requestedAt: "2026-07-20T00:00:00.000Z", expiresAt: "2026-07-21T00:00:00.000Z" });
  const staleReading = inspectLocalityBuyerQueryActivity({ activity: activity(stale), authenticatedBuyerSettlement: buyer, receivedAt });
  assert.ok(staleReading.reasons.includes("buyer-query-request-not-current-or-window-exceeds-24-hours"));
});
