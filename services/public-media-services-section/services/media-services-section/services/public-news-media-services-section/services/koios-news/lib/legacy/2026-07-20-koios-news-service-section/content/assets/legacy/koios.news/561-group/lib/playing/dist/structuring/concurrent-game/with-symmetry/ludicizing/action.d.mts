/**
 * Actions — Girard 2001 §4 atoms of designs, realized over the meme charge.
 *
 * The action note (corpus, ludics/action, "Definition (Girard 2001 §4.1)")
 * makes the action vocabulary three-fold and exhaustive.  An **action** is one
 * of:
 *
 *   - a **positive action** $(+, \xi, I)$ at a positive locus $\xi$ opening the
 *     finite ramification $I \subseteq_\mathrm{fin} \mathbb{N}$ (which children
 *     loci $\xi \cdot i$ are opened),
 *   - a **negative action** $(-, \xi, I)$ at a negative locus, dually,
 *   - the **Daimon** $\dagger$ — the positive-polarity terminator (give up).
 *
 * The action-to-Belnap-class correspondence (action note, "Theorem: actions are
 * in bijection with three of the four Belnap classes") is bijective on the four
 * bilattice points $\{t, f, \top, \bot\}$, where $\bot$ is "no action at this
 * locus."  This is exactly the existing `DesignAct` charge mapping of
 * `design.mjs` — we do NOT re-hardcode the bilattice; we route through
 * `actCharge`/`designAct`, so action↔charge IS the design's act↔charge.
 *
 *   - positive ↦ `proponent` ↦ `potential` = $t = (1,0)$
 *   - negative ↦ `opponent`  ↦ `active`    = $f = (0,1)$
 *   - daimon   ↦ `daimon`    ↦ `stable`    = $\top = (1,1)$ (designated)
 *   - absent   ↦ `none`      ↦ `absurd`    = $\bot = (0,0)$ (the default)
 *
 * The sub-action order (action note, "Definition. The sub-action order $\le$")
 * is, at one locus and polarity, the lattice of finite subsets of $\mathbb{N}$
 * under $\subseteq$; the Daimon is the unique maximum among positive actions at
 * any positive locus.  There are no comparabilities across distinct loci or
 * polarities.
 */
import { type ChargeValue } from "@emsenn/relating";
import { type Polarity } from "../../../polarity.mjs";
import { type Locus } from "./locus.mjs";
import { type DesignAct } from "./design.mjs";
/** The three concrete action varieties (the non-$\bot$ Belnap classes). */
export type ActionVariety = "positive" | "negative" | "daimon";
/**
 * An action — one commitment at one locus.  The bare Daimon $\dagger$ "has no
 * locus" in Girard's notation; following `design.mjs`'s `daimon(xi = root())`
 * we give every action a concrete locus (Daimon defaults to the design base
 * `root()`), an empty ramification, and positive polarity — so the sub-action
 * order is well-defined and `exactOptionalPropertyTypes` stays happy.
 */
export interface Action {
    readonly kind: "game.action";
    readonly variety: ActionVariety;
    readonly locus: Locus;
    /** Finite ramification $I$ — the opened children indices, sorted & deduped. */
    readonly ramification: readonly number[];
}
/** A positive action $(+, \xi, I)$ — Proponent commits "told true" at $\xi$. */
export declare const positiveAction: (xi: Locus, ramification?: readonly number[]) => Action;
/** A negative action $(-, \xi, I)$ — Opponent commits "told false" at $\xi$. */
export declare const negativeAction: (xi: Locus, ramification?: readonly number[]) => Action;
/** The Daimon $\dagger_\xi$ — give up at $\xi$ (defaults to the base `root()`). */
export declare const daimonAction: (xi?: Locus) => Action;
/** The locus at which an action plays. */
export declare const actionLocus: (a: Action) => Locus;
/** The finite ramification $I$ of an action ($\emptyset$ for the Daimon). */
export declare const actionRamification: (a: Action) => readonly number[];
/** The children loci $\xi \cdot i$ opened by the action's ramification. */
export declare const actionChildren: (a: Action) => readonly Locus[];
/** The polarity of an action — $+$ for positive & Daimon, $-$ for negative. */
export declare function actionPolarity(a: Action): Polarity;
/** The `DesignAct` an action commits — the bridge to the existing design layer. */
export declare const actionAct: (a: Action) => DesignAct;
/**
 * The Belnap charge an action commits, REUSING the design layer's `actCharge`.
 * positive↦`potential`=t, negative↦`active`=f, daimon↦`stable`=⊤.  Absent
 * actions ($\bot$=`absurd`) have no `Action` representative — see `chargeAction`.
 */
export declare const actionCharge: (a: Action) => ChargeValue;
/**
 * The action *variety* committed by a charge value (the bijection at the level
 * of TYPES — the action note stresses it forgets locus and ramification, so we
 * return a variety, not a full `Action`).  `absurd` ($\bot$ = no action) maps
 * to `null`.  Mirrors `designAct` of `design.mjs`.
 */
export declare function chargeAction(value: ChargeValue): ActionVariety | null;
export declare const sameAction: (left: Action, right: Action) => boolean;
export declare function isAction(value: unknown): value is Action;
/**
 * Sub-action order $a \le a'$ (action note, "Definition. The sub-action order").
 * Holds iff:
 *   - same locus & same polarity with $I \subseteq I'$, or
 *   - $a$ is a positive-locus action and $a'$ is the Daimon at the same locus
 *     ($\dagger$ is the maximum among positive actions at any positive locus).
 * No comparabilities across distinct loci or distinct polarities.
 */
export declare function subAction(a: Action, b: Action): boolean;
export interface SubActionWitness {
    readonly kind: "game.action.subAction:witness";
    readonly lesser: Action;
    readonly greater: Action;
}
export interface SubActionObstruction {
    readonly kind: "game.action.subAction-obstruction";
    readonly lesser: Action;
    readonly greater: Action;
    readonly reason: string;
}
export type SubActionJudgment = SubActionWitness | SubActionObstruction;
/** Witness/obstruction for "$a \le a'$" in the sub-action order. */
export declare function subActionJudgment(a: Action, b: Action): SubActionJudgment;
/** The sub-action join $a \vee a'$ at a shared positive/negative locus — union of ramifications. `null` when incomparable-by-locus/polarity (the Daimon-extended join is `daimonAction` when either is †). */
export declare function subActionJoin(a: Action, b: Action): Action | null;
/** The parity polarity of a locus: $+$ at even depth (incl. root), $-$ at odd. */
export declare function parityPolarity(xi: Locus): Polarity;
export interface ParityRespectWitness {
    readonly kind: "game.action.parityRespect:witness";
    readonly action: Action;
    readonly parityPolarity: Polarity;
}
export interface ParityRespectObstruction {
    readonly kind: "game.action.parityRespect-obstruction";
    readonly action: Action;
    readonly parityPolarity: Polarity;
    readonly reason: string;
}
export type ParityRespectJudgment = ParityRespectWitness | ParityRespectObstruction;
/**
 * Witness/obstruction for "the action's polarity respects its locus parity"
 * (action note, §"Polarity and the Belnap evidence pair": $\pi(\xi)$ by
 * $|\xi|$ parity, $\pi(\varepsilon) = +$).  The Daimon is positive-only and so
 * respects parity exactly at even-depth (positive) loci.
 */
export declare function parityRespectJudgment(a: Action): ParityRespectJudgment;
//# sourceMappingURL=action.d.mts.map