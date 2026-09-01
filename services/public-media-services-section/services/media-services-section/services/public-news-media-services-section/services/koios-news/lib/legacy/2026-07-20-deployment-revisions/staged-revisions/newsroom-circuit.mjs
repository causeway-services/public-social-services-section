// Koios's resumable newsroom pulse. State is derived from owned ledgers,
// assignments, manuscripts, and exact-byte editorial authority; there is no
// ambient scheduler state for this circuit to remember on Koios's behalf.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { cultivate, decodeFrontMatterDocument, isCultivationObstruction, } from "@emsenn/organizing-a-content-farm";
import { DEFAULT_CONTENT_DIR, DEFAULT_CONTENT_PRODUCTION_CONFIG, DEFAULT_DATA_DIR, } from "../config.mjs";
import { loadPosts } from "../content.mjs";
import { koiosFarmProperty } from "../demand.mjs";
import { repairDraft } from "../draft-repair.mjs";
import { buildStaticPublication, verifyStaticPublication } from "../administrating/deploying/static-shadow.mjs";
import { latestLivePublicationWitness } from "../administrating/deploying/live-publication-witness.mjs";
import { completeAssignment, createAssignment, readAssignment, readAssignmentCommission, readAssignmentDisposition, recordAssignmentDispositionRevalidation, recordAssignmentDisposition, } from "../researching/writing/assignments.mjs";
import { createDraftManuscript } from "../researching/writing/manuscripts.mjs";
import { procureNewswireProse } from "../researching/writing/newswire-prose-contract.mjs";
import { composeNewsroomProse } from "../researching/writing/prose-contribution.mjs";
import { headlineCommissionPrompt, headlineMatchesSourceTitle, selectAccountableHeadline } from "../researching/writing/attention-headline.mjs";
import { readAdmissibleResearchPacket } from "../researching/sourcing/admissible-research-packet-contract.mjs";
import { researchPacket } from "../researching/sourcing/research-packets.mjs";
import { LicensedEditorialStateRefusal, licensedEditorialBrief, procureLicensedEditorialState, } from "../researching/sourcing/licensed-editorial-state-contract.mjs";
import { priorResearchContextBrief, projectPriorResearchForIssue } from "../researching/sourcing/prior-research-contract.mjs";
import { editorialContextDigestForManuscript, judgeManuscriptUnderContract } from "../researching/writing/editing/liss-editorial.mjs";
import { sourceOriginalityFindings, sourceOriginalityMechanismDigest } from "../researching/writing/editing/source-originality.mjs";
import { applyStandardsMetadataDefaults, normalizeManuscriptReferences, publishManuscript, repairManuscriptEditorialSurfaces, repairManuscriptHeadings, repairManuscriptSeoHeading, reviewPublicationAdmission, } from "../researching/writing/editing/standards.mjs";
import { appendDatedRecord, appendKoiosAct, ledgerRootPath, recordDigest } from "./ledger.mjs";
import { commissionForAssignment } from "./editorial-commissioning.mjs";
import { operatingBeatForProduct } from "./audience-product-planning.mjs";
import { assignmentSourceUrls } from "./issue-controller.mjs";
import { settleNewsroomLearningPulse } from "./newsroom-learning.mjs";
import { settlePublicationEconomics } from "./publication-economics.mjs";
const SITE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
function jsonlFiles(root) {
    try {
        return readdirSync(root, { withFileTypes: true }).flatMap((entry) => entry.isDirectory()
            ? jsonlFiles(join(root, entry.name))
            : entry.name.endsWith(".jsonl") ? [join(root, entry.name)] : []);
    }
    catch {
        return [];
    }
}
function circuitActs(dataDir) {
    return [...jsonlFiles(ledgerRootPath(dataDir, "contract-events"))].sort().flatMap((path) => {
        try {
            return readFileSync(path, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line));
        }
        catch {
            return [];
        }
    }).filter((record) => record["kind"] === "koios.ledger-act" && String(record["act"] ?? "").startsWith("newsroom.circuit."));
}
export function admitsSourceOriginalityRevalidation(dataDir, assignmentId, grant) {
    if (grant.currentMechanismDigest !== sourceOriginalityMechanismDigest())
        return false;
    return circuitActs(dataDir).some((record) => {
        if (record["act"] !== "newsroom.circuit.source-originality-refused" || record["subject"] !== assignmentId || recordDigest(record) !== grant.refusalDigest)
            return false;
        const data = record["data"] !== null && typeof record["data"] === "object" && !Array.isArray(record["data"])
            ? record["data"] : undefined;
        const prior = typeof data?.["gateMechanismDigest"] === "string" ? data["gateMechanismDigest"] : null;
        return prior === grant.priorMechanismDigest && prior !== grant.currentMechanismDigest;
    });
}
function currentEditorialJudgment(dataDir, slug, manuscriptDigest, editorialContextDigest) {
    const records = [...jsonlFiles(ledgerRootPath(dataDir, "editorial-judgments"))].sort().flatMap((path) => {
        try {
            return readFileSync(path, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line));
        }
        catch {
            return [];
        }
    });
    const value = records.filter((record) => record["kind"] === "koios.editorial-judgment"
        && record["slug"] === slug
        && record["manuscriptDigest"] === manuscriptDigest
        && record["editorialContextDigest"] === editorialContextDigest
        && record["serviceAccepted"] === true
        && record["contract"] === "independent-editorial-assessment/editorial-assessment/v1"
        && record["toolSelectionValidated"] === true).at(-1);
    return value;
}
function appendPhase(dataDir, now, assignmentId, act, data = {}) {
    appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: now, act, subject: assignmentId, data });
}
function packetFor(assignment, dataDir) {
    const contracted = readAdmissibleResearchPacket(dataDir, assignment.assignmentId);
    if (contracted !== undefined)
        return contracted;
    // Legacy compatibility for assignments formed before the Service Section's
    // admissible-research-packet contract existed. New issue formation must not
    // take this path.
    const broad = researchPacket({
        term: assignment.term,
        beat: assignment.beat,
        ...(assignment.sourceUrls.length === 0 ? {} : { sourceUrls: assignment.sourceUrls }),
    });
    const sourceUrls = assignmentSourceUrls(assignment.term, broad);
    return researchPacket({ term: assignment.term, beat: assignment.beat, sourceUrls, limit: 3 });
}
function draftSlug(result, assignmentId, contentDir) {
    if (!existsSync(join(contentDir, `${result.slug}.md`)))
        return result.slug;
    return `${result.slug}-${recordDigest(assignmentId).replace(/^sha256:/u, "").slice(0, 8)}`;
}
function settleDeterministicForm(contentDir, slug) {
    applyStandardsMetadataDefaults(contentDir, slug);
    normalizeManuscriptReferences(contentDir, slug);
    repairManuscriptHeadings(contentDir, slug);
    repairManuscriptSeoHeading(contentDir, slug);
    repairManuscriptEditorialSurfaces(contentDir, slug);
}
/**
 * Keep checkable manuscript defects out of the independent Editor's context
 * window. A short or script-corrupted body requires a new writer act; any
 * other error surviving Koios's deterministic form settlement means the gate
 * or its carrier adapter needs attention. Warnings remain editorial context.
 */
