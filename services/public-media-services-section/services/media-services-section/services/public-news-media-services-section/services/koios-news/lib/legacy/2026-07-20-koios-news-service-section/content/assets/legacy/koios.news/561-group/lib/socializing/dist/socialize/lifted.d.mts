/**
 * socialize/lifted — the within-agent communicating morphisms, lifted stalkwise to
 * the Social Field by the one reusable primitive (`liftStalkwise`).
 *
 * These ten verbs are the within-agent (diagonal) part of socializing's morphism
 * parity with communicating. Every one is communicating's OWN exported action applied
 * at each agent's stalk — there is no second implementation here, only the lift (the
 * prompt's task (2): factor the lift as a reusable primitive rather than hand-port
 * each). The genuinely OFF-DIAGONAL morphisms are NOT here: speak→broadcast,
 * listen→attend, ground→converge (cross-stalk transmission / gluing), translate→V(α)
 * (inter-observer perspective map), and merge (the scale-2-native CRDT ∨_k) are
 * hand-written in their own modules, as is `admit` (grow the observer category).
 *
 * These are the DIAGONAL (per-observer) part of socializing, subordinate to the
 * off-diagonal social structure (translate = V(α), merge = ∨_k, converge). `translate`
 * is NOT among them: its social form is genuinely inter-observer, so it lives in
 * ./translate.mts as an off-diagonal morphism (the stalkwise translate↑ was removed,
 * port-then-delete — communicating's translate survives as the codec it reuses).
 *
 * The parity, scale-1 verb ↦ scale-2 reading (verb name kept; the lift is the
 * diagonal stalkwise application):
 *
 *   communicate  the stalkwise monoid unit — every agent transmits its memes faithfully
 *   semiose      social interpretant chains — each agent advances its memes to their
 *                interpretant; iterated with broadcast this is rumor / tradition
 *   illocute     society-wide illocutionary force — each agent re-roles its memes as acts
 *   negate       social polarity — the bilattice negation involution at every stalk
 *   conflate     social consistency — the bilattice consistency involution at every stalk
 *   refer        shared reference — society-wide deixis/anaphora resolution of a term
 *   modalize     social modalization — modulate every agent's charge witnesses
 *                (tense/aspect/evidentiality/modality), cell unchanged
 *   presuppose   common-ground presupposition — derive, at every agent, the background
 *                meme that must already be held (stable, both-witnessed)
 *   quote        social mention — nest each agent's meme as a metalingual meme
 *                (hearsay / attribution at scale; charge preserved)
 *   compose      stalkwise relay — knowledge-join each agent's memes with a partner
 *                meme; multi-hop network transmission is its composite with broadcast
 */
import type { Action } from "@emsenn/relating";
/** communicate↑ — the stalkwise monoid unit: every agent transmits its memes faithfully. */
export declare const communicateLiftedAction: Action;
/** semiose↑ — social interpretant chains (rumor / tradition over the sheaf). */
export declare const semioseLiftedAction: Action;
/** illocute↑ — society-wide illocutionary force. */
export declare const illocuteLiftedAction: Action;
/** negate↑ — social polarity (the bilattice negation involution, sheaf-wide). */
export declare const negateLiftedAction: Action;
/** conflate↑ — social consistency (the bilattice consistency involution, sheaf-wide). */
export declare const conflateLiftedAction: Action;
/** refer↑ — shared reference (society-wide deixis / anaphora). */
export declare const referLiftedAction: Action;
/** modalize↑ — social modalization. */
export declare const modalizeLiftedAction: Action;
/** presuppose↑ — common-ground presupposition. */
export declare const presupposeLiftedAction: Action;
/** quote↑ — social mention (hearsay / attribution at scale). */
export declare const quoteLiftedAction: Action;
/** compose↑ — stalkwise relay (the monoid multiplication at every stalk). */
export declare const composeLiftedAction: Action;
/** The within-agent communicating morphisms, lifted stalkwise — socializing's
 *  morphism parity with communicating, all eleven through the one lift primitive. */
export declare const liftedActions: readonly Action[];
//# sourceMappingURL=lifted.d.mts.map