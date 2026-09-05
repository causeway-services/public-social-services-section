/**
 * accounting - accounting records as organizing record-state utterances.
 *
 * This is the structural, relational part of the old animating-experimental
 * accounting substrate: normalize boundary-shaped accounting entries into a
 * finite utterance projection. Exact-number arithmetic and conservation checks
 * stay out of this module until the numeric IR can carry them faithfully.
 */
import { type JsonRecord, type JsonValue, type UtteranceCarrier } from "@emsenn/relating";
import type { AccountingEntry } from "./schemas.mjs";
import type { AccountingUtterances } from "./schemas.mjs";
export type { AccountingEntry } from "./schemas.mjs";
export type { AccountingUtterances } from "./schemas.mjs";
export declare const ACCOUNTING_PREDICATES: Readonly<{
    kind: "organizing.accounting.kind";
    date: "organizing.accounting.date";
    time: "organizing.accounting.time";
    flag: "organizing.accounting.flag";
    payee: "organizing.accounting.payee";
    narration: "organizing.accounting.narration";
    code: "organizing.accounting.code";
    sourceFile: "organizing.accounting.source-file";
    sourceLine: "organizing.accounting.source-line";
    posting: "organizing.accounting.posting";
    account: "organizing.accounting.account";
    amount: "organizing.accounting.amount";
    numerator: "organizing.accounting.numerator";
    denominator: "organizing.accounting.denominator";
    commodity: "organizing.accounting.commodity";
    cost: "organizing.accounting.cost";
    costKind: "organizing.accounting.cost-kind";
    price: "organizing.accounting.price";
    priceKind: "organizing.accounting.price-kind";
    balanceAssertion: "organizing.accounting.balance-assertion";
    sole: "organizing.accounting.sole";
    tag: "organizing.accounting.tag";
    link: "organizing.accounting.link";
    meta: "organizing.accounting.meta";
    directive: "organizing.accounting.directive";
    openAccount: "organizing.accounting.open-account";
    closeAccount: "organizing.accounting.close-account";
    booking: "organizing.accounting.booking";
    padAccount: "organizing.accounting.pad-account";
    tolerance: "organizing.accounting.tolerance";
    optionKey: "organizing.accounting.option-key";
    optionValue: "organizing.accounting.option-value";
    includePath: "organizing.accounting.include-path";
    includeResolved: "organizing.accounting.include-resolved";
    includeError: "organizing.accounting.include-error";
    malformedRaw: "organizing.accounting.malformed-raw";
    malformedReason: "organizing.accounting.malformed-reason";
}>;
export type AccountingTerm = readonly ["accounting", string, string];
type Amount = Readonly<{
    num: string;
    den: string;
    commodity: string;
}>;
type Posting = Readonly<{
    account: string;
    amount: Amount | null;
    cost: Readonly<{
        kind: "per-unit" | "total";
        amount: Amount | null;
        date?: string;
        label?: string;
    }> | null;
    price: Readonly<{
        kind: "@" | "@@";
        amount: Amount;
    }> | null;
    balanceAssertion: Readonly<{
        amount: Amount;
        sole?: boolean;
    }> | null;
    meta: JsonRecord;
}>;
/** The finite utterance projection of one exact amount. */
export declare function amountUtterances(amount: Amount): readonly UtteranceCarrier[];
/** The finite utterance projection of one transaction posting. */
export declare function postingUtterances(posting: Posting): readonly UtteranceCarrier[];
/** The finite utterance projection of a transaction. */
export declare function transactionUtterances(transaction: JsonRecord): readonly UtteranceCarrier[];
/** The finite utterance projection of an accounting directive. */
export declare function directiveUtterances(directive: JsonRecord): readonly UtteranceCarrier[];
/** The finite utterance projection of a malformed journal record. */
export declare function malformedUtterances(malformed: JsonRecord): readonly UtteranceCarrier[];
/** Normalize any accounting entry to its finite relating utterance projection. */
export declare function accountingUtterances(entry: AccountingEntry): AccountingUtterances;
/** Normalize a journal to relating utterances, preserving entry order. */
export declare function journalUtterances(entries: readonly AccountingEntry[]): AccountingUtterances;
export declare function admitAccountingInput(input: JsonValue, verb: string): AccountingEntry | readonly AccountingEntry[];
export declare function accountingInputUtterances(input: AccountingEntry | readonly AccountingEntry[]): AccountingUtterances;
//# sourceMappingURL=accounting.d.mts.map