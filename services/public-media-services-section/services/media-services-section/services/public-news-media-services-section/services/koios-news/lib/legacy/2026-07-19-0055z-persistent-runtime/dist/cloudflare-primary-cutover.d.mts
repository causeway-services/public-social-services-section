#!/usr/bin/env node
import { type JsonObject } from "./management/ledger.mjs";
type Route = Readonly<{
    id: string;
    pattern: string;
    script?: string;
}>;
type Artifact = Readonly<{
    route: string;
    file: string;
    mediaType: string;
    digest: string;
}>;
type Manifest = Readonly<{
    profile: string;
    authority: string;
    canonicalOrigin: string;
    routeCount: number;
    livePublicationWitnessDigest: string;
    artifacts: readonly Artifact[];
}>;
type Bindings = Readonly<{
    accountId: string;
    zoneName: string;
    workerName: string;
    routePattern: string;
    artifactManifestDigest: string;
    livePublicationWitnessDigest: string;
    deliveryPolicyDigest: string;
}>;
export declare function primaryRoute(routes: readonly Route[], pattern: string): Route | null;
export declare function probeRoutes(manifest: Manifest): readonly Artifact[];
export declare function withoutCloudflareBrowserInsights(value: string): string;
export declare function validatePrimaryGrant(grant: unknown, bindings: Bindings, now: string): Readonly<JsonObject>;
export declare function validateAuthorityTransferGrant(grant: unknown, bindings: Bindings, now: string): Readonly<JsonObject>;
export {};
//# sourceMappingURL=cloudflare-primary-cutover.d.mts.map