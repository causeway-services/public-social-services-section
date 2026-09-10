// publishing/managing/circulating/corrections — public correction records.
//
// Corrections are article metadata after publication: they are not intake
// sources and not citation references. This module is the one parser/folder for
// correction, clarification, material update, and retraction records.
import { CORRECTION_POLICY, DEFAULT_CORRECTION_AFFECTED_SURFACES, correctionCoverageFromMetadata as producingContentCorrectionCoverageFromMetadata, correctionRecordsFromMetadata as producingContentCorrectionRecordsFromMetadata, correctionRegisterReading as producingContentCorrectionRegisterReading, correctionStateFromMetadata as producingContentCorrectionStateFromMetadata, correctionValidationFindingsFromMetadata as producingContentCorrectionValidationFindingsFromMetadata, } from "@emsenn/organizing-a-content-mill";
export { CORRECTION_POLICY, DEFAULT_CORRECTION_AFFECTED_SURFACES, } from "@emsenn/organizing-a-content-mill";
function itemPath(item) {
    try {
        return new URL(item.url).pathname.replace(/\/+$/, "") || "/";
    }
    catch {
        return `/${item.slug}`.replace(/\/+$/, "");
    }
}
function correctionSurfaceCoverage(frontMatter) {
    return producingContentCorrectionCoverageFromMetadata(frontMatter);
}
export function correctionRecordsForArticle(input) {
    return producingContentCorrectionRecordsFromMetadata({
        frontMatter: input.frontMatter,
        slug: input.slug,
        path: input.articlePath,
        headline: input.articleHeadline,
    });
}
export function correctionCoverageForFrontMatter(frontMatter) {
    return correctionSurfaceCoverage(frontMatter);
}
export function correctionStateForFrontMatter(frontMatter) {
    return producingContentCorrectionStateFromMetadata(frontMatter);
}
export function correctionRecordsForPost(post, item) {
    return correctionRecordsForArticle({
        frontMatter: post.document.frontMatter,
        slug: post.slug,
        articlePath: itemPath(item),
        articleHeadline: item.headline,
    });
}
export function correctionValidationFindings(frontMatter) {
    return producingContentCorrectionValidationFindingsFromMetadata(frontMatter);
}
export function correctionRegisterReading(input) {
    const postsBySlug = new Map(input.posts.map((post) => [post.slug, post]));
    const corrections = input.items
        .filter((item) => item.isPublic)
        .flatMap((item) => {
        const post = postsBySlug.get(item.slug);
        return post === undefined ? [] : [...correctionRecordsForPost(post, item)];
    })
        .sort((left, right) => right.correctedAt.localeCompare(left.correctedAt) || left.articleHeadline.localeCompare(right.articleHeadline));
    return producingContentCorrectionRegisterReading({
        policy: CORRECTION_POLICY,
        corrections: Object.freeze(corrections),
        constraints: Object.freeze([
            "Generated from public article frontmatter only.",
            "The register records publication accountability, not reader behavior.",
            "Empty register means no article currently declares a correction record; it is not proof that no future correction will be needed.",
        ]),
    });
}
//# sourceMappingURL=corrections.mjs.map