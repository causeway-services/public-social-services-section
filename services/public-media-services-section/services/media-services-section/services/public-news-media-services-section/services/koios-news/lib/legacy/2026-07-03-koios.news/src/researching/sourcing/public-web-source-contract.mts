// Koios customer-side treaty for bounded public-Web source text. The provider
// retrieves only publication-declared URLs and returns values; Koios decides
// whether those values enter an admissible research packet.

import { spawnSync } from "node:child_process";
import { constants } from "node:fs";
import { accessSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { appendDatedRecord, appendKoiosAct, readKoiosLedger, recordDigest, type JsonObject } from "../../management/ledger.mjs";

const CONTEXT = "https://www.w3.org/ns/activitystreams";
const CUSTOMER = "https://koios.news/activitypub/actor";
const PROVIDER = "urn:ame:web-source-acquisition";
const CONTRACT = "ni:///sha-256;I2k7lfS_yS2236-b3gijN3QgQz9W0KkPgbFEDEoNZ5c";
const SITE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const DEFAULT_PROVIDER_ROOT = resolve(SITE_ROOT, "../../services/web-source-acquisition");
const THIN_SOURCE_CHARACTER_FLOOR = 1_800;

type JsonRecord = Record<string, unknown>;

function record(value: unknown, label: string): JsonRecord {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be a record`);
  return value as JsonRecord;
}

function providerEndpoint(root: string, operation: "solicit-service" | "invoke-service"): string {
  const packageJson = record(JSON.parse(readFileSync(join(root, "package.json"), "utf8")), "Web Source package");
  const bins = record(packageJson["bin"], "Web Source operation catalog");
  const relative = bins[operation];
  if (typeof relative !== "string" || relative.trim() === "") throw new Error(`Web Source does not advertise ${operation}`);
  const endpoint = resolve(root, relative);
  if (!endpoint.startsWith(`${root}/`)) throw new Error(`Web Source ${operation} endpoint escapes its membrane`);
  accessSync(endpoint, constants.R_OK);
  return endpoint;
}

function invokeProvider(root: string, operation: "solicit-service" | "invoke-service", activity: JsonRecord, instant: string): JsonRecord {
  const execution = spawnSync(process.execPath, [providerEndpoint(root, operation), operation, instant], {
    cwd: root,
    input: JSON.stringify(activity),
    encoding: "utf8",
    timeout: 120_000,
    maxBuffer: 128 * 1024 * 1024,
  });
  if (execution.error !== undefined) throw execution.error;
  const line = execution.stdout.trim().split("\n").at(-1);
  if (line === undefined || line === "") throw new Error(`Web Source returned no typed ${operation} result: ${execution.stderr.trim()}`);
  const result = record(JSON.parse(line), `Web Source ${operation} result`);
  if (execution.status !== 0 && result["type"] !== "Reject") throw new Error(`Web Source ${operation} failed without typed refusal: ${execution.stderr.trim()}`);
  return result;
}

function claim(bundle: JsonRecord, predicate: string): string | undefined {
  for (const raw of Array.isArray(bundle["claims"]) ? bundle["claims"] : []) {
    if (raw === null || typeof raw !== "object" || Array.isArray(raw)) continue;
    const proposition = (raw as JsonRecord)["proposition"];
    if (proposition === null || typeof proposition !== "object" || Array.isArray(proposition)) continue;
    const value = proposition as JsonRecord;
    if (value["predicate"] === predicate && typeof value["object"] === "string") return value["object"] as string;
  }
  return undefined;
}

export function sourceUrlsNeedingPublicText(currentEvidence: Readonly<JsonObject> | undefined, sourceUrls: readonly string[], characterFloor = THIN_SOURCE_CHARACTER_FLOOR): readonly string[] {
  if (currentEvidence === undefined) return Object.freeze([...new Set(sourceUrls)]);
  const delivery = record(currentEvidence["object"], "Newscable SourceBundleDelivery");
  const summaries = new Map<string, string>();
  for (const raw of Array.isArray(delivery["bundles"]) ? delivery["bundles"] : []) {
    if (raw === null || typeof raw !== "object" || Array.isArray(raw)) continue;
    const bundle = (raw as JsonRecord)["bundle"];
    if (bundle === null || typeof bundle !== "object" || Array.isArray(bundle)) continue;
    const bundleRecord = bundle as JsonRecord;
    const url = claim(bundleRecord, "url");
    if (url !== undefined) summaries.set(url, claim(bundleRecord, "summary") ?? "");
  }
  return Object.freeze([...new Set(sourceUrls.filter((url) => {
    const summary = summaries.get(url) ?? "";
    const sentenceCount = (summary.match(/[.!?](?:\s|$)/gu) ?? []).length;
    return summary.length < characterFloor || sentenceCount < 3;
  }))]);
}

export async function procurePublicWebSourceText(input: Readonly<{
  assignmentId: string;
  sourceUrls: readonly string[];
  currentEvidence?: Readonly<JsonObject>;
  now: string;
  dataDir: string;
  providerRoot?: string;
}>): Promise<Readonly<JsonObject> | undefined> {
  const urls = sourceUrlsNeedingPublicText(input.currentEvidence, input.sourceUrls);
  if (urls.length === 0) return undefined;
  const demand = Object.freeze({
    type: "PublicWebSourceAcquisitionDemand",
    purpose: "journalistic-source-research",
    urls,
    ceilings: Object.freeze({ maximumSources: 6, maximumBytesPerSource: 2_000_000, maximumTextCharacters: 50_000 }),
  });
  const demandDigest = recordDigest(demand);
  const nowMilliseconds = Date.parse(input.now);
  const reusable = [...readKoiosLedger(input.dataDir, "source-claims")].reverse().find((entry) => {
    if (entry["kind"] !== "koios.public-web-source-acquisition" || typeof entry["at"] !== "string") return false;
    const sameDemand = entry["demandDigest"] === demandDigest
      || Array.isArray(entry["requestedUrls"]) && recordDigest({ type: "PublicWebSourceAcquisitionDemand", purpose: "journalistic-source-research", urls: entry["requestedUrls"], ceilings: demand.ceilings }) === demandDigest;
    const age = nowMilliseconds - Date.parse(entry["at"]);
    return sameDemand && Number.isFinite(age) && age >= 0 && age <= 6 * 60 * 60_000;
  });
  if (reusable !== undefined) {
    const accepted = record(reusable["delivery"], "recalled PublicWebSourceDelivery");
    const delivery = record(accepted["object"], "recalled PublicWebSourceDelivery object");
    const results = Array.isArray(delivery["results"]) ? delivery["results"] : [];
    const obstructions = Array.isArray(delivery["obstructions"]) ? delivery["obstructions"] : [];
    if (accepted["type"] !== "Accept" || accepted["actor"] !== PROVIDER || delivery["type"] !== "PublicWebSourceDelivery" || recordDigest({ results, obstructions }) !== delivery["deliveryDigest"]) throw new Error("recalled Web Source delivery no longer binds its results and obstructions");
    await appendKoiosAct({ dataRoot: input.dataDir, ledger: "contract-events", instant: input.now, act: "source-acquisition.public-web.recalled", subject: input.assignmentId, data: { provider: "web-source-acquisition", contract: CONTRACT, originalAssignmentId: reusable["assignmentId"], deliveryDigest: delivery["deliveryDigest"], acquiredSourceCount: results.length, marginalNetworkRequests: 0 } });
    return Object.freeze(accepted as JsonObject);
  }
  const sourceActivity = Object.freeze({ "@context": CONTEXT, type: "Create", actor: CUSTOMER, object: demand });
  const solicitation = Object.freeze({ "@context": CONTEXT, type: "Offer", actor: CUSTOMER, target: PROVIDER, object: Object.freeze({ type: "ServiceSolicitation", sourceActivity }) });
  const providerRoot = resolve(input.providerRoot ?? process.env["KOIOS_WEB_SOURCE_ACQUISITION_ROOT"] ?? DEFAULT_PROVIDER_ROOT);
  const offer = invokeProvider(providerRoot, "solicit-service", solicitation as unknown as JsonRecord, input.now);
  if (offer["type"] !== "Offer" || offer["actor"] !== PROVIDER) throw new Error(`Web Source solicitation refused: ${String(offer["summary"] ?? offer["code"] ?? "unknown refusal")}`);
  const invocation = Object.freeze({ "@context": CONTEXT, type: "Accept", actor: CUSTOMER, target: PROVIDER, object: Object.freeze({ type: "ServiceContract", offer }) });
  const accepted = invokeProvider(providerRoot, "invoke-service", invocation as unknown as JsonRecord, input.now);
  if (accepted["type"] !== "Accept" || accepted["actor"] !== PROVIDER) throw new Error(`Web Source invocation refused: ${String(accepted["summary"] ?? accepted["code"] ?? "unknown refusal")}`);
  const delivery = record(accepted["object"], "PublicWebSourceDelivery");
  const results = Array.isArray(delivery["results"]) ? delivery["results"] : [];
  const obstructions = Array.isArray(delivery["obstructions"]) ? delivery["obstructions"] : [];
  if (delivery["type"] !== "PublicWebSourceDelivery" || recordDigest({ results, obstructions }) !== delivery["deliveryDigest"]) throw new Error("Web Source delivery digest does not bind its results and obstructions");
  const providerExchange = record(delivery["providerExchange"], "Web Source provider exchange");
  await appendDatedRecord({
    dataRoot: input.dataDir,
    ledger: "source-claims",
    instant: input.now,
    record: Object.freeze({ kind: "koios.public-web-source-acquisition", at: input.now, assignmentId: input.assignmentId, contract: CONTRACT, requestedUrls: urls, demandDigest, delivery: accepted, deliveryDigest: delivery["deliveryDigest"], providerExchange }) as JsonObject,
  });
  await appendKoiosAct({ dataRoot: input.dataDir, ledger: "contract-events", instant: input.now, act: "source-acquisition.public-web.settled", subject: input.assignmentId, data: { provider: "web-source-acquisition", contract: CONTRACT, requestedSourceCount: urls.length, acquiredSourceCount: results.length, obstructionCount: obstructions.length, deliveryDigest: delivery["deliveryDigest"] } });
  await appendKoiosAct({ dataRoot: input.dataDir, ledger: "provider-usage", instant: input.now, act: "provider.service.consumed", subject: String(providerExchange["exchangeId"] ?? delivery["deliveryDigest"]), data: { purpose: `acquire-public-source-text:${input.assignmentId}`, provider: "web-source-acquisition", service: "public-source-text", price: providerExchange["price"] ?? { amount: 0, currency: "USD" }, resourceAccount: delivery["resourceAccount"] ?? null, deliveryDigest: delivery["deliveryDigest"] } });
  return Object.freeze(accepted as JsonObject);
}
