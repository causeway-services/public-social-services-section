import { readdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { parse as parseEavt, type EAVT } from "@emsenn/metroplat/codecs/text/json/jsonl/eavt";

import { loadPosts, type KoiosPost } from "./content.mjs";
import { normalizeTerm, SEED_KEYWORDS, type KoiosBeat } from "./demand.mjs";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const DEFAULT_CABLE_CONFIG = resolve(packageRoot, "cable.config.json");
export const DEFAULT_STORE_DIR = resolve(packageRoot, "store");

const STOPWORDS: ReadonlySet<string> = new Set([
  "the", "and", "for", "are", "but", "not", "you", "all", "any", "can", "was", "one", "our",
  "has", "had", "how", "its", "new", "now", "old", "see", "who", "why", "did", "get", "may",
  "with", "that", "this", "from", "they", "have", "will", "what", "when", "your", "into", "than",
  "them", "then", "over", "more", "most", "some", "such", "only", "also", "been", "were", "after",
  "about", "would", "could", "their", "there", "which", "while", "these", "those", "other", "amid",
  "amidst", "says", "said", "should", "between", "across", "under", "first", "still", "every",
  "where", "here", "make", "made", "take", "https", "http", "www", "com", "org", "net", "read",
  "full", "story", "click", "link", "via", "year", "years", "ago", "last", "week", "weeks",
  "month", "months", "day", "days", "today", "yesterday", "time", "times", "according", "report",
  "reports", "around", "world", "people", "many", "much", "back", "show", "shows", "found", "find",
]);

export type BeatIntakeItem = Readonly<{
  entity: string;
  beat: string;
  title: string;
  url: string;
  summary: string;
  published?: string;
  author?: string;
  sourceUrl?: string;
  categories: readonly string[];
}>;

export type BeatIntake = Readonly<{
  beat: string;
  storeDir: string;
  items: readonly BeatIntakeItem[];
}>;

export type CoverageGap = Readonly<{
  term: string;
  beat: KoiosBeat;
  priority: number;
  intakeSupport: number;
  coverage: number;
  gapScore: number;
  evidence: readonly string[];
}>;

export type CandidateKeyword = Readonly<{
  phrase: string;
  beat: string;
  documentFrequency: number;
  sourceBreadth: number;
  score: number;
  evidence: readonly string[];
}>;

export type CandidateSource = Readonly<{
  domain: string;
  citationCount: number;
  citingSlugs: readonly string[];
  note: string;
}>;

export type TrendProbeItem = Readonly<{ term: string; traffic?: string }>;
export type TrendProbeResult =
  | Readonly<{ ok: true; source: string; items: readonly TrendProbeItem[] }>
  | Readonly<{ ok: false; source: string; obstruction: string }>;
export type TrendSignal = Readonly<{ term: string; traffic?: string; beat: string; alreadyCovered: boolean }>;
export type TrendsReading = Readonly<{
  probed: boolean;
  source?: string;
  obstruction?: string;
  novel: readonly TrendSignal[];
  reinforcing: readonly TrendSignal[];
}>;

export type KeywordDiscoveryReading = Readonly<{
  kind: "koios.news.discovery.reading";
  property: "koios.news";
  generatedAt: string;
  configPath: string;
  contentDir: string;
  storeDir: string;
  intakeItemCount: number;
  publishedPostCount: number;
  coverageGaps: readonly CoverageGap[];
  candidateKeywords: readonly CandidateKeyword[];
  candidateSources: readonly CandidateSource[];
  trends: TrendsReading;
  primitives: readonly string[];
  constraints: readonly string[];
}>;

function record(value: unknown): Readonly<Record<string, unknown>> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Readonly<Record<string, unknown>>
    : Object.freeze({});
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;
}

function strings(value: unknown): readonly string[] {
  if (!Array.isArray(value)) return Object.freeze([]);
  return Object.freeze(value.flatMap((item) => stringValue(item) === undefined ? [] : [stringValue(item)!]));
}

