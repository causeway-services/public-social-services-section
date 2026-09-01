export type CandidateLiveSemantics = Readonly<{
    kind: "koios.candidate-live-semantics";
    liveOrigin: string;
    liveStructuredArticleCount: number;
    candidateStructuredArticleCount: number;
    liveStructuredArticlesPreserved: boolean;
    candidateOnlyArticlesExactlyAccepted: boolean;
    editorialEvidenceCoversCandidate: boolean;
    correctionsSurfacePresent: boolean;
    advertisingProviderPreserved: boolean;
    liveAAdsUnits: readonly string[];
    candidateAAdsUnits: readonly string[];
    attentionSuspendedWithDisclosure: boolean;
    privacyAdvertisingBoundaryDeclared: boolean;
    securityHeadersPreserved: boolean;
    securityHeaderDeltas: readonly string[];
    providerManagedRobotsOverlayCompatible: boolean;
    intentionalDeltas: readonly string[];
    obstructions: readonly string[];
    settled: boolean;
}>;
export declare function compareCandidateToLiveSemantics(input: Readonly<{
    candidateOutputDir: string;
    liveOrigin?: string;
}>): Promise<CandidateLiveSemantics>;
//# sourceMappingURL=candidate-live-semantics.d.mts.map