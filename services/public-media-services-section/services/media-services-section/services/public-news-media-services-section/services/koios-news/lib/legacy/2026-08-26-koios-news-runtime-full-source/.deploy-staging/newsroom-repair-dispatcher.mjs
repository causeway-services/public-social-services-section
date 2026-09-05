// @ts-nocheck
import { formNewsroomRepairDemand as formBaseDemand, digest, CONTEXT, KOIOS, LISS, LISS_CONTRACT } from "./dispatcher-core.mjs";
export { digest, CONTEXT, KOIOS, LISS, LISS_CONTRACT };
const id = (value) => `urn:${digest(value)}`;
const nonempty = (value) => typeof value === "string" && value.trim();
/** Koios owns this reading; the carrier only rejects incomplete custody before LISS is contacted. */
export function validateRepairContext(context) {
    if (!context || typeof context !== "object")
        throw new TypeError("RepairContext is required");
    for (const field of ["currentBody", "manuscriptDigest", "editorReport", "editorJudgmentDigest", "sourcePacketDigest", "assignmentDigest", "renderedInstructions", "instructionsDigest"])
        if (!nonempty(context[field]))
            throw new TypeError(`RepairContext.${field} is required`);
    if (!context.witnessedResearchPacket || typeof context.witnessedResearchPacket !== "object" || !context.assignmentContext || typeof context.assignmentContext !== "object")
        throw new TypeError("RepairContext requires witnessedResearchPacket and assignmentContext");
    if (context.manuscriptDigest !== digest(context.currentBody) || context.sourcePacketDigest !== digest(context.witnessedResearchPacket) || context.assignmentDigest !== digest(context.assignmentContext) || context.instructionsDigest !== digest(context.renderedInstructions))
        throw new TypeError("RepairContext digest does not bind its supplied bytes");
    if (context.repairAuthority === "deterministic-source-originality-gate") {
        if (!context.writerEvidenceProjection || typeof context.writerEvidenceProjection !== "object" || !nonempty(context.writerEvidenceProjectionDigest))
            throw new TypeError("source-originality replay requires a clean-room writer evidence projection");
        if (context.writerEvidenceProjectionDigest !== digest(context.writerEvidenceProjection))
            throw new TypeError("writer evidence projection digest does not bind its supplied claims");
    }
    return Object.freeze(structuredClone(context));
}
export function formNewsroomRepairDemand(reading, repairContext) {
    const base = formBaseDemand(reading);
    if (base.type === "NewsroomRepairRefusal")
        return base;
    let context;
    try {
        context = validateRepairContext(repairContext);
    }
    catch (error) {
        return Object.freeze({ type: "NewsroomRepairRefusal", code: "missing-repair-context", reason: error.message, assignmentId: reading.assignmentId, learningEvidenceDigest: reading.learningEvidenceDigest, customerMutation: false, providerInvocation: false });
    }
    if (context.assignmentDigest !== base.predecessor.assignmentDigest || context.sourcePacketDigest !== base.predecessor.sourcePacketDigest)
        return Object.freeze({ type: "NewsroomRepairRefusal", code: "repair-context-evidence-mismatch", assignmentId: reading.assignmentId, customerMutation: false, providerInvocation: false });
    const { id: _old, ...body } = base, next = { ...body, repairContext: context, repairContextDigest: digest(context) };
    return Object.freeze({ ...next, id: id(next) });
}
function repairPrompt(demand) {
    const c = demand.repairContext;
    const gate = c.repairAuthority === "deterministic-source-originality-gate", label = gate ? "DETERMINISTIC SOURCE-ORIGINALITY GATE REPORT" : "INDEPENDENT EDITOR REPORT";
    const writerEvidence = gate ? c.writerEvidenceProjection : c.witnessedResearchPacket, evidenceLabel = gate ? "LICENSED CLEAN-ROOM CLAIM DECK" : "WITNESSED RESEARCH PACKET";
    return [`You hold Koios.News's Draft Revision duty. Rewrite the complete article body so it clears every material defect in the ${gate ? "deterministic source-originality gate" : "independent Editor"} report.`, "Return prose only: the complete revised Markdown body, with no title, frontmatter, labels, patch language, code fence, or commentary.", `${gate ? "The deterministic source-originality gate report" : "The independent Editor report"} is authoritative for this repair. Do not invent unsupported causal claims, quotations, identities, numbers, temporal order, policy contents, or geography. Every factual paragraph must carry a reader-facing source link or immediately continuing attribution.`, "The assignment term is an internal planning label and may itself preserve upstream headline syntax. Do not reproduce a four-or-more-word assignment term verbatim in the article body; describe the event independently.", ...(gate ? ["This is a clean-room writer replay. The raw source packet and failed manuscript remain digest-bound customer evidence but are intentionally withheld from the prose model. Evidence cards contain shuffled lexemes and quantities, not sentences or complete propositions. Reconstruct no source syntax or narrative order. When a card does not safely establish a relation, return REPORTING_NEEDED instead of guessing."] : []), `ASSIGNMENT CONTEXT:\n${JSON.stringify(c.assignmentContext)}`, `APPLICABLE OFFICE, DUTY, AND SKILL CONSTRAINTS:\n${c.renderedInstructions}`, `${label}:\n${c.editorReport}`, `${evidenceLabel}:\n${JSON.stringify(writerEvidence)}`, ...(gate ? [] : [`CURRENT BODY:\n${c.currentBody}`])].join("\n\n");
}
export function solicitLissProseRepair(demand) {
    if (demand?.type !== "NewsroomRepairDemand" || !demand.repairContextDigest)
        throw new TypeError("context-bound NewsroomRepairDemand required");
    const prompt = repairPrompt(demand), replayWriter = demand.repairMode === "replay-writer", admissibleTiers = replayWriter ? ["leader-claude"] : ["free-gemini", "free-nim", "leader-claude"], models = replayWriter ? { "leader-claude": "claude-sonnet-4-6" } : { "free-gemini": "gemini-3.1-flash-lite", "free-nim": "meta/llama-3.1-8b-instruct", "leader-claude": "claude-sonnet-4-6" }, request = { id: `urn:liss-job:${digest({ repairDemand: demand.id, repairContext: demand.repairContextDigest, prompt, admissibleTiers, models }).slice(7)}`, type: "RoutedInferenceRequest", executionMode: "live", workType: "inquiry", requiredCapabilities: ["chat"], admissibleTiers, models, maxTokens: 4000, sufficiency: [{ type: "min-chars", value: 3000 }], repairContextDigest: demand.repairContextDigest, messages: [{ role: "system", content: "Return prose only. Reconstruct all language independently from the sources unless using an explicit attributed quotation. Do not claim publication, editorial acceptance, or customer-state mutation." }, { role: "user", content: prompt }] }, body = { type: "ServiceSolicitation", contract: LISS_CONTRACT, request };
    return Object.freeze({ "@context": CONTEXT, id: id({ actor: KOIOS, target: LISS, body }), type: "Offer", actor: KOIOS, target: LISS, object: body });
}
export function acceptExactLissOffer(demand, solicitation, offer) {
    const request = solicitation?.object?.request;
    if (solicitation?.type !== "Offer" || solicitation.actor !== KOIOS || solicitation.target !== LISS || solicitation.object?.type !== "ServiceSolicitation" || solicitation.object.contract !== LISS_CONTRACT || !request)
        throw new TypeError("invalid LISS solicitation");
    if (offer?.type !== "Offer" || offer.actor !== LISS || offer.target !== KOIOS || offer.object?.type !== "ExecutableServiceOffer" || offer.object?.contract !== LISS_CONTRACT || offer.inReplyTo !== solicitation.id || offer.object.sourceActivity !== solicitation.id || offer.object.jobDigest !== digest(request) || digest(offer.object.job) !== digest(request))
        throw new TypeError("provider-issued exact LISS offer required");
    const capability = { type: "Capability", issuer: KOIOS, holder: LISS, invocationTarget: LISS, parentOffer: offer.id, attenuation: { jobDigest: offer.object.jobDigest, buyer: KOIOS }, capTP: { target: LISS, method: "invoke-service" }, allowedActions: ["invoke-service", "provider-local-write"] }, body = { type: "ServiceContract", contract: LISS_CONTRACT, offer, considerationAcceptance: { termDigest: offer.object.considerationDigest, acceptedBy: KOIOS }, capability };
    return Object.freeze({ "@context": CONTEXT, id: id({ actor: KOIOS, target: LISS, body }), type: "Accept", actor: KOIOS, target: LISS, object: body });
}
export function formLissResultInquiry(submission) { if (submission?.type !== "Accept" || submission.actor !== LISS || submission.object?.type !== "InferenceSubmissionResult")
    throw new TypeError("LISS submission acceptance required"); const body = submission.object.resultInquiry; return Object.freeze({ "@context": CONTEXT, id: id({ actor: KOIOS, target: LISS, body }), type: "Question", actor: KOIOS, target: LISS, object: body }); }
