/**
 * cognizing/infer — knowing/knowledge-state → knowing/knowledge-state: the
 * CLOSURE 2-MONAD as cognition (deductive closure / the inference engine).
 *
 * knowing is the comonad on Meme (dev/docs/notes/2026-06-21-knowing-as-comonad-on-meme.md);
 * its richer carrier is the comonad context C(Meme) = a held section of memes.
 * `infer` is the closure 2-monad Cl acting on that section. Cl is Kock–Zöberlein
 * (lax-idempotent): its unit is INFLATIONARY (v ≤_k cl(v)) and it is IDEMPOTENT
 * (closing twice = closing once). We realize it as the ≤_k re-fold of the held
 * section: on an unfolded section this genuinely closes — coincident-cell evidence
 * is joined UP the knowledge order (joinKnowledge, the inflationary unit) — and on an
 * already-folded section the re-fold is the identity, so `infer` is provably
 * idempotent. This is the closure-2-monad unit, the plug-point for deeper closure
 * rules (richer derivability than coincident-cell join). Pure, total, no I/O.
 */
import { type Action } from "@emsenn/relating";
/** infer — the inflationary idempotent closure: re-fold the held section. */
export declare const inferAction: Action;
//# sourceMappingURL=infer.d.mts.map