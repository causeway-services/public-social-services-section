import { type Cell, type CellSet, type ChargeCarrier, type Mark, type PredicationPredicate, type PredicationTerm, type UtteranceCarrier } from "@emsenn/relating";
import type { SkillResult as AnimatingSkillResult } from "@emsenn/animating";
export type OrganizingCarrierTerm = null | boolean | number | string | readonly OrganizingCarrierTerm[];
export type FiberCoordinate = Readonly<{
    term: PredicationTerm;
}>;
export type Fiber = Readonly<{
    entries: readonly Readonly<{
        coordinate: FiberCoordinate;
    }>[];
}>;
export type WorkId = PredicationTerm;
export type OfficeName = PredicationTerm;
export type CapabilityName = PredicationTerm;
export type DutyName = PredicationTerm;
export type WorkTerm = PredicationTerm;
export type WorkStatus = ChargeCarrier;
export type WorkEvidenceBearing = Readonly<{
    term: PredicationTerm;
    evidence?: readonly WorkEvidenceCarrier[];
}>;
export type TaskClosure = Readonly<{
    goalCells: readonly Readonly<{
        cell: string;
        determinedAtDispatch: boolean;
    }>[];
    rules: readonly Readonly<{
        name: string;
        branching: boolean;
    }>[];
}>;
export type WorkType = "task" | "procedure" | "process" | "project";
type WorkPredicateLabel = "agent" | "task" | "work" | "office" | "duty" | "capability" | "assignment" | "assignee" | "report" | "goal" | "initial" | "evidence";
export type WorkEvidenceCarrier = Mark | PredicationTerm | PredicationPredicate | UtteranceCarrier | Cell | CellSet | WorkFactCarrier | WorkAgent | WorkTask | WorkItem | WorkAssignment | WorkProject | WorkReport;
export interface WorkFactCarrier {
    readonly kind: "organizing.work.fact";
    readonly utterance: UtteranceCarrier;
    readonly cell: Cell;
}
export interface WorkAgent {
    readonly kind: "organizing.work.agent";
    readonly term: PredicationTerm;
    readonly capabilities?: readonly CapabilityName[];
    readonly evidence?: readonly WorkEvidenceCarrier[];
    readonly carrier: UtteranceCarrier;
    readonly facts: CellSet;
}
export interface WorkTask {
    readonly kind: "organizing.work.task";
    readonly term: PredicationTerm;
    readonly goals: CellSet;
    readonly initial?: CellSet;
    readonly evidence?: readonly WorkEvidenceCarrier[];
    readonly carrier: UtteranceCarrier;
    readonly facts: CellSet;
}
export interface WorkItem {
    readonly kind: "organizing.work.item";
    readonly term: WorkId;
    readonly task: WorkTask;
    readonly office?: OfficeName;
    readonly evidence?: readonly WorkEvidenceCarrier[];
    readonly carrier: UtteranceCarrier;
    readonly facts: CellSet;
}
export interface WorkAssignment {
    readonly kind: "organizing.work.assignment";
    readonly term: PredicationTerm;
    readonly work: WorkItem;
    readonly office: OfficeName;
    readonly assignee?: WorkAgent;
    readonly duties: readonly DutyName[];
    readonly at?: WorkEvidenceCarrier;
    readonly evidence?: readonly WorkEvidenceCarrier[];
    readonly carrier: UtteranceCarrier;
    readonly facts: CellSet;
}
export interface WorkProject {
    readonly kind: "organizing.work.project";
    readonly term: PredicationTerm;
    readonly work: readonly WorkItem[];
    readonly offices: readonly OfficeName[];
    readonly assignments: readonly WorkAssignment[];
    readonly evidence?: readonly WorkEvidenceCarrier[];
    readonly carrier: UtteranceCarrier;
    readonly facts: CellSet;
}
export interface WorkReport {
    readonly kind: "organizing.work.report";
    readonly term: PredicationTerm;
    readonly work: WorkItem;
    readonly office: OfficeName;
    readonly charge: ChargeCarrier;
    readonly at?: WorkEvidenceCarrier;
    readonly evidence?: readonly WorkEvidenceCarrier[];
    readonly carrier: UtteranceCarrier;
    readonly facts: CellSet;
}
export declare const WORK_PREDICATES: Readonly<Record<WorkPredicateLabel, PredicationPredicate>>;
export declare function workSubject(term: PredicationTerm): WorkId;
export declare function workTerm(value: OrganizingCarrierTerm): PredicationTerm;
export declare const term: typeof workTerm;
export declare function workPredicateTerm(value: OrganizingCarrierTerm): PredicationPredicate;
export declare const predicate: typeof workPredicateTerm;
export declare function officeTerm(value: string): PredicationTerm;
export declare function fiberCoordinate(value: PredicationTerm): FiberCoordinate;
export declare function fiber(coordinates: readonly FiberCoordinate[]): Fiber;
export declare function fiberOf(values: readonly string[], axis?: "capability" | "authority"): Fiber;
export declare function workAgent(input: {
    readonly term: PredicationTerm;
    readonly capabilities?: readonly CapabilityName[];
    readonly evidence?: readonly WorkEvidenceCarrier[];
}): WorkAgent;
export declare function workTask(input: {
    readonly term: PredicationTerm;
    readonly goals: readonly Cell[] | CellSet;
    readonly initial?: readonly Cell[] | CellSet;
    readonly evidence?: readonly WorkEvidenceCarrier[];
}): WorkTask;
export declare function workItem(input: {
    readonly term: WorkId;
    readonly task: WorkTask;
    readonly office?: OfficeName;
    readonly evidence?: readonly WorkEvidenceCarrier[];
}): WorkItem;
export declare function assignWork(input: {
    readonly term: PredicationTerm;
    readonly work: WorkItem;
    readonly office: OfficeName;
    readonly assignee?: WorkAgent;
    readonly duties?: readonly DutyName[];
    readonly at?: WorkEvidenceCarrier;
    readonly evidence?: readonly WorkEvidenceCarrier[];
}): WorkAssignment;
export declare function workProject(input: {
    readonly term: PredicationTerm;
    readonly work: readonly WorkItem[];
    readonly offices?: readonly OfficeName[];
    readonly assignments?: readonly WorkAssignment[];
    readonly evidence?: readonly WorkEvidenceCarrier[];
}): WorkProject;
export declare function workReport(input: {
    readonly term: PredicationTerm;
    readonly work: WorkItem;
    readonly office: OfficeName;
    readonly charge: ChargeCarrier;
    readonly at?: WorkEvidenceCarrier;
    readonly evidence?: readonly WorkEvidenceCarrier[];
}): WorkReport;
/** Where a single-agent skillful-work outcome lands in the social-scale ledger: a Success is
 *  `complete`; a ⊤-contradiction error is `blocked` (actionable — it wants a plan item); a
 *  ⊥-absence error is `noted` (an outcome, not a defect — "looked, found nothing"). The routing
 *  reads the SkillResult's CHARGE, which is the same bilattice value organizing's
 *  `workChargeStatus` already uses (complete→potential, blocked→⊤ stable, proposed→⊥ absurd) —
 *  so no translation table is needed between the agent kernel and the work ledger. */
