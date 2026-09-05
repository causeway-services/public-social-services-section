import { type DemandEntry as FarmDemandEntry, type FarmProperty, type SearchConsoleQuery, type SeedTerm } from "@emsenn/organizing-a-content-farm";
import type { KoiosPost } from "./content.mjs";
import type { ViewCounts } from "./views.mjs";
export type KoiosBeat = "technology" | "economy" | "culture" | "politics" | "war" | "environment" | "degrowth" | "decolonization";
export type SeedKeyword = SeedTerm & Readonly<{
    beat: KoiosBeat;
}>;
/** Read Koios's content-farm property from its instance config. The config is
 * the publication-property carrier; this module only projects demand inputs
 * from it for the newsroom desk. */
export declare function koiosFarmProperty(configPath?: string): FarmProperty;
/** The niche seed reading from the farm property. */
export declare const SEED_KEYWORDS: readonly SeedKeyword[];
export type { SearchConsoleQuery };
export type DemandEntry = FarmDemandEntry & Readonly<{
    beat: KoiosBeat;
}>;
/** Read records/search-console.json if present. */
export declare function readSearchConsole(dataDir: string): readonly SearchConsoleQuery[];
/** Fold Koios demand through the canonical farm reading. */
export declare function demandTable(input: Readonly<{
    posts: readonly KoiosPost[];
    views: ViewCounts;
    searchConsole?: readonly SearchConsoleQuery[];
    seeds?: readonly SeedKeyword[];
}>): readonly DemandEntry[];
//# sourceMappingURL=demand.d.mts.map