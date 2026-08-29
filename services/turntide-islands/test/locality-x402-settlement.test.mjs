import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { EMPTY_WITNESS_ROOT, identifyJsonSemanticContent } from "@red-cup-engineering/semantic-content-identify-service";

const semanticId = (value) => identifyJsonSemanticContent({ objectKind: "turntide-islands.record", value, witnessRoot: EMPTY_WITNESS_ROOT }).token;
import {
  LOCALITY_X402_PRICE,
  LOCALITY_X402_CONTRACT,
  LOCALITY_X402_PRODUCTION_ACTIVATION_ID,
  LOCALITY_X402_PRODUCTION_ACTIVATION_CATEGORY,
  LOCALITY_X402_SETTLEMENT_CATEGORY,
  X402_PROVIDER_ACTOR,
  X402_PROVIDER_CONTRACT,
  admitLocalityOfferForX402,
  admitLocalityX402Configuration,
  admitLocalityX402ProductionActivation,
  admitLocalityX402ProductionRequestOrigin,
  admitLocalityX402Settlement,
  createLocalityKnowledgePaymentServer,
  localityX402SettlementRecorderFromSettlementStore,
} from "../lib/management/locality-x402-settlement.mjs";
import { LOCALITY_KNOWLEDGE_CONTRACT, LOCALITY_KNOWLEDGE_PRODUCT_ID } from "../lib/management/locality-knowledge-product.mjs";

const NETWORK = "eip155:31337", PAY_TO = "0xcfe1b9960ddbbe2b95e48114c281d7f24eb87b4d", ASSET = "0x0000000000000000000000000000000000000003", NOW = "2026-07-22T00:00:00.000Z";
const ENTERPRISE_ID = "0xa85e9bcdca127611b64bb10fb1b72fc829742a650d7902a4a601c2835d2bc5ad";
function accountBinding(network = NETWORK, address = PAY_TO) {
  return { profile: "org.emsenn.evm.sovereign-enterprise-account.v3", enterprise: { nodeId: "turntide-islands", urn: "urn:ame:turntide-islands", enterpriseId: ENTERPRISE_ID }, chain: { chainId: Number(network.split(":")[1]), caip2: network }, account: { address, caip10: `${network}:${address}` }, factory: { address: `0x${"3".repeat(40)}`, userSalt: `0x${"4".repeat(64)}` }, policy: { signer: `0x${"5".repeat(40)}`, custody: "settlement-private" }, deployment: { transaction: `0x${"6".repeat(64)}`, block: 1 } };
}
const binding = accountBinding();
function ni(seed) { return `ni:///sha-256;${createHash("sha256").update(seed).digest("base64url")}`; }
function productionActivation(binding8453, overrides = {}) {
  const body = {
    type: "TTILocalityX402ProductionActivationAdmission", version: 1, id: LOCALITY_X402_PRODUCTION_ACTIVATION_ID, status: "admitted", contract: LOCALITY_X402_CONTRACT,
    provider: X402_PROVIDER_ACTOR, providerContract: X402_PROVIDER_CONTRACT, network: "eip155:8453", asset: ASSET, assetMetadata: { address: ASSET, symbol: "USDC", decimals: 6, contractEvidenceId: ni("Z") }, payTo: binding8453.account.address, accountBinding: binding8453.account.caip10,
    facilitator: { actor: "urn:ame:contracted-x402-facilitator", contract: ni("A"), url: "https://facilitator.example/", costQuoteReceipt: ni("B"), capabilityReceipt: ni("C") },
    publicOrigin: "https://knowledge.tti.example", buyerAndMaturityLaw: ni("D"), issuedAt: "2026-07-21T00:00:00.000Z", expiresAt: "2026-07-30T00:00:00.000Z",
    pilot: { maximumSettledSales: 1, maximumGrossRevenueMicros: 10_000_000, bulkActivation: false },
    checks: ["base-mainnet-standards-deployment", "tti-base-enterprise-account-binding", "base-mainnet-payment-asset", "production-facilitator-contract-and-cost-quote", "buyer-refund-chargeback-and-maturity-law", "public-https-payment-origin", "qualified-legal-tax-and-security-review"].map((id, index) => ({ id, status: "passed", evidenceId: ni(String.fromCharCode(69 + index)) })),
    ...overrides,
  };
  return body;
}
function withId(body) { return { ...body, id: semanticId(body) }; }
function offer(overrides = {}) { return withId({ type: "TTILocalityKnowledgeProductOffer", version: 1, productId: LOCALITY_KNOWLEDGE_PRODUCT_ID, contract: LOCALITY_KNOWLEDGE_CONTRACT, seller: "urn:ame:turntide-islands", buyerSettlement: "urn:ame:union-garden-office", query: { id: "query", question: "question", subject: "gardening", geographicContext: "town", temporalContext: null, intendedUse: "local-practice-research" }, matchReceiptId: "match", attributionReviewId: "review", price: { currency: "USD", unitAmountMicros: 10_000_000, quantity: 1, status: "fixed-offer-not-payment" }, frozenContributions: [{ contributionId: "contribution", licenseScope: "union-licensed-pseudonymous", attribution: "pseudonymous" }], attributionWeights: [{ contributionId: "contribution", weightPpm: 1_000_000 }], deliveryPromise: { artifact: "one-source-traceable-locality-knowledge-answer", maximumWords: 1500, correctionWindow: "P30D", buyerLicense: "internal" }, recordedAt: "2026-07-21T23:00:00.000Z", expiresAt: "2026-07-23T00:00:00.000Z", simulation: true, saleFormed: false, paymentObserved: false, entitlementCreated: false, revenueRecognized: false, profitRecognized: false, ...overrides }); }
function config() { return admitLocalityX402Configuration({ accountBinding: binding, network: NETWORK, payTo: PAY_TO, asset: ASSET, simulationMode: true }); }
function settlement(o = offer(), overrides = {}) { return { provider: X402_PROVIDER_ACTOR, providerContract: X402_PROVIDER_CONTRACT, x402Version: 2, scheme: "exact", success: true, offerId: o.id, network: NETWORK, asset: ASSET, transaction: `0x${"1".repeat(64)}`, payer: `0x${"2".repeat(40)}`, payTo: PAY_TO, amount: "10000000", simulation: true, ...overrides }; }
async function listen(app) { const server = await new Promise((accept, reject) => { const candidate = app.listen(0, "127.0.0.1", () => accept(candidate)); candidate.once("error", reject); }); await new Promise((accept) => setTimeout(accept, 25)); return server; }

