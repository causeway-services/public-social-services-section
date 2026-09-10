type JsonRecord = Record<string, unknown>;
export type PendingPrimaryRelease = Readonly<{
    assignmentId: string;
    slug: string;
    candidate: Readonly<{
        outputDir: string;
        manifestDigest: string;
    }>;
}>;
export type PrimaryReleaseSettlement = Readonly<{
    accepted: boolean;
    outcome: JsonRecord;
    manifestDigest: string;
    assignmentId: string;
    slug: string;
}>;
export declare function pendingPrimaryStaticRelease(dataDir: string, outputDir?: string): PendingPrimaryRelease | undefined;
export declare function settlePrimaryStaticRelease(input: Readonly<{
    assignmentId: string;
    slug: string;
    candidateDir: string;
    dataDir: string;
    now?: string;
    executionMode?: "dry-run" | "live";
}>): PrimaryReleaseSettlement;
export {};
//# sourceMappingURL=cloudflare-primary-release-contract.d.mts.map