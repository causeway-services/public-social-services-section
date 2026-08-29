import type { DetectResult, Diagnostic, Verdict } from "./types.mjs";
/** Convert a DetectResult into Diagnostics (violations and conflicts only). */
export declare function report(result: DetectResult): readonly Diagnostic[];
/** Run detect + report, compute pass/fail verdict.
 * A document fails if it has any warning or error diagnostics (suggestions are OK). */
export declare function verdict(result: DetectResult): Verdict;
//# sourceMappingURL=report.d.mts.map