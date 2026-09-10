/**
 * accounting/topology/financial — generic financial-entity meme-topology carrier.
 *
 * WAVE-0 ported topology carrier. This module is the value-free spine reused by
 * every later stage's predications: it models *knowledge about* finances as a
 * meme-topology over relating's descent engine (term → predicate → utterance →
 * induce → section → charge), and nothing more. Quantities (price, amount, qty)
 * ride elsewhere as provenance; they are never kernel evidence here, so no money
 * type (`@emsenn/relating/analysis` Rational / GradedRational) is imported into
 * this layer. The topology is the value-free skeleton over which the §4 descent
 * (commodity=charge → exchange=cut → value-form → conservation → price=consensus
 * → market=CGS → valuation → capital=reseed → institution) is hung — see
 * dev/docs/notes/2026-06-22-trading-as-settling-over-value-categories.md §7
 * ("topology carriers … already the relating idiom; keep, rewire onto faces").
 *
 * Three layers:
 *   term constructors      — namespaced strings for financial entities
 *   utterance constructors — financial relationships claimed as utterances
 *   FinancialTopologyCarrier — financial utterances with their settlement and
 *                              fixed-point readings, plus the section reads on top
 *
 * Denial-free law (the anti-fetishism rule, content/CLAUDE.md): evidence enters
 * ONLY by articulating utterances; there is no denial and no polarity flip. A
 * contrary fact — a closed position, a reversed transfer — is its OWN predicate
 * cell (`closed-position`, `transfer-reversed-to`), an independent claim, never a
 * negative charge aimed at the original claim. Contradiction therefore surfaces
 * only as the bilattice's settled charge over genuinely conflicting utterances,
 * not as a hand-stamped sign.
 *
 * No codec imports; this library models knowledge about finances, not wire
 * encoding. Hive, stock, crypto, and fiat positions are all specializations of
 * the generic model here.
 *
 * Ported VERBATIM from the pre-rebuild src/financial/{financial-topology,
 * financial-section}.mts (already in relating's idiom); only the cross-file
 * package-internal import paths were collapsed into this single module.
 */
