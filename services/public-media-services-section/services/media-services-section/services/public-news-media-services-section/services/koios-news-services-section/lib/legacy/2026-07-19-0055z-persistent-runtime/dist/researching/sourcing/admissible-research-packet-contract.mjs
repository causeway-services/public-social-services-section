// Koios customer-side treaty for the Service Section's evidence-composition
// product. Koios owns the assignment and separately procures both dependencies;
// the Section receives only provider-returned values and writes no Koios data.
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { appendDatedRecord, appendKoiosAct, ledgerRootPath, recordDigest } from "../../management/ledger.mjs";
const CONTEXT = "https://www.w3.org/ns/activitystreams";
const CUSTOMER = "https://koios.news/activitypub/actor";
const PROVIDER = "https://koios-news-service-section.invalid/activitypub/actor";
const SITE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const SECTION_ROOT = resolve(SITE_ROOT, "../..");
const PROVIDER_EXECUTABLE = join(SECTION_ROOT, "src", "contract-admissible-research-packet.mjs");
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
async function invokeProvider(command, activity, instant) {
    const provider = await import(pathToFileURL(PROVIDER_EXECUTABLE).href);
    const value = command === "solicit-service"
        ? provider.solicitAdmissibleResearchPacket(activity, instant)
        : provider.invokeAdmissibleResearchPacket(activity, instant);
    return record(value, "admissible-research-packet provider response");
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
export function readAdmissibleResearchPacket(dataDir, assignmentId) {
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
        evidenceBudget: Object.freeze({ minimumCurrentSources: 2, maximumCurrentSources: 6, minimumPrimarySources: 1 }),
        primarySourceUrls: Object.freeze([input.assignment.sourceUrls[0]]),
        currentEvidence: input.currentEvidence,
        priorResearch: input.priorResearch.providerDelivery,
    });
    const sourceActivity = Object.freeze({ "@context": CONTEXT, type: "Create", actor: CUSTOMER, object: demand });
    const solicitation = Object.freeze({ "@context": CONTEXT, type: "Offer", actor: CUSTOMER, target: PROVIDER, object: Object.freeze({ type: "ServiceSolicitation", sourceActivity }) });
    const offer = await invokeProvider("solicit-service", solicitation, input.now);
    if (offer["type"] !== "Offer")
        throw new AdmissibleResearchPacketRefusal(String(offer["code"] ?? "solicitation-refused"), String(offer["summary"] ?? "source-intelligence solicitation refused"), Object.freeze({ failureLayer: "contract-solicitation", requiredMove: "repair-provider-evidence-or-demand" }));
    const invocation = Object.freeze({ "@context": CONTEXT, type: "Accept", actor: CUSTOMER, target: PROVIDER, object: Object.freeze({ type: "ServiceContract", offer }) });
    const delivery = await invokeProvider("invoke-service", invocation, input.now);
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