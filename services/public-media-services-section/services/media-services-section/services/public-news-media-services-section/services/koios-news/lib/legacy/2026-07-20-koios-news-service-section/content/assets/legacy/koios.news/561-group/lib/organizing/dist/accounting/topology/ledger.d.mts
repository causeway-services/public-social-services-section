/**
 * @emsenn/organizing/accounting/topology/ledger — double-entry bookkeeping as a meme-topology carrier.
 *
 * Ported (wave-0) from the current `src/ledger/ledger-topology.mts` +
 * `src/ledger/ledger-section.mts`, folded onto the rebuilt `topology/financial.mts`
 * base. This specializes the financial-topology carrier for the double-entry
 * accounting domain (authority note §4 stage 4 — "conservation = double-entry":
 * every debit a credit, the articulation is conserved), keeping the carrier a
 * settled meme-topology over articulated utterances:
 *
 *   term constructors      — namespaced marks for ledger accounts / transactions /
 *                            commodities / tree roots
 *   utterance constructors — the double-entry conventions claimed as utterances
 *                            (debit-/credit-normal balance, open/closed, sub-account,
 *                            transaction participation, reconciled)
 *   LedgerTopologyCarrier  — a FinancialTopologyCarrier specialized to the ledger
 *                            domain, carrying its settlement filtration and the
 *                            meme-topology fixed-point readings
 *   section readers        — the knowledge-/truth-least sections and per-cell
 *                            charge / per-subject entry queries on them
 *
 * Anti-fetishism law (authority note §1; CLAUDE.md "no free data past Mark"):
 * a ledger fact is never primitive data on the carrier. An account's normal
 * balance, its open/closed standing, a posting's reconciliation — each is the
 * settled image of a predication among agents, read back as a ChargeValue from
 * the section, never stored as a free field. Evidence enters only by articulating
 * utterances; there is no denial. A *closed* account is its own claim of the
 * contrary predicate (`is-closed`), never a polarity against `is-open`; this is
 * what lets `institution/index` read a Desk's H¹ (the unbalanced/unconserved
 * obstruction) directly off the booked accounts via `debitNormalUtterance`.
 *
 * Exact money and the conservation (every-debit-a-credit ⟺ ker ∂) live in
 * `@emsenn/relating/analysis` (Rational + conservation); they are consumed by the
 * postings/desk layer, not here — this module models *knowledge about* a ledger's
 * structure, not the amounts. No codec imports: use `@emsenn/computing-with-ledgers`
 * to parse beancount/hledger text into entries at the observe edge, then build
 * utterances from those entries.
 */
import { type UtteranceCarrier, type PredicationPredicate, type PredicationTerm, type ChargeValue, type SectionCarrier, type SectionEntry } from "@emsenn/relating";
import { financialAccountTerm, type FinancialTopologyCarrier } from "./financial.mjs";
export type { UtteranceCarrier, PredicationTerm as TermInput, FinancialTopologyCarrier };
export type { SectionCarrier, SectionEntry, ChargeValue };
export { financialAccountTerm };
/** Namespaced mark for a ledger account: "ledger.account.<path>" (e.g. "Assets:Cash"). */
export declare function ledgerAccountTerm(path: string): PredicationTerm;
/** Namespaced mark for a ledger transaction: "ledger.transaction.<id>". */
export declare function ledgerTransactionTerm(id: string): PredicationTerm;
/** Namespaced mark for a ledger commodity: "ledger.commodity.<symbol>". */
export declare function ledgerCommodityTerm(symbol: string): PredicationTerm;
/** Namespaced mark for an account-tree path: "ledger.tree.<root>". */
export declare function ledgerTreeTerm(root: string): PredicationTerm;
export declare function isDebitNormalPredicate(): PredicationPredicate;
export declare function isCreditNormalPredicate(): PredicationPredicate;
export declare function participatesInPredicate(): PredicationPredicate;
export declare function isOpenPredicate(): PredicationPredicate;
/** Contrary of is-open: the account is closed. Its own claim, not a denial. */
export declare function isClosedPredicate(): PredicationPredicate;
export declare function isSubAccountOfPredicate(): PredicationPredicate;
export declare function isReconciledPredicate(): PredicationPredicate;
/**
 * Claim that an account uses the debit-normal balance convention (Assets, Expenses).
 *
 * This is the constructor `institution/index` uses to read a Desk's H¹ off the
 * booked accounts: the normal-balance convention is what orients each posting in
 * the conservation reading (debit-normal accounts increase on the debit side), so
 * the unconserved residue (H¹ ≠ 0 ⟺ books that do not balance) is read against
 * these claims. SIGNATURE FIXED — `debitNormalUtterance(account: string)`.
 */
