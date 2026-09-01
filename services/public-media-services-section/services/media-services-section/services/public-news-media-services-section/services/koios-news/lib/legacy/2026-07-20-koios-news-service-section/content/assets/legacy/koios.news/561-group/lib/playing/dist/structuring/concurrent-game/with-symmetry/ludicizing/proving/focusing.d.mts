/**
 * Polarity and focusing — Andreoli's classification of the CLL connectives.
 *
 * Focused proof search (Andreoli 1992, "Logic programming with focusing proofs in
 * linear logic") splits the connectives into POSITIVE (synchronous: $\otimes$, $1$,
 * $\oplus$, $0$, $!$) and NEGATIVE (asynchronous: $\parr$, $\bot$, $\mathbin{\&}$,
 * $\top$, $?$). In the CGS reading this polarity IS the Player/Opponent polarity
 * of game-algebra: positive connectives are those at which Player must act
 * (commit a move), negative connectives are those at which Opponent acts. We
 * REUSE the game-algebra `Polarity` carrier rather than minting a new enum — the
 * focusing polarity of a connective is a `positive()`/`negative()` of the same
 * apex shadow that polarizes events.
 *
 * The De Morgan duality of `dualProp` and the Andreoli polarity cohere: each
 * connective's dual has the opposite focusing polarity, so
 * `polarityOfConnective(dualConnective c) = dual(polarityOfConnective c)`. This
 * is a free witness, mirroring `dualityIsNegation` in game-algebra's polarity
 * module: the dualizing operation $(-)^\perp$ is the gauge negation of focusing.
 */
import { type Polarity } from "../../index.mjs";
import { type Connective, type Proposition } from "./proposition.mjs";
/**
 * The Andreoli focusing polarity of a connective. Positive (synchronous):
 * tensor, one, plus, zero, ofCourse. Negative (asynchronous): par, bottom, with,
 * top, whyNot. Atoms carry their own polarity, so the connective `"atom"` has no
 * determinate focusing polarity here — see `polarityOf` for the atom case.
 */
export declare function polarityOfConnective(connective: Connective): Polarity | null;
/**
 * The focusing polarity of a proposition: for a connective, its Andreoli
 * polarity; for an atom, the Player/Opponent polarity it carries (the literal's
 * own polarity, exactly the game-algebra atom polarity that `dualProp` flips).
 */
export declare function polarityOf(p: Proposition): Polarity | null;
/**
 * Whether a proposition is focused at its head: its outermost polarity is
 * determinate. A connective head is always focused (its Andreoli polarity is
 * fixed); an atom is focused iff it carries a polarity.
 */
export declare function isFocused(p: Proposition): boolean;
/** Convenience: the proposition's head polarity is positive (synchronous). */
export declare const isPositiveProposition: (p: Proposition) => boolean;
/** Convenience: the proposition's head polarity is negative (asynchronous). */
export declare const isNegativeProposition: (p: Proposition) => boolean;
export interface FocusingDualityWitness {
    readonly kind: "game.logic.focusingDuality:witness";
    readonly connective: Connective;
    readonly dualPolarity: Polarity;
    readonly negatedPolarity: Polarity;
}
export interface FocusingDualityObstruction {
    readonly kind: "game.logic.focusingDuality-obstruction";
    readonly connective: Connective;
    readonly dualPolarity: Polarity;
    readonly negatedPolarity: Polarity;
    readonly reason: string;
}
export type FocusingDualityJudgment = FocusingDualityWitness | FocusingDualityObstruction;
/**
 * Witness that focusing polarity is dualized by $(-)^\perp$ on connectives:
 * `polarityOfConnective(dualConnective c)` equals `dual(polarityOfConnective c)`.
 * The negative connective $\parr$ is the dual of the positive $\otimes$, and so
 * on through the table; atoms (whose polarity is carried, not fixed by the head)
 * yield an obstruction here.
 */
export declare function focusingDuality(connective: Connective): FocusingDualityJudgment;
//# sourceMappingURL=focusing.d.mts.map