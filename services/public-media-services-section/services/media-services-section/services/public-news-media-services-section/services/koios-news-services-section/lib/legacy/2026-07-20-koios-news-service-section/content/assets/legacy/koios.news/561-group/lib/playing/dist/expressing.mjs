/**
 * expressing — playing morphisms expressed as typed total CHL proof terms.
 *
 * These are not JSON helpers with a fancy hat on: they are the playing proofs
 * whose carrier-level computation is expressible by the current product,
 * fold, conditional, coincidence, and bilattice-charge constructors in
 * `@emsenn/relating/notating`. When a playing operation seems to need
 * a new primitive, first factor it through these constructors; only genuine
 * non-structural operations should extend the evaluator.
 */
import { tm, } from "@emsenn/relating/notating";
import { arrayTerm, objectTerm, stringTerm, } from "@emsenn/relating/evaluating/projecting";
const boolFalse = tm.bool(false);
const boolTrue = tm.bool(true);
const absurd = tm.charge("absurd");
const stable = tm.charge("stable");
const isString = (term, value) => tm.coincide(term, stringTerm(value));
const isCharge = (term, value) => tm.coincide(term, tm.charge(value));
const appendOne = (list, item) => tm.append(list, arrayTerm([item]));
const mapArray = (fn, list) => tm.fold(tm.lam(tm.lam(appendOne(tm.var(1), tm.app(fn, tm.var(0))))), arrayTerm([]), list);
const actCharge = (act) => tm.cond(isString(act, "proponent"), tm.charge("potential"), tm.cond(isString(act, "opponent"), tm.charge("active"), tm.cond(isString(act, "daimon"), stable, absurd)));
const chargeAct = (charge) => tm.cond(isCharge(charge, "potential"), stringTerm("proponent"), tm.cond(isCharge(charge, "active"), stringTerm("opponent"), tm.cond(isCharge(charge, "stable"), stringTerm("daimon"), stringTerm("none"))));
const designEntryFromActEntry = (entry) => objectTerm([
    ["charge", actCharge(tm.field("act", entry))],
    ["locus", tm.field("locus", entry)],
]);
/** `design`: `{ entries: [{ locus, act }] } -> `{ entries: [{ locus, charge }] }`.
 *
 * The `none` act is the absent/absurd value, so it is not emitted into the
 * partial design support. This matches the runtime `designFromActs` path.
 */
export const designTerm = tm.lam(objectTerm([
    ["entries", tm.fold(tm.lam(tm.lam(tm.cond(isString(tm.field("act", tm.var(0)), "none"), tm.var(1), appendOne(tm.var(1), designEntryFromActEntry(tm.var(0)))))), arrayTerm([]), tm.field("entries", tm.var(0)))],
]));
const dualizeEntryTerm = tm.lam(objectTerm([
    ["charge", tm.negate(tm.field("charge", tm.var(0)))],
    ["locus", tm.field("locus", tm.var(0))],
]));
/** `dualize`: pointwise bilattice negation on a Design's charge valuation. */
export const dualizeTerm = tm.lam(objectTerm([
    ["entries", mapArray(dualizeEntryTerm, tm.field("entries", tm.var(0)))],
]));
/** `hasLocus`: `locus -> entries -> bool`, using structural coincidence. */
const hasLocusTerm = tm.lam(tm.lam(tm.fold(tm.lam(tm.lam(tm.cond(tm.var(1), boolTrue, tm.coincide(tm.field("locus", tm.var(0)), tm.var(3))))), boolFalse, tm.var(0))));
const hasLocus = (entries, locus) => tm.app(tm.app(hasLocusTerm, locus), entries);
/** `chargeAt`: `locus -> entries -> charge`, defaulting to absurd outside support. */
const chargeAtTerm = tm.lam(tm.lam(tm.fold(tm.lam(tm.lam(tm.cond(tm.coincide(tm.field("locus", tm.var(0)), tm.var(3)), tm.field("charge", tm.var(0)), tm.var(1)))), absurd, tm.var(0))));
const chargeAt = (entries, locus) => tm.app(tm.app(chargeAtTerm, locus), entries);
/** `unionEntries`: append right-only loci to the left entries, preserving order. */
const unionEntriesTerm = tm.lam(tm.lam(tm.fold(tm.lam(tm.lam(tm.cond(hasLocus(tm.var(1), tm.field("locus", tm.var(0))), tm.var(1), appendOne(tm.var(1), tm.var(0))))), tm.var(1), tm.var(0))));
const unionEntries = (left, right) => tm.app(tm.app(unionEntriesTerm, left), right);
const normalEntriesTerm = tm.lam(tm.lam(tm.fold(tm.lam(tm.lam(appendOne(tm.var(1), objectTerm([
    ["charge", tm.joinK(chargeAt(tm.var(3), tm.field("locus", tm.var(0))), chargeAt(tm.var(2), tm.field("locus", tm.var(0))))],
    ["locus", tm.field("locus", tm.var(0))],
])))), arrayTerm([]), unionEntries(tm.var(1), tm.var(0)))));
const normalEntries = (left, right) => tm.app(tm.app(normalEntriesTerm, left), right);
const meetingOf = (leftEntries, rightEntries, locus) => {
    const leftCharge = chargeAt(leftEntries, locus);
    const rightCharge = chargeAt(rightEntries, locus);
    const joined = tm.joinK(leftCharge, rightCharge);
    return objectTerm([
        ["daimonized", tm.coincide(joined, stable)],
        ["joined", joined],
        ["left", chargeAct(leftCharge)],
        ["locus", locus],
        ["right", chargeAct(rightCharge)],
    ]);
};
const meetingsTerm = tm.lam(tm.lam(tm.fold(tm.lam(tm.lam(tm.cond(hasLocus(tm.var(2), tm.field("locus", tm.var(0))), appendOne(tm.var(1), meetingOf(tm.var(3), tm.var(2), tm.field("locus", tm.var(0)))), tm.var(1)))), arrayTerm([]), tm.var(1))));
const meetingsOf = (left, right) => tm.app(tm.app(meetingsTerm, left), right);
const daimonLociOf = (meetings) => tm.fold(tm.lam(tm.lam(tm.cond(tm.field("daimonized", tm.var(0)), appendOne(tm.var(1), tm.field("locus", tm.var(0))), tm.var(1)))), arrayTerm([]), meetings);
/** `interact`: the ludics cut report, composed as pointwise knowledge-join. */
export const interactTerm = tm.lam(objectTerm([
    ["daimonLoci", daimonLociOf(meetingsOf(tm.field("entries", tm.field("designA", tm.var(0))), tm.field("entries", tm.field("designB", tm.var(0)))))],
    ["meetings", meetingsOf(tm.field("entries", tm.field("designA", tm.var(0))), tm.field("entries", tm.field("designB", tm.var(0))))],
    ["normalForm", objectTerm([
            ["entries", normalEntries(tm.field("entries", tm.field("designA", tm.var(0))), tm.field("entries", tm.field("designB", tm.var(0))))],
        ])],
]));
export const playingTerms = Object.freeze({
    design: designTerm,
    dualize: dualizeTerm,
    interact: interactTerm,
});
//# sourceMappingURL=expressing.mjs.map