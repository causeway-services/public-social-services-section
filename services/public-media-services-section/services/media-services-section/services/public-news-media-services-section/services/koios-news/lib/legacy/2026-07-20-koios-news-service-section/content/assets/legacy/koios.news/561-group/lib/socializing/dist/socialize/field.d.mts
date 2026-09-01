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
import { type ChargeCarrier, type JsonRecord, type JsonValue } from "@emsenn/relating";
import type { ObserverEdge } from "./consensus.mjs";
import type { Regime, FederationDiscipline } from "./regime.mjs";
import type { SocialField, Member, Translation as GeneratedTranslation, CommonGround } from "../carriers.mjs";
/** The carrier `$id` every morphism slot references — socializing is endo on it. */
export declare const SOCIAL_FIELD_ID = "socializing/social-field";
/**
 * The carrier types below are NOT hand-written: their structure is the schema-generated
 * `social-field.schema.types.mts` (the `realize` forgetful functor's output from
 * `social-field.schema.json` — the law). The local names (`Field`, `FieldMember`,
 * `FieldBase`, `Translation`, `FieldSection`, `FieldComponent`) are aliases over those
 * generated types, kept as the package's vocabulary. The only refinement applied here is
 * to the CROSS-PACKAGE `$ref` subfields — `agent`, `memes`-items, `channel`, `pooled`,
 * `common` — which `realize` cannot resolve across packages and emits as `unknown`; we
 * pin them to the reused-carrier runtime shape (`JsonRecord`) socializing actually
 * carries (the reused `agent`/`meme`/`channel` carriers, referenced never redefined).
 */
/** A member — an observer `o ∈ O`: an agent (reused) carrying its local memes (reused).
 *  Sourced from the generated `Member`; the reused `agent`/`meme` subfields refined. */
export type FieldMember = Omit<Member, "agent" | "memes"> & {
    readonly agent: JsonRecord;
    readonly memes: readonly JsonRecord[];
};
/**
 * A translation settling-morphism `α : source → target` in the observer category `O` —
 * the directed perspective map `V(α) : V(source) → V(target)` carrying one observer's
 * view into another's. `channel` (reused from communicating) is the medium; `basis` is
 * the optional warrant for the refinement. Sourced from the generated `Translation`; the
 * reused `channel` subfield refined.
 */
export type Translation = Omit<GeneratedTranslation, "channel"> & {
    readonly channel: JsonRecord;
};
/** The social base — the OBSERVER CATEGORY `O`: members are its objects (by index),
 *  `translations` its generating non-identity morphisms. Sourced from the generated
 *  `SocialField["base"]`, with its translations refined as above. */
export type FieldBase = Omit<SocialField["base"], "translations"> & {
    readonly translations: readonly Translation[];
};
/** A per-component consensus reading, projected from SheafConsensus. Sourced from the
 *  generated `CommonGround["components"]` item; the reused charge subfields refined. */
export type FieldComponent = Omit<CommonGround["components"][number], "pooled" | "common" | "members"> & {
    readonly members: readonly number[];
    readonly pooled: JsonRecord;
    readonly common: JsonRecord;
};
/**
 * The glued common-ground section, on TWO orthogonal axes. Static opinion axis: `glued`
 * / `obstruction` (the opposition-cycle H¹) / `coordinationFree` (= obstruction 0) /
 * `components` (the limit `common` and merge-fixpoint `pooled` per component). Dynamic
 * regime axis: `regime` (the joint max-κ classification), `regimeCoordinationFree` (the
 * cohomological-CALM flag — the merge is coordination-free by regime), and
 * `federationDiscipline` (endpoint-state vs trajectory). Sourced from the generated
 * `CommonGround`; the `regime`/`federationDiscipline` enums are the named `Regime`/
 * `FederationDiscipline` unions verbatim, and `components` carries the refined component.
 */
export type FieldSection = Omit<CommonGround, "components" | "regime" | "federationDiscipline"> & {
    readonly components: readonly FieldComponent[];
    readonly regime: Regime;
    readonly federationDiscipline: FederationDiscipline;
    readonly cohomology?: JsonRecord;
};
/** The Social Field — the multi-observer system socializing is endomorphic on. Sourced
 *  from the generated `SocialField`; members/base/section carry the refined subcarriers. */
