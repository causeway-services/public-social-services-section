/**
 * socialize/field — the Social Field carrier as a MULTI-OBSERVER SYSTEM, and its
 * social base as a genuine OBSERVER CATEGORY.
 *
 * socializing works over its primary carrier, the Social Field
 * (`socializing/social-field`) — its core morphisms transform it (readings project it). The corpus
 * structure it realizes is the multi-observer
 * system of content/_archive's spatiotemporal-knowledge-presheaf: a functor
 * `V : O → Settlings_B` assigning to each observer `o ∈ O` a settling `V(o)` over a
 * shared base. Here:
 *
 *   - `members` are the observers — each an `agent` (reused from animating) carrying
 *     its local `memes` (reused from relating: the valuation of that observer's settling).
 *   - `base` is the OBSERVER CATEGORY `O` itself — NOT a bare undirected channel graph.
 *     Its objects are the members (by index); its non-identity morphisms are the
 *     directed `Translation` settling-morphisms `α : source → target` — perspective
 *     maps `V(α) : V(source) → V(target)` (knowledge-presheaf preorder morphisms, the
 *     `≤_k` refinement). Identities are implicit and composites derivable; only the
 *     generating non-identity translations are stored.
 *   - `section` is the glued common-ground — the LIMIT `lim_O V(o)` (the knowledge-meet
 *     over `O`) — and its H¹ obstruction. `converge` writes it.
 *
 * The corpus is explicit that a DISCRETE `O` (no non-identity translations) is "just a
 * family of independent settlings" — the degenerate diagonal case. The richer social
 * content lives OFF the diagonal, in the translations among distinct observers, and is
 * what the social morphisms (translate = V(α), merge = the CRDT ∨_k, converge = the
 * limit + H¹ + CALM) act on. This module supplies the carrier shapes, the boundary
 * admission, and the observer-category operations (identity, composition, the
 * comparison-graph projection sheafCharges consumes, neighbours, and the replica-cover
 * the consensus glues over). The carrier's TYPE is generated from
 * `social-field.schema.json` (the law); these runtime shapes are its structural reading.
 */
import { charge, chargeValue, joinKnowledge, } from "@emsenn/relating";
/** The carrier `$id` every morphism slot references — socializing is endo on it. */
export const SOCIAL_FIELD_ID = "socializing/social-field";
/** A default channel carrier (reused communicating shape) for a translation's medium. */
export function defaultChannel() {
    const sphere = (name) => ({
        kind: "communicating.speaking.signifying.semiosphere",
        name,
    });
    return {
        kind: "communicating.messaging.channel",
        medium: "society",
        from: sphere("society"),
        to: sphere("society"),
        capacity: null,
    };
}
/** Construct a translation morphism `source → target` (the generating arrow of `O`). */
export function translation(source, target, channel = defaultChannel(), basis) {
    return Object.freeze({
        kind: "socializing.translation",
        source,
        target,
        channel,
        ...(basis === undefined ? {} : { basis }),
    });
}
/** The identity translation `o → o` — the unit of composition in `O` (implicit; not
 *  stored, since a self-loop carries no perspective shift and sheafCharges forbids it). */
export function identityTranslation(observer) {
    return translation(observer, observer, defaultChannel(), "identity");
}
/**
 * Compose two translations `first : i → j` and `second : j → k` into `second ∘ first :
 * i → k` (the composition law of the observer category). The codomain of `first` must
 * be the domain of `second`. The composite travels `second`'s channel; an identity on
 * either side returns the other arrow (the unit law).
 */
export function composeTranslations(first, second) {
    if (first.target !== second.source) {
        throw new TypeError(`composeTranslations: ${first.source}→${first.target} does not compose with ${second.source}→${second.target}`);
    }
    if (first.source === first.target)
        return second; // identity ∘ — left unit
    if (second.source === second.target)
        return first; // ∘ identity — right unit
    const basis = first.basis !== undefined && second.basis !== undefined
        ? `${first.basis}∘${second.basis}`
        : (second.basis ?? first.basis);
    return translation(first.source, second.target, second.channel, basis);
}
/** The complete bidirectional digraph of translations over `count` observers — the
 *  default (maximally-connected) observer category: every ordered pair `i ≠ j`. */
