/**
 * memory/actions - boundary actions for knowing.memory normal forms.
 */
import { action, jsonResource } from "@emsenn/relating";
import { normalizeMarkdownLinefeeds } from "./normalization.mjs";
const markdownLinefeedDomainSchema = Object.freeze({
    type: "object",
    properties: {
        text: { type: "string" },
        path: { type: "string" },
    },
    additionalProperties: false,
    anyOf: [
        { required: ["text"] },
    ],
});
const markdownLinefeedCodomainSchema = Object.freeze({
    $ref: "knowing/memory/markdown-normalization",
});
function admitMarkdownText(input, verb) {
    if (typeof input === "string")
        return Object.freeze({ text: input });
    if (input !== null && typeof input === "object" && !Array.isArray(input)) {
        const record = input;
        const text = record["text"];
        if (typeof text !== "string")
            throw new TypeError(`${verb}: text must be a string`);
        const path = record["path"];
        if (path !== undefined && typeof path !== "string")
            throw new TypeError(`${verb}: path must be a string when present`);
        return Object.freeze({
            text,
            ...(path === undefined ? {} : { path }),
        });
    }
    throw new TypeError(`${verb}: expected Markdown text or { text, path? }`);
}
export const normalizeMarkdownLinefeedsAction = action({
    verb: "normalize-markdown-linefeeds",
    inputFormat: "json",
    outputFormat: "json",
    summary: "Project Markdown text to knowing's semantic-linefeed memory-document normal form.",
    description: "Domain: Markdown text, either as a JSON string or { text, path? }. Codomain: knowing.memory.markdown-normalization carrying the normalized text, changed flag, and informational findings. Filesystem discovery and writes are intentionally outside this action.",
    domainSchema: markdownLinefeedDomainSchema,
    codomainSchema: markdownLinefeedCodomainSchema,
    run: (input) => {
        const admitted = admitMarkdownText(input, "normalize-markdown-linefeeds");
        return jsonResource(normalizeMarkdownLinefeeds(admitted.text, admitted.path === undefined ? {} : { path: admitted.path }), "markdown linefeed normalization");
    },
});
export const memoryActions = Object.freeze([
    normalizeMarkdownLinefeedsAction,
]);
//# sourceMappingURL=actions.mjs.map