function domainOf(url: string | undefined): string | undefined {
  if (url === undefined) return undefined;
  try {
    return new URL(url).hostname.replace(/^www\./iu, "").toLowerCase();
  } catch {
    return undefined;
  }
}

function tokens(text: string): readonly string[] {
  return Object.freeze(normalizeTerm(text).split(" ").filter((token) =>
    token.length >= 3 && !STOPWORDS.has(token) && !/^\d+$/u.test(token)));
}

async function walkFiles(dir: string, suffix: string): Promise<readonly string[]> {
  const out: string[] = [];
  async function walk(current: string): Promise<void> {
    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = resolve(current, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.isFile() && entry.name.endsWith(suffix)) out.push(full);
    }
  }
  await walk(dir);
  return Object.freeze(out.sort());
}

function itemFromBundle(entity: string, beat: string, bundle: unknown): BeatIntakeItem | null {
  const root = record(bundle);
  const item = record(root["item"]);
  const article = record(root["article"]);
  const provenance = record(root["provenance"]);
  const title = stringValue(item["title"]) ?? stringValue(article["title"]);
  const url = stringValue(item["url"]) ?? stringValue(article["url"]) ?? stringValue(provenance["itemUrl"]);
  if (title === undefined || url === undefined) return null;
  return Object.freeze({
    entity,
    beat,
    title,
    url,
    summary: stringValue(item["summary"]) ?? "",
    ...(stringValue(item["published"]) === undefined ? {} : { published: stringValue(item["published"])! }),
    ...(stringValue(item["author"]) === undefined ? {} : { author: stringValue(item["author"])! }),
    ...(stringValue(provenance["sourceUrl"]) === undefined ? {} : { sourceUrl: stringValue(provenance["sourceUrl"])! }),
    categories: strings(item["categories"]),
  });
}

function rowsToItems(beat: string, rows: readonly EAVT[]): readonly BeatIntakeItem[] {
  const byEntity = new Map<string, Record<string, unknown>>();
  for (const [entity, attribute, value] of rows) {
    if (typeof entity !== "string" || typeof attribute !== "string") continue;
    const item = byEntity.get(entity) ?? {};
    item[attribute] = value;
    byEntity.set(entity, item);
  }
  const items: BeatIntakeItem[] = [];
  for (const [entity, attrs] of byEntity) {
    const fromBundle = itemFromBundle(entity, beat, attrs["koios.news.cable.bundle"]);
    if (fromBundle !== null) {
      items.push(fromBundle);
      continue;
    }
    const title = stringValue(attrs["koios.news.cable.title"]);
    const url = stringValue(attrs["koios.news.cable.url"]);
    if (title === undefined || url === undefined) continue;
    items.push(Object.freeze({
      entity,
      beat,
      title,
      url,
      summary: stringValue(attrs["koios.news.cable.summary"]) ?? "",
      ...(stringValue(attrs["koios.news.cable.published"]) === undefined ? {} : { published: stringValue(attrs["koios.news.cable.published"])! }),
      ...(stringValue(attrs["koios.news.cable.author"]) === undefined ? {} : { author: stringValue(attrs["koios.news.cable.author"])! }),
      ...(stringValue(attrs["koios.news.cable.source_url"]) === undefined ? {} : { sourceUrl: stringValue(attrs["koios.news.cable.source_url"])! }),
      categories: Object.freeze([]),
    }));
  }
  return Object.freeze(items.sort((left, right) => left.title.localeCompare(right.title)));
}

export async function readBeatIntake(storeDir = DEFAULT_STORE_DIR): Promise<readonly BeatIntake[]> {
  let beats;
  try {
    beats = await readdir(storeDir, { withFileTypes: true });
  } catch {
    return Object.freeze([]);
  }
  const out: BeatIntake[] = [];
  for (const beatDir of beats.filter((entry) => entry.isDirectory()).sort((left, right) => left.name.localeCompare(right.name))) {
    const root = resolve(storeDir, beatDir.name);
    const rows: EAVT[] = [];
    for (const file of await walkFiles(resolve(root, "data/logs"), ".jsonl")) {
      rows.push(...parseEavt(await readFile(file, "utf8")));
    }
    out.push(Object.freeze({ beat: beatDir.name, storeDir: root, items: rowsToItems(beatDir.name, rows) }));
  }
  return Object.freeze(out);
}

