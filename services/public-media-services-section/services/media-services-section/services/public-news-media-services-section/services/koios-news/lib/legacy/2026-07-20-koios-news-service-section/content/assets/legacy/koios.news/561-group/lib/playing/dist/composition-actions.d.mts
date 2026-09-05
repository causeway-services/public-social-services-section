/**
 * composition-actions — playing's categorical-composition surface: the REAL
 * ludics cut / Hyland–Ong composition, the copycat **Fax** identity, and the
 * three category laws, exposed as schema-first `action`s over the genuine engine
 * in `ludicizing/composition.mts`.
 *
 * Where `star-autonomous.mts` exposes the *-autonomous topology and `interact`
 * exposes the symmetric-join shadow cut (the orthogonality / normal-form engine),
 * THIS file exposes the categorical composition that hides the cut interface and
 * transports the copycat copy — the structure that makes behaviours a genuine
 * category (objects = behaviours, morphisms = designs `A ⊸ B`, composition =
 * `cut`, identity = `fax`). The identity/associativity laws are run for real.
 *
 * Each verb is a schema-first `action` carrying its wire codecs and its carrier
 * schemas — `domainSchema`/`codomainSchema` `$ref` the carrier `$id`s authored in
 * `src/carriers/index.mts` (bare descent paths under `playing/…`). json in, json out; carrier outputs projected with the
 * package's own encoders.
 */
import { type Action } from "@emsenn/relating";
/** compose — THE CATEGORICAL CUT: the composite design A⊸C of two composable designs
 *  f:A⊸B and g:B⊸C. Runs the dispute on the shared interface B, transports the copycat
 *  copy across it, and HIDES B (unlike `interact`, the symmetric-join shadow that keeps
 *  the union of supports). Partial: the empty design when no play converges (a non-dual B). */
export declare const composeAction: Action;
/** copycat — the categorical UNIT: the copycat identity Fax_B : B ⊸ B over a behaviour B.
 *  The η-expanded coherent design over the doubled interface (codomain copy 1·1·ξ as-is,
 *  domain copy 0·0·ξ polarity-dual). Reports the Fax design and the anti-fake coherence guard. */
export declare const copycatAction: Action;
/** identity-law — the categorical LAWS: the left identity cut(Fax_B, d) ≃ d, the right
 *  identity cut(d, Fax_B) ≃ d, and (when f/g/h are supplied) associativity
 *  cut(cut(f,g),h) ≃ cut(f, cut(g,h)). Run for real over the genuine engine. */
export declare const identityLawAction: Action;
/** The categorical-composition actions — aggregated into the package surface by actions.mts. */
export declare const compositionActions: readonly Action[];
//# sourceMappingURL=composition-actions.d.mts.map