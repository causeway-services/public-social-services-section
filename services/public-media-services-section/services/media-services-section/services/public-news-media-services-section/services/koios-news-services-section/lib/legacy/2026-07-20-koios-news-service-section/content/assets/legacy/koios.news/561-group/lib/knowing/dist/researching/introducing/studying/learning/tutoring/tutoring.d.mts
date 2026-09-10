/**
 * tutoring — KnowingLessons → NextStep: a leaf under learning.
 *
 * Fourth derivative (a leaf). Tutoring is the head of learning: where teaching
 * delivers the whole ordered course, tutoring returns only the leading edge — the
 * one next lesson to take up, with the reason it comes next. The codomain holds the
 * live head lesson (or null when the trace adds no cells to learn from). Reads only
 * @emsenn/relating (through the knowing learning carrier).
 */
import type { KnowingLessons, KnowingLesson } from "../learning.mjs";
/** The next-step carrier: the single head lesson to take up next. */
export interface NextStep {
    readonly kind: "knowing.next-step";
    readonly learning: KnowingLessons;
    readonly lesson: KnowingLesson | null;
    readonly reason: string;
}
/** tutor : KnowingLessons → NextStep. */
export declare function tutoring(learning: KnowingLessons): NextStep;
//# sourceMappingURL=tutoring.d.mts.map