import { readKoiosLedger, appendKoiosAct, recordDigest, type JsonObject } from "./ledger.mts";
import { settleInternalServiceExchange, type InternalServiceTerms } from "./internal-market.mts";
import type { NewsroomCircuitResult } from "./newsroom-circuit.mts";

export const COMMISSIONED_JOURNALISM_CONTRACT = "koios.news/commissioned-journalism/v1";
export const COMMISSIONED_JOURNALISM_CUSTOMER = "urn:micro-enterprise:koios.news:publishing-and-ad-inventory";
export const COMMISSIONED_JOURNALISM_PROVIDER = "urn:micro-enterprise:koios.news:journalism-commissioning";

const TERMS: InternalServiceTerms = Object.freeze({
  contract: COMMISSIONED_JOURNALISM_CONTRACT,
  buyer: COMMISSIONED_JOURNALISM_CUSTOMER,
  seller: COMMISSIONED_JOURNALISM_PROVIDER,
  commodity: Object.freeze({ type: "ServiceCommodity", id: "urn:commodity:koios.news:warranted-article-package", quantity: 1, unit: "warranted-article-package" }),
  consideration: Object.freeze({ type: "InternalValueAgreement", amount: 1, unit: "commissioned-journalism-credit", dueOn: "digest-bound-warranted-article-delivery", settlementProtocol: "bilateral-internal-market-receipt", monetaryClaim: false }),
});

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function keywordBriefDigest(dataDir: string, pulseId: string): string {
  const orderId = `${pulseId}:keyword-research`;
  const record = readKoiosLedger(dataDir, "audience-product").find((entry) => entry["kind"] === "koios.keyword-opportunity-brief" && entry["orderId"] === orderId);
  const brief = record?.["brief"];
  if (!object(brief) || typeof brief["briefDigest"] !== "string") {
    throw new Error("Publishing cannot buy journalism that does not descend from its exact purchased keyword-opportunity brief");
  }
  return brief["briefDigest"];
}

/**
 * Journalism Commissioning sells a finished article to Publishing. The
 * newsroom's source, writing, and editorial trades remain behind the seller's
 * membrane; the buyer receives one exact warranted package, not ambient labor.
 */
export async function settleCommissionedJournalismDelivery(input: Readonly<{
  dataDir: string;
  pulseId: string;
  result: NewsroomCircuitResult;
  settledAt: string;
}>): Promise<Readonly<JsonObject>> {
  const result = input.result;
  if (result.disposition !== "published" || result.assignmentId === undefined || result.slug === undefined || result.candidate === undefined) {
    throw new Error("only an editorially admitted article candidate can satisfy commissioned journalism");
  }
  const opportunityBriefDigest = keywordBriefDigest(input.dataDir, input.pulseId);
  const deliveryCore = Object.freeze({
    type: "WarrantedArticlePackage",
    contract: COMMISSIONED_JOURNALISM_CONTRACT,
    orderId: `${input.pulseId}:commissioned-journalism`,
    assignmentId: result.assignmentId,
    slug: result.slug,
    opportunityBriefDigest,
    artifactManifestDigest: result.candidate.manifestDigest,
    editorialAdmission: "exact-manuscript-independent-editorial-acceptance",
    publicStatus: "candidate-not-yet-live",
    deliveredAt: input.settledAt,
  });
  const delivery = Object.freeze({ ...deliveryCore, deliveryDigest: recordDigest(deliveryCore) });
  const internalMarketSettlement = await settleInternalServiceExchange({
    dataDir: input.dataDir,
    orderId: delivery.orderId,
    assignmentId: result.assignmentId,
    outcome: "warranted-article-package-delivered",
    fulfillmentDigest: delivery.deliveryDigest,
    settledAt: input.settledAt,
    terms: TERMS,
  });
  await appendKoiosAct({
    dataRoot: input.dataDir,
    ledger: "contract-events",
    instant: input.settledAt,
    act: "commissioned-journalism.internal-service.settled",
    subject: result.assignmentId,
    data: { contract: COMMISSIONED_JOURNALISM_CONTRACT, delivery, internalMarketSettlement },
  });
  return Object.freeze({ delivery, internalMarketSettlement });
}
