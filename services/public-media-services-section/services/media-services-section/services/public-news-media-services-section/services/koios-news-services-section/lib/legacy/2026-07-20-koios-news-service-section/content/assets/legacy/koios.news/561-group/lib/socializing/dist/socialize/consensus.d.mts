/**
 * consensus — bilattice network-sheaf consensus over a fleet of observer charges.
 *
 * socializing's own collective-decision read (multi-observer settlement): many
 * agents observe the same subject and each contributes a charge; consensus is read
 * off the network sheaf on the observer graph. The obstruction to agreement is
 * exactly the H¹ of the opposition subgraph — disagreement is a topological
 * obstruction, not a mere mismatch. Theory:
 * `work/archive/quorum-as-colimit-of-voter-fibers.md`, `consensus-closure.md`, and
 * the bilattice-network-sheaf-consensus theorem.
 *
 * Per component (a connected group of observers):
 *   pooled = ⋀_k over the component  (knowledge-join — everything anyone knows)
 *   common = ⋁_k over the component  (knowledge-meet — what all agree on)
 * Two observers are *opposed* on an edge when one settled positive-only
 * (`potential`) and the other negative-only (`active`): a direct contradiction in
 * truth direction. The obstruction is the first Betti number of the opposition
 * subgraph (edges − touched-vertices + components); zero means coordination-free,
 * and the fleet is *confident* only when coordination-free and every component
 * pooled to a definite (non-⊥, non-⊤) charge.
 *
 * This is socializing's home for the consensus read — the off-diagonal observer
 * category O settling its plurality into one decision. (Relocated from animating;
 * a fleet's collective settlement is a social, not an interior-agent, concern.)
 */
import { type ChargeCarrier, type JsonRecord } from "@emsenn/relating";
/**
 * An undirected comparison edge in the observer graph: a [left, right] pair of
 * observer indices whose settled charges are compared for opposition.
 */
export type ObserverEdge = readonly [left: number, right: number];
/**
 * The settled consensus over one connected component of observers: its member
 * indices, the knowledge-join `pooled` charge (everything anyone in the
 * component knows), and the knowledge-meet `common` charge (only what every
 * member shares).
 */
export interface ComponentConsensus {
    /** Observer indices in this connected component. */
    readonly members: readonly number[];
    /** Knowledge-join across the component — the union of all evidence. */
    readonly pooled: ChargeCarrier;
    /** Knowledge-meet across the component — only what every member shares. */
    readonly common: ChargeCarrier;
}
/**
 * The network-sheaf consensus read off a fleet of observer charges:
 * per-component consensus, the indices of opposed edges, the H1 obstruction
 * (first Betti number of the opposition subgraph) and whether it is zero
 * (coordinationFree), per-component confidence, and the overall `confident`
 * flag (coordination-free and every component pooled to a definite charge).
 */
export interface SheafConsensus {
    readonly componentConsensus: readonly ComponentConsensus[];
    /** Indices into `edges` whose endpoints settled to opposed truth directions. */
    readonly opposedEdges: readonly number[];
    /** Finite predication-cohomology receipt for the opposition subgraph. */
    readonly cohomology: JsonRecord;
    /** First Betti number of the opposition subgraph — the H¹ obstruction. */
    readonly obstruction: number;
    /** obstruction === 0: no cycle of disagreement to coordinate away. */
    readonly coordinationFree: boolean;
    readonly confidentByComponent: readonly boolean[];
    /** Coordination-free AND every component pooled to a definite charge. */
    readonly confident: boolean;
}
/** The complete graph on `size` observers — every observer compared with every other. */
export declare function completeGraph(size: number): ObserverEdge[];
/** A charge with a definite truth direction (potential or active, not ⊥/⊤). */
export declare function definite(charge: ChargeCarrier): boolean;
/** Two charges in directly opposed truth directions: one positive-only, the
 *  other negative-only. ⊥ and ⊤ are never opposed (no definite direction). */
export declare function opposed(left: ChargeCarrier, right: ChargeCarrier): boolean;
/** Network-sheaf consensus over the observer charges and the comparison graph
 *  (default: complete graph — every pair compared). */
