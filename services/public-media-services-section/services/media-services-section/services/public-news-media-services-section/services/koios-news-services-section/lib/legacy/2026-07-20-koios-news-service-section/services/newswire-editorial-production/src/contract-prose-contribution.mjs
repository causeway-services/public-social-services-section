#!/usr/bin/env node

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const CONTEXT = "https://www.w3.org/ns/activitystreams";
export const ACTOR = "urn:ame:newswire-editorial-production";
export const CONTRACT = "newswire-editorial-production/prose-contribution/v1";
const LISS_ACTOR = "urn:ame:logical-inference-service-section";
const LISS_CONTRACT = "liss-inference-service";
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_LISS_ROOT = resolve(ROOT, "../../../../../red-cup-engineering/services/logical-inference-service-section");
const SIBLING_LISS_ROOT = resolve(ROOT, "../logical-inference-service-section");
const FORBIDDEN_DEMAND_KEYS = new Set(["root", "roots", "path", "paths", "outputPath", "manuscriptPath", "contentDir", "dataDir", "customerFilesystem"]);

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value !== null && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}
export function digest(value) { return `sha256:${createHash("sha256").update(canonical(value)).digest("hex")}`; }
function contentId(value) { return `urn:${digest(value)}`; }
function validInstant(value) { return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/u.test(value) && !Number.isNaN(Date.parse(value)); }
function isRecord(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }
function dataRoot() { return resolve(process.env["NEWSWIRE_EDITORIAL_PRODUCTION_DATA_ROOT"] ?? join(ROOT, "data")); }
function append(kind, value, instant) {
  const day = instant.slice(0, 10); const [year, month, date] = day.split("-");
  const path = join(dataRoot(), "events", year, month, date, `${day}-newswire-editorial-production-events.jsonl`);
  mkdirSync(dirname(path), { recursive: true }); appendFileSync(path, `${JSON.stringify({ kind, ...value, recordedAt: instant })}\n`, "utf8");
}
function response(type, source, object, instant) {
  const body = { actor: ACTOR, type, target: source?.actor ?? "urn:actor:unknown", inReplyTo: source?.id ?? null, object };
  return Object.freeze({ "@context": CONTEXT, id: contentId(body), ...body, published: instant });
}
function refusal(source, code, reason, instant, details = {}) {
  const result = response("Reject", source, Object.freeze({ type: "Refusal", contract: CONTRACT, code, reason, ...details }), instant);
  append("provider.refusal", { code, reason, activityDigest: digest(source ?? null), responseDigest: digest(result) }, instant);
  return result;
}
function findForbiddenKey(value, prefix = "demand") {
  if (Array.isArray(value)) return value.flatMap((item, index) => findForbiddenKey(item, `${prefix}[${index}]`)).at(0);
  if (!isRecord(value)) return undefined;
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_DEMAND_KEYS.has(key)) return `${prefix}.${key}`;
    const nested = findForbiddenKey(child, `${prefix}.${key}`); if (nested !== undefined) return nested;
  }
  return undefined;
}
function demandFrom(activity) {
  const sourceActivity = activity?.object?.sourceActivity; const demand = sourceActivity?.object;
  return sourceActivity?.type === "Create" && demand?.type === "ProseContributionDemand" ? { sourceActivity, demand } : undefined;
}
function validateDemand(demand) {
  const failures = [];
  const forbidden = findForbiddenKey(demand); if (forbidden !== undefined) failures.push(`customer territory authority is inadmissible at ${forbidden}`);
  if (typeof demand?.purpose !== "string" || demand.purpose.trim() === "") failures.push("purpose");
  if (typeof demand?.assignment?.id !== "string" || typeof demand?.assignment?.digest !== "string") failures.push("assignment identity and digest");
  for (const field of ["licensedEditorialStateDigest", "researchPacketDigest", "writingPolicyDigest", "stylePolicyDigest"]) if (typeof demand?.authorities?.[field] !== "string" || !demand.authorities[field].startsWith("sha256:")) failures.push(`authorities.${field}`);
  if (typeof demand?.commission?.prompt !== "string" || demand.commission.prompt.trim() === "") failures.push("commission.prompt");
  if (demand?.commission?.promptDigest !== digest(demand?.commission?.prompt)) failures.push("commission.promptDigest");
  if (!Array.isArray(demand?.requiredSourceUrls) || demand.requiredSourceUrls.length === 0 || demand.requiredSourceUrls.some((url) => typeof url !== "string" || !/^https?:\/\//u.test(url))) failures.push("requiredSourceUrls");
  const route = demand?.route;
  if (!isRecord(route) || !["dry-run", "live"].includes(route.executionMode)) failures.push("route.executionMode");
  if (!Array.isArray(route?.admissibleTiers) || route.admissibleTiers.length === 0) failures.push("route.admissibleTiers");
  if (!isRecord(route?.models)) failures.push("route.models");
  if (!Number.isInteger(route?.maxTokens) || route.maxTokens < 1) failures.push("route.maxTokens");
  if (!Number.isInteger(route?.minimumCharacters) || route.minimumCharacters < 1) failures.push("route.minimumCharacters");
  return [...new Set(failures)];
}
function lissRoot() { return resolve(process.env["NEWSWIRE_LISS_ROOT"] ?? (existsSync(join(SIBLING_LISS_ROOT, "package.json")) ? SIBLING_LISS_ROOT : DEFAULT_LISS_ROOT)); }
function lissSocketPath() {
  const runtime = process.env["XDG_RUNTIME_DIR"] ?? (typeof process.getuid === "function" ? `/run/user/${process.getuid()}` : join(process.env["HOME"] ?? "/tmp", ".local", "run"));
  return resolve(process.env["NEWSWIRE_LISS_SOCKET"] ?? process.env["LISS_INFERENCE_SOCKET"] ?? join(runtime, "liss-inference", "inference.sock"));
}
function lissCarrier() { return existsSync(lissSocketPath()) ? "private-socket" : "direct-compatibility"; }
function endpoint(root, operation) {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")); const path = pkg.bin?.[operation];
  if (typeof path !== "string") throw new Error(`LISS does not advertise ${operation}`); return resolve(root, path);
}
function invokeLiss(operation, activity, instant, timeout) {
  const root = lissRoot(); const socketPath = lissSocketPath();
  if (existsSync(socketPath)) {
    const requester = endpoint(root, "request-inference-socket");
    const execution = spawnSync(process.execPath, [requester, "--socket", socketPath, "--timeout-ms", String(timeout)], { cwd: root, input: `${JSON.stringify(activity)}\n`, encoding: "utf8", timeout: timeout + 5_000, env: process.env });
    const line = execution.stdout.trim().split("\n").filter(Boolean).at(-1);
    if (line === undefined) throw new Error(execution.error?.message || execution.stderr || `LISS socket ${operation} exited ${execution.status}`);
    return JSON.parse(line);
  }
  const temp = mkdtempSync(join(tmpdir(), "newswire-liss-"));
  const inputPath = join(temp, "input.json"); const outputPath = join(temp, "output.json");
  try {
    writeFileSync(inputPath, `${JSON.stringify(activity)}\n`, "utf8");
    const execution = spawnSync(process.execPath, [endpoint(root, operation), "--operation", operation, "--now", instant, "--input-file", inputPath, "--output-file", outputPath], { cwd: root, encoding: "utf8", timeout, env: process.env });
    let output; try { output = JSON.parse(readFileSync(outputPath, "utf8")); } catch { throw new Error(execution.error?.message || execution.stderr || execution.stdout || `LISS ${operation} exited ${execution.status}`); }
    return output;
  } finally { rmSync(temp, { recursive: true, force: true }); }
}
function routedRequest(demand) {
  return Object.freeze({
    type: "RoutedInferenceRequest",
    executionMode: demand.route.executionMode,
    messages: Object.freeze([{ role: "user", content: demand.commission.prompt }]),
    admissibleTiers: Object.freeze([...demand.route.admissibleTiers]),
    models: Object.freeze({ ...demand.route.models }),
    sufficiency: Object.freeze([
      Object.freeze({ type: "min-chars", value: demand.route.minimumCharacters }),
      ...demand.requiredSourceUrls.map((value) => Object.freeze({ type: "contains", value })),
    ]),
    maxTokens: demand.route.maxTokens,
  });
}
function lissSolicitation(demand, customerSource) {
  const request = routedRequest(demand);
  const sourceObject = Object.freeze({ type: "Note", content: `Produce prose for ${demand.assignment.id}.`, attachment: Object.freeze([request]) });
  const source = Object.freeze({ "@context": CONTEXT, id: contentId({ customerSource: customerSource.id, sourceObject }), type: "Create", actor: ACTOR, target: LISS_ACTOR, object: sourceObject });
  const object = Object.freeze({ type: "ServiceSolicitation", demand: contentId({ customerSource: customerSource.id, request: digest(request) }), sourceActivity: source, requestedEvidence: Object.freeze(["provider-authored-contract", "provider-owned-result"]) });
  return Object.freeze({ "@context": CONTEXT, id: contentId({ actor: ACTOR, target: LISS_ACTOR, object }), type: "Offer", actor: ACTOR, target: LISS_ACTOR, object });
}
function lissContract(solicitation, offer) {
  const allowedActions = Object.freeze(["invoke-service", ...(offer.object.effects ?? [])]);
  const capability = Object.freeze({ id: contentId({ solicitation: solicitation.id, offer: offer.id, allowedActions }), type: "Capability", issuer: ACTOR, holder: LISS_ACTOR, invocationTarget: LISS_ACTOR, parentOffer: offer.id, allowedActions, attenuation: Object.freeze({ sourceActivity: offer.object.sourceActivity, requestDigest: offer.object.requestDigest, providerScope: offer.object.scope, customerTerritoryMutation: false }), capTP: Object.freeze({ target: LISS_ACTOR, method: "invoke-service" }), grantSource: solicitation.id });
  const object = Object.freeze({ type: "ServiceContract", contract: LISS_CONTRACT, demand: solicitation.object.demand, offer, capability });
  return Object.freeze({ "@context": CONTEXT, id: contentId({ actor: ACTOR, target: LISS_ACTOR, object }), type: "Accept", actor: ACTOR, target: LISS_ACTOR, inReplyTo: offer.id, object });
}

export function solicitProseContribution(activity, instant = new Date().toISOString()) {
  if (!validInstant(instant)) throw new Error(`explicit UTC instant required: ${instant}`);
  if (activity?.["@context"] !== CONTEXT || activity?.type !== "Offer" || activity?.target !== ACTOR || activity?.object?.type !== "ServiceSolicitation") return refusal(activity, "wrong-boundary", "solicitation must be an ActivityStreams Offer<ServiceSolicitation> addressed to Newswire Editorial Production", instant);
  const found = demandFrom(activity); if (found === undefined) return refusal(activity, "unrecognized-demand", "source activity must create one ProseContributionDemand", instant);
  const failures = validateDemand(found.demand); if (failures.length > 0) return refusal(activity, "inadmissible-demand", `prose commission is incomplete or over-authorized: ${failures.join(", ")}`, instant, { failures });
  const childSolicitation = lissSolicitation(found.demand, found.sourceActivity);
  let lissOffer; try { lissOffer = invokeLiss("solicit-service", childSolicitation, instant, 30_000); } catch (error) { return refusal(activity, "liss-unavailable", error instanceof Error ? error.message : String(error), instant); }
  if (lissOffer?.type !== "Offer" || lissOffer?.actor !== LISS_ACTOR) return refusal(activity, "liss-route-refused", "LISS did not offer the requested finite route", instant, { providerResult: lissOffer });
  const demandDigest = digest(found.demand); const effects = Object.freeze([...(lissOffer.object.effects ?? [])]);
  const object = Object.freeze({ type: "ExecutableServiceOffer", service: "produce-prose-contribution", contract: CONTRACT, sourceActivity: found.sourceActivity, demandDigest, operation: "invoke-service", scope: Object.freeze({ lissRequestDigest: lissOffer.object.requestDigest, lissRoute: lissOffer.object.scope }), effects, requirements: Object.freeze(effects.map((effect) => Object.freeze({ type: "ResourceGrant", effect }))), childSolicitation, lissOffer, lissCarrier: lissCarrier(), price: Object.freeze({ amount: 0, currency: "USD" }) });
  const offer = response("Offer", activity, object, instant); append("provider.offer", { offerId: offer.id, demandDigest, lissOfferId: lissOffer.id, effects }, instant); return offer;
}

function validateInvocation(activity) {
  if (activity?.["@context"] !== CONTEXT || activity?.type !== "Accept" || activity?.target !== ACTOR) return "invocation must be an ActivityStreams Accept addressed to Newswire Editorial Production";
  const contract = activity.object; const offer = contract?.offer;
  if (contract?.type !== "ServiceContract" || contract?.contract !== CONTRACT || offer?.actor !== ACTOR || offer?.object?.contract !== CONTRACT) return `invocation must accept ${CONTRACT}`;
  const demand = offer.object.sourceActivity?.object; if (digest(demand) !== offer.object.demandDigest || validateDemand(demand).length > 0) return "accepted commission changed or is no longer admissible";
  if (offer.object.scope?.lissRequestDigest !== offer.object.lissOffer?.object?.requestDigest || canonical(offer.object.scope?.lissRoute) !== canonical(offer.object.lissOffer?.object?.scope)) return "accepted child route changed";
  const capability = contract.capability;
  if (capability?.type !== "Capability" || capability.holder !== ACTOR || capability.invocationTarget !== ACTOR || capability.parentOffer !== offer.id || capability.attenuation?.demandDigest !== offer.object.demandDigest) return "accepted contract lacks an exact Newswire capability";
  if (canonical(capability.attenuation?.providerScope) !== canonical(offer.object.scope)) return "customer capability changed the provider scope";
  for (const effect of offer.object.effects ?? []) if (!capability.allowedActions?.includes(effect)) return `customer capability does not grant ${effect}`;
  return undefined;
}

export function invokeProseContribution(activity, instant = new Date().toISOString()) {
  if (!validInstant(instant)) throw new Error(`explicit UTC instant required: ${instant}`);
  const invalid = validateInvocation(activity); if (invalid !== undefined) return refusal(activity, "invalid-contract", invalid, instant);
  const offer = activity.object.offer; const demand = offer.object.sourceActivity.object;
  let providerResult; try { providerResult = invokeLiss("invoke-service", lissContract(offer.object.childSolicitation, offer.object.lissOffer), instant, 1_200_000); } catch (error) { return refusal(activity, "liss-unavailable", error instanceof Error ? error.message : String(error), instant); }
  if (providerResult?.type !== "Accept") return refusal(activity, "inference-obstructed", "LISS did not complete the exact accepted route; Newswire will not silently form a different offer", instant, { providerResult });
  const routed = providerResult.object; const dryRun = routed?.dryRun === true; const prose = dryRun ? undefined : routed?.text;
  if (!dryRun && (typeof prose !== "string" || prose.trim() === "")) return refusal(activity, "empty-prose", "LISS accepted without a prose contribution", instant, { providerResult });
  const exchangeId = contentId({ offer: offer.id, lissResult: digest(providerResult), instant });
  const providerExchange = Object.freeze({ id: exchangeId, exchangeId, provider: "newswire-editorial-production", service: "produce-prose-contribution", contract: CONTRACT, outcome: dryRun ? "ready" : "completion", price: offer.object.price, demandDigest: offer.object.demandDigest, outputDigest: dryRun ? null : digest(prose), upstreamResultDigest: digest(providerResult), lissCarrier: offer.object.lissCarrier, recordedAt: instant });
  const object = Object.freeze({ type: "ProseContributionDelivery", contract: CONTRACT, disposition: dryRun ? "ready" : "completion", dryRun, demandDigest: offer.object.demandDigest, ...(dryRun ? {} : { prose, outputDigest: digest(prose) }), assignment: demand.assignment, authorities: demand.authorities, requiredSourceUrls: demand.requiredSourceUrls, lissCarrier: offer.object.lissCarrier, providerResult, providerExchange });
  const result = response("Accept", activity, object, instant); append("provider.exchange", { ...providerExchange, responseDigest: digest(result) }, instant); return result;
}

function arg(flag) { const index = process.argv.indexOf(flag); return index === -1 ? undefined : process.argv[index + 1]; }
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const operation = arg("--operation") ?? "solicit-service"; const instant = arg("--now") ?? new Date().toISOString();
  const activity = JSON.parse(readFileSync(arg("--input-file") ?? 0, "utf8"));
  const result = operation === "solicit-service" ? solicitProseContribution(activity, instant) : operation === "invoke-service" ? invokeProseContribution(activity, instant) : refusal(activity, "unknown-operation", `unknown operation ${operation}`, instant);
  const output = `${JSON.stringify(result, null, 2)}\n`; const outputPath = arg("--output-file"); if (outputPath === undefined) process.stdout.write(output); else writeFileSync(outputPath, output, "utf8");
  if (result.type === "Reject") process.exitCode = 2;
}
