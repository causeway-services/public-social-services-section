/**
 * codecs/datom — the received/query row: EAVT plus a reading.
 *
 * A JSONL sibling of EAVT (you ASSERT EAVT and RECEIVE Datoms). The object datom
 * `{e,a,v,tx,op}` carries an assert/retract op; folding a datom log yields the
 * current value (CQRS read-model) and the paraconsistent section (present/absent
 * evidence per cell → potential/active/stable). Self-contained over JSON.
 */
import { createHash } from "node:crypto";
import { canonical, parseLines, requireJsonValue, serializeLines } from "./json.mjs";
/** Whether a value is shaped like a datom tuple. */
export function isDatomShape(value) {
    return Array.isArray(value) && value.length === 5;
}
/** Coerce a value to a datom tuple, or throw. */
export function toDatom(value) {
    if (isDatomShape(value))
        return [value[0], value[1], value[2], value[3], value[4]];
    throw new TypeError("datom: expected [entity, attribute, value, time, reading]");
}
/** A datom from an EAVT tuple and a reading. */
export const datom = (eavt, reading) => [eavt[0], eavt[1], eavt[2], eavt[3], reading];
/** Parse datom JSONL. */
export const parse = (content) => parseLines(content).map(toDatom);
/** Serialize datoms as JSONL. */
export const serialize = (datoms) => serializeLines(datoms);
/** The assert op. */
export const ASSERT = "assert";
/** The retract op. */
export const RETRACT = "retract";
/** Witness a value as an object datom `{e,a,v,tx,op}`, or throw. */
export function assertObjectDatom(value) {
    const record = requireJsonValue(value, "object datom");
    if (!record || typeof record !== "object" || Array.isArray(record))
        throw new TypeError("object datom must be a JSON object");
    const object = record;
    const keys = Object.keys(object).sort();
    if (keys.join(",") !== "a,e,op,tx,v")
        throw new TypeError(`object datom must be exactly {e,a,v,tx,op}, got ${keys.join(",")}`);
    const rawOp = object["op"];
    if (rawOp !== ASSERT && rawOp !== RETRACT)
        throw new TypeError(`object datom op must be "assert" or "retract", got ${JSON.stringify(rawOp)}`);
    return Object.freeze({ e: object["e"], a: object["a"], v: object["v"], tx: object["tx"], op: rawOp });
}
/** An assert datom fact. */
export function assertDatomFact(e, a, v, tx) {
    return Object.freeze({ e, a, v, tx, op: ASSERT });
}
/** A retract datom fact. */
export function retractDatomFact(e, a, v, tx) {
    return Object.freeze({ e, a, v, tx, op: RETRACT });
}
/** The content identity of an object datom. */
export function objectDatomId(value) {
    return createHash("sha256").update(canonical(assertObjectDatom(value)), "utf8").digest("hex");
}
/** The current (live) cell values after folding assert/retract. */
export function currentDatomValue(datoms) {
    const live = new Map();
    for (const d of datoms) {
        const asserted = assertObjectDatom(d);
        const fact = Object.freeze({ e: asserted.e, a: asserted.a, v: asserted.v });
        const key = canonical(fact);
        if (asserted.op === RETRACT)
            live.delete(key);
        else
            live.set(key, fact);
    }
    return [...live.values()];
}
/** The object datoms as of a transaction time. */
export function objectDatomsAsOf(datoms, asOf) {
    return datoms.map(assertObjectDatom).filter((d) => String(d.tx) <= String(asOf));
}
/** Fold an object-datom log into the paraconsistent section. */
export function foldObjectDatoms(datoms) {
    const cells = new Map();
    const asserted = datoms.map(assertObjectDatom);
    for (const d of asserted) {
        const key = canonical({ e: d.e, a: d.a, v: d.v });
        const cell = cells.get(key) ?? { datom: d, positive: new Map(), negative: new Map() };
        const evidence = d.op === ASSERT ? cell.positive : cell.negative;
        evidence.set(canonical(d.tx), d.tx);
        cells.set(key, cell);
    }
    const sectionCells = [...cells.values()].map(({ datom: d, positive, negative }) => {
        const present = [...positive.values()];
        const absent = [...negative.values()];
        return Object.freeze({
            subject: d.e,
            predicate: d.a,
            object: d.v,
            value: present.length > 0 && absent.length > 0 ? "stable" : present.length > 0 ? "potential" : "active",
            evidence: Object.freeze([Object.freeze(present), Object.freeze(absent)]),
        });
    }).sort((left, right) => canonical(left.subject).localeCompare(canonical(right.subject))
        || canonical(left.predicate).localeCompare(canonical(right.predicate))
        || canonical(left.object).localeCompare(canonical(right.object)));
    return Object.freeze({ datoms: Object.freeze(asserted), cells: Object.freeze(sectionCells) });
}
/** The present-side witnesses of a cell in a folded section. */
export function objectDatomWitnesses(section, cell) {
    const subject = "subject" in cell ? cell.subject : cell.e;
    const predicate = "predicate" in cell ? cell.predicate : cell.a;
    const object = "object" in cell ? cell.object : cell.v;
    const key = canonical({ e: requireJsonValue(subject, "cell subject"), a: requireJsonValue(predicate, "cell predicate"), v: requireJsonValue(object, "cell object") });
    const found = section.cells.find((candidate) => canonical({ e: candidate.subject, a: candidate.predicate, v: candidate.object }) === key);
    return found?.evidence[0] ?? Object.freeze([]);
}
//# sourceMappingURL=datom.mjs.map