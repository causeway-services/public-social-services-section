/**
 * opinion — socializing's OPINION DYNAMICS: DeGroot averaging and the Friedkin–Johnsen model with
 * stubborn agents. Where `consensus.mts`/`face.mts` read WHETHER fixed opinions glue, this models HOW
 * they evolve and whether they converge at all. The package already computes the social graph's
 * Laplacian (`spectralConsensus`); opinion dynamics is the heat flow ON that graph.
 *
 * DeGroot (1974): xₜ₊₁ = W xₜ over a row-stochastic trust matrix W — repeated averaging drives a
 * connected, aperiodic society to consensus (the dominant left eigenvector weighting). Friedkin–
 * Johnsen (1990): xᵢ,ₜ₊₁ = λᵢ Σⱼ Wᵢⱼ xⱼ,ₜ + (1−λᵢ) sᵢ — each agent is pulled toward the social
 * average with susceptibility λᵢ but anchored to its innate opinion sᵢ with stubbornness (1−λᵢ). The
 * crucial empirical fact: with any stubborn agents (λᵢ < 1) holding different innate opinions, the
 * society reaches a PERSISTENT-DISAGREEMENT equilibrium, not consensus — the formal signature of
 * polarization and echo chambers. The observed contraction rate is governed by the graph's algebraic
 * connectivity (the Fiedler value); we report the empirical rate rather than an eigensolve.
 */
/** A uniform-averaging (DeGroot) trust matrix from an undirected neighbor list, including self-trust:
 *  each agent weights itself and each neighbor equally. A convenience for building W from a graph. */
export declare function averagingMatrix(size: number, edges: readonly (readonly [number, number])[]): number[][];
/** The outcome of an opinion-dynamics run. */
export interface OpinionEquilibrium {
    readonly kind: "socializing.opinion-equilibrium";
    /** the opinions at the (approximate) equilibrium. */
    readonly opinions: readonly number[];
    /** the max−min spread of the equilibrium opinions. */
    readonly spread: number;
    /** the society reached CONSENSUS (spread below tolerance). */
    readonly consensus: boolean;
    /** PERSISTENT DISAGREEMENT: a stable equilibrium with a non-trivial spread (polarization). */
    readonly polarized: boolean;
    /** the iteration converged to a fixed point within the step budget. */
    readonly converged: boolean;
    /** the empirical contraction rate (spreadₜ₊₁/spreadₜ near the end) — small ⇒ fast mixing (large
     *  algebraic connectivity / Fiedler value); near 1 ⇒ a bottlenecked, slow-mixing society. */
    readonly contraction: number;
}
/**
 * degroot — iterate DeGroot averaging xₜ₊₁ = W xₜ from the initial opinions to a fixed point (or the
 * step budget). A connected, self-trusting society converges to consensus; a disconnected one
 * converges within components. Reports the equilibrium, spread, and empirical contraction rate.
 */
export declare function degroot(weights: readonly (readonly number[])[], initial: readonly number[], steps?: number): OpinionEquilibrium;
/**
 * friedkinJohnsen — iterate the Friedkin–Johnsen update xᵢ ← λᵢ Σⱼ Wᵢⱼ xⱼ + (1−λᵢ) sᵢ to equilibrium.
 * `susceptibility[i]` = λᵢ ∈ [0,1] (1 = fully open / pure DeGroot, 0 = immovably stubborn at its innate
 * opinion). With any stubborn agents holding distinct innate opinions, the equilibrium is a persistent
 * disagreement — the model's signature result, and why a society of anchored agents never fully
 * converges. `innate` defaults to the initial opinions.
 */
export declare function friedkinJohnsen(weights: readonly (readonly number[])[], initial: readonly number[], susceptibility: readonly number[], innate?: readonly number[], steps?: number): OpinionEquilibrium;
//# sourceMappingURL=opinion.d.mts.map