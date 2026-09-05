/**
 * cognizing/spectral — [Meme] → knowing/spectral-binding: BINDING read through the substrate
 * spectral graph Laplacian.
 *
 * knowing's `bind` (bind.mts/binding.mts) already reads the held section's feature graph as Čech
 * cohomology: H⁰ = bound percepts (connected components), H¹ = binding obstruction (cycle rank),
 * computed by its own union-find. This reading GROUNDS that H⁰ in relating's combinatorial graph
 * Laplacian L = D − W (`@emsenn/relating` analysis.laplacian, exact over ℤ): the percept count is the
 * zero-eigenvalue multiplicity (`componentCount`), the spectral definition of H⁰. And it ADDS the one
 * thing union-find cannot see — the **Matrix-Tree (Kirchhoff) spanning-tree count** (`treeCount`), the
 * number of distinct spanning configurations that hold the percept together. That count is the BINDING
 * ROBUSTNESS: `0` ⟺ the section fragments into several percepts (H⁰ > 1); `1` ⟺ a unique rigid binding
 * (a spanning tree, no redundant cycles, H¹ = 0); `> 1` ⟺ a redundantly/over-determined binding (cycles
 * present, H¹ > 0 — the illusory-conjunction / superposition-catastrophe risk bind flags). The relation
 * graph reads only the cells (subject↔object), so the held memes present it directly via
 * `relationGraphOfCells`. Total over any collection of memes.
 */
import { type Action, type Meme } from "@emsenn/relating";
import type { Contextuality } from "./carriers.mjs";
import { type AperiodicDreamResult, type AperiodicPraxisFrontier, type AperiodicResidue, type Observation } from "../dreaming/index.mjs";
/** knowing's spectral read of binding: H⁰ percepts (zero-eigenvalue multiplicity) plus the
 *  Matrix-Tree spanning-tree count as the binding's rigidity/redundancy. */
export interface SpectralBinding {
    readonly kind: "knowing.spectral-binding";
    /** distinct feature terms — the vertices of the relation graph. */
    readonly features: number;
    /** H⁰ = the number of bound percepts (connected components), as the Laplacian's zero-eigenvalue
     *  multiplicity — the SPECTRAL definition of bind's percept count. */
    readonly percepts: number;
    /** whether the whole section binds into a single percept (`percepts === 1`). */
    readonly bound: boolean;
    /** the Matrix-Tree (Kirchhoff) spanning-tree count of the relation graph — the number of distinct
     *  spanning configurations holding the percept together (`0` fragmented, `1` rigid, `> 1` redundant). */
    readonly spanningTrees: number;
    /** a unique rigid binding: one spanning tree, no redundant cycles (`spanningTrees === 1`, H¹ = 0). */
    readonly rigid: boolean;
    /** an over-determined binding: redundant cycles present (`spanningTrees > 1`, H¹ > 0) — the
     *  illusory-conjunction / superposition-catastrophe risk. */
    readonly redundant: boolean;
}
/** Read a held section's binding through the substrate graph Laplacian: the spectral percept count
 *  (H⁰) and the spanning-tree robustness of the binding. */
export declare function spectralBindingOf(memes: readonly Meme[]): SpectralBinding;
/** spectral — read a held section's binding through the spectral graph Laplacian (H⁰ percepts as
 *  zero-eigenvalue multiplicity + Matrix-Tree spanning-tree robustness). */
export declare const spectralAction: Action;
/** knowing's HODGE DECOMPOSITION of binding: the held section's binding-graph edge-flows split into
 *  the DERIVABLE bindings (exact / gradient — reconstructible from a per-term potential) and the
 *  IRREDUCIBLE binding cycles (harmonic / β₁ = the H¹ obstruction no local amendment can kill — the
 *  exact count of illusory-conjunction cycles `spectralBinding.redundant` only flagged). */
export interface HodgeBinding {
    readonly kind: "knowing.hodge-binding";
    /** distinct feature terms — the vertices of the binding graph. */
    readonly features: number;
    /** total bindings — the edge-flow space `dim C¹ = E`. */
    readonly bindings: number;
    /** DERIVABLE bindings: the exact/gradient flows `rank(L) = V − C` (reconstructible from local
     *  potentials — the bindings inference can recover). */
    readonly derivable: number;
    /** IRREDUCIBLE binding cycles: the harmonic flows `β₁ = E − V + C` (the H¹ obstruction — the
     *  illusory conjunctions that survive every local amendment). */
    readonly irreducible: number;
}
/** Decompose a held section's binding through the substrate graph Hodge decomposition. */
export declare function hodgeBindingOf(memes: readonly Meme[]): HodgeBinding;
/** hodge — decompose a held section's binding into derivable (exact) and irreducible (harmonic) parts. */
export declare const hodgeAction: Action;
export type ContextualSpectrumPhase = "flat" | "harmonic" | "contextual" | "harmonic-contextual";
/** The bridge carrier: spectral/Hodge residue plus signed contextual obstruction. */
export interface ContextualSpectrum {
    readonly kind: "knowing.contextual-spectrum";
    readonly spectral: SpectralBinding;
    readonly hodge: HodgeBinding;
    readonly contextuality: Contextuality;
    readonly obstruction: {
        readonly phase: ContextualSpectrumPhase;
        readonly harmonicRank: number;
        readonly frustration: number;
        readonly globalSection: boolean;
    };
    readonly praxis: {
        readonly reflection: string;
        readonly action: string;
    };
    readonly theory: {
        readonly spectral: "hodge-harmonic-residue";
        readonly contextual: "global-section-obstruction";
        readonly autonomous: "self-producing-frontier";
        readonly social: "theory-practice-loop";
    };
}
/** A contextual/spectral obstruction promoted into the aperiodic dreaming loop. */
export interface ContextualDreamFrontier {
    readonly kind: "knowing.contextual-dream-frontier";
    readonly regime: "aperiodic";
    readonly spectrum: ContextualSpectrum;
    readonly observations: readonly Observation[];
    readonly residue: AperiodicResidue;
    readonly dream: AperiodicDreamResult;
    readonly praxis: AperiodicPraxisFrontier;
    readonly bridge: {
        readonly from: "knowing.contextual-spectrum";
        readonly to: "knowing.dream.aperiodic-residue";
        readonly active: boolean;
        readonly reason: string;
    };
    readonly theory: {
        readonly sheaf: "global-section-obstruction";
        readonly spectral: "hodge-harmonic-residue";
        readonly praxis: "theory-practice-theory";
        readonly dream: "aperiodic-non-convergence";
    };
}
/** Bridge the spectral/Hodge reading of a held section with signed contextuality constraints. */
export declare function contextualSpectrumOf(input: {
    readonly memes: readonly Meme[];
    readonly constraints?: readonly string[];
}): ContextualSpectrum;
/** Promote contextual/spectral obstruction into a finite-excluded aperiodic dream frontier. */
export declare function contextualDreamFrontierOf(input: {
    readonly memes: readonly Meme[];
    readonly constraints?: readonly string[];
    readonly limit?: number;
}): ContextualDreamFrontier;
/** contextual-spectrum — bridge spectral/Hodge residue with signed global-section obstruction. */
export declare const contextualSpectrumAction: Action;
export declare const contextualDreamFrontierAction: Action;
//# sourceMappingURL=spectral.d.mts.map