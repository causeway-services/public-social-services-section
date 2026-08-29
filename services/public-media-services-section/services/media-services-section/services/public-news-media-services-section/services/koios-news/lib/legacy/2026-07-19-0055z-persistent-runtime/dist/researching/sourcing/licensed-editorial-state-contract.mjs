import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { recordDigest } from "../../management/ledger.mjs";
const CONTEXT = "https://www.w3.org/ns/activitystreams";
const CUSTOMER = "https://koios.news/activitypub/actor";
const PROVIDER = "https://koios-news-service-section.invalid/activitypub/actor";
const SITE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const SECTION_ROOT = resolve(SITE_ROOT, "../..");
const PROVIDER_EXECUTABLE = join(SECTION_ROOT, "src", "contract-licensed-editorial-state.mjs");
export class LicensedEditorialStateRefusal extends Error {
    code;
    diagnosis;
    constructor(code, message, diagnosis) {
        super(message);
        this.name = "LicensedEditorialStateRefusal";
        this.code = code;
        this.diagnosis = diagnosis;
    }
}
async function invokeProvider(command, activity, instant) {
    // This import crosses the settlement boundary only through the provider's
    // declared contract module. The provider returns values and writes its own
    // receipt; it receives no customer filesystem authority.
    const provider = await import(pathToFileURL(PROVIDER_EXECUTABLE).href);
    const value = command === "solicit-service"
        ? provider.solicitLicensedEditorialState(activity, instant)
        : provider.invokeLicensedEditorialState(activity, instant);
    if (value === null || typeof value !== "object" || Array.isArray(value))
        throw new TypeError("licensed-editorial-state provider returned no ActivityStreams object");
    return value;
}
function lawDigest(name) {
    return recordDigest(JSON.parse(readFileSync(join(SITE_ROOT, "lib", "law", name), "utf8")));
}
function law(name) {
    return JSON.parse(readFileSync(join(SITE_ROOT, "lib", "law", name), "utf8"));
}
export async function procureLicensedEditorialState(input) {
    const genreLaw = law("reported-analysis-genre-contract.json");
    const demand = Object.freeze({
        type: "LicensedEditorialStateDemand",
        assignment: Object.freeze({ ...input.assignment, sourceUrls: Object.freeze([...input.assignment.sourceUrls]) }),
        researchPacket: input.researchPacket,
        genreLawDigest: recordDigest(genreLaw),
        genreRequirements: genreLaw["evidenceBudget"],
        publicationPolicyDigest: lawDigest("accountable-attention-and-publication.json"),
    });
    const sourceActivity = Object.freeze({ "@context": CONTEXT, type: "Create", actor: CUSTOMER, object: demand });
    const solicitation = Object.freeze({
        "@context": CONTEXT,
        type: "Offer",
        actor: CUSTOMER,
        target: PROVIDER,
        object: Object.freeze({ type: "ServiceSolicitation", sourceActivity }),
    });
    const offer = await invokeProvider("solicit-service", solicitation, input.now);
    if (offer["type"] !== "Offer")
        throw new Error(`licensed-editorial-state solicitation refused: ${String(offer["summary"] ?? "unknown provider refusal")}`);
    const invocation = Object.freeze({
        "@context": CONTEXT,
        type: "Accept",
        actor: CUSTOMER,
        target: PROVIDER,
        object: Object.freeze({ type: "ServiceContract", offer }),
    });
    const delivery = await invokeProvider("invoke-service", invocation, input.now);
    const deliveryObject = delivery["object"];
    const result = deliveryObject?.["result"];
    if (result?.["status"] === "refused") {
        const rawDiagnosis = result["diagnosis"];
        const rawSuggested = rawDiagnosis?.["suggestedAssignment"];
        const suggestedUrls = rawSuggested?.["sourceUrls"];
        const diagnosis = Object.freeze({
            failureLayer: String(rawDiagnosis?.["failureLayer"] ?? "unknown"),
            requiredMove: String(rawDiagnosis?.["requiredMove"] ?? "inspect-provider-refusal"),
            replayFrom: String(rawDiagnosis?.["replayFrom"] ?? "unknown"),
            ...(rawDiagnosis?.["evidence"] === undefined ? {} : { evidence: rawDiagnosis["evidence"] }),
            ...(rawSuggested === undefined || !Array.isArray(suggestedUrls) || !suggestedUrls.every((value) => typeof value === "string") ? {} : {
                suggestedAssignment: Object.freeze({
                    term: String(rawSuggested["term"] ?? ""),
                    summary: String(rawSuggested["summary"] ?? ""),
                    angle: String(rawSuggested["angle"] ?? ""),
                    sourceUrls: Object.freeze(suggestedUrls),
                }),
            }),
        });
        throw new LicensedEditorialStateRefusal(String(result["code"] ?? "provider-refusal"), String(result["reason"] ?? "source evidence did not license the assignment"), diagnosis);
    }
    if (delivery["type"] !== "Accept" || result?.["status"] !== "licensed")
        throw new Error("licensed-editorial-state provider returned no admissible delivery");
    return Object.freeze({
        state: result["state"],
        stateDigest: String(result["stateDigest"]),
        providerExchange: deliveryObject?.["providerExchange"],
    });
}
export function licensedEditorialBrief(state) {
    const claims = new Map(state.assertions.map((claim) => [claim.id, claim]));
    const lines = [
        "LICENSED EDITORIAL STATE — this is the complete factual boundary for the draft.",
        `Assignment demand: ${state.assignment.term} (${state.assignment.beat}). Demand selects attention; it is not evidence.`,
        `Headline law: ${state.plan.headline.law}`,
        `Evidence budget: ${state.plan.evidenceBudget.distinctAssertionCount} distinct licensed assertions support ${state.plan.evidenceBudget.targetWords.minimum}-${state.plan.evidenceBudget.licensedMaximumWords} words. Do not exceed that range or pad it.`,
        "Passage plan:",
    ];
    for (const section of state.plan.sections) {
        lines.push(`- ${section.id}: ${section.purpose}`);
        for (const claimId of section.claimIds) {
            const claim = claims.get(claimId);
            if (claim !== undefined)
                lines.push(`  - [${claim.id}] ${claim.sourceTitle}: ${claim.text} (attribute: ${claim.sourceUrl})`);
        }
    }
    lines.push(`Interpretation law: ${state.plan.interpretation.law}`);
    lines.push(...state.prohibitions.map((law) => `PROHIBITED: ${law}`));
    lines.push("Every factual paragraph must remain traceable to the bracketed claim IDs above. If the plan cannot support a full article, return REPORTING_NEEDED instead of padding.");
    return lines.join("\n");
}
//# sourceMappingURL=licensed-editorial-state-contract.mjs.map