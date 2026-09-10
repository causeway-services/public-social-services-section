/**
 * accounting/topology/market — venue-generic market record-state topology.
 *
 * The market topology is economic record-state: venues list books, orders bid
 * or ask, fills execute, quotes observe, and known owners glue back to generic
 * financial accounts. The market *game* lives in `@emsenn/gaming/market`; this
 * module owns the organizing-scale topology those game/social/computing faces
 * can read.
 *
 * Venue-generic exchange structure: a venue lists books (trading pairs), orders
 * bid or ask on books, fills execute on books, quotes observe books. Venue
 * specializations bind these terms to real chains and exchanges. Accounts, when
 * an order's owner is known, are `./financial.mts` accounts — so a market carrier
 * is a specialization of `FinancialTopologyCarrier` and merges with financial,
 * chain, and ledger carriers.
 *
 * Anti-fetishism law (CLAUDE.md "no free data"; note §1). Evidence enters ONLY by
 * articulating utterances, and a charge is the section of a settling over a
 * society, never a property of a thing. There is no denial: a contrary market
 * fact is its own claim of a contrary predicate — delisted, bid-ended, ask-ended
 * — never a polarity against the original claim.
 *
 * The value-free topology law. Quantities do NOT live in the topology. Prices and
 * sizes ride as exact decimal strings in `MarketProvenance`, carried in this
 * package's `ProvenancedUtterance` structure BESIDE the utterance — provenance is
 * never kernel evidence. Quantities are exact decimals (rendered/parsed at the
 * edge), never floats and never charge on the carrier; the quantitative laws over
 * book data are exact-rational arithmetic in the microstructure/computing readings.
 */
import { type UtteranceCarrier, type PredicationPredicate, type PredicationTerm, type SectionCarrier, type SectionEntry, type ChargeCarrier } from "@emsenn/relating";
import { type MemeTopologyFixedPointReadings, type SettlementFiltration } from "@emsenn/relating";
import { financialAccountTerm, type FinancialTopologyCarrier } from "./financial.mjs";
export { financialAccountTerm };
export type { UtteranceCarrier, PredicationTerm as TermInput, FinancialTopologyCarrier, SectionCarrier, SectionEntry, ChargeCarrier, };
/**
 * The provenance shape market utterances are expected to ride with. All
 * quantities are exact decimal strings, never floats. Prices are stated in the
 * book's quote commodity per one unit of its base commodity. This rides BESIDE
 * the utterance and is never kernel evidence on the carrier.
 */
export interface MarketProvenance {
    readonly source: string;
    readonly timestamp?: string;
    readonly price?: string;
    readonly quantity?: string;
    readonly bid?: string;
    readonly ask?: string;
    readonly last?: string;
}
/** An utterance with its market provenance carried beside it — package
 *  structure, never kernel evidence. */
export interface ProvenancedUtterance {
    readonly kind: "market-topology.provenancedUtterance";
    readonly utterance: UtteranceCarrier;
    readonly provenance: MarketProvenance;
}
/** Pair an utterance with its market provenance. */
export declare function provenancedUtterance(utteranceCarrier: UtteranceCarrier, provenance: MarketProvenance): ProvenancedUtterance;
/** Namespaced mark for a market venue: "market.venue.<id>" */
export declare function marketVenueTerm(venueId: string): PredicationTerm;
/** Namespaced mark for a book (trading pair at a venue): "market.book.<venue>.<BASE>/<QUOTE>" */
export declare function marketBookTerm(venueId: string, baseSymbol: string, quoteSymbol: string): PredicationTerm;
/** Namespaced mark for an order at a venue: "market.order.<venue>.<id>" */
export declare function marketOrderTerm(venueId: string, orderId: string): PredicationTerm;
/** Namespaced mark for a fill (executed trade) at a venue: "market.fill.<venue>.<id>" */
export declare function marketFillTerm(venueId: string, fillId: string): PredicationTerm;
/** Namespaced mark for a quote observation at a venue: "market.quote.<venue>.<id>" */
export declare function marketQuoteTerm(venueId: string, quoteId: string): PredicationTerm;
export declare function marketListsPredicate(): PredicationPredicate;
export declare function marketDelistedPredicate(): PredicationPredicate;
export declare function marketBidsPredicate(): PredicationPredicate;
export declare function marketBidEndedPredicate(): PredicationPredicate;
export declare function marketAsksPredicate(): PredicationPredicate;
export declare function marketAskEndedPredicate(): PredicationPredicate;
export declare function marketPlacedPredicate(): PredicationPredicate;
export declare function marketFilledOnPredicate(): PredicationPredicate;
export declare function marketQuotesPredicate(): PredicationPredicate;
/** Claim that a venue lists a book. */
export declare function marketListedUtterance(venueId: string, baseSymbol: string, quoteSymbol: string): UtteranceCarrier;
/** Claim that a venue delisted a book — its own claim, not a denial of the listing. */
export declare function marketDelistedUtterance(venueId: string, baseSymbol: string, quoteSymbol: string): UtteranceCarrier;
/** Claim that an order bids on a book (buy side / proponent polarity). */
export declare function marketBidUtterance(venueId: string, baseSymbol: string, quoteSymbol: string, orderId: string): UtteranceCarrier;
/** Claim that an order's bid on a book ended (filled, cancelled, or expired)
 *  — its own claim, not a denial of the bid. */
