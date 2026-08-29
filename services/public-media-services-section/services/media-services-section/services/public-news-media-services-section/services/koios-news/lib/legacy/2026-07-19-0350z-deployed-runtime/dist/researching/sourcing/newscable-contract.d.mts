import { type JsonObject } from "../../management/ledger.mjs";
export type SourceBundleRefreshResult = Readonly<{
    contract: "newscable-source-broker/source-bundle-service/v1";
    deliveryDigest: string;
    offered: number;
    admitted: number;
    duplicates: number;
    collisions: number;
    refused: number;
    results: readonly Readonly<{
        wire: string;
        storeDir: string;
        written: number;
        skipped: number;
        errors: readonly string[];
    }>[];
    providerExchange: Readonly<JsonObject>;
    providerDelivery: Readonly<JsonObject>;
}>;
export declare function refreshSourceCorpus(input?: Readonly<{
    configPath?: string;
    dataDir?: string;
    now?: string;
}>): SourceBundleRefreshResult;
//# sourceMappingURL=newscable-contract.d.mts.map