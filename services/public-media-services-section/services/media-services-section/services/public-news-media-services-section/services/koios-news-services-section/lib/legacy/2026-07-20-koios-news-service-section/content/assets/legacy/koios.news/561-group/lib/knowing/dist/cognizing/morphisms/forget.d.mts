/**
 * cognizing/morphisms/forget — the ≤_k-annihilation of knowing on Meme.
 *
 * knowing is the comonad on Meme working the knowledge order ≤_k
 * (dev/docs/notes/2026-06-21-knowing-as-comonad-on-meme.md). `forget` is the limit of
 * the dual-comonad descent (`doubt`): it returns the meme to the ≤_k BOTTOM (absurd —
 * no claim, no witnesses), preserving the cell. It is the annihilator of held
 * knowledge — the move that lets memory stay finite by releasing a held standing back
 * to the unknown — total and faithful (meme in, meme out, cell identical, charge reset
 * to the knowledge-least value). It is idempotent and is the ≤_k-bottom fixpoint of
 * repeated `doubt`.
 */
import { type Action } from "@emsenn/relating";
/** forget — reset the meme's charge to the ≤_k bottom (absurd), cell preserved. */
export declare const forgetAction: Action;
//# sourceMappingURL=forget.d.mts.map