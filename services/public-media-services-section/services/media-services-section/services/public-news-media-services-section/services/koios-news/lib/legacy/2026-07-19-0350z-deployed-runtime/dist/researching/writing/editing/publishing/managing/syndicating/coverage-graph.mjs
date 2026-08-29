// Koios metadata for the mill's linked-data coverage vocabulary.
import { coverageTermMetadataFromFrontMatter, publicationCoverageGraphReading, } from "@emsenn/organizing-a-content-mill";
/** Project the published corpus into the mill's controlled-vocabulary coverage graph. */
export function coverageGraphReading(input) {
    return publicationCoverageGraphReading({
        masthead: input.masthead,
        items: input.items,
        termMetadataBySlug: Object.fromEntries(input.posts.map((post) => [post.slug, coverageTermMetadataFromFrontMatter(post.document.frontMatter)])),
    });
}
//# sourceMappingURL=coverage-graph.mjs.map