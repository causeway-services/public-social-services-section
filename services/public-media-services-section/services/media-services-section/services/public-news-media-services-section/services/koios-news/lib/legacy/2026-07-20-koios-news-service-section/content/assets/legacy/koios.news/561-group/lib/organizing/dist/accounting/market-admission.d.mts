/**
 * organizing/accounting/market-admission — admit an economic order book through
 * gaming's market arena.
 *
 * This is the organizing-owned remnant of the retired `@emsenn/trading` root:
 * an accounting market token is not admitted as free data. Its order book is
 * first read as a gaming concurrent-game arena, then admitted through the
 * `@emsenn/gaming` root.
 */
import { type GamingAdmission } from "@emsenn/gaming";
import { type OrderBook } from "@emsenn/gaming/market";
export type AccountingMarketAction = "accounting.market.admit";
export interface AccountingMarketToken {
    readonly id: string;
    readonly book: OrderBook;
}
export interface AccountingMarketClaim {
    readonly id?: string;
}
export interface AccountingMarketCarrier {
    readonly kind: "organizing.accounting.market.carrier";
    readonly game: GamingAdmission;
    readonly book: OrderBook;
}
export interface AccountingMarketAdmission {
    readonly action: AccountingMarketAction;
    readonly admitted: boolean;
    readonly carrier?: AccountingMarketCarrier;
    readonly game: GamingAdmission;
}
export declare function admitAccountingMarket(token: AccountingMarketToken, claim?: AccountingMarketClaim): AccountingMarketAdmission;
export declare function trade(action: AccountingMarketAction, token: AccountingMarketToken, claim?: AccountingMarketClaim): AccountingMarketAdmission;
//# sourceMappingURL=market-admission.d.mts.map