/**
 * accounting/institution - economic institution and ledger action readings.
 *
 * This is organizing's economic/accounting facade over social gluing. It keeps
 * the generic desk, clearing, netting, Minsky-regime, and ledger report actions
 * in organizing while provider rails remain downstream.
 */
import { type Action, type ClosureRegimeData } from "@emsenn/relating";
import type { Regime } from "@emsenn/socializing";
import { type Adjudication, type Constituent, type Federation, type Institution, type SocialBoundary } from "../organizing.mjs";
import { type Entry, type LoadedLedger } from "./ledger.mjs";
export type { Adjudication, Constituent, Entry, Federation, Institution, LoadedLedger, SocialBoundary };
export interface AccountingDesk {
    readonly kind: "organizing.accounting.desk";
    readonly identity: string;
    readonly cohomologyRank: number;
    readonly glued: boolean;
}
export type MinskyRegime = "hedge" | "speculative" | "ponzi";
export declare function instituteEconomicBody(boundary: SocialBoundary): Institution;
export declare function clearAndSettle(boundary: SocialBoundary): Adjudication;
export declare function net(constituents: readonly Constituent[]): {
    readonly nettingCost: number;
    readonly contested: number;
};
export declare function federateVenues(covers: readonly SocialBoundary[]): Federation;
export declare function minskyRegime(d: ClosureRegimeData): {
    readonly regime: Regime;
    readonly minsky: MinskyRegime;
};
export declare function deskFromLedger(led: LoadedLedger, identity: string): AccountingDesk;
export declare const institutionAction: Action;
export declare const instituteAction: Action;
export declare const adjudicateAction: Action;
export declare const clearAndSettleAction: Action;
export declare const netAction: Action;
export declare const federateVenuesAction: Action;
export declare const federateAction: Action;
export declare const minskyRegimeAction: Action;
export declare const ledgerLoadAction: Action;
export declare const balanceAction: Action;
export declare const balsheetAction: Action;
export declare const incomestmtAction: Action;
export declare const cashflowAction: Action;
export declare const registerAction: Action;
export declare const accountsAction: Action;
export declare const statsAction: Action;
export declare const checkAction: Action;
export declare const printAction: Action;
export declare const settleLedgerAction: Action;
export declare const legacyAccountingInstitutionActions: readonly Action[];
export declare const accountingInstitutionActions: readonly Action[];
//# sourceMappingURL=institution.d.mts.map