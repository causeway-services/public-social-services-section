/**
 * articulating/utterance — the base object, base carrier, and base morphism.
 *
 * `Mark` is the opaque atom: an immutable carrier wrapping one present value.
 * Core code never inspects a Mark's payload as ordinary data — only a codec
 * boundary may. A `Token` (left hand) and a `Claim` (right hand) each carry a
 * Mark; an `Utterance = (Token, Claim)` is the base admission carrier; and
 * `articulate` opens the aperiodic articulation category at its potential cell.
 * Every public morphism of relating normalizes back through `Mark → Utterance →
 * articulate`; this module is where that base lives.
 */
/** A mark: an immutable carrier wrapping a single present value. The opaque atom. */
export class Mark {
    kind = "utterance.mark";
    value;
    constructor(value) {
        if (value === undefined)
            throw new TypeError("Mark: value must be present");
        this.value = value;
        Object.freeze(this);
    }
}
/** A token: the immutable left-hand utterance carrier holding one mark. */
export class Token {
    kind = "utterance.token";
    hand = "left";
    mark;
    constructor(mark) {
        this.mark = mark;
        Object.freeze(this);
    }
}
/** A claim: the immutable right-hand utterance carrier holding one mark. */
export class Claim {
    kind = "utterance.claim";
    hand = "right";
    mark;
    constructor(mark) {
        this.mark = mark;
        Object.freeze(this);
    }
}
/** Constructs a Mark wrapping the given value. */
export function mark(value) {
    return new Mark(value);
}
/** Constructs a Token from the given mark. */
export function token(markCarrier) {
    return new Token(markCarrier);
}
/** Constructs a Claim from the given mark. */
export function claim(markCarrier) {
    return new Claim(markCarrier);
}
/** Constructs an utterance carrier from two marks: left becomes a token, right a claim. */
export function utterance(left, right) {
    return Object.freeze({ kind: "utterance.carrier", token: token(left), claim: claim(right) });
}
/** Whether two mark payloads coincide: identical primitives, or structurally
 *  equal plain JSON. This is the only place core code reads a Mark payload, and
 *  it reads it only to judge coincidence — never to branch on its content.
 *
 *  Structural (value) coincidence, not reference identity: this package is
 *  boundary-first, so carriers are routinely reconstructed from JSON with no
 *  shared references. Coincidence must survive a transport round-trip; reference
 *  identity would not. (This is the one deliberate divergence from the prior
 *  reference-identity carrier coincidence.) */
export function coincides(left, right) {
    if (Object.is(left, right))
        return true;
    if (left === null || right === null || typeof left !== "object" || typeof right !== "object")
        return false;
    if (Array.isArray(left) || Array.isArray(right)) {
        if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length)
            return false;
        return left.every((item, index) => coincides(item, right[index]));
    }
    const leftKeys = Object.keys(left).sort();
    const rightKeys = Object.keys(right).sort();
    if (leftKeys.length !== rightKeys.length || !leftKeys.every((key, index) => key === rightKeys[index]))
        return false;
    return leftKeys.every((key) => coincides(left[key], right[key]));
}
/** Judges whether two tokens coincide: a witness when their marks coincide, else an obstruction. */
export function tokenIdentity(left, right) {
    return coincides(left.mark.value, right.mark.value)
        ? Object.freeze({ kind: "utterance.coincidence:witness", left, right })
        : Object.freeze({ kind: "utterance.coincidence-obstruction", left, right });
}
/** Judges whether two claims coincide: a witness when their marks coincide, else an obstruction. */
export function claimIdentity(left, right) {
    return coincides(left.mark.value, right.mark.value)
        ? Object.freeze({ kind: "utterance.coincidence:witness", left, right })
        : Object.freeze({ kind: "utterance.coincidence-obstruction", left, right });
}
/**
 * Articulates an utterance carrier: opens the aperiodic articulation category at
 * its potential cell. The token and claim are fixed by the carrier; neither slot
 * is filled at this initial object. This is the base morphism.
 */
export function articulate(carrier) {
    const pairing = Object.freeze([Object.freeze([]), Object.freeze([])]);
    return Object.freeze({
        kind: "utterance.articulation.cell",
        potentialAperiodicArticulationCell: Object.freeze([carrier, pairing]),
    });
}
/** Type guard: the aperiodic articulation shape with a potential cell whose slots are empty. */
export function isArticulationCell(value) {
    const kind = "kind" in value ? value.kind : undefined;
    const cell = "potentialAperiodicArticulationCell" in value ? value.potentialAperiodicArticulationCell : undefined;
    return kind === "utterance.articulation.cell"
        && Array.isArray(cell)
        && cell.length === 2
        && typeof cell[0] === "object"
        && cell[0] !== null
        && "kind" in cell[0]
        && cell[0].kind === "utterance.carrier"
        && Array.isArray(cell[1])
        && cell[1].length === 2
        && Array.isArray(cell[1][0])
        && cell[1][0].length === 0
        && Array.isArray(cell[1][1])
        && cell[1][1].length === 0;
}
//# sourceMappingURL=utterance.mjs.map