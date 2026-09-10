import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { JsonValue } from "@emsenn/metroplat";

import type { KoiosPost } from "./content.mjs";
import type { ViewCounts } from "./views.mjs";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const DEFAULT_CONTENT_DIR = resolve(packageRoot, "content/posts");
export const DEFAULT_DATA_DIR = resolve(packageRoot, "data");
export const DEFAULT_DEMAND_RECORD = resolve(DEFAULT_DATA_DIR, "records/demand.json");

export type KoiosBeat =
  | "technology"
  | "economy"
  | "culture"
  | "politics"
  | "war"
  | "environment"
  | "degrowth"
  | "decolonization";

export type SeedKeyword = Readonly<{
  beat: KoiosBeat;
  term: string;
  priority: number;
}>;

export type SearchConsoleQuery = Readonly<{
  query: string;
  clicks: number;
  impressions: number;
  ctr?: number;
  position?: number;
}>;

export type DemandEntry = SeedKeyword & Readonly<{
  rank: number;
  normalizedTerm: string;
  score: number;
  baseScore: number;
  earnedViews: number;
  searchConsoleClicks: number;
  searchConsoleImpressions: number;
  searchConsoleAveragePosition?: number;
  covered: number;
  coverageDecay: number;
  decayed: boolean;
  evidence: readonly string[];
}>;

export type DemandReading = Readonly<{
  kind: "koios.news.demand.reading";
  generatedAt: string;
  property: "sc-domain:koios.news";
  termNamespace: "koios";
  demand: readonly DemandEntry[];
  sourceCounts: Readonly<{
    seeds: number;
    posts: number;
    viewPaths: number;
    searchConsoleQueries: number;
  }>;
  coverageSettlement: JsonValue;
  primitives: readonly string[];
  constraints: readonly string[];
}>;

export const SEED_KEYWORDS: readonly SeedKeyword[] = Object.freeze([
  { beat: "environment", term: "climate tipping points", priority: 8 },
  { beat: "environment", term: "crop failure and food prices", priority: 8 },
  { beat: "environment", term: "urban water scarcity", priority: 7 },
  { beat: "environment", term: "insurance climate risk withdrawal", priority: 9 },
  { beat: "environment", term: "extreme heat and infrastructure", priority: 7 },
  { beat: "technology", term: "data center water use", priority: 8 },
  { beat: "technology", term: "AI demand on the grid", priority: 8 },
  { beat: "technology", term: "AI data center power demand", priority: 9 },
  { beat: "technology", term: "AI infrastructure energy use", priority: 8 },
  { beat: "technology", term: "AI labor displacement", priority: 6 },
  { beat: "technology", term: "AI policy and state capacity", priority: 6 },
  { beat: "technology", term: "semiconductor supply chain fragility", priority: 6 },
  { beat: "technology", term: "satellite internet outage", priority: 5 },
  { beat: "economy", term: "climate stranded assets", priority: 7 },
  { beat: "economy", term: "AI capital expenditure bubble", priority: 7 },
  { beat: "economy", term: "AI infrastructure debt", priority: 6 },
  { beat: "economy", term: "crypto mining energy demand", priority: 7 },
  { beat: "economy", term: "stablecoin dollar demand", priority: 6 },
  { beat: "economy", term: "crypto liquidity crisis", priority: 6 },
  { beat: "economy", term: "cost of living climate shocks", priority: 7 },
  { beat: "economy", term: "climate disasters and sovereign debt", priority: 7 },
  { beat: "economy", term: "de-dollarization of commodity trade", priority: 6 },
  { beat: "economy", term: "farmland and water rights", priority: 6 },
  { beat: "politics", term: "climate migration and border policy", priority: 8 },
  { beat: "politics", term: "AI regulation geopolitics", priority: 6 },
  { beat: "politics", term: "crypto campaign finance", priority: 5 },
  { beat: "politics", term: "data center permitting fights", priority: 6 },
  { beat: "politics", term: "disaster response funding cuts", priority: 7 },
  { beat: "politics", term: "resource nationalism", priority: 7 },
  { beat: "politics", term: "state capacity failure", priority: 6 },
  { beat: "degrowth", term: "degrowth", priority: 8 },
  { beat: "degrowth", term: "post-growth economics", priority: 7 },
  { beat: "degrowth", term: "limits to growth", priority: 7 },
  { beat: "degrowth", term: "wellbeing economy", priority: 6 },
  { beat: "degrowth", term: "sufficiency and consumption", priority: 6 },
  { beat: "degrowth", term: "localization and resilience", priority: 6 },
  { beat: "decolonization", term: "decolonization", priority: 8 },
  { beat: "decolonization", term: "climate reparations", priority: 8 },
  { beat: "decolonization", term: "extraction and the global south", priority: 7 },
  { beat: "decolonization", term: "indigenous land rights", priority: 7 },
  { beat: "decolonization", term: "sovereign debt and the global south", priority: 7 },
  { beat: "decolonization", term: "neocolonial trade", priority: 6 },
  { beat: "war", term: "neo-Nazi accelerationism", priority: 8 },
  { beat: "war", term: "online radicalization", priority: 8 },
  { beat: "war", term: "terrorism and extremism", priority: 7 },
  { beat: "war", term: "great replacement conspiracy", priority: 7 },
  { beat: "war", term: "stochastic terrorism", priority: 6 },
  { beat: "war", term: "geopolitical conflict escalation", priority: 7 },
  { beat: "war", term: "disinformation and war", priority: 6 },
  { beat: "war", term: "state fragility and armed conflict", priority: 7 },
  { beat: "culture", term: "cultural institutions funding", priority: 6 },
  { beat: "culture", term: "streaming and creative labor", priority: 6 },
  { beat: "culture", term: "heritage and museums", priority: 5 },
]);

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;
}

