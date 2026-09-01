import assert from "node:assert/strict";
import test from "node:test";
import { EMPTY_WITNESS_ROOT, identifyJsonSemanticContent } from "@red-cup-engineering/semantic-content-identify-service";

const semanticId = (value) => identifyJsonSemanticContent({ objectKind: "turntide-islands.record", value, witnessRoot: EMPTY_WITNESS_ROOT }).token;
import { admitKnowledgeContribution, allocateKnowledgeSale, qualifyDiscordContributionIntent, TERMS_ID } from "../lib/management/knowledge-contribution-market.mjs";

const direct = { sourceProtocol: "tti-direct-intake-v1", contributorAccount: "urn:tti:contributor:a", privateDiscordIdentityLink: "discord:123", adultCapacityAttested: true, licenseScope: "union-licensed-pseudonymous", termsId: TERMS_ID, consentedAt: "2026-07-21T19:00:00.000Z", knowledge: "In this town, late spring clay soil stays wet enough that raised rows prevent young bean roots from rotting.", subject: "local bean gardening", geographicContext: "example-town", thirdPartyRightsAttested: true, sensitiveClasses: [] };
const evidenceId = "ni:///sha-256;AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
function withId(body) { return { ...body, id: semanticId(body) }; }
function offerFor(contributions, weights, simulation = false) { return withId({ type: "TTILocalityKnowledgeProductOffer", productId: "tti-locality-knowledge-answer-2026-01", contract: "ni:///sha-256;24VLnw0orCLXDgjUgtuG9PM8y_VldOrBkb4ileAzscI", buyerSettlement: "urn:ame:union-buyer", simulation, price: { currency: "USD", unitAmountMicros: 10_000_000, quantity: 1 }, frozenContributions: contributions.map((row) => ({ contributionId: row.id })), attributionWeights: weights }); }
function saleFor(offer, overrides = {}) { return { type: "TTIKnowledgeSaleReceipt", id: "urn:sale:test", status: "settled", currency: "USD", simulation: offer.simulation, offerId: offer.id, productId: offer.productId, buyerSettlement: offer.buyerSettlement, settlementEvidenceId: evidenceId, maturityStatus: "matured", refundWindowClosedAt: "2026-08-20T19:00:00.000Z", grossRevenue: { status: "measured", micros: 10_000_000 }, paymentProcessingCost: { status: "measured", micros: 500_000 }, directProviderCost: { status: "measured", micros: 1_500_000 }, maturedRefundsAndChargebacks: { status: "measured", micros: 0 }, ...overrides }; }

test("an author's broker mention qualifies an offer request but never a license or sale", () => {
  const request = { messageId: "m1", guildId: "g1", channelId: "c1", messageAuthorId: "u1", authorBot: false, mentionedUserIds: ["broker"], brokerBotId: "broker", observedAt: "2026-07-21T19:00:00.000Z" };
  const intent = qualifyDiscordContributionIntent(request);
  assert.equal(intent.type, "TTIKnowledgeContributionIntent"); assert.equal(intent.discord.messageContentImported, false); assert.equal(intent.licenseGranted, false); assert.equal(intent.saleFormed, false);
  assert.equal(qualifyDiscordContributionIntent({ ...request, mentionedUserIds: [] }).reason, "knowledge-broker-not-mentioned");
  assert.equal(qualifyDiscordContributionIntent({ ...request, authorBot: true }).reason, "human-author-required");
  assert.equal(qualifyDiscordContributionIntent({ ...request, messageContent: "do not import me" }).reason, "discord-message-content-must-not-cross-intent-boundary");
});

test("admits only a deliberate direct contribution under effective exact terms", () => {
  const admitted = admitKnowledgeContribution(direct, { termsEffective: true, effectiveTermsId: TERMS_ID }); assert.equal(admitted.type, "TTIKnowledgeContribution"); assert.equal(admitted.discordContentImported, false); assert.equal(admitted.license.resaleAllowed, true);
  const harvested = admitKnowledgeContribution({ ...direct, sourceProtocol: "discord-api", discordMessageContent: direct.knowledge }, { termsEffective: true, effectiveTermsId: TERMS_ID }); assert.equal(harvested.type, "TTIKnowledgeContributionRefusal"); assert.ok(harvested.reasons.includes("discord-api-content-not-admissible"));
});

