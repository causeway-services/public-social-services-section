// Koios's customer-side treaty with the separately hireable Newswire
// Editorial Production settlement. Resource and route admission live here at
// the boundary; the newsroom runner neither selects models nor handles keys.
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { appendKoiosAct, appendProviderUsage, recordDigest } from "../../management/ledger.mjs";
const CONTEXT = "https://www.w3.org/ns/activitystreams";
const CUSTOMER = "https://koios.news/activitypub/actor";
const PROVIDER = "urn:ame:newswire-editorial-production";
const CONTRACT = "newswire-editorial-production/prose-contribution/v1";
const SITE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const DEFAULT_PROVIDER_ROOT = resolve(SITE_ROOT, "../../services/newswire-editorial-production");
export class NewswireProseRefusal extends Error {
    code;
    providerResult;
    constructor(code, message, providerResult) {
        super(message);
        this.name = "NewswireProseRefusal";
        this.code = code;
        if (providerResult !== undefined)
            this.providerResult = providerResult;
    }
}
function record(value, label) {
    if (value === null || typeof value !== "object" || Array.isArray(value))
        throw new Error(`${label} must be a record`);
    return value;
}
function contentId(value) { return `urn:sha256:${createHash("sha256").update(JSON.stringify(value)).digest("hex")}`; }
function routingLaw() { return JSON.parse(readFileSync(join(SITE_ROOT, "lib", "law", "writer-inference-routing.json"), "utf8")); }
function providerEndpoint(root, operation) {
    const pkg = record(JSON.parse(readFileSync(join(root, "package.json"), "utf8")), "Newswire package");
    const bins = record(pkg["bin"], "Newswire operation catalog");
    const path = bins[operation];
    if (typeof path !== "string")
        throw new Error(`Newswire does not advertise ${operation}`);
    return resolve(root, path);
}
function invokeProvider(root, operation, activity, now, timeout, resourceEnv = {}) {
    const temp = mkdtempSync(join(tmpdir(), "koios-newswire-"));
    const inputPath = join(temp, "input.json");
    const outputPath = join(temp, "output.json");
    try {
        writeFileSync(inputPath, `${JSON.stringify(activity)}\n`, "utf8");
        const execution = spawnSync(process.execPath, [providerEndpoint(root, operation), "--operation", operation, "--now", now, "--input-file", inputPath, "--output-file", outputPath], { cwd: root, encoding: "utf8", timeout, env: { ...process.env, ...resourceEnv } });
        let output;
        try {
            output = JSON.parse(readFileSync(outputPath, "utf8"));
        }
        catch {
            throw new Error(execution.error?.message || execution.stderr || execution.stdout || `Newswire ${operation} exited ${execution.status}`);
        }
        return record(output, `Newswire ${operation} response`);
    }
    finally {
        rmSync(temp, { recursive: true, force: true });
    }
}
function credential(tier) {
    for (const alias of tier.credentialAliases) {
        const value = process.env[alias];
        if (value !== undefined && value !== "")
            return Object.freeze({ alias, value });
    }
    return undefined;
}
function accept(offer) {
    const offerObject = record(offer["object"], "Newswire offer object");
    const effects = Array.isArray(offerObject["effects"]) ? offerObject["effects"].map(String) : [];
    const allowedActions = Object.freeze(["invoke-service", ...effects]);
    const capability = Object.freeze({ id: contentId({ offer: offer["id"], allowedActions }), type: "Capability", issuer: CUSTOMER, holder: PROVIDER, invocationTarget: PROVIDER, parentOffer: offer["id"], allowedActions, attenuation: Object.freeze({ demandDigest: offerObject["demandDigest"], providerScope: offerObject["scope"], customerTerritoryMutation: false }), capTP: Object.freeze({ target: PROVIDER, method: "invoke-service" }) });
    const object = Object.freeze({ type: "ServiceContract", contract: CONTRACT, offer, capability });
    return Object.freeze({ "@context": CONTEXT, id: contentId({ actor: CUSTOMER, target: PROVIDER, object }), type: "Accept", actor: CUSTOMER, target: PROVIDER, inReplyTo: offer["id"], object });
}
export function procureNewswireProse(input) {
    const law = routingLaw();
    const estimatedInputTokens = Math.ceil(Buffer.byteLength(input.prompt, "utf8") / 3);
    const admitted = [];
    const resourceEnv = {};
    for (const tier of law.tiers) {
        const granted = tier.credentialAliases.length === 0 ? undefined : credential(tier);
        if (tier.credentialAliases.length > 0 && granted === undefined) {
            appendKoiosAct({ dataRoot: input.dataDir, ledger: "contract-events", instant: input.now, act: "writer.route.resource.delegated", subject: input.assignmentId, data: { service: CONTRACT, tier: tier.id, reason: "the provider must bid and exercise its own account resource; no secret crosses the customer boundary" } });
        }
        if (estimatedInputTokens > tier.maximumEstimatedInputTokens) {
            appendKoiosAct({ dataRoot: input.dataDir, ledger: "contract-events", instant: input.now, act: "writer.route.incompatible", subject: input.assignmentId, data: { service: CONTRACT, tier: tier.id, estimatedInputTokens, maximumEstimatedInputTokens: tier.maximumEstimatedInputTokens } });
            continue;
        }
        admitted.push(tier);
        if (granted !== undefined)
            resourceEnv[tier.id === "free-groq" ? "GROQ_API_KEY" : "NVIDIA_API_KEY"] = granted.value;
    }
    if (admitted.length === 0)
        throw new NewswireProseRefusal("no-admissible-route", "no writer route is both authorized and compatible with the commission");
    const first = admitted[0];
    const demand = Object.freeze({
        type: "ProseContributionDemand", purpose: input.purpose,
        assignment: Object.freeze({ id: input.assignmentId, digest: input.assignmentDigest }),
        authorities: Object.freeze({ licensedEditorialStateDigest: input.licensedEditorialStateDigest, researchPacketDigest: input.researchPacketDigest, writingPolicyDigest: input.writingPolicyDigest, stylePolicyDigest: input.stylePolicyDigest }),
        commission: Object.freeze({ prompt: input.prompt, promptDigest: recordDigest(input.prompt) }),
        requiredSourceUrls: Object.freeze([...new Set(input.requiredSourceUrls)]),
        route: Object.freeze({ executionMode: input.executionMode ?? "live", admissibleTiers: Object.freeze(admitted.map((tier) => tier.id)), models: Object.freeze(Object.fromEntries(admitted.map((tier) => [tier.id, tier.model]))), maxTokens: first.maximumOutputTokens, minimumCharacters: law.minimumProseCharacters }),
    });
    const sourceActivity = Object.freeze({ "@context": CONTEXT, id: contentId(demand), type: "Create", actor: CUSTOMER, target: PROVIDER, object: demand });
    const solicitation = Object.freeze({ "@context": CONTEXT, id: contentId({ sourceActivity: sourceActivity.id, service: CONTRACT }), type: "Offer", actor: CUSTOMER, target: PROVIDER, object: Object.freeze({ type: "ServiceSolicitation", demand: contentId({ assignment: input.assignmentId, prompt: demand.commission.promptDigest }), sourceActivity }) });
    const root = resolve(input.providerRoot ?? process.env["KOIOS_NEWSWIRE_EDITORIAL_PRODUCTION_ROOT"] ?? DEFAULT_PROVIDER_ROOT);
    const offer = invokeProvider(root, "solicit-service", solicitation, input.now, 30_000, resourceEnv);
    if (offer["type"] !== "Offer") {
        const refusal = record(offer["object"] ?? {}, "Newswire solicitation refusal");
        throw new NewswireProseRefusal(String(refusal["code"] ?? "solicitation-refused"), String(refusal["reason"] ?? "Newswire refused the prose commission"), offer);
    }
    const delivery = invokeProvider(root, "invoke-service", accept(offer), input.now, 1_200_000, resourceEnv);
    if (delivery["type"] !== "Accept") {
        const refusal = record(delivery["object"] ?? {}, "Newswire invocation refusal");
        throw new NewswireProseRefusal(String(refusal["code"] ?? "invocation-refused"), String(refusal["reason"] ?? "Newswire did not deliver prose"), delivery);
    }
    const result = record(delivery["object"], "Newswire delivery");
    if (result["dryRun"] === true)
        throw new NewswireProseRefusal("dry-run-has-no-prose", "a dry-run readiness witness cannot be used as a prose contribution", delivery);
    const text = result["prose"];
    if (typeof text !== "string" || text.trim() === "")
        throw new NewswireProseRefusal("empty-prose", "Newswire delivered no prose", delivery);
    if (recordDigest(text) !== result["outputDigest"] || result["demandDigest"] !== record(offer["object"], "Newswire offer")["demandDigest"])
        throw new NewswireProseRefusal("delivery-digest-mismatch", "Newswire delivery does not bind the accepted commission and prose", delivery);
    const providerExchange = record(result["providerExchange"], "Newswire provider exchange");
    appendKoiosAct({ dataRoot: input.dataDir, ledger: "contract-events", instant: input.now, act: "writer.prose.delivered", subject: input.assignmentId, data: { service: CONTRACT, provider: "newswire-editorial-production", demandDigest: result["demandDigest"], outputDigest: result["outputDigest"], upstreamResultDigest: providerExchange["upstreamResultDigest"] } });
    appendKoiosAct({ dataRoot: input.dataDir, ledger: "provider-usage", instant: input.now, act: "provider.service.consumed", subject: String(providerExchange["exchangeId"] ?? result["outputDigest"]), data: { purpose: input.purpose, provider: "newswire-editorial-production", service: "produce-prose-contribution", price: providerExchange["price"] ?? { amount: 0, currency: "USD" }, outputDigest: result["outputDigest"] } });
    appendProviderUsage({ dataRoot: input.dataDir, instant: input.now, providerResult: result["providerResult"], purpose: input.purpose });
    const routed = record(record(result["providerResult"], "LISS result activity")["object"], "LISS routed result");
    const selectedTier = String(routed["selectedTier"] ?? first.id);
    const selected = admitted.find((tier) => tier.id === selectedTier) ?? first;
    return Object.freeze({ text, model: selected.model, selectedTier, selectedProvider: String(routed["selectedProvider"] ?? "logical-inference-service-section"), providerResult: record(result["providerResult"], "LISS result"), providerExchange, recordedAt: input.now });
}
//# sourceMappingURL=newswire-prose-contract.mjs.map