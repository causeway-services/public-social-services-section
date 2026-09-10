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
import { utterance, mark, token, claim, predicateOfClaim, sectionOf, predicationsFor, chargeAtValues, } from "@emsenn/relating";
import {} from "@emsenn/relating";
import { fixedPointReadingsOfUtterances, settleUtterances } from "./settle-utterances.mjs";
import { financialAccountTerm, } from "./financial.mjs";
export { financialAccountTerm };
const marketTerm = (value) => token(mark(value));
const marketPredicate = (value) => predicateOfClaim(claim(mark(value)));
const predicateMarkValue = (predicate) => predicate.mark.value;
/** Pair an utterance with its market provenance. */
export function provenancedUtterance(utteranceCarrier, provenance) {
    return Object.freeze({
        kind: "market-topology.provenancedUtterance",
        utterance: utteranceCarrier,
        provenance,
    });
}
// ---------- term constructors ----------
/** Namespaced mark for a market venue: "market.venue.<id>" */
export function marketVenueTerm(venueId) {
    return marketTerm(`market.venue.${venueId}`);
}
/** Namespaced mark for a book (trading pair at a venue): "market.book.<venue>.<BASE>/<QUOTE>" */
export function marketBookTerm(venueId, baseSymbol, quoteSymbol) {
    return marketTerm(`market.book.${venueId}.${baseSymbol}/${quoteSymbol}`);
}
/** Namespaced mark for an order at a venue: "market.order.<venue>.<id>" */
export function marketOrderTerm(venueId, orderId) {
    return marketTerm(`market.order.${venueId}.${orderId}`);
}
/** Namespaced mark for a fill (executed trade) at a venue: "market.fill.<venue>.<id>" */
export function marketFillTerm(venueId, fillId) {
    return marketTerm(`market.fill.${venueId}.${fillId}`);
}
/** Namespaced mark for a quote observation at a venue: "market.quote.<venue>.<id>" */
export function marketQuoteTerm(venueId, quoteId) {
    return marketTerm(`market.quote.${venueId}.${quoteId}`);
}
// ---------- predicate terms ----------
export function marketListsPredicate() { return marketPredicate("market.lists"); }
export function marketDelistedPredicate() { return marketPredicate("market.delisted"); }
export function marketBidsPredicate() { return marketPredicate("market.bids"); }
export function marketBidEndedPredicate() { return marketPredicate("market.bid-ended"); }
export function marketAsksPredicate() { return marketPredicate("market.asks"); }
export function marketAskEndedPredicate() { return marketPredicate("market.ask-ended"); }
export function marketPlacedPredicate() { return marketPredicate("market.placed"); }
export function marketFilledOnPredicate() { return marketPredicate("market.filled-on"); }
export function marketQuotesPredicate() { return marketPredicate("market.quotes"); }
// ---------- utterance constructors ----------
//
// bid/ask = the P/O polarity of the exchange (note §4.2): an order bidding is a
// proponent move, an order asking is an opponent move; a fill is cut-elimination.
// Here those are venue-generic predications; the gaming face lifts them to a CGS.
/** Claim that a venue lists a book. */
export function marketListedUtterance(venueId, baseSymbol, quoteSymbol) {
    return utterance(mark({ subject: marketVenueTerm(venueId), object: marketBookTerm(venueId, baseSymbol, quoteSymbol) }), mark(predicateMarkValue(marketListsPredicate())));
}
/** Claim that a venue delisted a book — its own claim, not a denial of the listing. */
export function marketDelistedUtterance(venueId, baseSymbol, quoteSymbol) {
    return utterance(mark({ subject: marketVenueTerm(venueId), object: marketBookTerm(venueId, baseSymbol, quoteSymbol) }), mark(predicateMarkValue(marketDelistedPredicate())));
}
/** Claim that an order bids on a book (buy side / proponent polarity). */
export function marketBidUtterance(venueId, baseSymbol, quoteSymbol, orderId) {
    return utterance(mark({ subject: marketOrderTerm(venueId, orderId), object: marketBookTerm(venueId, baseSymbol, quoteSymbol) }), mark(predicateMarkValue(marketBidsPredicate())));
}
/** Claim that an order's bid on a book ended (filled, cancelled, or expired)
 *  — its own claim, not a denial of the bid. */
