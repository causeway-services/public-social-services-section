import type { Regime } from "./regime.mjs";
/** The logical signature of a governance process, classifying its closure regime. */
export interface GovernanceProcess {
    /** the agent base is FINITE (a fixed, bounded membership). */
    readonly finiteBase: boolean;
    /** the rules are SCOTT-CONTINUOUS (quantifier-free — the closure converges at ω). */
    readonly scottContinuous: boolean;
    /** if the process is transfinite, its cofinality is COUNTABLE (vs ≥ ω₁, the aperiodic case). */
    readonly countableCofinality: boolean;
}
/** The convergence reading of a governance process. */
export interface Convergence {
    readonly kind: "socializing.convergence";
    /** the closure regime of the process (κ-class). */
    readonly regime: Regime;
    /** the consensus cohomology VANISHES in this regime — convergence is coordination-free (no
     *  coordinator/protocol needed). True in strict and Scott-continuous regimes (Lean-proved). */
    readonly coordinationFree: boolean;
    /** the process settles in FINITELY many rounds (the strict regime, κ < ω). */
    readonly settlesFinitely: boolean;
    /** the process is in the APERIODIC regime (κ ≥ ω₁): provably non-convergent — perpetual
     *  deliberation, no finite coordination protocol settles it. */
    readonly perpetual: boolean;
}
/**
 * governanceConvergence — classify a governance process's convergence by its closure regime, via the
 * Lean-grounded `classifyRegime` and `cohomologyVanishesInRegime`. Reports the regime, whether
 * convergence is coordination-free (the consensus cohomology vanishes), whether it settles finitely,
 * and whether it is provably perpetual (aperiodic).
 */
export declare function governanceConvergence(process: GovernanceProcess): Convergence;
//# sourceMappingURL=trajectory.d.mts.map