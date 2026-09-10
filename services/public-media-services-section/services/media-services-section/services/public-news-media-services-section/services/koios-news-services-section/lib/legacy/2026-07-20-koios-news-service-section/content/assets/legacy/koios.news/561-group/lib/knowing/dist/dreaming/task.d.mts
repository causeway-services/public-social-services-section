import { type ArticulationCell, type Cell, type Claim, type Mark, type PredicationPredicate, type PredicationTerm, type Token, type UtteranceCarrier } from "@emsenn/relating";
export type Term = PredicationTerm;
export type Utterance = UtteranceCarrier;
export type TaskEvidenceCarrier = Mark | Token | Claim | PredicationPredicate | PredicationTerm | Cell | UtteranceCarrier | ArticulationCell | Task;
/** A task: the cell `subject -predicate-> object` a knower holds, carried with its
 *  articulating utterance — the unit dreaming observes and recombines. */
export interface Task {
    readonly kind: "knowing.task";
    readonly utterance: UtteranceCarrier;
    readonly articulation: ArticulationCell;
    readonly subject: PredicationTerm;
    readonly predicate: PredicationPredicate;
    readonly object: PredicationTerm;
    readonly cell: Cell;
}
export declare function taskCell(taskCarrier: Task): Cell;
export declare function task(input: {
    readonly subject: PredicationTerm;
    readonly predicate: PredicationPredicate;
    readonly object?: PredicationTerm;
}): Task;
export declare function task(input: Cell): Task;
export declare function task(input: UtteranceCarrier): Task;
//# sourceMappingURL=task.d.mts.map