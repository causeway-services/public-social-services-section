/**
 * socialize/settle — the closure-driven SOCIAL SETTLING: the field's evolution across
 * settling stages τ to its quiescent limit v∞.
 *
 * The corpus's settling is not a snapshot but a monotone family `(v_τ)_{τ<λ}` with
 * settling-monotonicity `v_σ ≤_k v_τ` for `σ ≤ τ` (spatiotemporal-knowledge-presheaf).
 * For a distributed settling system the dynamics are CRDT gossip: each replica's stage-τ
 * state is `cl(⋁_k U_{i,τ})` — the closure of the join of the writes it has received —
 * and once every write has reached every replica all converge to the common limit
 * `v∞ = cl(⋁_k U)`, in FINITELY many steps, with NO consensus protocol (crdt-convergence.md).
 *
 * `settle` realizes that dynamics on the Social Field. With no inference layer the
 * closure operator `cl` is the identity, so a settling stage is one SYNCHRONOUS
 * gossip-merge round: every observer simultaneously becomes `V(o) ∨_k ⋁_{neighbours} V`.
 * Rounds are iterated until the field quiesces (a fixpoint — a further round changes
 * nothing). The number of rounds that changed the field is the SETTLING DEPTH κ — the
 * closure ordinal of the social settling, here the eccentricity of the observer graph.
 * It is finite for a finite field (κ < ω) — consistent with the strict regime — and the
 * quiescent endpoint is the per-component pooled (`∨_k`) charge `converge` reports: this
 * is CRDT convergence run to its limit.
 *
 * The trajectory `(stages)` IS the monotone family `(v_τ)`. In the strict / scott
 * regimes (endpoint-state federation) only the endpoint v∞ matters; the trajectory is
 * the firing-ordinal record the transfinite regimes must SHIP (the trajectory federation
 * discipline). `settle` returns the quiesced field with `section.closureOrdinal = κ`;
 * `settleTrajectory` exposes the whole family for inspection and trajectory shipping.
 *
 * Reuses `mergeStalks` (the ∨_k semilattice merge) and `convergeAction` (the consensus
 * readout) — settle is the iteration of merge to the limit, then the converge readout.
 */
import { type Action } from "@emsenn/relating";
import { type Field } from "./field.mjs";
/**
 * Run the social settling to quiescence, recording the monotone family `(v_τ)`.
 * Returns the trajectory (stages[0] is the input; stages[κ] is the quiescent v∞) and the
 * settling depth κ (the number of rounds that changed the field). Bounded by the observer
 * count (a finite gossip graph fully propagates within that many rounds).
 */
export declare function settleTrajectory(field: Field): {
    readonly stages: readonly Field[];
    readonly closureOrdinal: number;
};
/** settle — iterate the gossip-merge to the quiescent limit v∞; write κ and re-read the
 *  consensus over the settled field. */
export declare const settleAction: Action;
//# sourceMappingURL=settle.d.mts.map