// publishing/managing/syndicating — machine distribution after publication.
//
// Circulation is reader return; syndication is machine-readable republication:
// feeds, sitemaps, ninjs, and the public gate audit.

import type { KoiosItem, KoiosMasthead } from "../../../../../../surface.mjs";
import { publicItems } from "../../../../../../surface.mjs";
import {
  publicationSyndicationSurfaces,
  type SyndicationReading,
  type SyndicationSurface,
  type SyndicationSurfaceKind,
} from "@red-cup-engineering/organizing-a-content-mill";

export type { SyndicationReading, SyndicationSurface, SyndicationSurfaceKind } from "@red-cup-engineering/organizing-a-content-mill";

export { coverageGraphReading } from "./coverage-graph.mjs";
export type { CoverageGraph, CoverageDefinedTerm, CoverageArticleRef } from "./coverage-graph.mjs";

export function syndicationReading(input: Readonly<{
  masthead: KoiosMasthead;
  items: readonly KoiosItem[];
}>): SyndicationReading {
  return publicationSyndicationSurfaces({
    baseUrl: input.masthead.siteUrl,
    itemPath: input.masthead.itemPath,
    articleSlugs: publicItems(input.items).map((item) => item.slug),
    recordPaths: [
      "ninjs.json",
      "topics.json",
      "tags.json",
      "archive.json",
      "sources.json",
      "desks.json",
      "bibliography.json",
      "coverage.json",
    ],
    auditPaths: ["newswire-audit.json"],
  });
}
