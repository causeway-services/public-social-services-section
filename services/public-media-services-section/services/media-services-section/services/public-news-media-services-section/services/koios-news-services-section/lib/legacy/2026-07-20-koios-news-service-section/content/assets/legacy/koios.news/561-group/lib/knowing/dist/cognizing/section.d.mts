/**
 * cognizing/section — the C(Meme) knowledge-state grain: helpers over a held section.
 *
 * knowing is the comonad on Meme (dev/docs/notes/2026-06-21-knowing-as-comonad-on-meme.md).
 * Its richer carrier is the comonad CONTEXT C(Meme) = a held SECTION of memes (the
 * knower's whole standing body of knowledge — "the depth is the memory"). These
 * helpers fold a collection of memes into that section by the knowledge order ≤_k
 * (coincident cells joined by `joinKnowledge`, exactly relating's `composeFibers`
 * over a manual base), summarize it into knowing's own `knowing/knowledge-state`
 * carrier, and read the section back out. The fold is confluent: in FOUR, conflicts
 * accumulate as the ≤_k top (stable) rather than trivializing (settling-monotonicity),
 * so the section always glues (sheaf cohomologyVanishes, H¹=0) — `contested` exposes
 * how many cells hold a both-sides-witnessed contradiction settled stable.
 */
import { type JsonValue, type Meme } from "@emsenn/relating";
import type { KnowledgeState } from "./carriers.mjs";
/** The FOUR knowledge-order standing named by a meme's charge sides. */
export declare function standingOf(m: Meme): "absurd" | "active" | "potential" | "stable";
/** Fold memes into a section: coincident cells joined by ≤_k (joinKnowledge). */
export declare function foldSection(memes: readonly Meme[]): Meme[];
/** Admit a collection of memes from the wire: an array, or `{ memes: [...] }`. */
export declare function admitMemes(input: JsonValue, verb: string): Meme[];
/** The held memes of a knowledge-state, read back as relating memes. */
export declare const heldMemesOf: (state: KnowledgeState) => readonly Meme[];
/** Admit a knowledge-state from the wire, refusing a non-state at the boundary. */
export declare function admitState(input: JsonValue, verb: string): KnowledgeState;
/**
 * The canonical structural fingerprint of a held section: the sorted multiset of
 * (predicate-label, ≤_k-standing) over its cells. Two sections are mutually locally
 * derivable iff their fingerprints agree (the H¹-class match, here made concrete).
 */
export declare function sectionSignature(state: KnowledgeState): string;
/** Summarize a folded section into knowing's own knowledge-state carrier. */
export declare function summarizeState(base: string, folded: readonly Meme[]): KnowledgeState;
/** Build a knowledge-state directly from a collection of memes (fold + summarize). */
export declare const stateFromMemes: (base: string, memes: readonly Meme[]) => KnowledgeState;
/** A FOUR knowledge-order standing. */
export type Standing = "absurd" | "active" | "potential" | "stable";
/** The knowledge-order join ∨_k on FOUR (bottom = absurd). */
export declare const joinK: (a: Standing, b: Standing) => Standing;
/** The knowledge-order meet ∧_k on FOUR (top = stable). */
export declare const meetK: (a: Standing, b: Standing) => Standing;
/** The standing of a meme's cell within a held section: absurd (≤_k bottom) when absent. */
export declare function lookupStanding(state: KnowledgeState, m: Meme): Standing;
//# sourceMappingURL=section.d.mts.map