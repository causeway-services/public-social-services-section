import type { KoiosItem, KoiosMasthead } from "../../../../../../surface.mjs";
import { type SyndicationReading } from "@emsenn/organizing-a-content-mill";
export type { SyndicationReading, SyndicationSurface, SyndicationSurfaceKind } from "@emsenn/organizing-a-content-mill";
export { coverageGraphReading } from "./coverage-graph.mjs";
export type { CoverageGraph, CoverageDefinedTerm, CoverageArticleRef } from "./coverage-graph.mjs";
export declare function syndicationReading(input: Readonly<{
    masthead: KoiosMasthead;
    items: readonly KoiosItem[];
}>): SyndicationReading;
//# sourceMappingURL=index.d.mts.map