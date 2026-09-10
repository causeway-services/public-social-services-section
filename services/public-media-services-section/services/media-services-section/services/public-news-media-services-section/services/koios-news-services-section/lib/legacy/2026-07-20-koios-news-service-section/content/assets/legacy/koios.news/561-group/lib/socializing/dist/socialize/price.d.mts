/**
 * socialize/price — price as social consensus.
 *
 * Authority: `dev/docs/notes/2026-06-22-trading-as-settling-over-value-categories.md`
 * §4 stage 5 ("price = consensus") and §3 ("Marx ≡ Hayek up to valence"). The note,
 * verbatim:
 *
 *   *"Market price = the consensus limit `lim_O V`; bid-ask spread / adverse selection
 *   (Kyle 1985 λ, Glosten–Milgrom) = the H¹ obstruction to consensus; cross-venue
 *   arbitrage = inconsistency (`⊤`) across observers; no-arbitrage = H¹ = 0 = confluence
 *   = unique price (FTAP read socially; EMH weak/semi-strong/strong = three closure
 *   regimes of the information set)."*
 *
 * And §3, the convergence no economist had the language for:
 *
 *   *"Coordination happens behind their backs, through the exchange of their products…
 *   how a society of separate producers coordinates its labor without anyone planning
 *   it" (Marx's exchange-value note) ≡ Hayek's price system as a distributed
 *   knowledge-aggregation mechanism, a catallaxy. These describe the same object —
 *   `socializing`'s CALM consensus, a multi-observer field converging without central
 *   coordination (H¹ = 0 ⟺ coordination-free merge). Hayek reads it as the miracle;
 *   Marx reads it as the alienation/fetish. Our `socializing` is the neutral structure
 *   both are pointing at."*
 *
 * So this module invents NO theory of price. A market price is literally the
 * `@emsenn/socializing` consensus section over a venue-observer field:
 *
 *   - **The market is a Social Field.** Each VENUE is an observer `o ∈ O`. Each venue
 *     carries its PRICED MEME — a relating `meme` over the predication of its quote,
 *     DERIVED from the order-book best bid/ask via microstructure (stage 6), never a
 *     bare number (anti-fetishism: §1 — a price is the image of a predication among
 *     agents, not free data on a thing). The quote's charge encodes its truth
 *     DIRECTION: a venue showing the asset cheap-relative-to-fair commits a `potential`
 *     (bid-side) charge, a venue showing it dear commits an `active` (ask-side) charge.
 *
 *   - **`price = section.components[0].common = lim_O V`.** `convergeAction` reads the
 *     network-sheaf consensus over the observer category `O`: each component's `common`
 *     is the knowledge-MEET `∧ₖ` — exactly the consensus limit `lim_O V`. That meet IS
 *     the market price: the single charge every venue's quote is consistent with.
 *
 *   - **`spread = section.obstruction = H¹`.** The bid-ask spread / adverse selection
 *     (Kyle λ, Glosten–Milgrom) is the H¹ obstruction to gluing the venue-quotes into
 *     one section — the standing disagreement the consensus cannot drain. `glued ⟺
 *     obstruction === 0`.
 *
 *   - **`no-arbitrage ⟺ H¹ = 0`.** Confluence = a unique price. This is the FTAP
 *     (Harrison–Kreps / Pliska) read SOCIALLY: no-arbitrage ⟺ the local quotes extend
 *     to one glued global section. Cross-venue arbitrage is a nonzero H¹ — a CYCLE of
 *     opposed quotes that does not glue.
 *
 *   - **THE SOCIALIZING GOTCHA (§ converge).** Disagreement registers as H¹ ONLY on a
 *     CYCLE of OPPOSED charges. A held contradiction over a TREE of edges still glues
 *     (the component pools to `stable` — both-witnessed common ground). So venues must
 *     disagree in truth DIRECTION (`potential` vs `active`), not merely in numeric
 *     value, for a spread to register. A purely numeric disagreement with the same
 *     truth direction is common ground, not arbitrage — which is correct: two venues
 *     quoting different prices for the same fundamental view are not an arbitrage, an
 *     arbitrage is a CYCLE of opposed (buy-here-sell-there) quotes.
 *
 *   - **`martingalePrice` = the FTAP substrate (`relating` StochasticSettling).** The
 *     equivalent-martingale-measure half of the FTAP is `markovStationaryIsClosureFixpoint`
 *     over `natStochSemiring`: a price process is a martingale ⟺ its measure is
 *     stationary ⟺ it is a fixed point of the stochastic closure — the SAME equation
 *     `advance π = π`. Martingale = stationary = closure fixed point (note §6 port #3).
 *     This is `V`-independent by `four_regime_v_independent`, the same dynamics as the
 *     social consensus above, read on the stochastic value-category.
 *
 * Every verb is registered once as a relating `action` so `induceBins` projects the
 * whole surface to every transport (the ops-manifold doctrine — no second script map).
 */
