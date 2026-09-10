// publishing/managing — what happens after publication: advertising,
// circulation, and syndication.
import { advertisingPolicy, readAdPerformance } from "./advertising/index.mjs";
import { applyInternalLinkPlacement, applyInternalLinkPlacementJsonSchema, circulationReading, contentGraphReading, contentPerformanceReading, contentPredicationReading, contentQualityReading, internalLinkOpportunityReading, internalLinkPlacementReading, normalizeApplyInternalLinkPlacementInput } from "./circulating/index.mjs";
import { syndicationReading } from "./syndicating/index.mjs";
export function publishingManagementReading(input) {
    return Object.freeze({
        department: "publishing.managing",
        advertising: advertisingPolicy(input.adClient),
        ...(input.dataDir === undefined ? {} : { advertisingPerformance: readAdPerformance(input.dataDir) }),
        circulating: circulationReading(input.masthead),
        ...(input.posts === undefined ? {} : { contentGraph: contentGraphReading({ items: input.items, posts: input.posts }) }),
        ...(input.posts === undefined || input.views === undefined ? {} : { contentPerformance: contentPerformanceReading({ items: input.items, posts: input.posts, views: input.views }) }),
        ...(input.posts === undefined ? {} : { contentPredication: contentPredicationReading({ items: input.items, posts: input.posts }) }),
        ...(input.posts === undefined ? {} : { contentQuality: contentQualityReading({ items: input.items, posts: input.posts }) }),
        ...(input.posts === undefined ? {} : { internalLinkOpportunities: internalLinkOpportunityReading({ items: input.items, posts: input.posts }) }),
        ...(input.posts === undefined ? {} : { internalLinkPlacements: internalLinkPlacementReading({ items: input.items, posts: input.posts }) }),
        syndicating: syndicationReading({ masthead: input.masthead, items: input.items }),
    });
}
export { adPerformanceJsonSchema, advertisingContentSecurityPolicy, advertisingPolicy, normalizeAdPerformanceInput, readAdPerformance, recordAdPerformance } from "./advertising/index.mjs";
export { applyInternalLinkPlacement, applyInternalLinkPlacementJsonSchema, circulationReading, contentGraphReading, contentPerformanceReading, contentPredicationPacket, contentPredicationReading, contentQualityReading, draftInternalLinkGuidanceReading, internalLinkOpportunityReading, internalLinkPlacementReading, normalizeApplyInternalLinkPlacementInput } from "./circulating/index.mjs";
export { syndicationReading } from "./syndicating/index.mjs";
//# sourceMappingURL=index.mjs.map