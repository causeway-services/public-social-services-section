/**
 * memory/normalization - normal forms for knowledge-bearing Markdown documents.
 *
 * This is deliberately pure: callers own filesystem discovery, Git state, and writes.
 */
export interface MarkdownLinefeedFinding {
    readonly rule: "semantic-linefeeds";
    readonly severity: "info";
    readonly message: string;
}
export interface MarkdownLinefeedNormalization {
    readonly kind: "knowing.memory.markdown-normalization";
    readonly normalForm: "semantic-linefeeds";
    readonly changed: boolean;
    readonly text: string;
    readonly findings: readonly MarkdownLinefeedFinding[];
    readonly path?: string;
}
export interface MarkdownLinefeedOptions {
    readonly path?: string;
}
export declare function markdownSemanticLinefeedText(text: string): string;
export declare function normalizeMarkdownLinefeeds(text: string, options?: MarkdownLinefeedOptions): MarkdownLinefeedNormalization;
//# sourceMappingURL=normalization.d.mts.map