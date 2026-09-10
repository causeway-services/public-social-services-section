import { type ArticlePredicationMetrics, type CirculationReading, type ContentGraphReading, type ContentPerformanceReading, type ContentPredicationReading, type ContentQualityReading } from "@emsenn/organizing-a-content-mill";
import { applyInternalLinkPlacementJsonSchema, normalizeApplyInternalLinkPlacementInput, type ApplyInternalLinkPlacementInput, type ApplyInternalLinkPlacementResult, type ContentRevisionBacklogReading, type DraftInternalLinkGuidanceReading, type InternalLinkOpportunityReading, type InternalLinkPlacementReading } from "@emsenn/organizing-a-content-farm";
import type { KoiosPost } from "../../../../../../content.mjs";
import type { KoiosMasthead } from "../../../../../../surface.mjs";
import { type KoiosItem } from "../../../../../../surface.mjs";
import type { ViewCounts } from "../../../../../../views.mjs";
export { correctionRegisterReading } from "./corrections.mjs";
export type { CorrectionCoverageReading, CorrectionKind, CorrectionRecord, CorrectionRegisterReading } from "./corrections.mjs";
export type { ApplyInternalLinkPlacementInput, ApplyInternalLinkPlacementResult, ContentQualitySeverity, ContentRevisionBacklogReading, ContentRevisionPacket, ContentRevisionTask, ContentRevisionTaskKind, DraftInternalLinkGuidanceReading, DraftInternalLinkSuggestion, InternalLinkOpportunity, InternalLinkOpportunityReading, InternalLinkPlacement, InternalLinkPlacementReading, } from "@emsenn/organizing-a-content-farm";
export type { ArticleContentQuality, ArticlePerformance, ArticlePredicationCell, ArticlePredicationMetrics, CirculationChannel, CirculationChannelKind, CirculationReading, ContentGraphEdge, ContentGraphNode, ContentGraphReading, ContentGraphSectionBucket, ContentPerformanceBucket, ContentPerformanceReading, ContentPredicationReading, ContentQualityFinding, ContentQualityReading, PredicationCellKind } from "@emsenn/organizing-a-content-mill";
export declare function circulationReading(masthead: KoiosMasthead): CirculationReading;
export declare function contentPerformanceReading(input: Readonly<{
    items: readonly KoiosItem[];
    posts: readonly KoiosPost[];
    views: ViewCounts;
}>): ContentPerformanceReading;
export declare function contentQualityReading(input: Readonly<{
    items: readonly KoiosItem[];
    posts: readonly KoiosPost[];
}>): ContentQualityReading;
export declare function contentPredicationReading(input: Readonly<{
    items: readonly KoiosItem[];
    posts: readonly KoiosPost[];
}>): ContentPredicationReading;
export declare function contentPredicationPacket(input: Readonly<{
    items: readonly KoiosItem[];
    posts: readonly KoiosPost[];
    slug: string;
    cellLimit?: number;
}>): ArticlePredicationMetrics;
export declare function contentGraphReading(input: Readonly<{
    items: readonly KoiosItem[];
    posts: readonly KoiosPost[];
}>): ContentGraphReading;
export declare function contentRevisionBacklogReading(input: Readonly<{
    items: readonly KoiosItem[];
    posts: readonly KoiosPost[];
}>): ContentRevisionBacklogReading;
export declare function internalLinkOpportunityReading(input: Readonly<{
    items: readonly KoiosItem[];
    posts: readonly KoiosPost[];
    limitPerArticle?: number;
}>): InternalLinkOpportunityReading;
export declare function internalLinkPlacementReading(input: Readonly<{
    items: readonly KoiosItem[];
    posts: readonly KoiosPost[];
    limitPerArticle?: number;
}>): InternalLinkPlacementReading;
export declare function draftInternalLinkGuidanceReading(input: Readonly<{
    items: readonly KoiosItem[];
    posts: readonly KoiosPost[];
    term: string;
    beat?: string;
    tags?: readonly string[];
    excludeSlugs?: readonly string[];
    limit?: number;
}>): DraftInternalLinkGuidanceReading;
export declare function applyInternalLinkPlacement(input: Readonly<{
    contentDir: string;
    items: readonly KoiosItem[];
    posts: readonly KoiosPost[];
    placement: ApplyInternalLinkPlacementInput | unknown;
}>): ApplyInternalLinkPlacementResult;
export { applyInternalLinkPlacementJsonSchema, normalizeApplyInternalLinkPlacementInput };
//# sourceMappingURL=index.d.mts.map