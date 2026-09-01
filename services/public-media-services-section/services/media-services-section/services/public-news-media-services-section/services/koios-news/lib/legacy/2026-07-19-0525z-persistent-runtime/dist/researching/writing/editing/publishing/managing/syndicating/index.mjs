// publishing/managing/syndicating — machine distribution after publication.
//
// Circulation is reader return; syndication is machine-readable republication:
// feeds, sitemaps, ninjs, and the public gate audit.
import { publicItems } from "../../../../../../surface.mjs";
import { publicationSyndicationSurfaces, } from "@emsenn/organizing-a-content-mill";
export { coverageGraphReading } from "./coverage-graph.mjs";
export function syndicationReading(input) {
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
//# sourceMappingURL=index.mjs.map