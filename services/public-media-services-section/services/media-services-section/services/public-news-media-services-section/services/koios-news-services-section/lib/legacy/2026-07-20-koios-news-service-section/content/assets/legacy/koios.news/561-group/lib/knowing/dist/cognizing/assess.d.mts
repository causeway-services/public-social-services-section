/**
 * cognizing/assess — Meme → knowing/knowledge-standing: the comonad counit as a reading.
 *
 * knowing is the comonad on Meme working the knowledge order ≤_k
 * (dev/docs/notes/2026-06-21-knowing-as-comonad-on-meme.md). `cognize` extracts the
 * standing as a meme (Meme → Meme, the endo unit); `assess` extracts the SAME ≤_k
 * standing as knowing's OWN carrier, `knowing/knowledge-standing` — a knowing-owned
 * reading whose identity is its bare-descent-path `$id` and whose type is inferred
 * from `knowledgeStandingSchema` by `FromSchema` (the schema literal, not a
 * hand-written interface or generated file, is the law). The base carrier (the meme)
 * is reused from relating-experimental; this reading is knowing's own.
 *
 * The standing is read off the charge's two sides on the knowledge order:
 *   truth present / falsity present → stable    (≤_k top — the settled fixpoint)
 *   truth present / falsity absent  → potential
 *   truth absent  / falsity present → active
 *   truth absent  / falsity absent  → absurd    (≤_k bottom)
 * `settled` is standing === "stable" (the reached fixpoint — a converged reflection,
 * never a rumination); `reflexive` is whether a Token nests another meme.
 */
import { type Action } from "@emsenn/relating";
/** assess — read a meme's ≤_k standing into knowing's own knowledge-standing carrier. */
export declare const assessAction: Action;
//# sourceMappingURL=assess.d.mts.map