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
import { action, jsonResource, settlingIsOptimization, valueCategory, vClosure, sampleSpace, measure as measureOf, total as totalOf, measureIsValuation, } from "@emsenn/relating";
import { gradedCompare, gradedZero, gradeOf } from "@emsenn/relating/analysis";
import { agent } from "@emsenn/animating";
import { compute, relay } from "@emsenn/computing";
import { marketBuyWalk, } from "@emsenn/gaming/market";
import {} from "@emsenn/relating/economy";
import { martingalePrice } from "@emsenn/socializing/price";
import { settleValue } from "./value.mjs";
/* ──────────────────────────────────────────────────────────────────────────
 * (1) best-execution — optimization over the book-walk.
 *
 * The market buy of a fixed `baseQuantity` is walked greedily through the asks
 * (microstructure `marketBuyWalk`). Best execution is the OPTIMUM of a settling
 * over a value category of book-walks: *more-filled is better* (progress toward
 * the target fill), and the improvement is *one more book-walk step* — modelled
 * as the terminal `marketBuyWalk`, the limit the stepping converges to. By the
 * relating headline `settlingIsOptimization`, that optimum is the settling fixed
 * point: reachable (inflation — a fill never retracts), locally optimal (no more
 * book to consume), the least such. This is note §2's Walras/Arrow–Debreu
 * excess-demand fixed point read at the microstructure scale.
 * ────────────────────────────────────────────────────────────────────────── */
/** The value category of book-walks for one target quantity: *more filled is
 * better* (`l ≤_V r` ⟺ `r` fills at least as much as `l`), seeded at the empty
 * walk. The order is decided by the exact `Money` fill via `gradedCompare`; no
 * floats. */
const bookWalkValue = (seed) => valueCategory((l, r) => gradedCompare(l.filled, r.filled) <= 0, (l, r) => gradedCompare(l.filled, r.filled) === 0, seed);
/**
 * **best-execution (HEADLINE).** Greedy optimization over the book-walk via the
 * relating `settlingIsOptimization` over `bookWalkValue`. The improvement jumps a
 * seed walk to the full `marketBuyWalk` (the terminal of *one more step* applied to
 * exhaustion); its fixed point is the best achievable execution of `baseQuantity`.
 */
export function bestExecution(book, baseQuantity) {
    const executed = marketBuyWalk(book, baseQuantity);
    // The empty seed walk: nothing filled, the worst execution (≤_V bottom).
    const seed = Object.freeze({
        filled: gradedZero(gradeOf(executed.filled)),
        cost: gradedZero(gradeOf(executed.cost)),
        shortfall: baseQuantity,
    });
    const V = bookWalkValue(seed);
    // improve = one more book-walk step, modelled as the terminal full walk: it is
    // inflationary (the full fill ≥ any partial), monotone, and idempotent.
    const improve = vClosure(() => executed);
    const witness = settlingIsOptimization(V, improve, seed);
    return Object.freeze({
        kind: "organizing.accounting.strategy.bestExecution",
        walk: executed,
        optimum: witness.optimum,
        locallyOptimal: V.eq(seed, witness.optimum),
    });
}
/* ──────────────────────────────────────────────────────────────────────────
 * (2) markowitz — the mean–variance optimum is value-form settling.
 * ────────────────────────────────────────────────────────────────────────── */
/**
 * **markowitz.** The mean–variance / efficient-frontier optimum settles a value
 * form to its optimum — a straight reuse of `value.settleValue` (note §2:
 * Markowitz/CAPM/expected-utility = `Optimization` over a chosen `V`). The
 * portfolio school is the choice of `V`; the settling dynamics are shared, so the
 * efficient frontier is the fixed point the value form reaches from the seed
 * allocation.
 */
export function markowitz(form, seed) {
    return settleValue(form, seed);
}
/**
 * **risk = a probability valuation (HEADLINE).** A risk is the probability of an
 * outcome event: the relating counting `measure` over a `sampleSpace`, against the
 * `total`. `P(A)` is returned as the exact pair `(μ(A), μ(Ω))` — a ratio of
 * `Natural`s, not a real. This is the *risk* side of Knight's risk-vs-uncertainty
 * dichotomy: a probabilizable, settled event (cf. `strategyVerdict`'s UNDECIDABLE
 * = the *uncertainty* side).
 */
export function riskValuation(outcomes, event) {
    const S = sampleSpace(outcomes);
    const m = measureOf(S, event);
    const t = totalOf(S);
    // Witness Kolmogorov with the event against itself (a valid disjoint-pair probe).
    const w = measureIsValuation(S, event, event);
    return Object.freeze({
        kind: "organizing.accounting.strategy.riskValuation",
        measure: m,
        total: t,
        valuation: w.empty && w.univ && w.monotone && w.complement,
    });
}
/* ──────────────────────────────────────────────────────────────────────────
 * (4) strategy verdict — compute(agent) → FOUR; UNDECIDABLE = Knight uncertainty.
 * ────────────────────────────────────────────────────────────────────────── */
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
export function strategyVerdict(seed, options) {
    const a = agent(seed, options);
    return compute(a).standing;
}
/* ──────────────────────────────────────────────────────────────────────────
 * (5) portfolio — the Kleisli relay over a society of trader-agents.
 * ────────────────────────────────────────────────────────────────────────── */
