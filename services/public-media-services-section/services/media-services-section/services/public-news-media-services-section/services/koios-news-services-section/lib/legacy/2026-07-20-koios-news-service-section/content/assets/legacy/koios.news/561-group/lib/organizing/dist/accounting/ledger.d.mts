import type { MemeTopologyFixedPointReadings, SectionCarrier, SectionEntry, UtteranceCarrier } from "@emsenn/relating";
import { type Money } from "@emsenn/relating/economy";
export declare function fixedPointReadingsOfUtterances(utterances: readonly UtteranceCarrier[]): MemeTopologyFixedPointReadings;
/** A brace cost: per-unit `{}` or total `{{}}`. `amount` null = empty lot `{}` (= face). */
export interface Cost {
    readonly kind: "per-unit" | "total";
    readonly amount: Money | null;
    readonly date?: string;
    readonly label?: string;
}
/** A price annotation: per-unit `@` or total `@@`. */
export interface Price {
    readonly kind: "@" | "@@";
    readonly amount: Money;
}
/** An inline balance assertion on a posting line. */
export interface BalanceAssertion {
    readonly amount: Money;
    readonly sole?: boolean;
}
/** Source location: the file and 1-based line where an entry was read. */
export interface Source {
    readonly file: string | null;
    readonly line: number;
}
/** One leg of a transaction: an account, an optional amount (null = elided), plus cost/price/assertion. */
export interface Posting {
    readonly account: string;
    readonly amount: Money | null;
    readonly cost: Cost | null;
    readonly price: Price | null;
    readonly balanceAssertion: BalanceAssertion | null;
    readonly meta: Record<string, unknown>;
}
/** A dated set of postings, expected to balance (held, not thrown, if not). */
export interface Transaction {
    readonly id: string | null;
    readonly date: string;
    readonly time: string | null;
    readonly flag: string | null;
    readonly payee: string | null;
    readonly narration: string;
    readonly postings: readonly Posting[];
    readonly tags: readonly string[];
    readonly links: readonly string[];
    readonly meta: Record<string, unknown>;
    readonly code: string | null;
    readonly source: Source | null;
}
export interface OpenDirective {
    readonly directive: "open";
    readonly date: string | null;
    readonly account: string;
    readonly commodities: readonly string[];
    readonly booking: string | null;
    readonly source: Source | null;
}
export interface CloseDirective {
    readonly directive: "close";
    readonly date: string;
    readonly account: string;
    readonly source: Source | null;
}
export interface CommodityDirective {
    readonly directive: "commodity";
    readonly date: string | null;
    readonly symbol: string;
    readonly precision: number | null;
    readonly meta: Record<string, unknown>;
    readonly source: Source | null;
}
export interface PriceDirective {
    readonly directive: "price";
    readonly date: string;
    readonly commodity: string;
    readonly amount: Money;
    readonly source: Source | null;
}
export interface PadDirective {
    readonly directive: "pad";
    readonly date: string;
    readonly account: string;
    readonly padAccount: string;
    readonly source: Source | null;
}
export interface BalanceDirective {
    readonly directive: "balance";
    readonly date: string;
    readonly account: string;
    readonly amount: Money;
    readonly tolerance: string | null;
    readonly source: Source | null;
}
export interface OptionDirective {
    readonly directive: "option";
    readonly date: null;
    readonly key: string | null;
    readonly value: string | null;
    readonly source: Source | null;
}
export interface IncludeDirective {
    readonly directive: "include";
    readonly date: null;
    readonly path: string | null;
    readonly resolved: boolean;
    readonly error: string | null;
    readonly source: Source | null;
}
export type Directive = OpenDirective | CloseDirective | CommodityDirective | PriceDirective | PadDirective | BalanceDirective | OptionDirective | IncludeDirective;
/** A line that could not be parsed — held rather than thrown. */
export interface Malformed {
    readonly kind: "malformed";
    readonly raw: string;
    readonly reason: string;
    readonly source: Source | null;
}
/** The union of every entry kind that can appear in a loaded journal. */
export type Entry = Transaction | Directive | Malformed;
export declare function posting(params: Readonly<{
    account: string;
    amount?: Money | null | undefined;
    cost?: Cost | null | undefined;
    price?: Price | null | undefined;
    balanceAssertion?: BalanceAssertion | null | undefined;
    meta?: Record<string, unknown> | undefined;
}>): Posting;
export declare function transaction(params: Readonly<{
    id?: string | null | undefined;
    date: string;
    time?: string | null | undefined;
    flag?: string | null | undefined;
    payee?: string | null | undefined;
    narration: string;
    postings: readonly Posting[];
    tags?: readonly string[] | undefined;
    links?: readonly string[] | undefined;
    meta?: Record<string, unknown> | undefined;
    code?: string | null | undefined;
    source?: Source | null | undefined;
}>): Transaction;
export declare function open(params: Readonly<{
    date?: string | null | undefined;
    account: string;
    commodities?: readonly string[] | undefined;
    booking?: string | null | undefined;
    source?: Source | null | undefined;
}>): OpenDirective;
export declare function close(params: Readonly<{
    date: string;
    account: string;
    source?: Source | null | undefined;
}>): CloseDirective;
export declare function commodity(params: Readonly<{
    date?: string | null | undefined;
    symbol: string;
    precision?: number | null | undefined;
    meta?: Record<string, unknown> | undefined;
    source?: Source | null | undefined;
}>): CommodityDirective;
export declare function price(params: Readonly<{
    date: string;
    commodity: string;
    amount: Money;
    source?: Source | null | undefined;
}>): PriceDirective;
export declare function pad(params: Readonly<{
    date: string;
    account: string;
    padAccount: string;
    source?: Source | null | undefined;
}>): PadDirective;
export declare function balance(params: Readonly<{
    date: string;
    account: string;
    amount: Money;
    tolerance?: string | null | undefined;
    source?: Source | null | undefined;
}>): BalanceDirective;
export declare function option(params: Readonly<{
    key?: string | null | undefined;
    value?: string | null | undefined;
    source?: Source | null | undefined;
}>): OptionDirective;
export declare function include(params: Readonly<{
    path?: string | null | undefined;
    source?: Source | null | undefined;
}>): IncludeDirective;
export declare function malformed(params: Readonly<{
    raw: string;
    reason: string;
    source?: Source | null | undefined;
}>): Malformed;
export declare function isTransaction(e: Entry): e is Transaction;
export declare function isDirective(e: Entry): e is Directive;
export declare function isMalformed(e: Entry): e is Malformed;
export interface Registry {
    readonly prec: Map<string, number>;
}
export declare function makeRegistry(): Registry;
export declare function declareCommodity(r: Registry, symbol: string, precision: number): void;
export declare function observe(r: Registry, symbol: string, precision: number): void;
export declare function postingHolding(p: Posting): Money | null;
export declare function inferElided(txn: Transaction, _registry: Registry): Transaction;
export declare function balances(txn: Transaction, _registry: Registry): {
    readonly balanced: boolean;
    readonly residualStrings: readonly string[];
};
export declare function txnId(date: string, ordinal: number): string;
export interface LoadedLedger {
    readonly registry: Registry;
    readonly transactions: readonly Transaction[];
    readonly directives: readonly Directive[];
    readonly malformed: readonly Malformed[];
    readonly synthesized: readonly Transaction[];
    readonly padded: ReadonlySet<string>;
    readonly balances: ReadonlyMap<string, ReadonlyMap<string, Money>>;
    readonly section: SectionCarrier;
    readonly clean: readonly SectionEntry[];
    readonly worklist: readonly SectionEntry[];
}
export declare function runningBalances(transactions: readonly Transaction[], _registry: Registry): Map<string, Map<string, Money>>;
export declare function balanceAt(transactions: readonly Transaction[], _registry: Registry, account: string, commodity: string, date: string): Money;
export default function loadLedger(entries: Entry[]): LoadedLedger;
//# sourceMappingURL=ledger.d.mts.map