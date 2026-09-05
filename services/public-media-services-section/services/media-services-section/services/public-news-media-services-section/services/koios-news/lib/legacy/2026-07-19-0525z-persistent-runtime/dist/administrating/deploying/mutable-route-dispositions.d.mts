import type { LivePublicationWitness } from "./live-publication-witness.mjs";
import { STATIC_PUBLICATION_EXCLUSIONS } from "./static-shadow.mjs";
type MutableRoute = typeof STATIC_PUBLICATION_EXCLUSIONS[number];
export type MutableRouteDisposition = Readonly<{
    route: MutableRoute;
    sourceClass: "public-mutable-route" | "separate-private-boundary";
    liveProbeMethod: "GET";
    liveStatus: number;
    liveMediaType: string;
    candidatePresent: false;
    disposition: "suspend-accountable-attention" | "retire-public-health-route" | "retain-outside-publication-boundary";
    effectiveUnder: "exact-candidate-cutover-only";
    futureAdmission: string;
}>;
export type MutableRouteDispositionSettlement = Readonly<{
    kind: "koios.mutable-route-disposition-settlement/v1";
    node: "koios-news";
    currentAuthority: "vps";
    candidateAuthority: "non-authoritative-cutover-candidate";
    observedAt: string;
    liveOrigin: string;
    artifactManifestDigest: string;
    livePublicationWitnessDigest: string;
    deliveryPolicyDigest: string;
    candidatePrivacyDigest: string;
    dispositions: readonly MutableRouteDisposition[];
    candidateOnly: true;
    currentVpsMutated: false;
    credentialsUsed: false;
    settled: true;
    dispositionDigest: string;
}>;
export declare function settleMutableRouteDispositions(input: Readonly<{
    candidateOutputDir: string;
    livePublicationWitness: LivePublicationWitness;
    observedAt: string;
    liveOrigin?: string;
    fetcher?: typeof fetch;
}>): Promise<MutableRouteDispositionSettlement>;
export {};
//# sourceMappingURL=mutable-route-dispositions.d.mts.map