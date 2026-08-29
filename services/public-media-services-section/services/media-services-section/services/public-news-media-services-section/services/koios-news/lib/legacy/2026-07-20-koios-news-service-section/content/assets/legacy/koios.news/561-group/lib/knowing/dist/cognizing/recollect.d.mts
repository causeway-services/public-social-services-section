/**
 * cognizing/recollect — [Meme] → knowing/knowledge-state: MEMORY as the ≤_k fold.
 *
 * knowing is the comonad on Meme (dev/docs/notes/2026-06-21-knowing-as-comonad-on-meme.md);
 * its richer carrier is the comonad context C(Meme) = a held section of memes.
 * `recollect` is the MEMORY faculty: it folds a collection of memes into that section
 * along the knowledge order ≤_k (coincident cells joined by joinKnowledge), the act
 * that turns a stream of held memes into one standing body of knowledge — "the depth
 * is the memory" (content/CLAUDE.md). The fold is confluent (conflicts settle stable,
 * the section glues, H¹=0); the summary reports how much is held, settled, and
 * contested. Total over any collection of memes.
 */
import { type Action } from "@emsenn/relating";
/** recollect — fold a collection of memes into the held knowledge-state section. */
export declare const recollectAction: Action;
//# sourceMappingURL=recollect.d.mts.map