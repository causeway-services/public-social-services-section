import { ACTIVITYSTREAMS_CONTEXT, type Activity, type OrderedCollection } from "@emsenn/animating";
import { type OrganizingTheatreActiveWorkLocusClaim, type OrganizingTheatreWorkLocusClaimConflict, type OrganizingTheatreWorkLocusOptions } from "./work-locus.mjs";
interface OrganizingTheatreServiceConfig {
    readonly baseUrl: string;
}
export interface OrganizingTheatreLaneFocus {
    readonly focusPaths?: readonly string[];
}
export interface OrganizingTheatrePeerFocusSession {
    readonly session: string;
    readonly updatedAt?: string | null;
    readonly lane?: OrganizingTheatreLaneFocus | null;
}
export interface OrganizingTheatreCollisionAwareness {
    readonly peerSession: string;
    readonly path: string;
    readonly peerPath: string;
    readonly reason: string;
    readonly updatedAt?: string | null;
}
export interface organizingTheatreAgentLocus {
    readonly kind?: string;
    readonly session: string;
    readonly role?: string;
    readonly harnesses?: readonly string[];
    readonly hooks?: number;
    readonly updatedAt?: string | null;
    readonly currentCwd?: string | null;
    readonly focusPaths?: readonly string[];
    readonly lastTool?: string | null;
    readonly lastEventAt?: string | null;
    readonly hookCounts?: unknown;
    readonly toolCounts?: unknown;
}
export interface OrganizingTheatreAgentLocusInput {
    readonly role?: string;
    readonly session: string;
    readonly updatedAt?: string | null;
    readonly hooks?: number;
    readonly harnesses?: readonly string[];
    readonly lane?: unknown;
}
export interface OrganizingTheatreAgentLocusOptions {
    readonly kind?: string;
    readonly focusPathsMax?: number;
}
export interface OrganizingTheatreAgentRelation {
    readonly kind: string;
    readonly relation: "focus-overlap" | "co-present-session" | "self-locus-claim" | "claimed-locus-overlap";
    readonly source: string;
    readonly target: string;
    readonly path: string;
    readonly peerPath?: string;
    readonly reason: string;
    readonly updatedAt?: string | null;
    readonly claimId?: string;
    readonly expiresAt?: string | null;
}
export interface OrganizingTheatreModeledAgentSemioticHubInput {
    readonly kind?: string;
    readonly shortName?: string;
    readonly title?: string;
    readonly claim?: string;
    readonly generatedAt: string;
    readonly observer: Readonly<{
        readonly session: string;
        readonly harness: string;
        readonly hookEventName: string;
        readonly locus: organizingTheatreAgentLocus | undefined;
    }>;
    readonly events: readonly unknown[];
    readonly activities: readonly Activity[];
    readonly sessionCount: number;
    readonly loci: readonly organizingTheatreAgentLocus[];
    readonly collisionAwareness?: readonly OrganizingTheatreCollisionAwareness[];
    readonly relations?: readonly OrganizingTheatreAgentRelation[];
    readonly activeClaims?: readonly OrganizingTheatreActiveWorkLocusClaim[];
    readonly claimConflicts?: readonly OrganizingTheatreWorkLocusClaimConflict[];
    readonly workLocusOptions?: OrganizingTheatreWorkLocusOptions;
    readonly activityPub?: Readonly<{
        readonly kind?: string;
        readonly claim?: string;
        readonly federation?: unknown;
    }>;
    readonly channels?: unknown;
    readonly workField?: Readonly<Record<string, unknown>>;
    readonly recentEvents?: readonly unknown[];
    readonly nextInterfaces?: readonly unknown[];
    readonly harnesses?: readonly string[];
    readonly oldestEventAt?: string | null;
    readonly newestEventAt?: string | null;
    readonly outboxLimit?: number;
}
export interface organizingTheatreModeledAgentSemioticHub {
    readonly kind: string;
    readonly shortName: string;
    readonly title: string;
    readonly claim: string;
    readonly generatedAt: string;
    readonly observer: OrganizingTheatreModeledAgentSemioticHubInput["observer"];
    readonly spacetime: Readonly<{
        readonly eventWindow: number;
        readonly activityWindow: number;
        readonly sessionCount: number;
        readonly harnesses: readonly string[];
        readonly oldestEventAt: string | null;
        readonly newestEventAt: string | null;
        readonly clock: "activitypub-published-order";
    }>;
    readonly activityPub: Readonly<{
        readonly kind: string;
        readonly claim: string;
        readonly context: typeof ACTIVITYSTREAMS_CONTEXT;
        readonly outbox: OrderedCollection;
        readonly federation: unknown;
    }>;
    readonly channels: unknown;
    readonly loci: readonly organizingTheatreAgentLocus[];
    readonly relations: readonly OrganizingTheatreAgentRelation[];
    readonly workField: Readonly<Record<string, unknown>>;
    readonly recentEvents: readonly unknown[];
    readonly nextInterfaces: readonly unknown[];
}
export declare function organizingTheatreAgentLocus(input: OrganizingTheatreAgentLocusInput, options?: OrganizingTheatreAgentLocusOptions): organizingTheatreAgentLocus;
export declare function organizingTheatreCollisionAwarenessFor(yourLane: OrganizingTheatreLaneFocus, peerSessions: readonly OrganizingTheatrePeerFocusSession[], options?: Readonly<{
    max?: number;
}>): readonly OrganizingTheatreCollisionAwareness[];
export declare function organizingTheatreModeledRelations(loci: readonly organizingTheatreAgentLocus[], collisionAwareness: readonly OrganizingTheatreCollisionAwareness[], activeClaims?: readonly OrganizingTheatreActiveWorkLocusClaim[], options?: Readonly<{
    observerSession?: string | null;
    relationKind?: string;
    source?: string;
    coPresentReason?: string;
    max?: number;
}>): readonly OrganizingTheatreAgentRelation[];
export declare function organizingTheatreModeledAgentSemioticHub(input: OrganizingTheatreModeledAgentSemioticHubInput, config: OrganizingTheatreServiceConfig): organizingTheatreModeledAgentSemioticHub;
export {};
//# sourceMappingURL=manifold.d.mts.map