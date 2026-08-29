import { type FromSchema } from "@emsenn/relating/typing";
import { projectStateView, type LogReading, type RWILWitnessLog } from "@emsenn/relating/ledger";
import type { Action } from "@emsenn/relating/running";
import { type EAVTRecord } from "@emsenn/relating/writing";
export declare const monetaryQuantitySchema: {
    readonly $id: "organizing/economy/value/quantity";
    readonly title: "OrganizingValueQuantity";
    readonly description: "A rail-neutral HTTP channel view of exact graded value: signed exact rational plus commodity grade.";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["kind", "num", "den", "commodity"];
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.economy.value.quantity";
        };
        readonly num: {
            readonly type: "integer";
        };
        readonly den: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly commodity: {
            readonly type: "string";
            readonly minLength: 1;
        };
    };
};
export type MonetaryQuantity = FromSchema<typeof monetaryQuantitySchema>;
export declare const monetaryQuantityCarrier: import("@emsenn/relating/typing").Carrier<{
    readonly kind: "organizing.economy.value.quantity";
    readonly num: number;
    readonly den: number;
    readonly commodity: string;
}>;
export declare const x402ChallengeSchema: {
    readonly $id: "organizing/economy/x402/challenge";
    readonly title: "X402Challenge";
    readonly description: "HTTP 402 Payment Required challenge as an organizing-scale value-settlement request.";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["kind", "id", "resource", "payee", "amount", "rails", "issuedAt"];
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.economy.x402.challenge";
        };
        readonly id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly resource: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly payee: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly amount: {
            readonly $ref: "organizing/economy/value/quantity";
        };
        readonly rails: {
            readonly type: "array";
            readonly items: {
                readonly enum: readonly ["x402", "ap2", "l402"];
            };
            readonly minItems: 1;
        };
        readonly issuedAt: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly memo: {
            readonly type: "string";
        };
    };
};
type X402Rail = "x402" | "ap2" | "l402";
export type X402Challenge = Omit<FromSchema<typeof x402ChallengeSchema>, "amount" | "rails"> & {
    readonly amount: MonetaryQuantity;
    readonly rails: readonly X402Rail[];
};
export declare const x402ChallengeCarrier: import("@emsenn/relating/typing").Carrier<{
    readonly kind: "organizing.economy.x402.challenge";
    readonly amount: unknown;
    readonly payee: string;
    readonly id: string;
    readonly resource: string;
    readonly rails: readonly ("x402" | "ap2" | "l402")[];
    readonly issuedAt: string;
    readonly memo?: string;
}>;
export declare const x402PaymentSchema: {
    readonly $id: "organizing/economy/x402/payment";
    readonly title: "X402Payment";
    readonly description: "A membrane-crossing payment authorization responding to an x402/AP2/L402 challenge.";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["kind", "id", "challengeId", "resource", "payer", "payee", "amount", "rail", "authorization", "paidAt"];
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.economy.x402.payment";
        };
        readonly id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly challengeId: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly resource: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly payer: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly payee: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly amount: {
            readonly $ref: "organizing/economy/value/quantity";
        };
        readonly rail: {
            readonly enum: readonly ["x402", "ap2", "l402"];
        };
        readonly authorization: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly paidAt: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly membrane: {
            readonly const: "across";
        };
    };
};
export type X402Payment = Omit<FromSchema<typeof x402PaymentSchema>, "amount" | "rail"> & {
    readonly amount: MonetaryQuantity;
    readonly rail: X402Rail;
};
export declare const x402PaymentCarrier: import("@emsenn/relating/typing").Carrier<{
    readonly kind: "organizing.economy.x402.payment";
    readonly amount: unknown;
    readonly payee: string;
    readonly id: string;
    readonly resource: string;
    readonly challengeId: string;
    readonly payer: string;
    readonly rail: "x402" | "ap2" | "l402";
    readonly authorization: string;
    readonly paidAt: string;
    readonly membrane?: "across";
}>;
export declare const x402ReceiptSchema: {
    readonly $id: "organizing/economy/x402/receipt";
    readonly title: "X402Receipt";
    readonly description: "The witnessed RWIL settlement receipt for an HTTP 402 exchange; debit equals credit.";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["kind", "id", "challengeId", "paymentId", "resource", "payer", "payee", "debit", "credit", "rail", "settledAt", "valueConserved", "witnessLedger"];
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.economy.x402.receipt";
        };
        readonly id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly challengeId: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly paymentId: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly resource: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly payer: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly payee: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly debit: {
            readonly $ref: "organizing/economy/value/quantity";
        };
        readonly credit: {
            readonly $ref: "organizing/economy/value/quantity";
        };
        readonly rail: {
            readonly enum: readonly ["x402", "ap2", "l402"];
        };
        readonly settledAt: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly valueConserved: {
            readonly type: "boolean";
        };
        readonly witnessLedger: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
            };
            readonly minItems: 1;
        };
    };
};
export type X402Receipt = Omit<FromSchema<typeof x402ReceiptSchema>, "debit" | "credit" | "rail" | "witnessLedger"> & {
    readonly debit: MonetaryQuantity;
    readonly credit: MonetaryQuantity;
    readonly rail: X402Rail;
    readonly witnessLedger: readonly EAVTRecord[];
};
export declare const x402ReceiptCarrier: import("@emsenn/relating/typing").Carrier<{
    readonly kind: "organizing.economy.x402.receipt";
    readonly payee: string;
    readonly id: string;
    readonly resource: string;
    readonly challengeId: string;
    readonly payer: string;
    readonly rail: "x402" | "ap2" | "l402";
    readonly paymentId: string;
    readonly debit: unknown;
    readonly credit: unknown;
    readonly settledAt: string;
    readonly valueConserved: boolean;
    readonly witnessLedger: readonly Record<string, unknown>[];
}>;
export interface PaymentOptions {
    readonly id?: string;
    readonly payer: string;
    readonly rail?: X402Rail;
    readonly authorization: string;
    readonly paidAt?: string;
}
export interface ReceiptOptions {
    readonly id?: string;
    readonly settledAt?: string;
}
export declare function quantity(num: number, den: number, commodity: string): MonetaryQuantity;
export declare function valueQuantityView(num: number, den: number, commodity: string): MonetaryQuantity;
export declare function paymentFromChallenge(challenge: X402Challenge, options: PaymentOptions): X402Payment;
export declare function valueConserved(debit: MonetaryQuantity, credit: MonetaryQuantity): boolean;
export declare function receiptFromPayment(challenge: X402Challenge, payment: X402Payment, options?: ReceiptOptions): X402Receipt;
export declare function receiptLedgerState(receipt: X402Receipt): ReturnType<typeof projectStateView>;
export declare function isWitnessedExchange(receipt: X402Receipt): boolean;
/**
 * witnessLogFromReceipt — read an x402 receipt as its ordered RWIL witness log.
 */
export declare function witnessLogFromReceipt(receipt: X402Receipt): RWILWitnessLog;
/**
 * receiptFromWitnessLog — reconstruct or envelope an x402 receipt around a log.
 *
 * Logs produced by `receiptFromPayment` reconstruct the settlement receipt. Any
 * other ordered RWIL log is still a valid receipt wire because x402 receipts
 * carry `witnessLedger` as the protocol evidence field.
 */
export declare function receiptFromWitnessLog(log: RWILWitnessLog): X402Receipt;
export declare const x402ReceiptLogReading: LogReading<X402Receipt>;
export declare const x402PaymentAction: Action;
export declare const x402ReceiptAction: Action;
export declare const x402Actions: readonly Action[];
export {};
//# sourceMappingURL=index.d.mts.map