/** Derive a lesson from a cell-adding settling increment. */
function lesson(increment) {
    return Object.freeze({ kind: "knowing.lesson", increment, restriction: increment.added });
}
/** learn : KnowingTrace → KnowingLessons. Empty increments yield no retained lesson. */
export function learning(trace) {
    return Object.freeze({
        kind: "knowing.lessons",
        trace,
        lessons: Object.freeze(trace.trace.filter((increment) => increment.added.cells.length > 0).map(lesson)),
    });
}
//# sourceMappingURL=learning.mjs.map