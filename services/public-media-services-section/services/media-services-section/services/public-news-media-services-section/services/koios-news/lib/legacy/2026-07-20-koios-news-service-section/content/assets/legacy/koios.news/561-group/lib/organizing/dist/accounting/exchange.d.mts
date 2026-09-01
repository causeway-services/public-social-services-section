/**
 * organizing/accounting/exchange — the accounting trade as the linear-logic cut,
 * `⊗ ⊣ ⊸`.
 *
 * Authority: `dev/docs/notes/2026-06-22-trading-as-settling-over-value-categories.md`
 * §4 stage 2 ("exchange = the cut"): *"A trade is `⊗ ⊣ ⊸` — give X to get Y,
 * resources non-copyable — already present as `predicationFiberLinearFusion` /
 * `predicationFiberLinearResiduum`. As interaction: buyer `Design ⊗` seller
 * `Design^⊥ → Interaction`; bid/ask = P/O polarity; a fill = cut-elimination."*
 * §6 closes the loop: *"Not a gap: exchange-as-`⊗⊣⊸` is already in relating's
 * positing fibers."* So this module builds NO new connective — it composes the
 * commodity fibers (stage 1) with relating's linear logic and gaming's ludics cut.
 *
 * Two readings of the same trade, dual to each other:
 *
 *  1. **The static cut (relating).** A commodity is a charge over a society
 *     (stage 1). "Give X to get Y" is the linear tensor of the two charged
 *     fibers — `predicationFiberLinearFusion(give, get)` — and the residuated
 *     obligation "having given X, I am owed Y" is the linear residuum
 *     `predicationFiberLinearResiduum(give, get)` (`⊸`). Linearity is the
 *     anti-fetishism law made operational: the resources are non-copyable, the
 *     value is the image of a relation, never free data on a thing.
 *  2. **The dynamic cut (gaming).** The buyer's standing is a positive (Proponent)
 *     `Design`, the seller's the dual negative (Opponent) `Design^⊥`; the polarity
 *     ↔ charge bridge is `polarityCharge` (positive ↦ `potential` = bid; negative
 *     ↦ `active` = ask). A FILL is cut-elimination: `interact(bid, ask)` computes
 *     the interaction normal form (the pointwise knowledge-join of the dual
 *     designs), and the SETTLEMENT points — the loci where bid and ask collide
 *     into `⊤` (`stable`) and the play gives up into a deal — are exactly
 *     `interactionReport(bid, ask).daimonLoci`.
 *
 * This is the categorical substrate the market layer (stage 6) reuses: a matched
 * order event is a fill, a resting order is an un-cut design. The module ports no
 * current-`trading` code — exchange-as-cut is the new structure stage 2 calls for.
 *
 * Carriers are bare-`$id` (`organizing/accounting/exchange`,
 * `organizing/accounting/exchange/fill`); each verb
 * is registered once as a relating `action` so `induceBins` projects the whole
 * surface to every transport.
 */
import { type Action, type PredicateFiber } from "@emsenn/relating";
import { type Design } from "@emsenn/gaming/structuring";
import { type Commodity } from "./commodity.mjs";
/** The carrier `$id` of an exchange — the static `⊗ ⊣ ⊸` cut over two commodities. */
export declare const EXCHANGE_ID = "organizing/accounting/exchange";
/** The `{ $ref }` slot the exchange morphisms reference. */
export declare const exchangeRef: Readonly<{
    $ref: "organizing/accounting/exchange";
}>;
/** The carrier `$id` of a fill — the cut-elimination normal form of a bid/ask cut. */
export declare const EXCHANGE_FILL_ID = "organizing/accounting/exchange/fill";
/** The `{ $ref }` slot the fill morphism references. */
export declare const fillRef: Readonly<{
    $ref: "organizing/accounting/exchange/fill";
}>;
/**
 * An exchange: "give X to get Y" read as the linear cut over two commodity fibers.
 *
 * `fusion = give ⊗ get` is the resources-consumed tensor; `residuum = give ⊸ get`
 * is the residuated obligation the trade leaves standing. Both are `PredicateFiber`s
 * over relating's positing linear logic — no new connective is introduced.
 */
export interface Exchange {
    readonly kind: "organizing.accounting.exchange";
    readonly give: Commodity;
    readonly get: Commodity;
    readonly fusion: PredicateFiber;
    readonly residuum: PredicateFiber;
}
/**
 * A fill: the cut-elimination of a bid against an ask.
 *
 * `normalForm` is `interact(bid, ask)` — the interaction normal form (a `Design`,
 * the pointwise knowledge-join of the dual designs). `daimonLoci` are the
 * settlement / give-up points: the loci where the two designs collide into `⊤`
 * (`stable`) — where the deal closes — keyed by their locus address.
 */
export interface Fill {
    readonly kind: "organizing.accounting.exchange.fill";
    readonly normalForm: Design;
    readonly daimonLoci: readonly string[];
}
/**
 * The static cut `give ⊗ get`: the linear fusion of the two commodity fibers.
 * "Give X to get Y" — the resources are consumed; the tensor is relating's
 * `predicationFiberLinearFusion`, the package's own linear-logic conjunction.
 */
export declare function exchangeFusion(give: PredicateFiber, get: PredicateFiber): PredicateFiber;
/**
 * The residuated obligation `give ⊸ get`: the linear residuum of the two fibers.
 * "Having given X, I am owed Y" — the `⊸` of the cut, relating's
 * `predicationFiberLinearResiduum`, the right adjoint of the tensor.
 */
export declare function exchangeResiduum(give: PredicateFiber, get: PredicateFiber): PredicateFiber;
/**
 * Build the exchange `give ⊗ ⊣ ⊸ get` over two commodities: lift each commodity
 * to its charge fiber, then form both the tensor (`fusion`) and the residuum.
 */
export declare function exchange(give: Commodity, get: Commodity): Exchange;
/**
 * Fuse a bid (positive / Proponent) and an ask (negative / Opponent) into a single
 * `Design` cut, ready for elimination — `interact(bid, ask)`, the interaction
 * normal form. Polarity ↔ charge is gaming's `polarityCharge`: the positive
 * (`potential`) bid and the negative (`active`) ask are the P/O polarities of the
 * trade, and `interact` joins them at every shared locus. Exposed as the raw
 * combinator the fill verb cites.
 */
export declare function fuse(bid: Design, ask: Design): Design;
/**
 * Eliminate the cut: a fill is the interaction normal form of bid against ask,
 * tagged with its settlement loci.
 *
 * `interact(bid, ask)` is the cut-eliminated `Design`; `interactionReport(bid, ask)
 * .daimonLoci` are the `⊤`-collision loci — the give-up points where the deal
 * settles — projected to their locus-address keys for the bare-`$id` carrier.
 */
export declare function fill(bid: Design, ask: Design): Fill;
/** exchange — build the static `⊗ ⊣ ⊸` cut over a give/get commodity pair. */
export declare const exchangeAction: Action;
/** fuse — combine a bid (positive) and ask (negative) design into the cut, un-eliminated. */
export declare const fuseAction: Action;
/** residuate — read the residuated obligation give ⊸ get of an exchange. */
export declare const residuateAction: Action;
/** cut — eliminate the bid/ask cut into a fill (the settlement of the trade). */
export declare const cutAction: Action;
/** The exchange module's verbs: the static cut, its fusion/residuum, and cut-elimination. */
export declare const exchangeActions: readonly Action[];
//# sourceMappingURL=exchange.d.mts.map