/**
 * **portfolio = the Kleisli relay.** A portfolio is a society of trader-agents
 * settled to its collective knowledge: `@emsenn/computing` `relay(lead, rest)`
 * aggregates every member's standing by the `∨ₖ` knowledge join (note §4 stage 7:
 * portfolio aggregation = the Kleisli relay). The lead's `standing` is the
 * portfolio's headline; `aggregate` is the society's joined truth (one member
 * verifying and another refuting aggregates to ⊤ — "told both").
 */
export function portfolio(lead, rest) {
    return relay(lead, rest);
}
/* ──────────────────────────────────────────────────────────────────────────
 * (6) risk-neutral valuation — stochastic settling (FTAP) reused from price.
 * ────────────────────────────────────────────────────────────────────────── */
/**
 * **risk-neutral valuation.** Reuses `price.martingalePrice`: the equivalent-
 * martingale-measure FTAP substrate, where martingale = stationary = stochastic
 * closure fixed point (note §2 FTAP, §4 stage 7 risk-neutral pricing). Re-exposed
 * here as the `risk-neutral` strategy reading — valuation as stochastic settling.
 */
export const riskNeutralValuation = martingalePrice;
/* ──────────────────────────────────────────────────────────────────────────
 * The relating actions — one boundary morphism per verb, projected by induceBins.
 * Every run gates its return through `jsonResource` (the JSON edge).
 * ────────────────────────────────────────────────────────────────────────── */
/** `strategy` — read a seed strategy's verdict as FOUR (the agent's computation). */
const strategyAction = action({
    verb: "strategy",
    summary: "compute(agent) → FOUR — a strategy's settled verdict (⊥ = Knight uncertainty)",
    description: "Build an animating trader-agent from a seed and read its computing standing as VERIFIED/REFUTED/UNDECIDABLE(⊥=Knight uncertainty)/CONTRADICTORY.",
    run: (input, args) => {
        const identity = typeof args.identity === "string" ? args.identity : undefined;
        const predicate = typeof args.predicate === "string" ? args.predicate : undefined;
        const charge = typeof args.charge === "string" ? args.charge : undefined;
        const goal = predicate !== undefined || charge !== undefined
            ? { ...(predicate !== undefined ? { predicate } : {}), ...(charge !== undefined ? { charge } : {}) }
            : undefined;
        const verdict = strategyVerdict(jsonResource(input, "strategy input"), {
            ...(identity !== undefined ? { identity } : {}),
            ...(goal !== undefined ? { goal } : {}),
        });
        return jsonResource(verdict);
    },
    options: ["identity", "predicate", "charge"],
});
/** `best-execution` — the optimization over the book-walk for a target quantity. */
const bestExecutionAction = action({
    verb: "best-execution",
    summary: "greedy optimization over the book-walk via settlingIsOptimization",
    description: "Walk the asks for a target base quantity (microstructure marketBuyWalk) and return the settling optimum: the executed walk, the optimum, and local optimality.",
    run: (input) => {
        const { book, baseQuantity } = input;
        return jsonResource(bestExecution(book, baseQuantity));
    },
});
/** `markowitz` — the mean–variance optimum as value-form settling. */
const markowitzAction = action({
    verb: "markowitz",
    summary: "mean–variance optimum = settle the value form to its optimum",
    description: "Settle a value form (the chosen portfolio school's V) from a seed allocation to its efficient-frontier optimum — a reuse of value.settleValue.",
    run: (input) => {
        const { form, seed } = input;
        return jsonResource(markowitz(form, seed));
    },
});
/** `risk` — a probability valuation `P(A) = (μ(A), μ(Ω))` over an outcome set. */
const riskAction = action({
    verb: "risk",
    summary: "risk = a probability valuation; P(A) = the exact pair (μ(A), μ(Ω))",
    description: "Count the measure of an outcome event against the sample total (exact Natural, no floats); P(A) is the pair (measure, total). The settled, probabilizable side of Knight's risk-vs-uncertainty.",
    run: (input) => {
        const { outcomes, event } = input;
        return jsonResource(riskValuation(outcomes, event));
    },
});
/** `portfolio` — the Kleisli relay aggregating a society of trader-agents. */
const portfolioAction = action({
    verb: "portfolio",
    summary: "portfolio = the Kleisli relay (aggregate ∨ₖ over all agents)",
    description: "Relay a lead trader-agent with the rest of the portfolio: the society's collective standing is the ∨ₖ knowledge join over all members.",
    run: (input) => {
        const { lead, rest } = input;
        return jsonResource(portfolio(lead, rest));
    },
});
/** The stage-7 strategy actions, in descent order. */
export const strategyActions = Object.freeze([
    strategyAction,
    bestExecutionAction,
    markowitzAction,
    riskAction,
    portfolioAction,
]);
//# sourceMappingURL=strategy.mjs.map