/**
 * cognizing/expressing — CHL terms for the meme-comonad cognizing morphisms.
 *
 * These terms express knowing's five pure meme→meme cognizing morphisms in
 * Relation Model Notation, using the RMN grammar and JSON bridge from
 * `@emsenn/relating`. No knowing-specific term primitive is introduced here —
 * every construction is a composition of the product, fold, conditional,
 * coincidence, and bilattice-charge constructors already in the evaluator.
 */
import { arrayTerm, objectTerm, stringTerm, tm, } from "@emsenn/relating";
// ── charge carrier wire helpers ───────────────────────────────────────────────
const side = (name) => objectTerm([
    ["kind", stringTerm("bilattice-charge.side")],
    ["name", stringTerm(name)],
]);
const absent = side("absent");
const present = side("present");
const chargeCarrier = (truth, falsity, truthEvidence, falsityEvidence) => objectTerm([
    ["kind", stringTerm("bilattice-charge.carrier")],
    ["value", arrayTerm([truth, falsity])],
    ["evidence", arrayTerm([truthEvidence, falsityEvidence])],
]);
const absurdCharge = chargeCarrier(absent, absent, arrayTerm([]), arrayTerm([]));
const potentialCharge = (truthEv) => chargeCarrier(present, absent, truthEv, arrayTerm([]));
const witnessedPotentialCharge = (witness) => chargeCarrier(present, absent, arrayTerm([witness]), arrayTerm([]));
// ── pair-spine accessors for arrayTerm (element [0] and [1]) ─────────────────
const tupleFirst = (tuple) => tm.fst(tm.snd(tuple));
const tupleSecond = (tuple) => tm.fst(tm.snd(tm.snd(tuple)));
// ── charge field accessors ────────────────────────────────────────────────────
const chargeTruth = (charge) => tupleFirst(tm.field("value", charge));
const chargeFalsity = (charge) => tupleSecond(tm.field("value", charge));
const truthEvidence = (charge) => tupleFirst(tm.field("evidence", charge));
const isPresent = (side) => tm.coincide(tm.field("name", side), stringTerm("present"));
// ── carrier builders ──────────────────────────────────────────────────────────
const markTerm = (value) => objectTerm([
    ["kind", stringTerm("utterance.mark")],
    ["value", value],
]);
const tokenTerm = (mark) => objectTerm([
    ["hand", stringTerm("left")],
    ["kind", stringTerm("utterance.token")],
    ["mark", mark],
]);
const cellTerm = (subject, predicate, object) => objectTerm([
    ["object", object],
    ["predicate", predicate],
    ["subject", subject],
]);
const memeTerm = (cell, charge) => objectTerm([
    ["kind", stringTerm("predication.fiber.meme")],
    ["cell", cell],
    ["charge", charge],
]);
// ── cognizing terms ───────────────────────────────────────────────────────────
/**
 * cognize: identity on the meme carrier.
 * joinKnowledge(c, c) = c (idempotent join) — the epsilon of the comonad is id.
 */
export const cognizerCognize = tm.lam(tm.var(0));
/**
 * forget: reset the meme's charge to the ≤_k bottom (absurd), cell preserved.
 */
export const cognizerForget = tm.lam(memeTerm(tm.field("cell", tm.var(0)), absurdCharge));
/**
 * doubt: the dual-comonad descent Cl* — descend ≤_k one step.
 * stable (both present) → potential (preserve truth evidence); all else → absurd.
 */
export const cognizerDoubt = tm.lam(memeTerm(tm.field("cell", tm.var(0)), tm.cond(isPresent(chargeTruth(tm.field("charge", tm.var(0)))), tm.cond(isPresent(chargeFalsity(tm.field("charge", tm.var(0)))), potentialCharge(truthEvidence(tm.field("charge", tm.var(0)))), absurdCharge), absurdCharge)));
/**
 * reflect: the comonad comultiplication (delta) — convergent reflexive orbit.
 * Nests the prior meme as the cell's object via token(mark(prior)); charge preserved.
 */
export const cognizerReflect = tm.lam(memeTerm(cellTerm(tm.field("subject", tm.field("cell", tm.var(0))), tm.field("predicate", tm.field("cell", tm.var(0))), tokenTerm(markTerm(tm.var(0)))), tm.field("charge", tm.var(0))));
/**
 * ruminate: the divergent reflexive orbit — settling that fails to settle.
 * Prior meme as BOTH subject and object; charge reset to witnessed-potential on each pass.
 */
export const cognizerRuminate = tm.lam(memeTerm(cellTerm(tokenTerm(markTerm(tm.var(0))), tm.field("predicate", tm.field("cell", tm.var(0))), tokenTerm(markTerm(tm.var(0)))), witnessedPotentialCharge(markTerm(tm.var(0)))));
export const cognizingTerms = Object.freeze({
    cognize: cognizerCognize,
    forget: cognizerForget,
    doubt: cognizerDoubt,
    reflect: cognizerReflect,
    ruminate: cognizerRuminate,
});
//# sourceMappingURL=expressing.mjs.map