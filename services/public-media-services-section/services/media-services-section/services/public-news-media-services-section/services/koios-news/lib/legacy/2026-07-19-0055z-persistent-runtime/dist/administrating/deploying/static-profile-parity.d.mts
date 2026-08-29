export type StaticProfileDelta = Readonly<{
    route: string;
    disposition: "identical" | "advertising-carrier-only" | "privacy-disclosure" | "indexing-policy" | "unexpected";
}>;
export type StaticProfileParity = Readonly<{
    kind: "koios.static-profile-parity";
    shadowManifestDigest: string;
    candidateManifestDigest: string;
    routeSetsEqual: boolean;
    exactArtifactCount: number;
    intentionalDeltaCount: number;
    unexpectedRoutes: readonly string[];
    deltas: readonly StaticProfileDelta[];
    candidateReadyForCutoverEvaluation: boolean;
    authorityConferred: false;
}>;
export declare function compareStaticPublicationProfiles(input: Readonly<{
    shadowOutputDir: string;
    candidateOutputDir: string;
    shadowManifestDigest: string;
    candidateManifestDigest: string;
}>): StaticProfileParity;
//# sourceMappingURL=static-profile-parity.d.mts.map