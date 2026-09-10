import { type Activity } from "@emsenn/animating";
import type { OrganizingPerformingActivitySummary, OrganizingPerformingInboxEvent, OrganizingPerformingInboxPerceptionSignal } from "./carriers.mjs";
export type OrganizingTheatreInboxEvent = OrganizingPerformingInboxEvent;
export interface OrganizingTheatreInboxActivitiesOptions {
    readonly inboxSource?: string;
}
export interface OrganizingTheatreInboxPerceptionOptions {
    readonly kind?: string;
    readonly claim?: string;
    readonly perceivedAgentKind?: string;
    readonly window?: number;
    readonly recent?: number;
    readonly contentLimit?: number;
    readonly toLimit?: number;
}
export type OrganizingTheatreActivitySummary = OrganizingPerformingActivitySummary;
export type organizingTheatreInboxPerceptionSignal = OrganizingPerformingInboxPerceptionSignal;
export declare function organizingTheatreActivityAddressedTo(activity: unknown): readonly string[];
export declare function organizingTheatreIsActivity(value: unknown): value is Activity;
export declare function organizingTheatreInboxActivitiesFor(events: readonly OrganizingTheatreInboxEvent[], actorId: string, options?: OrganizingTheatreInboxActivitiesOptions): readonly Activity[];
export declare function organizingTheatreCompactActivitySummary(activity: Activity, options?: OrganizingTheatreInboxPerceptionOptions): OrganizingTheatreActivitySummary;
export declare function organizingTheatreInboxPerceptionSignal(actorId: string, inboxActivities: readonly Activity[], options?: OrganizingTheatreInboxPerceptionOptions): organizingTheatreInboxPerceptionSignal;
//# sourceMappingURL=inbox-perception.d.mts.map