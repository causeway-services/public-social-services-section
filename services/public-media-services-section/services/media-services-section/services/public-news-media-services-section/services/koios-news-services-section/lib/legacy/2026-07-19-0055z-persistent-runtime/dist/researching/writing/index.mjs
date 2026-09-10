// writing — the story inventory before editorial gates.
//
// Writing reads posts as manuscripts. Published posts remain in the inventory,
// but drafts are the live work queue for the editing department.
function strings(value) {
    if (value === undefined || value === null || value === "")
        return [];
    if (Array.isArray(value))
        return Object.freeze(value.flatMap((item) => strings(item)));
    return Object.freeze([String(value)]);
}
function wordCount(body) {
    return body.trim().split(/\s+/).filter(Boolean).length;
}
export function manuscriptOf(post) {
    const frontMatter = post.document.frontMatter;
    const draft = frontMatter["draft"] === true || frontMatter["draft"] === "true";
    return Object.freeze({
        slug: post.slug,
        title: String(frontMatter["title"] ?? post.slug),
        summary: String(frontMatter["summary"] ?? frontMatter["description"] ?? ""),
        draft,
        wordCount: wordCount(post.document.body),
        keywords: strings(frontMatter["keywords"]),
    });
}
export function writingDepartmentReading(posts) {
    const manuscripts = Object.freeze(posts.map(manuscriptOf));
    return Object.freeze({
        department: "writing",
        manuscripts,
        draftCount: manuscripts.filter((manuscript) => manuscript.draft).length,
        publishedCount: manuscripts.filter((manuscript) => !manuscript.draft).length,
    });
}
export { createAssignment, createAssignmentInputFromDemand, normalizeCreateAssignmentNoteInput, normalizeCreateAssignmentInput, readAssignment, readAssignmentActivity, readAssignments, recordAssignmentNote, } from "./assignments.mjs";
//# sourceMappingURL=index.mjs.map