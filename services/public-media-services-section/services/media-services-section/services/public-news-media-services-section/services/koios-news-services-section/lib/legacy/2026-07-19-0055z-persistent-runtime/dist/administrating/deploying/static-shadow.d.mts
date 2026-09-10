import { type KoiosSiteOptions } from "../../index.mjs";
import { type LivePublicationWitness } from "./live-publication-witness.mjs";
export declare const STATIC_PUBLICATION_EXCLUSIONS: readonly ["/hit", "/views.json", "/healthz", "/newsroom", "/cable", "/mcp", "/operators"];
export type StaticShadowArtifact = Readonly<{
    route: string;
    file: string;
    mediaType: string;
    bytes: number;
    digest: string;
}>;
export type StaticPublicationProfile = "shadow" | "cutover-candidate";
export type StaticPublicationManifest = Readonly<{
    kind: "koios.static-publication-manifest";
    node: "koios-news";
    canonicalOrigin: "https://koios.news";
    profile: StaticPublicationProfile;
    authority: "non-authoritative-shadow" | "non-authoritative-cutover-candidate";
    policy: Readonly<{
        indexing: "noindex-nofollow" | "production-indexable";
        advertising: boolean;
        viewBeacon: false;
        mutableRoutes: "excluded";
        navigation: "delivery-origin-portable";
        legacyNavigation: "canonical-static-aliases";
        publicationAdmission: "public-record-carry-forward/v1" | "exact-editorial-acceptance/v1";
    }>;
    exclusions: readonly string[];
    limitations: readonly string[];
    aliasCount: number;
    routeCount: number;
    livePublicationWitnessDigest?: string;
    artifacts: readonly StaticShadowArtifact[];
}>;
/** Compatibility name for callers that still consume the shadow profile. */
export type StaticShadowManifest = StaticPublicationManifest;
export type StaticPublicationResult = Readonly<{
    outputDir: string;
    manifest: StaticPublicationManifest;
    manifestDigest: string;
    livePublicationWitness?: LivePublicationWitness;
}>;
/** Compatibility name for callers that still consume the shadow profile. */
export type StaticShadowResult = StaticPublicationResult;
export declare function buildStaticPublication(input: Readonly<{
    outputDir: string;
    profile: StaticPublicationProfile;
    replace?: boolean;
    site?: KoiosSiteOptions;
    livePublicationWitness?: LivePublicationWitness;
}>): Promise<StaticPublicationResult>;
export declare function buildStaticShadow(input: Readonly<{
    outputDir: string;
    replace?: boolean;
    site?: KoiosSiteOptions;
    livePublicationWitness?: LivePublicationWitness;
}>): Promise<StaticShadowResult>;
export declare function verifyStaticPublication(result: StaticPublicationResult): Readonly<{
    valid: true;
    profile: StaticPublicationProfile;
    manifestDigest: string;
    routeCount: number;
}>;
export declare function verifyStaticShadow(result: StaticShadowResult): Readonly<{
    valid: true;
    profile: "shadow";
    manifestDigest: string;
    routeCount: number;
}>;
//# sourceMappingURL=static-shadow.d.mts.map