function number(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) return Number(value);
  return 0;
}

function record(value: unknown): Readonly<Record<string, unknown>> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Readonly<Record<string, unknown>>
    : Object.freeze({});
}

function slugPath(slug: string): string {
  return `/posts/${encodeURIComponent(slug)}`;
}

export function normalizeTerm(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/gu, "")
    .toLowerCase()
    .replace(/&/gu, " and ")
    .replace(/[^a-z0-9$]+/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function claimedTerms(post: KoiosPost): readonly string[] {
  return Object.freeze([
    post.frontMatter.koios.seo_term,
    ...post.frontMatter.keywords,
    ...post.frontMatter.tags,
  ].flatMap((value) => value === undefined ? [] : [value]));
}

function coverageIndex(posts: readonly KoiosPost[]): ReadonlyMap<string, readonly KoiosPost[]> {
  const covered = new Map<string, KoiosPost[]>();
  for (const post of posts) {
    for (const term of new Set(claimedTerms(post).map(normalizeTerm).filter(Boolean))) {
      const bucket = covered.get(term) ?? [];
      bucket.push(post);
      covered.set(term, bucket);
    }
  }
  return new Map([...covered.entries()].sort(([left], [right]) => left.localeCompare(right)));
}

function dedupJsonStrings(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)]);
}

function coverageSettlement(posts: readonly KoiosPost[]): JsonValue {
  const seedTerms = new Set(SEED_KEYWORDS.map((seed) => normalizeTerm(seed.term)));
  const coveredSeedTerms = posts.flatMap((post) =>
    claimedTerms(post).map(normalizeTerm).filter((term) => seedTerms.has(term)));
  return Object.freeze({
    kind: "koios.news.coverage.settled-seed-terms",
    terms: dedupJsonStrings(coveredSeedTerms),
    primitive: "@emsenn/metroplat/evaluators/settling.dedupTerm",
  }) as unknown as JsonValue;
}

function matchingSearchConsole(term: string, queries: readonly SearchConsoleQuery[]): readonly SearchConsoleQuery[] {
  const normal = normalizeTerm(term);
  return Object.freeze(queries.filter((query) => {
    const queryNormal = normalizeTerm(query.query);
    return queryNormal === normal || queryNormal.includes(normal) || normal.includes(queryNormal);
  }));
}

function earnedViews(termPosts: readonly KoiosPost[], views: ViewCounts): number {
  let count = 0;
  for (const post of termPosts) {
    count += views[slugPath(post.slug)] ?? 0;
    count += views[`/posts/${post.slug}`] ?? 0;
  }
  return count;
}

function evidenceTitles(posts: readonly KoiosPost[]): readonly string[] {
  return Object.freeze(posts.slice(0, 3).map((post) => post.frontMatter.title));
}

export function demandTable(input: Readonly<{
  posts: readonly KoiosPost[];
  views: ViewCounts;
  searchConsole?: readonly SearchConsoleQuery[];
  seeds?: readonly SeedKeyword[];
}>): readonly DemandEntry[] {
  const seeds = input.seeds ?? SEED_KEYWORDS;
  const queries = input.searchConsole ?? [];
  const covered = coverageIndex(input.posts);
  const rows = seeds.map((seed): DemandEntry => {
    const normalizedTerm = normalizeTerm(seed.term);
    const posts = covered.get(normalizedTerm) ?? Object.freeze([]);
    const coveredCount = posts.length;
    const matchedQueries = matchingSearchConsole(seed.term, queries);
    const searchConsoleClicks = matchedQueries.reduce((sum, item) => sum + item.clicks, 0);
    const searchConsoleImpressions = matchedQueries.reduce((sum, item) => sum + item.impressions, 0);
    const weightedPosition = matchedQueries.reduce((sum, item) => sum + ((item.position ?? 0) * Math.max(1, item.impressions)), 0);
    const positionWeight = matchedQueries.reduce((sum, item) => sum + Math.max(1, item.impressions), 0);
    const views = earnedViews(posts, input.views);
    const baseScore = (seed.priority * 10) + (views * 2) + searchConsoleClicks + (Math.log10(searchConsoleImpressions + 1) * 8);
    const coverageDecay = 1 / (coveredCount + 1);
    const score = Math.round(baseScore * coverageDecay * 100) / 100;
    return Object.freeze({
      ...seed,
      rank: 0,
      normalizedTerm,
      score,
      baseScore: Math.round(baseScore * 100) / 100,
      earnedViews: views,
      searchConsoleClicks,
      searchConsoleImpressions,
      ...(positionWeight === 0 ? {} : { searchConsoleAveragePosition: Math.round((weightedPosition / positionWeight) * 100) / 100 }),
      covered: coveredCount,
      coverageDecay,
      decayed: coveredCount > 0,
      evidence: evidenceTitles(posts),
    });
  }).sort((left, right) =>
    right.score - left.score ||
    right.priority - left.priority ||
    left.term.localeCompare(right.term));
  return Object.freeze(rows.map((entry, index) => Object.freeze({ ...entry, rank: index + 1 })));
}

