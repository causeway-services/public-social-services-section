import { ACTIVITYSTREAMS_CONTEXT, type AgentCard, type Activity, type Actor, type OrderedCollection } from "@emsenn/animating";
import type { RWILWitness } from "@emsenn/relating/ledger";
import { type EAVT, type EAVTRecord } from "@emsenn/relating/writing";
import { type organizingTheatreSessionCharacterSurface } from "./performing/session-character.mjs";
import { type OrganizingTheatreInboxActivitiesOptions, type OrganizingTheatreInboxEvent, type OrganizingTheatreInboxPerceptionOptions, type organizingTheatreInboxPerceptionSignal as OrganizingTheatreInboxPerceptionSignal } from "./performing/inbox-perception.mjs";
import { organizingTheatreWorkLocusCapabilitySignal, type OrganizingTheatreActiveWorkLocusClaim, type OrganizingTheatreWorkLocusClaimConflict, type OrganizingTheatreWorkLocusEvent, type OrganizingTheatreWorkLocusOptions } from "./theatre/work-locus.mjs";
import { type OrganizingTheatreEventActivityOptions } from "./theatre/event-activity.mjs";
import * as activitypub from "./theatre/activitypub.mjs";
export { organizingTheatreAgentActorsForEvents, organizingTheatreSessionCharacter, type OrganizingTheatreSessionCharacterOptions, type organizingTheatreSessionCharacterSurface, } from "./performing/session-character.mjs";
export { organizingTheatreActivityAddressedTo, organizingTheatreCompactActivitySummary, organizingTheatreInboxActivitiesFor, organizingTheatreInboxPerceptionSignal, organizingTheatreIsActivity, type OrganizingTheatreActivitySummary, type OrganizingTheatreInboxActivitiesOptions, type OrganizingTheatreInboxEvent, type OrganizingTheatreInboxPerceptionOptions, } from "./performing/inbox-perception.mjs";
export { organizingTheatreActiveWorkLocusClaims, organizingTheatreStrongestPathOverlap, organizingTheatreWorkLocusCapability, organizingTheatreWorkLocusCapabilityGrant, organizingTheatreWorkLocusCapabilitySignal, organizingTheatreWorkLocusClaimConflictsAcross, organizingTheatreWorkLocusClaimConflictsFor, organizingTheatreWorkLocusClaimFrom, type OrganizingTheatreActiveWorkLocusClaim, type OrganizingTheatreWorkLocusClaim, type OrganizingTheatreWorkLocusClaimConflict, type OrganizingTheatreWorkLocusConflictSide, type OrganizingTheatreWorkLocusEvent, type OrganizingTheatreWorkLocusOptions, } from "./theatre/work-locus.mjs";
export * from "./theatre/activitypub.mjs";
export * from "./theatre/manifold.mjs";
export * from "./theatre/event-activity.mjs";
export interface OrganizingTheatreServiceConfig {
    readonly baseUrl: string;
    readonly name?: string;
    readonly preferredUsername?: string;
    readonly summary?: string;
}
export interface OrganizingTheatreInstanceProfileOptions extends OrganizingTheatreServiceConfig {
    readonly namespace: string;
    readonly capabilityBasePath?: string;
    readonly activityPubFederationClaim?: string;
    readonly inboxClaim?: string;
}
export interface organizingTheatreInstanceProfile {
    readonly namespace: string;
    readonly service: OrganizingTheatreServiceConfig;
    readonly workLocus: OrganizingTheatreWorkLocusOptions;
    readonly kinds: Readonly<{
        readonly agentLocus: string;
        readonly agentMashSignal: string;
        readonly agentSessionHandoff: string;
        readonly agentSessionHandoffResource: string;
        readonly activeWorkLocusCapability: string;
        readonly activityPub: string;
        readonly activityPubActor: string;
        readonly activityPubDelivery: string;
        readonly activityPubInboxDelivery: string;
        readonly activityPubInboxPerception: string;
        readonly activityPubInboxPerceivedAgent: string;
        readonly activityPubOutbox: string;
        readonly capabilityField: string;
        readonly mashActivityPubFederation: string;
        readonly mashActivityPubSignal: string;
        readonly modeledAgentSemioticHub: string;
        readonly workLocusClaim: string;
        readonly workLocusClaimConflict: string;
        readonly activeWorkLocusClaim: string;
        readonly workLocusClaimResult: string;
        readonly agentRelation: string;
    }>;
    readonly inbox: OrganizingTheatreInboxActivitiesOptions & OrganizingTheatreInboxPerceptionOptions;
    readonly activityPubFederation: activitypub.organizingTheatreActivityPubFederationProjectionOptions;
    readonly activityPubOutbox: OrganizingTheatreActivityPubOutboxResourceOptions;
    readonly eventActivity: OrganizingTheatreEventActivityOptions;
}
export interface OrganizingTheatreAgentSignalEvent extends OrganizingTheatreWorkLocusEvent, OrganizingTheatreInboxEvent {
    readonly activity?: unknown;
}
export interface OrganizingTheatreWitnessAgentEventOptions extends OrganizingTheatreEventActivityOptions {
    readonly kind?: string;
    readonly cockpit?: string;
    readonly hookAdmissionKind?: string;
    readonly recordedEventKind?: string;
    readonly hookVerb?: string;
    readonly recordedEventVerb?: string;
    readonly hookSource?: string;
    readonly root?: string;
    readonly namespace?: string;
    readonly defaultSession?: string;
    readonly defaultHarness?: string;
}
export interface OrganizingTheatreAgentSignalOptions extends OrganizingTheatreWorkLocusOptions {
    readonly kind?: string;
    readonly activityPubKind?: string;
    readonly capabilityKind?: string;
    readonly generatedAt?: string;
    readonly now?: Date;
    readonly peerClaims?: number;
    readonly peerCapabilities?: number;
    readonly activeClaimsMax?: number;
    readonly claimConflictsMax?: number;
    readonly inbox?: OrganizingTheatreInboxActivitiesOptions & OrganizingTheatreInboxPerceptionOptions;
}
export interface organizingTheatreAgentSignal {
    readonly kind: string;
    readonly generatedAt: string;
    readonly session: string;
    readonly harness: string;
    readonly activeClaims: readonly OrganizingTheatreActiveWorkLocusClaim[];
    readonly yourClaims: readonly OrganizingTheatreActiveWorkLocusClaim[];
    readonly peerClaims: readonly OrganizingTheatreActiveWorkLocusClaim[];
    readonly activeCapabilities: readonly ReturnType<typeof organizingTheatreWorkLocusCapabilitySignal>[];
    readonly yourCapabilities: readonly ReturnType<typeof organizingTheatreWorkLocusCapabilitySignal>[];
    readonly peerCapabilities: readonly ReturnType<typeof organizingTheatreWorkLocusCapabilitySignal>[];
    readonly claimConflicts: readonly OrganizingTheatreWorkLocusClaimConflict[];
    readonly yourClaimConflicts: readonly OrganizingTheatreWorkLocusClaimConflict[];
    readonly activityPub: Omit<activitypub.organizingTheatreActivityPubSignal, "kind"> & Readonly<{
        readonly kind: string;
        readonly observer: Readonly<{
            readonly actor: string;
            readonly inbox: OrganizingTheatreInboxPerceptionSignal;
        }>;
    }>;
}
export interface OrganizingTheatreAgentSessionHandoffInput {
    readonly session: string;
    readonly harness: string;
    readonly hookEventName: string;
    readonly lane: unknown;
    readonly recentEvents: readonly unknown[];
    readonly signal: Pick<organizingTheatreAgentSignal, "yourClaims" | "yourClaimConflicts">;
    readonly latestGate?: unknown;
}
export interface OrganizingTheatreAgentSessionHandoffOptions {
    readonly kind?: string;
    readonly generatedAt?: string;
    readonly touchedPathsMax?: number;
    readonly nextInterfaces?: readonly unknown[];
}
export interface organizingTheatreAgentSessionHandoff {
    readonly kind: string;
    readonly generatedAt: string;
    readonly session: string;
    readonly harness: string;
    readonly hookEventName: string;
    readonly lane: unknown;
    readonly recentEvents: readonly unknown[];
    readonly touchedPaths: readonly string[];
    readonly activeClaims: readonly OrganizingTheatreActiveWorkLocusClaim[];
    readonly claimConflicts: readonly OrganizingTheatreWorkLocusClaimConflict[];
    readonly latestGate: unknown;
    readonly summary: Readonly<{
        readonly recentEvents: number;
        readonly touchedPaths: number;
        readonly activeClaims: number;
        readonly claimConflicts: number;
        readonly lastTool: unknown;
        readonly currentCwd: unknown;
    }>;
    readonly nextInterfaces: readonly unknown[];
}
export interface OrganizingTheatreRecordedAgentSessionHandoffEvent {
    readonly session?: unknown;
    readonly id?: unknown;
    readonly at?: unknown;
    readonly handoff?: unknown;
    readonly handoffCarrier?: unknown;
}
export interface OrganizingTheatreRecordedAgentSessionHandoffOptions {
    readonly handoffKind?: string;
}
export interface OrganizingTheatreAgentSessionHandoffResourceInput {
    readonly session: string;
    readonly recorded?: OrganizingTheatreRecordedAgentSessionHandoffEvent | null;
    readonly handoffCarrier?: unknown;
}
export interface OrganizingTheatreAgentSessionHandoffResourceOptions {
    readonly kind?: string;
    readonly generatedAt?: string;
}
export interface organizingTheatreAgentSessionHandoffResource {
    readonly kind: string;
    readonly generatedAt: string;
    readonly session: string;
    readonly source: "recorded-handoff" | "current-fold";
    readonly event: string | null;
    readonly at: string | null;
    readonly handoff: unknown;
    readonly handoffCarrier: unknown;
}
export interface OrganizingTheatreCapabilityFieldOptions extends OrganizingTheatreWorkLocusOptions {
    readonly kind?: string;
    readonly activityPubKind?: string;
    readonly capabilityKind?: string;
    readonly generatedAt?: string;
    readonly now?: Date;
    readonly limit?: number;
    readonly activeClaimsMax?: number;
    readonly claimConflictsMax?: number;
    readonly nextInterfaces?: readonly unknown[];
}
export interface organizingTheatreCapabilityField {
    readonly kind: string;
    readonly generatedAt: string;
    readonly session: string;
    readonly harness: string;
    readonly focusPaths: readonly string[];
    readonly summary: Readonly<{
        readonly activeCapabilities: number;
        readonly yourCapabilities: number;
        readonly peerCapabilities: number;
        readonly relevantCapabilities: number;
        readonly claimConflicts: number;
        readonly relevantConflicts: number;
        readonly activityPub: Omit<activitypub.organizingTheatreActivityPubSignal, "kind"> & Readonly<{
            readonly kind: string;
        }>;
    }>;
    readonly capabilities: Readonly<{
        readonly yours: readonly ReturnType<typeof organizingTheatreWorkLocusCapabilitySignal>[];
        readonly peers: readonly ReturnType<typeof organizingTheatreWorkLocusCapabilitySignal>[];
        readonly relevant: readonly ReturnType<typeof organizingTheatreWorkLocusCapabilitySignal>[];
    }>;
    readonly conflicts: Readonly<{
        readonly yours: readonly OrganizingTheatreWorkLocusClaimConflict[];
        readonly relevant: readonly OrganizingTheatreWorkLocusClaimConflict[];
    }>;
    readonly nextInterfaces: readonly unknown[];
}
export interface OrganizingTheatreActivityPubOutboxResourceOptions {
    readonly kind?: string;
    readonly signalKind?: string;
    readonly federationKind?: string;
    readonly deliveryKind?: string;
    readonly generatedAt?: string;
    readonly limit?: number;
    readonly nextInterfaces?: readonly unknown[];
}
export interface organizingTheatreActivityPubOutboxResource {
    readonly kind: string;
    readonly generatedAt: string;
    readonly session: string;
    readonly harness: string;
    readonly scope: "theatre" | "actor";
    readonly actor: string | null;
    readonly context: typeof ACTIVITYSTREAMS_CONTEXT;
    readonly totalActivities: number;
    readonly window: number;
    readonly outbox: OrderedCollection;
    readonly actors: readonly Readonly<{
        readonly id: string;
        readonly type: string;
        readonly preferredUsername: string;
        readonly inbox: string;
        readonly outbox: string;
    }>[];
    readonly federation: unknown;
    readonly signal: Omit<activitypub.organizingTheatreActivityPubSignal, "kind"> & Readonly<{
        readonly kind: string;
    }>;
    readonly nextInterfaces: readonly unknown[];
}
export interface OrganizingTheatreActivityPubActorResourceOptions extends OrganizingTheatreWorkLocusOptions {
    readonly kind?: string;
    readonly generatedAt?: string;
    readonly capabilityKind?: string;
    readonly inbox?: OrganizingTheatreInboxActivitiesOptions & OrganizingTheatreInboxPerceptionOptions;
    readonly limit?: number;
    readonly outboxResourceOptions?: OrganizingTheatreActivityPubOutboxResourceOptions;
    readonly nextInterfaces?: readonly unknown[];
}
export interface organizingTheatreActivityPubActorResource {
    readonly kind: string;
    readonly generatedAt: string;
    readonly session: string;
    readonly harness: string;
    readonly actor: Actor;
    readonly sessionCharacter: organizingTheatreSessionCharacterSurface | null;
    readonly agentCard: AgentCard | null;
    readonly summary: Readonly<{
        readonly activities: number;
        readonly inboxActivities: number;
        readonly inboxPerception: unknown;
        readonly activeCapabilities: number;
        readonly lastEventAt: string | null;
        readonly lastTool: string | null;
        readonly focusPaths: readonly string[];
    }>;
    readonly capabilities: readonly ReturnType<typeof organizingTheatreWorkLocusCapabilitySignal>[];
    readonly outbox: OrderedCollection;
    readonly inbox: OrderedCollection;
    readonly inboxPerception: OrganizingTheatreInboxPerceptionSignal;
    readonly nextInterfaces: readonly unknown[];
}
export declare function organizingTheatreAgentEventsFromWitnessRows(rows: readonly (EAVT | EAVTRecord | RWILWitness)[], config: OrganizingTheatreServiceConfig, options?: OrganizingTheatreWitnessAgentEventOptions): readonly OrganizingTheatreAgentSignalEvent[];
export declare function organizingTheatreInstanceProfile(options: OrganizingTheatreInstanceProfileOptions): organizingTheatreInstanceProfile;
export declare function organizingTheatreAgentSignal(input: Readonly<{
    readonly session: string;
    readonly harness: string;
    readonly events: readonly OrganizingTheatreAgentSignalEvent[];
    readonly activities?: readonly Activity[];
    readonly activeClaims?: readonly OrganizingTheatreActiveWorkLocusClaim[];
    readonly claimConflicts?: readonly OrganizingTheatreWorkLocusClaimConflict[];
    readonly inboxActivities?: readonly Activity[];
    readonly seedActors?: readonly Actor[];
    readonly actorId?: string;
}>, config: OrganizingTheatreServiceConfig, options?: OrganizingTheatreAgentSignalOptions): organizingTheatreAgentSignal;
export declare function organizingTheatreAgentSessionHandoff(input: OrganizingTheatreAgentSessionHandoffInput, options?: OrganizingTheatreAgentSessionHandoffOptions): organizingTheatreAgentSessionHandoff;
export declare function organizingTheatreLatestRecordedAgentSessionHandoff(events: readonly OrganizingTheatreRecordedAgentSessionHandoffEvent[], session: string, options?: OrganizingTheatreRecordedAgentSessionHandoffOptions): OrganizingTheatreRecordedAgentSessionHandoffEvent | null;
export declare function organizingTheatreAgentSessionHandoffResource(input: OrganizingTheatreAgentSessionHandoffResourceInput, options?: OrganizingTheatreAgentSessionHandoffResourceOptions): organizingTheatreAgentSessionHandoffResource;
export declare function organizingTheatreCapabilityField(input: Readonly<{
    readonly session: string;
    readonly harness: string;
    readonly events: readonly OrganizingTheatreAgentSignalEvent[];
    readonly focusPaths?: readonly string[];
    readonly activities?: readonly Activity[];
    readonly activeClaims?: readonly OrganizingTheatreActiveWorkLocusClaim[];
    readonly claimConflicts?: readonly OrganizingTheatreWorkLocusClaimConflict[];
    readonly seedActors?: readonly Actor[];
}>, config: OrganizingTheatreServiceConfig, options?: OrganizingTheatreCapabilityFieldOptions): organizingTheatreCapabilityField;
export declare function organizingTheatreActivityPubOutboxResource(input: Readonly<{
    readonly session: string;
    readonly harness: string;
    readonly events: readonly OrganizingTheatreAgentSignalEvent[];
    readonly actor?: string | null;
    readonly admittedActionActivities?: readonly Activity[];
    readonly seedActors?: readonly Actor[];
}>, config: OrganizingTheatreServiceConfig, options?: OrganizingTheatreActivityPubOutboxResourceOptions): organizingTheatreActivityPubOutboxResource;
export declare function organizingTheatreActivityPubActorResource(input: Readonly<{
    readonly session: string;
    readonly harness: string;
    readonly actorId: string;
    readonly events: readonly OrganizingTheatreAgentSignalEvent[];
    readonly admittedActionActivities?: readonly Activity[];
    readonly seedActors?: readonly Actor[];
    readonly activeClaims?: readonly OrganizingTheatreActiveWorkLocusClaim[];
    readonly actor?: Actor;
    readonly lane?: Readonly<{
        readonly lastEventAt?: string | null;
        readonly lastTool?: string | null;
        readonly focusPaths?: readonly string[];
    }> | null;
    readonly actorHarness?: string;
    readonly actorSession?: string;
}>, config: OrganizingTheatreServiceConfig, options?: OrganizingTheatreActivityPubActorResourceOptions): organizingTheatreActivityPubActorResource;
//# sourceMappingURL=theatre.d.mts.map