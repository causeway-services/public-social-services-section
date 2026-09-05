import type { DetectResult, Rule } from "./types.mjs";
/** Strip markdown scaffolding from text while preserving offsets.
 * Code fences and inline code are replaced with spaces of equal length. */
export declare function stripMarkdown(text: string): string;
/** Run all rules against text and return a DetectResult. */
export declare function detect(source: string, opts?: {
    rules?: readonly Rule[];
    markdown?: boolean;
}): DetectResult;
//# sourceMappingURL=detect.d.mts.map