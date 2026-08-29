/**
 * cognizing/consolidate — knowing/knowledge-state → knowing/consolidation: does the
 * held section glue into a SHEAF? (the settled memory crystal).
 *
 * knowing is the comonad on Meme (dev/docs/notes/2026-06-21-knowing-as-comonad-on-meme.md);
 * its richer carrier is the comonad context C(Meme) = a held SECTION of memes. CONSOLIDATION
 * asks the sheaf question of that section: a sheaf is the {base, section} fixed point that
 * glues local settlements with H¹=0 (cohomologyVanishes). Because the bilattice fold is
 * confluent, the section always glues structurally; what `consolidate` reports is whether
 * it glues CLEANLY — `consistent` (no cell holds a both-sides-witnessed contradiction) and
 * `settledFraction` (how much of the held section has crystallized stable). Total over any
 * knowledge-state; pure, no I/O. Grounded in positing/fiber.mts sheaf and cohomologyVanishes.
 */
import { type Action } from "@emsenn/relating";
/** consolidate — verdict on whether the held section glues into a settled sheaf. */
export declare const consolidateAction: Action;
//# sourceMappingURL=consolidate.d.mts.map