export type Field = Omit<SocialField, "members" | "base" | "section"> & {
    readonly members: readonly FieldMember[];
    readonly base: FieldBase;
    readonly section: FieldSection;
};
/** A default channel carrier (reused communicating shape) for a translation's medium. */
export declare function defaultChannel(): JsonRecord;
/** Construct a translation morphism `source → target` (the generating arrow of `O`). */
export declare function translation(source: number, target: number, channel?: JsonRecord, basis?: string): Translation;
/** The identity translation `o → o` — the unit of composition in `O` (implicit; not
 *  stored, since a self-loop carries no perspective shift and sheafCharges forbids it). */
export declare function identityTranslation(observer: number): Translation;
/**
 * Compose two translations `first : i → j` and `second : j → k` into `second ∘ first :
 * i → k` (the composition law of the observer category). The codomain of `first` must
 * be the domain of `second`. The composite travels `second`'s channel; an identity on
 * either side returns the other arrow (the unit law).
 */
export declare function composeTranslations(first: Translation, second: Translation): Translation;
/** The complete bidirectional digraph of translations over `count` observers — the
 *  default (maximally-connected) observer category: every ordered pair `i ≠ j`. */
export declare function completeTranslations(count: number): readonly Translation[];
/**
 * The undirected comparison graph FORGOTTEN from `O`'s translations: each non-identity
 * translation contributes the unordered pair `{source, target}`, deduped. This is the
 * `ObserverEdge[]` sheafCharges consumes — the multi-observer disagreement `H¹` is read
 * over it (direction is irrelevant to opposition).
 */
export declare function comparisonEdges(base: FieldBase): readonly ObserverEdge[];
/** The observers reachable by a translation OUT of `source` (the targets of `source`'s
 *  outgoing morphisms) — whom `source` can address along the category. */
export declare function neighborsFrom(base: FieldBase, source: number): readonly number[];
/** A translation `source → target` if one is present in `O`, else null (no such arrow). */
export declare function translationBetween(base: FieldBase, source: number, target: number): Translation | null;
/**
 * The replica-cover of an observer `target`: the family of translations INTO it,
 * `{ o_i → target }` (the site's covering family — replica-cover.md). The consensus
 * `converge` writes is the gluing of the local sections over such covers; `H¹` is the
 * obstruction to that gluing.
 */
export declare function coverOf(base: FieldBase, target: number): readonly Translation[];
/** An observer's representative charge: the knowledge-join (∨_k) of its memes' charges
 *  (⊥ = absurd, the knowledge-bottom, if it holds none). The observer's local section
 *  collapsed to one bilattice charge for the network-sheaf consensus reading. */
export declare function representativeCharge(memes: readonly JsonRecord[]): ChargeCarrier;
/** The induced subgraph over the REPLICA-COVER of `target`: the cover members (target +
 *  its covering sources, by original index), their representative charges, and the
 *  comparison edges among them (remapped to local indices) — the Čech nerve the
 *  Mayer–Vietoris gluing reads. `target` is always local index 0. */
export declare function coverSubgraph(field: Field, target: number): {
    readonly members: readonly number[];
    readonly charges: readonly ChargeCarrier[];
    readonly edges: readonly ObserverEdge[];
};
/** The empty/ungrounded common-ground section (before the first converge): the empty
 *  society defaults to the strict regime (a finite, quantifier-free settling). */
export declare function ungroundedSection(): FieldSection;
/** The empty Social Field — no observers, a discrete (empty) observer category. */
export declare function emptyField(): Field;
/** Whether a value is a Social Field carrier (kind tag). */
export declare function isField(value: JsonValue): value is Field & JsonRecord;
/**
 * Admit a Social Field from the wire, refusing a non-field at the boundary.
 *
 * Total over fields; the empty field is admitted as the empty field. A non-field
 * value (`undefined`, a meme, anything without the field kind) is refused.
 */
export declare function admitField(input: JsonValue, verb: string): Field;
//# sourceMappingURL=field.d.mts.map