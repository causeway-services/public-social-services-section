#!/usr/bin/env node
import { readFileSync, realpathSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { DEFAULT_DATA_DIR, DEFAULT_ISSUE_POLICY } from "./config.mjs";
import { appendKoiosAct, recordDigest } from "./management/ledger.mjs";
const CONTEXT = "https://www.w3.org/ns/activitystreams";
const CUSTOMER = "https://koios.news/activitypub/actor";
const PROVIDER = "urn:colony:cold-red-gate:clockkeeper";
const ISSUE_CAPABILITY = "urn:capability:koios-news:clockkeeper:cold-red-gate:publication-issue-pulse:v1";
const LEARNING_CAPABILITY = "urn:capability:koios-news:clockkeeper:cold-red-gate:newsroom-learning-pulse:v1";
const ATTENTION_CAPABILITY = "urn:capability:koios-news:clockkeeper:cold-red-gate:attention-import:v1";
const AADS_PERFORMANCE_CAPABILITY = "urn:capability:koios-news:clockkeeper:cold-red-gate:aads-performance-import:v1";
const SEARCH_DEMAND_CAPABILITY = "urn:capability:koios-news:clockkeeper:cold-red-gate:search-demand-import:v1";
const REPAIR_PULSE_CAPABILITY = "urn:capability:koios-news:clockkeeper:cold-red-gate:newsroom-repair-pulse:v1";
const CONTRACT = "clocked-activity-delivery";
const RETIREMENT_CONTRACT = "clocked-activity-delivery-retirement";
function argument(name) {
    const index = process.argv.indexOf(name);
    return index === -1 ? undefined : process.argv[index + 1];
}
function object(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
function currentInstant(value) {
    const parsed = Date.parse(value);
    if (!Number.isFinite(parsed) || Math.abs(Date.now() - parsed) > 5 * 60_000)
        throw new Error("--now must be a current explicit UTC instant");
}
function providerOperation(root, operation, activity, now) {
    const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
    const entry = pkg.bin?.[operation];
    if (entry === undefined)
        throw new Error(`Clockkeeper does not advertise ${operation}`);
    const result = spawnSync(process.execPath, [resolve(root, entry), "--operation", operation, "--now", now], {
        cwd: root,
        input: `${JSON.stringify(activity)}\n`,
        encoding: "utf8",
        timeout: 30_000,
        maxBuffer: 16 * 1024 * 1024,
        env: {
            PATH: process.env.PATH,
            NODE_PATH: process.env.NODE_PATH,
            NO_COLOR: "1",
            CLOCKKEEPER_ACTOR: PROVIDER,
            // Clockkeeper's settlement projection is a separately hired provider;
            // propagate only its exact Agent Card address, never ambient caller
            // credentials or the rest of the customer's process environment.
            ...(process.env["RWIL_RDF_AGENT"] === undefined ? {} : { RWIL_RDF_AGENT: process.env["RWIL_RDF_AGENT"] }),
        },
    });
    let output;
    try {
        output = JSON.parse(result.stdout);
    }
    catch {
        throw new Error(`Clockkeeper returned no typed response (status=${result.status}): ${result.stderr || result.stdout}`);
    }
    if (!object(output) || !["Offer", "Accept", "Question", "Reject"].includes(String(output["type"])))
        throw new Error("Clockkeeper returned an untyped response");
    return output;
}
const now = argument("--now");
if (now === undefined)
    throw new Error("Clockkeeper contract requires --now");
currentInstant(now);
const firstDueAt = argument("--first-due-at");
if (firstDueAt === undefined || !Number.isFinite(Date.parse(firstDueAt)))
    throw new Error("Clockkeeper contract requires --first-due-at");
const intervalSeconds = Number(argument("--interval-seconds") ?? "86400");
if (!Number.isInteger(intervalSeconds) || intervalSeconds < 60)
    throw new Error("--interval-seconds must be an integer of at least 60");
const maxDeliveriesArgument = argument("--max-deliveries");
const maxDeliveries = maxDeliveriesArgument === undefined ? null : Number(maxDeliveriesArgument);
if (maxDeliveries !== null && (!Number.isInteger(maxDeliveries) || maxDeliveries < 1)) {
    throw new Error("--max-deliveries must be a positive integer when supplied");
}
const targetOperation = argument("--target-operation") ?? "operate-issue";
const defaults = targetOperation === "operate-issue"
    ? Object.freeze({ contract: "koios.news/publication-cycle/v1", timeout: 1_800_000, capability: ISSUE_CAPABILITY, demandType: "NewsroomIssueDemand" })
    : targetOperation === "operate-learning-pulse"
        ? Object.freeze({ contract: "koios-news/newsroom-learning-pulse/v1", timeout: 120_000, capability: LEARNING_CAPABILITY, demandType: "NewsroomLearningDemand" })
        : targetOperation === "operate-attention-import"
            ? Object.freeze({ contract: "koios-news/attention-import/v1", timeout: 120_000, capability: ATTENTION_CAPABILITY, demandType: "AttentionImportDemand" })
            : targetOperation === "operate-aads-performance-import"
                ? Object.freeze({ contract: "koios-news/aads-performance-import/v1", timeout: 120_000, capability: AADS_PERFORMANCE_CAPABILITY, demandType: "AAdsPerformanceImportDemand" })
                : targetOperation === "operate-search-demand-import"
                    ? Object.freeze({ contract: "koios-news/search-demand-import/v1", timeout: 120_000, capability: SEARCH_DEMAND_CAPABILITY, demandType: "SearchDemandImportDemand" })
                    : targetOperation === "operate-repair-pulse"
                        ? Object.freeze({ contract: "koios-news/newsroom-repair-pulse/v1", timeout: 1_800_000, capability: REPAIR_PULSE_CAPABILITY, demandType: "NewsroomRepairPulseDemand" })
                        : undefined;
if (defaults === undefined)
    throw new Error(`unsupported scheduled Koios operation: ${targetOperation}; the public cadence must purchase operate-issue, while issue selection remains an internal phase of that publication-cycle service`);
const targetContract = argument("--target-contract") ?? defaults.contract;
const timeoutMilliseconds = Number(argument("--timeout-milliseconds") ?? String(defaults.timeout));
if (!Number.isInteger(timeoutMilliseconds) || timeoutMilliseconds < 1 || timeoutMilliseconds > 3_600_000)
    throw new Error("--timeout-milliseconds must be an integer from 1 through 3600000");
const replacedScheduleId = argument("--replace-schedule-id");
const providerRoot = realpathSync(resolve(argument("--provider-root") ?? "/home/emsenn/services/clockkeeper-service"));
const targetPackage = realpathSync(resolve(argument("--target-package") ?? "/home/emsenn/services/koios-news-runtime"));
const dataDir = resolve(argument("--data-dir") ?? DEFAULT_DATA_DIR);
let policy;
let policyDigest;
if (defaults.demandType === "NewsroomIssueDemand") {
    const policyPath = realpathSync(resolve(argument("--policy") ?? DEFAULT_ISSUE_POLICY));
    const parsed = JSON.parse(readFileSync(policyPath, "utf8"));
    if (!object(parsed) || !Array.isArray(parsed["triggerAuthorities"]) || !parsed["triggerAuthorities"].some((authority) => object(authority) && authority["actor"] === PROVIDER && authority["capability"] === defaults.capability))
        throw new Error("Koios policy does not admit the exact Cold Red Gate Clockkeeper actor-capability");
    policy = parsed;
    policyDigest = recordDigest(parsed);
}
const demandTemplate = defaults.demandType === "NewsroomIssueDemand"
    ? Object.freeze({ type: defaults.demandType, policy: policy, policyDigest: policyDigest })
    : Object.freeze({ type: defaults.demandType, contract: targetContract });
const request = Object.freeze({
    type: "ScheduledActivityDeliveryRequest",
    executionMode: "live",
    schedule: { intervalSeconds, firstDueAt, maxDeliveries },
    target: { packageRoot: targetPackage, nodeId: "koios.news", actor: CUSTOMER, operation: targetOperation, contract: targetContract },
    timeoutMilliseconds,
    retry: { maxAttempts: 1 },
    deliveryCapabilityId: defaults.capability,
    activityTemplate: { "@context": CONTEXT, type: "Create", target: CUSTOMER, object: demandTemplate },
    ...(replacedScheduleId === undefined ? {} : { replacesScheduleId: replacedScheduleId }),
});
const source = Object.freeze({ "@context": CONTEXT, id: `urn:koios:clockkeeper-source:${recordDigest(request)}`, type: "Create", actor: CUSTOMER, target: PROVIDER, object: { type: "Note", attachment: [request] } });
const solicitation = Object.freeze({ "@context": CONTEXT, id: `urn:koios:clockkeeper-solicitation:${recordDigest(source)}`, type: "Offer", actor: CUSTOMER, target: PROVIDER, object: { type: "ServiceSolicitation", sourceActivity: source } });
const offer = providerOperation(providerRoot, "solicit-service", solicitation, now);
if (offer["type"] !== "Offer" || !object(offer["object"]) || offer["object"]["contract"] !== CONTRACT)
    throw new Error(`Clockkeeper did not offer the requested service: ${JSON.stringify(offer)}`);
const offered = offer["object"];
const effects = offered["effects"];
if (!Array.isArray(effects) || typeof offered["requestDigest"] !== "string" || typeof offered["scheduleId"] !== "string")
    throw new Error("Clockkeeper offer lacks exact effects, request digest, or schedule identity");
const capability = Object.freeze({
    type: "Capability", issuer: CUSTOMER, holder: PROVIDER, invocationTarget: PROVIDER, parentOffer: offer["id"],
    allowedActions: ["invoke-service", ...effects], attenuation: { requestDigest: offered["requestDigest"], scheduleId: offered["scheduleId"] },
    singleUse: true, expiresAt: new Date(Date.parse(now) + 30 * 60_000).toISOString(),
});
const acceptance = Object.freeze({ "@context": CONTEXT, id: `urn:koios:clockkeeper-acceptance:${recordDigest({ offer: offer["id"], capability })}`, type: "Accept", actor: CUSTOMER, target: PROVIDER, inReplyTo: offer["id"], object: { type: "ServiceContract", contract: CONTRACT, offer, capability } });
const outcome = providerOperation(providerRoot, "invoke-service", acceptance, now);
const accepted = outcome["type"] === "Accept" && object(outcome["object"]) && outcome["object"]["type"] === "ScheduleRegistration";
let retirementOutcome;
const registeredScheduleId = accepted && object(outcome["object"]) && typeof outcome["object"]["scheduleId"] === "string"
    ? outcome["object"]["scheduleId"]
    : undefined;
let retired = replacedScheduleId === undefined;
if (accepted && replacedScheduleId !== undefined && registeredScheduleId === replacedScheduleId) {
    retirementOutcome = Object.freeze({ type: "Reject", object: Object.freeze({ type: "Refusal", code: "replacement-replayed-same-schedule", reason: "replacement must register a distinct schedule before retiring its predecessor" }) });
}
else if (accepted && replacedScheduleId !== undefined) {
    const retirementCapability = Object.freeze({
        type: "Capability", issuer: CUSTOMER, holder: PROVIDER, invocationTarget: PROVIDER,
        allowedActions: ["retire-schedule"], attenuation: { scheduleId: replacedScheduleId }, singleUse: true,
        expiresAt: new Date(Date.parse(now) + 30 * 60_000).toISOString(),
    });
    const retirement = Object.freeze({
        "@context": CONTEXT,
        id: `urn:koios:clockkeeper-retirement:${recordDigest({ scheduleId: replacedScheduleId, retirementCapability })}`,
        type: "Undo",
        actor: CUSTOMER,
        target: PROVIDER,
        object: { type: "ScheduleRetirementRequest", contract: RETIREMENT_CONTRACT, scheduleId: replacedScheduleId, capability: retirementCapability },
    });
    retirementOutcome = providerOperation(providerRoot, "retire-schedule", retirement, now);
    retired = (retirementOutcome["type"] === "Accept" && object(retirementOutcome["object"]) && retirementOutcome["object"]["type"] === "ScheduleRetirement")
        || (retirementOutcome["type"] === "Reject" && object(retirementOutcome["object"]) && retirementOutcome["object"]["code"] === "already-retired");
}
const settled = accepted && retired;
const record = appendKoiosAct({
    dataRoot: dataDir,
    ledger: "contract-events",
    instant: now,
    act: settled ? (replacedScheduleId === undefined ? "clockkeeper.schedule.accepted" : "clockkeeper.schedule.replaced") : "clockkeeper.schedule.refused",
    subject: String(offered["scheduleId"]),
    data: { provider: PROVIDER, contract: CONTRACT, solicitation: solicitation["id"], offer: offer["id"], capability: defaults.capability, ...(policyDigest === undefined ? {} : { policyDigest }), firstDueAt, intervalSeconds, maxDeliveries, timeoutMilliseconds, target: request.target, outcome, ...(replacedScheduleId === undefined ? {} : { replacedScheduleId, retirementOutcome }), providerTerritoryMutation: false },
});
process.stdout.write(`${JSON.stringify(record)}\n`);
if (!settled)
    process.exitCode = 2;
//# sourceMappingURL=contract-clockkeeper.mjs.map