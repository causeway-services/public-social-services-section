/**
 * writing/accountable-transaction — organizing's accountability codec for one
 * authorized, invoked, paid, and attested transaction witness.
 *
 * This module does not create a trading kernel. It assembles lower-faculty
 * readings into one organizing-scale record: animating authority, CapTP
 * invocation, playing/WASI execution projection, x402 settlement, and RWIL
 * provenance all cohere over the same witness.
 */
import { type Activity, type Capability, type Delivery, type UcanToken } from "@emsenn/animating";
import { type WasiHandle, type WasiInvocation } from "@emsenn/playing";
import type { ChargeValueName } from "@emsenn/relating";
import { type CoherenceReport, type Reading, type RWILWitness } from "@emsenn/relating/ledger";
import { type FromSchema } from "@emsenn/relating/typing";
import { type Datom, type EAVTRecord } from "@emsenn/relating/writing";
import { type X402Challenge, type X402Payment, type X402Receipt } from "../x402/index.mjs";
export declare const transactionAttestationSchema: {
    readonly $id: "organizing/accountable-transaction/attestation";
    readonly title: "AccountableTransactionAttestation";
    readonly description: "A thin provenance record: a signed Datom over the accountable transaction witness. This is not yet in-toto/SLSA.";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["kind", "subject", "signer", "signedAt", "datom", "signature"];
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.accountable.attestation";
        };
        readonly subject: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly signer: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly signedAt: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly datom: {
            readonly type: "array";
            readonly minItems: 5;
            readonly maxItems: 5;
            readonly items: {};
        };
        readonly signature: {
            readonly type: "string";
            readonly minLength: 1;
        };
    };
};
export type TransactionAttestation = Omit<FromSchema<typeof transactionAttestationSchema>, "datom"> & {
    readonly datom: Datom;
};
export declare const transactionAttestationCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.accountable.attestation";
    readonly subject: string;
    readonly signature: string;
    readonly signer: string;
    readonly signedAt: string;
    readonly datom: readonly unknown[];
}>;
export declare const transactionWitnessSchema: {
    readonly $id: "organizing/accountable-transaction/witness";
    readonly title: "AccountableTransactionWitness";
    readonly description: "One accountable agentic transaction: UCAN/capability authority, CapTP/WASI invocation, x402 settlement, and a thin provenance attestation over one RWIL witness.";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["kind", "id", "witnessedAt", "affordances", "capability", "authorization", "invocation", "settlement"];
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.accountable.transaction.witness";
        };
        readonly id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly witnessedAt: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly affordances: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly capability: {
            readonly type: "object";
        };
        readonly authorization: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["kind", "token"];
            readonly properties: {
                readonly kind: {
                    readonly enum: readonly ["ucan", "capability"];
                };
                readonly token: {
                    readonly type: "object";
                };
            };
        };
        readonly invocation: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["kind", "activity", "captp", "wasi"];
            readonly properties: {
                readonly kind: {
                    readonly const: "organizing.accountable.invocation";
                };
                readonly activity: {
                    readonly type: "object";
                };
                readonly captp: {
                    readonly type: "object";
                };
                readonly wasi: {
                    readonly type: "object";
                };
            };
        };
        readonly settlement: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["kind", "challenge", "paymentClaimed"];
            readonly properties: {
                readonly kind: {
                    readonly const: "organizing.accountable.settlement";
                };
                readonly challenge: {
                    readonly type: "object";
                };
                readonly payment: {
                    readonly type: "object";
                };
                readonly receipt: {
                    readonly type: "object";
                };
                readonly paymentClaimed: {
                    readonly type: "boolean";
                };
            };
        };
        readonly provenance: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["kind"];
            readonly properties: {
                readonly kind: {
                    readonly const: "organizing.accountable.provenance";
                };
                readonly attestation: {
                    readonly $ref: "organizing/accountable-transaction/attestation";
                };
            };
        };
    };
};
export interface TransactionAuthorization {
    readonly kind: "ucan" | "capability";
    readonly token: UcanToken | Capability;
}
export interface TransactionInvocation {
    readonly kind: "organizing.accountable.invocation";
    readonly activity: Activity;
    readonly captp: Delivery;
    readonly wasi: WasiInvocation;
}
export interface TransactionSettlement {
    readonly kind: "organizing.accountable.settlement";
    readonly challenge: X402Challenge;
    readonly payment?: X402Payment;
    readonly receipt?: X402Receipt;
    readonly paymentClaimed: boolean;
}
export interface TransactionProvenance {
    readonly kind: "organizing.accountable.provenance";
    readonly attestation?: TransactionAttestation;
}
export type TransactionWitness = Omit<FromSchema<typeof transactionWitnessSchema>, "affordances" | "capability" | "authorization" | "invocation" | "settlement" | "provenance"> & {
    readonly affordances: readonly string[];
    readonly capability: Capability;
    readonly authorization: TransactionAuthorization;
    readonly invocation: TransactionInvocation;
    readonly settlement: TransactionSettlement;
    readonly provenance?: TransactionProvenance;
};
export declare const transactionWitnessCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.accountable.transaction.witness";
    readonly id: string;
    readonly capability: Record<string, unknown>;
    readonly affordances: readonly string[];
    readonly settlement: {
        readonly kind: "organizing.accountable.settlement";
        readonly challenge: Record<string, unknown>;
        readonly paymentClaimed: boolean;
        readonly receipt?: Record<string, unknown>;
        readonly payment?: Record<string, unknown>;
    };
    readonly authorization: {
        readonly kind: "capability" | "ucan";
        readonly token: Record<string, unknown>;
    };
    readonly witnessedAt: string;
    readonly invocation: {
        readonly kind: "organizing.accountable.invocation";
        readonly activity: Record<string, unknown>;
        readonly captp: Record<string, unknown>;
        readonly wasi: Record<string, unknown>;
    };
    readonly provenance?: {
        readonly kind: "organizing.accountable.provenance";
        readonly attestation?: unknown;
    };
}>;
export declare const transactionWitness: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.accountable.transaction.witness";
    readonly id: string;
    readonly capability: Record<string, unknown>;
    readonly affordances: readonly string[];
    readonly settlement: {
        readonly kind: "organizing.accountable.settlement";
        readonly challenge: Record<string, unknown>;
        readonly paymentClaimed: boolean;
        readonly receipt?: Record<string, unknown>;
        readonly payment?: Record<string, unknown>;
    };
    readonly authorization: {
        readonly kind: "capability" | "ucan";
        readonly token: Record<string, unknown>;
    };
    readonly witnessedAt: string;
    readonly invocation: {
        readonly kind: "organizing.accountable.invocation";
        readonly activity: Record<string, unknown>;
        readonly captp: Record<string, unknown>;
        readonly wasi: Record<string, unknown>;
    };
    readonly provenance?: {
        readonly kind: "organizing.accountable.provenance";
        readonly attestation?: unknown;
    };
}>;
export interface TransactionWitnessOptions {
    readonly id: string;
    readonly witnessedAt: string;
    readonly affordances: readonly string[];
    readonly capability: Capability;
    readonly authorization?: TransactionAuthorization;
    readonly challenge: X402Challenge;
    readonly payment?: X402Payment;
    readonly receipt?: X402Receipt;
    readonly paymentClaimed?: boolean;
    readonly captpMethod?: string;
    readonly captpArgs?: readonly unknown[];
    readonly wasiHandle?: WasiHandle;
    readonly wasiOperation?: string;
    readonly attestBy?: string;
}
export interface AccountabilityLegs {
    readonly authorized: ChargeValueName;
    readonly paid: ChargeValueName;
    readonly attested: ChargeValueName;
}
export interface AccountabilityReport {
    readonly kind: "organizing.accountable.query";
    readonly query: "authorized and paid and attested";
    readonly witness: EAVTRecord;
    readonly authorized: boolean;
    readonly paid: boolean;
    readonly attested: boolean;
    readonly accountable: boolean;
    readonly legs: AccountabilityLegs;
    readonly disputed: readonly string[];
    readonly coherence: readonly CoherenceReport[];
}
export interface CapabilityInvokeWire {
    readonly kind: "organizing.accountable.capability-invoke";
    readonly witness: TransactionWitness;
    readonly activity: Activity;
    readonly captp: Delivery;
    readonly wasi: WasiInvocation;
}
export interface X402ReceiptWire {
    readonly kind: "organizing.accountable.x402-receipt";
    readonly witness: TransactionWitness;
    readonly receipt: X402Receipt;
}
export interface AttestationWire {
    readonly kind: "organizing.accountable.attestation";
    readonly witness: TransactionWitness;
    readonly attestation: TransactionAttestation;
}
export declare function rwilWitnessOf(transaction: TransactionWitness): RWILWitness;
export declare function transactionFromWitness(row: RWILWitness): TransactionWitness;
export declare function attestTransaction(row: RWILWitness, signer: string, signedAt: string): TransactionAttestation;
export declare function makeTransactionWitness(options: TransactionWitnessOptions): TransactionWitness;
export declare const capabilityInvokeReading: Reading<CapabilityInvokeWire>;
export declare const x402ReceiptReading: Reading<X402ReceiptWire>;
export declare const attestationReading: Reading<AttestationWire>;
export declare const accountableReadings: readonly [Reading<CapabilityInvokeWire>, Reading<X402ReceiptWire>, Reading<AttestationWire>];
export declare function cohereAccountable(transaction: TransactionWitness): readonly CoherenceReport[];
export declare function isAccountable(transaction: TransactionWitness): AccountabilityReport;
export declare function sameAccountableWitness(left: TransactionWitness, right: TransactionWitness): boolean;
//# sourceMappingURL=index.d.mts.map