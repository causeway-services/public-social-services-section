#!/usr/bin/env node

// This is deliberately outside the immutable scheduled target. ScheduleDelivery
// separately binds that target's complete declared package-local runtime closure.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const CONTEXT = "https://www.w3.org/ns/activitystreams";
const KOIOS_ACTOR = "https://bare-cedar-fog.561.group/actors/koios-news";
const PROVIDER = "https://bare-cedar-fog.561.group/actors/cold-red-gate-scheduled-activity-delivery";
const PROVIDER_CONTRACT = "ni:///sha-256;4FFjgQNtnqt4kz9gskolbDbK1kudEnJAMUe87oCAKZo";
const TARGET = Object.freeze({ packageRoot: "/home/emsenn/services/koios-news-runtime", actor: KOIOS_ACTOR, operation: "koios-news-routine-operation", contract: "koios-news/routine-operation/v1" });
// These are the target bytes inspected from the admitted Cold Red Gate runtime
// package.  An Offer carrying merely digest-shaped placeholders cannot support
// a later customer acceptance, because ScheduleDelivery binds the inspected
// target closure into the schedule identity.
const TARGET_BINDING = Object.freeze({
  packageDigest: "ni:///sha-256;0yKUqiN6oBx3OPLC1hlEH_bI75jh8krJrrpXlejffHY",
  selectedBinDigest: "ni:///sha-256;GT6O4vInCdejn2thcqFIqCq137OIwKsJ3X8abxTMvgI",
  runtimeClosureDigest: "ni:///sha-256;Y2IXvgUmtT1AtDfxyD3XFrSNkU7ERomL7OPd4Z6uBPs",
});
const DELIVERY_CAPABILITY = "urn:capability:koios-news:cold-red-gate:routine-publication:v1";
const EFFECTS = Object.freeze(["provider-local-append-only-schedule", "provider-local-occurrence-reservation", "exact-advertised-target-operation-invocation"]);

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value !== null && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}
function id(value) { return `urn:koios-news:schedule-delivery-preflight:sha256:${createHash("sha256").update(canonical(value)).digest("hex")}`; }
import { argument } from "@red-cup-engineering/parse-javascript-argv-service";
function requireString(value, label) { if (typeof value !== "string" || value === "") throw new Error(`${label} is required`); return value; }
function integer(value, label, min, max) { const number = Number(value); if (!Number.isInteger(number) || number < min || number > max) throw new Error(`${label} must be an integer from ${min} to ${max}`); return number; }
function instant(value, label) { if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) throw new Error(`${label} must be an ISO instant`); return value; }
function readJson(path, label) { try { return JSON.parse(readFileSync(requireString(path, `${label} path`), "utf8")); } catch (error) { throw new Error(`${label} must be readable JSON: ${error instanceof Error ? error.message : String(error)}`); } }
function same(left, right) { return canonical(left) === canonical(right); }

function solicitation() {
  const firstDueAt = instant(argument("--first-due-at"), "--first-due-at");
  const intervalSeconds = integer(argument("--interval-seconds"), "--interval-seconds", 60, 31_536_000);
  const maxRaw = requireString(argument("--max-deliveries"), "--max-deliveries");
  const maxDeliveries = maxRaw === "null" ? null : integer(maxRaw, "--max-deliveries", 1, 10_000);
  const timeoutMilliseconds = integer(argument("--timeout-milliseconds"), "--timeout-milliseconds", 1, 3_600_000);
  const request = Object.freeze({
    type: "ScheduledActivityDeliveryRequest", executionMode: "live",
    schedule: Object.freeze({ firstDueAt, intervalSeconds, maxDeliveries }),
    target: TARGET, timeoutMilliseconds, retry: Object.freeze({ maxAttempts: 1 }), deliveryCapabilityId: DELIVERY_CAPABILITY,
    activityTemplate: Object.freeze({ "@context": CONTEXT, type: "Create", target: KOIOS_ACTOR, object: Object.freeze({ type: "KoiosRoutinePublicationDemand", contract: TARGET.contract, operation: "form-offline-candidate" }) }),
  });
  const sourceActivity = Object.freeze({ "@context": CONTEXT, id: id({ kind: "source", request }), type: "Create", actor: KOIOS_ACTOR, target: PROVIDER, object: Object.freeze({ type: "Note", attachment: Object.freeze([request]) }) });
  const object = Object.freeze({ type: "ServiceSolicitation", sourceActivity });
  return Object.freeze({ "@context": CONTEXT, id: id({ kind: "solicitation", sourceActivity }), type: "Offer", actor: KOIOS_ACTOR, target: PROVIDER, object });
}