test("hires the standard x402 provider and emits an exact ten-dollar unpaid challenge", async () => {
  const o = offer(), facilitator = { async getSupported() { return { kinds: [{ x402Version: 2, scheme: "exact", network: NETWORK }], extensions: [], signers: {} }; }, async verify() { throw new Error("unpaid assay must not verify"); }, async settle() { throw new Error("unpaid assay must not settle"); } };
  const serverDefinition = createLocalityKnowledgePaymentServer({ accountBinding: binding, network: NETWORK, payTo: PAY_TO, asset: ASSET, simulationMode: true, facilitatorClient: facilitator, offerLookup: async (id) => id === o.id ? o : id === "expired" ? offer({ expiresAt: "2026-07-21T23:59:59.000Z" }) : null, recordSettlement: async () => { throw new Error("unpaid assay must not record"); }, now: () => NOW });
  const server = await listen(serverDefinition.app);
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/knowledge/locality/${encodeURIComponent(o.id)}`);
    assert.equal(response.status, 402);
    assert.equal(response.headers.get("link"), `<${LOCALITY_KNOWLEDGE_CONTRACT}>; rel="describedby"; type="application/rmn+cbor"`);
    const challenge = JSON.parse(Buffer.from(response.headers.get("payment-required"), "base64").toString("utf8"));
    assert.equal(challenge.x402Version, 2); assert.equal(challenge.accepts[0].scheme, "exact"); assert.equal(challenge.accepts[0].network, NETWORK); assert.equal(challenge.accepts[0].payTo.toLowerCase(), PAY_TO); assert.equal(LOCALITY_X402_PRICE, "$10.00");
    const expired = await fetch(`http://127.0.0.1:${server.address().port}/knowledge/locality/expired`);
    assert.equal(expired.status, 422); assert.equal((await expired.json()).stage, "offer-payment-admission");
  } finally { await new Promise((accept) => server.close(accept)); }
});

test("admits development-chain settlement evidence while forbidding revenue recognition", () => {
  const o = offer(), result = admitLocalityX402Settlement({ offer: o, configuration: config(), providerSettlement: settlement(o), recordedAt: NOW });
  assert.equal(result.type, "TTILocalityX402SettlementAdmission");
  assert.equal(result.providerEvidence.contract, LOCALITY_X402_CONTRACT);
  assert.equal(result.providerEvidence.rawPaymentPayloadRecorded, false);
  assert.equal(result.saleReceipt.status, "settled");
  assert.equal(result.saleReceipt.paymentObserved, true);
  assert.equal(result.saleReceipt.revenueRecognized, false);
  assert.equal(result.saleReceipt.grossRevenue.status, "synthetic");
  assert.equal(result.saleReceipt.profitRecognized, false);
});

