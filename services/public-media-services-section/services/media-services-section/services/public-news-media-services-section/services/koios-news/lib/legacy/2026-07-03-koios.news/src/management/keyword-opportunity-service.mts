import { resolve } from "node:path";

import { DEFAULT_CONTENT_DIR, DEFAULT_CONTENT_PRODUCTION_CONFIG, DEFAULT_DATA_DIR } from "../config.mjs";
import { loadPosts } from "../content.mjs";
import { demandTable, readSearchConsole, type DemandEntry } from "../demand.mjs";
import { googleTrendsProbe, keywordDiscoveryReading, type KeywordDiscoveryReading, type TrendProbeResult } from "../researching/sourcing/discovery.mjs";
import { viewCounts } from "../views.mjs";
import { settleInternalServiceExchange, type InternalServiceTerms } from "./internal-market.mjs";
import { appendDatedRecord, appendKoiosAct, readKoiosLedger, recordDigest, type JsonObject } from "./ledger.mjs";

const CONTEXT = "https://www.w3.org/ns/activitystreams";
export const KEYWORD_RESEARCH_CUSTOMER = "urn:micro-enterprise:koios.news:journalism-commissioning";
export const KEYWORD_RESEARCH_PROVIDER = "urn:micro-enterprise:koios.news:keyword-research";
export const KEYWORD_RESEARCH_CONTRACT = "koios.news/keyword-opportunity-research/v1";
export const KEYWORD_RESEARCH_CAPABILITY = "urn:capability:koios.news:journalism-commissioning:buy-keyword-research:v1";

const TERMS: InternalServiceTerms = Object.freeze({
  contract: KEYWORD_RESEARCH_CONTRACT,
  buyer: KEYWORD_RESEARCH_CUSTOMER,
  seller: KEYWORD_RESEARCH_PROVIDER,
  commodity: Object.freeze({ type: "ServiceCommodity", id: "urn:commodity:koios.news:keyword-opportunity-brief", quantity: 1, unit: "keyword-opportunity-brief" }),
  consideration: Object.freeze({ type: "InternalValueAgreement", amount: 1, unit: "keyword-opportunity-research-credit", dueOn: "digest-bound-brief-delivery", settlementProtocol: "bilateral-internal-market-receipt", monetaryClaim: false }),
});

export type KeywordOpportunityBrief = Readonly<{
  type: "KeywordOpportunityBrief";
  contract: typeof KEYWORD_RESEARCH_CONTRACT;
  orderId: string;
  generatedAt: string;
  measuredDemand: readonly DemandEntry[];
  discovery: KeywordDiscoveryReading;
  trendProbe: TrendProbeResult;
  observations: Readonly<{
    searchConsoleQueries: number;
    attentionRecords: number;
    advertisingRecords: number;
    externalRevenueRecords: number;
  }>;
  factualWarrant: false;
  use: "assignment-selection-only";
  briefDigest: string;
}>;

type Activity = Readonly<Record<string, unknown>>;

function object(value: unknown): value is JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function response(source: Activity, type: "Accept" | "Reject", body: JsonObject, now: string): Readonly<JsonObject> {
  return Object.freeze({
    "@context": CONTEXT,
    type,
    actor: KEYWORD_RESEARCH_PROVIDER,
    target: source["actor"],
    ...(typeof source["id"] === "string" ? { inReplyTo: source["id"] } : {}),
    published: now,
    object: Object.freeze(body),
  });
}

function admittedOrder(activity: Activity): Readonly<{ orderId: string }> | undefined {
  if (activity["@context"] !== CONTEXT || activity["type"] !== "Create" || activity["actor"] !== KEYWORD_RESEARCH_CUSTOMER || activity["target"] !== KEYWORD_RESEARCH_PROVIDER || activity["capability"] !== KEYWORD_RESEARCH_CAPABILITY) return undefined;
  const order = object(activity["object"]) ? activity["object"] : undefined;
  if (order?.["type"] !== "KeywordOpportunityResearchOrder" || order["contract"] !== KEYWORD_RESEARCH_CONTRACT || typeof order["orderId"] !== "string" || order["orderId"].trim() === "") return undefined;
  return Object.freeze({ orderId: order["orderId"] });
}

function priorBrief(dataDir: string, orderId: string): Readonly<JsonObject> | undefined {
  return readKoiosLedger(dataDir, "audience-product").find((entry) => entry["kind"] === "koios.keyword-opportunity-brief" && entry["orderId"] === orderId);
}

