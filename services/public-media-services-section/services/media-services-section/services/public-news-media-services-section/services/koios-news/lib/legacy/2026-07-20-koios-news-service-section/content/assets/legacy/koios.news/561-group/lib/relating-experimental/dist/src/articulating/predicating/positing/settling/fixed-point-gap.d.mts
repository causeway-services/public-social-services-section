/**
 * settling/fixed-point-gap — the gap between least and greatest fixed points.
 *
 * Per cell, compares the least extremum's charge to the coincident greatest
 * charge: a closure witness when they agree, an opening obstruction when they
 * differ, a missing-greatest obstruction when the greatest has no coincident
 * cell. The gap vanishes exactly when no obstructions remain — the bilattice
 * interval collapses to a point.
 */
import { type ChargeCarrier } from "../bilattice-charge.mjs";
import { type Cell } from "../../predication.mjs";
import { type Natural } from "./analysis/exact-number.mjs";
import type { FixedPointExtremum, FixedPointOrderObject } from "./fixed-point.mjs";
/** A cell whose least and greatest charges agree (the gap closes here). */
export interface FixedPointGapCellClosureWitness {
    readonly kind: "predication.valuation.fixedPoint.gap.cellClosure:witness";
    readonly cell: Cell;
    readonly least: ChargeCarrier;
    readonly greatest: ChargeCarrier;
}
/** A cell whose least and greatest charges differ (the gap stays open). */
export interface FixedPointGapCellOpeningObstruction {
    readonly kind: "predication.valuation.fixedPoint.gap.cellOpening-obstruction";
    readonly cell: Cell;
    readonly least: ChargeCarrier;
    readonly greatest: ChargeCarrier;
}
/** A least cell with no coincident greatest counterpart. */
export interface FixedPointGapCellMissingGreatestObstruction {
    readonly kind: "predication.valuation.fixedPoint.gap.cellMissingGreatest-obstruction";
    readonly cell: Cell;
    readonly least: ChargeCarrier;
}
/** The per-cell outcome of the least/greatest comparison. */
export type FixedPointGapCellReading = FixedPointGapCellClosureWitness | FixedPointGapCellOpeningObstruction | FixedPointGapCellMissingGreatestObstruction;
/** The obstructing subset of cell readings. */
export type FixedPointGapCellObstruction = FixedPointGapCellOpeningObstruction | FixedPointGapCellMissingGreatestObstruction;
/** Every per-cell reading, with rank. */
export interface FixedPointGapCellReadingsCarrier {
    readonly kind: "predication.valuation.fixedPoint.gap.cellReadings";
    readonly readings: readonly FixedPointGapCellReading[];
    readonly rank: Natural;
}
/** Only the closure witnesses, with rank. */
export interface FixedPointGapCellClosuresCarrier {
    readonly kind: "predication.valuation.fixedPoint.gap.cellClosures";
    readonly readings: readonly FixedPointGapCellClosureWitness[];
    readonly rank: Natural;
}
/** Only the opening obstructions, with rank. */
export interface FixedPointGapCellOpeningsCarrier {
    readonly kind: "predication.valuation.fixedPoint.gap.cellOpenings";
    readonly readings: readonly FixedPointGapCellOpeningObstruction[];
    readonly rank: Natural;
}
/** Only the missing-greatest obstructions, with rank. */
export interface FixedPointGapMissingGreatestCellsCarrier {
    readonly kind: "predication.valuation.fixedPoint.gap.missingGreatestCells";
    readonly readings: readonly FixedPointGapCellMissingGreatestObstruction[];
    readonly rank: Natural;
}
/** All obstructing readings, grouped, with rank. */
export interface FixedPointGapCellObstructionsCarrier {
    readonly kind: "predication.valuation.fixedPoint.gap.cellObstructions";
    readonly readings: readonly FixedPointGapCellObstruction[];
    readonly rank: Natural;
    readonly openings: FixedPointGapCellOpeningsCarrier;
    readonly missingGreatest: FixedPointGapMissingGreatestCellsCarrier;
}
/** The gap vanishes (no obstructions). */
export interface FixedPointGapVanishingWitness {
    readonly kind: "predication.valuation.fixedPoint.gap.vanishing:witness";
    readonly rank: Natural;
}
/** The gap does not vanish. */
export interface FixedPointGapVanishingObstruction {
    readonly kind: "predication.valuation.fixedPoint.gap.vanishing-obstruction";
    readonly rank: Natural;
    readonly obstructions: FixedPointGapCellObstructionsCarrier;
}
/** The verdict on whether the gap vanishes. */
export type FixedPointGapVanishingJudgment = FixedPointGapVanishingWitness | FixedPointGapVanishingObstruction;
/** The full fixed-point gap result. */
export interface FixedPointGapCarrier {
    readonly kind: "predication.valuation.fixedPoint.gap.carrier";
    readonly order: FixedPointOrderObject;
    readonly least: FixedPointExtremum;
    readonly greatest: FixedPointExtremum;
    readonly cellReadings: FixedPointGapCellReadingsCarrier;
    readonly closures: FixedPointGapCellClosuresCarrier;
    readonly openings: FixedPointGapCellOpeningsCarrier;
    readonly missingGreatest: FixedPointGapMissingGreatestCellsCarrier;
    readonly obstructions: FixedPointGapCellObstructionsCarrier;
    readonly rank: Natural;
    readonly vanishing: FixedPointGapVanishingJudgment;
}
/** Input to the gap computation. */
export interface FixedPointGapInput {
    readonly kind: "predication.valuation.fixedPoint.gap.input";
    readonly order: FixedPointOrderObject;
    readonly least: FixedPointExtremum;
    readonly greatest: FixedPointExtremum;
}
/** Build a gap input from one order interval. */
export declare function fixedPointGapInput(order: FixedPointOrderObject, least: FixedPointExtremum, greatest: FixedPointExtremum): FixedPointGapInput;
/** Wrap cell readings with rank. */
export declare const fixedPointGapCellReadings: (readings: readonly FixedPointGapCellReading[]) => FixedPointGapCellReadingsCarrier;
/** Select the closure witnesses. */
export declare const fixedPointGapCellClosures: (readings: readonly FixedPointGapCellReading[]) => FixedPointGapCellClosuresCarrier;
/** Select the opening obstructions. */
export declare const fixedPointGapCellOpenings: (readings: readonly FixedPointGapCellReading[]) => FixedPointGapCellOpeningsCarrier;
/** Select the missing-greatest obstructions. */
export declare const fixedPointGapMissingGreatestCells: (readings: readonly FixedPointGapCellReading[]) => FixedPointGapMissingGreatestCellsCarrier;
/** Combine openings and missing-greatest into one obstructions carrier. */
export declare const fixedPointGapCellObstructions: (openings: FixedPointGapCellOpeningsCarrier, missingGreatest: FixedPointGapMissingGreatestCellsCarrier) => FixedPointGapCellObstructionsCarrier;
/** Judge vanishing from an obstructions carrier. */
export declare const fixedPointGapVanishing: (obstructions: FixedPointGapCellObstructionsCarrier) => FixedPointGapVanishingJudgment;
/** Compute the gap between an order's least and greatest extrema. */
export declare function fixedPointGap(input: FixedPointGapInput): FixedPointGapCarrier;
//# sourceMappingURL=fixed-point-gap.d.mts.map