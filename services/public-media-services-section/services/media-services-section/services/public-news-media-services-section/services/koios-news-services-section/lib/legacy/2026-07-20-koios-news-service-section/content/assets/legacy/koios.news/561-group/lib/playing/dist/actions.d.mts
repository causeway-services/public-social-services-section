/**
 * actions — playing's *-autonomous operations as cocone legs on the
 * @emsenn/relating `acting` boundary.
 *
 * playing is the OUTSIDE boundary faculty: the single-agent ludics + *-autonomous
 * duality + the cut. Where communicating is the meme MONOID (meaning, ≤_t) and
 * knowing the meme COMONAD (knowledge, ≤_k), playing is the meme's *-AUTONOMOUS
 * DUALITY and the CUT. Its own carrier is the `Design` (a strategy = a partial
 * charge-valuation over a locus tree of memes); its characteristic morphism is the
 * binary `interact` (the cut: `Design ⊗ Design^⊥ → Interaction`). The polarity
 * involution `dualize` is the self-loop A^⊥ at the design node (Player↔Opponent).
 * See dev/docs/notes/2026-06-21-playing-as-star-autonomous-interaction.md.
 *
 * The CGS/multi-agent/social legs (the concurrent participant, the running
 * multiplayer game, and the social play-anthropology) are gaming's — the scale-2
 * lift of playing along the agent-sheaf — and live in @emsenn/gaming-experimental.
 * See dev/docs/notes/2026-06-21-gaming-as-multi-agent-playing.md.
 *
 * Each operation is registered once as an `action` carrying its wire codecs
 * (`inputFormat`/`outputFormat`) AND its carrier schemas — `domainSchema`/
 * `codomainSchema` `$ref` the carrier `$id`s authored in `src/carriers/index.mts`
 * (bare descent paths under `playing/…`). `induceBins` over this list assembles the
 * discovery apex from which the `play` dispatcher (CLI) and `play-serve`
 * (HTTP/OpenAPI/MCP/web) are projected, and one `dispatch` witnesses every play as
 * EAVT in playing's own ledger.
 *
 * The wire is `json` in, `json` out: data is data. EAVT is the shape of the LOG,
 * not the data boundary. Carrier outputs are projected with playing's own encoders;
 * judgment carriers are projected to flat JSON (kinds, scalars, charge-value names,
 * and rationals via `rat`). No carrier reaches `JSON.stringify`.
 */
import { type Action } from "@emsenn/relating";
/** design — build a ludics Design (the OWN carrier) from a per-locus act labelling.
 *  Domain: { entries: [{ locus, act }] } with act ∈ proponent/opponent/daimon/none
 *  (in bijection with the charge values potential/active/stable/absurd). Codomain:
 *  the encoded Design (`playing/design`). The producer of the carrier playing owns. */
export declare const designAction: Action;
/** dualize — the polarity involution A^⊥ on a Design: the *-autonomous self-loop at the
 *  design node, swapping Player↔Opponent (potential↔active) per locus via the ≤_t
 *  negation. Domain and codomain are both `playing/design` — the endo self-loop where the
 *  two-sidedness of play lives. (Daimon ⊤ and the absent ⊥ region are negation-fixed.) */
export declare const dualizeAction: Action;
/** interact — THE CUT: the interaction normal form of two dual designs. The
 *  characteristic *-autonomous morphism `Design ⊗ Design^⊥ → Interaction`: the
 *  pointwise knowledge-join of two dual valuations, recording per-locus meetings and
 *  the Daimon collisions where the interaction converges (orthogonality). */
export declare const interactAction: Action;
/**
 * The package's actions — the source `induceBins` reads to project every transport.
 * The core surface (the Design grain and the cut) plus the *-autonomous category
 * surface and proof layer (orthogonality, behaviours, the MALL connectives, the
 * exponentials, incarnation, cut-elimination, Fax, the fragment lattice, focusing
 * with shifts, the embeddings) from `star-autonomous.mts`, the logic layer from
 * `proof.mts`, the topology roundout from `topology-extra.mts`, and the categorical
 * composition from `composition-actions.mts`.
 */
export declare const actions: readonly Action[];
//# sourceMappingURL=actions.d.mts.map