export function deterministicAdmissionRefusal(findings) {
    const blocking = findings.filter((finding) => finding.severity === "error");
    if (blocking.length === 0)
        return undefined;
    const writerDefect = blocking.some((finding) => ["body-too-short", "script-contamination"].includes(finding.code));
    const failureLayer = writerDefect ? "writer-model" : "deterministic-gates";
    const findingCodes = Object.freeze(blocking.map((finding) => finding.code));
    return Object.freeze({
        failureLayer,
        replayFrom: failureLayer,
        findingCodes,
        reason: blocking.map((finding) => `${finding.code}: ${finding.message}`).join("; "),
    });
}
function sourceTextsFromPacket(packet) {
    return Object.freeze(packet.claims.flatMap((claim) => claim.predicate === "summary"
        && typeof claim.sourceUrl === "string"
        && typeof claim.object === "string"
        && claim.object.trim() !== ""
        ? [Object.freeze({ sourceUrl: claim.sourceUrl, text: claim.object })]
        : []));
}
export function newsroomSourceOriginalityFindings(body, packet) {
    return sourceOriginalityFindings(body, sourceTextsFromPacket(packet));
}
function refuseSourceShapedProse(input) {
    const encodedManuscript = readFileSync(join(input.contentDir, `${input.slug}.md`), "utf8");
    const manuscript = decodeFrontMatterDocument(encodedManuscript);
    const bodyFindings = newsroomSourceOriginalityFindings(manuscript.body, input.packet);
    const headline = typeof manuscript.frontMatter["title"] === "string" ? manuscript.frontMatter["title"] : "";
    const matchingSource = input.packet.intakeSources.find((source) => headlineMatchesSourceTitle(headline, [source.title]));
    const findings = Object.freeze([
        ...(matchingSource === undefined ? [] : [Object.freeze({
                sourceUrl: matchingSource.url,
                draftSentence: headline,
                sourceSentence: matchingSource.title,
                sharedWordCount: headline.split(/\s+/u).filter(Boolean).length,
                wordContainment: 1,
                trigramContainment: 1,
                longestSharedRun: headline.split(/\s+/u).filter(Boolean).length,
            })]),
        ...bodyFindings,
    ]);
    if (findings.length === 0)
        return findings;
    appendPhase(input.dataDir, input.now, input.assignmentId, "newsroom.circuit.source-originality-refused", {
        contract: "koios.news/source-originality-gate/v1",
        slug: input.slug,
        manuscriptDigest: recordDigest(encodedManuscript),
        packetDigest: recordDigest(input.packet),
        gateMechanismDigest: sourceOriginalityMechanismDigest(),
        findingCount: findings.length,
        findings: findings.map((finding) => ({
            sourceUrl: finding.sourceUrl,
            draftSentence: finding.draftSentence,
            sourceSentence: finding.sourceSentence,
            sharedWordCount: finding.sharedWordCount,
            wordContainment: finding.wordContainment,
            trigramContainment: finding.trigramContainment,
            longestSharedRun: finding.longestSharedRun,
        })),
        failureLayer: "writer-model",
        replayFrom: "writer-model",
    });
    return findings;
}
function repairAttemptCount(dataDir, assignmentId) {
    return jsonlFiles(ledgerRootPath(dataDir, "contract-events")).flatMap((path) => {
        try {
            return readFileSync(path, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line));
        }
        catch {
            return [];
        }
    }).filter((record) => record["kind"] === "koios.draft-repair" && record["assignmentId"] === assignmentId).length;
}
function stop(input) {
    if (input.assignmentId !== undefined) {
        if (input.disposition === "refused") {
            recordAssignmentDisposition(input.dataDir, {
                assignmentId: input.assignmentId,
                disposition: "refused",
                reason: input.reason,
                authority: "koios.news/editorial-operation",
                contract: "koios.news/newsroom-circuit-refusal/v1",
            }, input.now);
        }
        appendPhase(input.dataDir, input.now, input.assignmentId, input.disposition === "refused" ? "newsroom.circuit.refused" : "newsroom.circuit.obstructed", {
            reason: input.reason,
            ...(input.slug === undefined ? {} : { slug: input.slug }),
        });
    }
    const learning = input.assignmentId === undefined ? undefined : settleNewsroomLearningPulse({
        dataDir: input.dataDir,
        now: input.now,
        pulseId: `newsroom-terminal:${input.assignmentId}:${input.now}`,
    });
    const issueReading = learning?.readings.find((reading) => reading.assignmentId === input.assignmentId);
    return Object.freeze({
        kind: "koios.newsroom-circuit",
        disposition: input.disposition,
        ...(input.assignmentId === undefined ? {} : { assignmentId: input.assignmentId }),
        ...(input.slug === undefined ? {} : { slug: input.slug }),
        reason: input.reason,
        transitions: Object.freeze([...input.transitions]),
        ...(issueReading === undefined ? {} : { learning: Object.freeze({ evidenceDigest: learning.evidenceDigest, proposedMove: issueReading.proposedMove }) }),
    });
}
export async function runNewsroomCircuit(input = {}) {
    const now = input.now ?? new Date().toISOString();
    const day = now.slice(0, 10);
    const dataDir = resolve(input.dataDir ?? DEFAULT_DATA_DIR);
    const contentDir = resolve(input.contentDir ?? DEFAULT_CONTENT_DIR);
    const transitions = [];
    const posts = () => loadPosts(contentDir);
    let assignment;
    const requested = input.assignmentId;
    if (requested === undefined) {
        return stop({ dataDir, now, disposition: "obstructed", reason: "the newsroom runner requires an exact publication-owned assignment from the issue controller", transitions });
    }
    try {
        assignment = readAssignment(dataDir, requested, posts());
    }
    catch {
        assignment = undefined;
    }
    if (assignment === undefined) {
        return stop({ dataDir, now, disposition: "obstructed", reason: `the issue controller named no readable assignment: ${requested}`, transitions });
    }
    const priorDisposition = readAssignmentDisposition(dataDir, assignment.assignmentId);
    const revalidationAdmitted = priorDisposition?.disposition === "refused"
        && input.sourceOriginalityRevalidation !== undefined
        && admitsSourceOriginalityRevalidation(dataDir, assignment.assignmentId, input.sourceOriginalityRevalidation);
    if (priorDisposition !== undefined && !revalidationAdmitted) {
        return Object.freeze({ kind: "koios.newsroom-circuit", disposition: "refused", assignmentId: assignment.assignmentId, reason: `assignment already ${priorDisposition.disposition}: ${priorDisposition.reason}`, transitions: Object.freeze([]) });
    }
    if (revalidationAdmitted) {
        recordAssignmentDispositionRevalidation(dataDir, {
            assignmentId: assignment.assignmentId,
            refusalDigest: input.sourceOriginalityRevalidation.refusalDigest,
            priorGateMechanismDigest: input.sourceOriginalityRevalidation.priorMechanismDigest,
            gateMechanismDigest: input.sourceOriginalityRevalidation.currentMechanismDigest,
            authority: "koios.news/changed-deterministic-gate",
            contract: "koios.news/source-originality-revalidation/v1",
        }, now);
        appendPhase(dataDir, now, assignment.assignmentId, "newsroom.circuit.source-originality-revalidation-opened", {
            refusalDigest: input.sourceOriginalityRevalidation.refusalDigest,
            priorGateMechanismDigest: input.sourceOriginalityRevalidation.priorMechanismDigest,
            gateMechanismDigest: input.sourceOriginalityRevalidation.currentMechanismDigest,
            authority: "changed-deterministic-gate",
        });
    }
    appendPhase(dataDir, now, assignment.assignmentId, "newsroom.circuit.opened", { status: assignment.status, revalidationAdmitted });
    const commission = readAssignmentCommission(dataDir, assignment.assignmentId)
        ?? commissionForAssignment({ term: assignment.term, beat: assignment.beat });
    const packet = packetFor(assignment, dataDir);
    if (packet.selectedCount === 0) {
        return stop({ dataDir, now, assignmentId: assignment.assignmentId, disposition: "refused", reason: "assignment has no admitted source evidence", transitions });
    }
    let slug = assignment.manuscriptSlug;
    if (slug === undefined) {
        const publicationBeat = operatingBeatForProduct(commission.productClass, assignment.beat);
        let priorResearch;
        try {
            const issueTerms = [...new Set([assignment.term, publicationBeat, ...assignment.term.split(/[^a-z0-9]+/iu).filter((term) => term.length >= 5)])].slice(0, 10);
            priorResearch = projectPriorResearchForIssue({ assignmentId: assignment.assignmentId, terms: issueTerms, dataDir, now: new Date().toISOString(), maxFiles: 8 });
            transitions.push("prior-research-context-admitted");
        }
        catch (error) {
            const reason = error instanceof Error ? error.message : String(error);
            appendPhase(dataDir, new Date().toISOString(), assignment.assignmentId, "prior-research.context.refused", { provider: "corpus-management-team", reason: reason.slice(0, 800), requiredMove: "continue-with-current-event-evidence-or-repair-prior-research-contract" });
            transitions.push("prior-research-context-refused");
        }
        let licensedEditorialState;
        try {
            licensedEditorialState = await procureLicensedEditorialState({
                assignment: {
                    assignmentId: assignment.assignmentId,
                    term: assignment.term,
                    beat: publicationBeat,
                    summary: assignment.summary ?? `Report the ${assignment.term} story from admitted source evidence.`,
                    angle: assignment.angle ?? "Establish the reported event before adding only source-licensed systems interpretation.",
                    sourceUrls: assignment.sourceUrls,
                },
                researchPacket: packet,
                commission,
                now: new Date().toISOString(),
            });
        }
        catch (error) {
            const refusedAt = new Date().toISOString();
            let replacementAssignmentId;
            if (error instanceof LicensedEditorialStateRefusal) {
                const suggested = error.diagnosis.suggestedAssignment;
                if (suggested !== undefined && suggested.term.trim().toLowerCase() !== assignment.term.trim().toLowerCase()) {
                    const replacement = createAssignment(dataDir, {
                        term: suggested.term,
                        beat: publicationBeat,
                        priority: assignment.priority,
                        summary: suggested.summary,
                        angle: suggested.angle,
                        assignee: assignment.assignee ?? "koios-news/writer",
                        sourceUrls: [...suggested.sourceUrls],
                        ...(assignment.evidence === undefined ? {} : { evidence: assignment.evidence }),
                    }, posts());
                    replacementAssignmentId = replacement.assignment.assignmentId;
                    appendDatedRecord({
                        dataRoot: dataDir,
                        ledger: "assignments",
                        instant: refusedAt,
                        record: Object.freeze({
                            kind: "koios.assignment-replanning",
                            at: refusedAt,
                            contract: "licensed-editorial-state-replanning",
                            created: replacement.created,
                            predecessorAssignmentId: assignment.assignmentId,
                            replacementAssignmentId: replacement.assignment.assignmentId,
                        }),
                    });
                    appendPhase(dataDir, refusedAt, replacement.assignment.assignmentId, "newsroom.assignment.nominated", {
                        selectionOrigin: "licensed-editorial-state-replan",
                        predecessorAssignmentId: assignment.assignmentId,
                        term: replacement.assignment.term,
                        beat: replacement.assignment.beat,
                        sourceUrls: [...replacement.assignment.sourceUrls],
                    });
                    transitions.push("assignment-replanned-from-source-event");
                }
                appendDatedRecord({
                    dataRoot: dataDir,
                    ledger: "research-lessons",
                    instant: refusedAt,
                    record: Object.freeze({
                        kind: "koios.research-settlement-refusal",
                        at: refusedAt,
                        assignmentId: assignment.assignmentId,
                        contract: "koios-news-service-section/licensed-editorial-state/v1",
                        code: error.code,
                        reason: error.message,
                        diagnosis: error.diagnosis,
                        ...(replacementAssignmentId === undefined ? {} : { replacementAssignmentId }),
                    }),
                });
                appendPhase(dataDir, refusedAt, assignment.assignmentId, "newsroom.circuit.replan-required", {
                    code: error.code,
                    failureLayer: error.diagnosis.failureLayer,
                    requiredMove: error.diagnosis.requiredMove,
                    replayFrom: error.diagnosis.replayFrom,
                    ...(replacementAssignmentId === undefined ? {} : { replacementAssignmentId }),
                });
            }
            return stop({
                dataDir,
                now: refusedAt,
                assignmentId: assignment.assignmentId,
                disposition: error instanceof LicensedEditorialStateRefusal ? "refused" : "obstructed",
                reason: error instanceof LicensedEditorialStateRefusal
                    ? `licensed editorial state refused [${error.code}]: ${error.message}`
                    : `licensed editorial state contract failed: ${error instanceof Error ? error.message : String(error)}`,
                transitions,
            });
        }
        transitions.push("licensed-editorial-state-formed");
        appendDatedRecord({
            dataRoot: dataDir,
            ledger: "source-claims",
            instant: new Date().toISOString(),
            record: Object.freeze({
                kind: "koios.licensed-editorial-state-admission",
                at: new Date().toISOString(),
                assignmentId: assignment.assignmentId,
                contract: "koios-news-service-section/licensed-editorial-state/v1",
                stateDigest: licensedEditorialState.stateDigest,
                providerExchange: licensedEditorialState.providerExchange,
                commission,
            }),
        });
        const baseProperty = koiosFarmProperty();
        const property = Object.freeze({
            ...baseProperty,
            voice: Object.freeze({
                ...baseProperty.voice,
                laws: Object.freeze([
                    ...(baseProperty.voice.laws ?? []),
                    ...packet.editorialRisks.map((risk) => `RESEARCH PACKET ${risk.severity.toUpperCase()}: ${risk.message}`),
                    licensedEditorialBrief(licensedEditorialState.state, commission.writerPromptLaws),
                    ...(priorResearch === undefined ? [] : [priorResearchContextBrief(priorResearch)]),
                ]),
            }),
        });
        const licensedSourceUrls = new Set(licensedEditorialState.state.assertions.map((assertion) => assertion.sourceUrl));
        const items = packet.intakeSources.filter((source) => licensedSourceUrls.has(source.url)).map((source, index) => Object.freeze({
            kind: "producing-content.syndication-item",
            id: source.subject,
            // The content-farm composition seam ordinarily sends source title and
            // summary straight to its writer. Koios's writer instead receives the
            // licensed clean-room deck above; keep raw source language customer-side
            // for deterministic gates and the independent editor.
            title: `Reporting source ${index + 1} for ${assignment.term}`,
            url: source.url,
            ...(source.published === undefined ? {} : { published: source.published }),
        }));
        let writerReceipt;
        let cultivated;
        try {
            cultivated = await cultivate(property, {
                at: day,
                term: assignment.term,
                beat: publicationBeat,
                items,
                dryRun: true,
                env: process.env,
                compose: composeNewsroomProse,
                ask: (prompt) => {
                    const result = procureNewswireProse({
                        purpose: `Draft Koios manuscript for assignment ${assignment.assignmentId}.`,
                        assignmentId: assignment.assignmentId,
                        assignmentDigest: recordDigest(assignment),
                        prompt,
                        licensedEditorialStateDigest: licensedEditorialState.stateDigest,
                        researchPacketDigest: recordDigest(packet),
                        writingPolicyDigest: recordDigest(JSON.parse(readFileSync(join(SITE_ROOT, "lib", "law", "accountable-attention-and-publication.json"), "utf8"))),
                        stylePolicyDigest: recordDigest(property.voice),
                        requiredSourceUrls: [packet.sourceUrls[0]],
                        admissibleTiers: commission.resourceEnvelope.admissibleWriterTiers,
                        now: new Date().toISOString(),
                        dataDir,
                    });
                    writerReceipt = result;
                    return result.text;
                },
            });
        }
        catch (error) {
            return stop({
                dataDir,
                now: new Date().toISOString(),
                assignmentId: assignment.assignmentId,
                disposition: "obstructed",
                reason: `writer provider invocation failed: ${error instanceof Error ? error.message : String(error)}`,
                transitions,
            });
        }
        if (isCultivationObstruction(cultivated)) {
            return stop({ dataDir, now, assignmentId: assignment.assignmentId, disposition: "obstructed", reason: cultivated.evidence, transitions });
        }
        let headline = cultivated.draft.title;
        let headlineReceipt;
        try {
            const result = procureNewswireProse({
                purpose: `Contribute an accountable headline for assignment ${assignment.assignmentId}.`,
                assignmentId: assignment.assignmentId,
                assignmentDigest: recordDigest(assignment),
                prompt: headlineCommissionPrompt({ assignmentTerm: assignment.term, sourceTitle: packet.intakeSources[0]?.title ?? assignment.term, body: cultivated.draft.body, commission }),
                licensedEditorialStateDigest: licensedEditorialState.stateDigest,
                researchPacketDigest: recordDigest(packet),
                writingPolicyDigest: recordDigest(JSON.parse(readFileSync(join(SITE_ROOT, "lib", "law", "accountable-attention-and-publication.json"), "utf8"))),
                stylePolicyDigest: recordDigest(property.voice),
                requiredSourceUrls: [...packet.sourceUrls],
                shape: "headline",
                admissibleTiers: ["free-groq", "free-gemini", "free-nim"],
                now: new Date().toISOString(),
                dataDir,
            });
            headlineReceipt = result;
            const selection = selectAccountableHeadline({ raw: result.text, fallback: packet.intakeSources[0]?.title ?? assignment.term, assignmentTerm: assignment.term, body: cultivated.draft.body, sourceUrls: packet.sourceUrls });
            headline = selection.selected;
            appendKoiosAct({ dataRoot: dataDir, ledger: "audience-product", instant: new Date().toISOString(), act: selection.accepted ? "attention-surface.headline-selected" : "attention-surface.headline-refused", subject: assignment.assignmentId, data: { commission: commission.genre, selection, provider: result.selectedProvider, tier: result.selectedTier, model: result.model, factualWarrant: false } });
            if (!selection.accepted) {
                return stop({ dataDir, now: new Date().toISOString(), assignmentId: assignment.assignmentId, disposition: "refused", reason: `headline contribution failed accountable-originality admission: ${selection.findings.join("; ")}`, transitions });
            }
        }
        catch (error) {
            appendKoiosAct({ dataRoot: dataDir, ledger: "audience-product", instant: new Date().toISOString(), act: "attention-surface.headline-obstructed", subject: assignment.assignmentId, data: { commission: commission.genre, obstruction: error instanceof Error ? error.message.slice(0, 1200) : String(error).slice(0, 1200), fallback: cultivated.draft.title, factualWarrant: false } });
            return stop({ dataDir, now: new Date().toISOString(), assignmentId: assignment.assignmentId, disposition: "obstructed", reason: `headline service could not deliver independently admissible publication copy: ${error instanceof Error ? error.message : String(error)}`, transitions });
        }
        slug = draftSlug(cultivated, assignment.assignmentId, contentDir);
        const draft = createDraftManuscript(contentDir, {
            title: headline,
            summary: cultivated.draft.summary,
            body: cultivated.draft.body,
            seoTerm: assignment.term,
            beat: publicationBeat,
            assignmentId: assignment.assignmentId,
            references: [...packet.candidateReferences],
            slug,
            date: day,
            tags: [assignment.term, publicationBeat],
            category: publicationBeat,
        });
        slug = draft.slug;
        transitions.push("draft-created");
        appendPhase(dataDir, new Date().toISOString(), assignment.assignmentId, "newsroom.circuit.drafted", { slug, writer: { provider: writerReceipt?.selectedProvider ?? "newswire-editorial-production", tier: writerReceipt?.selectedTier ?? "provider-recorded", model: writerReceipt?.model ?? "provider-recorded", usage: cultivated.usage, ...(cultivated.composition === undefined ? {} : { composition: cultivated.composition }) }, headline: { title: headline, provider: headlineReceipt?.selectedProvider ?? "source-title-fallback", tier: headlineReceipt?.selectedTier ?? "none", model: headlineReceipt?.model ?? "none" }, packetDigest: recordDigest(packet), licensedEditorialStateDigest: licensedEditorialState.stateDigest, ...(priorResearch === undefined ? {} : { priorResearchContextDigest: priorResearch.contextualBundleDigest, priorResearchGapDigest: priorResearch.gapBundleDigest }) });
    }
    if (!existsSync(join(contentDir, `${slug}.md`))) {
        return stop({ dataDir, now, assignmentId: assignment.assignmentId, slug, disposition: "obstructed", reason: "assignment manuscript artifact is missing", transitions });
    }
    settleDeterministicForm(contentDir, slug);
    transitions.push("deterministic-form-settled");
    const maxRepairs = Math.min(input.maxRepairs ?? commission.resourceEnvelope.maximumDraftRepairs, commission.resourceEnvelope.maximumDraftRepairs);
    let repairs = repairAttemptCount(dataDir, assignment.assignmentId);
    while (true) {
        const originality = refuseSourceShapedProse({
            contentDir,
            dataDir,
            now: new Date().toISOString(),
            assignmentId: assignment.assignmentId,
            slug,
            packet,
        });
        if (originality.length > 0) {
            transitions.push("source-originality-refused");
            return stop({
                dataDir,
                now: new Date().toISOString(),
                assignmentId: assignment.assignmentId,
                slug,
                disposition: "refused",
                reason: `source-originality gate found ${originality.length} source-shaped sentence(s); replay from the writer with independent prose or explicit quotation`,
                transitions,
            });
        }
        const admission = reviewPublicationAdmission(contentDir, slug);
        if (admission.publishable)
            break;
        const deterministicRefusal = deterministicAdmissionRefusal(admission.standards.findings);
        if (deterministicRefusal !== undefined) {
            appendPhase(dataDir, new Date().toISOString(), assignment.assignmentId, "newsroom.circuit.deterministic-refused", {
                contract: "koios.news/deterministic-publication-admission/v1",
                slug,
                manuscriptDigest: admission.manuscriptDigest,
                failureLayer: deterministicRefusal.failureLayer,
                replayFrom: deterministicRefusal.replayFrom,
                findingCodes: deterministicRefusal.findingCodes,
            });
            transitions.push("deterministic-admission-refused");
            return stop({
                dataDir,
                now: new Date().toISOString(),
                assignmentId: assignment.assignmentId,
                slug,
                disposition: "refused",
                reason: `deterministic publication admission requires replay from ${deterministicRefusal.replayFrom}: ${deterministicRefusal.reason}`,
                transitions,
            });
        }
        const editorialContextDigest = editorialContextDigestForManuscript({ slug });
        let judgment = currentEditorialJudgment(dataDir, slug, admission.manuscriptDigest, editorialContextDigest);
        if (judgment === undefined) {
            try {
                judgment = judgeManuscriptUnderContract({ slug, now: new Date().toISOString(), model: commission.resourceEnvelope.editorialModel });
            }
            catch (error) {
                return stop({
                    dataDir,
                    now: new Date().toISOString(),
                    assignmentId: assignment.assignmentId,
                    slug,
                    disposition: "obstructed",
                    reason: `independent editorial assessment failed: ${error instanceof Error ? error.message : String(error)}`,
                    transitions,
                });
            }
            transitions.push(`editorial-${judgment.disposition}`);
        }
        if (judgment.publishable)
            continue;
        if (judgment.disposition === "refuse") {
            return stop({ dataDir, now, assignmentId: assignment.assignmentId, slug, disposition: "refused", reason: `editor refused manuscript at ${judgment.pipelineDiagnosis.failureLayer}: ${judgment.summary}`, transitions });
        }
        const boundedEditorToolRepair = judgment.repairTools.length > 0;
        if (repairs >= maxRepairs && !boundedEditorToolRepair) {
            return stop({ dataDir, now, assignmentId: assignment.assignmentId, slug, disposition: "refused", reason: `editorial repair budget exhausted at ${judgment.pipelineDiagnosis.failureLayer}: ${judgment.summary}`, transitions });
        }
        if (["sources", "assignment", "deterministic-gates"].includes(judgment.pipelineDiagnosis.failureLayer)) {
            return stop({ dataDir, now, assignmentId: assignment.assignmentId, slug, disposition: "refused", reason: `repair must replay from ${judgment.pipelineDiagnosis.failureLayer}: ${judgment.summary}`, transitions });
        }
        const freeRepairCredential = process.env["NVIDIA_API_KEY"] ?? process.env["API_KEY_NVIDIA_NIM"] ?? process.env["NVIDIA_NIM_API_KEY"];
        const leaderRepair = judgment.pipelineDiagnosis.failureLayer === "writer-model"
            || repairs > 0
            || assignment.assignmentId.includes(":repair:");
        const provider = leaderRepair || freeRepairCredential === undefined ? "liss" : "property";
        try {
            await repairDraft({
                slug,
                provider,
                ...(leaderRepair ? { inferenceQuality: "leader" } : {}),
                now: new Date().toISOString(),
            });
        }
        catch (error) {
            return stop({ dataDir, now: new Date().toISOString(), assignmentId: assignment.assignmentId, slug, disposition: "obstructed", reason: `draft repair provider invocation failed: ${error instanceof Error ? error.message : String(error)}`, transitions });
        }
        repairs += 1;
        transitions.push(`draft-repaired:${provider}`);
        settleDeterministicForm(contentDir, slug);
    }
    publishManuscript(contentDir, slug);
    transitions.push("published");
    completeAssignment(dataDir, assignment.assignmentId, posts());
    transitions.push("assignment-completed");
    const livePublicationWitness = latestLivePublicationWitness(dataDir);
    const candidate = await buildStaticPublication({ outputDir: resolve(input.outputDir ?? ".static/koios.news-candidate"), replace: true, profile: "cutover-candidate", livePublicationWitness });
    const verification = verifyStaticPublication(candidate);
    transitions.push("static-candidate-projected");
    appendKoiosAct({ dataRoot: dataDir, ledger: "shadow-deliveries", instant: new Date().toISOString(), act: "candidate.projected", subject: assignment.assignmentId, data: { slug, manifestDigest: verification.manifestDigest, routeCount: verification.routeCount, authority: "non-authoritative-cutover-candidate", profile: verification.profile } });
    settlePublicationEconomics({ dataDir, assignmentId: assignment.assignmentId, slug, now: new Date().toISOString() });
    appendPhase(dataDir, new Date().toISOString(), assignment.assignmentId, "newsroom.circuit.completed", { slug, manifestDigest: verification.manifestDigest, transitions });
    const learning = settleNewsroomLearningPulse({ dataDir, now: new Date().toISOString(), pulseId: `newsroom-terminal:${assignment.assignmentId}:${now}` });
    const issueReading = learning.readings.find((reading) => reading.assignmentId === assignment.assignmentId);
    return Object.freeze({
        kind: "koios.newsroom-circuit",
        disposition: "published",
        assignmentId: assignment.assignmentId,
        slug,
        transitions: Object.freeze(transitions),
        candidate: Object.freeze({ manifestDigest: verification.manifestDigest, routeCount: verification.routeCount, outputDir: candidate.outputDir, profile: "cutover-candidate" }),
        ...(issueReading === undefined ? {} : { learning: Object.freeze({ evidenceDigest: learning.evidenceDigest, proposedMove: issueReading.proposedMove }) }),
    });
}
export async function runNewsroomCircuitSafely(input = {}, runner = runNewsroomCircuit) {
    try {
        return await runner(input);
    }
    catch (error) {
        const now = input.now ?? new Date().toISOString();
        const dataDir = resolve(input.dataDir ?? DEFAULT_DATA_DIR);
        const reason = `unexpected internal newsroom service failure: ${error instanceof Error ? error.message : String(error)}`;
        try {
            return stop({
                dataDir,
                now,
                ...(input.assignmentId === undefined ? {} : { assignmentId: input.assignmentId }),
                disposition: "obstructed",
                reason,
                transitions: Object.freeze(["internal-service-failure-settled"]),
            });
        }
        catch {
            // A damaged evidence carrier must not erase the service settlement at
            // the customer boundary. Its missing witness remains explicit here.
            return Object.freeze({
                kind: "koios.newsroom-circuit",
                disposition: "obstructed",
                ...(input.assignmentId === undefined ? {} : { assignmentId: input.assignmentId }),
                reason: `${reason}; obstruction evidence could not be appended`,
                transitions: Object.freeze(["internal-service-failure-settled", "obstruction-evidence-append-failed"]),
            });
        }
    }
}
//# sourceMappingURL=newsroom-circuit.mjs.map