export declare function debitNormalUtterance(account: string): UtteranceCarrier;
/** Claim that an account uses the credit-normal balance convention (Liabilities, Equity, Income). */
export declare function creditNormalUtterance(account: string): UtteranceCarrier;
/** Claim that an account is open (can receive postings). */
export declare function accountOpenedUtterance(account: string): UtteranceCarrier;
/** Claim that an account is closed. The contrary claim to is-open, in its own right. */
export declare function accountClosedUtterance(account: string): UtteranceCarrier;
/** Claim that account `child` is a sub-account of account `parent` (e.g. Assets:Cash is sub of Assets). */
export declare function subAccountUtterance(parent: string, child: string): UtteranceCarrier;
/** Claim that an account participates in a transaction (a posting edge of the transaction). */
export declare function transactionParticipantUtterance(transactionId: string, account: string): UtteranceCarrier;
/** Claim that an account's posting in a transaction is reconciled. */
export declare function reconciledUtterance(account: string, transactionId: string): UtteranceCarrier;
/**
 * A double-entry ledger carrier: a FinancialTopologyCarrier specialized to the
 * ledger domain. It is settled by the same meme-topology engine as its financial
 * base (`induceFinancialTopology`), so its `settlement` filtration and `readings`
 * fixed points are read with the identical section machinery; only the `kind`
 * discriminator and the booked vocabulary differ.
 */
export interface LedgerTopologyCarrier extends FinancialTopologyCarrier {
    readonly kind: string;
}
/** Settle a log of ledger utterances into a LedgerTopologyCarrier. */
export declare function induceLedgerTopology(utterances: readonly UtteranceCarrier[]): LedgerTopologyCarrier;
/** Apply a delta of new utterances to an existing carrier, returning a new settled carrier. */
export declare function extendLedgerTopology(carrier: LedgerTopologyCarrier, delta: readonly UtteranceCarrier[]): LedgerTopologyCarrier;
/** Build the knowledge-least section of a LedgerTopologyCarrier. */
export declare function ledgerKnowledgeSection(carrier: LedgerTopologyCarrier): SectionCarrier;
/** Build the truth-least section of a LedgerTopologyCarrier. */
export declare function ledgerTruthSection(carrier: LedgerTopologyCarrier): SectionCarrier;
/** Charge at "account is-debit-normal". */
export declare function debitNormalCharge(section: SectionCarrier, account: string): ChargeValue;
/** Charge at "account is-credit-normal". */
export declare function creditNormalCharge(section: SectionCarrier, account: string): ChargeValue;
/** Charge at "account is-open". */
export declare function accountOpenCharge(section: SectionCarrier, account: string): ChargeValue;
/** Charge at "account is-closed" — the contrary claim to is-open, read in its own cell. */
export declare function accountClosedCharge(section: SectionCarrier, account: string): ChargeValue;
/** Charge at "account participates-in transaction". */
export declare function participantCharge(section: SectionCarrier, account: string, transactionId: string): ChargeValue;
/** Charge at "child is-sub-account-of parent". */
export declare function subAccountCharge(section: SectionCarrier, child: string, parent: string): ChargeValue;
/** Charge at "account is-reconciled for transaction". */
export declare function reconciledCharge(section: SectionCarrier, account: string, transactionId: string): ChargeValue;
/** All predicates claimed about an account. */
export declare function ledgerAccountEntries(section: SectionCarrier, account: string): readonly SectionEntry[];
/** All accounts that have the debit-normal convention. */
export declare function allDebitNormal(section: SectionCarrier): readonly SectionEntry[];
/** All accounts that have the credit-normal convention. */
export declare function allCreditNormal(section: SectionCarrier): readonly SectionEntry[];
/** All accounts claimed open. */
export declare function allOpen(section: SectionCarrier): readonly SectionEntry[];
/** All accounts claimed closed — the contrary predicate's cells, not a denied bucket. */
export declare function allClosed(section: SectionCarrier): readonly SectionEntry[];
/** All account postings that participate in any transaction. */
export declare function allTransactionParticipantAccountEntries(section: SectionCarrier): readonly SectionEntry[];
//# sourceMappingURL=ledger.d.mts.map