function corpusCoverage(posts: readonly KoiosPost[]): Readonly<{
  covered: ReadonlyMap<string, number>;
  referenceDomains: ReadonlyMap<string, ReadonlySet<string>>;
}> {
  const covered = new Map<string, number>();
  const referenceDomains = new Map<string, Set<string>>();
  for (const post of posts) {
    const claimed = [
      post.frontMatter.koios.seo_term,
      ...post.frontMatter.keywords,
      ...post.frontMatter.tags,
    ].flatMap((value) => value === undefined ? [] : [value]);
    for (const term of new Set(claimed.map(normalizeTerm).filter(Boolean))) {
      covered.set(term, (covered.get(term) ?? 0) + 1);
    }
    for (const reference of post.frontMatter.references) {
      const domain = domainOf(reference.URL);
      if (domain === undefined) continue;
      const slugs = referenceDomains.get(domain) ?? new Set<string>();
      slugs.add(post.slug);
      referenceDomains.set(domain, slugs);
    }
  }
  return Object.freeze({ covered, referenceDomains });
}

function termSupportCount(term: string, items: readonly BeatIntakeItem[]): number {
  const words = normalizeTerm(term).split(" ").filter((word) => word.length >= 3 && !STOPWORDS.has(word));
  if (words.length === 0) return 0;
  return items.filter((item) => {
    const hay = normalizeTerm(`${item.title} ${item.summary} ${item.categories.join(" ")}`);
    return words.every((word) => hay.includes(word));
  }).length;
}

function coverageGaps(beats: readonly BeatIntake[], covered: ReadonlyMap<string, number>): readonly CoverageGap[] {
  return Object.freeze(SEED_KEYWORDS.flatMap((seed): CoverageGap[] => {
    const beat = beats.find((entry) => entry.beat === seed.beat);
    if (beat === undefined) return [];
    const support = termSupportCount(seed.term, beat.items);
    if (support < 2) return [];
    const coverage = covered.get(normalizeTerm(seed.term)) ?? 0;
    const words = normalizeTerm(seed.term).split(" ").filter((word) => word.length >= 3 && !STOPWORDS.has(word));
    const evidence = beat.items.filter((item) => {
      const hay = normalizeTerm(`${item.title} ${item.summary}`);
      return words.every((word) => hay.includes(word));
    }).slice(0, 2).map((item) => item.title);
    return [Object.freeze({
      term: seed.term,
      beat: seed.beat,
      priority: seed.priority,
      intakeSupport: support,
      coverage,
      gapScore: Math.round((support / (coverage + 1)) * seed.priority * 100) / 100,
      evidence: Object.freeze(evidence),
    })];
  }).sort((left, right) => right.gapScore - left.gapScore || right.intakeSupport - left.intakeSupport));
}

