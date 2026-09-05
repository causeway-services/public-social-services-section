/**
 * cognizing/attract — [Meme] → knowing/attractor: MEMORY RECALL as ATTRACTOR DYNAMICS.
 *
 * The corpus reads the settling endofunctor as a dynamical system (settling-endofunctor-
 * as-dynamical-system.md). Its standard closure (the closure 2-monad) is monotone,
 * inflationary, and idempotent, so by the no-non-trivial-periodic-orbit theorem
 * (closure-monad-no-non-trivial-periodic-orbits.md) its orbit NEVER cycles — every cue
 * converges to a FIXED-POINT ATTRACTOR. That is exactly the dense-associative-memory /
 * attractor-network account of retrieval (Hopfield): a partial cue settles to the stored
 * pattern it lies in the basin of, and the only open question is the REGIME (does it
 * settle at a bounded ordinal or climb aperiodically forever) and whether the attractor is
 * SPURIOUS (a held contradiction ⊤). `attract` reads a cue (a collection of memes) as that
 * recall: it folds it to its ≤_k closure (the attractor) and reports the recall outcome.
 * The convergence GUARANTEE is the theorem, not a hope — recall cannot oscillate. Total
 * over any collection of memes.
 */
import { type Action, type Meme } from "@emsenn/relating";
import type { Attractor } from "./carriers.mjs";
/** Read a cue's recall as its attractor: the ≤_k fixed point it settles to, with the
 *  dynamical-systems verdict (regime / termination / spuriousness). The orbit is cycle-free
 *  by the no-non-trivial-periodic-orbit theorem, so this always names a genuine attractor. */
export declare function attractorOf(cue: readonly Meme[]): Attractor;
/** attract — settle a cue (a collection of memes) to its memory attractor. */
export declare const attractAction: Action;
//# sourceMappingURL=attract.d.mts.map