import { type Activity } from "@emsenn/animating";
import { type OrganizingTheatreWorkLocusOptions } from "./work-locus.mjs";
interface OrganizingTheatreServiceConfig {
    readonly baseUrl: string;
}
export interface OrganizingTheatreActionProjectionOptions {
    readonly actorId?: string;
    readonly outboxId?: string;
    readonly subjectId?: string;
    readonly packageName: string;
    readonly admission: string;
    readonly sourceAdmission?: string;
    readonly audience?: readonly string[];
}
export interface OrganizingTheatreActionDescriptor {
    readonly name: string;
    readonly href: string;
    readonly summary?: string;
    readonly description?: string;
    readonly input?: string;
    readonly output?: string;
    readonly term?: string;
    readonly strategyTerm?: string;
    readonly sessionTerm?: string;
}
export interface OrganizingTheatreEventActivityOptions extends OrganizingTheatreWorkLocusOptions {
    readonly handoffKind?: string;
    readonly publicAudience?: readonly string[];
}
export interface OrganizingTheatreEventActivityInput {
    readonly id: string;
    readonly at: string;
    readonly source: string;
    readonly session: string;
    readonly harness: string;
    readonly hookEventName: string;
    readonly payload?: Record<string, unknown>;
    readonly extra?: Record<string, unknown>;
    readonly objectExtra?: Record<string, unknown>;
}
export declare function organizingTheatreActivityForEvent(input: OrganizingTheatreEventActivityInput, config: OrganizingTheatreServiceConfig, options?: OrganizingTheatreEventActivityOptions): Activity;
export declare function admittedOrganizingTheatreActionActivities(actions: readonly OrganizingTheatreActionDescriptor[], config: OrganizingTheatreServiceConfig, options: OrganizingTheatreActionProjectionOptions): readonly Activity[];
export {};
//# sourceMappingURL=event-activity.d.mts.map