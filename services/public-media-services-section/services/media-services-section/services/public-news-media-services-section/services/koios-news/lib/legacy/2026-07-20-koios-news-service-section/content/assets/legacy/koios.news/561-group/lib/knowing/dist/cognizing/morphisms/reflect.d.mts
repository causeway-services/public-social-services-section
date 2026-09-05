/**
 * cognizing/morphisms/reflect — the comonad comultiplication (delta) on Meme.
 *
 * knowing is the comonad on Meme working the knowledge order <=_k
 * (dev/docs/notes/2026-06-21-knowing-as-comonad-on-meme.md). reflect is its
 * comultiplication: the CONVERGENT reflexive orbit step — self-reflection,
 * neuroreflexivity, knowing-THAT-you-know. It nests the whole prior meme as the
 * OBJECT of a reflexive cell whose subject is the prior meme's subject (the
 * knower) and whose predicate is REUSED from the prior meme (not freshly
 * constructed). The charge is preserved IDENTICALLY: reflection does NOT
 * re-evaluate the already-settled standing, so the orbit CONVERGES — it stays at
 * its <=_k fixpoint.
 *
 * This is precisely what distinguishes reflect from ruminate. reflect is
 * process-focused and reaches the fixpoint: knowing-that-you-know adds a
 * metalingual layer (the knower now stands over its own knowing) WITHOUT
 * disturbing the settled charge, so iterating reflect is convergent. ruminate, by
 * contrast, re-charges on each pass and never settles — its orbit does not reach a
 * fixpoint. Total over any meme, and faithful: the prior meme is nested losslessly
 * via mark(prior), the predicate is reused, and the charge is carried unchanged.
 */
import { type Action } from "@emsenn/relating";
/** reflect — the comonad comultiplication (delta): the convergent reflexive orbit step. */
export declare const reflectAction: Action;
//# sourceMappingURL=reflect.d.mts.map