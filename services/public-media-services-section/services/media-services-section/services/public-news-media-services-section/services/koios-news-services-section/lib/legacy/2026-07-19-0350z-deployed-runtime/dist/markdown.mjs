// markdown.mts — deterministic rendering of the Koios.News markdown subset to HTML.
//
// This is the rendering edge: the content store keeps markdown (the trace of
// what was written); HTML is a reading of it. The subset is what the corpus
// actually uses — ATX headings, paragraphs, lists, blockquotes, links, strong,
// emphasis, inline code, fenced code, horizontal rules. All text is escaped;
// raw HTML is never passed through.
export function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
function escapeUrl(url) {
    const trimmed = url.trim();
    if (!/^(https?:\/\/|\/|#|mailto:)/i.test(trimmed))
        return "#";
    return escapeHtml(trimmed);
}
const CITATION_PATTERN = /\[(?:cite:)?@([A-Za-z0-9][A-Za-z0-9_:.#/$%&+?~=-]*(?:\s*;\s*@[A-Za-z0-9][A-Za-z0-9_:.#/$%&+?~=-]*)*)\]/g;
function renderCitations(html, options) {
    if (options.citation === undefined)
        return html;
    return html.replace(CITATION_PATTERN, (raw, keys) => {
        const ids = keys.split(/\s*;\s*@/).map((key) => key.trim()).filter(Boolean);
        return ids.length === 0 ? raw : options.citation?.(ids, raw) ?? raw;
    });
}
/** Inline spans: code, citations, strong, emphasis, links. Applied after escaping. */
export function renderInline(text, options = {}) {
    let out = escapeHtml(text);
    // Inline code first so its contents are not styled further.
    out = out.replace(/`([^`]+)`/g, (_, code) => `<code>${code}</code>`);
    out = renderCitations(out, options);
    // Links: [text](url). The url was escaped with the rest of the text.
    out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => `<a href="${escapeUrl(url.replaceAll("&amp;", "&"))}">${label}</a>`);
    out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    out = out.replace(/(^|[\s(])\*([^*\s][^*]*)\*(?=[\s).,;:!?]|$)/g, "$1<em>$2</em>");
    return out;
}
function parseBlocks(markdown) {
    const lines = markdown.replaceAll("\r\n", "\n").split("\n");
    const blocks = [];
    let index = 0;
    while (index < lines.length) {
        const line = lines[index] ?? "";
        if (line.trim() === "") {
            index += 1;
            continue;
        }
        const heading = line.match(/^(#{1,6})\s+(.*)$/);
        if (heading) {
            blocks.push({ kind: "heading", level: heading[1].length, text: heading[2].trim() });
            index += 1;
            continue;
        }
        if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
            blocks.push({ kind: "hr" });
            index += 1;
            continue;
        }
        if (line.startsWith("```")) {
            const code = [];
            index += 1;
            while (index < lines.length && !(lines[index] ?? "").startsWith("```")) {
                code.push(lines[index] ?? "");
                index += 1;
            }
            index += 1;
            blocks.push({ kind: "code", lines: code });
            continue;
        }
        if (/^\s*[-*]\s+/.test(line)) {
            const items = [];
            while (index < lines.length && /^\s*[-*]\s+/.test(lines[index] ?? "")) {
                items.push((lines[index] ?? "").replace(/^\s*[-*]\s+/, ""));
                index += 1;
            }
            blocks.push({ kind: "ul", items });
            continue;
        }
        if (/^\s*\d+[.)]\s+/.test(line)) {
            const items = [];
            while (index < lines.length && /^\s*\d+[.)]\s+/.test(lines[index] ?? "")) {
                items.push((lines[index] ?? "").replace(/^\s*\d+[.)]\s+/, ""));
                index += 1;
            }
            blocks.push({ kind: "ol", items });
            continue;
        }
        if (line.startsWith(">")) {
            const quote = [];
            while (index < lines.length && (lines[index] ?? "").startsWith(">")) {
                quote.push((lines[index] ?? "").replace(/^>\s?/, ""));
                index += 1;
            }
            blocks.push({ kind: "blockquote", lines: quote });
            continue;
        }
        const paragraph = [];
        while (index < lines.length) {
            const current = lines[index] ?? "";
            if (current.trim() === "" || /^(#{1,6})\s/.test(current) || /^\s*[-*]\s+/.test(current) ||
                /^\s*\d+[.)]\s+/.test(current) || current.startsWith(">") || current.startsWith("```"))
                break;
            paragraph.push(current);
            index += 1;
        }
        blocks.push({ kind: "paragraph", lines: paragraph });
    }
    return blocks;
}
function renderBlock(block, options) {
    switch (block.kind) {
        case "heading":
            return `<h${block.level}>${renderInline(block.text, options)}</h${block.level}>`;
        case "paragraph":
            return `<p>${renderInline(block.lines.join(" "), options)}</p>`;
        case "ul":
            return `<ul>${block.items.map((item) => `<li>${renderInline(item, options)}</li>`).join("")}</ul>`;
        case "ol":
            return `<ol>${block.items.map((item) => `<li>${renderInline(item, options)}</li>`).join("")}</ol>`;
        case "blockquote":
            return `<blockquote><p>${renderInline(block.lines.join(" "), options)}</p></blockquote>`;
        case "code":
            return `<pre><code>${block.lines.map(escapeHtml).join("\n")}</code></pre>`;
        case "hr":
            return "<hr>";
    }
}
/** Render the markdown subset to HTML. Deterministic; all text escaped. */
export function renderMarkdown(markdown, options = {}) {
    return parseBlocks(markdown).map((block) => renderBlock(block, options)).join("\n");
}
//# sourceMappingURL=markdown.mjs.map