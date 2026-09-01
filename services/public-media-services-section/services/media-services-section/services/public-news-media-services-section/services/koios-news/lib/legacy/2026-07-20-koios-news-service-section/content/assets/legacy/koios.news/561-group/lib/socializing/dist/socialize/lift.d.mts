/**
 * socialize/lift — the reusable scale-1 → scale-2 lift primitive.
 *
 * The agency spiral's central construction (dev/docs/notes/2026-06-21-agency-spiral-self-similar-faculty-quartet.md):
 * a scale-2 faculty IS its scale-1 faculty lifted along the sheaf of agents over the
 * social base. `liftStalkwise` makes that lift a real, reusable function — the
 * primitive `gaming` (playing↑) and `computing` (knowing↑) will reuse — for the
 * WITHIN-AGENT morphisms. Given a communicating endomorphism f : Meme → Meme it
 * returns the Social Field endomorphism f↑ : SocialField → SocialField that applies
 * f at every agent's stalk (the agent's local memes).
 *
 * This is the natural endomorphism lift of a meme-sheaf section transform: apply the
 * SAME local action at each stalk. It commutes with the channel restriction maps
 * (because f is identical at every agent), so it is a genuine morphism of the
 * meme-sheaf. Two consequences make it load-bearing:
 *
 *   1. DIAGONAL EMBEDDING (exact, by construction). On the one-agent field (the
 *      initial object / the diagonal) f↑ runs f on that single agent's memes and
 *      nothing else — so socializing's f↑ restricted to one agent IS communicating's
 *      f, verbatim (not a mirror; the same Action). This is the
 *      `communicating ↪ socializing` inclusion, tested per lifted verb.
 *
 *   2. ONE WAY. The within-agent verbs are not hand-ported; they are this one
 *      primitive applied to communicating's own EXPORTED actions. There is no second
 *      implementation of semiose / negate / illocute / … to drift from communicating.
 *      Delete this primitive and the eleven verbs vanish with it — capability is not
 *      duplicated, so it cannot silently diverge.
 *
 * Only the genuinely CROSS-STALK morphisms — the ones whose communicating form
 * references the dyad / channel / partner (speak, listen, ground) — are NOT stalkwise
 * lifts: at scale 2 they move memes between agents (broadcast), take up what crossed
 * (attend), or glue the whole sheaf (converge), so they are renamed and hand-written.
 * The rule is exact: rename + hand-write iff the lift is cross-stalk; keep the verb
 * name + use this primitive iff the lift is the diagonal stalkwise application.
 */
import { type Action } from "@emsenn/relating";
/**
 * A lifted verb's surface metadata. The verb name is KEPT (not renamed) — by the
 * rename-iff-cross-stalk rule, a stalkwise lift is the diagonal application of the
 * SAME morphism, so `socializing.<verb>` ↾ one agent = `communicating.<verb>`, and
 * keeping the name makes that law legible. The summary/description carry the social
 * reading (the whole-society form).
 */
export interface LiftSpec {
    readonly verb: string;
    readonly summary: string;
    readonly description: string;
}
/**
 * liftStalkwise — the scale-1 → scale-2 lift of a within-agent faculty morphism.
 *
 * Given communicating's endomorphism `memeAction` (Meme → Meme) and the social
 * reading metadata, return the Social Field endomorphism that applies it at every
 * stalk (or the single `member` stalk when `options.member` is supplied). domain =
 * codomain = the field carrier, so the lift is itself endomorphic on SocialField —
 * socializing stays a sub-monoid of End(SocialField), exactly as communicating is a
 * sub-monoid of End(Meme). The lifted action's `options` are `member` plus the
 * underlying morphism's own options, so every argument the scale-1 verb reads is
 * still bindable on the scale-2 surface.
 */
export declare function liftStalkwise(memeAction: Action, spec: LiftSpec): Action;
//# sourceMappingURL=lift.d.mts.map