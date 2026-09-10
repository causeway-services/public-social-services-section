import type { ClauseSpec, RealizationResult, RoleFrame } from "./types.mjs";
/** Realize a single clause from a ClauseSpec. */
export declare function realizeClause(spec: ClauseSpec): RealizationResult;
/** Realize a role frame into a ClauseSpec. */
export declare function frameToClause(frame: RoleFrame, opts?: {
    tense?: ClauseSpec["tense"];
    negated?: boolean;
}): ClauseSpec;
//# sourceMappingURL=realize.d.mts.map