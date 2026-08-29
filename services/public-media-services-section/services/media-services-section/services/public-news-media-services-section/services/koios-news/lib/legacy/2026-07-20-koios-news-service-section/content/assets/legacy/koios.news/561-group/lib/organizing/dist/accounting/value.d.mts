/**
 * organizing/accounting/value — value = the accounting value-form settling over
 * a value category `V`.
 *
 * Stage 3 of the trading descent (authority note §4 stage 3, the KEYSTONE of §2):
 * **value is a settling fixed point over a chosen value category `V`; money is the
 * settled general equivalent; the rival economic schools are not rival truths but
 * rival choices of `V`, which share the settling dynamics and the four-regime
 * classification because that classification is `V`-independent.**
 *
 * Every serious theory of price is a fixed-point theory (note §2):
 *
 *   | school                     | `V`                          | fixed-point form                         |
 *   |----------------------------|------------------------------|------------------------------------------|
 *   | labor-value (Marx/Ricardo) | socially-necessary labour    | value-form → general equivalent          |
 *   | marginal-utility (Jevons)  | subjective marginal utility  | Walras excess-demand `Z(p*)=0`           |
 *   | prices-of-production       | Sraffa I–O / Perron–Frobenius| dominant eigenvector                     |
 *   | risk-neutral (FTAP)        | equivalent martingale measure| stationary = closure fixpoint            |
 *   | subjective-preference      | preference order             | utility optimum                          |
 *
 * These are FOUR (here five) {@link ValueCategory} instances run over the **same**
 * settling dynamics. The hub theorem `fourRegimeValueIndependent` says the
 * strict/Scott/transfinite/aperiodic stratification is decided by the closure
 * ordinal `κ` (the {@link ClosureRegimeData}) **alone**, never by `V`. Therefore:
 *
 *   * {@link settleValue} is the Walras / Marx value-form / Sraffa / FTAP common
 *     fixed-point form: `optimum = settleOverValue`, fixed-point via `settleFixedPoint`,
 *     reachability via `optimumReachable` (an improving move never retracts).
 *   * {@link generalEquivalent} is the `V = FOUR` value-form (Capital I.1): settle the
 *     charge join-closure `chargeJoinVClosure(stable)` from `⊥ₖ`; the settled universal
 *     is **money** (the general equivalent — the commodity whose body becomes the
 *     direct incarnation of value for all others).
 *   * {@link transform} is the **transformation problem dissolved**: mapping labour
 *     values to prices of production with a uniform profit rate is a **base-change
 *     between two `V`'s**, not a refutation of one school by another. The proof is
 *     `fourRegimeValueIndependent`: both `V`'s land in the *same* regime over the
 *     same `κ`-data. A century of acrimony is a change-of-base (note §2).
 *   * {@link noArbitrageInRegime} = `cohomologyVanishesInRegime`: no-arbitrage = H¹ = 0
 *     = confluence = unique price, true exactly in the strict and Scott regimes (FTAP
 *     read structurally; note §4 stage 5).
 *
 * No free data (CLAUDE.md anti-fetishism): a value is never primitive; it is the
 * image of a settling over a relational `V`. Every carrier is a frozen `kind`-tagged
 * record; the `value`/`transform`/`classify-value-regime` verbs are relating actions
 * gating their returns through `jsonResource`. This module owns NO settling
 * mathematics of its own — it composes `@emsenn/relating`'s value-category hub
 * (`settling/value-category.mts`, `settling/optimization.mts`).
 */
import { type ChargeValue, type ValueCategory, type VClosure, type ClosureRegime, type ClosureRegimeData, type Action } from "@emsenn/relating";
import { type Commodity } from "./commodity.mjs";
/** The economic **school** = the choice of value category `V`. `labor-value`
 * (Marx/Ricardo, socially-necessary labour), `marginal-utility` (Jevons/Menger/
 * Walras, subjective marginal utility), `prices-of-production` (Sraffa, Perron–
 * Frobenius I–O), `risk-neutral` (FTAP, equivalent martingale measure), `subjective`
 * (preference order). They share the settling dynamics; only `V` differs. */
export type School = "labor-value" | "marginal-utility" | "prices-of-production" | "risk-neutral" | "subjective";
/** The five schools, in enumeration order. */
export declare const SCHOOLS: readonly School[];
/** A **value form**: a school's chosen value category `V` paired with the
 * improvement closure `improve` whose fixed point is the settled value (the optimum).
 * The Marxian *value-form* (Capital I.1) generalized over an arbitrary `V`: the form
 * of value is the settling that climbs `V` to the general equivalent. */