function candidateKeywords(
  beats: readonly BeatIntake[],
  covered: ReadonlyMap<string, number>,
  perBeat: number,
): readonly CandidateKeyword[] {
  const seedNormals = SEED_KEYWORDS.map((seed) => normalizeTerm(seed.term));
  const out: CandidateKeyword[] = [];
  for (const beat of beats) {
    const phrases = new Map<string, { df: number; domains: Set<string>; examples: string[] }>();
    for (const item of beat.items) {
      const domain = domainOf(item.sourceUrl ?? item.url) ?? beat.beat;
      const words = tokens(`${item.title} ${item.summary}`);
      const seen = new Set<string>();
      for (let n = 2; n <= 3; n += 1) {
        for (let index = 0; index + n <= words.length; index += 1) {
          const phrase = words.slice(index, index + n).join(" ");
          if (seen.has(phrase)) continue;
          seen.add(phrase);
          const tally = phrases.get(phrase) ?? { df: 0, domains: new Set<string>(), examples: [] };
          tally.df += 1;
          tally.domains.add(domain);
          if (tally.examples.length < 2 && !tally.examples.includes(item.title)) tally.examples.push(item.title);
          phrases.set(phrase, tally);
        }
      }
    }
    out.push(...[...phrases.entries()]
      .filter(([phrase, tally]) =>
        tally.df >= 2 &&
        tally.domains.size >= 1 &&
        !covered.has(phrase) &&
        !seedNormals.some((seed) => seed.includes(phrase) || phrase.includes(seed)))
      .map(([phrase, tally]) => Object.freeze({
        phrase,
        beat: beat.beat,
        documentFrequency: tally.df,
        sourceBreadth: tally.domains.size,
        score: Math.round(tally.df * Math.sqrt(tally.domains.size) * 100) / 100,
        evidence: Object.freeze(tally.examples),
      }))
      .sort((left, right) => right.score - left.score || left.phrase.localeCompare(right.phrase))
      .slice(0, perBeat));
  }
  return Object.freeze(out.sort((left, right) => right.score - left.score || left.phrase.localeCompare(right.phrase)));
}

async function configuredSourceDomains(configPath: string): Promise<ReadonlySet<string>> {
  const config = record(JSON.parse(await readFile(configPath, "utf8")) as unknown);
  const cable = record(config["newscable"]);
  const domains = new Set<string>();
  for (const wire of Array.isArray(cable["wires"]) ? cable["wires"] : []) {
    for (const source of Array.isArray(record(wire)["sources"]) ? record(wire)["sources"] as readonly unknown[] : []) {
      const domain = domainOf(stringValue(record(source)["url"]));
      if (domain !== undefined) domains.add(domain);
    }
  }
  return domains;
}

function candidateSources(
  referenceDomains: ReadonlyMap<string, ReadonlySet<string>>,
  configuredDomains: ReadonlySet<string>,
): readonly CandidateSource[] {
  const out: CandidateSource[] = [];
  for (const [domain, slugs] of referenceDomains) {
    if (configuredDomains.has(domain) || slugs.size < 2) continue;
    out.push(Object.freeze({
      domain,
      citationCount: slugs.size,
      citingSlugs: Object.freeze([...slugs].sort()),
      note: `Cited by ${slugs.size} published articles but absent from the configured Web 2.0 cable feed list.`,
    }));
  }
  return Object.freeze(out.sort((left, right) => right.citationCount - left.citationCount || left.domain.localeCompare(right.domain)));
}

export type FetchLike = (url: string) => Promise<{ ok: boolean; status: number; text(): Promise<string> }>;

export async function googleTrendsProbe(
  options: Readonly<{ geo?: string; fetchImpl?: FetchLike }> = {},
): Promise<TrendProbeResult> {
  const geo = options.geo ?? "US";
  const url = `https://trends.google.com/trending/rss?geo=${encodeURIComponent(geo)}`;
  const source = `google-trends:${geo}`;
  const fetchImpl = options.fetchImpl ?? (fetch as unknown as FetchLike);
  try {
    const response = await fetchImpl(url);
    if (!response.ok) return Object.freeze({ ok: false as const, source, obstruction: `HTTP ${response.status} from ${url}` });
    const xml = await response.text();
    const items = xml.split(/<item>/u).slice(1).flatMap((block): TrendProbeItem[] => {
      const title = /<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/su.exec(block)?.[1]?.trim();
      if (title === undefined || title === "") return [];
      const traffic = /<ht:approx_traffic>(.*?)<\/ht:approx_traffic>/su.exec(block)?.[1]?.trim();
      return [Object.freeze({ term: title, ...(traffic === undefined || traffic === "" ? {} : { traffic }) })];
    });
    if (items.length === 0) return Object.freeze({ ok: false as const, source, obstruction: `no trend items parsed from ${url}` });
    return Object.freeze({ ok: true as const, source, items: Object.freeze(items) });
  } catch (error) {
    return Object.freeze({ ok: false as const, source, obstruction: error instanceof Error ? error.message : String(error) });
  }
}

