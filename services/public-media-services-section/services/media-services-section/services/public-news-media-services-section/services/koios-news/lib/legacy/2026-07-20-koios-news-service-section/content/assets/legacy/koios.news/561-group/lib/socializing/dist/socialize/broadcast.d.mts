/**
 * socialize/broadcast — speak↑: an agent fuses a meme into the field.
 *
 * broadcast is endomorphic on the Social Field (field → field) — the social lift of
 * communicating's `speak` across the messaging Channel. The `from` member emits a
 * meme; it is re-roled as in-transit on the channel(s) leaving `from` (charge
 * `potential`, witnessed by the sender), capacity is enforced via communicating's
 * `withinCapacity`, and the in-transit meme is appended to the target member(s)'
 * `memes`. Targets default to every observer `from` has an outgoing translation to in
 * the observer category `O`; an explicit `to` index narrows to one. The section is
 * invalidated (left as-is until `converge` recomputes it).
 *
 * Reuses communicating's `withinCapacity` (the channel resource law) and relating's
 * `meme`/`charge`/`chargeValue`/`mark`/`witnessedPotential` — the same charge
 * transition `speakAction` performs, applied across the social base into the field.
 */
import { type Action } from "@emsenn/relating";
/** broadcast — fuse a meme from `from` across the channel(s) into the target(s). */
export declare const broadcastAction: Action;
//# sourceMappingURL=broadcast.d.mts.map