import type { TextPlan, ClauseSpec, RoleFrame } from "./types.mjs";
/** Plan a sequence of clauses from a sequence of role frames.
 * Introduces pronouns for repeated agents after the first mention. */
export declare function plan(frames: readonly RoleFrame[], opts?: {
    tense?: ClauseSpec["tense"];
}): TextPlan;
/** Realize a TextPlan as a prose string. */
export declare function planToText(plan: TextPlan, realize: (spec: ClauseSpec) => string): string;
//# sourceMappingURL=plan.d.mts.map