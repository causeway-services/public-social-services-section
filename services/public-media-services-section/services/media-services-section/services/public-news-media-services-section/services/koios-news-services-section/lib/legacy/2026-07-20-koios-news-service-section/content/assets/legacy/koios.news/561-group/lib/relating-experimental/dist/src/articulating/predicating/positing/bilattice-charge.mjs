/**
 * positing/bilattice-charge — the four-valued bilattice of charge.
 *
 * Belnap's FOUR as a charge: a pair of independent sides (truth, falsity), each
 * "absent" or "present", naming `absurd` (neither), `potential` (truth only),
 * `active` (falsity only), `stable` (both). A `ChargeCarrier` also bears the
 * evidence — the witness Marks — accumulated on each side. Two orders share the
 * underlying sides: the KNOWLEDGE order grows both sides; the TRUTH order grows
 * truth and shrinks falsity. Negation swaps the sides; conflation complements and
 * swaps; together with identity and their composite they form the Klein-four
 * gauge group acting on the values.
 *
 * Charges are never admitted directly — they are constructed from evidence and
 * joined; positing/settling derive them. Evidence is deduped by STRUCTURAL
 * content coincidence (this package is content-addressed and boundary-first), so
 * two witnesses with equal payloads count once and survive a transport round-trip.
 */