test("records provider evidence and sale receipt as one replay-safe settlement bundle", async () => {
  const rows = [], store = { records(category) { assert.equal(category, LOCALITY_X402_SETTLEMENT_CATEGORY); return rows; }, async record(input) { assert.equal(input.category, LOCALITY_X402_SETTLEMENT_CATEGORY); assert.equal(input.assertions.length, 2); rows.push(input.record); } };
  const o = offer(), admission = admitLocalityX402Settlement({ offer: o, configuration: config(), providerSettlement: settlement(o), recordedAt: NOW }), record = localityX402SettlementRecorderFromSettlementStore(store);
  const first = await record(admission), replay = await record(admission);
  assert.equal(first.id, replay.id); assert.equal(rows.length, 1); assert.equal(first.atomicAdmission, true); assert.equal(first.rawPaymentPayloadRecorded, false);
  const secondOffer = offer({ buyerSettlement: "urn:ame:other-buyer" }), conflict = admitLocalityX402Settlement({ offer: secondOffer, configuration: config(), providerSettlement: settlement(secondOffer), recordedAt: NOW });
  await assert.rejects(() => record(conflict), /transaction settlement replay conflict/u);
});

test("refuses caller-selected settlement terms and dev-chain live recognition", () => {
  assert.equal(admitLocalityX402Configuration({ accountBinding: binding, network: NETWORK, payTo: PAY_TO, asset: ASSET, simulationMode: false }).type, "TTILocalityX402Refusal");
  assert.equal(admitLocalityX402Configuration({ accountBinding: binding, network: NETWORK, payTo: `0x${"9".repeat(40)}`, asset: ASSET, simulationMode: true }).type, "TTILocalityX402Refusal");
  const o = offer();
  for (const changed of [{ amount: "1" }, { payTo: `0x${"9".repeat(40)}` }, { offerId: "foreign" }, { transaction: "bad" }, { providerContract: "foreign" }]) {
    const result = admitLocalityX402Settlement({ offer: o, configuration: config(), providerSettlement: settlement(o, changed), recordedAt: NOW });
    assert.equal(result.type, "TTILocalityX402Refusal"); assert.equal(result.revenueRecognized, false);
  }
  const expired = admitLocalityOfferForX402({ offer: offer({ expiresAt: "2026-07-21T23:59:59.000Z" }), configuration: config(), recordedAt: NOW });
  assert.ok(expired.reasons.includes("offer-expired-before-payment-challenge"));
});

test("production configuration requires one exact unexpired bounded activation", () => {
  const mainnetBinding = accountBinding("eip155:8453", `0x${"7".repeat(40)}`), activation = productionActivation(mainnetBinding);
  const absent = admitLocalityX402Configuration({ accountBinding: mainnetBinding, network: "eip155:8453", payTo: mainnetBinding.account.address, asset: ASSET, simulationMode: false, recordedAt: NOW });
  assert.equal(absent.type, "TTILocalityX402Refusal"); assert.ok(absent.reasons.includes("production-activation-not-admitted"));
  const admitted = admitLocalityX402Configuration({ accountBinding: mainnetBinding, network: "eip155:8453", payTo: mainnetBinding.account.address, asset: ASSET, activationAdmission: activation, simulationMode: false, recordedAt: NOW });
  assert.equal(admitted.type, "TTILocalityX402ConfigurationAdmission"); assert.equal(admitted.activationId, LOCALITY_X402_PRODUCTION_ACTIVATION_ID); assert.equal(admitted.facilitator.url, "https://facilitator.example/"); assert.equal(admitted.pilotSaleLimit, 1);
  const callerMutation = admitLocalityX402ProductionActivation({ activationAdmission: activation, accountBinding: mainnetBinding, network: "eip155:8453", payTo: mainnetBinding.account.address, asset: ASSET, facilitatorUrl: "https://attacker.example", recordedAt: NOW });
  assert.equal(callerMutation.type, "TTILocalityX402Refusal"); assert.ok(callerMutation.reasons.includes("caller-selected-facilitator-conflicts-with-activation"));
  for (const changed of [
    { status: "not-admitted" },
    { asset: `0x${"9".repeat(40)}` },
    { pilot: { maximumSettledSales: 2, maximumGrossRevenueMicros: 20_000_000, bulkActivation: true } },
    { expiresAt: "2026-07-22T00:00:00.000Z" },
    { checks: activation.checks.map((check, index) => index === 0 ? { ...check, status: "missing", evidenceId: null } : check) },
  ]) assert.equal(admitLocalityX402Configuration({ accountBinding: mainnetBinding, network: "eip155:8453", payTo: mainnetBinding.account.address, asset: ASSET, activationAdmission: { ...activation, ...changed }, simulationMode: false, recordedAt: NOW }).type, "TTILocalityX402Refusal");
});