export declare function marketBidEndedUtterance(venueId: string, baseSymbol: string, quoteSymbol: string, orderId: string): UtteranceCarrier;
/** Claim that an order asks on a book (sell side / opponent polarity). */
export declare function marketAskUtterance(venueId: string, baseSymbol: string, quoteSymbol: string, orderId: string): UtteranceCarrier;
/** Claim that an order's ask on a book ended (filled, cancelled, or expired)
 *  — its own claim, not a denial of the ask. */
export declare function marketAskEndedUtterance(venueId: string, baseSymbol: string, quoteSymbol: string, orderId: string): UtteranceCarrier;
/** Claim that an account placed an order (when the owner is known). The subject
 *  is a `./financial.mts` account, gluing market and financial carriers. */
export declare function marketOrderPlacedUtterance(account: string, venueId: string, orderId: string): UtteranceCarrier;
/** Claim that a fill executed on a book. Fills are events; no contrary fact exists. */
export declare function marketFillUtterance(venueId: string, baseSymbol: string, quoteSymbol: string, fillId: string): UtteranceCarrier;
/** Claim that a quote was observed on a book. Staleness is the reader's judgment, not the carrier's. */
export declare function marketQuoteUtterance(venueId: string, baseSymbol: string, quoteSymbol: string, quoteId: string): UtteranceCarrier;
/**
 * A settled market topology. Specializes `FinancialTopologyCarrier` (so market
 * carriers compose with financial/chain/ledger carriers) and re-tags `kind` to
 * the market discriminator.
 */
export interface MarketTopologyCarrier extends FinancialTopologyCarrier {
    readonly kind: "market.topology.carrier";
    readonly utterances: readonly UtteranceCarrier[];
    readonly settlement: SettlementFiltration;
    readonly fixedPointReadings: MemeTopologyFixedPointReadings;
    readonly _marketTopologyBrand: never;
}
/** Induce a settled MarketTopologyCarrier from an utterance log. */
export declare function induceMarketTopology(utterances: readonly UtteranceCarrier[]): MarketTopologyCarrier;
/** Extend an existing MarketTopologyCarrier with new utterances. */
export declare function extendMarketTopology(carrier: MarketTopologyCarrier, delta: readonly UtteranceCarrier[]): MarketTopologyCarrier;
/** Build the knowledge-least section of a MarketTopologyCarrier. */
export declare function marketKnowledgeSection(carrier: MarketTopologyCarrier): SectionCarrier;
/** Build the truth-least section of a MarketTopologyCarrier. */
export declare function marketTruthSection(carrier: MarketTopologyCarrier): SectionCarrier;
/** Charge at "venue lists book". */
export declare function marketListedCharge(section: SectionCarrier, venueId: string, baseSymbol: string, quoteSymbol: string): ChargeCarrier;
/** Charge at "venue delisted book" — the contrary claim, its own cell. */
export declare function marketDelistedCharge(section: SectionCarrier, venueId: string, baseSymbol: string, quoteSymbol: string): ChargeCarrier;
/** Charge at "order bids book". */
export declare function marketBidCharge(section: SectionCarrier, venueId: string, baseSymbol: string, quoteSymbol: string, orderId: string): ChargeCarrier;
/** Charge at "order's bid on book ended" — the contrary claim, its own cell. */
export declare function marketBidEndedCharge(section: SectionCarrier, venueId: string, baseSymbol: string, quoteSymbol: string, orderId: string): ChargeCarrier;
/** Charge at "order asks book". */
export declare function marketAskCharge(section: SectionCarrier, venueId: string, baseSymbol: string, quoteSymbol: string, orderId: string): ChargeCarrier;
/** Charge at "order's ask on book ended" — the contrary claim, its own cell. */
export declare function marketAskEndedCharge(section: SectionCarrier, venueId: string, baseSymbol: string, quoteSymbol: string, orderId: string): ChargeCarrier;
/** Charge at "account placed order". */
export declare function marketPlacedCharge(section: SectionCarrier, account: string, venueId: string, orderId: string): ChargeCarrier;
/** Charge at "fill executed on book". */
export declare function marketFillCharge(section: SectionCarrier, venueId: string, baseSymbol: string, quoteSymbol: string, fillId: string): ChargeCarrier;
/** Charge at "quote observed on book". */
export declare function marketQuoteCharge(section: SectionCarrier, venueId: string, baseSymbol: string, quoteSymbol: string, quoteId: string): ChargeCarrier;
/** All predicates claimed of a venue. */
export declare function marketVenueEntries(section: SectionCarrier, venueId: string): readonly SectionEntry[];
/** All predicates claimed of an order. */
export declare function marketOrderEntries(section: SectionCarrier, venueId: string, orderId: string): readonly SectionEntry[];
/** All bid entries. */
export declare function marketAllBidEntries(section: SectionCarrier): readonly SectionEntry[];
/** All ask entries. */
export declare function marketAllAskEntries(section: SectionCarrier): readonly SectionEntry[];
/** All fill entries. */
export declare function marketAllFillEntries(section: SectionCarrier): readonly SectionEntry[];
/** All quote entries. */
export declare function marketAllQuoteEntries(section: SectionCarrier): readonly SectionEntry[];
//# sourceMappingURL=market.d.mts.map