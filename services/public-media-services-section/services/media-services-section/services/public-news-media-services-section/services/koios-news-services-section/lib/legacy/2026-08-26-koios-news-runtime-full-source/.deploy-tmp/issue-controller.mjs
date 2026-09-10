// Publication-owned issue initiation.
//
// One exact ActivityStreams pulse becomes one existing/new assignment or one
// typed refusal. The controller owns attention and assignment formation only.
// It does not draft, edit, publish, deploy, select an inference provider, or
// write any provider's territory.
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { DEFAULT_CONTENT_DIR, DEFAULT_CONTENT_PRODUCTION_CONFIG, DEFAULT_DATA_DIR, } from "../config.mjs";
import { loadPosts } from "../content.mjs";
import { demandTable, readSearchConsole } from "../demand.mjs";
import { ViewTrace } from "../views.mjs";
import { googleTrendsProbe, keywordDiscoveryReading, sourceDrivenNominations } from "../researching/sourcing/discovery.mjs";
import { procureAdmissibleResearchPacket, readAdmissibleResearchPacket } from "../researching/sourcing/admissible-research-packet-contract.mjs";
import { refreshSourceCorpus } from "../researching/sourcing/newscable-contract.mjs";
import { projectPriorResearchForIssue } from "../researching/sourcing/prior-research-contract.mjs";
import { researchPacket } from "../researching/sourcing/research-packets.mjs";
import { createAssignment, previewAssignment, readActionableAssignments, readAssignments } from "../researching/writing/assignments.mjs";
import { appendDatedRecord, appendKoiosAct, latestKoiosAct, ledgerRootPath, readKoiosLedger, recordDigest } from "./ledger.mjs";
import { inspectNewsroomLearning } from "./newsroom-learning.mjs";
import { operatingBeatForProduct, planAudienceProducts, productClassFor, productPerformanceReading } from "./audience-product-planning.mjs";
import { commissionForAssignment } from "./editorial-commissioning.mjs";
export const ACTIVITYSTREAMS_CONTEXT = "https://www.w3.org/ns/activitystreams";
export const PUBLICATION_ACTOR = "https://koios.news/activitypub/actor";
export const ISSUE_CONTROLLER_CONTRACT = "koios.news/publication-issue-pulse/v1";
export const NEWSROOM_RUNNER = "https://koios.news/a2a/newsroom-runner";
const BEATS = new Set(["technology", "economy", "culture", "politics", "war", "environment", "degrowth", "decolonization", "sports"]);
const DEMAND_GLUE = new Set(["and", "for", "from", "into", "of", "on", "the", "to", "with"]);
/** Preserve exploration breadth before audience allocation. Source body depth
 * ranks candidates within a product, but it must not let verbose feeds erase
 * an entire product line before the product planner can compare it. */
