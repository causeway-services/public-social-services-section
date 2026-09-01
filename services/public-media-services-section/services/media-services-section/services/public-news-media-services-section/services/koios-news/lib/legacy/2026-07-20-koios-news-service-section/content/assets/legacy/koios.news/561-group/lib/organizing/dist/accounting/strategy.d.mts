/**
 * organizing/accounting/strategy — valuation and strategy as the computing face
 * read over the book-walk and the agent.
 *
 * From the authority note `dev/docs/notes/2026-06-22-trading-as-settling-over-value-
 * categories.md` §4 stage 7: *"Strategy = optimization (Markowitz mean-variance,
 * best-execution, expected utility, vNM/Savage) = `compute(agent) → FOUR` over
 * `Optimization`; risk-neutral/martingale pricing over `StochasticSettling`; portfolio
 * aggregation = the Kleisli relay (`compose`). Knight's risk vs uncertainty = charged
 * vs `⊥ₖ`."* This module is the literal projection of that paragraph onto the live
 * relating value-category settling layer (note §6 ports #1–#4) and the computing/
 * animating faces:
 *
 *   - **best-execution** — `@emsenn/relating` `settlingIsOptimization` over a
 *     {@link ValueCategory} whose order is *cheaper-cost-is-better* and whose
 *     improvement is *one more book-walk step* (the microstructure `marketBuyWalk`/
 *     `marketSellWalk`). The optimum IS the settling fixed point (note §2: Walras →
 *     Arrow–Debreu excess-demand fixed point), surfaced as the executed walk.
 *   - **markowitz** — the mean–variance / efficient-frontier optimum is the value-form
 *     settling to its optimum: a straight reuse of `value.settleValue` (note §2
 *     Markowitz/CAPM = `Optimization`). The school chooses `V`; the dynamics are shared.
 *   - **risk** — a risk is a PROBABILITY valuation: `@emsenn/relating` counting
 *     `measure`/`total` over a `sampleSpace`, exact `Natural` throughout (no reals —
 *     `P(A)` is the pair `(μ(A), μ(Ω))`, a ratio of counts, never a float). The
 *     Kolmogorov axioms hold by `measureIsValuation`.
 *   - **strategy verdict** — build an `@emsenn/animating` `agent()` and read its
 *     `@emsenn/computing` `compute(agent).standing` as one of FOUR. **UNDECIDABLE (⊥)
 *     IS Knight uncertainty** (note §4: risk vs uncertainty = charged vs `⊥ₖ`): a
 *     strategy whose agent never settled (ungued, H¹>0) is the genuinely *uncertain*
 *     (un-probabilizable) regime, distinct from a settled VERIFIED/REFUTED *risk*.
 *   - **portfolio** — `@emsenn/computing` `relay`: the Kleisli relay aggregating a
 *     society of trader-agents to its collective `∨ₖ` knowledge (note §4 stage 7:
 *     portfolio aggregation = the Kleisli relay).
 *   - **risk-neutral valuation** — reuses `price.martingalePrice` (the FTAP /
 *     equivalent-martingale-measure substrate: martingale = stationary = stochastic
 *     closure fixed point), exposed here as the `risk-neutral` strategy reading.
 *
 * No free data crosses any boundary (CLAUDE.md anti-fetishism law): every verdict is
 * the image of a predication — an agent's settled standing, a counted measure, or a
 * fixed point of a value-category closure. Money is exact (`Money` = the analysis
 * `GradedRational`); counts are exact (`Natural`); never a float.
 */
import { type ProbabilityEvent, type Action, type JsonValue } from "@emsenn/relating";
import { type Natural } from "@emsenn/relating/analysis";
import { type Agent } from "@emsenn/animating";
import { relay, type Four } from "@emsenn/computing";
import { type OrderBook, type BookWalk } from "@emsenn/gaming/market";
import { type Money } from "@emsenn/relating/economy";
import { martingalePrice } from "@emsenn/socializing/price";
import { type ValueForm, type Valued } from "./value.mjs";
/** The result of best-execution: the executed walk, the settling optimum, and
 * whether the seed walk was already locally optimal (no further book to take). */
export interface BestExecution {
    readonly kind: "organizing.accounting.strategy.bestExecution";
    /** The greedily-walked execution (microstructure `marketBuyWalk`). */
    readonly walk: BookWalk;
    /** The settling optimum — the fixed point the improvement reaches. */
    readonly optimum: BookWalk;
    /** Whether the seed was already optimal (`improve seed = seed`). */
    readonly locallyOptimal: boolean;
}
/**
 * **best-execution (HEADLINE).** Greedy optimization over the book-walk via the
 * relating `settlingIsOptimization` over `bookWalkValue`. The improvement jumps a
 * seed walk to the full `marketBuyWalk` (the terminal of *one more step* applied to
 * exhaustion); its fixed point is the best achievable execution of `baseQuantity`.
 */
