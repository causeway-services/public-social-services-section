/**
 * cognizing/contextuality — SHEAF-THEORETIC CONTEXTUALITY as a knowing morphism, the SIGNED sibling
 * of `bind`.
 *
 * Abramsky–Brandenburger frame contextuality as the non-existence of a GLOBAL SECTION over a cover
 * of measurement contexts — exactly the corpus's settling cohomology (content/…/settling-cohomology.md),
 * the same machinery `bind` uses. The difference is the SIGN: bind glues UNSIGNED features (cycle rank
 * over the feature graph); contextuality glues SIGNED constraints — `a=b` (agree, +) and `a≠b` (disagree,
 * −, which IS the bilattice negation as a sign). A global truth-assignment exists iff the signed
 * constraint graph is BALANCED (every cycle has an even number of − edges); an unbalanced cycle is
 * FRUSTRATION — the Z₂/H¹ obstruction — i.e. CONTEXTUALITY: each context is locally satisfiable, yet no
 * single global assignment satisfies them all. That is the cognitive form of ORDER EFFECTS / cognitive
 * dissonance / the conjunction fallacy (quantum cognition, 2024–2026). Decided here by a union–find with
 * parity (the discrete signed-graph balance / Z₂ cohomology). Total over any constraint set.
 */
import { type Action } from "@emsenn/relating";
import type { Contextuality } from "./carriers.mjs";
/**
 * contextualityOf — decide whether a set of agree/disagree constraints admits a GLOBAL consistent
 * assignment (non-contextual) or is FRUSTRATED (contextual). Union–find with parity: each cell carries
 * a parity relative to its component root; `a=b` requires equal relative parity, `a≠b` opposite. A
 * constraint that contradicts the already-forced relation is FRUSTRATION (an unbalanced cycle — the
 * Z₂/H¹ obstruction). frustration = 0 ⟺ a balanced signed graph ⟺ a global section.
 */
export declare function contextualityOf(constraints: readonly string[]): Contextuality;
/** contextuality — judge a set of agree/disagree constraints for a global section vs frustration. */
export declare const contextualityAction: Action;
//# sourceMappingURL=contextuality.d.mts.map