export function diversifySourceNominations(nominations, options = {}) {
    const maximumPerProduct = options.maximumPerProduct ?? 12;
    const maximumTotal = options.maximumTotal ?? 96;
    const counts = new Map();
    const selected = [];
    for (const nomination of nominations) {
        const product = productClassFor({ term: nomination.term, beat: nomination.beat, title: nomination.title, sourceUrls: [nomination.url] });
        const count = counts.get(product) ?? 0;
        if (count >= maximumPerProduct)
            continue;
        counts.set(product, count + 1);
        selected.push(nomination);
        if (selected.length >= maximumTotal)
            break;
    }
    return Object.freeze(selected);
}
function validInstant(value) {
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/u.test(value) && !Number.isNaN(Date.parse(value));
}
function jsonlFiles(root) {
    try {
        return Object.freeze(readdirSync(root, { withFileTypes: true }).flatMap((entry) => entry.isDirectory()
            ? jsonlFiles(join(root, entry.name))
            : entry.name.endsWith(".jsonl") ? [join(root, entry.name)] : []));
    }
    catch {
        return Object.freeze([]);
    }
}
function priorSettlement(dataDir, demandDigest) {
    for (const path of [...jsonlFiles(ledgerRootPath(dataDir, "contract-events"))].sort().reverse()) {
        try {
            for (const line of readFileSync(path, "utf8").split("\n").filter(Boolean).reverse()) {
                const value = JSON.parse(line);
                const data = value["data"];
                if (value["kind"] === "koios.ledger-act"
                    && value["act"] === "issue.controller.settled"
                    && value["subject"] === demandDigest
                    && data?.["response"] !== null
                    && typeof data?.["response"] === "object"
                    && !Array.isArray(data["response"]))
                    return data["response"];
            }
        }
        catch { /* malformed history cannot erase another valid settlement */ }
    }
    return undefined;
}
function inspectPolicy(value) {
    if (value === null || typeof value !== "object" || Array.isArray(value))
        return undefined;
    const policy = value;
    const permitted = Array.isArray(policy["permittedBeats"]) ? policy["permittedBeats"] : [];
    const sensitive = Array.isArray(policy["sensitiveBeats"]) ? policy["sensitiveBeats"] : [];
    const triggerAuthorities = Array.isArray(policy["triggerAuthorities"]) ? policy["triggerAuthorities"] : [];
    const law = Array.isArray(policy["law"]) ? policy["law"] : [];
    if (policy["kind"] !== "koios.news.publication-issue-policy"
        || policy["version"] !== 1
        || policy["maxIssuesPerPulse"] !== 1
        || !Number.isInteger(policy["maxOpenAssignments"]) || Number(policy["maxOpenAssignments"]) < 1
        || typeof policy["minimumHoursBetweenNewIssues"] !== "number" || policy["minimumHoursBetweenNewIssues"] < 0
        || typeof policy["freshnessWindowDays"] !== "number" || policy["freshnessWindowDays"] <= 0 || policy["freshnessWindowDays"] > 30
        || !["source-driven", "measured-demand-and-source"].includes(String(policy["selectionMode"] ?? ""))
        || typeof policy["sourceRefreshAuthorized"] !== "boolean"
        || !triggerAuthorities.every((authority) => authority !== null
            && typeof authority === "object"
            && !Array.isArray(authority)
            && typeof authority["actor"] === "string"
            && String(authority["actor"]).trim() !== ""
            && typeof authority["capability"] === "string"
            && String(authority["capability"]).trim() !== "")
        || permitted.length === 0 || !permitted.every((beat) => typeof beat === "string" && BEATS.has(beat))
        || !sensitive.every((beat) => typeof beat === "string" && permitted.includes(beat))
        || !law.every((entry) => typeof entry === "string" && entry.trim() !== ""))
        return undefined;
    return policy;
}
function issueDemand(activity) {
    const object = activity["object"];
    if (object === null || typeof object !== "object" || Array.isArray(object))
        return undefined;
    const demand = object;
    const policy = inspectPolicy(demand["policy"]);
    if (demand["type"] !== "NewsroomIssueDemand" || typeof demand["pulseId"] !== "string" || demand["pulseId"].trim() === "" || policy === undefined || typeof demand["policyDigest"] !== "string")
        return undefined;
    return Object.freeze({ pulseId: demand["pulseId"], policy, policyDigest: demand["policyDigest"] });
}
/** Pure authority check for work, such as resuming a pending release, which
 * must happen before the issue controller is allowed to form new work. */
