// demand.mts — Koios's local projection of the farm demand reading.
//
// Demand math lives in @emsenn/organizing-a-content-farm: seed demand,
// earned views, Search Console material, and coverage decay fold there. Koios
// owns only its publication-specific seed vocabulary and the fact that covered
// terms are recorded under the `koios` front-matter namespace.

import {
  demandTable as farmDemandTable,
  farmRecordPath,
  readContentFarmProperty,
  readSearchConsole as readFarmSearchConsole,
  type DemandEntry as FarmDemandEntry,
  type FarmProperty,
  type SearchConsoleQuery,
  type SeedTerm,
} from "@emsenn/organizing-a-content-farm";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { DEFAULT_CONTENT_PRODUCTION_CONFIG } from "./config.mjs";
import type { KoiosPost } from "./content.mjs";
import type { ViewCounts } from "./views.mjs";

// A Koios beat is a production assignment pinned to one IPTC Media Topic (see
// researching/sourcing/topics). These slugs are the topic slugs; "collapse" is
// a cross-cutting lens, never a beat.
export type KoiosBeat =
  | "technology"
  | "economy"
  | "culture"
  | "politics"
  | "war"
  | "environment"
  | "degrowth"
  | "decolonization";

export type SeedKeyword = SeedTerm & Readonly<{ beat: KoiosBeat }>;

/** Read Koios's content-farm property from its instance config. The config is
 * the publication-property carrier; this module only projects demand inputs
 * from it for the newsroom desk. */
export function koiosFarmProperty(configPath = DEFAULT_CONTENT_PRODUCTION_CONFIG): FarmProperty {
  const property = readContentFarmProperty(configPath);
  const siteRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
  const genre = JSON.parse(readFileSync(join(siteRoot, "lib", "law", "reported-analysis-genre-contract.json"), "utf8")) as { writerPromptLaws?: unknown };
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
export const SEED_KEYWORDS: readonly SeedKeyword[] = KOIOS_FARM_PROPERTY.seeds as readonly SeedKeyword[];

export type { SearchConsoleQuery };

export type DemandEntry = FarmDemandEntry & Readonly<{ beat: KoiosBeat }>;

/** Read records/search-console.json if present. */
export function readSearchConsole(dataDir: string): readonly SearchConsoleQuery[] {
  return readFarmSearchConsole(farmRecordPath(dataDir, "search-console.json"));
}

/** Fold Koios demand through the canonical farm reading. */
export function demandTable(input: Readonly<{
  posts: readonly KoiosPost[];
  views: ViewCounts;
  searchConsole?: readonly SearchConsoleQuery[];
  seeds?: readonly SeedKeyword[];
}>): readonly DemandEntry[] {
  return farmDemandTable({
    posts: input.posts,
    views: input.views,
    seeds: input.seeds ?? SEED_KEYWORDS,
    termKey: KOIOS_FARM_PROPERTY.termKey ?? "koios",
    ...(input.searchConsole === undefined ? {} : { searchConsole: input.searchConsole }),
  }) as readonly DemandEntry[];
}
