import { type Capability } from "@emsenn/animating";
export interface OrganizingTheatreServiceConfig {
    readonly baseUrl: string;
}
export interface OrganizingTheatreWorkLocusOptions {
    readonly claimKind?: string;
    readonly activeKind?: string;
    readonly conflictKind?: string;
    readonly capabilityBasePath?: string;
}
export interface OrganizingTheatreWorkLocusClaim {
    readonly kind: string;
    readonly action: "claim" | "release";
    readonly claimId: string;
    readonly session: string;
    readonly harness: string;
    readonly paths: readonly string[];
    readonly reason?: string | null;
    readonly at?: string | null;
    readonly expiresAt?: string | null;
    readonly capability?: Capability;
}
export interface OrganizingTheatreWorkLocusEvent {
    readonly id?: string | null;
    readonly at?: string | null;
    readonly session?: string | null;
    readonly harness?: string | null;
    readonly locusClaim?: unknown;
}
export interface OrganizingTheatreActiveWorkLocusClaim {
    readonly kind: string;
    readonly claimId: string;
    readonly capability: Capability;
    readonly session: string;
    readonly harness: string;
    readonly paths: readonly string[];
    readonly reason: string | null;
    readonly at: string | null;
    readonly expiresAt: string | null;
    readonly event: string | null;
}
export interface OrganizingTheatreWorkLocusClaimConflict {
    readonly kind: string;
    readonly relation: "claimed-locus-overlap";
    readonly path: string;
    readonly left: OrganizingTheatreWorkLocusConflictSide;
    readonly right: OrganizingTheatreWorkLocusConflictSide;
    readonly reason: string;
    readonly severity: "notice" | "watch";
}
export interface OrganizingTheatreWorkLocusConflictSide {
    readonly claimId: string;
    readonly capability: string;
    readonly session: string;
    readonly harness: string;
    readonly path: string;
    readonly reason: string | null;
    readonly at: string | null;
    readonly expiresAt: string | null;
}
export declare function organizingTheatreWorkLocusCapability(claim: OrganizingTheatreWorkLocusClaim, config: OrganizingTheatreServiceConfig, options?: OrganizingTheatreWorkLocusOptions): Capability;
export declare function organizingTheatreWorkLocusCapabilityGrant(claim: Pick<OrganizingTheatreWorkLocusClaim, "claimId" | "paths">): string;
export declare function organizingTheatreWorkLocusCapabilitySignal(claim: OrganizingTheatreWorkLocusClaim | OrganizingTheatreActiveWorkLocusClaim, config: OrganizingTheatreServiceConfig, options?: OrganizingTheatreWorkLocusOptions): Readonly<{
    kind: string;
    id: string;
    grants: string;
    holder: string;
    claimId: string;
    session: string;
    harness: string;
    paths: readonly string[];
    reason: string | null;
    expiresAt: string | null;
}>;
export declare function organizingTheatreActiveWorkLocusClaims(events: readonly OrganizingTheatreWorkLocusEvent[], config: OrganizingTheatreServiceConfig, options?: OrganizingTheatreWorkLocusOptions & Readonly<{
    now?: Date;
    max?: number;
}>): readonly OrganizingTheatreActiveWorkLocusClaim[];
export declare function organizingTheatreWorkLocusClaimConflictsFor(claim: OrganizingTheatreWorkLocusClaim, activeClaims: readonly OrganizingTheatreActiveWorkLocusClaim[], config: OrganizingTheatreServiceConfig, options?: OrganizingTheatreWorkLocusOptions): readonly OrganizingTheatreWorkLocusClaimConflict[];
export declare function organizingTheatreWorkLocusClaimConflictsAcross(activeClaims: readonly OrganizingTheatreActiveWorkLocusClaim[], config: OrganizingTheatreServiceConfig, options?: OrganizingTheatreWorkLocusOptions & Readonly<{
    max?: number;
}>): readonly OrganizingTheatreWorkLocusClaimConflict[];
export declare function organizingTheatreStrongestPathOverlap(yourPaths: Iterable<string>, peerPath: string): string | null;
export declare function organizingTheatreWorkLocusClaimFrom(value: unknown, options?: OrganizingTheatreWorkLocusOptions): OrganizingTheatreWorkLocusClaim | null;
//# sourceMappingURL=work-locus.d.mts.map