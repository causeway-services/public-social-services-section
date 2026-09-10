/**
 * cognizing/morphisms/doubt — the dual-comonad descent of knowing on Meme.
 *
 * knowing is the comonad on Meme working the knowledge order ≤_k
 * (dev/docs/notes/2026-06-21-knowing-as-comonad-on-meme.md). Its Priestley DUAL is a
 * closure 2-COMONAD Cl* that, where the primal closure "inflates a value in ≤_k",
 * instead "shrinks the confirming point-set" (dual-predication-hyperdoctrine). `doubt`
 * is that dual move read as cognition: it DESCENDS the knowledge order by one step,
 * dropping the less-settled side's witnesses — the formal opposite of `absorb`
 * (which climbs ≤_k by joining evidence). It is total and faithful — meme in, meme
 * out, the cell preserved IDENTICALLY while the charge descends ≤_k:
 *   stable (both witnessed) → potential (drop the falsity side)
 *   active (falsity only)   → absurd   (drop the falsity side)
 *   potential (truth only)  → absurd   (drop the truth side)
 *   absurd (no claim)       → absurd   (already at the ≤_k bottom)
 */
import { type Action } from "@emsenn/relating";
/** doubt — descend the knowledge order one step (the dual closure 2-comonad Cl*). */
export declare const doubtAction: Action;
//# sourceMappingURL=doubt.d.mts.map