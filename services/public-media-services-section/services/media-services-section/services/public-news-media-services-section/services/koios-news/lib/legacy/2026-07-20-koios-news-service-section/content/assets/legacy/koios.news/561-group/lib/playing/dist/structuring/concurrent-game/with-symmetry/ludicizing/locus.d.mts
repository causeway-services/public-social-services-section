/**
 * Loci — the addresses of ludics.
 *
 * Girard 2001 builds ludics on three primitives: loci (addresses), designs
 * (dialogical objects located at loci), and interaction.  A locus is a finite
 * path from the root of the locus tree — a sequence of natural numbers naming
 * which child to descend into at each step.  The empty sequence is the root;
 * `child(xi, i)` is the $i$-th child of $\xi$; the prefix order is the tree
 * order.  Designs (next module) are valuations defined over loci.
 */
export interface Locus {
    readonly kind: "game.locus";
    readonly address: readonly number[];
}
export declare function locus(address?: readonly number[]): Locus;
export declare const root: () => Locus;
export declare const child: (xi: Locus, i: number) => Locus;
export declare const parent: (xi: Locus) => Locus | null;
export declare const locusKey: (xi: Locus) => string;
export declare const sameLocus: (left: Locus, right: Locus) => boolean;
export declare const locusDepth: (xi: Locus) => number;
/** Prefix order $\xi \sqsubseteq \zeta$ — $\xi$ is an ancestor of (or equal to) $\zeta$. */
export declare function prefixes(xi: Locus, zeta: Locus): boolean;
export declare function locusFromKey(key: string): Locus;
export declare function isLocus(value: unknown): value is Locus;
//# sourceMappingURL=locus.d.mts.map