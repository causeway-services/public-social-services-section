type JsonRecord = Record<string, unknown>;
export declare class NewswireProseRefusal extends Error {
    readonly code: string;
    readonly providerResult?: Readonly<JsonRecord>;
    constructor(code: string, message: string, providerResult?: Readonly<JsonRecord>);
}
export declare function procureNewswireProse(input: Readonly<{
    purpose: string;
    assignmentId: string;
    assignmentDigest: string;
    prompt: string;
    licensedEditorialStateDigest: string;
    researchPacketDigest: string;
    writingPolicyDigest: string;
    stylePolicyDigest: string;
    requiredSourceUrls: readonly string[];
    now: string;
    dataDir: string;
    executionMode?: "dry-run" | "live";
    providerRoot?: string;
}>): Readonly<{
    text: string;
    model: string;
    selectedTier: string;
    selectedProvider: string;
    providerResult: JsonRecord;
    providerExchange: JsonRecord;
    recordedAt: string;
}>;
export {};
//# sourceMappingURL=newswire-prose-contract.d.mts.map