export function demandReading(input: Readonly<{
  posts: readonly KoiosPost[];
  views: ViewCounts;
  searchConsole?: readonly SearchConsoleQuery[];
  seeds?: readonly SeedKeyword[];
  now?: () => string;
}>): DemandReading {
  const seeds = input.seeds ?? SEED_KEYWORDS;
  return Object.freeze({
    kind: "koios.news.demand.reading" as const,
    generatedAt: (input.now ?? (() => new Date().toISOString()))(),
    property: "sc-domain:koios.news" as const,
    termNamespace: "koios" as const,
    demand: demandTable({ posts: input.posts, views: input.views, searchConsole: input.searchConsole, seeds }),
    sourceCounts: Object.freeze({
      seeds: seeds.length,
      posts: input.posts.length,
      viewPaths: Object.keys(input.views).length,
      searchConsoleQueries: input.searchConsole?.length ?? 0,
    }),
    coverageSettlement: coverageSettlement(input.posts),
    primitives: Object.freeze([
      "@emsenn/metroplat/evaluators/settling.dedupTerm",
      "@emsenn/metroplat/services/filesystem-store witness view counts",
      "KoiosPost claim projection under frontMatter.koios",
    ]),
    constraints: Object.freeze([
      "Search Console remains an external fetch adapter; this reading only folds already-recorded query rows.",
      "Covered terms are the settled distinct terms claimed under the koios frontmatter namespace.",
      "Coverage decay is monotone: every covered post divides the raw demand score by covered + 1.",
    ]),
  });
}

function parseSearchConsoleRow(value: unknown): SearchConsoleQuery | null {
  if (Array.isArray(value)) {
    const query = text(value[0]);
    if (query === undefined) return null;
    return Object.freeze({
      query,
      clicks: number(value[1]),
      impressions: number(value[2]),
      ctr: number(value[3]),
      position: number(value[4]),
    });
  }
  const row = record(value);
  const keys = Array.isArray(row["keys"]) ? row["keys"] : undefined;
  const query = text(row["query"]) ?? text(row["Query"]) ?? text(keys?.[0]);
  if (query === undefined) return null;
  const ctr = number(row["ctr"] ?? row["CTR"]);
  const position = number(row["position"] ?? row["Position"]);
  return Object.freeze({
    query,
    clicks: number(row["clicks"] ?? row["Clicks"]),
    impressions: number(row["impressions"] ?? row["Impressions"]),
    ...(ctr === 0 ? {} : { ctr }),
    ...(position === 0 ? {} : { position }),
  });
}

function searchConsoleRows(value: unknown): readonly SearchConsoleQuery[] {
  if (Array.isArray(value)) return Object.freeze(value.flatMap((item) => {
    const row = parseSearchConsoleRow(item);
    return row === null ? [] : [row];
  }));
  const root = record(value);
  for (const key of ["rows", "queries", "data", "records"]) {
    if (Array.isArray(root[key])) return searchConsoleRows(root[key]);
  }
  const row = parseSearchConsoleRow(value);
  return Object.freeze(row === null ? [] : [row]);
}

async function readJsonIfExists(path: string): Promise<unknown | null> {
  try {
    return JSON.parse(await readFile(path, "utf8")) as unknown;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") return null;
    throw error;
  }
}

export async function readSearchConsole(dataDir = DEFAULT_DATA_DIR): Promise<readonly SearchConsoleQuery[]> {
  const candidates = [
    resolve(dataDir, "records/search-console.json"),
    resolve(dataDir, "search-console.json"),
  ];
  for (const path of candidates) {
    const value = await readJsonIfExists(path);
    if (value !== null) return searchConsoleRows(value);
  }
  return Object.freeze([]);
}

export async function writeDemandRecord(reading: DemandReading, path = DEFAULT_DEMAND_RECORD): Promise<string> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(reading, null, 2)}\n`);
  return path;
}