export interface ValueForm<T> {
    readonly kind: "organizing.accounting.value.form";
    /** The school this value form formalizes (the choice of `V`). */
    readonly school: School;
    /** The value category `V` settling runs over (the measure-and-constraint). */
    readonly V: ValueCategory<T>;
    /** The improvement closure (monotone, inflationary, idempotent); its fixed point
     * is the settled value. */
    readonly improve: VClosure<T>;
}
/** Construct a value form for a school from its value category and improvement
 * closure. Frozen carrier; the school records which `V` was chosen (note §2). */
export declare function valueForm<T>(school: School, V: ValueCategory<T>, improve: VClosure<T>): ValueForm<T>;
/** A **valued** carrier: the settled value of a value form from a seed, with its
 * fixed-point and reachability judgments and (optionally) the regime its convergence
 * lands in. The settled price/value — the section of the value-form settling. */
export interface Valued<T> {
    readonly kind: "organizing.accounting.value.valued";
    /** The settled value: `optimum = settleOverValue(improve, seed)`. */
    readonly settled: T;
    /** Whether the settled value is a fixed point (`improve(settled) = settled`). */
    readonly fixedPoint: boolean;
    /** Whether the optimum is reachable from the seed (`seed ≤_V optimum` — inflation). */
    readonly reachable: boolean;
    /** The convergence regime, when known from `κ`-data (set via {@link valueRegime}). */
    readonly regime?: ClosureRegime;
}
/** **Settle a value form to its fixed point from a seed.** The common price-form of
 * Walras (excess-demand `Z(p*)=0`), the Marx value-form (climb to the general
 * equivalent), Sraffa (dominant eigenvector), and FTAP (martingale = stationary =
 * closure fixpoint): the optimum is `settleOverValue` (= the hub `optimum`); the
 * fixed-point judgment is `settleFixedPoint`; reachability is `optimumReachable`.
 * The regime is left undefined here — it depends on the closure ordinal `κ`'s data,
 * supplied through {@link valueRegime} / {@link transform}, and is `V`-independent. */
export declare function settleValue<T>(form: ValueForm<T>, seed: T): Valued<T>;
/** **The general equivalent (money) of a commodity.** The `V = FOUR` value-form: take
 * the commodity's exchange-value charge as the join target and settle
 * `chargeJoinVClosure(exchangeValue)` from the knowledge-bottom `⊥ₖ` over
 * {@link chargeValueCategory}. The settled charge is the **general equivalent** — the
 * universal incarnation of value (money), recovered as the settled spine charge (the
 * `V = FOUR` case of settling-over-`V`). Marx, Capital I.1: the money-form is the
 * general equivalent crystallized; here it is the fixed point of the value-form's
 * climb. */
export declare function generalEquivalent(commodity: Commodity): ChargeValue;
/** **The transformation problem as a base-change.** Given two value forms (e.g.
 * `labor-value` `from` and `prices-of-production` `to`) and the shared closure
 * ordinal data `d`, witness that both schools settle into the **same** regime over
 * `d` via `fourRegimeValueIndependent`. `sharedRegime` is `true` when the two `V`'s
 * agree (always, by `V`-independence) — that agreement *is* the transformation
 * problem dissolved: a functor between fibers (the hyperdoctrine reindexing), not a
 * refutation of one school by another (note §2). The returned `regime` is the shared
 * convergence regime. */
export declare function transform<A, B>(from: ValueForm<A>, to: ValueForm<B>, d: ClosureRegimeData): {
    readonly sharedRegime: boolean;
    readonly regime: ClosureRegime;
};
/** **The convergence regime of a value settling**, decided by the closure ordinal
 * data `d` alone (`classifyRegime`). `V`-independent: strict (finite `κ`) / Scott
 * (`κ=ω`) / transfinite-bounded / aperiodic. Minsky's hedge→speculative→Ponzi reads
 * as this regime climb (note §4 stage 9). */
export declare function valueRegime(d: ClosureRegimeData): ClosureRegime;
/** **No-arbitrage in a regime = H¹ = 0.** `cohomologyVanishesInRegime`: the settling
 * sheaf's first cohomology vanishes exactly in the strict and Scott regimes, where
 * the price settles to a unique confluent value with no arbitrage gap. `false` in the
 * transfinite-bounded and aperiodic regimes (where spread/adverse-selection
 * cohomology concentrates — note §4 stage 5; FTAP read structurally). */
export declare function noArbitrageInRegime(regime: ClosureRegime): boolean;
/** value — settle a commodity to its general equivalent (the `V = FOUR` value-form). */
export declare const valueAction: Action;
/** transform — prove the transformation problem is a `V`-independent base-change. */
export declare const transformAction: Action;
/** classify-value-regime — classify a settling's regime + the no-arbitrage reading. */
export declare const classifyValueRegimeAction: Action;
/** The value module's relating actions: one per verb (`value`, `transform`,
 * `classify-value-regime`), induced into bins downstream. */
export declare const valueActions: readonly Action[];
//# sourceMappingURL=value.d.mts.map