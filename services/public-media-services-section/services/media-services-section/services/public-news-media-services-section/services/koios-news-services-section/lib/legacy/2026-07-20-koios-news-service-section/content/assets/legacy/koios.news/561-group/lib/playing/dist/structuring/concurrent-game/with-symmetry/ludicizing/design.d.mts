/**
 * Designs — Girard's dialogical objects, realized as charge valuations.
 *
 * The ludics correspondence theorem (corpus, "A Girard design corresponds to a
 * partial valuation $v_\mathfrak{D} : E \times E \dashrightarrow \mathbf{L}^\bowtie$")
 * states that a design IS a partial valuation from loci into the bilattice
 * charge.  The four polarity-states of a locus map bijectively onto the four
 * charge values of meme-algebra:
 *
 *   - Proponent acts (positive)      ↦ `potential` = $t = (1,0)$
 *   - Opponent acts (negative)       ↦ `active`    = $f = (0,1)$
 *   - Daimon $\dagger$ (give up)      ↦ `stable`    = $\top = (1,1)$  (designated)
 *   - no action (undefined region)   ↦ `absurd`    = $\bot = (0,0)$  (the default)
 *
 * A design is therefore not a new datatype — it is a configuration of the meme
 * apex: a finite charge labelling of the locus tree.  Loci outside the support
 * carry $\bot$.
 */
import { type ChargeValue } from "@emsenn/relating";
import { type Locus, type Locus as LocusType } from "./locus.mjs";
export type DesignAct = "proponent" | "opponent" | "daimon" | "none";
export interface DesignEntry {
    readonly kind: "game.design.entry";
    readonly locusKey: string;
    readonly charge: ChargeValue;
}
export interface Design {
    readonly kind: "game.design";
    /** Charge labelling of loci; entries with `absurd` ($\bot$) are dropped — that is the default. */
    readonly entries: readonly DesignEntry[];
}
export declare function design(labelling?: ReadonlyMap<string, ChargeValue> | readonly DesignEntry[]): Design;
export declare const emptyDesign: () => Design;
/** The act committed at a locus → its charge value. */
export declare const actCharge: (act: DesignAct) => ChargeValue;
/** Build a design from an act labelling of loci. */
export declare function designFromActs(acts: ReadonlyMap<string, DesignAct>): Design;
/** The Daimon design at a single locus — "give up by asserting and denying", charge $\top$. */
export declare const daimon: (xi?: LocusType) => Design;
/** The charge a design assigns to a locus; loci outside the support carry $\bot$ (`absurd`). */
export declare function designCharge(d: Design, xi: Locus): ChargeValue;
export declare function designAct(d: Design, xi: Locus): DesignAct;
/** The loci a design actually commits at (its support — the non-$\bot$ region). */
export declare const support: (d: Design) => readonly Locus[];
export declare const supportKeys: (d: Design) => readonly string[];
export declare function isDesign(value: unknown): value is Design;
//# sourceMappingURL=design.d.mts.map