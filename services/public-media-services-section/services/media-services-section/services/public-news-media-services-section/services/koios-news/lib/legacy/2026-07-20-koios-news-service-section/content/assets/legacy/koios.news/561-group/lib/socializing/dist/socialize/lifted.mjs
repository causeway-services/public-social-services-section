import { communicateAction, semioseAction, illocuteAction, negateAction, conflateAction, referAction, modalizeAction, presupposeAction, quoteAction, composeAction, } from "@emsenn/communicating";
import { liftStalkwise } from "./lift.mjs";
/** communicate↑ — the stalkwise monoid unit: every agent transmits its memes faithfully. */
export const communicateLiftedAction = liftStalkwise(communicateAction, {
    verb: "communicate",
    summary: "communicate↑: the stalkwise monoid unit — every agent transmits each of its memes faithfully (the identity endomorphism of the field's stalkwise sub-monoid).",
    description: "Domain: a social-field carrier. Codomain: a social-field carrier. The diagonal stalkwise lift of communicating's monoid unit (faithful transmission): applies the identity meme endomorphism at every agent's stalk (or the single options.member stalk). Restricted to one agent it IS communicating's communicate.",
});
/** semiose↑ — social interpretant chains (rumor / tradition over the sheaf). */
export const semioseLiftedAction = liftStalkwise(semioseAction, {
    verb: "semiose",
    summary: "semiose↑: social interpretant chains — each agent advances every meme to its interpretant; iterated across broadcast this is rumor / tradition (the loop over the sheaf).",
    description: "Domain: a social-field carrier. Codomain: a social-field carrier. The diagonal stalkwise lift of communicating's semiose (the iteration primitive): produces, at every agent's stalk (or options.member), the interpretant of each meme — the prior meme nested as the new subject, object preserved, charge witnessing the prior. Restricted to one agent it IS communicating's semiose; iterated with broadcast it carries an interpretant across agents (rumor / tradition).",
});
/** illocute↑ — society-wide illocutionary force. */
export const illocuteLiftedAction = liftStalkwise(illocuteAction, {
    verb: "illocute",
    summary: "illocute↑: society-wide illocutionary force — each agent re-roles its memes as acts (the same force-indexed charge move at every stalk).",
    description: "Domain: a social-field carrier. Codomain: a social-field carrier. The diagonal stalkwise lift of communicating's illocute: stamps options.force (one of the five Searlean forces) on each meme at every agent's stalk (or options.member), re-roling it as an act. Restricted to one agent it IS communicating's illocute.",
});
/** negate↑ — social polarity (the bilattice negation involution, sheaf-wide). */
export const negateLiftedAction = liftStalkwise(negateAction, {
    verb: "negate",
    summary: "negate↑: social polarity — swap the truth/falsity sides (and evidence) of every agent's memes (the bilattice negation involution, sheaf-wide).",
    description: "Domain: a social-field carrier. Codomain: a social-field carrier. The diagonal stalkwise lift of communicating's negate (the polarity involution): applies the bilattice negate to each meme's charge at every agent's stalk (or options.member), preserving cells. An involution sheaf-wide (negate↑ ∘ negate↑ = id). Restricted to one agent it IS communicating's negate.",
});
/** conflate↑ — social consistency (the bilattice consistency involution, sheaf-wide). */
export const conflateLiftedAction = liftStalkwise(conflateAction, {
    verb: "conflate",
    summary: "conflate↑: social consistency — the bilattice consistency involution applied to every agent's memes.",
    description: "Domain: a social-field carrier. Codomain: a social-field carrier. The diagonal stalkwise lift of communicating's conflate (the consistency involution): complement-and-swaps each meme's charge sides at every agent's stalk (or options.member), preserving cells and evidence. An involution sheaf-wide (conflate↑ ∘ conflate↑ = id). Restricted to one agent it IS communicating's conflate.",
});
/** refer↑ — shared reference (society-wide deixis / anaphora). */
export const referLiftedAction = liftStalkwise(referAction, {
    verb: "refer",
    summary: "refer↑: shared reference — resolve a subject/object term to an entity across every agent's memes (society-wide deixis / anaphora).",
    description: "Domain: a social-field carrier. Codomain: a social-field carrier. The diagonal stalkwise lift of communicating's refer: re-marks the named position's Token (options.position, default object) to options.entity across each meme at every agent's stalk (or options.member), recording resolvedFrom. Restricted to one agent it IS communicating's refer.",
});
/** modalize↑ — social modalization. */
export const modalizeLiftedAction = liftStalkwise(modalizeAction, {
    verb: "modalize",
    summary: "modalize↑: social modalization — modulate the charge witnesses of every agent's memes for tense/aspect/evidentiality/modality (cell unchanged).",
    description: "Domain: a social-field carrier. Codomain: a social-field carrier. The diagonal stalkwise lift of communicating's modalize: re-witnesses each meme's charge for options.mode (value-preserving — only the witness set grows) at every agent's stalk (or options.member), leaving cells unchanged. Restricted to one agent it IS communicating's modalize.",
});
/** presuppose↑ — common-ground presupposition. */
export const presupposeLiftedAction = liftStalkwise(presupposeAction, {
    verb: "presuppose",
    summary: "presuppose↑: common-ground presupposition — derive, at every agent, the background meme that must already be held (stable, both-witnessed).",
    description: "Domain: a social-field carrier. Codomain: a social-field carrier. The diagonal stalkwise lift of communicating's presuppose: derives, at every agent's stalk (or options.member), the projected presupposition (the prior meme nested as subject, charged stable / both-witnessed by options.trigger) that must already sit in common ground. Restricted to one agent it IS communicating's presuppose.",
});
/** quote↑ — social mention (hearsay / attribution at scale). */
export const quoteLiftedAction = liftStalkwise(quoteAction, {
    verb: "quote",
    summary: "quote↑: social mention — nest each agent's meme as the subject/object of a metalingual meme (hearsay / attribution at scale; charge preserved).",
    description: "Domain: a social-field carrier. Codomain: a social-field carrier. The diagonal stalkwise lift of communicating's quote (the mention operator): nests each meme losslessly into options.position (default subject) of a new metalingual cell at every agent's stalk (or options.member), preserving the charge. Restricted to one agent it IS communicating's quote.",
});
/** compose↑ — stalkwise relay (the monoid multiplication at every stalk). */
export const composeLiftedAction = liftStalkwise(composeAction, {
    verb: "compose",
    summary: "compose↑: stalkwise relay — knowledge-join each agent's memes with a partner meme (the monoid multiplication at every stalk).",
    description: "Domain: a social-field carrier. Codomain: a social-field carrier. The diagonal stalkwise lift of communicating's compose (the monoid multiplication / data-relay): nests options.with as the object of each meme and knowledge-joins the charges at every agent's stalk (or options.member). Restricted to one agent it IS communicating's compose; multi-hop network transmission is its composite with broadcast.",
});
/** The within-agent communicating morphisms, lifted stalkwise — socializing's
 *  morphism parity with communicating, all eleven through the one lift primitive. */
export const liftedActions = Object.freeze([
    communicateLiftedAction,
    semioseLiftedAction,
    illocuteLiftedAction,
    negateLiftedAction,
    conflateLiftedAction,
    referLiftedAction,
    modalizeLiftedAction,
    presupposeLiftedAction,
    quoteLiftedAction,
    composeLiftedAction,
]);
//# sourceMappingURL=lifted.mjs.map