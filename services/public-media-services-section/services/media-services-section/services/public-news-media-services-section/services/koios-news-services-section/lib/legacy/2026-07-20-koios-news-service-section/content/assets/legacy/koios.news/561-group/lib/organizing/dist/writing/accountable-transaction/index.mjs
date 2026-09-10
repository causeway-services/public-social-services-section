/**
 * writing/accountable-transaction — organizing's accountability codec for one
 * authorized, invoked, paid, and attested transaction witness.
 *
 * This module does not create a trading kernel. It assembles lower-faculty
 * readings into one organizing-scale record: animating authority, CapTP
 * invocation, playing/WASI execution projection, x402 settlement, and RWIL
 * provenance all cohere over the same witness.
 */
import { canInvoke, capabilityFromUcan, deliver, invoke, refOf, } from "@emsenn/animating";
import { canInvokeWasi, invokeWasi, preopen, } from "@emsenn/playing";
import { cohere, registerReading, sameWitness, } from "@emsenn/relating/ledger";
import { carrierFrom } from "@emsenn/relating/typing";
import { canonical, eavtRecord, } from "@emsenn/relating/writing";
import { isWitnessedExchange, x402ReceiptCarrier, } from "../x402/index.mjs";
const TRANSACTION_ATTRIBUTE = "authorized-paid-attested";
const looseObject = { type: "object" };
export const transactionAttestationSchema = {
    $id: "organizing/accountable-transaction/attestation",
    title: "AccountableTransactionAttestation",
    description: "A thin provenance record: a signed Datom over the accountable transaction witness. This is not yet in-toto/SLSA.",
    type: "object",
    additionalProperties: false,
    required: ["kind", "subject", "signer", "signedAt", "datom", "signature"],
    properties: {
        kind: { const: "organizing.accountable.attestation" },
        subject: { type: "string", minLength: 1 },
        signer: { type: "string", minLength: 1 },
        signedAt: { type: "string", minLength: 1 },
        datom: { type: "array", minItems: 5, maxItems: 5, items: {} },
        signature: { type: "string", minLength: 1 },
    },
};
export const transactionAttestationCarrier = carrierFrom(transactionAttestationSchema);
export const transactionWitnessSchema = {
    $id: "organizing/accountable-transaction/witness",
    title: "AccountableTransactionWitness",
    description: "One accountable agentic transaction: UCAN/capability authority, CapTP/WASI invocation, x402 settlement, and a thin provenance attestation over one RWIL witness.",
    type: "object",
    additionalProperties: false,
    required: ["kind", "id", "witnessedAt", "affordances", "capability", "authorization", "invocation", "settlement"],
    properties: {
        kind: { const: "organizing.accountable.transaction.witness" },
        id: { type: "string", minLength: 1 },
        witnessedAt: { type: "string", minLength: 1 },
        affordances: { type: "array", items: { type: "string" } },
        capability: looseObject,
        authorization: {
            type: "object",
            additionalProperties: false,
            required: ["kind", "token"],
            properties: {
                kind: { enum: ["ucan", "capability"] },
                token: looseObject,
            },
        },
        invocation: {
            type: "object",
            additionalProperties: false,
            required: ["kind", "activity", "captp", "wasi"],
            properties: {
                kind: { const: "organizing.accountable.invocation" },
                activity: looseObject,
                captp: looseObject,
                wasi: looseObject,
            },
        },
        settlement: {
            type: "object",
            additionalProperties: false,
            required: ["kind", "challenge", "paymentClaimed"],
            properties: {
                kind: { const: "organizing.accountable.settlement" },
                challenge: looseObject,
                payment: looseObject,
                receipt: looseObject,
                paymentClaimed: { type: "boolean" },
            },
        },
        provenance: {
            type: "object",
            additionalProperties: false,
            required: ["kind"],
            properties: {
                kind: { const: "organizing.accountable.provenance" },
                attestation: { $ref: "organizing/accountable-transaction/attestation" },
            },
        },
    },
};
export const transactionWitnessCarrier = carrierFrom(transactionWitnessSchema);
export const transactionWitness = transactionWitnessCarrier;
function jsonValue(value, context) {
    const cloned = JSON.parse(JSON.stringify(value));
    if (cloned === undefined)
        throw new TypeError(`${context}: not a JSON value`);
    return cloned;
}
function transactionEntity(id) {
    return Object.freeze(["organizing", "accountable-transaction", id]);
}
export function rwilWitnessOf(transaction) {
    transactionWitnessCarrier.assert(transaction, "accountable transaction witness");
    return eavtRecord({
        e: transactionEntity(transaction.id),
        a: TRANSACTION_ATTRIBUTE,
        v: jsonValue(transaction, "accountable transaction witness value"),
        t: transaction.witnessedAt,
    });
}
export function transactionFromWitness(row) {
    const witness = eavtRecord(row);
    if (witness.a !== TRANSACTION_ATTRIBUTE) {
        throw new TypeError(`transactionFromWitness: unsupported attribute ${JSON.stringify(witness.a)}`);
    }
    return transactionWitnessCarrier.assert(witness.v, "accountable transaction witness value");
}
function structuralSignature(signer, datom) {
    return `structural-signature(${signer}:${canonical(datom)})`;
}
export function attestTransaction(row, signer, signedAt) {
    const witness = eavtRecord(row);
    const transaction = transactionFromWitness(witness);
    const datom = [
        witness.e,
        "provenance.attested",
        true,
        signedAt,
        {
            kind: "organizing.accountable.attestation.reading",
            witnessAttribute: witness.a,
            witnessTime: witness.t,
        },
    ];
    return transactionAttestationCarrier.assert({
        kind: "organizing.accountable.attestation",
        subject: transaction.id,
        signer,
        signedAt,
        datom,
        signature: structuralSignature(signer, datom),
    }, "accountable transaction attestation");
}
function authorizationOf(capability, authorization) {
    return authorization ?? { kind: "capability", token: capability };
}
function invocationOf(options) {
    const ref = refOf(options.capability);
    const wasiHandle = options.wasiHandle ?? preopen({
        id: options.capability.id,
        grants: options.capability.grants,
        holder: options.capability.holder,
        ...(options.capability.parent === undefined ? {} : { parent: options.capability.parent }),
    }, { path: options.capability.grants });
    return {
        kind: "organizing.accountable.invocation",
        activity: invoke(options.capability),
        captp: deliver(ref, options.captpMethod ?? "invoke", options.captpArgs ?? [], `${options.id}:answer`),
        wasi: invokeWasi(wasiHandle, options.wasiOperation ?? "call"),
    };
}
export function makeTransactionWitness(options) {
    const base = transactionWitnessCarrier.assert({
        kind: "organizing.accountable.transaction.witness",
        id: options.id,
        witnessedAt: options.witnessedAt,
        affordances: [...options.affordances],
        capability: options.capability,
        authorization: authorizationOf(options.capability, options.authorization),
        invocation: invocationOf(options),
        settlement: {
            kind: "organizing.accountable.settlement",
            challenge: options.challenge,
            ...(options.payment === undefined ? {} : { payment: options.payment }),
            ...(options.receipt === undefined ? {} : { receipt: options.receipt }),
            paymentClaimed: options.paymentClaimed ?? options.payment !== undefined,
        },
    }, "accountable transaction witness");
    if (options.attestBy === undefined)
        return base;
    const attestation = attestTransaction(rwilWitnessOf(base), options.attestBy, options.witnessedAt);
    return transactionWitnessCarrier.assert({
        ...base,
        provenance: {
            kind: "organizing.accountable.provenance",
            attestation,
        },
    }, "attested accountable transaction witness");
}
function authorityCapability(transaction) {
    if (transaction.authorization.kind === "ucan") {
        return capabilityFromUcan(transaction.authorization.token);
    }
    return transaction.authorization.token;
}
function sameCapability(left, right) {
    return left.id === right.id && left.grants === right.grants && left.holder === right.holder;
}
function authorityStanding(transaction) {
    const carried = authorityCapability(transaction);
    const same = sameCapability(carried, transaction.capability);
    const activityOk = canInvoke(transaction.affordances, transaction.capability);
    const wasiOk = canInvokeWasi(transaction.affordances, {
        id: transaction.capability.id,
        grants: transaction.capability.grants,
        holder: transaction.capability.holder,
        ...(transaction.capability.parent === undefined ? {} : { parent: transaction.capability.parent }),
    });
    const ok = same && activityOk && wasiOk;
    return { ok, charge: ok ? "potential" : "active" };
}
function paymentStanding(transaction) {
    const receipt = transaction.settlement.receipt;
    if (receipt !== undefined) {
        x402ReceiptCarrier.assert(receipt, "accountable transaction x402 receipt");
        const ok = isWitnessedExchange(receipt);
        return ok
            ? { ok: true, charge: "potential" }
            : { ok: false, charge: "stable", disputed: "x402 receipt is present but its settlement is not witnessed" };
    }
    if (transaction.settlement.paymentClaimed || transaction.settlement.payment !== undefined) {
        return { ok: false, charge: "stable", disputed: "payment is claimed but no witnessed x402 receipt is present" };
    }
    return { ok: false, charge: "active" };
}
function attestationStanding(transaction) {
    const attestation = transaction.provenance?.attestation;
    if (attestation === undefined)
        return { ok: false, charge: "active" };
    transactionAttestationCarrier.assert(attestation, "accountable transaction attestation");
    return { ok: attestation.subject === transaction.id, charge: attestation.subject === transaction.id ? "potential" : "active" };
}
export const capabilityInvokeReading = registerReading(Object.freeze({
    id: "organizing.accountable.capability-invoke",
    toWire: (row) => {
        const witness = transactionFromWitness(row);
        return {
            kind: "organizing.accountable.capability-invoke",
            witness,
            activity: witness.invocation.activity,
            captp: witness.invocation.captp,
            wasi: witness.invocation.wasi,
        };
    },
    fromWire: (wire) => rwilWitnessOf(wire.witness),
}));
export const x402ReceiptReading = registerReading(Object.freeze({
    id: "organizing.accountable.x402-receipt",
    toWire: (row) => {
        const witness = transactionFromWitness(row);
        const receipt = witness.settlement.receipt;
        if (receipt === undefined)
            throw new TypeError("x402ReceiptReading: transaction has no receipt");
        return {
            kind: "organizing.accountable.x402-receipt",
            witness,
            receipt,
        };
    },
    fromWire: (wire) => rwilWitnessOf(wire.witness),
}));
export const attestationReading = registerReading(Object.freeze({
    id: "organizing.accountable.attestation",
    toWire: (row) => {
        const witness = transactionFromWitness(row);
        const attestation = witness.provenance?.attestation;
        if (attestation === undefined)
            throw new TypeError("attestationReading: transaction has no attestation");
        return {
            kind: "organizing.accountable.attestation",
            witness,
            attestation,
        };
    },
    fromWire: (wire) => rwilWitnessOf(wire.witness),
}));
export const accountableReadings = Object.freeze([
    capabilityInvokeReading,
    x402ReceiptReading,
    attestationReading,
]);
export function cohereAccountable(transaction) {
    const row = rwilWitnessOf(transaction);
    return Object.freeze([
        cohere(capabilityInvokeReading, x402ReceiptReading, row),
        cohere(capabilityInvokeReading, attestationReading, row),
        cohere(x402ReceiptReading, attestationReading, row),
    ]);
}
export function isAccountable(transaction) {
    const witness = transactionWitnessCarrier.assert(transaction, "accountable transaction witness");
    const row = rwilWitnessOf(witness);
    const authority = authorityStanding(witness);
    const payment = paymentStanding(witness);
    const attestation = attestationStanding(witness);
    const coherence = payment.ok && attestation.ok ? cohereAccountable(witness) : [];
    const coherent = coherence.length === 0 ? payment.ok && attestation.ok : coherence.every((report) => report.ok);
    const accountable = authority.ok && payment.ok && attestation.ok && coherent;
    return Object.freeze({
        kind: "organizing.accountable.query",
        query: "authorized and paid and attested",
        witness: row,
        authorized: authority.ok,
        paid: payment.ok,
        attested: attestation.ok,
        accountable,
        legs: {
            authorized: authority.charge,
            paid: payment.charge,
            attested: attestation.charge,
        },
        disputed: Object.freeze([payment.disputed].filter((entry) => entry !== undefined)),
        coherence,
    });
}
export function sameAccountableWitness(left, right) {
    return sameWitness(rwilWitnessOf(left), rwilWitnessOf(right));
}
//# sourceMappingURL=index.mjs.map