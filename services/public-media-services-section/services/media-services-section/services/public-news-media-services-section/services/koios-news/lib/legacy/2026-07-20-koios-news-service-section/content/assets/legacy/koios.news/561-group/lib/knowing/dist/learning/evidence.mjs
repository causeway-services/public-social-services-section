// evidence.mts — learning evidence is a sequence of articulated claims; its
// bedrock form is a sequence of utterances.
//
// A learning-evidence item names a cell `subject -predicate-> object` plus an
// opaque provenance carried only at the learning layer. Its bedrock form is the
// single utterance articulating the cell — a relational token mark `{subject,
// object}` for a three-place entry, the diagonal (`subject` alone) for a two-place
// one. An entry carries NO charge: charges are measured from the induced world,
// never seeded, and a contrary fact is its own entry claiming a contrary
// predicate. Derived on @emsenn/relating's mark/utterance only.
import { articulate, fixedPointReadings, fixedPoints, predicate, predicationSite, posit, sectionOf, } from "@emsenn/relating";
import { mark, cellIdentity, utterance } from "@emsenn/relating";
import { task as knowingTask } from "../dreaming/task.mjs";
/** The single utterance a learning-evidence item articulates: relational when the
 *  item is three-place, diagonal when it is two-place. */
export function utterEvidence(entry) {
    const tokenMark = entry.object === undefined
        ? mark(entry.subject)
        : mark({ subject: entry.subject, object: entry.object });
    return utterance(tokenMark, mark(entry.predicate));
}
/** The utterances of a whole learning-evidence set, in entry order. */
export function utterEvidenceSet(entries) {
    return Object.freeze(entries.map(utterEvidence));
}
const chargeNameOfCarrier = (carrier) => {
    const [truth, falsity] = carrier.value;
    if (truth.name === "present")
        return falsity.name === "present" ? "stable" : "potential";
    return falsity.name === "present" ? "active" : "absurd";
};
const sameCell = (left, right) => cellIdentity(left, right).kind === "predication.identity:witness";
const predicateMatches = (predicate, value) => predicate.mark.value === value;
const taskOfEvidence = (entry) => knowingTask(utterEvidence(entry));
const evidenceKey = (entry) => JSON.stringify([entry.subject, entry.predicate, entry.object ?? null]);
/**
 * Derive lessons per distinct evidence cell: induce the world the evidence
 * utters, then read each cell's measured charge from the knowledge-least section.
 * Charges are derived from the settled world, never admitted as evidence.
 */
export function deriveLessons(entries) {
    if (entries.length === 0)
        return Object.freeze([]);
    const memory = new LessonMemory().admit(...utterEvidenceSet(entries));
    const readings = new Map();
    const order = [];
    for (const entry of entries) {
        const key = evidenceKey(entry);
        let accumulator = readings.get(key);
        if (accumulator === undefined) {
            accumulator = {
                subject: entry.subject,
                predicate: entry.predicate,
                object: entry.object,
                task: taskOfEvidence(entry),
                provenance: [],
            };
            readings.set(key, accumulator);
            order.push(key);
        }
        if (entry.provenance !== undefined)
            accumulator.provenance.push(entry.provenance);
    }
    const section = memory.section();
    return Object.freeze(order.map((key) => {
        const accumulator = readings.get(key);
        const matched = section.entries.find((entry) => sameCell(entry.cell, accumulator.task.cell));
        return Object.freeze({
            subject: accumulator.subject,
            predicate: accumulator.predicate,
            ...(accumulator.object === undefined ? {} : { object: accumulator.object }),
            value: matched === undefined ? "absurd" : chargeNameOfCarrier(matched.charge),
            provenance: Object.freeze([...accumulator.provenance]),
        });
    }));
}
/**
 * Append-only utterance memory for learning evidence. It admits utterances
 * accretively, recalls them by projected task cell, and only induces sections on
 * explicit reads.
 */
export class LessonMemory {
    #log = [];
    admit(...utterances) {
        this.#log.push(...utterances);
        return this;
    }
    recall(subject, predicate, object) {
        return this.#log.filter((carrier) => taskMatches(knowingTask(carrier), subject, predicate, object));
    }
    has(subject, predicate, object) {
        return this.#log.some((carrier) => taskMatches(knowingTask(carrier), subject, predicate, object));
    }
    get size() {
        return this.#log.length;
    }
    get utterances() {
        return Object.freeze([...this.#log]);
    }
    carrier() {
        if (this.#log.length === 0)
            throw new TypeError("LessonMemory.carrier: an empty memory founds no world");
        return settleLearningUtterances(this.#log);
    }
    section(order = "knowledge", bound = "least") {
        const readings = this.carrier();
        if (order === "knowledge")
            return sectionOf(bound === "least" ? readings.knowledgeLeast : readings.knowledgeGreatest);
        return sectionOf(bound === "least" ? readings.truthLeast : readings.truthGreatest);
    }
}
function taskMatches(task, subject, predicate, object) {
    const carrier = task.utterance;
    if (!predicateMatches(task.predicate, predicate))
        return false;
    const tokenValue = carrier.token.mark.value;
    if (object === undefined)
        return tokenValue === subject;
    return typeof tokenValue === "object"
        && tokenValue !== null
        && !Array.isArray(tokenValue)
        && tokenValue.subject === subject
        && tokenValue.object === object;
}
function settleLearningUtterances(utterances) {
    const generated = utterances.map((carrier) => predicate(articulate(carrier)));
    const predicated = predicationSite(generated.flatMap((site) => [...site.cells.cells, ...site.specializations]));
    const posited = posit(predicated);
    return fixedPointReadings(fixedPoints(posited));
}
//# sourceMappingURL=evidence.mjs.map