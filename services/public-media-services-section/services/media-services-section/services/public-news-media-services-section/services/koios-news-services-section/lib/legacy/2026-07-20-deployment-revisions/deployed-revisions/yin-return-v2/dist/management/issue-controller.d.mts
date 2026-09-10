import { type KoiosPost } from "../content.mjs";
import { type SourceDrivenNomination } from "../researching/sourcing/discovery.mjs";
import { type ResearchPacket } from "../researching/sourcing/research-packets.mjs";
import { type AssignmentReading } from "../researching/writing/assignments.mjs";
import { type JsonObject } from "./ledger.mjs";
import { type LearningReading } from "./newsroom-learning.mjs";
import { type KeywordOpportunityBrief } from "./keyword-opportunity-service.mjs";
import { type AudienceProductReading } from "./audience-product-planning.mjs";
export declare const ACTIVITYSTREAMS_CONTEXT = "https://www.w3.org/ns/activitystreams";
export declare const PUBLICATION_ACTOR = "https://koios.news/activitypub/actor";
export declare const ISSUE_CONTROLLER_CONTRACT = "koios.news/publication-issue-pulse/v1";
export declare const NEWSROOM_RUNNER = "https://koios.news/a2a/newsroom-runner";
export declare const SOURCE_INTELLIGENCE_REPLAY_MECHANISM_VERSION = 2;
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
type Candidate = Readonly<{
    origin: "measured-demand" | "source-desk" | "keyword-research";
    term: string;
    beat: string;
    priority: number;
    summary: string;
    angle: string;
    sourceUrls: readonly string[];
    packet: ResearchPacket;
    evidence: Readonly<{
        views: number;
        impressions: number;
        clicks: number;
        covered: boolean;
    }>;
    title?: string;
    nomination?: SourceDrivenNomination;
    sourceStatus: "owned-source-candidate" | "source-discovery-required";
    keywordOpportunity?: Readonly<JsonObject>;
}>;
/** Bound provider spending without letting one product band monopolize every
 * attempted slot. Portfolio slots are evaluated first; score-ranked overflow
 * then fills the remaining bounded attempts. A refused reach lead therefore
 * releases causal room for core and depth journalism in the same pulse. */
export declare function boundedCandidateEvaluationSlate<T extends Pick<Candidate, "sourceUrls">>(candidates: readonly T[], reading: AudienceProductReading, maximum?: number): readonly T[];
/** Preserve exploration breadth before audience allocation. Source body depth
 * ranks candidates within a product, but it must not let verbose feeds erase
 * an entire product line before the product planner can compare it. */
export declare function diversifySourceNominations(nominations: readonly SourceDrivenNomination[], options?: Readonly<{
    maximumPerProduct?: number;
    maximumTotal?: number;
}>): readonly SourceDrivenNomination[];
/** Convert Keyword Research's unserved opportunities into procurement plans.
 * These are deliberately source-empty and cannot become assignments until
 * Journalism Commissioning separately buys discovery, retrieval, and packet
 * admission. */
export declare function keywordOpportunityCandidates(input: Readonly<{
    brief: KeywordOpportunityBrief;
    permittedBeats: ReadonlySet<string>;
    configPath: string;
}>): readonly Candidate[];
/** A thin demand term may buy discovery, but it may not remain the event
 * spine of a commission. Promote it only from provider-authored search-result
 * metadata; the later retrieved texts still carry all factual warrant. */
export declare function resolvedKeywordEventTerm(original: string, candidates: readonly Readonly<JsonObject>[]): string;
/** Search results are leads, not corroboration. Before Koios buys retrieval,
 * require provider-authored metadata to preserve enough of the concrete event
 * spine that the candidate could independently report the same occurrence. */
export declare function sourceDiscoveryCandidateSupportsEvent(candidate: Readonly<JsonObject>, event: string): boolean;
export type AdmittedIssuePulseIdentity = Readonly<{
    actor: string;
    capability: string;
    pulseId: string;
    policyDigest: string;
    activityDigest: string;
}>;
/** Pure authority check for work, such as resuming a pending release, which
 * must happen before the issue controller is allowed to form new work. */
export declare function inspectAdmittedIssuePulse(activity: Readonly<Record<string, unknown>>): AdmittedIssuePulseIdentity | undefined;
export declare function reservedSourceUrls(assignments: readonly AssignmentReading[], posts: readonly KoiosPost[], sourceReuseReleasedAssignments: ReadonlySet<string>): ReadonlySet<string>;
export declare function independentSourceDomainCount(urls: readonly string[]): number;
export declare function admittedIndependentSourceDomainCount(packet: Pick<ResearchPacket, "intakeSources">): number;
export declare function sourceUrlsMeetingDomainFloor(existing: readonly string[], discovered: readonly string[], requiredDomains: number): readonly string[];
export declare function packetSupportsAssignment(term: string, packet: ResearchPacket): boolean;
export declare function assignmentSourceUrls(term: string, packet: ResearchPacket): readonly string[];
/** Select the evidentiary repair that must precede any further prose spend.
 * This projects an existing source-depth refusal into an executable learning
 * move while leaving discovery, retrieval, and admission to their providers. */
export declare function selectSourceIntelligenceBacklog(dataDir: string, now: string, contentDir?: string): LearningReading | undefined;
/** Select only a repair service demand that can be executed against the
 * manuscript as it exists now. A historical failure whose manuscript has
 * since changed is evidence for learning, but it is no longer a commodity a
 * repair provider can lawfully accept. */
export declare function selectRepairableBacklog(dataDir: string, now: string, contentDir?: string): LearningReading | undefined;
/** A completed circuit is the terminal witness even when an older
 * assignment-state projection missed its corresponding transition. Queue
 * capacity follows the causal record, not a stale projection. */
export declare function completedCircuitAssignmentIds(dataDir: string): ReadonlySet<string>;
/** Make the issue policy's bounded work-in-progress limit operational. The
 * publication, not Clockkeeper or Codex, activates the best ready inventory
 * and defers overflow without destroying it. A later pulse promotes the next
 * candidate after the active assignment reaches a terminal disposition. */
export declare function settleOpenAssignmentPortfolio(input: Readonly<{
    dataDir: string;
    posts?: readonly KoiosPost[];
    completedAssignmentIds?: ReadonlySet<string>;
    permittedBeats: ReadonlySet<string>;
    maximum: number;
    now: string;
}>): Readonly<{
    active: readonly string[];
    deferred: readonly string[];
    changed: readonly string[];
}>;
export declare function settleIssuePulse(activity: Readonly<Record<string, unknown>>, options?: Readonly<{
    now?: string;
    dataDir?: string;
    contentDir?: string;
    configPath?: string;
}>): Promise<IssuePulseSettlement>;
export {};
//# sourceMappingURL=issue-controller.d.mts.map