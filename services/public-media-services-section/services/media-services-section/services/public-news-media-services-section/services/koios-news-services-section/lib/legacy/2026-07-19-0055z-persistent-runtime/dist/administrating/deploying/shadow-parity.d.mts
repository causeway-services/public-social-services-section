import type { LivePublicationWitness } from "./live-publication-witness.mjs";
type SurfaceComparison = Readonly<{
    route: string;
    liveStatus: number;
    liveMediaType: string;
    shadowPresent: boolean;
    shadowMediaType?: string;
    disposition: "preserved" | "intentional-shadow-absence" | "missing" | "media-type-mismatch";
}>;
export type DeliveryAuthorityEvidence = Readonly<{
    providerResourceGrantAccepted: boolean;
    previewDeliverySettled: boolean;
    previewParitySettled: boolean;
    remoteRollbackRehearsed: boolean;
    mutableRoutesDisposed: boolean;
    cutoverAuthorized: boolean;
}>;
export type ShadowLiveParity = Readonly<{
    kind: "koios.shadow-live-parity";
    liveOrigin: string;
    shadowAuthority: "non-authoritative-shadow";
    liveArticleCount: number;
    shadowArticleCount: number;
    sharedArticleCount: number;
    liveOnlyArticles: readonly string[];
    shadowOnlyArticles: readonly string[];
    liveRoutesPreserved: boolean;
    shadowOnlyRoutesAccepted: boolean;
    migrationPolicyAccepted: boolean;
    witnessDigest: string;
    witnessMatchesCurrentLive: boolean;
    sitemapRoutesPreserved: boolean;
    liveSurfaceShapePreserved: boolean;
    liveSemanticParitySettled: boolean;
    surfaceComparisons: readonly SurfaceComparison[];
    staticProfileParitySettled: boolean;
    providerPackagingDryRunSettled: boolean;
    retainedOriginRollbackRehearsed: boolean;
    liveLatest?: Readonly<{
        title: string;
        published: string;
        path: string;
    }>;
    contentParity: boolean;
    cutoverEligible: boolean;
    cutoverReady: boolean;
    decision: "retain-vps-authority" | "eligible-for-explicit-cutover" | "cutover-authorized";
    authorityEvidence: DeliveryAuthorityEvidence;
    obstructions: readonly string[];
}>;
export declare function compareStaticShadowToLive(input: Readonly<{
    outputDir: string;
    liveOrigin?: string;
    livePublicationWitness: LivePublicationWitness;
    providerPackagingDryRunSettled?: boolean;
    staticProfileParitySettled?: boolean;
    liveSemanticParitySettled?: boolean;
    retainedOriginRollbackRehearsed?: boolean;
    authorityEvidence?: Partial<DeliveryAuthorityEvidence>;
}>): Promise<ShadowLiveParity>;
export {};
//# sourceMappingURL=shadow-parity.d.mts.map