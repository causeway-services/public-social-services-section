import { type JsonObject } from "../../management/ledger.mjs";
export type PriorResearchContext = Readonly<{
    contract: "corpus-management-team/recovering-prior-research/v1";
    assignmentId: string;
    sourceRecovery: string;
    contextualBundleDigest: string;
    gapBundleDigest: string;
    contextualBundle: Readonly<JsonObject>;
    gapBundle: Readonly<JsonObject>;
    providerResultDigest: string;
    providerDelivery?: Readonly<JsonObject>;
    filesystemReads: 0;
}>;
export declare function admittedPriorResearchContext(dataDir: string, assignmentId: string): PriorResearchContext | undefined;
export declare function priorResearchContextBrief(context: PriorResearchContext): string;
export declare function projectPriorResearchForIssue(input: Readonly<{
    assignmentId: string;
    terms: readonly string[];
    now?: string;
    maxFiles?: number;
    dataDir?: string;
    providerInterface?: string;
    requireProviderDelivery?: boolean;
}>): PriorResearchContext;
//# sourceMappingURL=prior-research-contract.d.mts.map