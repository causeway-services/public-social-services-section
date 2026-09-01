// publishing/managing — what happens after publication: advertising,
// circulation, and syndication.

import type { KoiosItem, KoiosMasthead } from "../../../../../surface.mts";
import type { KoiosPost } from "../../../../../content.mts";
import type { ViewCounts } from "../../../../../views.mts";
import { advertisingPolicy, readAdPerformance, type AdPerformanceReading, type AdvertisingPolicy } from "./advertising/index.mts";
import { applyInternalLinkPlacement, applyInternalLinkPlacementJsonSchema, circulationReading, contentGraphReading, contentPerformanceReading, contentPredicationReading, contentQualityReading, internalLinkOpportunityReading, internalLinkPlacementReading, normalizeApplyInternalLinkPlacementInput, type CirculationReading, type ContentGraphReading, type ContentPerformanceReading, type ContentPredicationReading, type ContentQualityReading, type InternalLinkOpportunityReading, type InternalLinkPlacementReading } from "./circulating/index.mts";
import { syndicationReading, type SyndicationReading } from "./syndicating/index.mts";

export type PublishingManagementReading = Readonly<{
  department: "publishing.managing";
  advertising: AdvertisingPolicy;
  advertisingPerformance?: AdPerformanceReading;
  circulating: CirculationReading;
  contentGraph?: ContentGraphReading;
  contentPerformance?: ContentPerformanceReading;
  contentPredication?: ContentPredicationReading;
  contentQuality?: ContentQualityReading;
  internalLinkOpportunities?: InternalLinkOpportunityReading;
  internalLinkPlacements?: InternalLinkPlacementReading;
  syndicating: SyndicationReading;
}>;

export function publishingManagementReading(input: Readonly<{
  masthead: KoiosMasthead;
  items: readonly KoiosItem[];
  posts?: readonly KoiosPost[];
  views?: ViewCounts;
  dataDir?: string;
  adClient?: string;
}>): PublishingManagementReading {
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

export { adPerformanceJsonSchema, advertisingContentSecurityPolicy, advertisingPolicy, normalizeAdPerformanceInput, readAdPerformance, recordAdPerformance } from "./advertising/index.mts";
export type { AdPerformanceEvent, AdPerformanceInput, AdPerformanceReading, AdvertisingPolicy } from "./advertising/index.mts";
export { applyInternalLinkPlacement, applyInternalLinkPlacementJsonSchema, circulationReading, contentGraphReading, contentPerformanceReading, contentPredicationPacket, contentPredicationReading, contentQualityReading, draftInternalLinkGuidanceReading, internalLinkOpportunityReading, internalLinkPlacementReading, normalizeApplyInternalLinkPlacementInput } from "./circulating/index.mts";
export type { ApplyInternalLinkPlacementInput, ApplyInternalLinkPlacementResult, ArticleContentQuality, ArticlePredicationCell, ArticlePredicationMetrics, CirculationReading, ContentGraphEdge, ContentGraphNode, ContentGraphReading, ContentPerformanceReading, ContentPredicationReading, ContentQualityFinding, ContentQualityReading, DraftInternalLinkGuidanceReading, DraftInternalLinkSuggestion, InternalLinkOpportunity, InternalLinkOpportunityReading, InternalLinkPlacement, InternalLinkPlacementReading, PredicationCellKind } from "./circulating/index.mts";
export { syndicationReading } from "./syndicating/index.mts";
export type { SyndicationReading } from "./syndicating/index.mts";
