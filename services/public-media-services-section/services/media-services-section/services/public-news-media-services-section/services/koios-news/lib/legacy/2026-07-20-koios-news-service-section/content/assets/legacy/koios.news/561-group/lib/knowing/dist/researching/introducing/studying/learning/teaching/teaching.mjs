/** teach : KnowingLessons → Curriculum. */
export function teaching(learning) {
    return Object.freeze({
        kind: "knowing.curriculum",
        learning,
        lessons: Object.freeze([...learning.lessons]),
    });
}
//# sourceMappingURL=teaching.mjs.map