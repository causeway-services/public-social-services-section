/**
 * cognizing/know-possibly — { meme, worlds } → knowing/modal-standing: POSSIBILITY (diamond).
 *
 * MODAL knowing lifts the comonad on Meme across a WORLD-SET W: each world is a held
 * knowledge-state (a fiber of the knowledge presheaf indexed by W), and the four-valued
 * bilattice-accessibility-relation defaults to total (S5). The meme's modal standing is
 * bigraded — possibility (diamond) is the ≤_k JOIN of its standing taken across every
 * accessible world, the ≤_k bottom (absurd) vacuously over no worlds; necessity (box) is
 * the dual ≤_k MEET. This morphism is the diamond: the meme is known possibly iff it holds
 * in SOME accessible world. Pure, total, no I/O.
 */
import { type Action } from "@emsenn/relating";
/** know-possibly — diamond: the ≤_k join of the meme standing across accessible worlds. */
export declare const knowPossiblyAction: Action;
//# sourceMappingURL=know-possibly.d.mts.map