import { utterance, mark, token, claim, predicateOfClaim, sectionOf, predicationsFor, subjectsFor, chargeAtValues, } from "@emsenn/relating";
import { fixedPointReadingsOfUtterances, settleUtterances } from "./settle-utterances.mjs";
const financialTerm = (value) => token(mark(value));
const financialPredicate = (value) => predicateOfClaim(claim(mark(value)));
const predicateMarkValue = (predicate) => predicate.mark.value;
// ---------- term constructors ----------
/** Namespaced mark for a financial entity (person, org, protocol): "financial.entity.<id>" */
export function financialEntityTerm(id) {
    return financialTerm(`financial.entity.${id}`);
}
/** Namespaced mark for a financial account: "financial.account.<id>" */
export function financialAccountTerm(id) {
    return financialTerm(`financial.account.${id}`);
}
/** Namespaced mark for a commodity/currency/token: "financial.commodity.<symbol>" */
export function financialCommodityTerm(symbol) {
    return financialTerm(`financial.commodity.${symbol}`);
}
/** Namespaced mark for a financial position (an account's holding in a commodity): "financial.position.<accountId>.<symbol>" */
export function financialPositionTerm(accountId, symbol) {
    return financialTerm(`financial.position.${accountId}.${symbol}`);
}
/** Namespaced mark for a flow between two accounts: "financial.flow.<fromId>.<toId>" */
export function financialFlowTerm(fromId, toId) {
    return financialTerm(`financial.flow.${fromId}.${toId}`);
}
// ---------- standard predicate terms ----------
export function holdsPositionPredicate() { return financialPredicate("financial.holds-position"); }
/** Contrary of holds-position: the position is closed. Its own claim, not a denial. */
export function closedPositionPredicate() { return financialPredicate("financial.closed-position"); }
export function denominatedInPredicate() { return financialPredicate("financial.denominated-in"); }
export function ownedByPredicate() { return financialPredicate("financial.owned-by"); }
export function transferredToPredicate() { return financialPredicate("financial.transferred-to"); }
/** Contrary of transferred-to: the transfer was reversed. Its own claim, not a denial. */
export function transferReversedToPredicate() { return financialPredicate("financial.transfer-reversed-to"); }
export function hasExposureToPredicate() { return financialPredicate("financial.has-exposure-to"); }
export function isLiquidPredicate() { return financialPredicate("financial.is-liquid"); }
export function isStakedPredicate() { return financialPredicate("financial.is-staked"); }
// ---------- utterance constructors ----------
/** Claim that an account holds a position in a commodity. */
export function holdingUtterance(accountId, symbol) {
    return utterance(mark({ subject: financialAccountTerm(accountId), object: financialCommodityTerm(symbol) }), mark(predicateMarkValue(holdsPositionPredicate())));
}
/** Claim that an account's position in a commodity is closed. */
export function holdingClosedUtterance(accountId, symbol) {
    return utterance(mark({ subject: financialAccountTerm(accountId), object: financialCommodityTerm(symbol) }), mark(predicateMarkValue(closedPositionPredicate())));
}
/** Claim that an account is denominated in a commodity (its base currency). */
export function denominationUtterance(accountId, symbol) {
    return utterance(mark({ subject: financialAccountTerm(accountId), object: financialCommodityTerm(symbol) }), mark(predicateMarkValue(denominatedInPredicate())));
}
/** Claim that an entity owns an account. */
export function ownershipUtterance(entityId, accountId) {
    return utterance(mark({ subject: financialEntityTerm(entityId), object: financialAccountTerm(accountId) }), mark(predicateMarkValue(ownedByPredicate())));
}
/** Claim that value flowed from one account to another. */
export function transferUtterance(fromAccountId, toAccountId) {
    return utterance(mark({ subject: financialAccountTerm(fromAccountId), object: financialAccountTerm(toAccountId) }), mark(predicateMarkValue(transferredToPredicate())));
}
/** Claim that a previously recorded transfer was reversed. */
export function transferReversalUtterance(fromAccountId, toAccountId) {
    return utterance(mark({ subject: financialAccountTerm(fromAccountId), object: financialAccountTerm(toAccountId) }), mark(predicateMarkValue(transferReversedToPredicate())));
}
/** Claim that an entity has exposure to a commodity (risk, not necessarily holding). */
export function exposureUtterance(entityId, symbol) {
    return utterance(mark({ subject: financialEntityTerm(entityId), object: financialCommodityTerm(symbol) }), mark(predicateMarkValue(hasExposureToPredicate())));
}
/** Claim that a position is liquid (can be transferred immediately). */
export function liquidPositionUtterance(accountId, symbol) {
    return utterance(mark({ subject: financialPositionTerm(accountId, symbol), object: financialCommodityTerm(symbol) }), mark(predicateMarkValue(isLiquidPredicate())));
}
/** Claim that a position is staked/locked. */
export function stakedPositionUtterance(accountId, symbol) {
    return utterance(mark({ subject: financialPositionTerm(accountId, symbol), object: financialCommodityTerm(symbol) }), mark(predicateMarkValue(isStakedPredicate())));
}
/** Settle a log of financial utterances into a FinancialTopologyCarrier. */
export function induceFinancialTopology(utterances) {
    const log = Object.freeze([...utterances]);
    const readings = fixedPointReadingsOfUtterances(log);
    return Object.freeze({
        kind: "financial.topology.carrier",
        utterances: log,
        settlement: settleUtterances(log),
        fixedPointReadings: readings,
        readings,
    });
}
/** Apply a delta of new utterances to an existing carrier, returning a new settled carrier. */
export function extendFinancialTopology(carrier, delta) {
    return induceFinancialTopology([...carrier.utterances, ...delta]);
}
// ---------- section reads (financial queries on a settled carrier) ----------
// Thin wrappers over the generic meme-topology section layer with financial term naming.
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
    const subject = token(mark("trading.absent"));
    const predicate = predicateOfClaim(claim(mark("trading.absent")));
    return chargeAtValues({ ...section, entries: [] }, subject, predicate);
};
const chargeByBoundary = (section, subject, predicate) => section.entries.find((entry) => sameBoundary(entry.cell.subject, subject) && sameBoundary(entry.cell.predicate, predicate))?.charge
    ?? emptyCharge(section);
