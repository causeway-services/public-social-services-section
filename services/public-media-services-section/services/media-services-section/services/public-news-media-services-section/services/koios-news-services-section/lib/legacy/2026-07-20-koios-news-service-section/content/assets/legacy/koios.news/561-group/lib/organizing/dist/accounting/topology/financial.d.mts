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
import { type UtteranceCarrier, type PredicationPredicate, type PredicationTerm, type MemeTopologyFixedPointReadings, type SettlementFiltration, type SectionCarrier, type SectionEntry, type ChargeCarrier } from "@emsenn/relating";
export type { UtteranceCarrier, PredicationTerm as TermInput };
export type { SectionCarrier, SectionEntry, ChargeCarrier };
/** Namespaced mark for a financial entity (person, org, protocol): "financial.entity.<id>" */
export declare function financialEntityTerm(id: string): PredicationTerm;
/** Namespaced mark for a financial account: "financial.account.<id>" */
export declare function financialAccountTerm(id: string): PredicationTerm;
/** Namespaced mark for a commodity/currency/token: "financial.commodity.<symbol>" */
export declare function financialCommodityTerm(symbol: string): PredicationTerm;
/** Namespaced mark for a financial position (an account's holding in a commodity): "financial.position.<accountId>.<symbol>" */
export declare function financialPositionTerm(accountId: string, symbol: string): PredicationTerm;
/** Namespaced mark for a flow between two accounts: "financial.flow.<fromId>.<toId>" */
export declare function financialFlowTerm(fromId: string, toId: string): PredicationTerm;
export declare function holdsPositionPredicate(): PredicationPredicate;
/** Contrary of holds-position: the position is closed. Its own claim, not a denial. */
export declare function closedPositionPredicate(): PredicationPredicate;
export declare function denominatedInPredicate(): PredicationPredicate;
export declare function ownedByPredicate(): PredicationPredicate;
export declare function transferredToPredicate(): PredicationPredicate;
/** Contrary of transferred-to: the transfer was reversed. Its own claim, not a denial. */
export declare function transferReversedToPredicate(): PredicationPredicate;
export declare function hasExposureToPredicate(): PredicationPredicate;
export declare function isLiquidPredicate(): PredicationPredicate;
export declare function isStakedPredicate(): PredicationPredicate;
/** Claim that an account holds a position in a commodity. */
export declare function holdingUtterance(accountId: string, symbol: string): UtteranceCarrier;
/** Claim that an account's position in a commodity is closed. */
export declare function holdingClosedUtterance(accountId: string, symbol: string): UtteranceCarrier;
/** Claim that an account is denominated in a commodity (its base currency). */
export declare function denominationUtterance(accountId: string, symbol: string): UtteranceCarrier;
/** Claim that an entity owns an account. */
export declare function ownershipUtterance(entityId: string, accountId: string): UtteranceCarrier;
/** Claim that value flowed from one account to another. */
export declare function transferUtterance(fromAccountId: string, toAccountId: string): UtteranceCarrier;
/** Claim that a previously recorded transfer was reversed. */
export declare function transferReversalUtterance(fromAccountId: string, toAccountId: string): UtteranceCarrier;
/** Claim that an entity has exposure to a commodity (risk, not necessarily holding). */
export declare function exposureUtterance(entityId: string, symbol: string): UtteranceCarrier;
/** Claim that a position is liquid (can be transferred immediately). */
export declare function liquidPositionUtterance(accountId: string, symbol: string): UtteranceCarrier;
/** Claim that a position is staked/locked. */
export declare function stakedPositionUtterance(accountId: string, symbol: string): UtteranceCarrier;
export interface FinancialTopologyCarrier {
    readonly kind: string;
    readonly utterances: readonly UtteranceCarrier[];
    readonly settlement: SettlementFiltration;
    readonly fixedPointReadings: MemeTopologyFixedPointReadings;
    /** Contract alias for {@link fixedPointReadings} (the meme-topology fixed-point readings). */
    readonly readings: MemeTopologyFixedPointReadings;
    readonly _financialTopologyBrand: never;
}
/** Settle a log of financial utterances into a FinancialTopologyCarrier. */
export declare function induceFinancialTopology(utterances: readonly UtteranceCarrier[]): FinancialTopologyCarrier;
/** Apply a delta of new utterances to an existing carrier, returning a new settled carrier. */
export declare function extendFinancialTopology(carrier: FinancialTopologyCarrier, delta: readonly UtteranceCarrier[]): FinancialTopologyCarrier;
/** Build the knowledge-least section of a FinancialTopologyCarrier. */
export declare function financialKnowledgeSection(carrier: FinancialTopologyCarrier): SectionCarrier;
/** Build the truth-least section of a FinancialTopologyCarrier. */
export declare function financialTruthSection(carrier: FinancialTopologyCarrier): SectionCarrier;
/** Charge at "account holds-position commodity". */
export declare function holdingCharge(section: SectionCarrier, accountId: string, symbol: string): ChargeCarrier;
/** Charge at "account closed-position commodity" — the contrary predicate of holds-position. */
export declare function closedPositionCharge(section: SectionCarrier, accountId: string, symbol: string): ChargeCarrier;
/** Charge at "account denominated-in commodity". */
export declare function denominationCharge(section: SectionCarrier, accountId: string, symbol: string): ChargeCarrier;
/** Charge at "entity owned-by account". */
export declare function ownershipCharge(section: SectionCarrier, entityId: string, accountId: string): ChargeCarrier;
/** Charge at "fromAccount transferred-to toAccount". */
export declare function transferCharge(section: SectionCarrier, fromAccountId: string, toAccountId: string): ChargeCarrier;
/** Charge at "fromAccount transfer-reversed-to toAccount" — the contrary predicate of transferred-to. */
export declare function transferReversedCharge(section: SectionCarrier, fromAccountId: string, toAccountId: string): ChargeCarrier;
/** Charge at "entity has-exposure-to commodity". */
export declare function exposureCharge(section: SectionCarrier, entityId: string, symbol: string): ChargeCarrier;
/** Charge at "position is-liquid commodity". */
export declare function liquidCharge(section: SectionCarrier, accountId: string, symbol: string): ChargeCarrier;
/** Charge at "position is-staked commodity". */
export declare function stakedCharge(section: SectionCarrier, accountId: string, symbol: string): ChargeCarrier;
/** All predicates claimed about an account. */
export declare function financialAccountEntries(section: SectionCarrier, accountId: string): readonly SectionEntry[];
/** All predicates claimed about an entity. */
export declare function financialEntityEntries(section: SectionCarrier, entityId: string): readonly SectionEntry[];
/** All accounts that hold any position (subjects of holds-position). */
export declare function allHoldingAccountEntries(section: SectionCarrier): readonly SectionEntry[];
/** All subjects that have transfer flows. */
export declare function allTransferEntries(section: SectionCarrier): readonly SectionEntry[];
/** All accounts with exposure claims. */
export declare function allExposureEntries(section: SectionCarrier): readonly SectionEntry[];
//# sourceMappingURL=financial.d.mts.map