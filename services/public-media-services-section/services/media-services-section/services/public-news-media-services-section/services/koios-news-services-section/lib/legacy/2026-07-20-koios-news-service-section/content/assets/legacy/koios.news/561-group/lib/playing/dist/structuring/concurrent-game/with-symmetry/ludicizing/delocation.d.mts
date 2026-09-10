/**
 * Delocation — the spatial (locative) structure of ludics.
 *
 * Girard's ludics is *locative*: a design lives at an address in the locus tree,
 * and the same dialogical content can be *relocated* to any other address without
 * changing how it plays. Delocation `delocate(d, ξ)` prepends a prefix locus ξ to
 * every locus a design commits at — it relocates the whole design under ξ. The
 * load-bearing fact (proved downstream in `topology/locativity.mjs`) is that an
 * interaction is unchanged when *both* dual designs are delocated by the same
 * prefix: orthogonality is delocation-invariant. This is what lets ludics build
 * the multiplicatives and exponentials by relocating copies under disjoint
 * sub-addresses and superposing them.
 *
 * Two primitives live here, both pure relabellings of the charge valuation a
 * design IS (`design.mjs`): `delocate` (relocate under a prefix) and `superpose`
 * (merge several designs' commitments into one, knowledge-joining any collision —
 * disjoint relocations never collide, which is exactly why they can be combined).
 */
import { type ChargeValue } from "@emsenn/relating";
import { type Design } from "./design.mjs";
import { type Locus } from "./locus.mjs";
/** The concatenation of two loci: the address `outer` followed by the address `inner`. */
export declare const concatLocus: (outer: Locus, inner: Locus) => Locus;
/**
 * Relocate a design under a prefix locus ξ: every committed locus `ζ` moves to
 * `ξ · ζ`, the charge unchanged. The empty prefix (`root()`) is the identity;
 * delocation composes — `delocate(delocate(d, ζ), ξ) = delocate(d, ξ · ζ)` — which
 * `delocationComposeJudgment` witnesses.
 */
export declare function delocate(d: Design, prefix: Locus): Design;
/**
 * Superpose several designs into one: the union of their commitments, with the
 * knowledge-join `⊔_k` resolving any locus both commit at. When the designs are
 * relocated under disjoint prefixes (the exponential's use) their supports are
 * disjoint and the superposition is a plain union — each copy kept intact.
 */
export declare function superpose(designs: readonly Design[]): Design;
/** Whether two designs commit the same charge at exactly the same loci. */
export declare function sameDesign(left: Design, right: Design): boolean;
export interface DelocationComposeWitness {
    readonly kind: "game.delocation.compose:witness";
    readonly composed: Design;
}
export interface DelocationComposeObstruction {
    readonly kind: "game.delocation.compose-obstruction";
    readonly twoStep: Design;
    readonly oneStep: Design;
}
export type DelocationComposeJudgment = DelocationComposeWitness | DelocationComposeObstruction;
/**
 * Witness that delocation composes: relocating by `inner` then by `outer` equals
 * relocating once by the concatenated prefix `outer · inner`. The locative functor
 * law — delocation is an action of the free monoid of loci on designs.
 */
export declare function delocationComposeJudgment(d: Design, outer: Locus, inner: Locus): DelocationComposeJudgment;
/** Whether a charge labelling collision would actually merge (used to document disjointness). */
export declare const chargesAgree: (left: ChargeValue, right: ChargeValue) => boolean;
//# sourceMappingURL=delocation.d.mts.map