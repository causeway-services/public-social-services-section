// Koios customer-side treaty for the Service Section's evidence-composition
// product. Koios owns the assignment and separately procures both dependencies;
// the Section receives only provider-returned values and writes no Koios data.
import { spawnSync } from "node:child_process";
import { constants } from "node:fs";
import { accessSync, existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { appendDatedRecord, appendKoiosAct, ledgerRootPath, recordDigest } from "../../management/ledger.mjs";
const CONTEXT = "https://www.w3.org/ns/activitystreams";
const CUSTOMER = "https://koios.news/activitypub/actor";
const PROVIDER = "https://koios-news-service-section.invalid/activitypub/actor";
const SITE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const EMBEDDED_PROVIDER_ROOT = resolve(SITE_ROOT, "../..");
const SIBLING_PROVIDER_ROOT = resolve(SITE_ROOT, "../../services/koios-news-service-section");
export class AdmissibleResearchPacketRefusal extends Error {
    code;
    diagnosis;
    constructor(code, message, diagnosis) {
        super(message);
        this.name = "AdmissibleResearchPacketRefusal";
        this.code = code;
        this.diagnosis = diagnosis;
    }
}
function record(value, label) {
    if (value === null || typeof value !== "object" || Array.isArray(value))
        throw new Error(`${label} must be a record`);
    return value;
}
function defaultProviderRoot() {
    return existsSync(join(SIBLING_PROVIDER_ROOT, "package.json")) ? SIBLING_PROVIDER_ROOT : EMBEDDED_PROVIDER_ROOT;
}
function providerEndpoint(root) {
    const packageJson = record(JSON.parse(readFileSync(join(root, "package.json"), "utf8")), "Service Section package");
    const bins = record(packageJson["bin"], "Service Section operation catalog");
    const relative = bins["settle-message"];
    if (typeof relative !== "string" || relative.trim() === "")
        throw new Error("Service Section does not advertise settle-message");
    const endpoint = resolve(root, relative);
    if (!endpoint.startsWith(`${root}/`))
        throw new Error("Service Section settle-message endpoint escapes its membrane");
    accessSync(endpoint, constants.R_OK);
    return endpoint;
}
function invokeProvider(root, activity, instant) {
    const result = spawnSync(process.execPath, [providerEndpoint(root), "settle-message", instant], {
        cwd: root,
        input: JSON.stringify(activity),
        encoding: "utf8",
        timeout: 120_000,
        maxBuffer: 128 * 1024 * 1024,
    });
    if (result.error !== undefined)
        throw result.error;
    if (result.status !== 0)
        throw new Error(`Service Section failed (${result.status}): ${result.stderr.trim()}`);
    const line = result.stdout.trim().split("\n").at(-1);
    if (line === undefined)
        throw new Error("Service Section returned no ActivityStreams result");
    return record(JSON.parse(line), "admissible-research-packet provider response");
}
function sourcePolicyDigest() {
    return recordDigest(JSON.parse(readFileSync(join(SITE_ROOT, "lib", "law", "accountable-attention-and-publication.json"), "utf8")));
}
function jsonlFiles(root) {
    try {
        return readdirSync(root, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? jsonlFiles(join(root, entry.name)) : entry.name.endsWith(".jsonl") ? [join(root, entry.name)] : []);
    }
    catch {
        return [];
    }
}
function readDirectAdmissibleResearchPacket(dataDir, assignmentId) {
    for (const path of [...jsonlFiles(ledgerRootPath(resolve(dataDir), "source-claims"))].sort().reverse()) {
        try {
            for (const line of readFileSync(path, "utf8").split("\n").filter(Boolean).reverse()) {
                const value = record(JSON.parse(line), "admissible research packet admission");
                if (value["kind"] !== "koios.admissible-research-packet-admission" || value["assignmentId"] !== assignmentId)
                    continue;
                const packet = record(value["packet"], "stored admissible research packet");
                if (recordDigest(packet) !== value["packetDigest"])
                    throw new Error(`stored admissible research packet digest mismatch for ${assignmentId}`);
                return packet;
            }
        }
        catch { /* malformed records cannot erase another valid admission */ }
    }
    return undefined;
}
function predecessorAssignmentId(dataDir, successorAssignmentId) {
    for (const path of [...jsonlFiles(ledgerRootPath(resolve(dataDir), "assignments"))].sort().reverse()) {
        try {
            for (const line of readFileSync(path, "utf8").split("\n").filter(Boolean).reverse()) {
                const value = record(JSON.parse(line), "assignment successor witness");
                if (value["kind"] !== "koios.assignment-successor-witness"
                    || typeof value["predecessorAssignmentId"] !== "string"
                    || value["assignment"] === null
                    || typeof value["assignment"] !== "object"
                    || Array.isArray(value["assignment"]))
                    continue;
                const assignment = value["assignment"];
                if (assignment["assignmentId"] === successorAssignmentId)
                    return value["predecessorAssignmentId"];
            }
        }
        catch { /* malformed records cannot invent a predecessor seam */ }
    }
    return undefined;
}
/**
 * Read the exact admitted packet for an assignment. A digest-bound repair
 * successor inherits its predecessor's immutable evidence through the
 * assignment-successor witness; it does not silently rebuild a new packet.
 */
export function readAdmissibleResearchPacket(dataDir, assignmentId) {
    const visited = new Set();
    let current = assignmentId;
    while (current !== undefined && !visited.has(current)) {
        visited.add(current);
        const packet = readDirectAdmissibleResearchPacket(dataDir, current);
        if (packet !== undefined)
            return packet;
        current = predecessorAssignmentId(dataDir, current);
    }
    return undefined;
}
export async function procureAdmissibleResearchPacket(input) {
    if (input.assignment.sourceUrls.length === 0)
        throw new Error("source-intelligence procurement requires a publication-declared primary source URL");
    if (input.priorResearch.providerDelivery === undefined)
        throw new Error("source-intelligence procurement requires the exact Corpus Management provider delivery");
    const demand = Object.freeze({
        type: "AdmissibleResearchPacketDemand",
        assignment: Object.freeze({ assignmentId: input.assignment.assignmentId, term: input.assignment.term, beat: input.assignment.beat }),
        sourcePolicyDigest: sourcePolicyDigest(),
        freshness: Object.freeze({ maximumAgeHours: Math.max(1, Math.floor(input.maximumAgeHours)) }),
        evidenceBudget: Object.freeze({
            minimumCurrentSources: input.commission.evidenceBudget.minimumIndependentSources,
            maximumCurrentSources: 6,
            // Assignment order is not source type. Until a separate source-
            // classification witness establishes an originating record, declare no
            // primary source rather than laundering the lead article into one.
            minimumPrimarySources: 0,
            minimumIndependentDomains: input.commission.evidenceBudget.minimumIndependentSources,
        }),
        primarySourceUrls: Object.freeze([]),
        currentEvidence: input.currentEvidence,
        ...(input.publicWebEvidence === undefined ? {} : { publicWebEvidence: input.publicWebEvidence }),
        priorResearch: input.priorResearch.providerDelivery,
    });
    const sourceActivity = Object.freeze({ "@context": CONTEXT, type: "Create", actor: CUSTOMER, object: demand });
    const solicitation = Object.freeze({ "@context": CONTEXT, type: "Offer", actor: CUSTOMER, target: PROVIDER, object: Object.freeze({ type: "ServiceSolicitation", sourceActivity }) });
    const providerRoot = resolve(input.providerRoot ?? process.env["KOIOS_NEWS_SERVICE_SECTION_ROOT"] ?? defaultProviderRoot());
    const offer = invokeProvider(providerRoot, solicitation, input.now);
    if (offer["type"] !== "Offer")
        throw new AdmissibleResearchPacketRefusal(String(offer["code"] ?? "solicitation-refused"), String(offer["summary"] ?? "source-intelligence solicitation refused"), Object.freeze({ failureLayer: "contract-solicitation", requiredMove: "repair-provider-evidence-or-demand" }));
    const invocation = Object.freeze({ "@context": CONTEXT, type: "Accept", actor: CUSTOMER, target: PROVIDER, object: Object.freeze({ type: "ServiceContract", offer }) });
    const delivery = invokeProvider(providerRoot, invocation, input.now);
    const deliveryObject = record(delivery["object"], "admissible research packet delivery");
    const result = record(deliveryObject["result"], "admissible research packet result");
    if (result["status"] !== "admitted") {
        throw new AdmissibleResearchPacketRefusal(String(result["code"] ?? "packet-refused"), String(result["reason"] ?? "admissible research packet refused"), Object.freeze(record(result["diagnosis"] ?? {}, "research packet refusal diagnosis")));
    }
    const packet = record(result["packet"], "admissible research packet");
    const custody = Object.freeze(record(result["custody"], "admissible research packet custody"));
    const packetDigest = String(result["packetDigest"] ?? "");
    const custodyDigest = String(result["custodyDigest"] ?? "");
    if (recordDigest(packet) !== packetDigest || recordDigest(custody) !== custodyDigest)
        throw new Error("Service Section delivery digests do not bind the admitted research packet and custody");
    const providerExchange = Object.freeze(record(deliveryObject["providerExchange"], "admissible research packet provider exchange"));
    appendDatedRecord({
        dataRoot: input.dataDir,
        ledger: "source-claims",
        instant: input.now,
        record: Object.freeze({ kind: "koios.admissible-research-packet-admission", at: input.now, assignmentId: input.assignment.assignmentId, contract: "koios-news-service-section/admissible-research-packet/v1", packet, packetDigest, custody, custodyDigest, providerExchange }),
    });
    appendKoiosAct({ dataRoot: input.dataDir, ledger: "contract-events", instant: input.now, act: "source-intelligence.packet.admitted", subject: input.assignment.assignmentId, data: { provider: "koios-news-service-section", contract: "koios-news-service-section/admissible-research-packet/v1", packetDigest, custodyDigest } });
    appendKoiosAct({ dataRoot: input.dataDir, ledger: "provider-usage", instant: input.now, act: "provider.service.consumed", subject: String(providerExchange["exchangeId"] ?? packetDigest), data: { purpose: `form-admissible-research-packet:${input.assignment.assignmentId}`, provider: "koios-news-service-section", service: "admissible-research-packet", price: providerExchange["price"] ?? { amount: 0, currency: "USD" }, packetDigest, custodyDigest } });
    return Object.freeze({ packet, packetDigest, custody, custodyDigest, providerExchange });
}
//# sourceMappingURL=admissible-research-packet-contract.mjs.map