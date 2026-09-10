import type { ChargeValueName } from "@emsenn/relating";
/**
 * The knowledge-join (≤_k supremum) of a set of charge value NAMES: `absurd` (⊥)
 * is the unit, `stable` (⊤) the top, and `join(potential, active) = stable` (a held
 * contradiction). The join is the componentwise OR of the truth/falsity presence —
 * exactly relating's `joinKnowledge` read at the value-name level.
 */
export declare function joinKnowledgeNames(names: Iterable<ChargeValueName>): ChargeValueName;
/**
 * A named, charged verdict from an admission layer: `name` identifies the check,
 * `value` is the bilattice charge value carried as learning data, `reason` explains
 * the verdict, and `path` locates the subject that was judged.
 */
export interface LessonJudgment {
    readonly name: string;
    readonly value: ChargeValueName;
    readonly reason: string;
    readonly path: string;
}
/**
 * The settled reading of a set of admission judgments: `value` is the knowledge
 * join of every judgment's charge value, `judgments` holds the inputs, and
 * `stableJudgments` holds those whose value is `stable` — held contradictions
 * rendered rather than thrown.
 */
export interface LessonSettlement {
    readonly kind: "knowing.learning.lesson-settlement";
    /** Knowledge join of every judgment's charge value — the reading is the value name itself. */
    readonly value: ChargeValueName;
    readonly judgments: readonly LessonJudgment[];
    /** Judgments individually `stable` — held contradictions, rendered, never thrown. */
    readonly stableJudgments: readonly LessonJudgment[];
}
/**
 * Settle a list of learning judgments into a frozen `LessonSettlement`: join their
 * charge values with the knowledge join, preserve the judgments, and collect the
 * `stable` ones separately.
 */
export declare function settleLessonJudgments(judgments: readonly LessonJudgment[]): LessonSettlement;
//# sourceMappingURL=admission.d.mts.map