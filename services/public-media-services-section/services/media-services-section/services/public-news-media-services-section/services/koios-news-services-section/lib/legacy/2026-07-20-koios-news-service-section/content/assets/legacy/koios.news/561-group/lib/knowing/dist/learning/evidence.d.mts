import { type ChargeValueName, type MemeTopologyFixedPointReadings, type SectionCarrier, type UtteranceCarrier } from "@emsenn/relating";
/**
 * One evidential claim for learning: names a cell `subject -predicate-> object`
 * (two-place when `object` is absent, articulated on the diagonal) plus an opaque
 * provenance carried only at the learning layer. An entry carries no charge — a
 * contrary fact is a separate entry asserting a contrary predicate.
 */
export interface LessonEvidence {
    readonly subject: string;
    readonly predicate: string;
    readonly object?: string;
    /** Opaque provenance, carried at the learning layer — never into the bedrock. */
    readonly provenance?: unknown;
}
/** The single utterance a learning-evidence item articulates: relational when the
 *  item is three-place, diagonal when it is two-place. */
export declare function utterEvidence(entry: LessonEvidence): UtteranceCarrier;
/** The utterances of a whole learning-evidence set, in entry order. */
export declare function utterEvidenceSet(entries: readonly LessonEvidence[]): readonly UtteranceCarrier[];
/**
 * One lesson measured from evidence: its original evidence coordinates, the
 * charge value measured in the knowledge-least section of the induced world, and
 * every provenance value attached to the cell in evidence order.
 */
export interface DerivedLesson {
    readonly subject: string;
    readonly predicate: string;
    readonly object?: string;
    readonly value: ChargeValueName;
    readonly provenance: readonly unknown[];
}
type SectionOrder = "knowledge" | "truth";
type SectionBound = "least" | "greatest";
/**
 * Derive lessons per distinct evidence cell: induce the world the evidence
 * utters, then read each cell's measured charge from the knowledge-least section.
 * Charges are derived from the settled world, never admitted as evidence.
 */
export declare function deriveLessons(entries: readonly LessonEvidence[]): readonly DerivedLesson[];
/**
 * Append-only utterance memory for learning evidence. It admits utterances
 * accretively, recalls them by projected task cell, and only induces sections on
 * explicit reads.
 */
export declare class LessonMemory {
    #private;
    admit(...utterances: readonly UtteranceCarrier[]): this;
    recall(subject: string, predicate: string, object?: string): readonly UtteranceCarrier[];
    has(subject: string, predicate: string, object?: string): boolean;
    get size(): number;
    get utterances(): readonly UtteranceCarrier[];
    carrier(): ReturnType<typeof settleLearningUtterances>;
    section(order?: SectionOrder, bound?: SectionBound): SectionCarrier;
}
declare function settleLearningUtterances(utterances: readonly UtteranceCarrier[]): MemeTopologyFixedPointReadings;
export {};
//# sourceMappingURL=evidence.d.mts.map