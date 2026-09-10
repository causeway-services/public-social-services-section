/**
 * socialize/merge — the CRDT knowledge-order exchange (∨_k), scale-2-native.
 *
 * merge is the OFF-DIAGONAL heart of socializing: a genuinely inter-observer morphism
 * with NO single-agent analog (a lone observer has no peer to merge with — like
 * `admit`, it is native to scale 2). It realizes the corpus's distributed-settling
 * system (content/_archive spatiotemporal-knowledge-presheaf
 * `distributed-settling-system.md`): replicas exchange state via the **merge
 * operation — the pointwise knowledge-order join `∨_k` of their valuations**.
 *
 * `merge(from, to)` is a directed replica receive: observer `to` incorporates observer
 * `from`'s knowledge, becoming `V(to) ∨_k V(from)` cellwise; `from` is unchanged (it
 * sent a copy). The two observers must be adjacent in the observer category `O` (a
 * translation in either direction is the medium of exchange). The join is taken
 * per predication cell: memes over the same cell have their charges `joinKnowledge`-d
 * (the bilattice knowledge join, evidence-accumulating, dedup by `mergeEvidence`);
 * memes unique to either side carry through.
 *
 * The CRDT laws this realizes (and the suite asserts):
 *   - MONOTONE: `merge(from, to) ≥_k to` — knowledge only grows (settling-monotonicity).
 *   - IDEMPOTENT: `merge(to, to)` leaves `to` fixed (∨_k is idempotent).
 *   - the FIXPOINT of iterated merge over a component is its `pooled = ∨_k` charge —
 *     which is exactly what `converge` reports, and (by the CALM theorem) is reached
 *     COORDINATION-FREE iff `H¹ = 0`. So merge is the dynamics; converge is its readout.
 *
 * Reuses relating's `joinKnowledge`/`meme`/`canonical` — the same knowledge-order join
 * `converge`'s `representativeCharge` already folds, here ranged across the edge.
 */
import { type Action, type JsonRecord } from "@emsenn/relating";
/**
 * The pointwise knowledge-order join (∨_k) of two stalks: group every meme by its
 * predication cell (`canonical`), fold the charges over each cell with `joinKnowledge`,
 * and rebuild one meme per cell. Non-meme items (there should be none) pass through.
 *
 * This is the semilattice merge of `settling-merge-semilattice.md` — commutative,
 * associative, idempotent — exported so the settling dynamics (`settle.mts`) can fold
 * it across a gossip round.
 */
export declare function mergeStalks(into: readonly JsonRecord[], incoming: readonly JsonRecord[]): readonly JsonRecord[];
/** merge — observer `to` receives observer `from`'s knowledge (to ← to ∨_k from). */
export declare const mergeAction: Action;
//# sourceMappingURL=merge.d.mts.map