/**
 * Orthogonality — the convergence of an interaction, and the relation $\perp$.
 *
 * Girard's interaction has two outcomes: convergence $\Downarrow$ (the play
 * reaches the Daimon $\dagger$ — a participant gives up by committing $\top$)
 * and divergence (a participant is stuck, trying to descend a branch the other
 * never opened).  Two designs are *orthogonal*, $\mathfrak{D} \perp \mathfrak{E}$,
 * exactly when their interaction converges.
 *
 * We read convergence off the interaction normal form computed in
 * `@emsenn/game-algebra`: the join of two dual designs reaches $\top$ (`stable`,
 * the Daimon) at the loci where Proponent and Opponent collide.  Orthogonality
 * is the presence of such a Daimon collision.  The formal "settled at every
 * cell" criterion — the joined valuation being a fixed point of the knowledge
 * closure $\mathrm{cl}$ (Knaster-Tarski) — is the underlying engine in
 * `@emsenn/meme-topology` (`knowledgeLeastFixedPoint`); convergence here is its
 * ludics-native shadow.
 */
import { type Design, type Locus } from "../../index.mjs";
export interface ConvergenceWitness {
    readonly kind: "game.convergence:witness";
    readonly daimonLoci: readonly Locus[];
    readonly normalForm: Design;
}
export interface ConvergenceObstruction {
    readonly kind: "game.convergence-obstruction";
    readonly reason: "no-meeting" | "no-daimon";
    readonly normalForm: Design;
}
export type ConvergenceJudgment = ConvergenceWitness | ConvergenceObstruction;
/**
 * Judge whether the interaction of two designs converges: they must meet (share
 * a committed locus) and reach a Daimon collision ($\top$) somewhere.
 */
export declare function convergenceJudgment(d1: Design, d2: Design): ConvergenceJudgment;
/** $\mathfrak{D} \perp \mathfrak{E}$ — the designs are orthogonal (their interaction converges). */
export declare function orthogonal(d1: Design, d2: Design): boolean;
//# sourceMappingURL=orthogonality.d.mts.map