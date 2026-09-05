export declare const KOIOS_LEDGERS: readonly ["assignments", "source-claims", "research-lessons", "editorial-authority", "editorial-judgments", "corrections-omissions", "contract-events", "provider-usage", "deployments", "shadow-deliveries", "attention", "advertising", "revenue-cost"];
export type KoiosLedger = (typeof KOIOS_LEDGERS)[number];
export type JsonObject = Record<string, unknown>;
export declare const KOIOS_LEDGER_CARRIERS: Readonly<Record<KoiosLedger, "journals" | "ledgers" | "records" | "state">>;
export declare function recordDigest(value: unknown): string;
export declare function datedLedgerPath(dataRoot: string, ledger: KoiosLedger, instant: string): string;
export declare function ledgerRootPath(dataRoot: string, ledger: KoiosLedger): string;
/** Append an already-shaped domain record without changing its public schema. */
export declare function appendDatedRecord(input: Readonly<{
    dataRoot: string;
    ledger: KoiosLedger;
    instant: string;
    record: JsonObject;
}>): Readonly<{
    path: string;
    digest: string;
}>;
/** Shape and append one durable Koios boundary act. */
export declare function appendKoiosAct(input: Readonly<{
    dataRoot: string;
    ledger: KoiosLedger;
    instant: string;
    act: string;
    subject: string;
    data?: JsonObject;
}>): Readonly<JsonObject>;
/** Read every intact record in one Koios-owned ledger in carrier order. */
export declare function readKoiosLedger(dataRoot: string, ledger: KoiosLedger): readonly Readonly<JsonObject>[];
/** Read the latest matching local act without treating malformed history as absent evidence for any other act. */
export declare function latestKoiosAct(dataRoot: string, ledger: KoiosLedger, act: string): Readonly<JsonObject> | undefined;
/** Project provider-authored exchange receipts into Koios's own usage ledger. */
export declare function appendProviderUsage(input: Readonly<{
    dataRoot: string;
    instant: string;
    providerResult: unknown;
    purpose: string;
}>): readonly Readonly<JsonObject>[];
//# sourceMappingURL=ledger.d.mts.map