export type SkillResultRouting = "complete" | "blocked" | "noted";
export declare function skillResultRouting(result: AnimatingSkillResult): SkillResultRouting;
/** Route an animating `SkillResult` (one agent's invocation outcome) into an organizing
 *  `WorkReport` (the social-scale work ledger entry). The result's bilattice CHARGE carries
 *  through unchanged — success and error are the classical / non-classical regions of one FOUR,
 *  shared across the two scales. A failure threads its error class and message as report
 *  evidence so the improvement loop downstream can triage it (⊤ `blocked` → a plan item;
 *  ⊥ `noted` → recorded outcome). The actual judgment is animating's; organizing only ledgers it. */
export declare function reportSkillResult(input: {
    readonly term: PredicationTerm;
    readonly work: WorkItem;
    readonly office: OfficeName;
    readonly result: AnimatingSkillResult;
    readonly at?: WorkEvidenceCarrier;
    readonly evidence?: readonly WorkEvidenceCarrier[];
}): WorkReport;
export declare function deriveWorkType(closure: TaskClosure): WorkType;
export declare function termKey(value: PredicationTerm): string;
export declare function uniqueTerms(values: readonly PredicationTerm[]): readonly PredicationTerm[];
export declare function termValue(value: PredicationTerm): unknown;
export declare function officeName(value: PredicationTerm | undefined, fallback?: string): string;
export declare function workEvidenceValue(item: WorkEvidenceBearing, key: string): unknown;
export declare function workTitle(item: WorkEvidenceBearing): string;
export declare function workStatusName(item: WorkEvidenceBearing): string;
export declare function workPriority(item: WorkEvidenceBearing): number;
export declare function workPrompt(item: WorkEvidenceBearing): string;
export declare function workChargeStatus(item: WorkEvidenceBearing): WorkStatus;
export {};
//# sourceMappingURL=work.d.mts.map