test("one admitted production activation cannot settle a second pilot sale", async () => {
  const mainnetBinding = accountBinding("eip155:8453", `0x${"7".repeat(40)}`), activation = productionActivation(mainnetBinding);
  const configuration = admitLocalityX402Configuration({ accountBinding: mainnetBinding, network: "eip155:8453", payTo: mainnetBinding.account.address, asset: ASSET, activationAdmission: activation, simulationMode: false, recordedAt: NOW });
  const firstOffer = offer({ simulation: false }), firstProvider = settlement(firstOffer, { simulation: false, network: "eip155:8453", payTo: mainnetBinding.account.address });
  const first = admitLocalityX402Settlement({ offer: firstOffer, configuration, providerSettlement: firstProvider, recordedAt: NOW });
  assert.equal(first.type, "TTILocalityX402SettlementAdmission"); assert.equal(first.saleReceipt.activationId, LOCALITY_X402_PRODUCTION_ACTIVATION_ID); assert.equal(first.saleReceipt.facilitator.actor, "urn:ame:contracted-x402-facilitator"); assert.equal(first.saleReceipt.revenueRecognized, true);
  const rows = [], claims = new Map(), record = localityX402SettlementRecorderFromSettlementStore({ records() { return rows; }, async claimOnce(claim) { const prior = claims.get(claim.activationId); if (prior && JSON.stringify(prior) !== JSON.stringify(claim)) throw new Error("activation already claimed"); claims.set(claim.activationId, claim); }, async record(input) { rows.push(input.record); } });
  await record(first);
  const secondOffer = offer({ simulation: false, buyerSettlement: "urn:ame:second-buyer" }), secondProvider = settlement(secondOffer, { simulation: false, network: "eip155:8453", payTo: mainnetBinding.account.address, transaction: `0x${"8".repeat(64)}` });
  const second = admitLocalityX402Settlement({ offer: secondOffer, configuration, providerSettlement: secondProvider, recordedAt: NOW });
  await assert.rejects(() => record(second), /one-sale pilot limit/u);
});

test("production settlement refuses a store without atomic activation consumption", async () => {
  const mainnetBinding = accountBinding("eip155:8453", `0x${"7".repeat(40)}`), activation = productionActivation(mainnetBinding);
  const configuration = admitLocalityX402Configuration({ accountBinding: mainnetBinding, network: "eip155:8453", payTo: mainnetBinding.account.address, asset: ASSET, activationAdmission: activation, simulationMode: false, recordedAt: NOW });
  const liveOffer = offer({ simulation: false }), admitted = admitLocalityX402Settlement({ offer: liveOffer, configuration, providerSettlement: settlement(liveOffer, { simulation: false, network: "eip155:8453", payTo: mainnetBinding.account.address }), recordedAt: NOW });
  const record = localityX402SettlementRecorderFromSettlementStore({ records() { return []; }, async record() { throw new Error("must not write without claim"); } });
  await assert.rejects(() => record(admitted), /requires atomic activation claim capability/u);
});

test("production server refuses caller activation and facilitator injection instead of bypassing the settlement store", () => {
  const mainnetBinding = accountBinding("eip155:8453", `0x${"7".repeat(40)}`), activation = productionActivation(mainnetBinding);
  const base = { accountBinding: mainnetBinding, network: "eip155:8453", payTo: mainnetBinding.account.address, asset: ASSET, simulationMode: false, offerLookup: async () => null };
  assert.throws(() => createLocalityKnowledgePaymentServer({ ...base, activationAdmission: activation }), /must be read from the TTI settlement store/u);
  const claims = new Map(), store = { root: "/tmp/not-used-before-settlement", records(category) { assert.equal(category, LOCALITY_X402_PRODUCTION_ACTIVATION_CATEGORY); return [activation]; }, async record() {}, async claimOnce(claim) { if (claims.has(claim.activationId)) throw new Error("claimed"); claims.set(claim.activationId, claim); } };
  assert.throws(() => createLocalityKnowledgePaymentServer({ ...base, settlementStore: store, facilitatorClient: {} }), /facilitator client injection is forbidden/u);
  assert.throws(() => createLocalityKnowledgePaymentServer({ ...base, settlementStore: store, facilitatorUrl: activation.facilitator.url }), /facilitator URL must be derived/u);
});

test("production request origin must match the admitted HTTPS host and proxy protocol", () => {
  assert.equal(admitLocalityX402ProductionRequestOrigin({ publicOrigin: "https://knowledge.tti.example", host: "knowledge.tti.example", forwardedProtocol: "https" }).type, "TTILocalityX402ProductionRequestOriginAdmission");
  for (const request of [
    { publicOrigin: "http://knowledge.tti.example", host: "knowledge.tti.example", forwardedProtocol: "https" },
    { publicOrigin: "https://knowledge.tti.example", host: "attacker.example", forwardedProtocol: "https" },
    { publicOrigin: "https://knowledge.tti.example", host: "knowledge.tti.example", forwardedProtocol: "http" },
  ]) assert.equal(admitLocalityX402ProductionRequestOrigin(request).type, "TTILocalityX402Refusal");
});
