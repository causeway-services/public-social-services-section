/**
 * proof — playing's logic layer: CLL propositions (the names of behaviours),
 * the fragment lattice membership, focusing (incl. shifts), session types, and
 * the embeddings, all over a Proposition wire codec.
 *
 * "A formula is the name of a behaviour" (Girard 2001): propositions name the
 * bi-orthogonally-closed design-sets of the topology layer. This file exposes the
 * CLL proof reading of playing — `propose`/`dual-prop` (the involutive linear
 * negation), `classify-fragment`/`in-fragment` (the MLL⊂MALL⊂{ILL,CLL}⊂LL poset),
 * `focus` (Andreoli polarity, with the shifts ↑/↓), `formula`/`proves` (the
 * logic↔topology bridge), `session`/`dual-session`/`session-compat` (Caires–
 * Pfenning), and `embed` (the four sub-*-autonomous embeddings into CGS).
 *
 * Proposition wire codec: a proposition is `{ connective, operands, polarity?, label? }`
 * with atom polarity projected to its name; the codec round-trips it through the
 * exported smart constructors so arity and involutivity stay construction-justified.
 */
import { type Action } from "@emsenn/relating";
/** propose — admit/validate a CLL proposition; report its signature, focus, and polarity. */
export declare const proposeAction: Action;
/** dual-prop — the involutive linear negation (-)^⊥ (De Morgan; (↑P)^⊥ = ↓(P^⊥)). */
export declare const dualPropAction: Action;
/** classify-fragment — the least fragment of the lattice admitting a proposition. */
export declare const classifyFragmentAction: Action;
/** in-fragment — whether a proposition lies in a named fragment (and what it forbids if not). */
export declare const inFragmentAction: Action;
/** focus — the Andreoli focusing polarity of a proposition (positive/negative/unfocused). */
export declare const focusAction: Action;
/** formula — name a behaviour by a generator-set; return the behaviour it denotes. */
export declare const formulaAction: Action;
/** proves — whether a design proves a formula (plays in the behaviour the formula names). */
export declare const provesAction: Action;
/** session — the CLL proposition a session type corresponds to (Caires–Pfenning). */
export declare const sessionAction: Action;
/** dual-session — the dual endpoint of a session, mapping to CLL linear negation. */
export declare const dualSessionAction: Action;
/** session-compat — whether two endpoints can communicate (one is the dual of the other). */
export declare const sessionCompatAction: Action;
/** embed — one of the four sub-*-autonomous embeddings into CGS, by name. */
export declare const embedAction: Action;
/** The logic-layer actions — aggregated into the package surface by actions.mts. */
export declare const proofActions: readonly Action[];
//# sourceMappingURL=proof.d.mts.map