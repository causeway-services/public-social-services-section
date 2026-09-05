/**
 * learning — KnowingTrace → KnowingLessons: the learning step, nested under studying.
 *
 * Third derivative. Learning distils the studied trace into lessons: every settling
 * increment that adds cells is one lesson, whose restriction is the cells it added —
 * a knowledge-increment along the knowledge order ≤_k (the verb memory has
 * actually settled: naturalized/logical induction). This is exactly the per-step
 * climb the cognizing surface names `absorb`, here over a memory-region settlement.
 * Reads only @emsenn/relating. Its codomain (KnowingLessons) is the
 * domain of `teaching` and `tutoring`.
 */
import type { SettlingIncrement, CellSet } from "@emsenn/relating";
import type { KnowingTrace } from "../studying.mjs";
/** One lesson: the restriction (added cells) of one cell-adding settling increment. */
export interface KnowingLesson {
    readonly kind: "knowing.lesson";
    readonly increment: SettlingIncrement;
    readonly restriction: CellSet;
}
/** Knowing's learning carrier: the trace read through the lessons its increments yield. */
export interface KnowingLessons {
    readonly kind: "knowing.lessons";
    readonly trace: KnowingTrace;
    readonly lessons: readonly KnowingLesson[];
}
/** learn : KnowingTrace → KnowingLessons. Empty increments yield no retained lesson. */
export declare function learning(trace: KnowingTrace): KnowingLessons;
//# sourceMappingURL=learning.d.mts.map