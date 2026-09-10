import { type ResearchPacket } from "../researching/sourcing/research-packets.mjs";
export declare const ACTIVITYSTREAMS_CONTEXT = "https://www.w3.org/ns/activitystreams";
export declare const PUBLICATION_ACTOR = "https://koios.news/activitypub/actor";
export declare const ISSUE_CONTROLLER_CONTRACT = "koios.news/publication-issue-pulse/v1";
export declare const NEWSROOM_RUNNER = "https://koios.news/a2a/newsroom-runner";
export type PublicationIssuePolicy = Readonly<{
    kind: "koios.news.publication-issue-policy";
    version: 1;
    permittedBeats: readonly string[];
    maxIssuesPerPulse: 1;
    maxOpenAssignments: number;
    minimumHoursBetweenNewIssues: number;
    freshnessWindowDays: number;
    selectionMode: "source-driven" | "measured-demand-and-source";
    sourceRefreshAuthorized: boolean;
    triggerAuthorities: readonly Readonly<{
        actor: string;
        capability: string;
    }>[];
    sensitiveBeats: readonly string[];
    law: readonly string[];
}>;
export type IssuePulseSettlement = Readonly<Record<string, unknown>>;
export declare function packetSupportsAssignment(term: string, packet: ResearchPacket): boolean;
export declare function assignmentSourceUrls(term: string, packet: ResearchPacket): readonly string[];
export declare function settleIssuePulse(activity: Readonly<Record<string, unknown>>, options?: Readonly<{
    now?: string;
    dataDir?: string;
    contentDir?: string;
    configPath?: string;
}>): Promise<IssuePulseSettlement>;
//# sourceMappingURL=issue-controller.d.mts.map