export function marketBidEndedUtterance(venueId, baseSymbol, quoteSymbol, orderId) {
    return utterance(mark({ subject: marketOrderTerm(venueId, orderId), object: marketBookTerm(venueId, baseSymbol, quoteSymbol) }), mark(predicateMarkValue(marketBidEndedPredicate())));
}
/** Claim that an order asks on a book (sell side / opponent polarity). */
export function marketAskUtterance(venueId, baseSymbol, quoteSymbol, orderId) {
    return utterance(mark({ subject: marketOrderTerm(venueId, orderId), object: marketBookTerm(venueId, baseSymbol, quoteSymbol) }), mark(predicateMarkValue(marketAsksPredicate())));
}
/** Claim that an order's ask on a book ended (filled, cancelled, or expired)
 *  — its own claim, not a denial of the ask. */
export function marketAskEndedUtterance(venueId, baseSymbol, quoteSymbol, orderId) {
    return utterance(mark({ subject: marketOrderTerm(venueId, orderId), object: marketBookTerm(venueId, baseSymbol, quoteSymbol) }), mark(predicateMarkValue(marketAskEndedPredicate())));
}
/** Claim that an account placed an order (when the owner is known). The subject
 *  is a `./financial.mts` account, gluing market and financial carriers. */
export function marketOrderPlacedUtterance(account, venueId, orderId) {
    return utterance(mark({ subject: financialAccountTerm(account), object: marketOrderTerm(venueId, orderId) }), mark(predicateMarkValue(marketPlacedPredicate())));
}
/** Claim that a fill executed on a book. Fills are events; no contrary fact exists. */
export function marketFillUtterance(venueId, baseSymbol, quoteSymbol, fillId) {
    return utterance(mark({ subject: marketFillTerm(venueId, fillId), object: marketBookTerm(venueId, baseSymbol, quoteSymbol) }), mark(predicateMarkValue(marketFilledOnPredicate())));
}
/** Claim that a quote was observed on a book. Staleness is the reader's judgment, not the carrier's. */
export function marketQuoteUtterance(venueId, baseSymbol, quoteSymbol, quoteId) {
    return utterance(mark({ subject: marketQuoteTerm(venueId, quoteId), object: marketBookTerm(venueId, baseSymbol, quoteSymbol) }), mark(predicateMarkValue(marketQuotesPredicate())));
}
/** Induce a settled MarketTopologyCarrier from an utterance log. */
export function induceMarketTopology(utterances) {
    const log = Object.freeze([...utterances]);
    return Object.freeze({
        kind: "market.topology.carrier",
        utterances: log,
        settlement: settleUtterances(log),
        fixedPointReadings: fixedPointReadingsOfUtterances(log),
    });
}
/** Extend an existing MarketTopologyCarrier with new utterances. */
export function extendMarketTopology(carrier, delta) {
    return induceMarketTopology([...carrier.utterances, ...delta]);
}
// ---------- section layer ----------
//
// Market queries on a settled MarketTopologyCarrier. Thin wrappers over the
// generic meme-topology section layer with market term naming. The charge at a
// cell is the section of the settling — read it, never assign it.
const boundaryValue = (value) => {
    if (typeof value === "object" && value !== null && "kind" in value) {
        if (value.kind === "utterance.token" && "mark" in value)
            return boundaryValue(value.mark instanceof Object && "value" in value.mark ? value.mark.value : undefined);
        if (value.kind === "predication.predicate" && "mark" in value)
            return boundaryValue(value.mark instanceof Object && "value" in value.mark ? value.mark.value : undefined);
    }
    if (typeof value === "object" && value !== null && "subject" in value && "object" in value) {
        return { subject: boundaryValue(value.subject), object: boundaryValue(value.object) };
    }
    return value;
};
const sameBoundary = (left, right) => JSON.stringify(boundaryValue(left)) === JSON.stringify(boundaryValue(right));
const emptyCharge = (section) => {
    const subject = token(mark("organizing.accounting.market.absent"));
    const predicate = predicateOfClaim(claim(mark("organizing.accounting.market.absent")));
    return chargeAtValues({ ...section, entries: [] }, subject, predicate);
};
const chargeByBoundary = (section, subject, predicate) => section.entries.find((entry) => sameBoundary(entry.cell.subject, subject) && sameBoundary(entry.cell.predicate, predicate))?.charge
    ?? emptyCharge(section);
