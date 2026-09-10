import type { KoiosItem, KoiosMasthead } from "../../../../../surface.mjs";
import type { KoiosPost } from "../../../../../content.mjs";
import type { ViewCounts } from "../../../../../views.mjs";
import { type AdPerformanceReading, type AdvertisingPolicy } from "./advertising/index.mjs";
import { type CirculationReading, type ContentGraphReading, type ContentPerformanceReading, type ContentPredicationReading, type ContentQualityReading, type InternalLinkOpportunityReading, type InternalLinkPlacementReading } from "./circulating/index.mjs";
import { type SyndicationReading } from "./syndicating/index.mjs";
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
export declare function publishingManagementReading(input: Readonly<{
    masthead: KoiosMasthead;
    items: readonly KoiosItem[];
    posts?: readonly KoiosPost[];
    views?: ViewCounts;
    dataDir?: string;
    adClient?: string;
}>): PublishingManagementReading;
export { adPerformanceJsonSchema, advertisingContentSecurityPolicy, advertisingPolicy, normalizeAdPerformanceInput, readAdPerformance, recordAdPerformance } from "./advertising/index.mjs";
export type { AdPerformanceEvent, AdPerformanceInput, AdPerformanceReading, AdvertisingPolicy } from "./advertising/index.mjs";
export { applyInternalLinkPlacement, applyInternalLinkPlacementJsonSchema, circulationReading, contentGraphReading, contentPerformanceReading, contentPredicationPacket, contentPredicationReading, contentQualityReading, draftInternalLinkGuidanceReading, internalLinkOpportunityReading, internalLinkPlacementReading, normalizeApplyInternalLinkPlacementInput } from "./circulating/index.mjs";
export type { ApplyInternalLinkPlacementInput, ApplyInternalLinkPlacementResult, ArticleContentQuality, ArticlePredicationCell, ArticlePredicationMetrics, CirculationReading, ContentGraphEdge, ContentGraphNode, ContentGraphReading, ContentPerformanceReading, ContentPredicationReading, ContentQualityFinding, ContentQualityReading, DraftInternalLinkGuidanceReading, DraftInternalLinkSuggestion, InternalLinkOpportunity, InternalLinkOpportunityReading, InternalLinkPlacement, InternalLinkPlacementReading, PredicationCellKind } from "./circulating/index.mjs";
export { syndicationReading } from "./syndicating/index.mjs";
export type { SyndicationReading } from "./syndicating/index.mjs";
//# sourceMappingURL=index.d.mts.map