import { type Action, type JsonRecord, type MarkovKernel } from "@emsenn/relating";
import { type Natural } from "@emsenn/relating/analysis";
import { replicaCoverConsensus } from "./glue.mjs";
import { type Field as SocialField, type FieldSection as CommonGround } from "./field.mjs";
/** The carrier `$id` of a price consensus — the consensus section read financially. */
export declare const PRICE_ID = "socializing/price/consensus";
/** The carrier `$id` of the martingale (FTAP / equivalent-martingale-measure) reading. */
export declare const PRICE_MARTINGALE_ID = "socializing/price/martingale";
/**
 * A price consensus — the `socializing` consensus section over a venue-observer field,
 * read as the market's price.
 *
 *  - `price` is `section.components[0].common` — the knowledge-meet `∧ₖ` = the consensus
 *    limit `lim_O V`: the single charge every venue's quote is consistent with (the
 *    market price as a derived predication, never bare data).
 *  - `spread` is `section.obstruction` — the H¹ obstruction to gluing the venue-quotes
 *    (the bid-ask spread / adverse selection; Kyle λ, Glosten–Milgrom).
 *  - `glued` is `spread === 0` — confluence: a unique price; no-arbitrage (FTAP socially).
 *  - `pooled` is `section.components[0].pooled` — the merge-fixpoint join `∨ₖ` (the
 *    CRDT-settled accumulation of every venue's witnessed quote).
 *
 * `price` / `pooled` are the reused relating charge carriers (refined as `JsonRecord`,
 * referenced never redefined) the consensus section carries.
 */
export interface PriceConsensus {
    readonly kind: "socializing.price.consensus";
    readonly price: JsonRecord;
    readonly spread: number;
    readonly glued: boolean;
    readonly pooled: JsonRecord;
}
/**
 * Socialize each venue-observer into one Social Field. A venue is an observer `o ∈ O`
 * carrying its PRICED MEME(s) — relating memes over the predication of its quote,
 * DERIVED upstream from the order-book best bid/ask via microstructure (stage 6), each
 * already a `predication.fiber.meme` charge carrier (anti-fetishism: never a bare
 * number; the quote is the image of a predication, and `socialize`'s admit boundary
 * refuses anything that is not a meme).
 *
 * Folds `socialize({ memes }, field)` from the empty field; `admit` grows the observer
 * category `O` to the maximally-connected category over the venues, so every ordered
 * pair of venues is comparable and a CYCLE of opposed quotes (cross-venue arbitrage)
 * can register as H¹. The section is left ungrounded; `priceConsensus` (re)computes it.
 */
export declare function venueField(quotes: readonly {
    readonly venue: string;
    readonly memes: readonly JsonRecord[];
}[]): SocialField;
/**
 * The market price as the `socializing` consensus over the venue field. `convergeAction`
 * computes the network-sheaf consensus; `section.components[0].common` is the
 * knowledge-meet `∧ₖ` = the consensus limit `lim_O V` (the price), `section.obstruction`
 * is the H¹ spread, and `glued ⟺ obstruction === 0` is no-arbitrage / a unique price
 * (FTAP read socially). An empty field has no venue and so no price — the limit and pool
 * are ⊥ (absurd) and the spread is 0 (vacuously glued; nothing to disagree).
 */