test("draft terms and sensitive knowledge block contribution admission", () => {
  const draft = admitKnowledgeContribution({ ...direct, sensitiveClasses: ["precise-home-location"] }, { termsEffective: false, effectiveTermsId: TERMS_ID }); assert.ok(draft.reasons.includes("contributor-terms-not-effective")); assert.ok(draft.reasons.includes("sensitive-data-refused"));
});

test("allocates half of fully receipted distributable margin by frozen provenance weights", () => {
  const a = admitKnowledgeContribution(direct, { termsEffective: true, effectiveTermsId: TERMS_ID }); const { id: _aId, ...aBody } = a; const b = withId({ ...aBody, contributorAccount: "urn:tti:contributor:b", knowledge: `${a.knowledge} Contributor B independently observed the same result.` });
  const weights = [{ contributionId: a.id, weightPpm: 750_000 },{ contributionId: b.id, weightPpm: 250_000 }], offer = offerFor([a,b], weights), sale = saleFor(offer, { id: "urn:sale:1" });
  const allocation = allocateKnowledgeSale({ sale, offer, contributions: [a,b], attributionWeights: weights, recordedAt: "2026-08-21T19:00:00.000Z" });
  assert.equal(allocation.distributableMarginMicros, 8_000_000); assert.equal(allocation.contributorPoolMicros, 4_000_000); assert.deepEqual(allocation.credits.map((row) => row.creditMicros), [3_000_000,1_000_000]); assert.equal(allocation.retainedTTIMarginMicros, 4_000_000);
});

test("refuses credits from estimates, unpaid sales, and weights that do not close", () => {
  const contribution = admitKnowledgeContribution(direct, { termsEffective: true, effectiveTermsId: TERMS_ID }); const weights = [{ contributionId: contribution.id, weightPpm: 1_000_000 }], offer = offerFor([contribution], weights), sale = saleFor(offer, { id: "urn:sale:2", paymentProcessingCost: { status: "unknown" }, directProviderCost: { status: "measured", micros: 0 } });
  assert.equal(allocateKnowledgeSale({ sale, offer, contributions: [contribution], attributionWeights: weights, recordedAt: "2026-08-21T19:00:00.000Z" }).reason, "complete-measured-sale-economics-absent");
  sale.paymentProcessingCost = { status: "measured", micros: 0 }; assert.equal(allocateKnowledgeSale({ sale, offer, contributions: [contribution], attributionWeights: [{ contributionId: contribution.id, weightPpm: 999_999 }], recordedAt: "2026-08-21T19:00:00.000Z" }).reason, "attribution-weights-must-total-one-million-ppm");
});

test("simulation sales are refused by default and can allocate only nonposting synthetic credits", () => {
  const contribution = admitKnowledgeContribution(direct, { termsEffective: true, effectiveTermsId: TERMS_ID });
  const weights = [{ contributionId: contribution.id, weightPpm: 1_000_000 }], offer = offerFor([contribution], weights, true), sale = saleFor(offer, { id: "urn:sale:simulation", refundWindowClosedAt: "2026-07-21T19:00:00.000Z", paymentProcessingCost: { status: "measured", micros: 0 }, directProviderCost: { status: "measured", micros: 0 } });
  const input = { sale, offer, contributions: [contribution], attributionWeights: weights, recordedAt: "2026-08-21T19:00:00.000Z" };
  assert.equal(allocateKnowledgeSale(input).reason, "simulation-sale-requires-explicit-simulation-mode");
  const synthetic = allocateKnowledgeSale({ ...input, simulationMode: true });
  assert.equal(synthetic.simulation, true);
  assert.equal(synthetic.recognition.revenue, "forbidden");
  assert.equal(synthetic.credits[0].status, "synthetic-nonposting-credit");
});