export async function settleKeywordOpportunityResearchOrder(activity: Activity, options: Readonly<{
  now?: string;
  dataDir?: string;
  contentDir?: string;
  configPath?: string;
  trendProbe?: TrendProbeResult;
}> = {}): Promise<Readonly<JsonObject>> {
  const now = options.now ?? new Date().toISOString();
  const dataDir = resolve(options.dataDir ?? DEFAULT_DATA_DIR);
  const contentDir = resolve(options.contentDir ?? DEFAULT_CONTENT_DIR);
  const configPath = resolve(options.configPath ?? DEFAULT_CONTENT_PRODUCTION_CONFIG);
  const order = admittedOrder(activity);
  if (order === undefined) return response(activity, "Reject", { type: "KeywordOpportunityResearchRefusal", contract: KEYWORD_RESEARCH_CONTRACT, reason: "order must be an admitted Journalism Commissioning purchase" }, now);
  const prior = priorBrief(dataDir, order.orderId);
  if (prior !== undefined) return response(activity, "Accept", { type: "KeywordOpportunityResearchSettlement", contract: KEYWORD_RESEARCH_CONTRACT, orderId: order.orderId, replayed: true, brief: prior["brief"], internalMarketSettlement: prior["internalMarketSettlement"] }, now);

  const trendProbe = options.trendProbe ?? await googleTrendsProbe({});
  const discovery = await keywordDiscoveryReading({ configPath, contentDir, now: () => now, trends: trendProbe });
  const posts = loadPosts(contentDir);
  const searchConsole = readSearchConsole(dataDir);
  const attention = readKoiosLedger(dataDir, "attention");
  const advertising = readKoiosLedger(dataDir, "advertising");
  const revenue = readKoiosLedger(dataDir, "revenue-cost").filter((entry) => entry["act"] === "external.revenue.received");
  const measuredDemand = demandTable({ posts, views: viewCounts(dataDir), searchConsole });
  const briefBody = Object.freeze({
    type: "KeywordOpportunityBrief" as const,
    contract: KEYWORD_RESEARCH_CONTRACT,
    orderId: order.orderId,
    generatedAt: now,
    measuredDemand,
    discovery,
    trendProbe,
    observations: Object.freeze({ searchConsoleQueries: searchConsole.length, attentionRecords: attention.length, advertisingRecords: advertising.length, externalRevenueRecords: revenue.length }),
    factualWarrant: false as const,
    use: "assignment-selection-only" as const,
  });
  const brief: KeywordOpportunityBrief = Object.freeze({ ...briefBody, briefDigest: recordDigest(briefBody) });
  const internalMarketSettlement = await settleInternalServiceExchange({ dataDir, orderId: order.orderId, outcome: "brief-delivered", fulfillmentDigest: brief.briefDigest, settledAt: now, terms: TERMS });
  await appendDatedRecord({ dataRoot: dataDir, ledger: "audience-product", instant: now, record: Object.freeze({ kind: "koios.keyword-opportunity-brief", orderId: order.orderId, recordedAt: now, brief, internalMarketSettlement }) as JsonObject });
  await appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: now, act: "keyword-research.internal-service.settled", subject: order.orderId, data: { contract: KEYWORD_RESEARCH_CONTRACT, customer: KEYWORD_RESEARCH_CUSTOMER, provider: KEYWORD_RESEARCH_PROVIDER, briefDigest: brief.briefDigest, internalMarketSettlement, factualWarrant: false } });
  return response(activity, "Accept", { type: "KeywordOpportunityResearchSettlement", contract: KEYWORD_RESEARCH_CONTRACT, orderId: order.orderId, replayed: false, brief, internalMarketSettlement }, now);
}

export async function buyKeywordOpportunityResearch(input: Readonly<{
  orderId: string;
  now: string;
  dataDir: string;
  contentDir: string;
  configPath: string;
  trendProbe?: TrendProbeResult;
}>): Promise<Readonly<{ brief: KeywordOpportunityBrief; internalMarketSettlement: Readonly<JsonObject> }>> {
  const order = Object.freeze({
    "@context": CONTEXT,
    id: `urn:koios:keyword-research-order:${recordDigest({ orderId: input.orderId, now: input.now })}`,
    type: "Create",
    actor: KEYWORD_RESEARCH_CUSTOMER,
    target: KEYWORD_RESEARCH_PROVIDER,
    capability: KEYWORD_RESEARCH_CAPABILITY,
    object: Object.freeze({ type: "KeywordOpportunityResearchOrder", contract: KEYWORD_RESEARCH_CONTRACT, orderId: input.orderId }),
  });
  const settlement = await settleKeywordOpportunityResearchOrder(order, input);
  if (settlement["type"] !== "Accept" || !object(settlement["object"])) throw new Error(`Keyword Research refused Journalism Commissioning's purchase: ${JSON.stringify(settlement)}`);
  const body = settlement["object"];
  if (!object(body["brief"]) || body["brief"]["factualWarrant"] !== false || typeof body["brief"]["briefDigest"] !== "string" || !object(body["internalMarketSettlement"])) throw new Error("Keyword Research returned no digest-bound, non-warranting brief and receipt");
  return Object.freeze({ brief: body["brief"] as unknown as KeywordOpportunityBrief, internalMarketSettlement: body["internalMarketSettlement"] });
}