function foldTrends(
  probe: TrendProbeResult | undefined,
  covered: ReadonlyMap<string, number>,
): TrendsReading {
  if (probe === undefined) return Object.freeze({ probed: false, novel: Object.freeze([]), reinforcing: Object.freeze([]) });
  if (!probe.ok) {
    return Object.freeze({ probed: true, source: probe.source, obstruction: probe.obstruction, novel: Object.freeze([]), reinforcing: Object.freeze([]) });
  }
  const beatVocabulary = new Map<string, Set<string>>();
  for (const seed of SEED_KEYWORDS) {
    const words = beatVocabulary.get(seed.beat) ?? new Set<string>();
    for (const word of normalizeTerm(seed.term).split(" ")) {
      if (word.length >= 4 && !STOPWORDS.has(word)) words.add(word);
    }
    beatVocabulary.set(seed.beat, words);
  }
  const novel: TrendSignal[] = [];
  const reinforcing: TrendSignal[] = [];
  for (const item of probe.items) {
    const normal = normalizeTerm(item.term);
    const trendWords = normal.split(" ").filter((word) => word.length >= 4 && !STOPWORDS.has(word));
    const beat = [...beatVocabulary.entries()].find(([, vocabulary]) => trendWords.some((word) => vocabulary.has(word)))?.[0];
    if (beat === undefined) continue;
    const alreadyCovered = covered.has(normal) || [...covered.keys()].some((term) => term.includes(normal) || normal.includes(term));
    const signal = Object.freeze({ term: item.term, ...(item.traffic === undefined ? {} : { traffic: item.traffic }), beat, alreadyCovered });
    if (alreadyCovered) reinforcing.push(signal);
    else novel.push(signal);
  }
  return Object.freeze({ probed: true, source: probe.source, novel: Object.freeze(novel), reinforcing: Object.freeze(reinforcing) });
}

export async function keywordDiscoveryReading(options: Readonly<{
  configPath?: string;
  contentDir?: string;
  storeDir?: string;
  now?: () => string;
  perBeatKeywords?: number;
  trends?: TrendProbeResult;
}> = {}): Promise<KeywordDiscoveryReading> {
  const configPath = resolve(options.configPath ?? DEFAULT_CABLE_CONFIG);
  const contentDir = resolve(options.contentDir ?? resolve(packageRoot, "content/posts"));
  const storeDir = resolve(options.storeDir ?? DEFAULT_STORE_DIR);
  const [beats, posts, configured] = await Promise.all([
    readBeatIntake(storeDir),
    loadPosts(contentDir),
    configuredSourceDomains(configPath),
  ]);
  const { covered, referenceDomains } = corpusCoverage(posts);
  return Object.freeze({
    kind: "koios.news.discovery.reading" as const,
    property: "koios.news" as const,
    generatedAt: (options.now ?? (() => new Date().toISOString()))(),
    configPath,
    contentDir,
    storeDir,
    intakeItemCount: beats.reduce((sum, beat) => sum + beat.items.length, 0),
    publishedPostCount: posts.length,
    coverageGaps: coverageGaps(beats, covered),
    candidateKeywords: candidateKeywords(beats, covered, options.perBeatKeywords ?? 6),
    candidateSources: candidateSources(referenceDomains, configured),
    trends: foldTrends(options.trends, covered),
    primitives: Object.freeze([
      "@emsenn/metroplat/codecs/text/json/jsonl/eavt.parse",
      "Koios M1 cable claim-state bundles",
      "KoiosPost claim projection under frontMatter.koios",
    ]),
    constraints: Object.freeze([
      "Discovery is read-only: it does not edit cable.config.json, seed terms, or posts.",
      "Only Web 2.0 cable feeds and published corpus records are folded.",
      "Google Trends is optional and folded as signal or obstruction, never as a hard dependency.",
    ]),
  });
}
