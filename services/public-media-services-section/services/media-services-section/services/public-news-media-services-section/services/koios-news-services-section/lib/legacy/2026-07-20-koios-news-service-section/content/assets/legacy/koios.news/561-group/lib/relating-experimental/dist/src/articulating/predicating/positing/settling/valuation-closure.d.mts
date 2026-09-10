/**
 * settling/valuation-closure — the knowledge closure and `settle`.
 *
 * A valuation closes under a modal step (knowledge- or truth-raise) followed by
 * transport along the predication generators (specialization closure + recompose,
 * folding coincident cells by the order's join). The ordinal closure engine runs
 * that endomorphism from the posit seed to its fixed point; `settle` maps the
 * closure orbit to settling-stage inputs (each stage's designated cells) and
 * assembles the `SettlementFiltration` — the settled object the read bins query.
 */
import { type ChargeCarrier } from "../bilattice-charge.mjs";
import { type Natural } from "./analysis/exact-number.mjs";
import { type ClosureCarrier, type ClosureOrbitPoint, type ClosureProcessCarrier, type FiniteOrdinalJudgment, type Lattice, type Ordinal } from "./closure.mjs";
import { type CohomologyCarrier } from "./cohomology.mjs";
import type { Meme, Valuation } from "../fiber.mjs";
import type { SettlingStageOrdinalCarrier, SettlementFiltration } from "./object.mjs";
import { type Cell } from "../../predication.mjs";
import { type PositPresheaf, type SheafCarrier } from "./sheaf.mjs";
import { type Mark } from "../../../utterance.mjs";
export type { OrderName } from "../fiber.mjs";
import type { OrderName } from "../fiber.mjs";
/** A stage ordinal in valuation closure. */
export interface PredicationValuationClosureStageOrdinalCarrier {
    readonly kind: "predication.valuation.closure.stageOrdinal";
    readonly ordinal: Ordinal;
}
/** A single stage of valuation closure: a stage ordinal and the valuation reached. */
export interface PredicationValuationClosureStageCarrier {
    readonly kind: "predication.valuation.closure.stage";
    readonly stageOrdinal: PredicationValuationClosureStageOrdinalCarrier;
    readonly valuation: Valuation;
}
/** A closure order over valuations: its name, endomorphism, and lattice builder. */
export interface PredicationValuationClosureOrderCarrier {
    readonly kind: "predication.valuation.closure.order";
    readonly name: OrderName;
    readonly endomorphism: (valuation: Valuation) => Valuation;
    readonly lattice: (seed: Valuation) => Lattice<Valuation>;
}
/** A valuation closure process: an order, a seed, and the ordinal process. */
export interface PredicationValuationClosureProcessCarrier {
    readonly kind: "predication.valuation.closure.process";
    readonly order: PredicationValuationClosureOrderCarrier;
    readonly seed: Valuation;
    readonly ordinalProcess: ClosureProcessCarrier<Valuation>;
}
/** The result of closing a valuation closure process. */
export interface PredicationValuationClosureCarrier {
    readonly kind: "predication.valuation.closure.carrier";
    readonly process: PredicationValuationClosureProcessCarrier;
    readonly closure: ClosureCarrier<Valuation>;
    readonly sheaf: SheafCarrier;
}
/** A witness that a closure stage's ordinal is finite. */
export interface PredicationValuationClosureFiniteStageWitness {
    readonly kind: "predication.valuation.closure.finiteStage:witness";
    readonly stage: PredicationValuationClosureStageCarrier;
    readonly value: Natural;
}
/** An obstruction that a closure stage's ordinal is not finite. */
export interface PredicationValuationClosureFiniteStageObstruction {
    readonly kind: "predication.valuation.closure.finiteStage-obstruction";
    readonly stage: PredicationValuationClosureStageCarrier;
    readonly reading: FiniteOrdinalJudgment;
}
/** The judgment on whether a closure stage's ordinal is finite. */
export type PredicationValuationClosureFiniteStageJudgment = PredicationValuationClosureFiniteStageWitness | PredicationValuationClosureFiniteStageObstruction;
/** A trace of a valuation closure: the carrier, sheaf, orbit, and fixed-point stage. */
export interface PredicationValuationClosureTraceCarrier {
    readonly kind: "predication.valuation.closure.trace";
    readonly closure: PredicationValuationClosureCarrier;
    readonly sheaf: SheafCarrier;
    readonly orbit: readonly PredicationValuationClosureStageCarrier[];
    readonly fixedPointStage: PredicationValuationClosureStageCarrier;
}
/** The most recent valuation in a posit presheaf's trace. */
export declare function lastValuation(p: PositPresheaf): Valuation;
/** Whether two memes coincide (cells coincide and charges are the same). */
export declare function sameMeme(left: Meme, right: Meme): boolean;
/** Whether two valuations coincide (same base, same fibers as a set). */
export declare function sameValuation(left: Valuation, right: Valuation): boolean;
/** A stage-ordinal carrier wrapping an ordinal. */
export declare const predicationValuationClosureStageOrdinal: (ordinal: Ordinal) => PredicationValuationClosureStageOrdinalCarrier;
/** A closure stage carrier from a closure orbit point. */
export declare function predicationValuationClosureStage(point: ClosureOrbitPoint<Valuation>): PredicationValuationClosureStageCarrier;
/** Judge whether a closure stage's ordinal is finite. */
export declare function predicationValuationClosureFiniteStageJudgment(stage: PredicationValuationClosureStageCarrier): PredicationValuationClosureFiniteStageJudgment;
/** Map a closure stage to a settling stage ordinal. */
export declare const settlingStageOrdinalOfPredicationValuationClosureStage: (stage: PredicationValuationClosureStageCarrier) => SettlingStageOrdinalCarrier;
/** Knowledge-raise: fold duplicate cells by knowledge join. */
export declare const raiseKnowledge: (valuation: Valuation) => Valuation;
/** Knowledge-lower: fold by knowledge meet. */
export declare const lowerKnowledge: (valuation: Valuation) => Valuation;
/** Truth-raise: fold by truth join. */
export declare const raiseTruth: (valuation: Valuation) => Valuation;
/** Truth-lower: fold by truth meet. */
export declare const lowerTruth: (valuation: Valuation) => Valuation;
/** Append the knowledge-raised valuation to a presheaf trace. */
export declare const possibilizeKnowledge: (p: PositPresheaf) => PositPresheaf;
/** Append the knowledge-lowered valuation to a presheaf trace. */
export declare const necessitateKnowledge: (p: PositPresheaf) => PositPresheaf;
/** Append the truth-raised valuation to a presheaf trace. */
export declare const possibilizeTruth: (p: PositPresheaf) => PositPresheaf;
/** Append the truth-lowered valuation to a presheaf trace. */
export declare const necessitateTruth: (p: PositPresheaf) => PositPresheaf;
/** Transport a valuation along the predication generators (specialization closure + recompose). */
export declare function transportValuationAlongPredicationGenerators(valuation: Valuation, fold?: (left: ChargeCarrier, right: ChargeCarrier) => ChargeCarrier): Valuation;
/** The knowledge closure endomorphism. */
export declare const knowledgeClosureEndomorphism: (valuation: Valuation) => Valuation;
/** The truth closure endomorphism. */
export declare const truthClosureEndomorphism: (valuation: Valuation) => Valuation;
/** The knowledge closure order carrier. */
export declare const knowledgeValuationClosureOrder: PredicationValuationClosureOrderCarrier;
/** The truth closure order carrier. */
export declare const truthValuationClosureOrder: PredicationValuationClosureOrderCarrier;
/** Build a valuation closure process from an order and seed. */
export declare function predicationValuationClosureProcess(order: PredicationValuationClosureOrderCarrier, seed: Valuation): PredicationValuationClosureProcessCarrier;
/** Close a valuation closure process to its fixed point. */
export declare function closePredicationValuationClosure(process: PredicationValuationClosureProcessCarrier): PredicationValuationClosureCarrier;
/** The knowledge closure of a posit presheaf. */
export declare function knowledgeValuationClosure(p: PositPresheaf): PredicationValuationClosureCarrier;
/** The truth closure of a posit presheaf. */
export declare function truthValuationClosure(p: PositPresheaf): PredicationValuationClosureCarrier;
/** The sheaf of a posit presheaf's knowledge closure. */
export declare function knowledgeClosureSheaf(p: PositPresheaf): SheafCarrier;
/** Build a trace from a closure carrier (orbit + fixed-point stage). */
export declare function predicationValuationClosureTrace(closure: PredicationValuationClosureCarrier): PredicationValuationClosureTraceCarrier;
/** The trace of a posit presheaf's knowledge closure. */
export declare function knowledgeClosureTrace(p: PositPresheaf): PredicationValuationClosureTraceCarrier;
/** The cells of a posit presheaf's knowledge closure sheaf. */
export declare function knowledgeClosureCells(p: PositPresheaf): readonly Cell[];
/** The cohomology of the knowledge closure of an utterance's posit. */
export declare function utteranceKnowledgeClosureCohomology(left: Mark, right: Mark): CohomologyCarrier;
/** Settle a posit presheaf: knowledge-close, map the orbit to stages, assemble the filtration. */
export declare function settle(positCarrier: PositPresheaf): SettlementFiltration;
/** The knowledge-join valuation closure lattice. */
export declare function valuationClosureLattice(bottom: Valuation): Lattice<Valuation>;
/** The truth-join valuation closure lattice. */
export declare function truthValuationClosureLattice(bottom: Valuation): Lattice<Valuation>;
/** The knowledge valuation closure lattice, with leq strengthened to per-charge knowledge order. */
export declare function knowledgeValuationClosureLattice(bottom: Valuation): Lattice<Valuation>;
//# sourceMappingURL=valuation-closure.d.mts.map