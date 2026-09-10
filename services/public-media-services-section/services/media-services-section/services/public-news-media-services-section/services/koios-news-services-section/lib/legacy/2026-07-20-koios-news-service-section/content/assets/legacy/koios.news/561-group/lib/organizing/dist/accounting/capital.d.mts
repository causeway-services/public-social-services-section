/**
 * organizing/accounting/capital — the accounting reading of capital as the
 * reseed spiral M–C–M′.
 *
 * Authority: `dev/docs/notes/2026-06-22-trading-as-settling-over-value-categories.md`
 * §4 stage 8 ("capital = the reseed spiral"): *"M–C–M′: value-in-motion that
 * returns enlarged = the agency descent that DOES NOT TERMINATE but reseeds at
 * higher scale (`reseed`). Capital is the spiral, not a thing (corpus capital
 * note: 'not a thing but a social relation that takes the form of self-expanding
 * value'). Surplus value, organic composition, TRPF = ratios = readings on the
 * circuit. Capital-as-class-relation = an asymmetry frozen into the agent-sheaf."*
 *
 * The four readings of capital this module formalizes — each DERIVED, never bare:
 *
 *  1. **circuit(seed) — M–C–M′ = the non-terminating spiral.** Simple commodity
 *     circulation C–M–C terminates: a use-value is reached and the motion stops.
 *     Capital's circuit M–C–M′ does NOT terminate — the settled money re-poses as
 *     the seed of the next, larger circuit. That is EXACTLY `@emsenn/animating`'s
 *     `reseed`: the individuated being ("settled below, open above") carries a
 *     charge of residual pre-individual potential (its `milieu`) and re-enters as
 *     the seed of a fresh descent at the next scale. So `circuit` is `reseed` read
 *     financially — value-in-motion returning to itself enlarged, `openAbove: true`,
 *     `regime: "aperiodic"` (the spiral never closes into a terminal fixed point).
 *     Capital is the `Becoming`, not a thing: the carrier holds the becoming, not a
 *     stock of money.
 *
 *  2. **surplus(invested, recovered) — surplus value & the rate of profit.** M′ − M
 *     = ΔM is surplus value: `subMoney(recovered, invested)` over
 *     `@emsenn/relating/economy`'s exact
 *     `Rational`-graded arithmetic (the same commodity sector both legs live in —
 *     `subMoney` THROWS on a commodity mismatch, the multi-commodity safety law).
 *     The rate of profit is the dimensionless RATIO reading on the circuit,
 *     `s / C = ΔM / M`, computed by `ratioOf(surplus, invested)` as a bare
 *     `bigint` num/den pair — a reading on the circuit, never a free number on a
 *     thing. (TRPF — the tendency of the rate of profit to fall — and the organic
 *     composition c/(c+v) are further `ratioOf` readings the institution layer takes
 *     over the reproduction scheme; the primitive they all collapse into is this
 *     single ratio-of-surplus-over-capital.)
 *
 *  3. **sraffaPrices(io) — prices of production = the dominant eigenvector.** Sraffa's
 *     *Production of Commodities by Means of Commodities*: prices of production are
 *     the Perron–Frobenius dominant eigenvector of the input–output matrix (the
 *     self-replacing standard system). On this substrate the eigenstructure is read
 *     SPECTRALLY and EXACTLY: `charPoly(io)` (`@emsenn/relating/analysis`, ascending
 *     degree, exact `Integer` arithmetic — Bareiss/fraction-free, never a float) is
 *     the characteristic polynomial whose dominant real root is the Perron–Frobenius
 *     eigenvalue (1 + r over the standard ratio), and `rank(io)` (count of nonzero
 *     Smith invariant factors) reports the dimension of the price system. The
 *     dominant-eigenvector reading lives in the spectral root structure of that
 *     polynomial — exposed, not approximated. This is the §2/§6 keystone: the Sraffa
 *     school is a `ValueCategory` choice ('prices-of-production'), settled by the
 *     SAME dynamics as every other school (`four_regime_v_independent`); the
 *     transformation problem (labour values ↦ prices of production) is a base-change
 *     between two `V`'s, not a refutation.
 *
 *  4. **capital-as-class-relation — a reading, not a new carrier.** Capital is "a
 *     social relation that takes the form of self-expanding value" — the M–C–M′
 *     asymmetry (one pole advances M and claims ΔM, the other sells labour-power)
 *     is an ASYMMETRY FROZEN INTO THE AGENT-SHEAF, the off-diagonal of the social
 *     gluing the institution layer (stage 9, `organizing`) settles. It is therefore
 *     a reading on the circuit's becoming and the surplus ratio, NOT a fifth carrier
 *     — the anti-fetishism law (§1): the class relation is the image of a predication
 *     among agents, never free data on a thing.
 *
 * Carriers are bare-`$id` (`organizing/accounting/capital/circuit`,
 * `organizing/accounting/capital/surplus`);
 * each verb is registered once as a relating `action` so `induceBins` projects the
 * whole surface to every transport. No free data past `Mark`/`Articulating`: the
 * circuit is `reseed`, the surplus is `subMoney` + `ratioOf`, the Sraffa prices are
 * `charPoly`/`rank` over exact `Integer` matrices.
 */
