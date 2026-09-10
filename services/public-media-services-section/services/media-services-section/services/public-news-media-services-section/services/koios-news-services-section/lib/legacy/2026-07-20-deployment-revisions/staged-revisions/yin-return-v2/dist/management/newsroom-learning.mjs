// Koios's bounded MAPE-K pulse. It observes only Koios-owned durable records,
// keeps editorial warrant separate from demand and revenue, and proposes a
// next move. It never publishes, replays, changes a route, or amends law.
import { resolve } from "node:path";
import { DEFAULT_DATA_DIR } from "../config.mjs";
import { appendKoiosAct, readKoiosLedger, recordDigest } from "./ledger.mjs";
export const NEWSROOM_LEARNING_CONTRACT = "koios-news/newsroom-learning-pulse/v1";
function validInstant(value) {
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/u.test(value) && !Number.isNaN(Date.parse(value));
}
function object(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value) ? value : undefined;
}
function text(value) {
    return typeof value === "string" ? value : "";
}
function time(record) {
    return text(record["recordedAt"] ?? record["created_at"] ?? record["timestamp"]);
}
function digest(record) {
    return text(record["recordDigest"]) || recordDigest(record);
}
function subjectMatches(record, assignmentId, slug) {
    const data = object(record["data"]);
    const values = [record["subject"], record["assignmentId"], record["slug"], data?.["assignmentId"], data?.["slug"]].map(text);
    const purpose = text(data?.["purpose"]);
    return values.includes(assignmentId)
        || purpose.includes(assignmentId)
        || (slug !== null && (values.includes(slug) || purpose.includes(slug)));
}
function failureLayer(judgment, terminal, events) {
    const direct = text(judgment?.["failureLayer"]);
    if (direct !== "")
        return direct;
    const diagnosis = object(judgment?.["pipelineDiagnosis"]);
    const diagnosed = text(diagnosis?.["failureLayer"]);
    if (diagnosed !== "")
        return diagnosed;
    // A phase gate is closer to the defect than the circuit's terminal prose.
    // Prefer its typed diagnosis instead of reclassifying an English reason
    // (for example, mistaking `source-originality` for bad source custody).
    const phaseDiagnosis = events
        .filter((event) => event !== terminal)
        .map((event) => object(event["data"]))
        .map((data) => text(data?.["failureLayer"]))
        .filter(Boolean)
        .at(-1);
    if (phaseDiagnosis !== undefined)
        return phaseDiagnosis;
    const reason = text(object(terminal?.["data"])?.["reason"]).toLowerCase();
    if (/source|research|evidence/u.test(reason))
        return "source-intelligence";
    if (/provider|route|rate.limit|unavailable/u.test(reason))
        return "provider-route";
    if (/writer.model|writer model/u.test(reason))
        return "writer-model";
    if (/draft.repair|draft repair/u.test(reason))
        return "draft-repair";
    if (/deterministic|gate/u.test(reason))
        return "deterministic-gate";
    return "unclassified";
}
function nextMove(outcome, layer, attentionObserved, revenueObserved) {
    if (outcome === "published") {
        if (!attentionObserved && !revenueObserved)
            return Object.freeze({ move: "observe-more", rationale: "Publication is complete, but no issue-bound attention or revenue observation exists yet; absence of measurement is not negative performance." });
        return Object.freeze({ move: "maintain-policy", rationale: "The issue published and has downstream observation; no production obstruction in this pulse justifies a policy change." });
    }
    if (outcome === "open")
        return Object.freeze({ move: "resume-assignment", rationale: "The assignment has no terminal circuit settlement; resume its owned state before forming replacement work." });
    if (["source-intelligence", "sources"].includes(layer))
        return Object.freeze({ move: "replay-source-intelligence", rationale: "The recorded obstruction is evidentiary; improve the admitted source packet before spending on prose or editorial review." });
    if (layer === "assignment")
        return Object.freeze({ move: "replay-assignment", rationale: "The sources may be sound but do not license the assigned demand; reform the assignment before spending on another manuscript." });
    if (layer === "writer-model")
        return Object.freeze({ move: "replay-writer", rationale: "The recorded failure belongs to manuscript formation; preserve the source packet and replay from the writer boundary." });
    if (layer === "attention-headline")
        return Object.freeze({ move: "repair-headline", rationale: "The accepted body remains digest-bound customer property; commission only a replacement headline and preserve the writer investment exactly." });
    if (layer === "draft-repair")
        return Object.freeze({ move: "repair-draft", rationale: "The sources and thesis survived review; apply bounded manuscript repairs before considering a more expensive full replay." });
    if (["deterministic-gate", "deterministic-gates"].includes(layer))
        return Object.freeze({ move: "review-deterministic-gate", rationale: "The evidence identifies a recurring checkable defect; the Editor-in-Chief may review a gate amendment, but this pulse cannot enact one." });
    if (layer === "editorial-assessment")
        return Object.freeze({ move: "review-editorial-assessment", rationale: "The obstruction belongs to editorial assessment rather than reporting; review that service boundary without weakening publication law." });
    if (layer === "provider-route")
        return Object.freeze({ move: "review-provider-route", rationale: "The provider could not execute the admitted request; review a compatible route without treating refusal as an output-quality observation." });
    return Object.freeze({ move: "review-editorial-assessment", rationale: "The terminal outcome lacks a trustworthy structured failure layer; preserve it as an obstruction and request classification rather than guessing a replay boundary." });
}
function terminalOutcome(record) {
    const act = text(record?.["act"]);
    if (act.endsWith(".completed"))
        return "published";
    if (act.endsWith(".refused"))
        return "refused";
    if (act.endsWith(".obstructed"))
        return "obstructed";
    return "open";
}
export function inspectNewsroomLearning(input) {
    if (input.pulseId.trim() === "")
        throw new Error("learning pulse requires an id");
    if (!validInstant(input.now))
        throw new Error(`learning pulse requires an explicit UTC instant: ${input.now}`);
    const dataDir = resolve(input.dataDir ?? DEFAULT_DATA_DIR);
    const circuit = readKoiosLedger(dataDir, "contract-events").filter((record) => text(record["act"]).startsWith("newsroom.circuit."));
    const judgments = readKoiosLedger(dataDir, "editorial-judgments");
    const provider = readKoiosLedger(dataDir, "provider-usage");
    const attention = readKoiosLedger(dataDir, "attention");
    const revenue = readKoiosLedger(dataDir, "revenue-cost");
    const assignmentIds = [...new Set(circuit.map((record) => text(record["subject"])).filter(Boolean))].sort();
    const readings = assignmentIds.map((assignmentId) => {
        const events = circuit.filter((record) => text(record["subject"]) === assignmentId).sort((left, right) => time(left).localeCompare(time(right)));
        const terminal = events.filter((record) => /newsroom\.circuit\.(completed|refused|obstructed)$/u.test(text(record["act"]))).at(-1);
        const slug = events.map((record) => text(object(record["data"])?.["slug"])).filter(Boolean).at(-1) ?? null;
        const issueJudgments = judgments.filter((record) => slug !== null && text(record["slug"]) === slug).sort((left, right) => time(left).localeCompare(time(right)));
        const judgment = issueJudgments.at(-1);
        const layer = failureLayer(judgment, terminal, events);
        const outcome = terminalOutcome(terminal);
        const issueProvider = provider.filter((record) => subjectMatches(record, assignmentId, slug));
        const attentionObserved = attention.some((record) => subjectMatches(record, assignmentId, slug) && !text(record["act"]).includes("suspended"));
        const revenueObserved = revenue.some((record) => subjectMatches(record, assignmentId, slug) && object(record["data"])?.["revenue"] !== "not-yet-observed");
        const proposed = nextMove(outcome, layer, attentionObserved, revenueObserved);
        return Object.freeze({
            assignmentId,
            slug,
            outcome,
            failureLayer: outcome === "published" ? "none" : layer,
            proposedMove: proposed.move,
            rationale: proposed.rationale,
            evidence: Object.freeze({
                circuitEventDigests: Object.freeze(events.map(digest)),
                editorialJudgmentDigests: Object.freeze(issueJudgments.map(digest)),
                providerReceiptCount: issueProvider.length,
                attentionObserved,
                revenueObserved,
            }),
            safeguards: Object.freeze([
                "attention and revenue do not supply factual warrant",
                "a learning proposal cannot publish or amend newsroom law",
                "provider refusal is not evidence of output insufficiency",
            ]),
        });
    });
    const evidenceDigest = recordDigest(readings.map((reading) => Object.freeze({ assignmentId: reading.assignmentId, evidence: reading.evidence })));
    return Object.freeze({
        kind: "koios.newsroom-learning-pulse",
        contract: NEWSROOM_LEARNING_CONTRACT,
        pulseId: input.pulseId,
        recordedAt: input.now,
        evidenceDigest,
        disposition: readings.length === 0 ? "no-new-evidence" : "proposal",
        readings: Object.freeze(readings),
        authority: "proposal-only",
    });
}
export function settleNewsroomLearningPulse(input) {
    const dataDir = resolve(input.dataDir ?? DEFAULT_DATA_DIR);
    const pulse = inspectNewsroomLearning({ ...input, dataDir });
    const prior = readKoiosLedger(dataDir, "research-lessons").find((record) => record["act"] === "newsroom.learning.proposed" && record["subject"] === pulse.evidenceDigest);
    if (prior === undefined) {
        appendKoiosAct({
            dataRoot: dataDir,
            ledger: "research-lessons",
            instant: input.now,
            act: "newsroom.learning.proposed",
            subject: pulse.evidenceDigest,
            data: pulse,
        });
    }
    return Object.freeze({ ...pulse, settlement: prior === undefined ? "recorded" : "unchanged" });
}
//# sourceMappingURL=newsroom-learning.mjs.map