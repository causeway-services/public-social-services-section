// Koios metadata for the mill's linked-data coverage vocabulary.

import {
  coverageTermMetadataFromFrontMatter,
  publicationCoverageGraphReading,
  type CoverageGraph,
} from "@red-cup-engineering/organizing-a-content-mill";

import type { KoiosPost } from "../../../../../../content.mjs";
import type { KoiosItem, KoiosMasthead } from "../../../../../../surface.mjs";

export type { CoverageArticleRef, CoverageDefinedTerm, CoverageGraph } from "@red-cup-engineering/organizing-a-content-mill";

/** Project the published corpus into the mill's controlled-vocabulary coverage graph. */
export function coverageGraphReading(input: Readonly<{
  masthead: KoiosMasthead;
  items: readonly KoiosItem[];
  posts: readonly KoiosPost[];
}>): CoverageGraph {
  return publicationCoverageGraphReading({
    masthead: input.masthead,
    items: input.items,
    termMetadataBySlug: Object.fromEntries(input.posts.map((post) => [post.slug, coverageTermMetadataFromFrontMatter(post.document.frontMatter)])),
  });
}