export declare function sheafCharges(charges: readonly ChargeCarrier[], edges?: readonly ObserverEdge[]): SheafConsensus;
/** Consensus over any observations that carry a `charge`. */
export declare function sheafObservations(observations: readonly {
    readonly charge: ChargeCarrier;
}[], edges?: readonly ObserverEdge[]): SheafConsensus;
/**
 * The consensus read through the substrate graph Laplacian (`@emsenn/relating` analysis.laplacian).
 * Where `sheafCharges` computes the opposition subgraph's first Betti number by hand, this grounds the
 * CONSENSUS (agreement) structure in the spectral Laplacian over the fixed observer set: the AGREEMENT
 * graph is the comparison edges whose endpoints are not opposed.
 *   • clusters = the connected-component count H⁰ (the Laplacian's zero-eigenvalue multiplicity) — how
 *     many independent agreement groups the fleet settles into (consensus = a single global section,
 *     H⁰ of the cover, per the consensus-as-H⁰-construction theorem; isolated observers count).
 *   • agreementTrees = the Matrix-Tree spanning-tree count — the consensus ROBUSTNESS: `0` the fleet
 *     fragments into several clusters, `1` a single fragile thread of agreement (one lost link
 *     fragments it), `> 1` redundant agreement paths (resilient to a few disagreements).
 */
export interface SpectralConsensus {
    readonly kind: "socializing.spectral-consensus";
    /** the number of observers (the fixed vertex set of the agreement graph). */
    readonly observers: number;
    /** H⁰ = the number of independent agreement clusters (connected components, isolated observers
     *  counted), as the Laplacian's zero-eigenvalue multiplicity. */
    readonly clusters: number;
    /** whether the whole fleet agrees into one cluster (`clusters === 1`) — a single global section. */
    readonly unified: boolean;
    /** the Matrix-Tree spanning-tree count of the agreement graph — the consensus robustness. */
    readonly agreementTrees: number;
    /** redundant agreement paths (`agreementTrees > 1`): resilient to a few disagreements. */
    readonly robust: boolean;
    /** a single fragile thread of agreement (`agreementTrees === 1`): one lost link fragments it. */
    readonly fragile: boolean;
    /** CONSENSUS EQUILIBRIUM: whether the fleet's truth-lean assignment is HARMONIC on the comparison
     *  graph (`L·lean = 0`, the lean ∈ ker L) — every compared pair shares one truth direction, so no
     *  disagreement flows along any edge. This is the consensus = ker(L) reading (the field's settled
     *  limit is harmonic ⟺ coordination-free), DISTINCT from the structural `robust`/`fragile` reading:
     *  a fleet can be robustly connected yet not at equilibrium (compared neighbours leaning differently). */
    readonly atEquilibrium: boolean;
    /** derivable agreement: the EXACT/gradient flows of the agreement graph `rank(L) = V − C` (the
     *  pairwise agreements implied by a per-cluster consensus). */
    readonly derivable: number;
    /** irreducible agreement cycles: the HARMONIC flows `β₁ = E − V + C` (the H¹) — the redundant
     *  agreement loops that make the consensus robust beyond a spanning tree. */
    readonly irreducible: number;
}
/** Read a fleet's consensus through the substrate graph Laplacian: the agreement graph's component
 *  count (H⁰) and spanning-tree robustness. */
export declare function spectralConsensus(charges: readonly ChargeCarrier[], edges?: readonly ObserverEdge[]): SpectralConsensus;
/** The diffusion endpoint of a fleet's charges: where each observer's agreement-community settles. */
export interface DiffusedField {
    readonly kind: "socializing.diffused-field";
    /** the number of observers. */
    readonly observers: number;
    /** observers whose agreement-community diffuses to a net FOR (+1) truth-direction. */
    readonly leansFor: number;
    /** observers whose agreement-community diffuses to a net AGAINST (−1) truth-direction. */
    readonly leansAgainst: number;
    /** observers whose agreement-community diffuses to a BALANCED (0) direction — no net lean. */
    readonly balanced: number;
}
/**
 * diffusedField — diffuse the fleet's charges to consensus. Each observer relaxes to the net
 * truth-DIRECTION of its agreement-community (`sign` of the harmonic projection `lim_{t→∞} e^{−tL}`
 * onto `ker L` — the per-community mean lean), read through the substrate `diffusionDirections`. Where
 * `spectralConsensus.atEquilibrium` asks WHETHER the leans are already harmonic, this reads what the
 * fleet settles TO: how many observers land for / against / balanced once consensus diffuses.
 */
export declare function diffusedField(charges: readonly ChargeCarrier[], edges?: readonly ObserverEdge[]): DiffusedField;
//# sourceMappingURL=consensus.d.mts.map