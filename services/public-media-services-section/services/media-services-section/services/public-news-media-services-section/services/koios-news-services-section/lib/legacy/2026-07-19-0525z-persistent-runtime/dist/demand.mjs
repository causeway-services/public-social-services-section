// demand.mts — Koios's local projection of the farm demand reading.
//
// Demand math lives in @emsenn/organizing-a-content-farm: seed demand,
// earned views, Search Console material, and coverage decay fold there. Koios
// owns only its publication-specific seed vocabulary and the fact that covered
// terms are recorded under the `koios` front-matter namespace.
import { demandTable as farmDemandTable, farmRecordPath, readContentFarmProperty, readSearchConsole as readFarmSearchConsole, } from "@emsenn/organizing-a-content-farm";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_CONTENT_PRODUCTION_CONFIG } from "./config.mjs";
/** Read Koios's content-farm property from its instance config. The config is
 * the publication-property carrier; this module only projects demand inputs
 * from it for the newsroom desk. */
export function koiosFarmProperty(configPath = DEFAULT_CONTENT_PRODUCTION_CONFIG) {
    const property = readContentFarmProperty(configPath);
    const siteRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
    const genre = JSON.parse(readFileSync(join(siteRoot, "lib", "law", "reported-analysis-genre-contract.json"), "utf8"));
    const writerPromptLaws = Array.isArray(genre.writerPromptLaws) ? genre.writerPromptLaws.map(String) : [];
    return Object.freeze({
        ...property,
        voice: Object.freeze({
            ...property.voice,
            laws: Object.freeze([...new Set([...(property.voice.laws ?? []), ...writerPromptLaws])]),
        }),
    });
}
const KOIOS_FARM_PROPERTY = koiosFarmProperty();
/** The niche seed reading from the farm property. */
export const SEED_KEYWORDS = KOIOS_FARM_PROPERTY.seeds;
/** Read records/search-console.json if present. */
export function readSearchConsole(dataDir) {
    return readFarmSearchConsole(farmRecordPath(dataDir, "search-console.json"));
}
/** Fold Koios demand through the canonical farm reading. */
export function demandTable(input) {
    return farmDemandTable({
        posts: input.posts,
        views: input.views,
        seeds: input.seeds ?? SEED_KEYWORDS,
        termKey: KOIOS_FARM_PROPERTY.termKey ?? "koios",
        ...(input.searchConsole === undefined ? {} : { searchConsole: input.searchConsole }),
    });
}
//# sourceMappingURL=demand.mjs.map