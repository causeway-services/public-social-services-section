import { type JsonObject } from "../../management/ledger.mjs";
export type LiveSurfaceWitness = Readonly<{
    route: string;
    status: number;
    mediaType: string;
    bytes: number;
    digest: string;
}>;
export type LivePublicationWitness = Readonly<{
    kind: "koios.live-publication-witness/v1";
    origin: string;
    observedAt: string;
    articleRoutes: readonly string[];
    sitemapRoutes: readonly string[];
    surfaces: readonly LiveSurfaceWitness[];
    witnessDigest: string;
}>;
export declare function captureLivePublicationWitness(input: Readonly<{
    origin?: string;
    observedAt: string;
}>): Promise<LivePublicationWitness>;
export declare function latestLivePublicationWitness(dataRoot: string): LivePublicationWitness;
export declare function verifyLivePublicationWitness(witness: LivePublicationWitness): LivePublicationWitness;
export declare function appendLivePublicationWitness(dataRoot: string, witness: LivePublicationWitness): Readonly<JsonObject>;
//# sourceMappingURL=live-publication-witness.d.mts.map