/**
 * currency - H1 coordination cost as social currency.
 *
 * This is the generalization that fell out of decide-by-market. A market price is one
 * reading of the socializing consensus limit; the residual spread-H1 is more general:
 * it is the field's coordination premium, a unit the society issues whenever a cell
 * does not glue. In ordinary market language it is spread/adverse selection. In
 * mutual-credit language it is the ledger entry the field owes itself. In Marxian
 * language it is social labor made exchangeable. In the debt/flow line running through
 * the French and Italian 1970s/1980s, it is command, subjectivation, and sign-flow made
 * measurable without collapsing the contradiction.
 *
 * The module intentionally keeps this as a reusable receipt. Today it consumes
 * decide-by-market's preference cells; institutionalization, recognition, mobilization,
 * publics, anomie, boundary-work, and legitimacy can later emit the same cell shape and
 * receive a comparable currency register.
 */
import { type Action, type JsonRecord } from "@emsenn/relating";
import { type MarketSettledGovernance } from "./govern.mjs";
export declare const COORDINATION_CURRENCY_ID = "socializing/currency/coordination";
export type CoordinationCurrencyLens = "money-is-memory" | "mutual-credit" | "exchange-value" | "debt-subjectivation" | "semiotic-flow" | "social-factory";
export type CoordinationCurrencyCellStatus = "settled" | "contested";
export interface CoordinationCurrencyCellInput {
    readonly id?: string;
    readonly source?: string;
    readonly spreadH1: number;
    readonly noArbitrage?: boolean;
    readonly coherentConsensus?: boolean;
    readonly equilibrium?: JsonRecord;
    readonly pooled?: JsonRecord;
}
export interface CoordinationCurrencyCell {
    readonly id: string;
    readonly source: string;
    readonly spreadH1: number;
    readonly issued: number;
    readonly status: CoordinationCurrencyCellStatus;
    readonly noArbitrage: boolean;
    readonly coherentConsensus: boolean;
    readonly equilibrium?: JsonRecord;
    readonly pooled?: JsonRecord;
    readonly lenses: readonly CoordinationCurrencyLens[];
}
export interface CoordinationCurrency {
    readonly kind: "socializing.coordination-currency";
    readonly unit: "h1-coordination-credit";
    readonly cells: readonly CoordinationCurrencyCell[];
    readonly issued: number;
    readonly contested: number;
    readonly settled: number;
    readonly noArbitrage: boolean;
    readonly coherentConsensus: boolean;
    readonly lenses: readonly CoordinationCurrencyLens[];
    readonly theory: JsonRecord;
}
export declare function coordinationCurrency(input: MarketSettledGovernance | readonly CoordinationCurrencyCellInput[]): CoordinationCurrency;
export declare const coordinationCurrencyAction: Action;
//# sourceMappingURL=currency.d.mts.map