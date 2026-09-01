import type { PreparedDocument } from "./prepared-document.schema.types.mjs";
export type { PreparedDocument };
/**
 * prepare/create a document: encode `{ path, title, tags, body }` into a
 * frontmatter document via relating's markdown codec. Dry-run unless `write` is true.
 */
export declare function createDocument(root: string, input: Readonly<Record<string, unknown>>, write: boolean): PreparedDocument;
/**
 * Update a document's frontmatter: decode the existing document, merge the patch
 * over its frontmatter (via relating's markdown codec), re-encode. Dry-run unless `write`.
 */
export declare function updateFrontmatter(root: string, input: Readonly<Record<string, unknown>>, write: boolean): PreparedDocument;
//# sourceMappingURL=mutating.d.mts.map