export function verifyProseInferenceSettlement(demand, settlement) { const expected = solicitLissProseRepair(demand).object.request, admittedModels = Object.values(expected.models ?? {}), settledModel = settlement?.object?.result?.model; if (settlement?.type !== "Accept" || settlement.actor !== LISS || settlement.object?.type !== "InferenceSettlementResult" || settlement.object?.contract !== LISS_CONTRACT || settlement.object.jobId !== expected.id || settlement.object.jobDigest !== digest(expected) || !nonempty(settlement.object.result?.text))
    throw new TypeError("settlement does not bind a prose repair job"); if (admittedModels.length > 0 && !admittedModels.includes(settledModel))
    throw new TypeError(`settlement used model outside the buyer-admitted set: ${settledModel ?? "unspecified"}`); return Object.freeze({ type: "NewsroomRepairVerification", passed: true, repairDemandDigest: digest(demand), repairContextDigest: demand.repairContextDigest, successorAssignmentId: demand.successor.assignmentId, preservedEvidence: { assignmentDigest: demand.predecessor.assignmentDigest, sourcePacketDigest: demand.predecessor.sourcePacketDigest }, customerMutation: false, nonclaims: ["editorial acceptance", "customer admission", "publication", "customer mutation"] }); }
export async function executeProposedRepair(reading, repairContext, adapters) { const demand = formNewsroomRepairDemand(reading, repairContext); if (demand.type === "NewsroomRepairRefusal")
    return demand; for (const name of ["solicitLiss", "invokeLiss", "queryLiss", "formSuccessorAssignment"])
    if (typeof adapters?.[name] !== "function")
        throw new TypeError(`${name} adapter required`); const solicitation = solicitLissProseRepair(demand), offer = await adapters.solicitLiss(solicitation, demand), contract = acceptExactLissOffer(demand, solicitation, offer), submission = await adapters.invokeLiss(contract, demand), inquiry = formLissResultInquiry(submission), settlement = await adapters.queryLiss(inquiry, demand), verification = verifyProseInferenceSettlement(demand, settlement), successorAssignment = await adapters.formSuccessorAssignment({ demand, settlement, verification }); if (successorAssignment?.assignmentId !== demand.successor.assignmentId || successorAssignment.reopenPredecessor !== false)
    throw new TypeError("assignment adapter did not form successor without reopening predecessor"); return Object.freeze({ type: "ProposedNewsroomRepairExecution", demand, solicitation, contract, submission, inquiry, verification, successorAssignment, customerMutation: false, nonclaims: ["customer admission", "editorial acceptance", "publication"] }); }
//# sourceMappingURL=newsroom-repair-dispatcher.mjs.map