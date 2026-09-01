import { spawnSync } from "node:child_process";
import { constants } from "node:fs";
import { accessSync, existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { recordDigest } from "../../management/ledger.mjs";
const CONTEXT = "https://www.w3.org/ns/activitystreams";
const CUSTOMER = "https://koios.news/activitypub/actor";
const PROVIDER = "https://koios-news-service-section.invalid/activitypub/actor";
const SITE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const EMBEDDED_PROVIDER_ROOT = resolve(SITE_ROOT, "../..");
const SIBLING_PROVIDER_ROOT = resolve(SITE_ROOT, "../../services/koios-news-service-section");
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
function defaultProviderRoot() {
    return existsSync(join(SIBLING_PROVIDER_ROOT, "package.json")) ? SIBLING_PROVIDER_ROOT : EMBEDDED_PROVIDER_ROOT;
}
function providerEndpoint(root) {
    const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
    const bins = packageJson["bin"];
    const relative = bins?.["settle-message"];
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
    const value = JSON.parse(line);
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
    const providerRoot = resolve(input.providerRoot ?? process.env["KOIOS_NEWS_SERVICE_SECTION_ROOT"] ?? defaultProviderRoot());
    const offer = invokeProvider(providerRoot, solicitation, input.now);
    if (offer["type"] !== "Offer")
        throw new Error(`licensed-editorial-state solicitation refused: ${String(offer["summary"] ?? "unknown provider refusal")}`);
    const invocation = Object.freeze({
        "@context": CONTEXT,
        type: "Accept",
        actor: CUSTOMER,
        target: PROVIDER,
        object: Object.freeze({ type: "ServiceContract", offer }),
    });
    const delivery = invokeProvider(providerRoot, invocation, input.now);
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