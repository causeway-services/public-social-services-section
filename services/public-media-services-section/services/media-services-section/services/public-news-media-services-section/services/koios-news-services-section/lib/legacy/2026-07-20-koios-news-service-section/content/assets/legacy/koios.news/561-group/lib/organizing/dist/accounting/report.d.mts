/**
 * @emsenn/organizing/accounting/report — the full ledger report suite, the
 * settled readings of the adjudicated accounting record-state (stage 9
 * substrate; the ported double-entry reporting layer of
 * dev/docs/notes/2026-06-22-trading-as-settling-over-value-categories.md §4 stage 9
 * and §7 "double-entry ledger engine → the `organizing` adjudicated record-state;
 * reports = settled readings").
 *
 * A report here is never a computation that mutates the books — it is a *reading* of
 * the already-settled `LoadedLedger` (the cleared record-state `institute`/`adjudicate`
 * formed). Eleven readings, consolidated from the current `src/ledger/report/*` into
 * one module for the rebuild wave:
 *
 *   - **balance / balsheet / incomestmt / cashflow** — the four financial statements,
 *     each a tree-rolled reading of the per-account running balances (cumulative, or
 *     the period delta) over a scoped window.
 *   - **register** — the chronological posting journal with a per-commodity running
 *     total (a bank-statement reading when scoped to one account).
 *   - **accounts / stats** — the structural readings (the account set; the journal
 *     summary, whose distinctive line is the count of HELD ⊤ contradictions).
 *   - **check** — the HEADLINE and the clearest expression of the package's no-halt
 *     thesis. Where beancount/hledger print the FIRST error and exit non-zero (halting
 *     the books), `checkReport` lists EVERY held problem — ⊤ contradictions on the
 *     worklist, failed checks, malformed lines — and **ALWAYS returns `exitCode: 0`**.
 *     The contradictions are carried, not fatal (the §4 anti-fetishism reading: a held
 *     ⊤ is evidence on the carrier, surfaced as a reconciliation worklist, never a
 *     thrown halt). `cohomologyVanishesInRegime`-style "no obstruction ⟹ glued" is the
 *     `ok` line; a non-empty worklist is the carried H¹ residue, still exit 0.
 *   - **print** — render parsed entries back to journal text (beancount/hledger).
 *   - **tree / filter** — the shared scaffolding (the account hierarchy with rolled-up
 *     subtree totals; the pure regex/period selectors).
 *
 * THE ONE DISPLAY RULE (the saturation point). A rational becomes a decimal
 * string ONLY at the render edge, and that edge is
 * `@emsenn/relating/economy` `toDecimalString`: never a float, never an
 * ad-hoc `.toString()`. Every report computes over the layer-1 `Money`
 * carrier, a graded exact rational value.
 *
 * Capability-preserving (CLAUDE.md normalization rule): this ports — never drops — the
 * eleven live readings of the current package; only the money substrate and the display
 * edge are re-homed.
 */
import type { LoadedLedger, Transaction, Entry, Registry } from "./ledger.mjs";
import { type Money } from "@emsenn/relating/economy";
/** fmt — one Money to "1,234.56 USD" (number, a space, then its commodity). */
export declare const fmt: (amount: Money, _registry?: Registry | null) => string;
/** fmtNum — just the number part (no commodity), for columnar layouts. */
export declare const fmtNum: (amount: Money, _registry?: Registry | null) => string;
/** fmtBag — a Map<commodity, Money> to an array of strings, sorted by commodity. Empty bag → []. */
export declare const fmtBag: (bag: ReadonlyMap<string, Money> | null | undefined, registry?: Registry | null) => string[];
/** renderTable — rows of cells to a left-aligned, space-padded monospace table. `align` is
 *  an array of "l"|"r" per column (default left); columns are sized to their widest cell. */
export declare const renderTable: (rows: readonly (readonly string[])[], { align, gap }?: {
    align?: string[] | undefined;
    gap?: number | undefined;
}) => string;
/** indent — n levels of two-space indent. */
export declare const indent: (n: number) => string;
/** toCSV — rows of cells to CSV (quoting cells with commas/quotes/newlines). */
export declare const toCSV: (rows: readonly (readonly string[])[]) => string;
export interface TreeNode {
    readonly name: string;
    readonly segment: string;
    readonly depth: number;
    own: Map<string, Money>;
    total: Map<string, Money>;
    children: Map<string, TreeNode>;
}
/** buildTree — flat per-account balances → the rolled-up account tree. */
export declare function buildTree(balances: ReadonlyMap<string, ReadonlyMap<string, Money>>): TreeNode;
/** walk — visit every node depth-first, children in sorted segment order. */
export declare function walk(root: TreeNode, visit: (node: TreeNode) => void): void;
/** subtree — the immediate child node for a top-level segment (e.g. "Assets"), or null. */
export declare function subtree(root: TreeNode, rootSegment: string): TreeNode | null;
/** filterTransactions — select by account/period/status/payee (each criterion optional). */
export declare function filterTransactions(txns: readonly Transaction[], { account, begin, end, status, payee, }?: {
    account?: string | null;
    begin?: string | null;
    end?: string | null;
    status?: string | string[] | null;
    payee?: string | null;
}): Transaction[];
/** filterBalances — select balances by account regex, optionally collapsing to a max depth. */
export declare function filterBalances(balances: ReadonlyMap<string, ReadonlyMap<string, Money>>, { account, depth }?: {
    account?: string | null;
    depth?: number | null;
}): Map<string, Map<string, Money>>;
/** sumMaps — sum a list of Map<ccy, Money> into one bag. */
export declare function sumMaps(maps: readonly (ReadonlyMap<string, Money> | null | undefined)[]): Map<string, Money>;
/** negateBag — flip the sign of every amount in a bag (e.g. to show Income/Liabilities as positives). */
export declare function negateBag(bag: ReadonlyMap<string, Money> | null | undefined): Map<string, Money>;
/** sectionRows — an indented account/amount table for ONE root subtree, with a subtotal
 *  line. `flip` negates display amounts (Income, Liabilities and Equity read naturally as
 *  positives). */
