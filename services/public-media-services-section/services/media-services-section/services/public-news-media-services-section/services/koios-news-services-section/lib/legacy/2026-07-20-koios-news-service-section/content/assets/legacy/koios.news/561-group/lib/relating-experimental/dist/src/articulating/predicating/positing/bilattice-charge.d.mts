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
import { Mark } from "../../utterance.mjs";
/** The four bilattice charge value names. */
export type ChargeValueName = "absurd" | "potential" | "active" | "stable";
/** A charge side coordinate name. */
export type ChargeSideName = "absent" | "present";
/** One side coordinate of a charge. */
export interface ChargeSide {
    readonly kind: "bilattice-charge.side";
    readonly name: ChargeSideName;
}
/** A charge point: [truth, falsity] sides. */
export type ChargeCoordinates = readonly [truth: ChargeSide, falsity: ChargeSide];
/** A named point of the four-element bilattice. */
export interface ChargeValue {
    readonly kind: "bilattice-charge.value";
    readonly name: ChargeValueName;
    readonly coordinates: ChargeCoordinates;
}
/** A charge bearing evidence: the side coordinates and the witness lists per side. */
export interface ChargeCarrier {
    readonly kind: "bilattice-charge.carrier";
    readonly value: ChargeCoordinates;
    readonly evidence: readonly [readonly Mark[], readonly Mark[]];
}
/** The finite carrier of the charge bilattice: its sides and four values. */
export interface ChargeFiniteAlgebraCarrier {
    readonly kind: "bilattice-charge.finiteAlgebra";
    readonly sides: readonly ChargeSide[];
    readonly values: readonly ChargeValue[];
}
/** An ordered pair of charges. */
export interface ChargePair {
    readonly left: ChargeCarrier;
    readonly right: ChargeCarrier;
}
/** All charge side names. */
export declare const chargeSideNames: readonly ChargeSideName[];
/** All charge value names. */
export declare const chargeValueNames: readonly ChargeValueName[];
/** Construct a charge side. */
export declare const chargeSide: (name: ChargeSideName) => ChargeSide;
/** Construct a charge value by name, resolving its side coordinates. */
export declare function chargeValue(name: ChargeValueName): ChargeValue;
/** All four charge values. */
export declare const chargeValues: readonly ChargeValue[];
/** The finite-algebra carrier of the charge bilattice. */
export declare const chargeFiniteAlgebra: ChargeFiniteAlgebraCarrier;
/** The name of a charge side. */
export declare const chargeSideName: (side: ChargeSide) => ChargeSideName;
/** The name of a charge value. */
export declare const chargeValueName: (value: ChargeValue) => ChargeValueName;
/** Whether a string names a charge value. */
export declare function isChargeValueName(value: string): value is ChargeValueName;
/** Whether a string names a charge side. */
export declare function isChargeSideName(value: string | undefined): value is ChargeSideName;
/** Type guard for a charge side. */
export declare function isChargeSide(value: object): value is ChargeSide;
/** Type guard for a charge value. */
export declare function isChargeValue(value: object): value is ChargeValue;
/** Type guard for a charge carrier. */
export declare function isCharge(value: object): value is ChargeCarrier;
/** Coerce a string to a charge value name, or throw. */
export declare function asChargeValueName(value: string): ChargeValueName;
/** Coerce a value or name to a charge value. */
export declare function asChargeValue(value: ChargeValue | ChargeValueName): ChargeValue;
/** Construct a charge carrier from a value and optional evidence. */
export declare function charge(value: ChargeValue, evidence?: readonly [readonly Mark[], readonly Mark[]]): ChargeCarrier;
/** The coordinate pair a charge carries. */
export declare const present: (c: ChargeCarrier) => ChargeCoordinates;
/** Whether two charge values name the same value. */
export declare const sameChargeValue: (left: ChargeValue, right: ChargeValue) => boolean;
/** Whether two charge carriers denote the same value. */
export declare function sameCharge(left: ChargeCarrier, right: ChargeCarrier): boolean;
/** The charge value named by a carrier's coordinates. */
export declare function valueOf(c: ChargeCarrier): ChargeValue;
/** The knowledge-order bottom: absurd with no evidence. */
export declare const bottom: ChargeCarrier;
/** A potential carrier whose truth side carries the given witness. */
export declare const witnessedPotential: (witness: Mark) => ChargeCarrier;
/** Negate a charge: swap truth and falsity sides and their evidence. */
export declare function negate(c: ChargeCarrier): ChargeCarrier;
/** Conflate a charge: complement and swap both sides, keeping evidence. */
export declare function conflate(c: ChargeCarrier): ChargeCarrier;
/** Knowledge-order join: both sides grow. */
export declare const joinKnowledge: (left: ChargeCarrier, right: ChargeCarrier) => ChargeCarrier;
/** Knowledge-order meet: both sides shrink. */
export declare const meetKnowledge: (left: ChargeCarrier, right: ChargeCarrier) => ChargeCarrier;
/** Truth-order join: truth grows, falsity shrinks. */
export declare const joinTruth: (left: ChargeCarrier, right: ChargeCarrier) => ChargeCarrier;
/** Truth-order meet: truth shrinks, falsity grows. */
export declare const meetTruth: (left: ChargeCarrier, right: ChargeCarrier) => ChargeCarrier;
/** Knowledge-order join of values (evidence ignored). */
export declare const joinKnowledgeValue: (left: ChargeValue, right: ChargeValue) => ChargeValue;
/** Knowledge-order meet of values. */
export declare const meetKnowledgeValue: (left: ChargeValue, right: ChargeValue) => ChargeValue;
/** Truth-order join of values. */
export declare const joinTruthValue: (left: ChargeValue, right: ChargeValue) => ChargeValue;
/** Truth-order meet of values. */
export declare const meetTruthValue: (left: ChargeValue, right: ChargeValue) => ChargeValue;
/** Negation of a charge value. */
export declare const negateValue: (value: ChargeValue) => ChargeValue;
/** Conflation of a charge value. */
export declare const conflateValue: (value: ChargeValue) => ChargeValue;
/** Whether left ≤ right in the knowledge order. */
export declare function leqKnowledge(left: ChargeCarrier, right: ChargeCarrier): boolean;
/** The right charge of a pair when left ≤ right in the knowledge order, else throw. */
export declare function compareKnowledge(pair: ChargePair): ChargeCarrier;
/** The knowledge-order join of a pair, accumulating evidence. */
export declare const aggregate: (pair: ChargePair) => ChargeCarrier;
/** Whether left ≤ right in the truth order (truth grows, falsity shrinks). */
export declare function leqTruth(left: ChargeCarrier, right: ChargeCarrier): boolean;
/** Whether a charge is the top (stable). */
export declare function isTop(c: ChargeCarrier): boolean;
/** Whether a charge is the bottom (absurd). */
export declare function isBottom(c: ChargeCarrier): boolean;
/** A gauge group element acting on charge values. */
export type GaugeElementName = "id" | "negation" | "conflation" | "double";
/** All gauge element names. */
export declare const gaugeElementNames: readonly GaugeElementName[];
/** Apply a gauge element to a charge value. */
export declare function gauge(sigma: GaugeElementName, value: ChargeValue): ChargeValue;
/** The charge values fixed by a gauge element. */
export declare const fixedSet: (sigma: GaugeElementName) => readonly ChargeValue[];
/** A witness that a labeling is self-dual under a gauge element. */
export interface FiringPatternSelfDualityWitness {
    readonly kind: "bilattice-charge.firingPatternSelfDuality:witness";
    readonly labeling: readonly ChargeValue[];
    readonly gaugeElement: GaugeElementName;
    readonly fixed: readonly ChargeValue[];
}
/** An obstruction to self-duality of a labeling under a gauge element. */
export interface FiringPatternSelfDualityObstruction {
    readonly kind: "bilattice-charge.firingPatternSelfDuality-obstruction";
    readonly labeling: readonly ChargeValue[];
    readonly gaugeElement: GaugeElementName;
    readonly fixed: readonly ChargeValue[];
    readonly moving: readonly ChargeValue[];
}
/** The result of testing a labeling for self-duality under a gauge element. */
export type FiringPatternSelfDualityJudgment = FiringPatternSelfDualityWitness | FiringPatternSelfDualityObstruction;
/** Test a labeling for self-duality under a gauge element. */
export declare function firingPatternSelfDuality(labeling: readonly ChargeValue[], sigma: GaugeElementName): FiringPatternSelfDualityJudgment;
/** A witness that two charge values are identical. */
export interface ChargeValueIdentityWitness {
    readonly kind: "bilattice-charge.valueIdentity:witness";
    readonly left: ChargeValue;
    readonly right: ChargeValue;
}
/** An obstruction to identity of two charge values. */
export interface ChargeValueIdentityObstruction {
    readonly kind: "bilattice-charge.valueIdentity-obstruction";
    readonly left: ChargeValue;
    readonly right: ChargeValue;
}
/** The result of comparing two charge values for identity. */
export type ChargeValueIdentityJudgment = ChargeValueIdentityWitness | ChargeValueIdentityObstruction;
/** Compare two charge values for identity. */
export declare function chargeValueIdentity(left: ChargeValue, right: ChargeValue): ChargeValueIdentityJudgment;
/** A witness that left ≤ right in the named order. */
export interface OrderLeqWitness {
    readonly kind: "bilattice-charge.orderLeq:witness";
    readonly order: "knowledge" | "truth";
    readonly left: ChargeValue;
    readonly right: ChargeValue;
    readonly join: ChargeValue;
}
/** An obstruction to left ≤ right in the named order. */
export interface OrderLeqObstruction {
    readonly kind: "bilattice-charge.orderLeq-obstruction";
    readonly order: "knowledge" | "truth";
    readonly left: ChargeValue;
    readonly right: ChargeValue;
    readonly join: ChargeValue;
}
/** The result of testing the order relation between two charge values. */
export type OrderLeqJudgment = OrderLeqWitness | OrderLeqObstruction;
/** Whether one charge value is ≤ another in the knowledge order. */
export declare const knowledgeLeq: (left: ChargeValue, right: ChargeValue) => OrderLeqJudgment;
/** Whether one charge value is ≤ another in the truth order. */
export declare const truthLeq: (left: ChargeValue, right: ChargeValue) => OrderLeqJudgment;
//# sourceMappingURL=bilattice-charge.d.mts.map