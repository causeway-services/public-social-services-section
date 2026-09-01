import { type Agent, type AgentCard, type Activity, type Actor } from "@emsenn/animating";
import { type Design, type SessionCharacterReading } from "@emsenn/playing";
import { type Troupe } from "../casting/index.mjs";
import { type Situation } from "../situation/index.mjs";
import type { Camp } from "../writing/activitypub/index.mjs";
import type { OrganizingPerformingSessionCharacterLane, OrganizingPerformingSessionEvent } from "./carriers.mjs";
export interface OrganizingTheatreServiceConfig {
    readonly baseUrl: string;
}
export type OrganizingTheatreSessionEvent = OrganizingPerformingSessionEvent;
export type OrganizingTheatreSessionCharacterLane = OrganizingPerformingSessionCharacterLane;
export interface OrganizingTheatreSessionCharacterOptions {
    readonly actorId?: string;
    readonly events?: readonly OrganizingTheatreSessionEvent[];
    readonly activities?: readonly Activity[];
    readonly lane?: Readonly<OrganizingTheatreSessionCharacterLane> | null;
    readonly situation?: Situation;
    readonly troupeDesigns?: readonly Design[];
    readonly universe?: readonly Design[];
    readonly admittedActions?: readonly string[];
    readonly version?: string;
}
export interface organizingTheatreSessionCharacterSurface {
    readonly kind: "organizing.theatre.session-character";
    readonly actor: string;
    readonly camp: Camp | null;
    readonly situation: Situation;
    readonly troupe: Troupe | null;
    readonly reading: SessionCharacterReading<Agent>;
    readonly agentCard: AgentCard;
}
export declare function organizingTheatreSessionCharacter(config: OrganizingTheatreServiceConfig, harness: string, session: string, options?: OrganizingTheatreSessionCharacterOptions): organizingTheatreSessionCharacterSurface;
export declare function organizingTheatreAgentActorsForEvents(events: readonly OrganizingTheatreSessionEvent[], config: OrganizingTheatreServiceConfig, options?: OrganizingTheatreSessionCharacterOptions): readonly Actor[];
export declare function organizingTheatreAgentActorId(config: OrganizingTheatreServiceConfig, harness: string, session: string): string;
export declare function organizingTheatreActionNamesFromActivities(activities: readonly Activity[]): readonly string[];
//# sourceMappingURL=session-character.d.mts.map