export function inspectAdmittedIssuePulse(activity) {
    if (activity["@context"] !== ACTIVITYSTREAMS_CONTEXT || activity["type"] !== "Create" || activity["target"] !== PUBLICATION_ACTOR)
        return undefined;
    const demand = issueDemand(activity);
    if (demand === undefined || recordDigest(demand.policy) !== demand.policyDigest)
        return undefined;
    const actor = activity["actor"];
    const capability = activity["capability"];
    if (typeof actor !== "string" || typeof capability !== "string" || !demand.policy.triggerAuthorities.some((authority) => authority.actor === actor && authority.capability === capability))
        return undefined;
    return Object.freeze({ actor, capability, pulseId: demand.pulseId, policyDigest: demand.policyDigest, activityDigest: recordDigest(activity) });
}
function response(activity, now, type, object) {
    return Object.freeze({
        "@context": ACTIVITYSTREAMS_CONTEXT,
        type,
        actor: PUBLICATION_ACTOR,
        target: activity["actor"],
        published: now,
        object: Object.freeze({ type: "IssuePulseSettlement", contract: ISSUE_CONTROLLER_CONTRACT, ...object }),
    });
}
function alreadyUsedSourceUrls(assignments, posts) {
    const urls = new Set();
    for (const assignment of assignments)
        for (const url of assignment.sourceUrls)
            urls.add(url);
    for (const post of posts) {
        const references = post.document.frontMatter["references"];
        if (!Array.isArray(references))
            continue;
        for (const value of references) {
            if (value !== null && typeof value === "object" && !Array.isArray(value)) {
                const url = value["URL"];
                if (typeof url === "string")
                    urls.add(url);
            }
        }
    }
    return urls;
}
function distinctiveTerms(term) {
    return Object.freeze([...new Set(term.toLowerCase().split(/[^a-z0-9]+/u).filter((word) => word.length > 2 && !DEMAND_GLUE.has(word)))]);
}
export function packetSupportsAssignment(term, packet) {
    const required = distinctiveTerms(term);
    if (required.length < 2)
        return false;
    return packet.intakeSources.some((source) => {
        const evidence = `${source.title} ${source.summary ?? ""}`.toLowerCase();
        return required.every((word) => evidence.includes(word));
    });
}
export function assignmentSourceUrls(term, packet) {
    const required = distinctiveTerms(term);
    const ranked = packet.intakeSources.map((source) => {
        const evidence = `${source.title} ${source.summary ?? ""}`.toLowerCase();
        return Object.freeze({ source, support: required.filter((word) => evidence.includes(word)).length });
    }).sort((left, right) => right.support - left.support || right.source.score - left.source.score);
    if ((ranked[0]?.support ?? 0) < required.length)
        return Object.freeze([]);
    const contextFloor = Math.max(2, Math.ceil(required.length / 2));
    const urls = [];
    for (const { source, support } of ranked) {
        if (urls.length > 0 && support < contextFloor)
            continue;
        if (!urls.includes(source.url))
            urls.push(source.url);
        if (urls.length >= 3)
            break;
    }
    return Object.freeze(urls);
}
function packetForAssignment(assignment, configPath) {
    const broad = researchPacket({ term: assignment.term, beat: assignment.beat, sourceUrls: assignment.sourceUrls, configPath });
    const sourceUrls = assignmentSourceUrls(assignment.term, broad);
    return researchPacket({ term: assignment.term, beat: assignment.beat, sourceUrls, limit: 3, configPath });
}
function cadenceRefusal(dataDir, policy, now) {
    const last = latestKoiosAct(dataDir, "contract-events", "newsroom.circuit.completed");
    const lastAt = typeof last?.["recordedAt"] === "string" ? Date.parse(last["recordedAt"]) : Number.NaN;
    if (!Number.isFinite(lastAt))
        return undefined;
    const nextAt = lastAt + policy.minimumHoursBetweenNewIssues * 3_600_000;
    if (Date.parse(now) >= nextAt)
        return undefined;
    return Object.freeze({ code: "cadence-window-open", reason: `publication policy permits the next new issue at ${new Date(nextAt).toISOString()}` });
}
export function selectRepairableBacklog(dataDir, now) {
    const events = readKoiosLedger(dataDir, "contract-events");
    const completedRepairs = new Set(events.flatMap((entry) => {
        if (entry["act"] !== "newsroom.repair-replay.settled")
            return [];
        const data = entry["data"];
        if (data === null || typeof data !== "object" || Array.isArray(data))
            return [];
        if (!["released", "published"].includes(String(data["disposition"] ?? "")))
            return [];
        return [String(data["predecessorAssignmentId"] ?? "")];
    }).filter(Boolean));
    const repairAttempts = new Map();
    for (const entry of events) {
        if (entry["act"] !== "newsroom.repair-replay.settled")
            continue;
        const data = entry["data"];
        if (data === null || typeof data !== "object" || Array.isArray(data))
            continue;
        const predecessor = String(data["predecessorAssignmentId"] ?? "");
        const successor = String(data["successorAssignmentId"] ?? "");
        if (predecessor !== "" && successor !== "") {
            const attempts = repairAttempts.get(predecessor) ?? new Set();
            attempts.add(successor);
            repairAttempts.set(predecessor, attempts);
        }
    }
    const pulse = inspectNewsroomLearning({ dataDir, pulseId: `issue-repair-selection:${now}`, now });
    const priority = new Map([["repair-draft", 0], ["replay-writer", 1]]);
    return pulse.readings
        .filter((reading) => ["refused", "obstructed"].includes(reading.outcome))
        .filter((reading) => priority.has(reading.proposedMove))
        .filter((reading) => !completedRepairs.has(reading.assignmentId))
        .filter((reading) => (repairAttempts.get(reading.assignmentId)?.size ?? 0) < 3)
        .sort((left, right) => (priority.get(left.proposedMove) ?? 99) - (priority.get(right.proposedMove) ?? 99) || left.assignmentId.localeCompare(right.assignmentId))[0];
}
/** A completed circuit is the terminal witness even when an older
 * assignment-state projection missed its corresponding transition. Queue
 * capacity follows the causal record, not a stale projection. */