export function completeTranslations(count) {
    const translations = [];
    for (let source = 0; source < count; source++) {
        for (let target = 0; target < count; target++) {
            if (source !== target)
                translations.push(translation(source, target));
        }
    }
    return Object.freeze(translations);
}
/**
 * The undirected comparison graph FORGOTTEN from `O`'s translations: each non-identity
 * translation contributes the unordered pair `{source, target}`, deduped. This is the
 * `ObserverEdge[]` sheafCharges consumes — the multi-observer disagreement `H¹` is read
 * over it (direction is irrelevant to opposition).
 */
export function comparisonEdges(base) {
    const seen = new Set();
    const edges = [];
    for (const { source, target } of base.translations) {
        if (source === target)
            continue;
        const left = Math.min(source, target);
        const right = Math.max(source, target);
        const key = `${left},${right}`;
        if (seen.has(key))
            continue;
        seen.add(key);
        edges.push([left, right]);
    }
    return edges;
}
/** The observers reachable by a translation OUT of `source` (the targets of `source`'s
 *  outgoing morphisms) — whom `source` can address along the category. */
export function neighborsFrom(base, source) {
    const targets = new Set();
    for (const t of base.translations)
        if (t.source === source && t.target !== source)
            targets.add(t.target);
    return [...targets];
}
/** A translation `source → target` if one is present in `O`, else null (no such arrow). */
export function translationBetween(base, source, target) {
    return base.translations.find((t) => t.source === source && t.target === target) ?? null;
}
/**
 * The replica-cover of an observer `target`: the family of translations INTO it,
 * `{ o_i → target }` (the site's covering family — replica-cover.md). The consensus
 * `converge` writes is the gluing of the local sections over such covers; `H¹` is the
 * obstruction to that gluing.
 */
export function coverOf(base, target) {
    return base.translations.filter((t) => t.target === target && t.source !== target);
}
/** An observer's representative charge: the knowledge-join (∨_k) of its memes' charges
 *  (⊥ = absurd, the knowledge-bottom, if it holds none). The observer's local section
 *  collapsed to one bilattice charge for the network-sheaf consensus reading. */
export function representativeCharge(memes) {
    const charges = memes
        .map((meme) => meme.charge)
        .filter((c) => typeof c === "object" && c !== null);
    if (charges.length === 0)
        return charge(chargeValue("absurd"));
    return charges.slice(1).reduce((left, right) => joinKnowledge(left, right), charges[0]);
}
/** The induced subgraph over the REPLICA-COVER of `target`: the cover members (target +
 *  its covering sources, by original index), their representative charges, and the
 *  comparison edges among them (remapped to local indices) — the Čech nerve the
 *  Mayer–Vietoris gluing reads. `target` is always local index 0. */
export function coverSubgraph(field, target) {
    const sources = coverOf(field.base, target).map((t) => t.source);
    const members = [...new Set([target, ...sources])];
    const local = new Map(members.map((original, index) => [original, index]));
    const charges = members.map((index) => representativeCharge(field.members[index].memes));
    const edges = comparisonEdges(field.base)
        .filter(([left, right]) => local.has(left) && local.has(right))
        .map(([left, right]) => [local.get(left), local.get(right)]);
    return { members, charges, edges };
}
/** The empty/ungrounded common-ground section (before the first converge): the empty
 *  society defaults to the strict regime (a finite, quantifier-free settling). */
export function ungroundedSection() {
    return Object.freeze({
        kind: "socializing.common-ground",
        glued: true,
        obstruction: 0,
        coordinationFree: true,
        components: Object.freeze([]),
        regime: "strict",
        regimeCoordinationFree: true,
        federationDiscipline: "endpoint-state",
    });
}
/** The empty Social Field — no observers, a discrete (empty) observer category. */
export function emptyField() {
    return Object.freeze({
        kind: "socializing.social-field",
        members: Object.freeze([]),
        base: Object.freeze({ kind: "socializing.social-base", translations: Object.freeze([]) }),
        section: ungroundedSection(),
    });
}
/** Whether a value is a Social Field carrier (kind tag). */
export function isField(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value) &&
        value.kind === "socializing.social-field";
}
/**
 * Admit a Social Field from the wire, refusing a non-field at the boundary.
 *
 * Total over fields; the empty field is admitted as the empty field. A non-field
 * value (`undefined`, a meme, anything without the field kind) is refused.
 */
export function admitField(input, verb) {
    if (input === undefined || input === null)
        return emptyField();
    if (isField(input))
        return input;
    throw new TypeError(`${verb}: expected a social-field carrier (socializing.social-field)`);
}
//# sourceMappingURL=field.mjs.map