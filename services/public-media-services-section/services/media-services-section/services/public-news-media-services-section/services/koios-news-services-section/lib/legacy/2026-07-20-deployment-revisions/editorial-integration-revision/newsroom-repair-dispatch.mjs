// Koios-owned phase transition from a terminal newsroom learning reading to a
// separately contracted LISS repair, successor assignment, and replay-ready
// manuscript.  LISS supplies prose only; Koios owns context, validation,
// serialization, assignment state, and later independent editorial judgment.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { decodeFrontMatterDocument, encodeFrontMatterDocument } from "@emsenn/organizing-a-content-farm";
import { DEFAULT_CONTENT_DIR, DEFAULT_DATA_DIR } from "../config.mjs";
import { loadPosts } from "../content.mjs";
import { applyBoundedEditorialRepairTools, composeDraftRevisionPrompt, editorRequestsCarrierRepair, latestEditorialReport, renderedDraftRevisionInstructions, } from "../draft-repair.mjs";
import { createSuccessorAssignment, readAssignment, } from "../researching/writing/assignments.mjs";
import { canonicalizeSourceUrls, descriptionFromProse, proseContributionBody, summaryFromProse, } from "../researching/writing/prose-contribution.mjs";
import { readAdmissibleResearchPacket } from "../researching/sourcing/admissible-research-packet-contract.mjs";
import { researchPacket } from "../researching/sourcing/research-packets.mjs";
import { procureLissProse } from "../researching/writing/editing/liss-editorial.mjs";
import { repairManuscriptEditorialSurfaces } from "../researching/writing/editing/standards.mjs";
import { exchangeLissActivity } from "./liss-activitystreams-client.mjs";
import { inspectNewsroomLearning } from "./newsroom-learning.mjs";
import { acceptExactLissOffer, digest, formLissResultInquiry, formNewsroomRepairDemand, solicitLissProseRepair, verifyProseInferenceSettlement, } from "./newsroom-repair-dispatcher.mjs";
import { appendKoiosAct, readKoiosLedger, recordDigest } from "./ledger.mjs";
export { editorRequestsCarrierRepair };
function object(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
function latestTerminalRecord(dataDir, assignmentId) {
    const record = readKoiosLedger(dataDir, "contract-events")
        .filter((candidate) => candidate["subject"] === assignmentId
        && ["newsroom.circuit.refused", "newsroom.circuit.obstructed"].includes(String(candidate["act"] ?? "")))
        .sort((left, right) => String(left["recordedAt"] ?? "").localeCompare(String(right["recordedAt"] ?? "")))
        .at(-1);
    if (record === undefined)
        throw new Error(`assignment ${assignmentId} has no terminal newsroom failure`);
    return record;
}
function readingFor(dataDir, assignmentId, now) {
    const pulse = inspectNewsroomLearning({ dataDir, pulseId: `repair-dispatch:${assignmentId}:${now}`, now });
    const reading = pulse.readings.find((candidate) => candidate.assignmentId === assignmentId);
    if (reading === undefined)
        throw new Error(`learning pulse has no reading for ${assignmentId}`);
    if (!["repair-draft", "replay-writer"].includes(reading.proposedMove)) {
        throw new Error(`learning move ${reading.proposedMove} requires a different service`);
    }
    if (reading.slug === null)
        throw new Error("repairable learning reading has no manuscript slug");
    return Object.freeze({ reading, evidenceDigest: pulse.evidenceDigest });
}
function sourceUrlsFromDocument(document, fallback) {
    const references = Array.isArray(document.frontMatter["references"]) ? document.frontMatter["references"] : [];
    const cited = references.flatMap((reference) => object(reference) && typeof reference["URL"] === "string" ? [reference["URL"]] : []);
    return Object.freeze(cited.length > 0 ? cited : [...fallback]);
}
function refusal(input) {
    const result = Object.freeze({
        kind: "koios.newsroom-repair-dispatch",
        disposition: "refused",
        predecessorAssignmentId: input.assignmentId,
        ...(input.slug === undefined ? {} : { slug: input.slug }),
        reason: input.reason,
    });
    appendKoiosAct({ dataRoot: input.dataDir, ledger: "contract-events", instant: input.now, act: "newsroom.repair.refused", subject: input.assignmentId, data: result });
    return result;
}
function resumableSuccessor(dataDir, contentDir, predecessorAssignmentId) {
    const prior = readKoiosLedger(dataDir, "contract-events")
        .filter((candidate) => candidate["act"] === "newsroom.repair.replay-ready")
        .filter((candidate) => object(candidate["data"]) && candidate["data"]["predecessorAssignmentId"] === predecessorAssignmentId)
        .sort((left, right) => String(left["recordedAt"] ?? "").localeCompare(String(right["recordedAt"] ?? "")))
        .at(-1);
    if (prior === undefined || !object(prior["data"]))
        return undefined;
    const data = prior["data"];
    const successorAssignmentId = typeof prior["subject"] === "string" ? prior["subject"] : undefined;
    const slug = typeof data["slug"] === "string" ? data["slug"] : undefined;
    if (successorAssignmentId === undefined || slug === undefined)
        return undefined;
    try {
        const manuscript = decodeFrontMatterDocument(readFileSync(resolve(contentDir, `${slug}.md`), "utf8"));
        const koios = object(manuscript.frontMatter["koios"]) ? manuscript.frontMatter["koios"] : {};
        if (koios["assignment_id"] !== successorAssignmentId || koios["predecessor_assignment_id"] !== predecessorAssignmentId)
            return undefined;
        readAssignment(dataDir, successorAssignmentId, loadPosts(contentDir));
    }
    catch {
        return undefined;
    }
    return Object.freeze({
        kind: "koios.newsroom-repair-dispatch",
        disposition: "replay-ready",
        predecessorAssignmentId,
        successorAssignmentId,
        slug,
        ...(typeof data["repairDemandDigest"] === "string" ? { repairDemandDigest: data["repairDemandDigest"] } : {}),
        ...(typeof data["repairContextDigest"] === "string" ? { repairContextDigest: data["repairContextDigest"] } : {}),
        ...(typeof data["providerSettlementDigest"] === "string" ? { providerSettlementDigest: data["providerSettlementDigest"] } : {}),
    });
}
export async function dispatchNewsroomRepair(input) {
    const now = input.now ?? new Date().toISOString();
    const dataDir = resolve(input.dataDir ?? DEFAULT_DATA_DIR);
    const contentDir = resolve(input.contentDir ?? DEFAULT_CONTENT_DIR);
    const resume = resumableSuccessor(dataDir, contentDir, input.assignmentId);
    if (resume !== undefined) {
        appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: now, act: "newsroom.repair.resumed", subject: resume.successorAssignmentId, data: { predecessorAssignmentId: input.assignmentId, slug: resume.slug, providerReinvoked: false } });
        return resume;
    }
    let learning;
    try {
        learning = readingFor(dataDir, input.assignmentId, now);
    }
    catch (error) {
        return refusal({ dataDir, now, assignmentId: input.assignmentId, reason: error instanceof Error ? error.message : String(error) });
    }
    const { reading } = learning;
    const slug = reading.slug;
    const path = resolve(contentDir, `${slug}.md`);
    let before;
    let document;
    let assignment;
    let packet;
    let editor;
    let terminal;
    let instructions;
    try {
        before = readFileSync(path, "utf8");
        document = decodeFrontMatterDocument(before);
        assignment = readAssignment(dataDir, input.assignmentId, loadPosts(contentDir));
        const sourceUrls = sourceUrlsFromDocument(document, assignment.sourceUrls);
        packet = readAdmissibleResearchPacket(dataDir, assignment.assignmentId)
            ?? researchPacket({ term: assignment.term, beat: assignment.beat, sourceUrls, limit: Math.max(4, sourceUrls.length) });
        editor = latestEditorialReport(dataDir, slug, recordDigest(before));
        terminal = latestTerminalRecord(dataDir, input.assignmentId);
        instructions = renderedDraftRevisionInstructions();
    }
    catch (error) {
        return refusal({ dataDir, now, assignmentId: input.assignmentId, slug, reason: `repair context could not be formed: ${error instanceof Error ? error.message : String(error)}` });
    }
    const assignmentContext = Object.freeze({
        assignmentId: assignment.assignmentId,
        term: assignment.term,
        beat: assignment.beat,
        priority: assignment.priority,
        summary: assignment.summary ?? null,
        angle: assignment.angle ?? null,
        assignee: assignment.assignee ?? null,
        sourceUrls: Object.freeze([...assignment.sourceUrls]),
        evidence: assignment.evidence ?? null,
    });
    const assignmentDigest = recordDigest(assignmentContext);
    const sourcePacketDigest = recordDigest(packet);
    const repairContext = Object.freeze({
        currentBody: document.body,
        manuscriptDigest: digest(document.body),
        editorReport: editor.report,
        editorJudgmentDigest: editor.digest,
        witnessedResearchPacket: packet,
        sourcePacketDigest,
        assignmentContext,
        assignmentDigest,
        renderedInstructions: instructions,
        instructionsDigest: digest(instructions),
    });
    const enrichedReading = Object.freeze({
        assignmentId: input.assignmentId,
        learningEvidenceDigest: learning.evidenceDigest,
        assignmentDigest,
        sourcePacketDigest,
        terminalCircuitDigest: recordDigest(terminal),
        failureLayer: reading.failureLayer,
        proposedMove: reading.proposedMove,
    });
    const demand = formNewsroomRepairDemand(enrichedReading, repairContext);
    if (demand["type"] === "NewsroomRepairRefusal") {
        return refusal({ dataDir, now, assignmentId: input.assignmentId, slug, reason: `repair demand refused: ${String(demand["code"] ?? "unknown")}` });
    }
    const acceptedDemand = demand;
    if (editor.repairTools.length > 0 || editorRequestsCarrierRepair(editor.report)) {
        const deterministicBefore = readFileSync(path, "utf8");
        const surfaceRepair = editor.repairTools.length > 0
            ? applyBoundedEditorialRepairTools(contentDir, slug, editor.repairTools)
            : repairManuscriptEditorialSurfaces(contentDir, slug);
        const deterministicAfter = readFileSync(path, "utf8");
        if (deterministicAfter !== deterministicBefore) {
            const successor = createSuccessorAssignment(dataDir, {
                predecessorAssignmentId: input.assignmentId,
                successorAssignmentId: String(acceptedDemand["successor"]["assignmentId"]),
                reason: editor.repairTools.length > 0 ? "bounded editor-selected repair tools after terminal newsroom learning" : "deterministic carrier repair after terminal newsroom learning",
                authority: "koios.news/newsroom-learning",
                contract: "newsroom-repair-dispatcher/v4",
                terminalCircuitDigest: recordDigest(terminal),
            }, loadPosts(contentDir), new Date().toISOString());
            const repaired = decodeFrontMatterDocument(deterministicAfter);
            const priorKoios = object(repaired.frontMatter["koios"]) ? repaired.frontMatter["koios"] : {};
            const next = Object.freeze({
                ...repaired,
                frontMatter: Object.freeze({
                    ...repaired.frontMatter,
                    draft: true,
                    koios: Object.freeze({
                        ...priorKoios,
                        assignment_id: successor.assignment.assignmentId,
                        predecessor_assignment_id: input.assignmentId,
                        repair_context_digest: String(acceptedDemand["repairContextDigest"]),
                        gates_clear: false,
                    }),
                }),
            });
            writeFileSync(path, encodeFrontMatterDocument(next), "utf8");
            const after = readFileSync(path, "utf8");
            const providerSettlementDigest = recordDigest({
                kind: "koios.deterministic-carrier-repair",
                changed: surfaceRepair.changed,
                beforeDigest: recordDigest(deterministicBefore),
                afterDigest: recordDigest(after),
            });
            appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: new Date().toISOString(), act: "newsroom.repair.deterministic-ready", subject: successor.assignment.assignmentId, data: {
                    predecessorAssignmentId: input.assignmentId,
                    slug,
                    changed: surfaceRepair.changed,
                    repairDemandDigest: digest(demand),
                    repairContextDigest: String(acceptedDemand["repairContextDigest"]),
                    providerSettlementDigest,
                    customerMutation: true,
                } });
            appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: new Date().toISOString(), act: "newsroom.repair.replay-ready", subject: successor.assignment.assignmentId, data: {
                    predecessorAssignmentId: input.assignmentId,
                    slug,
                    repairDemandDigest: digest(demand),
                    repairContextDigest: String(acceptedDemand["repairContextDigest"]),
                    providerSettlementDigest,
                    beforeDigest: recordDigest(deterministicBefore),
                    afterDigest: recordDigest(after),
                    successorCreated: successor.created,
                    editorialAcceptance: false,
                    publication: false,
                    carrier: editor.repairTools.length > 0 ? "koios-bounded-editorial-repair-tools" : "koios-deterministic-editorial-surfaces",
                } });
            return Object.freeze({
                kind: "koios.newsroom-repair-dispatch",
                disposition: "replay-ready",
                predecessorAssignmentId: input.assignmentId,
                successorAssignmentId: successor.assignment.assignmentId,
                slug,
                repairDemandDigest: digest(demand),
                repairContextDigest: String(acceptedDemand["repairContextDigest"]),
                providerSettlementDigest,
            });
        }
        return refusal({ dataDir, now: new Date().toISOString(), assignmentId: input.assignmentId, slug, reason: "editor requested a carrier-only repair but the deterministic carrier projection was already stable; whole-manuscript inference is forbidden and the projection service requires repair" });
    }
    appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: now, act: "newsroom.repair.lot-issued", subject: input.assignmentId, data: {
            provider: "urn:ame:logical-inference-service-section",
            contract: "inference-fabric-activitystreams-service",
            repairDemandDigest: digest(demand),
            repairContextDigest: String(acceptedDemand["repairContextDigest"]),
            proposedMove: reading.proposedMove,
            customerMutation: false,
        } });
    let settlement;
    try {
        const client = { ...(input.socketPath === undefined ? {} : { socketPath: input.socketPath }), timeoutMilliseconds: 30_000 };
        const solicitation = solicitLissProseRepair(demand);
        const offer = await exchangeLissActivity(solicitation, client);
        if (offer["type"] !== "Offer")
            throw new Error(`LISS refused repair solicitation: ${JSON.stringify(offer["object"] ?? offer)}`);
        const contract = acceptExactLissOffer(demand, solicitation, offer);
        const submission = await exchangeLissActivity(contract, client);
        if (submission["type"] !== "Accept")
            throw new Error(`LISS refused repair invocation: ${JSON.stringify(submission["object"] ?? submission)}`);
        const inquiry = formLissResultInquiry(submission);
        const started = Date.now();
        const timeout = input.timeoutMilliseconds ?? 900_000;
        const poll = input.pollMilliseconds ?? 1_000;
        while (true) {
            settlement = await exchangeLissActivity(inquiry, client);
            if (settlement["type"] === "Accept")
                break;
            const responseObject = object(settlement["object"]) ? settlement["object"] : {};
            if (responseObject["refusalType"] !== "result-not-settled" || responseObject["retryable"] !== true) {
                throw new Error(`LISS repair settlement refused: ${JSON.stringify(responseObject)}`);
            }
            if (Date.now() - started >= timeout)
                throw new Error("LISS repair did not settle before the customer timeout");
            await new Promise((resolveWait) => setTimeout(resolveWait, poll));
        }
        verifyProseInferenceSettlement(demand, settlement);
    }
    catch (error) {
        const socketReason = error instanceof Error ? error.message : String(error);
        try {
            const prompt = composeDraftRevisionPrompt({ editorReport: editor.report, researchPacket: packet, currentBody: document.body, renderedInstructions: instructions });
            const replayWriter = reading.proposedMove === "replay-writer";
            const routed = procureLissProse({
                purpose: `${replayWriter ? "Replay the writer for" : "Repair"} Koios assignment ${input.assignmentId} after terminal newsroom learning.`,
                prompt,
                tiers: replayWriter ? ["leader-claude"] : ["free-gemini", "free-nim", "leader-claude"],
                models: replayWriter ? { "leader-claude": "claude-sonnet-4-6" } : {
                    "free-gemini": "gemini-3.1-flash-lite",
                    "free-nim": "meta/llama-3.1-8b-instruct",
                    "leader-claude": "claude-sonnet-4-6",
                },
                requiredText: [packet.sourceUrls[0]],
                maxTokens: 4_000,
            });
            settlement = Object.freeze({
                "@context": "https://www.w3.org/ns/activitystreams",
                type: "Accept",
                actor: "urn:ame:logical-inference-service-section",
                object: Object.freeze({
                    type: "InferenceSettlementResult",
                    jobId: `compatibility:${digest(demand)}`,
                    jobDigest: digest(demand),
                    result: Object.freeze({ text: routed.text, usage: null, cost: null, selectedTier: routed.selectedTier, selectedProvider: routed.selectedProvider, providerResultDigest: recordDigest(routed.providerResult) }),
                    carrier: "contracted-direct-compatibility",
                }),
            });
            appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: new Date().toISOString(), act: "newsroom.repair.carrier-fallback", subject: input.assignmentId, data: { socketReason: socketReason.slice(0, 800), carrier: "contracted-direct-compatibility", proposedMove: reading.proposedMove, selectedTier: routed.selectedTier, selectedProvider: routed.selectedProvider, customerMutation: false } });
        }
        catch (fallbackError) {
            const reason = `${socketReason}; direct contracted fallback failed: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`;
            appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: new Date().toISOString(), act: "newsroom.repair.obstructed", subject: input.assignmentId, data: { reason, repairDemandDigest: digest(demand), provider: "urn:ame:logical-inference-service-section", customerMutation: false } });
            return Object.freeze({ kind: "koios.newsroom-repair-dispatch", disposition: "obstructed", predecessorAssignmentId: input.assignmentId, slug, reason, repairDemandDigest: digest(demand), repairContextDigest: String(acceptedDemand["repairContextDigest"]) });
        }
    }
    const settlementObject = settlement["object"];
    const providerResult = settlementObject["result"];
    const completion = String(providerResult["text"] ?? "");
    const sourceUrls = packet.sourceUrls;
    let body;
    try {
        body = canonicalizeSourceUrls(proseContributionBody(completion), sourceUrls);
    }
    catch (error) {
        return refusal({ dataDir, now: new Date().toISOString(), assignmentId: input.assignmentId, slug, reason: `LISS prose failed customer parsing: ${error instanceof Error ? error.message : String(error)}` });
    }
    const words = body.split(/\s+/gu).filter(Boolean).length;
    const bodyProblems = [
        ...(sourceUrls.some((url) => body.includes(url)) ? [] : ["repaired prose omitted every witnessed source citation"]),
        ...(words >= 600 ? [] : [`repaired prose returned ${words} words; minimum is 600`]),
        ...(words <= 1_100 ? [] : [`repaired prose returned ${words} words; maximum is 1100`]),
        ...(body.includes("[claim:") ? ["repaired prose leaked internal claim tokens"] : []),
    ];
    if (bodyProblems.length > 0)
        return refusal({ dataDir, now: new Date().toISOString(), assignmentId: input.assignmentId, slug, reason: bodyProblems.join("; ") });
    const current = decodeFrontMatterDocument(readFileSync(path, "utf8"));
    if (digest(current.body) !== repairContext.manuscriptDigest)
        return refusal({ dataDir, now: new Date().toISOString(), assignmentId: input.assignmentId, slug, reason: "manuscript changed after the repair lot was issued" });
    const successor = createSuccessorAssignment(dataDir, {
        predecessorAssignmentId: input.assignmentId,
        successorAssignmentId: String(acceptedDemand["successor"]["assignmentId"]),
        reason: `digest-bound ${reading.proposedMove} after terminal newsroom learning`,
        authority: "koios.news/newsroom-learning",
        contract: "newsroom-repair-dispatcher/v4",
        terminalCircuitDigest: recordDigest(terminal),
    }, loadPosts(contentDir), new Date().toISOString());
    const priorKoios = object(current.frontMatter["koios"]) ? current.frontMatter["koios"] : {};
    const next = Object.freeze({
        ...current,
        frontMatter: Object.freeze({
            ...current.frontMatter,
            draft: true,
            description: descriptionFromProse(body),
            summary: summaryFromProse(body),
            koios: Object.freeze({
                ...priorKoios,
                assignment_id: successor.assignment.assignmentId,
                predecessor_assignment_id: input.assignmentId,
                repair_context_digest: String(acceptedDemand["repairContextDigest"]),
                gates_clear: false,
            }),
        }),
        body: `${body}\n`,
    });
    writeFileSync(path, encodeFrontMatterDocument(next), "utf8");
    const after = readFileSync(path, "utf8");
    const providerSettlementDigest = recordDigest(settlement);
    appendKoiosAct({ dataRoot: dataDir, ledger: "provider-usage", instant: new Date().toISOString(), act: "inference.consumed", subject: `newsroom-repair:${successor.assignment.assignmentId}`, data: {
            assignmentId: successor.assignment.assignmentId,
            predecessorAssignmentId: input.assignmentId,
            slug,
            provider: "urn:ame:logical-inference-service-section",
            contract: "inference-fabric-activitystreams-service",
            providerSettlementDigest,
            jobId: settlementObject["jobId"],
            jobDigest: settlementObject["jobDigest"],
            usage: providerResult["usage"] ?? null,
            cost: providerResult["cost"] ?? null,
            resultBodyRecorded: false,
        } });
    appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: new Date().toISOString(), act: "newsroom.repair.replay-ready", subject: successor.assignment.assignmentId, data: {
            predecessorAssignmentId: input.assignmentId,
            slug,
            repairDemandDigest: digest(demand),
            repairContextDigest: String(acceptedDemand["repairContextDigest"]),
            providerSettlementDigest,
            beforeDigest: recordDigest(before),
            afterDigest: recordDigest(after),
            successorCreated: successor.created,
            editorialAcceptance: false,
            publication: false,
        } });
    return Object.freeze({
        kind: "koios.newsroom-repair-dispatch",
        disposition: "replay-ready",
        predecessorAssignmentId: input.assignmentId,
        successorAssignmentId: successor.assignment.assignmentId,
        slug,
        repairDemandDigest: digest(demand),
        repairContextDigest: String(acceptedDemand["repairContextDigest"]),
        providerSettlementDigest,
    });
}
//# sourceMappingURL=newsroom-repair-dispatch.mjs.map