/** Build the knowledge-least section of a MarketTopologyCarrier. */
export function marketKnowledgeSection(carrier) {
    return sectionOf(carrier.fixedPointReadings.knowledgeLeast);
}
/** Build the truth-least section of a MarketTopologyCarrier. */
export function marketTruthSection(carrier) {
    return sectionOf(carrier.fixedPointReadings.truthLeast);
}
// ---------- single-cell charge reads ----------
/** Charge at "venue lists book". */
export function marketListedCharge(section, venueId, baseSymbol, quoteSymbol) {
    return chargeByBoundary(section, { subject: marketVenueTerm(venueId), object: marketBookTerm(venueId, baseSymbol, quoteSymbol) }, marketListsPredicate());
}
/** Charge at "venue delisted book" — the contrary claim, its own cell. */
export function marketDelistedCharge(section, venueId, baseSymbol, quoteSymbol) {
    return chargeByBoundary(section, { subject: marketVenueTerm(venueId), object: marketBookTerm(venueId, baseSymbol, quoteSymbol) }, marketDelistedPredicate());
}
/** Charge at "order bids book". */
export function marketBidCharge(section, venueId, baseSymbol, quoteSymbol, orderId) {
    return chargeByBoundary(section, { subject: marketOrderTerm(venueId, orderId), object: marketBookTerm(venueId, baseSymbol, quoteSymbol) }, marketBidsPredicate());
}
/** Charge at "order's bid on book ended" — the contrary claim, its own cell. */
export function marketBidEndedCharge(section, venueId, baseSymbol, quoteSymbol, orderId) {
    return chargeByBoundary(section, { subject: marketOrderTerm(venueId, orderId), object: marketBookTerm(venueId, baseSymbol, quoteSymbol) }, marketBidEndedPredicate());
}
/** Charge at "order asks book". */
export function marketAskCharge(section, venueId, baseSymbol, quoteSymbol, orderId) {
    return chargeByBoundary(section, { subject: marketOrderTerm(venueId, orderId), object: marketBookTerm(venueId, baseSymbol, quoteSymbol) }, marketAsksPredicate());
}
/** Charge at "order's ask on book ended" — the contrary claim, its own cell. */
export function marketAskEndedCharge(section, venueId, baseSymbol, quoteSymbol, orderId) {
    return chargeByBoundary(section, { subject: marketOrderTerm(venueId, orderId), object: marketBookTerm(venueId, baseSymbol, quoteSymbol) }, marketAskEndedPredicate());
}
/** Charge at "account placed order". */
export function marketPlacedCharge(section, account, venueId, orderId) {
    return chargeByBoundary(section, { subject: financialAccountTerm(account), object: marketOrderTerm(venueId, orderId) }, marketPlacedPredicate());
}
/** Charge at "fill executed on book". */
export function marketFillCharge(section, venueId, baseSymbol, quoteSymbol, fillId) {
    return chargeByBoundary(section, { subject: marketFillTerm(venueId, fillId), object: marketBookTerm(venueId, baseSymbol, quoteSymbol) }, marketFilledOnPredicate());
}
/** Charge at "quote observed on book". */
export function marketQuoteCharge(section, venueId, baseSymbol, quoteSymbol, quoteId) {
    return chargeByBoundary(section, { subject: marketQuoteTerm(venueId, quoteId), object: marketBookTerm(venueId, baseSymbol, quoteSymbol) }, marketQuotesPredicate());
}
// ---------- multi-entry section reads ----------
/** All predicates claimed of a venue. */
export function marketVenueEntries(section, venueId) {
    return predicationsFor(section, marketVenueTerm(venueId));
}
/** All predicates claimed of an order. */
export function marketOrderEntries(section, venueId, orderId) {
    return predicationsFor(section, marketOrderTerm(venueId, orderId));
}
/** All bid entries. */
export function marketAllBidEntries(section) {
    return Object.freeze(section.entries.filter((entry) => sameBoundary(entry.cell.predicate, marketBidsPredicate())));
}
/** All ask entries. */
export function marketAllAskEntries(section) {
    return Object.freeze(section.entries.filter((entry) => sameBoundary(entry.cell.predicate, marketAsksPredicate())));
}
/** All fill entries. */
export function marketAllFillEntries(section) {
    return Object.freeze(section.entries.filter((entry) => sameBoundary(entry.cell.predicate, marketFilledOnPredicate())));
}
/** All quote entries. */
export function marketAllQuoteEntries(section) {
    return Object.freeze(section.entries.filter((entry) => sameBoundary(entry.cell.predicate, marketQuotesPredicate())));
}
//# sourceMappingURL=market.mjs.map