export function completedCircuitAssignmentIds(dataDir) {
    return new Set(readKoiosLedger(dataDir, "contract-events").flatMap((entry) => (entry["act"] === "newsroom.circuit.completed" && typeof entry["subject"] === "string"
        ? [entry["subject"]]
        : [])));
}
async function selectCandidates(input) {
    const permitted = new Set(input.policy.permittedBeats);
    const used = alreadyUsedSourceUrls(input.assignments, input.posts);
    const selected = [];
    const seenPrimaryUrls = new Set();
    if (input.policy.selectionMode === "measured-demand-and-source") {
        const views = new ViewTrace(join(input.dataDir, "journals", "logs", "views.jsonl")).counts();
        for (const candidate of demandTable({ posts: input.posts, views, searchConsole: readSearchConsole(input.dataDir) })) {
            if (!permitted.has(candidate.beat))
                continue;
            const packet = researchPacket({ term: candidate.term, beat: candidate.beat, configPath: input.configPath });
            if (packet.selectedCount === 0 || !packetSupportsAssignment(candidate.term, packet))
                continue;
            const sourceUrls = assignmentSourceUrls(candidate.term, packet);
            const primaryUrl = sourceUrls[0];
            if (primaryUrl === undefined || sourceUrls.every((url) => used.has(url)) || seenPrimaryUrls.has(primaryUrl))
                continue;
            seenPrimaryUrls.add(primaryUrl);
            selected.push(Object.freeze({
                origin: "measured-demand",
                term: candidate.term,
                beat: candidate.beat,
                priority: candidate.score,
                summary: `Report the ${candidate.term} story for the ${candidate.beat} beat from Koios-owned wire evidence.`,
                angle: "Preserve the source warrant while connecting the event to its larger systems.",
                sourceUrls,
                packet: researchPacket({ term: candidate.term, beat: candidate.beat, sourceUrls, limit: 3, configPath: input.configPath }),
                evidence: { views: candidate.evidence.views, impressions: candidate.evidence.impressions, clicks: candidate.evidence.clicks, covered: candidate.evidence.covered > 0 },
            }));
            if (selected.length >= 6)
                break;
        }
    }
    const sourceNominations = diversifySourceNominations(await sourceDrivenNominations({
        configPath: input.configPath,
        excludedUrls: used,
        now: input.now,
        maxAgeDays: input.policy.freshnessWindowDays,
        // The provider's evidence-depth ordering is useful within a product but
        // entertainment and other terse feeds appear much deeper in that order.
        // Admit a broad read-only pool, then preserve bounded product breadth.
        limit: 240,
    }));
    for (const nomination of sourceNominations) {
        if (!permitted.has(nomination.beat))
            continue;
        const broad = researchPacket({ term: nomination.term, beat: nomination.beat, sourceUrls: [nomination.url], configPath: input.configPath });
        const sourceUrls = assignmentSourceUrls(nomination.term, broad);
        const primaryUrl = sourceUrls[0];
        if (primaryUrl === undefined || seenPrimaryUrls.has(primaryUrl) || !packetSupportsAssignment(nomination.term, broad))
            continue;
        seenPrimaryUrls.add(primaryUrl);
        selected.push(Object.freeze({
            origin: "source-desk",
            term: nomination.term,
            beat: nomination.beat,
            priority: nomination.priority,
            summary: `Report the source-desk nomination “${nomination.title}” from Koios-owned wire evidence.`,
            angle: "Establish the nominated event first. Add systems interpretation only where the admitted sources warrant it.",
            sourceUrls,
            packet: researchPacket({ term: nomination.term, beat: nomination.beat, sourceUrls, limit: 3, configPath: input.configPath }),
            evidence: { views: 0, impressions: 0, clicks: 0, covered: false },
            title: nomination.title,
            nomination,
        }));
    }
    const attentionProbe = await googleTrendsProbe({});
    const discovery = await keywordDiscoveryReading({ configPath: input.configPath, contentDir: input.contentDir, now: () => input.now, trends: attentionProbe });
    const productPlan = planAudienceProducts({
        candidates: selected,
        posts: input.posts,
        trends: [...discovery.trends.novel, ...discovery.trends.reinforcing],
        performance: productPerformanceReading({
            posts: input.posts,
            attention: readKoiosLedger(input.dataDir, "attention"),
            revenueCost: readKoiosLedger(input.dataDir, "revenue-cost"),
        }),
        now: input.now,
    });
    return Object.freeze({ candidates: productPlan.candidates, productReading: productPlan.reading, attentionProbe });
}
export async function settleIssuePulse(activity, options = {}) {
    const now = options.now ?? new Date().toISOString();
    if (!validInstant(now))
        throw new Error(`issue controller requires an explicit UTC instant: ${now}`);
    const dataDir = resolve(options.dataDir ?? DEFAULT_DATA_DIR);
    const contentDir = resolve(options.contentDir ?? DEFAULT_CONTENT_DIR);
    const configPath = resolve(options.configPath ?? DEFAULT_CONTENT_PRODUCTION_CONFIG);
    const demandDigest = recordDigest(activity);
    const prior = priorSettlement(dataDir, demandDigest);
    if (prior !== undefined) {
        appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: now, act: "issue.controller.replayed", subject: demandDigest, data: { contract: ISSUE_CONTROLLER_CONTRACT, originalResponseDigest: recordDigest(prior) } });
        return prior;
    }
    const demand = issueDemand(activity);
    let settled;
    if (activity["@context"] !== ACTIVITYSTREAMS_CONTEXT || activity["type"] !== "Create" || activity["target"] !== PUBLICATION_ACTOR) {
        settled = response(activity, now, "Reject", { code: "wrong-boundary", reason: "pulse must be an ActivityStreams Create<NewsroomIssueDemand> addressed to the publication" });
    }
    else if (demand === undefined) {
        settled = response(activity, now, "Reject", { code: "invalid-demand", reason: "pulse must carry an exact publication issue policy and pulse identifier" });
    }
    else if (recordDigest(demand.policy) !== demand.policyDigest) {
        settled = response(activity, now, "Reject", { code: "policy-mismatch", reason: "publication policy bytes do not match the supplied policy digest", pulseId: demand.pulseId });
    }
    else if (typeof activity["actor"] !== "string"
        || typeof activity["capability"] !== "string"
        || !demand.policy.triggerAuthorities.some((authority) => authority.actor === activity["actor"] && authority.capability === activity["capability"])) {
        settled = response(activity, now, "Reject", {
            code: "unauthorized-trigger",
            reason: "pulse actor and capability are not admitted by the exact publication issue policy",
            pulseId: demand.pulseId,
            policyDigest: demand.policyDigest,
        });
    }
    else {
        const posts = loadPosts(contentDir);
        const completedCircuits = completedCircuitAssignmentIds(dataDir);
        let assignments = readAssignments(dataDir, posts).filter((assignment) => !completedCircuits.has(assignment.assignmentId));
        const permitted = new Set(demand.policy.permittedBeats);
        const open = readActionableAssignments(dataDir, posts).filter((assignment) => !completedCircuits.has(assignment.assignmentId) && permitted.has(assignment.beat));
        let assignment;
        let packet;
        let selectionOrigin = "existing-open-assignment";
        let sourceRefresh;
        let sourceRefreshDelivery;
        if (open.length > demand.policy.maxOpenAssignments) {
            settled = response(activity, now, "Reject", {
                code: "open-assignment-capacity-exceeded",
                reason: `publication holds ${open.length} open assignments under a policy permitting ${demand.policy.maxOpenAssignments}`,
                pulseId: demand.pulseId,
                policyDigest: demand.policyDigest,
                requiredMove: "settle, refuse, or explicitly supersede the existing assignment backlog before forming another issue",
                openAssignments: open
                    .sort((left, right) => right.priority - left.priority || left.createdAt.localeCompare(right.createdAt))
                    .map(({ assignmentId, status, beat, term, priority }) => ({ assignmentId, status, beat, term, priority })),
            });
        }
        else {
            assignment = open.sort((left, right) => right.priority - left.priority || left.createdAt.localeCompare(right.createdAt))[0];
        }
        if (settled === undefined && assignment === undefined) {
            const cadence = cadenceRefusal(dataDir, demand.policy, now);
            if (cadence !== undefined) {
                settled = response(activity, now, "Reject", { ...cadence, pulseId: demand.pulseId, policyDigest: demand.policyDigest });
            }
            else {
                if (settled === undefined && demand.policy.sourceRefreshAuthorized) {
                    try {
                        const refreshed = refreshSourceCorpus({ configPath, dataDir, now });
                        sourceRefreshDelivery = refreshed.providerDelivery;
                        sourceRefresh = { contract: refreshed.contract, deliveryDigest: refreshed.deliveryDigest, offered: refreshed.offered, admitted: refreshed.admitted, duplicates: refreshed.duplicates, collisions: refreshed.collisions, refused: refreshed.refused };
                    }
                    catch (error) {
                        settled = response(activity, now, "Reject", { code: "source-refresh-refused", reason: error instanceof Error ? error.message.slice(0, 800) : String(error).slice(0, 800), pulseId: demand.pulseId, policyDigest: demand.policyDigest });
                    }
                }
                if (settled === undefined) {
                    const selection = await selectCandidates({ policy: demand.policy, configPath, dataDir, contentDir, now, assignments, posts });
                    appendDatedRecord({
                        dataRoot: dataDir,
                        ledger: "audience-product",
                        instant: now,
                        record: Object.freeze({
                            ...selection.productReading,
                            pulseId: demand.pulseId,
                            policyDigest: demand.policyDigest,
                            attentionProbe: selection.attentionProbe,
                        }),
                    });
                    const candidates = selection.candidates;
                    if (candidates.length === 0) {
                        settled = response(activity, now, "Reject", { code: "no-fresh-warranted-candidate", reason: "owned demand and admitted source custody produced no unused assignment with a fully supported event spine", pulseId: demand.pulseId, policyDigest: demand.policyDigest, ...(sourceRefresh === undefined ? {} : { sourceRefresh }) });
                    }
                    else {
                        const failures = [];
                        for (const selected of candidates.slice(0, 6)) {
                            const productDecision = selection.productReading.rankedCandidates.find((reading) => reading.term === selected.term && reading.beat === selected.beat);
                            const assignmentBeat = productDecision === undefined ? selected.beat : operatingBeatForProduct(productDecision.productClass, selected.beat);
                            const commission = commissionForAssignment({ term: selected.term, beat: assignmentBeat, ...(selected.title === undefined ? {} : { title: selected.title }) });
                            const assignmentInput = {
                                term: selected.term,
                                beat: assignmentBeat,
                                priority: selected.priority,
                                summary: selected.summary,
                                angle: selected.angle,
                                assignee: "koios-news/writer",
                                sourceUrls: [...selected.sourceUrls],
                                evidence: selected.evidence,
                            };
                            const prospective = previewAssignment(dataDir, assignmentInput, posts, now);
                            try {
                                if (sourceRefreshDelivery === undefined)
                                    throw new Error("the issue pulse carries no exact Newscable provider delivery for source-intelligence composition");
                                const issueTerms = [...new Set([prospective.term, prospective.beat, ...prospective.term.split(/[^a-z0-9]+/iu).filter((term) => term.length >= 5)])].slice(0, 10);
                                const priorResearch = projectPriorResearchForIssue({ assignmentId: prospective.assignmentId, terms: issueTerms, dataDir, now, maxFiles: 8, requireProviderDelivery: true });
                                const admitted = await procureAdmissibleResearchPacket({ assignment: prospective, currentEvidence: sourceRefreshDelivery, priorResearch, commission, now, dataDir, maximumAgeHours: demand.policy.freshnessWindowDays * 24 });
                                const admittedAssignmentInput = Object.freeze({ ...assignmentInput, sourceUrls: Object.freeze([...admitted.packet.sourceUrls]) });
                                const admittedProspective = previewAssignment(dataDir, admittedAssignmentInput, posts, now);
                                if (admittedProspective.assignmentId !== prospective.assignmentId)
                                    throw new Error("assignment identity changed when corroborating source custody was attached");
                                const created = createAssignment(dataDir, admittedAssignmentInput, posts, now);
                                if (created.assignment.assignmentId !== admittedProspective.assignmentId)
                                    throw new Error("assignment identity changed between source-intelligence settlement and assignment creation");
                                selectionOrigin = selected.origin;
                                assignment = created.assignment;
                                assignments = readAssignments(dataDir, posts);
                                packet = admitted.packet;
                                appendDatedRecord({ dataRoot: dataDir, ledger: "assignments", instant: now, record: Object.freeze({ kind: "koios.assignment-selection", at: now, contract: ISSUE_CONTROLLER_CONTRACT, created: created.created, assignmentId: assignment.assignmentId, selectionOrigin, policyDigest: demand.policyDigest, researchPacketContract: "koios-news-service-section/admissible-research-packet/v1", packetDigest: admitted.packetDigest, refusedCandidateCount: failures.length, commission, ...(productDecision === undefined ? {} : { productDecision }) }) });
                                appendDatedRecord({ dataRoot: dataDir, ledger: "source-claims", instant: now, record: Object.freeze({ kind: "koios.assignment-research-packet", at: now, assignmentId: assignment.assignmentId, selectionOrigin, contract: "koios-news-service-section/admissible-research-packet/v1", ...(selected.nomination === undefined ? {} : { nomination: selected.nomination }), packet }) });
                                break;
                            }
                            catch (error) {
                                const reason = error instanceof Error ? error.message.slice(0, 1200) : String(error).slice(0, 1200);
                                const failure = Object.freeze({ prospectiveAssignmentId: prospective.assignmentId, term: prospective.term, beat: prospective.beat, selectionOrigin: selected.origin, reason });
                                failures.push(failure);
                                appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: now, act: "source-intelligence.candidate-refused", subject: prospective.assignmentId, data: failure });
                            }
                        }
                        if (assignment === undefined) {
                            settled = response(activity, now, "Reject", {
                                code: "source-intelligence-refused",
                                reason: `source intelligence refused ${failures.length} bounded candidates without forming an assignment; first refusal: ${String(failures[0]?.["reason"] ?? "unknown provider obstruction")}`,
                                pulseId: demand.pulseId,
                                policyDigest: demand.policyDigest,
                                failures,
                                requiredMove: "refresh evidence or repair the earliest shared provider obstruction before the next pulse",
                            });
                        }
                    }
                }
            }
        }
        else if (settled === undefined && assignment !== undefined) {
            packet = readAdmissibleResearchPacket(dataDir, assignment.assignmentId) ?? packetForAssignment(assignment, configPath);
        }
        if (settled === undefined && assignment !== undefined && packet !== undefined) {
            if (packet.selectedCount === 0 || !packetSupportsAssignment(assignment.term, packet)) {
                settled = response(activity, now, "Reject", { code: "assignment-evidence-no-longer-admissible", reason: "the open assignment no longer projects a source packet supporting its whole lens", pulseId: demand.pulseId, assignmentId: assignment.assignmentId, policyDigest: demand.policyDigest });
            }
            else {
                const packetDigest = recordDigest(packet);
                settled = response(activity, now, "Accept", {
                    disposition: "assigned",
                    pulseId: demand.pulseId,
                    policyDigest: demand.policyDigest,
                    assignmentId: assignment.assignmentId,
                    assignmentDigest: recordDigest(assignment),
                    packetDigest,
                    sourceUrls: [...assignment.sourceUrls],
                    selectionOrigin,
                    openAssignmentCount: readActionableAssignments(dataDir, posts).filter((candidate) => !completedCircuits.has(candidate.assignmentId)).length,
                    ...(sourceRefresh === undefined ? {} : { sourceRefresh }),
                    next: Object.freeze({ type: "IssueWorkDemand", target: NEWSROOM_RUNNER, assignmentId: assignment.assignmentId, requiredContract: "koios-news-service-section/licensed-editorial-state/v1", packetDigest }),
                });
            }
        }
    }
    if (settled === undefined)
        throw new Error("issue controller reached no typed settlement");
    appendKoiosAct({
        dataRoot: dataDir,
        ledger: "contract-events",
        instant: now,
        act: "issue.controller.settled",
        subject: demandDigest,
        data: {
            contract: ISSUE_CONTROLLER_CONTRACT,
            disposition: settled["type"] === "Accept" ? "assigned" : "refused",
            responseDigest: recordDigest(settled),
            response: settled,
            resourceAccounting: { execution: "deterministic-local", marginalPriceUsd: "unmeasured", leaderContributedCoordination: "not-observed-by-runtime" },
        },
    });
    return settled;
}
//# sourceMappingURL=issue-controller.mjs.map