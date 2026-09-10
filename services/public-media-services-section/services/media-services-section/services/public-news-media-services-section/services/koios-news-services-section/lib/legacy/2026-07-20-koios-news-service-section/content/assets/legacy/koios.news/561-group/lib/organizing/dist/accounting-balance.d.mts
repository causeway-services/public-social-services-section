import type { AccountingBalance } from "./schemas.mjs";
import type { AccountingEntry, Transaction } from "./schemas.mjs";
export type { AccountingBalance } from "./schemas.mjs";
/** Read whether a transaction conserves in every commodity and infer one elided leg if possible. */
export declare function accountingBalance(entry: AccountingEntry): AccountingBalance;
export declare function admitAccountingTransaction(input: AccountingEntry, verb: string): Transaction;
//# sourceMappingURL=accounting-balance.d.mts.map