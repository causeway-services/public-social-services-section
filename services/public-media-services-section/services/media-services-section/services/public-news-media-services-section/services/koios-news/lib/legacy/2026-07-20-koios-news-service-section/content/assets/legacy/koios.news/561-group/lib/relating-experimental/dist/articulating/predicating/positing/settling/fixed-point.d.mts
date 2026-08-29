import { type ClosureCarrier } from "./closure.mjs";
import type { Valuation } from "../fiber.mjs";
import { type FixedPointGapCarrier } from "./fixed-point-gap.mjs";
import { type PredicationValuationClosureOrderCarrier, type PredicationValuationClosureStageOrdinalCarrier } from "./valuation-closure.mjs";
import { type PositPresheaf, type SheafCarrier } from "./sheaf.mjs";
export type { OrderName } from "../fiber.mjs";
/** The two extremal bounds of a fixed-point computation. */
export type BoundName = "least" | "greatest";
/** The order a fixed point is taken in (wraps a valuation closure order). */
export interface FixedPointOrderObject {
    readonly kind: "predication.valuation.fixedPoint.orderObject";
    readonly valuationClosureOrder: PredicationValuationClosureOrderCarrier;
}
/** The bound object selecting which extremal fixed point to compute. */
export interface FixedPointBoundObject {
    readonly kind: "predication.valuation.fixedPoint.boundObject";
    readonly name: BoundName;
}
/** The seed for a fixed-point closure. */
export interface FixedPointSeedCarrier {
    readonly kind: "predication.valuation.fixedPoint.seed";
    readonly order: FixedPointOrderObject;
    readonly bound: FixedPointBoundObject;
    readonly valuation: Valuation;
}
/** A computed extremal fixed point. */
export interface FixedPointExtremum {
    readonly kind: "predication.valuation.fixedPoint.extremum";
    readonly order: FixedPointOrderObject;
    readonly bound: FixedPointBoundObject;
    readonly seed: FixedPointSeedCarrier;
    readonly closure: ClosureCarrier<Valuation>;
    readonly fixedPoint: FixedPointJudgment;
    readonly sheaf: SheafCarrier;
}
/** Witness that closure stabilized to a fixed point. */
export interface FixedPointWitness {
    readonly kind: "predication.valuation.fixedPoint:witness";
    readonly order: FixedPointOrderObject;
    readonly bound: FixedPointBoundObject;
    readonly stabilizationStage: PredicationValuationClosureStageOrdinalCarrier;
    readonly value: Valuation;
}
/** Obstruction recording that closure did not stabilize. */
export interface FixedPointObstruction {
    readonly kind: "predication.valuation.fixedPoint-obstruction";
    readonly order: FixedPointOrderObject;
    readonly bound: FixedPointBoundObject;
    readonly value: Valuation;
}
/** The outcome of closing toward a fixed point. */
export type FixedPointJudgment = FixedPointWitness | FixedPointObstruction;
/** The least/greatest extrema for one order, plus their gap. */
export interface FixedPointOrderCarrier {
    readonly kind: "predication.valuation.fixedPoint.order";
    readonly order: FixedPointOrderObject;
    readonly least: FixedPointExtremum;
    readonly greatest: FixedPointExtremum;
    readonly gap: FixedPointGapCarrier;
}
/** The full fixed-point structure: knowledge and truth orders. */
export interface FixedPointCarrier {
    readonly kind: "predication.valuation.fixedPoint.carrier";
    readonly knowledge: FixedPointOrderCarrier;
    readonly truth: FixedPointOrderCarrier;
}
/** The complete fixed-point structure of a posit presheaf. */
export declare function fixedPoints(p: PositPresheaf): FixedPointCarrier;
//# sourceMappingURL=fixed-point.d.mts.map