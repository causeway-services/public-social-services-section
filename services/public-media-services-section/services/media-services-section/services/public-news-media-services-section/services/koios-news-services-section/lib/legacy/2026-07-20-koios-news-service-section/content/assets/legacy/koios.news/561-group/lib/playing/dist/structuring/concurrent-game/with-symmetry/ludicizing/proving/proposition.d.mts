/**
 * Propositions of classical linear logic — the formulas of the CLL fragment of
 * $\mathbf{CGS}$.
 *
 * The corpus pins the connectives of classical linear logic (Girard 1987) as the
 * proof-theoretic name of the $*$-autonomous structure of concurrent games with
 * symmetry: "the typed subtheory lattice is the linear logic fragment lattice"
 * (predication-typed-subtheory-lattice-is-linear-logic-fragment-lattice.md). A
 * proposition is therefore the syntactic name of a behaviour (the bi-orthogonal
 * closure of a design-set), and CLL's connectives are the operations on those
 * behaviours.
 *
 * Linear negation $(-)^\perp$ is NOT a stored connective. It is the structural
 * De Morgan involution `dualProp`, which bottoms out at atoms by reusing
 * `@emsenn/game-algebra` `dual` on the atom's `Polarity`. This realizes the
 * corpus claim that "the duality $(-)^\perp$ is involutive at every object" of
 * $\mathbf{CGS}_{\mathrm{CLL}}$ and that linear negation extends Player/Opponent
 * duality: an atom's dual swaps Proponent and Opponent, exactly the meme-apex
 * gauge negation witnessed by game-algebra `dualityIsNegation`.
 *
 * Units are nullary connectives (empty `operands`). Binary connectives carry two
 * operands, the exponentials carry one. Smart constructors fix arity so the
 * indexed reads in `dualProp`/`connectivesOf` are construction-justified under
 * `noUncheckedIndexedAccess`.
 */
import { type Polarity } from "../../index.mjs";
/**
 * The connective tags of classical linear logic.
 *
 * Multiplicatives: `tensor` (⊗), `par` (⅋), units `one` (1), `bottom` (⊥).
 * Additives: `with` (&), `plus` (⊕), units `top` (⊤), `zero` (0).
 * Exponentials: `ofCourse` (!), `whyNot` (?).
 * Shifts (Andreoli/polarized): `up` (↑, negative/asynchronous delay) and `down`
 * (↓, positive/synchronous delay) — the polarity-change operators that move
 * between focusing phases, with the duality $(\uparrow P)^\perp = \downarrow(P^\perp)$.
 * `atom` is the nullary leaf carrying a game-algebra polarity.
 */
export type Connective = "atom" | "tensor" | "par" | "with" | "plus" | "one" | "bottom" | "top" | "zero" | "ofCourse" | "whyNot" | "up" | "down";
export declare const connectives: () => readonly Connective[];
/**
 * A proposition of CLL: a frozen recursive carrier. `connective` is the head;
 * `operands` are the sub-propositions (empty for units, one for exponentials,
 * two for binary connectives). For `atom`, `polarity` carries the Player/Opponent
 * polarity of the literal and `operands` is empty.
 */
export interface Proposition {
    readonly kind: "game.logic.prop";
    readonly connective: Connective;
    readonly operands: readonly Proposition[];
    readonly polarity?: Polarity;
    readonly label?: string;
}
/** An atomic proposition (literal), carrying a game-algebra polarity and a name. */
export declare function atom(label: string, p: Polarity): Proposition;
/** Multiplicative conjunction $A \otimes B$ — "send $A$, continue $B$". */
export declare const tensor: (left: Proposition, right: Proposition) => Proposition;
/** Multiplicative disjunction $A \parr B$ — De Morgan dual of $\otimes$. */
export declare const par: (left: Proposition, right: Proposition) => Proposition;
/** Additive conjunction $A \mathbin{\&} B$ — Player's choice. */
export declare const withProp: (left: Proposition, right: Proposition) => Proposition;
/** Additive disjunction $A \oplus B$ — Opponent's choice. */
export declare const plus: (left: Proposition, right: Proposition) => Proposition;
/** Multiplicative unit $1$ (unit of $\otimes$). */
export declare const one: () => Proposition;
/** Multiplicative unit $\bot$ (unit of $\parr$). */
export declare const bottom: () => Proposition;
/** Additive unit $\top$ (unit of $\mathbin{\&}$). */
export declare const top: () => Proposition;
/** Additive unit $0$ (unit of $\oplus$). */
export declare const zero: () => Proposition;
/** Exponential $!A$ ("of course") — the replicable-resource / server modality. */
export declare const ofCourse: (operand: Proposition) => Proposition;
/** Exponential $?A$ ("why not") — the client modality, De Morgan dual of $!$. */
export declare const whyNot: (operand: Proposition) => Proposition;
/** Up-shift $\uparrow A$ — the negative (asynchronous) polarity shift / delay; dual of $\downarrow$. */
export declare const up: (operand: Proposition) => Proposition;
/** Down-shift $\downarrow A$ — the positive (synchronous) polarity shift / delay; dual of $\uparrow$. */
export declare const down: (operand: Proposition) => Proposition;
/**
 * Linear implication $A \multimap B$, defined (classically) as $A^\perp \parr B$.
 * Provided as a derived constructor: $\multimap$ is not primitive in CLL.
 */
export declare const lolli: (left: Proposition, right: Proposition) => Proposition;
/** The De Morgan dual of each connective (the head-level table for $(-)^\perp$). */
export declare function dualConnective(connective: Connective): Connective;
/**
 * Linear negation $(-)^\perp$ as the structural De Morgan involution.
 *
 * $(A \otimes B)^\perp = A^\perp \parr B^\perp$, $1^\perp = \bot$,
 * $(A \mathbin{\&} B)^\perp = A^\perp \oplus B^\perp$, $\top^\perp = 0$,
 * $(!A)^\perp = ?(A^\perp)$, and an atom's dual reuses game-algebra `dual` on
 * its polarity (Proponent ⟷ Opponent). `dualProp(dualProp(p))` is structurally
 * `p`, witnessing involutivity at every object.
 */
export declare function dualProp(p: Proposition): Proposition;
/** The set of distinct connectives occurring in a proposition (its signature). */
export declare function connectivesOf(p: Proposition): readonly Connective[];
/** Structural equality of propositions (atoms compare by label and polarity name). */
export declare function samePropositions(left: Proposition, right: Proposition): boolean;
export declare function isConnective(value: unknown): value is Connective;
export declare function isProposition(value: unknown): value is Proposition;
//# sourceMappingURL=proposition.d.mts.map