export declare function sectionRows(root: TreeNode, segment: string, registry: Registry | null, { flip }?: {
    flip?: boolean | undefined;
}): {
    rows: string[][];
    total: Map<string, Money>;
};
/** netRow — a labelled net line from an already-summed bag. */
export declare function netRow(label: string, bag: ReadonlyMap<string, Money>, registry: Registry | null): string[][];
/** balancesCumulative — every posting up to (and including) `end` (or all, if no end). */
export declare function balancesCumulative(led: LoadedLedger, { end }?: {
    end?: string | null;
}): ReadonlyMap<string, ReadonlyMap<string, Money>>;
/** balancesRange — the CHANGE per account over [begin, end]: balance through `end` minus
 *  balance strictly before `begin`. With no bounds it equals the cumulative balances. */
export declare function balancesRange(led: LoadedLedger, { begin, end }?: {
    begin?: string | null;
    end?: string | null;
}): ReadonlyMap<string, ReadonlyMap<string, Money>>;
export interface BalanceReport {
    tree: TreeNode;
}
/** balanceReport — the `bal` reading: cumulative per-account balances, scoped by
 *  account/depth/end, rolled into the account tree. */
export declare function balanceReport(led: LoadedLedger, opts?: {
    account?: string | null;
    depth?: number | null;
    end?: string | null;
}): BalanceReport;
export declare function renderBalance(report: BalanceReport, led: LoadedLedger): string;
export interface BalanceSheetReport {
    tree: TreeNode;
}
export declare function balanceSheetReport(led: LoadedLedger, opts?: {
    end?: string | null;
}): BalanceSheetReport;
export declare function renderBalanceSheet(report: BalanceSheetReport, led: LoadedLedger): string;
export interface IncomeStatementReport {
    tree: TreeNode;
}
export declare function incomeStatementReport(led: LoadedLedger, opts?: {
    begin?: string | null;
    end?: string | null;
}): IncomeStatementReport;
export declare function renderIncomeStatement(report: IncomeStatementReport, led: LoadedLedger): string;
export interface CashflowReport {
    tree: TreeNode;
}
export declare function cashflowReport(led: LoadedLedger, opts?: {
    begin?: string | null;
    end?: string | null;
    account?: string | null;
}): CashflowReport;
export declare function renderCashflow(report: CashflowReport, led: LoadedLedger): string;
interface RegisterRow {
    date: string;
    description: string;
    account: string;
    amount: Money | null;
    total: Money | null;
}
export interface RegisterReport {
    rows: RegisterRow[];
}
export declare function registerReport(led: LoadedLedger, opts?: {
    account?: string | null;
    begin?: string | null;
    end?: string | null;
    status?: string | null;
    payee?: string | null;
}): RegisterReport;
export declare function renderRegister(report: RegisterReport, led: LoadedLedger): string;
export interface AccountsReport {
    accounts: string[];
}
export declare function accountsReport(led: LoadedLedger, { account }?: {
    account?: string | null;
}): AccountsReport;
export declare function renderAccounts(report: AccountsReport): string;
export interface StatsReport {
    transactions: number;
    postings: number;
    accounts: number;
    commodities: number;
    directives: number;
    span: string;
    malformed: number;
    held: number;
    synthesized: number;
}
export declare function statsReport(led: LoadedLedger): StatsReport;
export declare function renderStats(s: StatsReport): string;
interface HeldItem {
    subject: unknown;
    predicate: unknown;
}
interface MalformedItem {
    reason: string;
    raw: string;
    source: unknown;
}
export interface CheckReport {
    ok: boolean;
    contradictions: HeldItem[];
    failures: HeldItem[];
    malformed: MalformedItem[];
    exitCode: 0;
}
export declare function checkReport(led: LoadedLedger): CheckReport;
export declare function renderCheck(r: CheckReport): string;
export declare function printEntries(entries: readonly Entry[], { format: fmtKind }?: {
    format?: string;
}): string;
export interface PrintReport {
    text: string;
}
export declare function printReport(entries: readonly Entry[], opts?: {
    format?: string;
}): PrintReport;
export declare function renderPrint(report: PrintReport): string;
export default balanceReport;
//# sourceMappingURL=report.d.mts.map