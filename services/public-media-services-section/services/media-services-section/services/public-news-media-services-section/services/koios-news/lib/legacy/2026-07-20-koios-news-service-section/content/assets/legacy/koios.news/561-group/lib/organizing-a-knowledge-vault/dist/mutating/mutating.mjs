/**
 * mutating  -  the document-write surface, DERIVED from @emsenn/relating's
 * markdown codec.
 *
 * knowing encodes documents through relating's `createMarkdown` and reads them through
 * relating's `parseMarkdown`  -  it writes no frontmatter serializer, and depends on no
 * package but @emsenn/relating. Every operation is DRY-RUN BY DEFAULT: it
 * returns the prepared `{ path, text }` and writes only when `write` is set, and every
 * path is confined to the vault root. The vault (content/) is a strict
 * Indigenous-knowledge project with its own placement law; knowing prepares documents,
 * it does not place them unbidden.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createMarkdown } from "@emsenn/relating/codecs";
import { confine, readDocument } from "../vault/index.mjs";
/** Build a frontmatter record from the conventional fields plus any extra given. */
function buildFrontMatter(input) {
    const record = {};
    if (typeof input["title"] === "string" && input["title"].trim() !== "")
        record["title"] = input["title"].trim();
    const tags = input["tags"];
    if (Array.isArray(tags))
        record["tags"] = tags.filter((t) => typeof t === "string");
    else if (typeof tags === "string" && tags.trim() !== "")
        record["tags"] = tags.split(",").map((t) => t.trim()).filter(Boolean);
    const extra = input["frontMatter"];
    if (extra !== null && typeof extra === "object" && !Array.isArray(extra))
        Object.assign(record, extra);
    return Object.freeze(record);
}
/** Confined-write a prepared document under the vault root. */
function place(root, relative, text) {
    const full = confine(root, relative);
    mkdirSync(path.dirname(full), { recursive: true });
    writeFileSync(full, text, "utf8");
}
/**
 * prepare/create a document: encode `{ path, title, tags, body }` into a
 * frontmatter document via relating's markdown codec. Dry-run unless `write` is true.
 */
export function createDocument(root, input, write) {
    const relative = typeof input["path"] === "string" ? input["path"].trim() : "";
    if (relative === "")
        throw new TypeError("create-document: a path is required");
    const body = typeof input["body"] === "string" ? input["body"] : "";
    const text = createMarkdown({ ...buildFrontMatter(input), body }, { bodyKey: "body" });
    if (write)
        place(root, relative, text);
    return Object.freeze({ kind: "organizing.knowledge-vault.mutating.prepared", path: relative, text, written: write });
}
/**
 * Update a document's frontmatter: decode the existing document, merge the patch
 * over its frontmatter (via relating's markdown codec), re-encode. Dry-run unless `write`.
 */
export function updateFrontmatter(root, input, write) {
    const relative = typeof input["path"] === "string" ? input["path"].trim() : "";
    if (relative === "")
        throw new TypeError("update-frontmatter: a path is required");
    const existing = readDocument(root, relative);
    const patch = buildFrontMatter(input);
    const merged = Object.freeze({ ...existing.frontmatter, ...patch });
    const text = createMarkdown({ ...merged, body: existing.body }, { bodyKey: "body" });
    if (write)
        place(root, relative, text);
    return Object.freeze({ kind: "organizing.knowledge-vault.mutating.prepared", path: relative, text, written: write });
}
//# sourceMappingURL=mutating.mjs.map