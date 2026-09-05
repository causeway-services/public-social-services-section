// admission.mts — learning judgments and their settlement, read at ≤_k.
//
// Learning is the INSIDE face: knowing transforms the agent's interior state by
// settling what it has come to hold. An admission judgment is a named, charged
// verdict (a check's decision projected as bilattice data); the lesson it settles
// to is the KNOWLEDGE-JOIN of those verdicts — knowing's comonad working the
// knowledge order ≤_k (absurd ⊥ is the unit, stable ⊤ the top; a held
// contradiction join(potential, active) = stable is kept first-class, never
// thrown). The verdict values are the four charge value names used AS DATA at the
// learning layer; they never re-enter bedrock admission (re-admitting a charge
// would be seeding).
//
// This is the surface the fresh Gen-1 animating dropped on purpose: learning is
// the knowing faculty, not the agent's descent. It is derived directly on
// @emsenn/relating's charge join — knowing imports only relating.
/** Truth/falsity presence of each charge value name, the bilattice's ≤_k coordinates:
 *  absurd ⊥ = [f,f], potential t = [t,f], active f = [f,t], stable ⊤ = [t,t]. */
const PRESENCE = Object.freeze({
    absurd: [false, false],
    potential: [true, false],
    active: [false, true],
    stable: [true, true],
});
/**
 * The knowledge-join (≤_k supremum) of a set of charge value NAMES: `absurd` (⊥)
 * is the unit, `stable` (⊤) the top, and `join(potential, active) = stable` (a held
 * contradiction). The join is the componentwise OR of the truth/falsity presence —
 * exactly relating's `joinKnowledge` read at the value-name level.
 */
export function joinKnowledgeNames(names) {
    let positive = false;
    let negative = false;
    for (const name of names) {
        const [p, q] = PRESENCE[name];
        positive = positive || p;
        negative = negative || q;
    }
    return positive ? (negative ? "stable" : "potential") : (negative ? "active" : "absurd");
}
/**
 * Settle a list of learning judgments into a frozen `LessonSettlement`: join their
 * charge values with the knowledge join, preserve the judgments, and collect the
 * `stable` ones separately.
 */
export function settleLessonJudgments(judgments) {
    return Object.freeze({
        kind: "knowing.learning.lesson-settlement",
        value: joinKnowledgeNames(judgments.map((judgment) => judgment.value)),
        judgments: Object.freeze([...judgments]),
        stableJudgments: Object.freeze(judgments.filter((judgment) => judgment.value === "stable")),
    });
}
//# sourceMappingURL=admission.mjs.map