import { coincides, Mark } from "../../utterance.mjs";
/** All charge side names. */
export const chargeSideNames = Object.freeze(["absent", "present"]);
/** All charge value names. */
export const chargeValueNames = Object.freeze(["absurd", "potential", "active", "stable"]);
/** Construct a charge side. */
export const chargeSide = (name) => Object.freeze({ kind: "bilattice-charge.side", name });
const chargeCoordinatesByName = {
    absurd: ["absent", "absent"],
    potential: ["present", "absent"],
    active: ["absent", "present"],
    stable: ["present", "present"],
};
/** Construct a charge value by name, resolving its side coordinates. */
export function chargeValue(name) {
    const [truth, falsity] = chargeCoordinatesByName[name];
    return Object.freeze({
        kind: "bilattice-charge.value",
        name,
        coordinates: Object.freeze([chargeSide(truth), chargeSide(falsity)]),
    });
}
/** All four charge values. */
export const chargeValues = Object.freeze(chargeValueNames.map(chargeValue));
/** The finite-algebra carrier of the charge bilattice. */
export const chargeFiniteAlgebra = Object.freeze({
    kind: "bilattice-charge.finiteAlgebra",
    sides: Object.freeze(chargeSideNames.map(chargeSide)),
    values: chargeValues,
});
/** The name of a charge side. */
export const chargeSideName = (side) => side.name;
/** The name of a charge value. */
export const chargeValueName = (value) => value.name;
const sameSide = (left, right) => left.name === right.name;
const presentSide = (side) => sameSide(side, chargeSide("present"));
const absentSide = (side) => sameSide(side, chargeSide("absent"));
const joinSide = (left, right) => presentSide(left) || presentSide(right) ? chargeSide("present") : chargeSide("absent");
const meetSide = (left, right) => presentSide(left) && presentSide(right) ? chargeSide("present") : chargeSide("absent");
const complementSide = (side) => presentSide(side) ? chargeSide("absent") : chargeSide("present");
const leqSide = (left, right) => absentSide(left) || presentSide(right);
/** Whether a string names a charge value. */
export function isChargeValueName(value) {
    return Object.prototype.hasOwnProperty.call(chargeCoordinatesByName, value);
}
/** Whether a string names a charge side. */
export function isChargeSideName(value) {
    return value === "absent" || value === "present";
}
/** Type guard for a charge side. */
export function isChargeSide(value) {
    const kind = "kind" in value ? value.kind : undefined;
    const name = "name" in value ? value.name : undefined;
    return kind === "bilattice-charge.side" && typeof name === "string" && isChargeSideName(name);
}
/** Type guard for a charge value. */
export function isChargeValue(value) {
    const kind = "kind" in value ? value.kind : undefined;
    const name = "name" in value ? value.name : undefined;
    const coordinates = "coordinates" in value ? value.coordinates : undefined;
    return kind === "bilattice-charge.value"
        && typeof name === "string"
        && isChargeValueName(name)
        && Array.isArray(coordinates)
        && coordinates.length === 2
        && typeof coordinates[0] === "object" && coordinates[0] !== null && isChargeSide(coordinates[0])
        && typeof coordinates[1] === "object" && coordinates[1] !== null && isChargeSide(coordinates[1]);
}
/** Type guard for a charge carrier. */
export function isCharge(value) {
    const kind = "kind" in value ? value.kind : undefined;
    const chargeValue = "value" in value ? value.value : undefined;
    const evidence = "evidence" in value ? value.evidence : undefined;
    return kind === "bilattice-charge.carrier"
        && Array.isArray(chargeValue) && chargeValue.length === 2
        && typeof chargeValue[0] === "object" && chargeValue[0] !== null && isChargeSide(chargeValue[0])
        && typeof chargeValue[1] === "object" && chargeValue[1] !== null && isChargeSide(chargeValue[1])
        && Array.isArray(evidence) && evidence.length === 2
        && Array.isArray(evidence[0]) && Array.isArray(evidence[1])
        && evidence[0].every((witness) => witness instanceof Mark)
        && evidence[1].every((witness) => witness instanceof Mark);
}
/** Coerce a string to a charge value name, or throw. */
export function asChargeValueName(value) {
    if (!isChargeValueName(value)) {
        throw new TypeError(`not a bilattice charge value name: ${JSON.stringify(value)} (expected one of ${chargeValueNames.join(", ")})`);
    }
    return value;
}
/** Coerce a value or name to a charge value. */
export function asChargeValue(value) {
    if (typeof value === "object" && isChargeValue(value))
        return value;
    return chargeValue(asChargeValueName(value));
}
/** Construct a charge carrier from a value and optional evidence. */
export function charge(value, evidence = [[], []]) {
    const [truth, falsity] = value.coordinates;
    return Object.freeze({
        kind: "bilattice-charge.carrier",
        value: Object.freeze([truth, falsity]),
        evidence: Object.freeze([Object.freeze([...evidence[0]]), Object.freeze([...evidence[1]])]),
    });
}
/** The coordinate pair a charge carries. */
export const present = (c) => c.value;
/** Whether two charge values name the same value. */
export const sameChargeValue = (left, right) => left.name === right.name;
/** Whether two charge carriers denote the same value. */
export function sameCharge(left, right) {
    return sameChargeValue(valueOf(left), valueOf(right));
}
/** The charge value named by a carrier's coordinates. */
export function valueOf(c) {
    const [truth, falsity] = c.value;
    if (presentSide(truth) && presentSide(falsity))
        return chargeValue("stable");
    if (presentSide(truth))
        return chargeValue("potential");
    if (presentSide(falsity))
        return chargeValue("active");
    return chargeValue("absurd");
}
/** The knowledge-order bottom: absurd with no evidence. */
export const bottom = charge(chargeValue("absurd"));
/** A potential carrier whose truth side carries the given witness. */
export const witnessedPotential = (witness) => charge(chargeValue("potential"), [[witness], []]);
/** Negate a charge: swap truth and falsity sides and their evidence. */
export function negate(c) {
    return Object.freeze({
        kind: "bilattice-charge.carrier",
        value: Object.freeze([c.value[1], c.value[0]]),
        evidence: Object.freeze([c.evidence[1], c.evidence[0]]),
    });
}
/** Conflate a charge: complement and swap both sides, keeping evidence. */
export function conflate(c) {
    return Object.freeze({
        kind: "bilattice-charge.carrier",
        value: Object.freeze([complementSide(c.value[1]), complementSide(c.value[0])]),
        evidence: c.evidence,
    });
}
// Evidence merges by structural content coincidence (content-addressed), so equal
// payloads count once and survive a JSON round-trip.
const mergeEvidence = (left, right) => {
    const out = [];
    for (const witness of [...left, ...right])
        if (!out.some((item) => coincides(item.value, witness.value)))
            out.push(witness);
    return Object.freeze(out);
};
const combine = (truth, falsity) => (left, right) => Object.freeze({
    kind: "bilattice-charge.carrier",
    value: Object.freeze([truth(left.value[0], right.value[0]), falsity(left.value[1], right.value[1])]),
    evidence: Object.freeze([mergeEvidence(left.evidence[0], right.evidence[0]), mergeEvidence(left.evidence[1], right.evidence[1])]),
});
/** Knowledge-order join: both sides grow. */
export const joinKnowledge = combine(joinSide, joinSide);
/** Knowledge-order meet: both sides shrink. */
export const meetKnowledge = combine(meetSide, meetSide);
/** Truth-order join: truth grows, falsity shrinks. */
export const joinTruth = combine(joinSide, meetSide);
/** Truth-order meet: truth shrinks, falsity grows. */
export const meetTruth = combine(meetSide, joinSide);
/** Knowledge-order join of values (evidence ignored). */
export const joinKnowledgeValue = (left, right) => valueOf(joinKnowledge(charge(left), charge(right)));
/** Knowledge-order meet of values. */
export const meetKnowledgeValue = (left, right) => valueOf(meetKnowledge(charge(left), charge(right)));
/** Truth-order join of values. */
export const joinTruthValue = (left, right) => valueOf(joinTruth(charge(left), charge(right)));
/** Truth-order meet of values. */
export const meetTruthValue = (left, right) => valueOf(meetTruth(charge(left), charge(right)));
/** Negation of a charge value. */
export const negateValue = (value) => valueOf(negate(charge(value)));
/** Conflation of a charge value. */
export const conflateValue = (value) => valueOf(conflate(charge(value)));
/** Whether left ≤ right in the knowledge order. */
export function leqKnowledge(left, right) {
    return leqSide(left.value[0], right.value[0]) && leqSide(left.value[1], right.value[1]);
}
/** The right charge of a pair when left ≤ right in the knowledge order, else throw. */
export function compareKnowledge(pair) {
    if (!leqKnowledge(pair.left, pair.right)) {
        throw new TypeError("compareKnowledge: no knowledge-order witness; left has knowledge not present in right");
    }
    return pair.right;
}
/** The knowledge-order join of a pair, accumulating evidence. */
export const aggregate = (pair) => joinKnowledge(pair.left, pair.right);
/** Whether left ≤ right in the truth order (truth grows, falsity shrinks). */
export function leqTruth(left, right) {
    return leqSide(left.value[0], right.value[0]) && leqSide(right.value[1], left.value[1]);
}
/** Whether a charge is the top (stable). */
export function isTop(c) {
    return presentSide(c.value[0]) && presentSide(c.value[1]);
}
/** Whether a charge is the bottom (absurd). */
export function isBottom(c) {
    return absentSide(c.value[0]) && absentSide(c.value[1]);
}
/** All gauge element names. */
export const gaugeElementNames = Object.freeze(["id", "negation", "conflation", "double"]);
/** Apply a gauge element to a charge value. */
export function gauge(sigma, value) {
    if (sigma === "negation")
        return negateValue(value);
    if (sigma === "conflation")
        return conflateValue(value);
    if (sigma === "double")
        return negateValue(conflateValue(value));
    return value;
}
/** The charge values fixed by a gauge element. */
export const fixedSet = (sigma) => Object.freeze(chargeValues.filter((value) => sameChargeValue(gauge(sigma, value), value)));
/** Test a labeling for self-duality under a gauge element. */
export function firingPatternSelfDuality(labeling, sigma) {
    const fixed = fixedSet(sigma);
    const moving = Object.freeze(labeling.filter((value) => !fixed.some((fixedValue) => sameChargeValue(fixedValue, value))));
    return moving.length === 0
        ? Object.freeze({ kind: "bilattice-charge.firingPatternSelfDuality:witness", labeling: Object.freeze([...labeling]), gaugeElement: sigma, fixed })
        : Object.freeze({ kind: "bilattice-charge.firingPatternSelfDuality-obstruction", labeling: Object.freeze([...labeling]), gaugeElement: sigma, fixed, moving });
}
/** Compare two charge values for identity. */
export function chargeValueIdentity(left, right) {
    return sameChargeValue(left, right)
        ? Object.freeze({ kind: "bilattice-charge.valueIdentity:witness", left, right })
        : Object.freeze({ kind: "bilattice-charge.valueIdentity-obstruction", left, right });
}
const orderLeq = (order, join) => (left, right) => {
    const joined = join(left, right);
    return sameChargeValue(joined, right)
        ? Object.freeze({ kind: "bilattice-charge.orderLeq:witness", order, left, right, join: joined })
        : Object.freeze({ kind: "bilattice-charge.orderLeq-obstruction", order, left, right, join: joined });
};
/** Whether one charge value is ≤ another in the knowledge order. */
export const knowledgeLeq = orderLeq("knowledge", joinKnowledgeValue);
/** Whether one charge value is ≤ another in the truth order. */
export const truthLeq = orderLeq("truth", joinTruthValue);
//# sourceMappingURL=bilattice-charge.mjs.map