import { type Action, type JsonValue } from "@emsenn/relating";
import { type Integer, type Matrix, type Natural } from "@emsenn/relating/analysis";
import { type Becoming } from "@emsenn/animating";
import { type Money } from "@emsenn/relating/economy";
/** The carrier `$id` of a capital circuit — the M–C–M′ reseed spiral. */
export declare const CAPITAL_CIRCUIT_ID = "organizing/accounting/capital/circuit";
/** The `{ $ref }` slot the circuit morphisms reference. */
export declare const circuitRef: Readonly<{
    $ref: "organizing/accounting/capital/circuit";
}>;
/** The carrier `$id` of a surplus reading — ΔM and the rate of profit over a circuit. */
export declare const CAPITAL_SURPLUS_ID = "organizing/accounting/capital/surplus";
/** The `{ $ref }` slot the surplus morphisms reference. */
export declare const surplusRef: Readonly<{
    $ref: "organizing/accounting/capital/surplus";
}>;
/**
 * A capital circuit: M–C–M′ read as `animating`'s non-terminating reseed spiral.
 *
 * `becoming` IS the `@emsenn/animating` `Becoming` that `reseed` re-poses the
 * settled individual into — the value-in-motion that returns to itself enlarged
 * and re-enters at the next scale (`openAbove: true`, `regime: "aperiodic"`).
 * `identity` names the circuit's re-posed agent. Capital is held HERE as the
 * becoming, not as a stock of money: capital is the spiral, not a thing.
 */
export interface Circuit {
    readonly kind: "organizing.accounting.capital.circuit";
    readonly identity: string;
    readonly becoming: Becoming;
}
/**
 * A surplus reading on a circuit: surplus value ΔM = M′ − M and (when capital is
 * advanced, i.e. M ≠ 0) the rate of profit ΔM / M.
 *
 * `surplus` is exact graded money (`subMoney(recovered, invested)`), staying in the
 * invested commodity's sector. `rateOfProfit` is the dimensionless `bigint` num/den
 * ratio `ratioOf(surplus, invested)` — a reading on the circuit, ABSENT when no
 * capital was advanced (the ratio's denominator would be zero; the rate of profit
 * on nothing advanced is undefined, not zero — silence, not denial).
 */
export interface SurplusReading {
    readonly kind: "organizing.accounting.capital.surplus";
    readonly invested: Money;
    readonly recovered: Money;
    readonly surplus: Money;
    readonly rateOfProfit?: {
        readonly num: bigint;
        readonly den: bigint;
    };
}
/**
 * M–C–M′: the capital circuit as `animating`'s reseed spiral.
 *
 * `reseed(seed, options)` re-poses the settled individual as the next-scale
 * `Becoming` — the motion that does not terminate but re-enters enlarged. Capital is
 * that becoming: the carrier holds the re-posed spiral, not a money stock. The
 * `identity` option names the re-posed agent (the firm/capital whose circuit this is).
 */
export declare function circuit(seed: JsonValue, options?: {
    identity?: string;
}): Circuit;
/**
 * Re-pose a settled circuit into the next, higher-scale circuit — the spiral does
 * not terminate. The settled circuit's becoming-seed is fed back through `reseed-circuit`:
 * M′ becomes the M of the next round, value-in-motion returning to itself enlarged.
 * This makes the non-termination operational: `reseed-circuit` of a reseed, one scale up.
 */
export declare function reseedCircuit(prior: Circuit, options?: {
    identity?: string;
}): Circuit;
/**
 * The surplus reading on a circuit: ΔM = recovered − invested and the rate of
 * profit ΔM / M.
 *
 * `subMoney(recovered, invested)` is the exact graded difference (THROWS on a
 * commodity mismatch — both legs must value the same sector). The rate of profit is
 * the dimensionless ratio `ratioOf(surplus, invested)`; it is omitted when nothing
 * was advanced (the contract's optional field — no rate of profit on zero capital).
 */
export declare function surplus(invested: Money, recovered: Money): {
    readonly surplus: Money;
    readonly rateOfProfit?: {
        readonly num: bigint;
        readonly den: bigint;
    };
};
/**
 * Build the full surplus carrier on a circuit's invested/recovered legs: the
 * surplus money, and the rate of profit when capital was advanced.
 */
export declare function surplusReading(invested: Money, recovered: Money): SurplusReading;
/**
 * Sraffa prices of production: the characteristic-polynomial spectral structure of
 * the input–output matrix, the substrate of the Perron–Frobenius dominant eigenvector.
 *
 * `charPoly(io)` (`@emsenn/relating/analysis`, ascending degree, exact `Integer`
 * arithmetic — fraction-free, never a float) is the polynomial whose dominant real
 * root is the Perron–Frobenius eigenvalue of the self-replacing standard system; the
 * prices of production ARE that dominant eigenvector. `rank(io)` (count of nonzero
 * Smith invariant factors) reports the dimension of the resolved price system. The
 * prices-of-production school is a `ValueCategory` choice settled by the same
 * dynamics as every other (§2 keystone); the transformation problem is a base-change.
 */
export declare function sraffaPrices(io: Matrix): {
    readonly charPoly: readonly Integer[];
    readonly rank: Natural;
};
/** circuit — M–C–M′: re-pose a seed as the non-terminating reseed spiral. */
export declare const circuitAction: Action;
/** reseed-circuit — re-pose a settled circuit into the next, higher-scale circuit. */
export declare const reseedAction: Action;
/** surplus — ΔM = recovered − invested and the rate of profit ΔM / M (a ratio reading). */
export declare const surplusAction: Action;
/** sraffa — prices of production = the dominant eigenvector: charPoly + rank of the I–O matrix. */
export declare const sraffaAction: Action;
/** The capital module's verbs: the reseed spiral, its re-entry, the surplus ratio, and Sraffa prices. */
export declare const capitalActions: readonly Action[];
//# sourceMappingURL=capital.d.mts.map