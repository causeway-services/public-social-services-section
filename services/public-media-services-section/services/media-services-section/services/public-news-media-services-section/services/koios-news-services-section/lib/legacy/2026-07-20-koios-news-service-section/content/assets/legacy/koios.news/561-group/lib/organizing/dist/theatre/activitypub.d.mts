import { ACTIVITYSTREAMS_CONTEXT, type Activity, type Actor, type OrderedCollection } from "@emsenn/animating";
import { type OrganizingTheatreSessionCharacterOptions } from "../performing/session-character.mjs";
export interface OrganizingTheatreServiceConfig {
    readonly baseUrl: string;
    readonly name?: string;
    readonly preferredUsername?: string;
    readonly summary?: string;
}
export interface organizingTheatreServiceProjection {
    readonly actor: Actor;
    readonly outboxId: string;
    readonly inboxId: string;
    readonly actionSubjectId: string;
}
export type OrganizingTheatreActivityPubEndpoint = "actor" | "inbox" | "outbox";
export interface organizingTheatreActivityPubRoute {
    readonly endpoint: OrganizingTheatreActivityPubEndpoint;
    readonly actorId: string;
    readonly limit?: string;
    readonly eventScanLimit?: string;
}
export interface organizingTheatreWebFingerActor {
    readonly resource: string;
    readonly actorId: string;
}
export interface OrganizingTheatreActivityPubCamp {
    readonly id: string;
    readonly members: readonly Actor[];
    readonly sharedInbox: string;
}
export interface OrganizingTheatreActivityPubDelivery {
    readonly kind: "organizing.theatre.activitypub.delivery";
    readonly context: string;
    readonly activity: string | null;
    readonly type: string;
    readonly actor: string;
    readonly targets: readonly string[];
    readonly reach: number;
}
export interface organizingTheatreActivityPubFederation {
    readonly kind: "organizing.theatre.activitypub.federation";
    readonly camps: readonly Readonly<{
        readonly id: string;
        readonly members: readonly string[];
        readonly sharedInbox: string;
    }>[];
    readonly deliveries: readonly OrganizingTheatreActivityPubDelivery[];
    readonly reading: unknown;
}
export interface organizingTheatreActivityPubFederationProjectionOptions {
    readonly kind?: string;
    readonly claim?: string;
    readonly deliveryKind?: string;
}
export interface organizingTheatreActivityPubFederationProjection {
    readonly kind: string;
    readonly claim: string;
    readonly camps: readonly Readonly<{
        readonly id: string;
        readonly members: readonly string[];
        readonly sharedInbox: string | null;
    }>[];
    readonly deliveries: readonly Readonly<Omit<OrganizingTheatreActivityPubDelivery, "kind"> & {
        readonly kind: string;
    }>[];
    readonly reading: unknown;
}
export interface organizingTheatreActivityPubSignal {
    readonly kind: "organizing.theatre.activitypub.signal";
    readonly context: typeof ACTIVITYSTREAMS_CONTEXT;
    readonly activityWindow: number;
    readonly actorCount: number;
    readonly camps: readonly Readonly<{
        readonly id: string;
        readonly members: number;
        readonly sharedInbox: string;
    }>[];
    readonly deliveryReach: number;
    readonly reading: unknown;
}
export interface organizingTheatreActivityPubSignalProjectionOptions {
    readonly kind?: string;
}
export type organizingTheatreActivityPubSignalProjection = Omit<organizingTheatreActivityPubSignal, "kind"> & Readonly<{
    readonly kind: string;
}>;
export interface OrganizingTheatreAgentActorLocus {
    readonly session: string;
    readonly harnesses?: readonly string[];
    readonly hooks?: number;
    readonly lastTool?: string | null;
    readonly lane?: Readonly<{
        readonly currentCwd?: string | null;
        readonly focusPaths?: readonly string[];
        readonly lastTool?: string | null;
    }> | null;
}
export interface organizingTheatreAgentActorSession {
    readonly harness: string;
    readonly session: string;
}
export declare function organizingTheatreServiceProjection(config: OrganizingTheatreServiceConfig): organizingTheatreServiceProjection;
export declare function organizingTheatreOutbox(activities: readonly Activity[], config: OrganizingTheatreServiceConfig): OrderedCollection;
export declare function organizingTheatreInbox(activities: readonly Activity[], config: OrganizingTheatreServiceConfig): OrderedCollection;
export declare function acceptsOrganizingTheatreActivityPub(accept: string | readonly string[] | undefined): boolean;
export declare function organizingTheatreActivityPubRoute(input: Readonly<{
    pathname: string;
    method?: string;
    accept?: string | readonly string[];
    searchParams?: URLSearchParams;
}>, config: OrganizingTheatreServiceConfig): organizingTheatreActivityPubRoute | null;
export declare function organizingTheatreWebFingerActor(resource: string, config: OrganizingTheatreServiceConfig): organizingTheatreWebFingerActor | null;
export declare function organizingTheatreActivityPubActors(activities: readonly Activity[], config: OrganizingTheatreServiceConfig, seedActors?: readonly Actor[]): readonly Actor[];
export declare function organizingTheatreAgentActor(config: OrganizingTheatreServiceConfig, harness: string, session: string, options?: OrganizingTheatreSessionCharacterOptions): Actor;
export declare function organizingTheatreAgentActorFromIri(id: string, config: OrganizingTheatreServiceConfig, options?: OrganizingTheatreSessionCharacterOptions): Actor;
export declare function organizingTheatreAgentActorForLocus(config: OrganizingTheatreServiceConfig, harness: string, locus: OrganizingTheatreAgentActorLocus, options?: OrganizingTheatreSessionCharacterOptions): Actor;
export declare function organizingTheatreAgentActorsForLoci(loci: readonly OrganizingTheatreAgentActorLocus[], config: OrganizingTheatreServiceConfig, options?: OrganizingTheatreSessionCharacterOptions): readonly Actor[];
export declare function organizingTheatreAgentActorSession(id: string, config: OrganizingTheatreServiceConfig): organizingTheatreAgentActorSession | null;
export declare function organizingTheatreActivityPubCamps(actors: readonly Actor[], config: OrganizingTheatreServiceConfig): readonly OrganizingTheatreActivityPubCamp[];
export declare function organizingTheatreActivityPubFederation(activities: readonly Activity[], config: OrganizingTheatreServiceConfig, seedActors?: readonly Actor[]): organizingTheatreActivityPubFederation;
export declare function organizingTheatreActivityPubSignal(activities: readonly Activity[], config: OrganizingTheatreServiceConfig, seedActors?: readonly Actor[]): organizingTheatreActivityPubSignal;
export declare function organizingTheatreActivityPubFederationProjection(activities: readonly Activity[], config: OrganizingTheatreServiceConfig, seedActors?: readonly Actor[], options?: organizingTheatreActivityPubFederationProjectionOptions): organizingTheatreActivityPubFederationProjection;
export declare function organizingTheatreActivityPubSignalProjection(activities: readonly Activity[], config: OrganizingTheatreServiceConfig, seedActors?: readonly Actor[], options?: organizingTheatreActivityPubSignalProjectionOptions): organizingTheatreActivityPubSignalProjection;
export declare function organizingTheatreAgentActorId(config: OrganizingTheatreServiceConfig, harness: string, session: string): string;
//# sourceMappingURL=activitypub.d.mts.map