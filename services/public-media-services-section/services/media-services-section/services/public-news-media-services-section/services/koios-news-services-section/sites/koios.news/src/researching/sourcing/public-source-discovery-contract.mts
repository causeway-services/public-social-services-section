// Journalism Commissioning's customer-side treaty for public-source
// discovery. Search and news indexes propose URLs; they do not retrieve,
// admit, or warrant them. Those are subsequent purchases with separate receipts.

import { spawnSync } from "node:child_process";
import { constants } from "node:fs";
import { accessSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { appendDatedRecord, appendKoiosAct, readKoiosLedger, recordDigest, type JsonObject } from "../../management/ledger.mts";

const CONTEXT = "https://www.w3.org/ns/activitystreams";
export const SOURCE_DISCOVERY_CUSTOMER = "urn:micro-enterprise:koios.news:journalism-commissioning";
const PROVIDER = "urn:ame:web-source-acquisition";
export const SOURCE_DISCOVERY_CONTRACT = "ni:///sha-256;otqx16XpWh1j0spvQvtPTgcKzL_cNWrQFF3qk3U8Ii0";
const SITE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const DEFAULT_PROVIDER_ROOT = resolve(SITE_ROOT, "../../services/web-source-acquisition");

type JsonRecord = Record<string, unknown>;

export class PublicSourceDiscoveryRefusal extends Error {
  readonly code: string;
  readonly retryable: boolean;

  constructor(code: string, message: string, retryable = false) {
    super(message);
    this.name = "PublicSourceDiscoveryRefusal";
    this.code = code;
    this.retryable = retryable;
  }
}

function record(value: unknown, label: string): JsonRecord {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be a record`);
  return value as JsonRecord;
}

/** Search results are leads, not reportable sources by default. The text
 * newsroom cannot commission a story from navigation indexes, stock-photo
 * captions, or video/social surfaces that the retrieval treaty cannot turn
 * into a substantive source document. */
export function isReportablePublicSourceCandidate(value: Readonly<JsonRecord>): boolean {
  const rawUrl = value["url"];
  const rawTitle = value["title"];
  if (typeof rawUrl !== "string" || typeof rawTitle !== "string") return false;
  let url: URL;
  try { url = new URL(rawUrl); }
  catch { return false; }
  const host = url.hostname.toLowerCase().replace(/^www\./u, "");
  const path = url.pathname.toLowerCase();
  if (/(?:^|\.)(?:gettyimages\.[a-z.]+|instagram\.com|tiktok\.com|youtube\.com|youtu\.be)$/u.test(host)) return false;
  if (/(?:^|\/)(?:author|authors|category|detail\/news-photo|gallery|galleries|search|tag|tags|topic|topics)(?:\/|$)/u.test(path)) return false;
  if (/\b(?:celebrity news|latest news|breaking stories and comment|news photos?|people search|profile page)\b/iu.test(rawTitle)) return false;
  return rawTitle.trim().length >= 12;
}

function providerEndpoint(root: string, operation: "solicit-source-discovery" | "invoke-source-discovery"): string {
  const packageJson = record(JSON.parse(readFileSync(join(root, "package.json"), "utf8")), "Web Source package");
  const bins = record(packageJson["bin"], "Web Source operation catalog");
  const relative = bins[operation];
  if (typeof relative !== "string" || relative.trim() === "") throw new Error(`Web Source does not advertise ${operation}`);
  const endpoint = resolve(root, relative);
  if (!endpoint.startsWith(`${root}/`)) throw new Error(`Web Source ${operation} endpoint escapes its membrane`);
  accessSync(endpoint, constants.R_OK);
  return endpoint;
}

function invokeProvider(root: string, operation: "solicit-source-discovery" | "invoke-source-discovery", activity: JsonRecord, instant: string): JsonRecord {
  const execution = spawnSync(process.execPath, [providerEndpoint(root, operation), operation, instant], {
    cwd: root,
    input: JSON.stringify(activity),
    encoding: "utf8",
    timeout: 100_000,
    maxBuffer: 16 * 1024 * 1024,
  });
  if (execution.error !== undefined) throw execution.error;
  const line = execution.stdout.trim().split("\n").at(-1);
  if (line === undefined || line === "") throw new Error(`Web Source returned no typed ${operation} result: ${execution.stderr.trim()}`);
  const result = record(JSON.parse(line), `Web Source ${operation} result`);
  if (execution.status !== 0 && result["type"] !== "Reject") throw new Error(`Web Source ${operation} failed without typed refusal: ${execution.stderr.trim()}`);
  return result;
}

function verifyDelivery(value: JsonRecord): void {
  const candidates = Array.isArray(value["candidates"]) ? value["candidates"] : undefined;
  const searchQueries = Array.isArray(value["searchQueries"]) ? value["searchQueries"] : undefined;
  const lead = record(value["lead"], "source discovery lead");
  const resourceAccount = record(value["resourceAccount"], "source discovery resource account");
  const carrier = value["carrier"];
  if (value["type"] !== "PublicSourceDiscoveryDelivery" || value["purpose"] !== "journalistic-source-discovery" || !["google-search-grounding", "groq-compound-web-search", "gdelt-doc-api"].includes(String(carrier ?? "")) || value["factualWarrant"] !== false || value["customerTerritoryMutation"] !== false || candidates === undefined || searchQueries === undefined || typeof value["deliveryDigest"] !== "string") throw new Error("source discovery delivery does not carry the required bounded, non-warranting result");
  for (const candidate of candidates) {
    const source = record(candidate, "source discovery candidate");
    const custody = source["custody"];
    const lawfulCustody = carrier === "google-search-grounding"
      ? custody === "google-search-grounding-metadata"
      : carrier === "groq-compound-web-search"
        ? custody === "groq-executed-tool-search-result"
        : custody === "gdelt-doc-api-article-list";
    if (source["type"] !== "PublicSourceDiscoveryCandidate" || typeof source["url"] !== "string" || !lawfulCustody) throw new Error("source discovery candidate is not bound to its declared search carrier");
  }
  const core = Object.freeze({
    type: value["type"],
    purpose: value["purpose"],
    lead,
    candidates,
    searchQueries,
    carrier,
    model: value["model"],
    providerResponseDigest: value["providerResponseDigest"],
    ...(typeof value["researchNoteDigest"] === "string" ? { researchNoteDigest: value["researchNoteDigest"] } : {}),
    ...(typeof value["fallbackFrom"] === "string" ? { fallbackFrom: value["fallbackFrom"] } : {}),
    factualWarrant: value["factualWarrant"],
    customerTerritoryMutation: value["customerTerritoryMutation"],
    discoveredAt: value["discoveredAt"],
    resourceAccount,
  });
  if (recordDigest(core) !== value["deliveryDigest"]) throw new Error("source discovery delivery digest does not bind its exact result");
}

export async function procurePublicSourceDiscovery(input: Readonly<{
  requestId: string;
  lead: Readonly<{ title: string; url?: string; published?: string; summary?: string }>;
  queryHints?: readonly string[];
  excludedUrls?: readonly string[];
  maximumCandidates?: number;
  now: string;
  dataDir: string;
  providerRoot?: string;
}>): Promise<Readonly<{ delivery: Readonly<JsonObject>; candidates: readonly Readonly<JsonObject>[]; candidateUrls: readonly string[] }>> {
  const demand = Object.freeze({
    type: "PublicSourceDiscoveryDemand",
    purpose: "journalistic-source-discovery",
    lead: Object.freeze(input.lead),
    queryHints: Object.freeze([...(input.queryHints ?? [])]),
    excludedUrls: Object.freeze([...(input.excludedUrls ?? [])]),
    ceilings: Object.freeze({ maximumCandidates: input.maximumCandidates ?? 6 }),
  });
  const demandDigest = recordDigest(demand);
  const nowMilliseconds = Date.parse(input.now);
  const reusable = [...readKoiosLedger(input.dataDir, "source-claims")].reverse().find((entry) => {
    if (entry["kind"] !== "koios.public-source-discovery" || entry["demandDigest"] !== demandDigest || typeof entry["at"] !== "string") return false;
    const age = nowMilliseconds - Date.parse(entry["at"]);
    return Number.isFinite(age) && age >= 0 && age <= 6 * 60 * 60_000;
  });
  if (reusable !== undefined) {
    const accepted = record(reusable["delivery"], "recalled Public Source Discovery delivery");
    const delivery = record(accepted["object"], "recalled PublicSourceDiscoveryDelivery");
    verifyDelivery(delivery);
    const offeredCandidates = (delivery["candidates"] as JsonRecord[]).map((candidate) => record(candidate, "recalled source discovery candidate"));
    const candidates = offeredCandidates.filter(isReportablePublicSourceCandidate);
    const candidateUrls = Object.freeze(candidates.map((candidate) => String(candidate["url"])));
    await appendKoiosAct({ dataRoot: input.dataDir, ledger: "contract-events", instant: input.now, act: "source-discovery.public-web.recalled", subject: input.requestId, data: { provider: "web-source-acquisition", contract: SOURCE_DISCOVERY_CONTRACT, originalRequestId: reusable["requestId"], deliveryDigest: delivery["deliveryDigest"], candidateCount: candidates.length, marginalProviderRequests: 0 } });
    return Object.freeze({ delivery: accepted as JsonObject, candidates: Object.freeze(candidates as JsonObject[]), candidateUrls });
  }
  const sourceActivity = Object.freeze({ "@context": CONTEXT, type: "Create", actor: SOURCE_DISCOVERY_CUSTOMER, object: demand });
  const solicitation = Object.freeze({ "@context": CONTEXT, type: "Offer", actor: SOURCE_DISCOVERY_CUSTOMER, target: PROVIDER, object: Object.freeze({ type: "ServiceSolicitation", sourceActivity }) });
  const providerRoot = resolve(input.providerRoot ?? process.env["KOIOS_WEB_SOURCE_ACQUISITION_ROOT"] ?? DEFAULT_PROVIDER_ROOT);
  const offer = invokeProvider(providerRoot, "solicit-source-discovery", solicitation as unknown as JsonRecord, input.now);
  if (offer["type"] !== "Offer" || offer["actor"] !== PROVIDER) throw new Error(`Public Source Discovery solicitation refused: ${String(offer["summary"] ?? offer["code"] ?? "unknown refusal")}`);
  const invocation = Object.freeze({ "@context": CONTEXT, type: "Accept", actor: SOURCE_DISCOVERY_CUSTOMER, target: PROVIDER, object: Object.freeze({ type: "ServiceContract", offer }) });
  const accepted = invokeProvider(providerRoot, "invoke-source-discovery", invocation as unknown as JsonRecord, input.now);
  if (accepted["type"] !== "Accept" || accepted["actor"] !== PROVIDER) {
    const result = accepted["object"] !== null && typeof accepted["object"] === "object" && !Array.isArray(accepted["object"]) ? accepted["object"] as JsonRecord : accepted;
    const code = String(result["code"] ?? accepted["code"] ?? "unknown");
    throw new PublicSourceDiscoveryRefusal(code, `Public Source Discovery invocation refused (${code}): ${String(result["reason"] ?? accepted["summary"] ?? "provider refusal")}`, result["retryable"] === true);
  }
  const delivery = record(accepted["object"], "PublicSourceDiscoveryDelivery");
  verifyDelivery(delivery);
  const providerExchange = record(delivery["providerExchange"], "Public Source Discovery provider exchange");
  const offeredCandidates = (delivery["candidates"] as JsonRecord[]).map((candidate) => record(candidate, "source discovery candidate"));
  const candidates = offeredCandidates.filter(isReportablePublicSourceCandidate);
  const candidateUrls = Object.freeze(candidates.map((candidate) => String(candidate["url"])));
  await appendDatedRecord({ dataRoot: input.dataDir, ledger: "source-claims", instant: input.now, record: Object.freeze({ kind: "koios.public-source-discovery", at: input.now, requestId: input.requestId, contract: SOURCE_DISCOVERY_CONTRACT, demandDigest, delivery: accepted, deliveryDigest: delivery["deliveryDigest"], providerExchange }) as JsonObject });
  await appendKoiosAct({ dataRoot: input.dataDir, ledger: "contract-events", instant: input.now, act: "source-discovery.public-web.settled", subject: input.requestId, data: { provider: "web-source-acquisition", contract: SOURCE_DISCOVERY_CONTRACT, carrier: delivery["carrier"], offeredCandidateCount: offeredCandidates.length, candidateCount: candidates.length, refusedNonArticleCandidateCount: offeredCandidates.length - candidates.length, deliveryDigest: delivery["deliveryDigest"] } });
  await appendKoiosAct({ dataRoot: input.dataDir, ledger: "provider-usage", instant: input.now, act: "provider.service.consumed", subject: String(providerExchange["exchangeId"] ?? delivery["deliveryDigest"]), data: { purpose: `discover-public-sources:${input.requestId}`, provider: "web-source-acquisition", service: "public-source-discovery", carrier: delivery["carrier"], consideration: providerExchange["consideration"] ?? { amount: 1, unit: "bounded-public-source-discovery-attempt", monetaryClaim: false }, resourceAccount: delivery["resourceAccount"], deliveryDigest: delivery["deliveryDigest"] } });
  return Object.freeze({ delivery: accepted as JsonObject, candidates: Object.freeze(candidates as JsonObject[]), candidateUrls });
}
