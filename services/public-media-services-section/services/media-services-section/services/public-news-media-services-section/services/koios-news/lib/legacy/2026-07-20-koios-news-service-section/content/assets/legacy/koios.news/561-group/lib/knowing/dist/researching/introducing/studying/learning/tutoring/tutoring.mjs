/** tutor : KnowingLessons → NextStep. */
export function tutoring(learning) {
    const head = learning.lessons[0] ?? null;
    return Object.freeze({
        kind: "knowing.next-step",
        learning,
        lesson: head,
        reason: head === null
            ? "no lessons yet — the settling trace adds no cells to learn from"
            : "the first lesson of the settling trace — the next restriction to take up",
    });
}
//# sourceMappingURL=tutoring.mjs.map