export declare function bestExecution(book: OrderBook, baseQuantity: Money): BestExecution;
/**
 * **markowitz.** The mean–variance / efficient-frontier optimum settles a value
 * form to its optimum — a straight reuse of `value.settleValue` (note §2:
 * Markowitz/CAPM/expected-utility = `Optimization` over a chosen `V`). The
 * portfolio school is the choice of `V`; the settling dynamics are shared, so the
 * efficient frontier is the fixed point the value form reaches from the seed
 * allocation.
 */
export declare function markowitz<T>(form: ValueForm<T>, seed: T): Valued<T>;
/** A risk valuation: the counting measure of an event and the total of the sample
 * space — `P(A) = (measure, total)`, an exact ratio of `Natural` counts, never a
 * float. The Kolmogorov axioms hold (`measureIsValuation`); this carrier is the
 * `(num, den)` pair the note §6 port #4 mandates. */
export interface RiskValuation {
    readonly kind: "organizing.accounting.strategy.riskValuation";
    /** μ(A) — the count of outcomes in the event. */
    readonly measure: Natural;
    /** μ(Ω) — the total count of outcomes (the denominator). */
    readonly total: Natural;
    /** Whether the Kolmogorov valuation axioms hold over this sample (empty, univ,
     * additive-on-disjoint, monotone, complement). */
    readonly valuation: boolean;
}
/**
 * **risk = a probability valuation (HEADLINE).** A risk is the probability of an
 * outcome event: the relating counting `measure` over a `sampleSpace`, against the
 * `total`. `P(A)` is returned as the exact pair `(μ(A), μ(Ω))` — a ratio of
 * `Natural`s, not a real. This is the *risk* side of Knight's risk-vs-uncertainty
 * dichotomy: a probabilizable, settled event (cf. `strategyVerdict`'s UNDECIDABLE
 * = the *uncertainty* side).
 */
export declare function riskValuation<O>(outcomes: readonly O[], event: ProbabilityEvent<O>): RiskValuation;
/**
 * **strategy verdict (HEADLINE).** Build an `@emsenn/animating` trader-agent from a
 * seed (the strategy's perceive→act loop) and read its `@emsenn/computing`
 * `compute(agent).standing` as one of FOUR (note §4 stage 7: `compute(agent) →
 * FOUR`). The four standings are the strategy's settled truth:
 *
 *   - **VERIFIED (t)** — the settled agent carries its goal: the strategy holds;
 *   - **REFUTED (f)** — the settled agent fails its goal: the strategy is refuted;
 *   - **UNDECIDABLE (⊥)** — the agent never settled (ungued, H¹>0): **this IS Knight
 *     uncertainty** — un-probabilizable, never settled, the genuinely uncertain
 *     regime (vs the settled *risk* of `riskValuation`);
 *   - **CONTRADICTORY (⊤)** — a held contradiction in the goal charge (`stable`).
 */
export declare function strategyVerdict(seed: JsonValue, options?: {
    identity?: string;
    goal?: {
        predicate?: string;
        charge?: string;
    };
}): Four;
/**
 * **portfolio = the Kleisli relay.** A portfolio is a society of trader-agents
 * settled to its collective knowledge: `@emsenn/computing` `relay(lead, rest)`
 * aggregates every member's standing by the `∨ₖ` knowledge join (note §4 stage 7:
 * portfolio aggregation = the Kleisli relay). The lead's `standing` is the
 * portfolio's headline; `aggregate` is the society's joined truth (one member
 * verifying and another refuting aggregates to ⊤ — "told both").
 */
export declare function portfolio(lead: Agent, rest: readonly Agent[]): ReturnType<typeof relay>;
/**
 * **risk-neutral valuation.** Reuses `price.martingalePrice`: the equivalent-
 * martingale-measure FTAP substrate, where martingale = stationary = stochastic
 * closure fixed point (note §2 FTAP, §4 stage 7 risk-neutral pricing). Re-exposed
 * here as the `risk-neutral` strategy reading — valuation as stochastic settling.
 */
export declare const riskNeutralValuation: typeof martingalePrice;
/** The stage-7 strategy actions, in descent order. */
export declare const strategyActions: readonly Action[];
//# sourceMappingURL=strategy.d.mts.map