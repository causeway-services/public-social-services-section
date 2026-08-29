/**
 * Chronicle-level convergence — the play read step-by-step.
 *
 * The convergence judgment of `orthogonality.mjs` decides $\mathfrak{D} \perp
 * \mathfrak{E} \Downarrow$ globally (a Daimon collision exists somewhere).  This
 * module *refines* that with a per-step trace: it follows the two dual designs'
 * chronicles (corpus, ludics/chronicle, "plays-along-one-branch") in lockstep
 * down a single $\preceq$-chain, recording each meeting, and reports
 * convergence at the *first* step where the play reaches the Daimon — the
 * give-up move that always converges (design note, "Convergence and divergence
 * of plays": "a Daimon move (which always converges)").
 *
 * The trace orders `interactionReport(d1, d2).meetings` along a chronicle's
 * chain using the locus `prefixes` order (root-first), so each `TraceStep`
 * is one move of the dispute.  Convergence = a `daimonized` step is reached;
 * the witness carries the trace up to and including the Daimon and the
 * converging chronicle; the obstruction carries the trace to the point the
 * play got stuck (the chronicle ran out of shared loci before any Daimon).
 *
 * Nothing here recomputes the interaction: it reuses game-algebra's
 * `interactionReport` (the knowledge-join meetings) and `designChronicles`
 * (the branch decomposition), and refines `convergenceJudgment` of
 * `orthogonality.mjs` — the global verdict is the disjunction over chronicles.
 */
import { type Chronicle, type Design, type DesignAct, type Locus } from "../../index.mjs";
import { type ChargeValue } from "@emsenn/relating";
export interface TraceStep {
    readonly kind: "game.chronicle-convergence.step";
    readonly locus: Locus;
    readonly left: DesignAct;
    readonly right: DesignAct;
    readonly joined: ChargeValue;
    /** True at the give-up move: both commit a polarity and collide into $\top$. */
    readonly daimonized: boolean;
}
export interface ChronicleConvergenceWitness {
    readonly kind: "game.chronicle-convergence:witness";
    /** The trace down to and including the converging (Daimon) step. */
    readonly trace: readonly TraceStep[];
    /** The chronicle of `d1` along which convergence was reached. */
    readonly chronicle: Chronicle;
    /** The Daimon step at which the play converged. */
    readonly daimonStep: TraceStep;
}
export interface ChronicleConvergenceObstruction {
    readonly kind: "game.chronicle-convergence-obstruction";
    readonly reason: "no-meeting" | "no-daimon";
    /** The longest trace explored before the play got stuck (empty if they never met). */
    readonly trace: readonly TraceStep[];
}
export type ChronicleConvergenceJudgment = ChronicleConvergenceWitness | ChronicleConvergenceObstruction;
/**
 * Convergence read at the chronicle level: follow each chronicle of `d1`
 * against `d2`, tracing meetings step by step, and converge at the first
 * Daimon collision.  Refines `convergenceJudgment` (orthogonality.mjs) with the
 * step-by-step dispute; the global convergence verdict is the existence of at
 * least one converging chronicle.
 */
export declare function chronicleConvergenceJudgment(d1: Design, d2: Design): ChronicleConvergenceJudgment;
/** Whether the interaction converges, read chronicle-by-chronicle (some chronicle reaches a Daimon). */
export declare const convergesByChronicle: (d1: Design, d2: Design) => boolean;
/** The full step-by-step trace of the play along the chronicle that converges, or the longest explored. */
export declare function convergenceTrace(d1: Design, d2: Design): readonly TraceStep[];
//# sourceMappingURL=chronicle-convergence.d.mts.map