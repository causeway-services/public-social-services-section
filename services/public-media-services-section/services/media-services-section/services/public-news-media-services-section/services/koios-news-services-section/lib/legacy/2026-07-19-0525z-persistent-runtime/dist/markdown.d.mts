export declare function escapeHtml(value: string): string;
export type MarkdownRenderOptions = Readonly<{
    citation?: (ids: readonly string[], raw: string) => string;
}>;
/** Inline spans: code, citations, strong, emphasis, links. Applied after escaping. */
export declare function renderInline(text: string, options?: MarkdownRenderOptions): string;
/** Render the markdown subset to HTML. Deterministic; all text escaped. */
export declare function renderMarkdown(markdown: string, options?: MarkdownRenderOptions): string;
//# sourceMappingURL=markdown.d.mts.map