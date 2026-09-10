/**
 * trajectory — socializing's GOVERNANCE-CONVERGENCE reading: does a governance PROCESS ever settle,
 * and can it settle without a coordinator? A governance is not a snapshot but a closure process —
 * deliberation iterated toward a settled collective state. The corpus's four-regime classification
 * (Lean-proved RelMath closure-ordinal theorems, surfaced as relating's `classifyRegime` /
 * `cohomologyVanishesInRegime`) answers both questions exactly, from the process's logical signature.
 *
 * A process is classified by three structural facts: is its agent base FINITE; are its rules
 * SCOTT-CONTINUOUS (quantifier-free, so the closure converges at ω); and, if transfinite, is its
 * cofinality COUNTABLE. The regime that falls out:
 *   - strict (κ < ω): settles in finitely many rounds; coordination-free.
 *   - scott-continuous (κ = ω): settles at the ω-limit; still coordination-free (H¹ vanishes).
 *   - transfinite-bounded (ω < κ < ω₁): may need a coordinator (H¹ need not vanish).
 *   - aperiodic (κ ≥ ω₁): PROVABLY never practically settles — perpetual deliberation.
 *
 * The unasked question this answers: some governance DESIGNS are non-convergent by construction. A
 * rule that quantifies over an unbounded future population (the seventh-generation obligation, an
 * open-membership swarm with ∀-over-all-future-agents) lands in the aperiodic regime — its consensus
 * cohomology does not vanish, so no finite coordination protocol settles it. That is not a bug to fix
 * but a structural fact the math exposes before the polity is ever run.
 *
 * Consumes relating's `classifyRegime` + `cohomologyVanishesInRegime` (the Lean regime theorems);
 * re-derives no closure-ordinal math.
 */
import { classifyRegime, cohomologyVanishesInRegime, } from "@emsenn/relating";
const closureRegimeData = (process) => ({
    kind: "settling.closureRegimeData",
    scottContinuous: process.scottContinuous,
    finiteBase: process.finiteBase,
    countableCofinality: process.countableCofinality,
});
/** Map relating's `ClosureRegime` carrier to socializing's regime name. */
function regimeName(regime) {
    const kind = regime.kind;
    if (kind.includes("aperiodic"))
        return "aperiodic";
    if (kind.includes("transfinite"))
        return "transfinite-bounded";
    if (kind.includes("scott"))
        return "scott-continuous";
    return "strict";
}
/**
 * governanceConvergence — classify a governance process's convergence by its closure regime, via the
 * Lean-grounded `classifyRegime` and `cohomologyVanishesInRegime`. Reports the regime, whether
 * convergence is coordination-free (the consensus cohomology vanishes), whether it settles finitely,
 * and whether it is provably perpetual (aperiodic).
 */
export function governanceConvergence(process) {
    const regime = classifyRegime(closureRegimeData(process));
    const name = regimeName(regime);
    return Object.freeze({
        kind: "socializing.convergence",
        regime: name,
        coordinationFree: cohomologyVanishesInRegime(regime),
        settlesFinitely: name === "strict",
        perpetual: name === "aperiodic",
    });
}
//# sourceMappingURL=trajectory.mjs.map