/** Build the knowledge-least section of a FinancialTopologyCarrier. */
export function financialKnowledgeSection(carrier) {
    return sectionOf(carrier.fixedPointReadings.knowledgeLeast);
}
/** Build the truth-least section of a FinancialTopologyCarrier. */
export function financialTruthSection(carrier) {
    return sectionOf(carrier.fixedPointReadings.truthLeast);
}
// ---------- single-cell charge reads ----------
/** Charge at "account holds-position commodity". */
export function holdingCharge(section, accountId, symbol) {
    return chargeByBoundary(section, { subject: financialAccountTerm(accountId), object: financialCommodityTerm(symbol) }, holdsPositionPredicate());
}
/** Charge at "account closed-position commodity" — the contrary predicate of holds-position. */
export function closedPositionCharge(section, accountId, symbol) {
    return chargeByBoundary(section, { subject: financialAccountTerm(accountId), object: financialCommodityTerm(symbol) }, closedPositionPredicate());
}
/** Charge at "account denominated-in commodity". */
export function denominationCharge(section, accountId, symbol) {
    return chargeByBoundary(section, { subject: financialAccountTerm(accountId), object: financialCommodityTerm(symbol) }, denominatedInPredicate());
}
/** Charge at "entity owned-by account". */
export function ownershipCharge(section, entityId, accountId) {
    return chargeByBoundary(section, { subject: financialEntityTerm(entityId), object: financialAccountTerm(accountId) }, ownedByPredicate());
}
/** Charge at "fromAccount transferred-to toAccount". */
export function transferCharge(section, fromAccountId, toAccountId) {
    return chargeByBoundary(section, { subject: financialAccountTerm(fromAccountId), object: financialAccountTerm(toAccountId) }, transferredToPredicate());
}
/** Charge at "fromAccount transfer-reversed-to toAccount" — the contrary predicate of transferred-to. */
export function transferReversedCharge(section, fromAccountId, toAccountId) {
    return chargeByBoundary(section, { subject: financialAccountTerm(fromAccountId), object: financialAccountTerm(toAccountId) }, transferReversedToPredicate());
}
/** Charge at "entity has-exposure-to commodity". */
export function exposureCharge(section, entityId, symbol) {
    return chargeByBoundary(section, { subject: financialEntityTerm(entityId), object: financialCommodityTerm(symbol) }, hasExposureToPredicate());
}
/** Charge at "position is-liquid commodity". */
export function liquidCharge(section, accountId, symbol) {
    return chargeByBoundary(section, { subject: financialPositionTerm(accountId, symbol), object: financialCommodityTerm(symbol) }, isLiquidPredicate());
}
/** Charge at "position is-staked commodity". */
export function stakedCharge(section, accountId, symbol) {
    return chargeByBoundary(section, { subject: financialPositionTerm(accountId, symbol), object: financialCommodityTerm(symbol) }, isStakedPredicate());
}
// ---------- multi-entry section reads ----------
/** All predicates claimed about an account. */
export function financialAccountEntries(section, accountId) {
    const account = financialAccountTerm(accountId);
    return Object.freeze([
        ...predicationsFor(section, account),
        ...section.entries.filter((entry) => {
            const value = entry.cell.subject.mark.value;
            return typeof value === "object"
                && value !== null
                && "subject" in value
                && sameBoundary(value.subject, account);
        }),
    ]);
}
/** All predicates claimed about an entity. */
export function financialEntityEntries(section, entityId) {
    return predicationsFor(section, financialEntityTerm(entityId));
}
/** All accounts that hold any position (subjects of holds-position). */
export function allHoldingAccountEntries(section) {
    return Object.freeze(section.entries.filter((entry) => sameBoundary(entry.cell.predicate, holdsPositionPredicate())));
}
/** All subjects that have transfer flows. */
export function allTransferEntries(section) {
    return Object.freeze(section.entries.filter((entry) => sameBoundary(entry.cell.predicate, transferredToPredicate())));
}
/** All accounts with exposure claims. */
export function allExposureEntries(section) {
    return Object.freeze(section.entries.filter((entry) => sameBoundary(entry.cell.predicate, hasExposureToPredicate())));
}
//# sourceMappingURL=financial.mjs.map