function checkSolicitation(value) {
  if (value?.["@context"] !== CONTEXT || value?.type !== "Offer" || value?.actor !== KOIOS_ACTOR || value?.target !== PROVIDER || value?.object?.type !== "ServiceSolicitation") throw new Error("solicitation is not an ActivityStreams Offer<ServiceSolicitation> from Koios to the retained provider");
  const source = value.object.sourceActivity, request = source?.object?.attachment?.find?.((item) => item?.type === "ScheduledActivityDeliveryRequest");
  if (source?.["@context"] !== CONTEXT || typeof source?.id !== "string" || source.type !== "Create" || source.actor !== KOIOS_ACTOR || source.target !== PROVIDER || source.object?.type !== "Note" || !request) throw new Error("solicitation source activity does not carry one ScheduledActivityDeliveryRequest");
  if (request.executionMode !== "live" || !same(request.target, TARGET) || request.deliveryCapabilityId !== DELIVERY_CAPABILITY || request.retry?.maxAttempts !== 1 || request.activityTemplate?.["@context"] !== CONTEXT || request.activityTemplate?.type !== "Create" || request.activityTemplate?.target !== KOIOS_ACTOR || request.activityTemplate?.object?.type !== "KoiosRoutinePublicationDemand" || request.activityTemplate?.object?.contract !== TARGET.contract || request.activityTemplate?.object?.operation !== "form-offline-candidate") throw new Error("solicitation request does not bind the current Koios live routine target");
  return { source, request };
}

function verifyOffer() {
  const solicitationValue = readJson(argument("--solicitation"), "solicitation");
  const offer = readJson(argument("--offer"), "offer");
  const { source, request } = checkSolicitation(solicitationValue);
  const body = offer?.object;
  if (offer?.["@context"] !== CONTEXT || offer?.type !== "Offer" || offer?.actor !== PROVIDER || offer?.target !== KOIOS_ACTOR || typeof offer?.id !== "string" || body?.type !== "ExecutableServiceOffer" || body.contract !== PROVIDER_CONTRACT || body.sourceActivity !== source.id || body.customer !== KOIOS_ACTOR || !same(body.request, request) || typeof body.requestDigest !== "string" || !body.requestDigest.startsWith("ni:///sha-256;") || typeof body.scheduleId !== "string" || !body.scheduleId.startsWith("ni:///sha-256;") || !same(body.effects, EFFECTS) || body.operation !== "invoke-service" || !same(body.targetBinding, TARGET_BINDING)) throw new Error("offer does not satisfy the current ScheduleDelivery ExecutableServiceOffer law for this solicitation and target runtime closure");
  return { type: "KoiosScheduleDeliveryOfferPreflight", providerContract: PROVIDER_CONTRACT, solicitationId: solicitationValue.id, offerId: offer.id, offerLawShapeVerified: true, targetBindingVerified: true, targetBinding: TARGET_BINDING, providerAuthorityAuthenticated: false, acceptanceProduced: false, activationPermitted: false, blockers: ["Provider witnessed offer emission is unavailable to this local chassis.", "No authenticated customer signing authority is available to create the required ServiceContract acceptance.", "No timer, credential, schedule registration, candidate, or release was created."] };
}

try {
  const command = process.argv[2];
  const output = command === "solicitation" ? solicitation() : command === "verify-offer" ? verifyOffer() : (() => { throw new Error("usage: solicitation --first-due-at <ISO> --interval-seconds <n> --max-deliveries <n|null> --timeout-milliseconds <n> | verify-offer --solicitation <path> --offer <path>"); })();
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
  if (command === "verify-offer") process.exitCode = 2;
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 2;
}
