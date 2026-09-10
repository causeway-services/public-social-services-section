/**
 * The linear-logic fragment lattice — the poset of $*$-autonomous sub-theories
 * of $\mathbf{CGS}$.
 *
 * Corpus theorem (predication-typed-subtheory-lattice-is-linear-logic-fragment-lattice.md):
 *
 *   $$\mathrm{MLL} \subset \mathrm{MALL} \subset \{\mathrm{ILL}, \mathrm{CLL}\} \subset \mathrm{LL}$$
 *
 * "This lattice is fully classified. Each inclusion is a full $*$-autonomous
 * embedding." The braces are load-bearing: **ILL and CLL are incomparable** —
 * neither $\mathrm{ILL} \le \mathrm{CLL}$ nor $\mathrm{CLL} \le \mathrm{ILL}$.
 * This poset is therefore NOT a chain. We carry the covering relation explicitly
 * and close it reflexively/transitively.
 *
 * Classifying which fragment a proposition lives in: the `Proposition` carrier of
 * this package is CLASSICAL (it has $\parr$ and an involutive `dualProp`), so the
 * connective-subset classifier ranges over the classical chain
 * $\mathrm{MLL} \to \mathrm{MALL} \to \mathrm{CLL} \to \mathrm{LL}$ (the corpus's
 * `⊂` is $*$-autonomous embedding, not connective containment — MLL has $\parr$,
 * which ILL lacks, so MLL ⊄ ILL as connective sets). ILL is represented in the
 * poset for completeness as the intuitionistic sibling (no $\parr$, no $?$) and
 * is documented as not a target of the classical classifier.
 */
import { type Connective, type Proposition } from "./proposition.mjs";
export type FragmentName = "MLL" | "MALL" | "ILL" | "CLL" | "LL";
export interface Fragment {
    readonly kind: "game.logic.fragment";
    readonly name: FragmentName;
}
export declare const fragment: (name: FragmentName) => Fragment;
export declare const fragmentNames: () => readonly FragmentName[];
export declare const allFragments: () => readonly Fragment[];
export declare const fragmentCoverings: () => readonly (readonly [FragmentName, FragmentName])[];
/**
 * The fragment lattice as an explicit finite poset carrier: the five fragment
 * elements together with the covering (Hasse) edges of the embedding order. The
 * full $\le$ is recovered by `fragmentLeq` (reflexive-transitive closure); the
 * carrier records exactly the corpus poset MLL ⋖ MALL ⋖ {ILL, CLL} ⋖ LL with
 * ILL and CLL incomparable.
 */
export interface FragmentPoset {
    readonly kind: "game.logic.fragmentPoset";
    readonly elements: readonly Fragment[];
    readonly coverings: readonly (readonly [FragmentName, FragmentName])[];
}
export declare function fragmentPoset(): FragmentPoset;
export declare function isFragmentPoset(value: unknown): value is FragmentPoset;
/**
 * The reflexive-transitive closure of the covering relation: `fragmentLeq(a, b)`
 * holds iff $a$ embeds (as a $*$-autonomous sub-theory) into $b$. Computed by
 * reachability over `coverings`, so the incomparability of ILL and CLL is exact.
 */
export declare function fragmentLeq(lower: FragmentName, upper: FragmentName): boolean;
/** Whether two fragments are comparable in the poset (one embeds into the other). */
export declare const fragmentsComparable: (left: FragmentName, right: FragmentName) => boolean;
export interface InFragmentWitness {
    readonly kind: "game.logic.inFragment:witness";
    readonly proposition: Proposition;
    readonly fragment: Fragment;
    readonly used: readonly Connective[];
}
export interface InFragmentObstruction {
    readonly kind: "game.logic.inFragment-obstruction";
    readonly proposition: Proposition;
    readonly fragment: Fragment;
    readonly used: readonly Connective[];
    readonly forbidden: readonly Connective[];
    readonly reason: string;
}
export type InFragmentJudgment = InFragmentWitness | InFragmentObstruction;
/**
 * Witness/obstruction that proposition $p$ lives in fragment $F$: $p$ is in $F$
 * iff every connective it uses is admitted by $F$. ILL is never a target (it is
 * not on the classical chain this carrier inhabits); asking for it yields an
 * obstruction naming the reason.
 */
export declare function inFragment(p: Proposition, name: FragmentName): InFragmentJudgment;
export declare const isInFragment: (p: Proposition, name: FragmentName) => boolean;
/**
 * The least fragment of the classical chain containing $p$ — the tightest
 * $*$-autonomous sub-theory it inhabits. Returns the first of MLL, MALL, CLL, LL
 * (in embedding order) that admits every connective of $p$.
 */
export declare function classifyFragment(p: Proposition): Fragment;
export declare function isFragment(value: unknown): value is Fragment;
//# sourceMappingURL=fragment.d.mts.map