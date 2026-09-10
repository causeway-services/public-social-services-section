/** The settlement-filtration read bins, each a pure invariant of the settled object. */
export declare const settlementReadActions: readonly Action[];
import { type Action } from "./acting/index.mjs";
/** utter — the admission boundary: get two Marks into the system as an utterance.
 *  The only morphism that injects data (a Mark); everything downstream is carrier
 *  → carrier. The pair arrives on the `string` (token\nclaim), `form`
 *  (?token=&claim=), or `json` ({token,claim}) wire. */
export declare const utterAction: Action;
/** articulate — Utterance → ArticulationCell: open the articulation category at
 *  the potential cell of an already-admitted utterance carrier. */
export declare const articulateAction: Action;
/** canonicalize — a JSON carrier to its canonical form: the identity endomorphism
 *  on the JSON wire, witnessing idempotence and representation-independence. */
export declare const canonicalizeAction: Action;
/** coincide — judge whether two Mark payloads coincide as tokens. Domain: a JSON
 *  object `{ left, right }`. Codomain: the coincidence judgment as JSON. */
export declare const coincideAction: Action;
/** realize — the forgetful functor as a boundary morphism: a JSON Schema in,
 *  its TypeScript declaration out. `--name` sets the root type name. */
export declare const realizeAction: Action;
/** predicate — ArticulationCell → PredicationSite: materialize Φ = E × Π × E. */
export declare const predicateAction: Action;
/** posit — PredicationSite → PositPresheaf: value the predication as fibers of
 *  evidence, the presheaf settlement closes over. */
export declare const positAction: Action;
/** settle — PositPresheaf → SettlementFiltration: close the presheaf to its
 *  extrema, the transfinite paraconsistent fixed-point filtration. */
export declare const settleAction: Action;
/** induce-relation — the named full descent settle∘posit∘predicate∘articulate
 *  from an admitted utterance: a Mark pair to the settled relation in one play. */
export declare const induceRelationAction: Action;
/** relate-relations — relate two settled relations: a JSON object `{ left, right }`
 *  of settlement filtrations, uttered against each other and re-induced. */
export declare const relateRelationsAction: Action;
/** The package's actions — the source `induceBins` reads. */
export declare const actions: readonly Action[];
//# sourceMappingURL=actions.d.mts.map