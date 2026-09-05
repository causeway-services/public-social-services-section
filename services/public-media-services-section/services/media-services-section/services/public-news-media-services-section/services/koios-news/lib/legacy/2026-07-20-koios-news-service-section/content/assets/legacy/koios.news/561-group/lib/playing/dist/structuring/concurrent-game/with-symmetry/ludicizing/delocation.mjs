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
import { joinKnowledgeValue, sameChargeValue, } from "@emsenn/relating";
import { design } from "./design.mjs";
import { locus, locusFromKey, locusKey } from "./locus.mjs";
/** The concatenation of two loci: the address `outer` followed by the address `inner`. */
export const concatLocus = (outer, inner) => locus([...outer.address, ...inner.address]);
/**
 * Relocate a design under a prefix locus ξ: every committed locus `ζ` moves to
 * `ξ · ζ`, the charge unchanged. The empty prefix (`root()`) is the identity;
 * delocation composes — `delocate(delocate(d, ζ), ξ) = delocate(d, ξ · ζ)` — which
 * `delocationComposeJudgment` witnesses.
 */
export function delocate(d, prefix) {
    const labelling = new Map();
    for (const entry of d.entries) {
        const moved = concatLocus(prefix, locusFromKey(entry.locusKey));
        labelling.set(locusKey(moved), entry.charge);
    }
    return design(labelling);
}
/**
 * Superpose several designs into one: the union of their commitments, with the
 * knowledge-join `⊔_k` resolving any locus both commit at. When the designs are
 * relocated under disjoint prefixes (the exponential's use) their supports are
 * disjoint and the superposition is a plain union — each copy kept intact.
 */
export function superpose(designs) {
    const labelling = new Map();
    for (const d of designs) {
        for (const entry of d.entries) {
            const prior = labelling.get(entry.locusKey);
            labelling.set(entry.locusKey, prior === undefined ? entry.charge : joinKnowledgeValue(prior, entry.charge));
        }
    }
    return design(labelling);
}
/** Whether two designs commit the same charge at exactly the same loci. */
export function sameDesign(left, right) {
    if (left.entries.length !== right.entries.length)
        return false;
    const key = (e) => `${e.locusKey}:${e.charge.name}`;
    const rightKeys = new Set(right.entries.map(key));
    return left.entries.every((e) => rightKeys.has(key(e)));
}
/**
 * Witness that delocation composes: relocating by `inner` then by `outer` equals
 * relocating once by the concatenated prefix `outer · inner`. The locative functor
 * law — delocation is an action of the free monoid of loci on designs.
 */
export function delocationComposeJudgment(d, outer, inner) {
    const twoStep = delocate(delocate(d, inner), outer);
    const oneStep = delocate(d, concatLocus(outer, inner));
    return sameDesign(twoStep, oneStep)
        ? Object.freeze({ kind: "game.delocation.compose:witness", composed: oneStep })
        : Object.freeze({ kind: "game.delocation.compose-obstruction", twoStep, oneStep });
}
/** Whether a charge labelling collision would actually merge (used to document disjointness). */
export const chargesAgree = (left, right) => sameChargeValue(left, right);
//# sourceMappingURL=delocation.mjs.map