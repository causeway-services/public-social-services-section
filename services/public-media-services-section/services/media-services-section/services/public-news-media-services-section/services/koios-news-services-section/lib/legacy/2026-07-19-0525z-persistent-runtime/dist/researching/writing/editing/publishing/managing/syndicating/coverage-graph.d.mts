import { type CoverageGraph } from "@emsenn/organizing-a-content-mill";
import type { KoiosPost } from "../../../../../../content.mjs";
import type { KoiosItem, KoiosMasthead } from "../../../../../../surface.mjs";
export type { CoverageArticleRef, CoverageDefinedTerm, CoverageGraph } from "@emsenn/organizing-a-content-mill";
/** Project the published corpus into the mill's controlled-vocabulary coverage graph. */
export declare function coverageGraphReading(input: Readonly<{
    masthead: KoiosMasthead;
    items: readonly KoiosItem[];
    posts: readonly KoiosPost[];
}>): CoverageGraph;
//# sourceMappingURL=coverage-graph.d.mts.map