#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { appendDatedRecord, readKoiosLedger, recordDigest, type JsonObject as LedgerObject, type KoiosLedger } from "./management/ledger.mts";

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
type JsonObject = { [key: string]: Json };

const CONTEXT = "https://www.w3.org/ns/activitystreams";
const VENTURE = "urn:ame:koios.news";
const LMT = "urn:ame:leader-movement-team";
const CONTRACT = "koios.news/venture-participation/v1";
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function object(value: unknown): value is JsonObject { return value !== null && typeof value === "object" && !Array.isArray(value); }
function digest(value: Json): string { return recordDigest(value); }
function contentId(value: Json): string { return digest(value); }
function response(type: "Offer" | "Accept" | "Question" | "Reject", source: JsonObject, payload: JsonObject): JsonObject {
  return { "@context": CONTEXT, id: contentId({ actor: VENTURE, type, inReplyTo: source["id"] ?? null, payload }), type, actor: VENTURE, target: source["actor"] ?? LMT, inReplyTo: source["id"] ?? "urn:activity:unidentified", object: payload };
}
function seriesLedger(series: string): KoiosLedger {
  if (series === "venture-value-events") return "revenue-cost";
  return "contract-events";
}
async function append(series: string, value: JsonObject, instant: string, root = ROOT): Promise<void> {
  await appendDatedRecord({
    dataRoot: join(root, "data"),
    ledger: seriesLedger(series),
    instant,
    record: Object.freeze({ ...value, recordSeries: series, recordedAt: instant }) as LedgerObject,
  });
}
function rows(type: string, settlementRoot = ROOT): JsonObject[] {
  return readKoiosLedger(join(settlementRoot, "data"), seriesLedger(type))
    .filter((record) => record["recordSeries"] === type) as JsonObject[];
}
function containsCredentialMaterial(value: Json): boolean {
  if (Array.isArray(value)) return value.some(containsCredentialMaterial);
  if (!object(value)) return false;
  return Object.entries(value).some(([key, child]) => /(?:api.?key|password|private.?key|credential|secret|token)/iu.test(key) || containsCredentialMaterial(child));
}
function intentProblems(intent: JsonObject | null, sourceActor: Json | undefined): string[] {
  const problems: string[] = [];
  if (!intent || intent["type"] !== "VentureParticipationIntent") problems.push("VentureParticipationIntent");
  if (intent?.["mode"] !== "join-existing") problems.push("mode(join-existing)");
  if (intent?.["venture"] !== VENTURE) problems.push(`venture(${VENTURE})`);
  if (intent?.["participant"] !== sourceActor) problems.push("participant(source Leader)");
  if (!['micro-enterprise-owner', 'at-risk-contributor'].includes(String(intent?.["requestedRole"] ?? ""))) problems.push("requestedRole");
  if (typeof intent?.["externalUserOutcome"] !== "string" || intent["externalUserOutcome"].length === 0) problems.push("externalUserOutcome");
  if (!Array.isArray(intent?.["revenueCounterparties"]) || intent["revenueCounterparties"].length === 0) problems.push("revenueCounterparties");
  const contributions = intent?.["contributions"];
  if (!Array.isArray(contributions) || contributions.length === 0) problems.push("contributions");
  else if (contributions.some((item) => !object(item) || item["valuation"] === 0 || item["valuation"] === "free")) problems.push("contribution-valuations(nonzero-or-unsettled)");
  const goal = intent?.["leadingGoal"];
  if (!object(goal) || typeof goal["period"] !== "string" || typeof goal["measure"] !== "string" || !object(goal["target"])) problems.push("leadingGoal(period,measure,target)");
  const downside = intent?.["downside"];
  if (!Array.isArray(downside) || downside.length === 0) problems.push("symmetric-downside");
  const distribution = intent?.["distribution"];
  if (!object(distribution) || distribution["beneficiary"] !== intent?.["participant"] || distribution["share"] !== 1) problems.push("founder-distribution(beneficiary,share=1)");
  if (intent && containsCredentialMaterial(intent)) problems.push("credential-material-forbidden");
  return [...new Set(problems)];
}
function activeOwner(root = ROOT): JsonObject | null {
  return rows("venture-participations", root).filter((item) => item["type"] === "KoiosVentureParticipationAgreement" && item["status"] === "active" && item["requestedRole"] === "micro-enterprise-owner").at(-1) ?? null;
}
async function solicitation(activity: JsonObject, instant: string, root = ROOT): Promise<JsonObject> {
  if (activity["@context"] !== CONTEXT || activity["type"] !== "Offer" || activity["actor"] !== LMT || activity["target"] !== VENTURE || !object(activity["object"]) || activity["object"]["type"] !== "VentureParticipationSolicitation") {
    return response("Reject", activity, { type: "Refusal", contract: CONTRACT, reason: "exact ActivityStreams Offer<VentureParticipationSolicitation> from LMT required" });
  }
  const sourceActivity = activity["object"]["sourceActivity"];
  const intent = object(activity["object"]["intent"]) ? activity["object"]["intent"] : null;
  if (!object(sourceActivity) || sourceActivity["actor"] !== intent?.["participant"]) return response("Reject", activity, { type: "Refusal", contract: CONTRACT, reason: "source Leader activity and participant do not agree" });
  const problems = intentProblems(intent, sourceActivity["actor"]);
  if (problems.length) return response("Question", activity, { type: "VentureParticipationTermsRequired", contract: CONTRACT, missing: problems });
  const incumbent = activeOwner(root);
  if (intent!["requestedRole"] === "micro-enterprise-owner" && incumbent && incumbent["participant"] !== intent!["participant"]) return response("Question", activity, { type: "MicroEnterpriseOwnerRoleOccupied", contract: CONTRACT, incumbent: incumbent["id"] ?? "protected", requiredMove: "qiangdan-and-mutual-selection-successor" });
  const requestDigest = digest(intent!);
  const payload: JsonObject = {
    type: "ExecutableParticipationOffer", contract: CONTRACT, sourceActivity: sourceActivity["id"] ?? "urn:activity:unidentified", requestDigest,
    intentSignature: "urn:service-intent:join-koios-as-at-risk-value-added-participant",
    operation: "invoke-participation", effects: ["provider-local-write"], requirements: [{ type: "ResourceGrant", effect: "provider-local-write" }],
    scope: { venture: VENTURE, participant: intent!["participant"]!, requestedRole: intent!["requestedRole"]!, internalServiceCustomer: false },
    terms: {
      externalUserOutcome: intent!["externalUserOutcome"]!, revenueCounterparties: intent!["revenueCounterparties"]!, leadingGoal: intent!["leadingGoal"]!, contributions: intent!["contributions"]!, downside: intent!["downside"]!, distribution: intent!["distribution"]!,
      profitRecognition: "only-after-external-revenue-and-all-attributable-costs-settle", internalMetabolismSoldToParticipant: false,
    },
  };
  const offer = response("Offer", activity, payload); await append("venture-participation-market-events", { type: "KoiosVentureParticipationOffer", id: offer["id"]!, participant: intent!["participant"]!, requestDigest, sourceActivity: sourceActivity["id"] ?? null, offeredAt: instant }, instant, root); return offer;
}
async function invocation(activity: JsonObject, instant: string, root = ROOT): Promise<JsonObject> {
  if (activity["@context"] !== CONTEXT || activity["type"] !== "Accept" || activity["actor"] !== LMT || activity["target"] !== VENTURE || !object(activity["object"]) || activity["object"]["type"] !== "VentureParticipationContract") return response("Reject", activity, { type: "Refusal", contract: CONTRACT, reason: "exact LMT Accept<VentureParticipationContract> required" });
  const contract = activity["object"]; const offer = contract["offer"]; const capability = contract["capability"];
  if (!object(offer) || offer["actor"] !== VENTURE || !object(offer["object"]) || offer["object"]["type"] !== "ExecutableParticipationOffer" || offer["object"]["contract"] !== CONTRACT) return response("Reject", activity, { type: "Refusal", contract: CONTRACT, reason: "provider-authored participation offer required" });
  const offerObject = offer["object"];
  if (!object(capability) || capability["holder"] !== VENTURE || capability["invocationTarget"] !== VENTURE || capability["parentOffer"] !== offer["id"] || !Array.isArray(capability["allowedActions"]) || !capability["allowedActions"].includes("invoke-participation") || !capability["allowedActions"].includes("provider-local-write")) return response("Reject", activity, { type: "Refusal", contract: CONTRACT, reason: "attenuated provider-local participation capability required" });
  const terms = offerObject["terms"]; const scope = offerObject["scope"];
  if (!object(terms) || !object(scope) || scope["venture"] !== VENTURE || typeof offerObject["requestDigest"] !== "string") return response("Reject", activity, { type: "Refusal", contract: CONTRACT, reason: "accepted participation terms are incomplete" });
  const requestDigest = offerObject["requestDigest"];
  const existing = rows("venture-participations", root).find((item) => item["requestDigest"] === requestDigest && item["status"] === "active");
  if (existing) return response("Accept", activity, { type: "KoiosVentureParticipationResult", contract: CONTRACT, agreement: existing["id"]!, idempotent: true, profitStatus: existing["profitStatus"]! });
  const agreementBody: JsonObject = {
    type: "KoiosVentureParticipationAgreement", venture: VENTURE, participant: scope["participant"]!, requestedRole: scope["requestedRole"]!, status: "active", requestDigest, sourceActivity: offerObject["sourceActivity"]!,
    externalUserOutcome: terms["externalUserOutcome"]!, revenueCounterparties: terms["revenueCounterparties"]!, leadingGoal: terms["leadingGoal"]!, contributions: terms["contributions"]!, downside: terms["downside"]!, distribution: terms["distribution"]!,
    threeRights: scope["requestedRole"] === "micro-enterprise-owner" ? ["decision", "personnel", "distribution"] : [],
    participantIsCustomer: false, internalMetabolismIsProduct: false, profitStatus: "unproven-no-settled-external-value", formedAt: instant,
  };
  const agreementId = contentId(agreementBody);
  const agreement: JsonObject = { id: agreementId, ...agreementBody }; await append("venture-participations", agreement, instant, root);
  await append("venture-value-events", { type: "KoiosVentureValueOpening", id: contentId({ agreement: agreementId, instant }), agreement: agreementId, externalRevenue: "unobserved", attributableCosts: "unsettled-not-zero", valueAddedPool: "not-formed", distributableValue: 0, participantPayment: 0, recordedAt: instant }, instant, root);
  return response("Accept", activity, { type: "KoiosVentureParticipationResult", contract: CONTRACT, agreement: agreementId, venture: VENTURE, participant: agreement["participant"]!, requestedRole: agreement["requestedRole"]!, threeRights: agreement["threeRights"]!, profitStatus: agreement["profitStatus"]!, nextEconomicEvent: "externally-settled-revenue-and-attributable-cost-receipts" });
}

export async function runVentureParticipation(activity: JsonObject, operation: string, instant: string, root = ROOT): Promise<JsonObject> {
  if (operation === "solicit-participation") return await solicitation(activity, instant, root);
  if (operation === "invoke-participation") return await invocation(activity, instant, root);
  return response("Reject", activity, { type: "Refusal", contract: CONTRACT, reason: `unknown operation ${operation}` });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const operationIndex = process.argv.indexOf("--operation"); const nowIndex = process.argv.indexOf("--now");
    const operation = operationIndex >= 0 ? process.argv[operationIndex + 1]! : "solicit-participation";
    const instant = nowIndex >= 0 ? process.argv[nowIndex + 1]! : new Date().toISOString();
    const activity = JSON.parse(readFileSync(0, "utf8")) as JsonObject; const result = await runVentureParticipation(activity, operation, instant);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`); if (result["type"] === "Reject") process.exitCode = 2;
  } catch (error) { process.stderr.write(`koios-venture-participation: ${error instanceof Error ? error.message : String(error)}\n`); process.exitCode = 1; }
}