export declare function priceConsensus(field: SocialField): PriceConsensus;
/**
 * The bid-ask spread = the H¹ obstruction = `section.obstruction`. The standing
 * disagreement the consensus cannot drain (Kyle λ, Glosten–Milgrom adverse selection):
 * the opposition-cycle Betti number over the observer comparison graph. Zero ⟺ the
 * venue-quotes glue into one section.
 */
export declare function spreadObstruction(field: SocialField): number;
/**
 * No-arbitrage ⟺ `spreadObstruction === 0` ⟺ confluence ⟺ a unique price. The FTAP
 * (Harrison–Kreps / Pliska) read socially: the local venue-quotes extend to one glued
 * global section iff there is no cross-venue arbitrage (no CYCLE of opposed quotes). A
 * purely numeric disagreement in the SAME truth direction still glues — that is common
 * ground, not an arbitrage (the socializing gotcha).
 */
export declare function noArbitrage(field: SocialField): boolean;
/**
 * The replica-cover reading of one venue's neighbourhood: the Mayer–Vietoris H⁰ glued
 * section and the H¹ obstruction over THAT venue's covering family (the venues it is
 * directly comparable to). Ties the no-arbitrage condition to a local cover rather than
 * the whole graph — the EMH information-set reading: a venue is locally arbitrage-free
 * ⟺ its cover glues (`obstruction === 0`). Exposed as the cover-scoped companion to
 * `priceConsensus`.
 */
export declare function venueCoverConsensus(field: SocialField, venue: number): ReturnType<typeof replicaCoverConsensus>;
/**
 * The equivalent-martingale-measure half of the FTAP, as the `relating` StochasticSettling
 * headline `markovStationaryIsClosureFixpoint` over `natStochSemiring` (exact `Natural`
 * weights — no float). A risk-neutral price process is a MARTINGALE ⟺ its measure `π`
 * is STATIONARY (`advance π = π`) ⟺ `π` is a FIXED POINT of the stochastic closure —
 * the SAME equation. Returns the witness's three readings (`stationary` / `fixpoint` /
 * `equivalent`); `equivalent` is invariantly true (they are one defining equation), the
 * structural identity martingale = stationary = closure fixed point.
 *
 * `V`-independent by `four_regime_v_independent`: this is the same settling dynamics as
 * the social consensus above, read on the stochastic value-category instead of the
 * charge bilattice.
 */
export declare function martingalePrice(K: MarkovKernel<number, Natural>, pi: (s: number) => Natural): {
    readonly stationary: boolean;
    readonly fixpoint: boolean;
    readonly equivalent: boolean;
};
/** price — the apex: a venue field → the consensus price (lim_O V), its H¹ spread, glued. */
export declare const priceAction: Action;
/** spread-h1 — the bid-ask spread = the H¹ obstruction to consensus (Kyle λ). */
export declare const spreadH1Action: Action;
/** no-arbitrage — confluence ⟺ H¹ = 0 ⟺ a unique price (FTAP read socially). */
export declare const noArbitrageAction: Action;
/** martingale — the FTAP equivalent-martingale-measure: stationary = closure fixed point. */
export declare const martingaleAction: Action;
/**
 * priceActions — the price face's registered operations, each a cocone leg over the
 * relating boundary. `induceBins` over this list assembles the discovery apex from which
 * CLI / OpenAPI / MCP / web are projected by the one relating dispatcher; this package
 * invents no second transport. The market price (`price`) and its H¹ spread (`spread-h1`)
 * / no-arbitrage (`no-arbitrage`) are the socializing-consensus reading; `martingale` is
 * the FTAP equivalent-martingale-measure substrate (the same settling, on the stochastic
 * value-category).
 */
export declare const priceActions: readonly Action[];
export type { SocialField, CommonGround };
export type { MarkovKernel } from "@emsenn/relating";
export type { Natural } from "@emsenn/relating/analysis";
//# sourceMappingURL=price.d.mts.map