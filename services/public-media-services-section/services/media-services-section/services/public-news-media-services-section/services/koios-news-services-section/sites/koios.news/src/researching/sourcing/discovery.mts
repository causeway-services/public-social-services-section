// researching/sourcing/discovery — keyword and source discovery over owned intake.
//
// The source roll shows what Koios already listens to; demand ranks the seed
// terms it already holds. Discovery is the upstream-of-demand reading: it asks
// what the newsroom should be covering that it is NOT, and where new evidence
// could come from. It is pure over two owned substrates — the witnessed wire
// stores on disk and the published corpus — so it runs without the cable server
// and without credentials. An optional Google Trends probe folds the wider
// web's attention in as obstruction-or-signal, never a crash.
//
// Three readings, all as values:
//   1. coverage gaps  — seed terms the intake strongly supports but the corpus
//      barely covers (demand the publication is leaving on the table);
//   2. candidate keywords — frequent multi-word phrases across the intake that
//      no seed term yet names (new beats the wire is already carrying);
//   3. candidate sources — domains the published bibliography keeps citing that
//      have no configured wire feed (sources worth wiring into the cable).
//
// This is the "pick what to cover next, and where to listen" instrument the
// editor needs before the farm assigns and drafts. It proposes; it never writes
// the config or the seed list.

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

import { loadWireBundles, projectItem, type WireItem } from "@red-cup-engineering/organizing-a-newswire";
import {
  candidateContentKeyword,
  candidateContentSource,
  contentCoverageGap,
  contentDiscoveryReading,
  contentTrendsReading,
  normalizeTerm,
  termSupportCount,
  type CandidateContentKeyword,
  type CandidateContentSource,
  type ContentCoverageGap,
  type ContentDiscoveryReading,
  type ContentTrendSignal,
  type ContentTrendsReading,
} from "@red-cup-engineering/organizing-a-content-farm";

import { DEFAULT_CONTENT_PRODUCTION_CONFIG } from "../../config.mts";
import { koiosFarmProperty, SEED_KEYWORDS } from "../../demand.mts";
import { loadPosts } from "../../content.mts";

// ---------- the carrier shapes ----------

export type CoverageGap = ContentCoverageGap;
export type CandidateKeyword = CandidateContentKeyword;
export type CandidateSource = CandidateContentSource;
export type TrendSignal = ContentTrendSignal;
export type TrendsReading = ContentTrendsReading;
export type KeywordDiscoveryReading = ContentDiscoveryReading;

// ---------- shared text helpers ----------

const STOPWORDS: ReadonlySet<string> = new Set([
  "the", "and", "for", "are", "but", "not", "you", "all", "any", "can", "her", "was", "one", "our",
  "out", "has", "had", "his", "how", "its", "new", "now", "old", "see", "two", "who", "why", "did",
  "get", "may", "say", "she", "too", "use", "with", "that", "this", "from", "they", "have", "will",
  "what", "when", "your", "into", "than", "them", "then", "over", "more", "most", "some", "such",
  "only", "also", "been", "were", "being", "after", "about", "would", "could", "their", "there",
  "which", "while", "these", "those", "other", "amid", "amidst", "says", "said", "could", "should",
  "between", "across", "under", "first", "still", "every", "where", "here", "make", "made", "take", "again",
  // RSS/boilerplate and temporal chrome that surfaces as phrases but names no topic.
  "https", "http", "www", "com", "org", "net", "read", "full", "story", "click", "link", "via",
  "year", "years", "ago", "last", "week", "weeks", "month", "months", "day", "days", "today",
  "yesterday", "time", "times", "way", "ways", "just", "like", "according", "report", "reports",
  "around", "world", "people", "many", "much", "back", "show", "shows", "found", "find",
]);

function domainOf(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return undefined;
  }
}

export function discoveryTextTokens(text: string): readonly string[] {
  // Wire summaries are often HTML fragments. Phrase mining must observe the
  // human-visible evidence, not tag names, class names, inline CSS, or entity
  // spelling introduced by the transport carrier.
  return normalizeTerm(evidenceText(text)).split(" ").filter((token) => token.length >= 3 && !STOPWORDS.has(token) && !/^\d+$/.test(token));
}

const tokens = discoveryTextTokens;

function properNamePairs(text: string): readonly string[] {
  const words = text.split(/\s+/u).map((word) => word.replace(/^[^\p{L}]+|[^\p{L}’'-]+$/gu, "")).filter(Boolean);
  const pairs: string[] = [];
  for (let index = 0; index + 1 < words.length; index += 1) {
    if (/^\p{Lu}/u.test(words[index]!) && /^\p{Lu}/u.test(words[index + 1]!)) pairs.push(tokens(`${words[index]} ${words[index + 1]}`).join(" "));
  }
  return Object.freeze(pairs.filter((pair) => pair.split(" ").length === 2));
}

// ---------- intake: the witnessed wire stores, read off disk ----------

export type IntakeItem = WireItem & Readonly<{ sourcePublished?: string }>;
export type BeatIntake = Readonly<{ beat: string; storeDir: string; items: readonly IntakeItem[] }>;
export type SourceCorroborationIndex = Readonly<{
  documents: readonly Readonly<{ item: IntakeItem; domain: string | undefined; evidenceWords: readonly string[]; evidenceTextLine: string }>[];
  frequencies: ReadonlyMap<string, number>;
  rarityCeiling: number;
}>;

type RawWire = Readonly<{ name?: unknown; store?: unknown }>;

function sourcePublished(bundle: Readonly<{ claims: readonly unknown[] }>): string | undefined {
  const candidates = bundle.claims.flatMap((value): Readonly<{ asserted: string; published: string }>[] => {
    if (value === null || typeof value !== "object" || Array.isArray(value)) return [];
    const claim = value as Record<string, unknown>;
    const proposition = claim["proposition"];
    const time = claim["time"];
    if (proposition === null || typeof proposition !== "object" || Array.isArray(proposition)) return [];
    const propositionRecord = proposition as Record<string, unknown>;
    if (propositionRecord["predicate"] !== "published" || typeof propositionRecord["object"] !== "string") return [];
    const asserted = time !== null && typeof time === "object" && !Array.isArray(time)
      && typeof (time as Record<string, unknown>)["asserted"] === "string"
      ? String((time as Record<string, unknown>)["asserted"])
      : "";
    return [Object.freeze({ asserted, published: propositionRecord["object"] })];
  });
  return candidates.sort((left, right) => left.asserted.localeCompare(right.asserted)).at(-1)?.published;
}

/** Read every configured wire's local bundle store and project items. No
 * server: discovery reads the owned evidence substrate directly. */
export async function readBeatIntake(configPath = DEFAULT_CONTENT_PRODUCTION_CONFIG): Promise<readonly BeatIntake[]> {
  const document = JSON.parse(readFileSync(configPath, "utf8")) as { newscable?: { wires?: readonly RawWire[] } };
  const cableDir = dirname(resolve(configPath));
  const wires = Array.isArray(document.newscable?.wires) ? document.newscable!.wires! : [];
  const beats: BeatIntake[] = [];
  for (const wire of wires) {
    const beat = typeof wire.name === "string" ? wire.name : "";
    if (beat === "") continue;
    const storeDir = resolve(cableDir, typeof wire.store === "string" ? wire.store : join("store", beat));
    const stored = await loadWireBundles(storeDir);
    const items = stored.map((entry): IntakeItem => {
      const projected = projectItem(entry.bundle);
      const published = sourcePublished(entry.bundle);
      return Object.freeze({ ...projected, ...(published === undefined ? {} : { sourcePublished: published }) });
    });
    beats.push(Object.freeze({ beat, storeDir, items: Object.freeze(items) }));
  }
  return Object.freeze(beats);
}

export type SourceDrivenNomination = Readonly<{
  kind: "koios.source-driven-nomination";
  beat: string;
  subject: string;
  term: string;
  title: string;
  url: string;
  summary?: string;
  sourcePublished: string;
  ingestedAt?: string;
  evidenceCharacters: number;
  ageDays: number;
  priority: number;
}>;

function evidenceText(value: string | undefined): string {
  return (value ?? "").replace(/<[^>]*>/gu, " ").replace(/&[a-z0-9#]+;/giu, " ").replace(/\s+/gu, " ").trim();
}

/** A nomination must name one reportable story, not a newsletter, link roll,
 * or review roundup whose large body only makes it look well reported. Those
 * aggregate pages remain in the source corpus as discovery context; they do
 * not get to spend a writer call as if they were one witnessed event. */
export function isReportableSourceNomination(title: string, summary: string | undefined): boolean {
  if (/\b(?:review roundup|required reading|a view from the easel)\b/iu.test(title)) return false;
  const repeatedStoryLinks = evidenceText(summary).match(/\bread more\b/giu)?.length ?? 0;
  return repeatedStoryLinks < 3;
}

/** Nominate fresh, not-yet-used events from Koios's admitted source corpus.
 *
 * This is deliberately not a popularity reading. The source desk may notice a
 * warranted event before search demand exists. The title supplies a bounded
 * subject lens; the source bundle remains the evidence and the later research
 * packet must independently pass the assignment-support gate. */
export async function sourceDrivenNominations(options: Readonly<{
  configPath?: string;
  intake?: readonly BeatIntake[];
  excludedUrls?: ReadonlySet<string>;
  now?: string;
  maxAgeDays?: number;
  limit?: number;
}> = {}): Promise<readonly SourceDrivenNomination[]> {
  const now = Date.parse(options.now ?? new Date().toISOString());
  const maxAgeDays = options.maxAgeDays ?? 30;
  const excluded = options.excludedUrls ?? new Set<string>();
  const byUrl = new Map<string, SourceDrivenNomination>();
  for (const beat of options.intake ?? await readBeatIntake(options.configPath ?? DEFAULT_CONTENT_PRODUCTION_CONFIG)) {
    for (const item of beat.items) {
      if (item.sourceUrl === undefined || excluded.has(item.sourceUrl) || item.sourcePublished === undefined) continue;
      if (!isReportableSourceNomination(item.title, item.summary)) continue;
      const published = Date.parse(item.sourcePublished);
      if (!Number.isFinite(now) || !Number.isFinite(published)) continue;
      const ageDays = Math.max(0, (now - published) / 86_400_000);
      if (published > now + 86_400_000 || ageDays > maxAgeDays) continue;
      const evidenceCharacters = evidenceText(item.summary).length;
      // A title and a two-line deck can nominate something interesting, but
      // they cannot yet finance a reported-analysis manuscript. Keep the
      // scarce writer/editor calls for bundles carrying a substantive source
      // cut; thin events can become eligible after another source enriches the
      // packet or a fuller fetch service is contracted.
      if (evidenceCharacters < 300) continue;
      const lens = tokens(item.title).slice(0, 8);
      if (lens.length < 2) continue;
      const nomination: SourceDrivenNomination = Object.freeze({
        kind: "koios.source-driven-nomination",
        beat: beat.beat,
        subject: item.subject,
        term: lens.join(" "),
        title: item.title,
        url: item.sourceUrl,
        ...(item.summary === undefined ? {} : { summary: item.summary }),
        sourcePublished: new Date(published).toISOString(),
        ...(item.published === undefined ? {} : { ingestedAt: item.published }),
        evidenceCharacters,
        ageDays: Math.round(ageDays * 100) / 100,
        priority: Math.max(1, Math.round((maxAgeDays - ageDays + 1 + Math.min(10, evidenceCharacters / 500)) * 100) / 100),
      });
      const previous = byUrl.get(item.sourceUrl);
      if (previous === undefined || nomination.sourcePublished > previous.sourcePublished) byUrl.set(item.sourceUrl, nomination);
    }
  }
  return Object.freeze([...byUrl.values()]
    .sort((left, right) => right.priority - left.priority || right.sourcePublished.localeCompare(left.sourcePublished) || left.url.localeCompare(right.url))
    .slice(0, options.limit ?? 24));
}

export function buildSourceCorroborationIndex(intake: readonly BeatIntake[]): SourceCorroborationIndex {
  const documents = intake.flatMap((beat) => beat.items.map((item) => {
    const evidenceWords = tokens(`${item.title} ${evidenceText(item.summary)}`);
    return Object.freeze({ item, domain: domainOf(item.sourceUrl), evidenceWords, evidenceTextLine: evidenceWords.join(" ") });
  }));
  const frequencies = new Map<string, number>();
  for (const document of documents) {
    for (const word of new Set(document.evidenceWords)) frequencies.set(word, (frequencies.get(word) ?? 0) + 1);
  }
  return Object.freeze({ documents: Object.freeze(documents), frequencies, rarityCeiling: Math.max(2, Math.ceil(documents.length * 0.04)) });
}

/** Turn one witnessed lead into a small, outlet-diverse source cut from the
 * intake Koios already owns. The lead remains first. Other beats may carry
 * corroboration because a source's syndication desk is not an event boundary.
 * This is retained-corpus recall, not Web search and not factual admission. */
export function corroboratingSourceUrlsForNomination(input: Readonly<{
  nomination: SourceDrivenNomination;
  intake: readonly BeatIntake[];
  now: string;
  maxAgeDays: number;
  limit?: number;
  index?: SourceCorroborationIndex;
}>): readonly string[] {
  const required = tokens(input.nomination.term);
  const supportFloor = Math.max(2, Math.ceil(required.length * 0.6));
  const requiredBigrams = required.slice(0, -1).map((word, index) => `${word} ${required[index + 1]}`);
  const requiredProperPairs = properNamePairs(input.nomination.title);
  const ceiling = Date.parse(input.now);
  const primaryDomain = domainOf(input.nomination.url);
  const index = input.index ?? buildSourceCorroborationIndex(input.intake);
  const rareRequired = required.filter((word) => (index.frequencies.get(word) ?? 0) <= index.rarityCeiling);
  const candidates = index.documents.flatMap(({ item, domain, evidenceWords, evidenceTextLine }) => {
    if (item.sourceUrl === undefined || item.sourceUrl === input.nomination.url) return [];
    if (domain === undefined || domain === primaryDomain) return [];
    if (item.sourcePublished === undefined || !Number.isFinite(ceiling)) return [];
    const published = Date.parse(item.sourcePublished);
    const ageDays = (ceiling - published) / 86_400_000;
    if (!Number.isFinite(published) || ageDays < -1 || ageDays > input.maxAgeDays) return [];
    if (!isReportableSourceNomination(item.title, item.summary) || evidenceText(item.summary).length < 300) return [];
    const evidence = new Set(evidenceWords);
    const support = required.filter((word) => evidence.has(word)).length;
    const rareSupport = rareRequired.filter((word) => evidence.has(word)).length;
    const bigramSupport = requiredBigrams.filter((pair) => evidenceTextLine.includes(pair)).length;
    const properPairSupport = requiredProperPairs.filter((pair) => evidenceTextLine.includes(pair)).length;
    if (support < supportFloor) return [];
    if (rareRequired.length >= 2 && rareSupport < 2) return [];
    if (rareRequired.length === 1 && rareSupport < 1) return [];
    if (rareRequired.length === 0 && support < Math.ceil(required.length * 0.75)) return [];
    if (bigramSupport < 2 && properPairSupport < 1) return [];
    return [Object.freeze({ url: item.sourceUrl, domain, support, rareSupport, phraseSupport: bigramSupport + properPairSupport, published: item.sourcePublished })];
  });
  const selectedDomains = new Set(primaryDomain === undefined ? [] : [primaryDomain]);
  const selected = [input.nomination.url];
  for (const candidate of candidates.sort((left, right) => right.phraseSupport - left.phraseSupport || right.rareSupport - left.rareSupport || right.support - left.support || right.published.localeCompare(left.published) || left.url.localeCompare(right.url))) {
    if (selectedDomains.has(candidate.domain)) continue;
    selectedDomains.add(candidate.domain);
    selected.push(candidate.url);
    if (selected.length >= (input.limit ?? 3)) break;
  }
  return Object.freeze(selected);
}

/** A WireItem as the structural source-story shape termSupportCount expects. */
function asStory(item: WireItem): Readonly<{ title: string; url: string; summary?: string }> {
  return Object.freeze({
    title: item.title,
    url: item.sourceUrl ?? "",
    ...(item.summary === undefined ? {} : { summary: item.summary }),
  });
}

// ---------- coverage: what the corpus already names ----------

/** Every term a published post lays claim to: its seo_term, keywords, tags,
 * normalized for matching. Drafts do not count as coverage. */
function corpusCoverage(contentDir: string): Readonly<{ covered: Map<string, number>; postCount: number; referenceDomains: Map<string, Set<string>> }> {
  const covered = new Map<string, number>();
  const referenceDomains = new Map<string, Set<string>>();
  let postCount = 0;
  for (const post of loadPosts(contentDir)) {
    const fm = post.document.frontMatter;
    if (fm["draft"] === true || fm["draft"] === "true") continue;
    postCount += 1;
    const koios = (fm["koios"] ?? {}) as Record<string, unknown>;
    const claimed = [
      typeof koios["seo_term"] === "string" ? koios["seo_term"] : undefined,
      ...(Array.isArray(fm["keywords"]) ? (fm["keywords"] as unknown[]).map(String) : []),
      ...(Array.isArray(fm["tags"]) ? (fm["tags"] as unknown[]).map(String) : []),
    ].filter((value): value is string => typeof value === "string" && value !== "");
    for (const term of new Set(claimed.map(normalizeTerm))) {
      covered.set(term, (covered.get(term) ?? 0) + 1);
    }
    const references = Array.isArray(fm["references"]) ? (fm["references"] as Record<string, unknown>[]) : [];
    for (const reference of references) {
      const domain = domainOf(typeof reference["URL"] === "string" ? reference["URL"] : undefined);
      if (domain === undefined) continue;
      const slugs = referenceDomains.get(domain) ?? new Set<string>();
      slugs.add(post.slug);
      referenceDomains.set(domain, slugs);
    }
  }
  return Object.freeze({ covered, postCount, referenceDomains });
}

// ---------- the three discovery folds ----------

function coverageGaps(
  beats: readonly BeatIntake[],
  covered: Map<string, number>,
  genericWords: ReadonlySet<string>,
): readonly CoverageGap[] {
  const gaps = SEED_KEYWORDS.flatMap((seed): CoverageGap[] => {
    const beat = beats.find((entry) => entry.beat === seed.beat);
    if (beat === undefined) return [];
    const stories = beat.items.map(asStory);
    const support = termSupportCount(seed.term, stories, genericWords);
    if (support < 3) return [];
    const coverage = covered.get(normalizeTerm(seed.term)) ?? 0;
    const distinctive = new Set(normalizeTerm(seed.term).split(" ").filter((word) => !genericWords.has(word) && word.length >= 3));
    const evidence = beat.items
      .filter((item) => {
        const hay = normalizeTerm(`${item.title} ${item.summary ?? ""}`);
        return [...distinctive].every((word) => hay.includes(word));
      })
      .slice(0, 2)
      .map((item) => item.title);
    return [contentCoverageGap({
      term: seed.term,
      beat: seed.beat,
      priority: seed.priority ?? 0,
      intakeSupport: support,
      coverage,
      gapScore: Math.round((support / (coverage + 1)) * 100) / 100,
      evidence,
    })];
  });
  return Object.freeze(gaps.sort((a, b) => b.gapScore - a.gapScore || b.intakeSupport - a.intakeSupport));
}

function candidateKeywords(
  beats: readonly BeatIntake[],
  covered: Map<string, number>,
  genericWords: ReadonlySet<string>,
  perBeat: number,
): readonly CandidateKeyword[] {
  const seedNormals = SEED_KEYWORDS.map((seed) => normalizeTerm(seed.term));
  const out: CandidateKeyword[] = [];
  for (const beat of beats) {
    type Tally = { df: number; domains: Set<string>; examples: string[] };
    const phrases = new Map<string, Tally>();
    for (const item of beat.items) {
      const domain = domainOf(item.sourceUrl) ?? beat.beat;
      const words = tokens(`${item.title} ${item.summary ?? ""}`);
      const seen = new Set<string>();
      for (let n = 2; n <= 3; n += 1) {
        for (let i = 0; i + n <= words.length; i += 1) {
          const phrase = words.slice(i, i + n).join(" ");
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
    const candidates = [...phrases.entries()]
      .filter(([phrase, tally]) => {
        if (tally.df < 3 || tally.domains.size < 2) return false;
        if (covered.has(phrase)) return false;
        // Skip phrases already named by, or contained in, a seed term.
        if (seedNormals.some((seed) => seed.includes(phrase) || phrase.includes(seed))) return false;
        return true;
      })
      .map(([phrase, tally]): CandidateKeyword => candidateContentKeyword({
        phrase,
        beat: beat.beat,
        documentFrequency: tally.df,
        sourceBreadth: tally.domains.size,
        score: Math.round(tally.df * Math.sqrt(tally.domains.size) * 100) / 100,
        evidence: tally.examples.slice(),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, perBeat);
    out.push(...candidates);
  }
  return Object.freeze(out.sort((a, b) => b.score - a.score));
}

function candidateSources(
  referenceDomains: Map<string, Set<string>>,
  configuredDomains: ReadonlySet<string>,
): readonly CandidateSource[] {
  const out: CandidateSource[] = [];
  for (const [domain, slugs] of referenceDomains) {
    if (configuredDomains.has(domain)) continue;
    if (slugs.size < 2) continue;
    out.push(candidateContentSource({
      domain,
      citationCount: slugs.size,
      citingSlugs: [...slugs].sort(),
      note: `Cited by ${slugs.size} published articles but absent from the configured wire. Consider adding a feed so this evidence enters intake instead of only appearing post-hoc in bibliographies.`,
    }));
  }
  return Object.freeze(out.sort((a, b) => b.citationCount - a.citationCount));
}

/** The configured wire source domains — what the cable already listens to. */
function configuredSourceDomains(configPath: string): ReadonlySet<string> {
  const document = JSON.parse(readFileSync(configPath, "utf8")) as { newscable?: { wires?: readonly { sources?: readonly { url?: unknown }[] }[] } };
  const domains = new Set<string>();
  for (const wire of document.newscable?.wires ?? []) {
    for (const source of wire.sources ?? []) {
      const domain = domainOf(typeof source.url === "string" ? source.url : undefined);
      if (domain !== undefined) domains.add(domain);
    }
  }
  return domains;
}

// ---------- the reading ----------

export type KeywordDiscoveryOptions = Readonly<{
  configPath?: string;
  contentDir?: string;
  now?: () => string;
  /** How many candidate keywords to surface per beat (default 6). */
  perBeatKeywords?: number;
  /** A resolved trends probe, folded into the reading when supplied. */
  trends?: TrendProbeResult;
}>;

export async function keywordDiscoveryReading(options: KeywordDiscoveryOptions = {}): Promise<KeywordDiscoveryReading> {
  const configPath = options.configPath ?? DEFAULT_CONTENT_PRODUCTION_CONFIG;
  const property = koiosFarmProperty(configPath);
  const contentDir = options.contentDir ?? property.contentDir;
  const genericWords = new Set(property.genericTermWords ?? []);
  const beats = await readBeatIntake(configPath);
  const { covered, postCount, referenceDomains } = corpusCoverage(contentDir);
  const gaps = coverageGaps(beats, covered, genericWords);
  const keywords = candidateKeywords(beats, covered, genericWords, options.perBeatKeywords ?? 6);
  const sources = candidateSources(referenceDomains, configuredSourceDomains(configPath));
  const trends = foldTrends(options.trends, covered, genericWords);
  return contentDiscoveryReading({
    property: property.name,
    generatedAt: (options.now ?? (() => new Date().toISOString()))(),
    configPath,
    contentDir,
    intakeItemCount: beats.reduce((sum, beat) => sum + beat.items.length, 0),
    publishedPostCount: postCount,
    coverageGaps: [...gaps],
    candidateKeywords: [...keywords],
    candidateSources: [...sources],
    trends,
    constraints: [
      "Discovery proposes coverage; it never writes the seed list, the wire config, or any manuscript.",
      "Intake support and candidate keywords are read from owned wire stores; they are demand signals, not facts to publish.",
      "Coverage counts published posts only; drafts and rejected candidates are not coverage.",
      "Trends are an external attention signal folded as obstruction-or-value; an unreachable probe is a recorded obstruction, not a failure.",
    ],
  });
}

// ---------- the Google Trends probe (obstruction-as-value) ----------

export type TrendProbeItem = Readonly<{ term: string; traffic?: string }>;

export type TrendProbeResult =
  | Readonly<{ ok: true; source: string; items: readonly TrendProbeItem[] }>
  | Readonly<{ ok: false; source: string; obstruction: string }>;

type FetchLike = (url: string) => Promise<{ ok: boolean; status: number; text(): Promise<string> }>;

/** Probe the keyless public Google Trends daily-trends RSS feed. Returns the
 * trending search terms, or an obstruction value when the feed is unreachable
 * or unparsable — never throws. This is the wider web's attention, folded in
 * the same obstruction-respecting way the Search Console 403 already is. */
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
    const items: TrendProbeItem[] = [];
    for (const block of xml.split(/<item>/).slice(1)) {
      const title = /<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/s.exec(block)?.[1]?.trim();
      const traffic = /<ht:approx_traffic>(.*?)<\/ht:approx_traffic>/s.exec(block)?.[1]?.trim();
      if (title) items.push(Object.freeze({ term: title, ...(traffic ? { traffic } : {}) }));
    }
    if (items.length === 0) return Object.freeze({ ok: false as const, source, obstruction: `no trend items parsed from ${url}` });
    return Object.freeze({ ok: true as const, source, items: Object.freeze(items) });
  } catch (error) {
    return Object.freeze({ ok: false as const, source, obstruction: error instanceof Error ? error.message : String(error) });
  }
}

export function foldTrends(
  probe: TrendProbeResult | undefined,
  covered: Map<string, number>,
  genericWords: ReadonlySet<string>,
): TrendsReading {
  if (probe === undefined) return contentTrendsReading({ probed: false, novel: [], reinforcing: [] });
  if (!probe.ok) return contentTrendsReading({ probed: true, source: probe.source, obstruction: probe.obstruction, novel: [], reinforcing: [] });
  // Match trends against the beats' SEED vocabulary only to suggest a desk.
  // General-interest trends remain visible even when no current desk or source
  // contract can serve them: that mismatch is precisely the product signal the
  // newsroom previously erased.
  const beatVocabulary = new Map<string, Set<string>>();
  for (const seed of SEED_KEYWORDS) {
    const words = beatVocabulary.get(seed.beat) ?? new Set<string>();
    for (const word of normalizeTerm(seed.term).split(" ")) {
      if (word.length >= 4 && !genericWords.has(word)) words.add(word);
    }
    beatVocabulary.set(seed.beat, words);
  }
  const novel: TrendSignal[] = [];
  const reinforcing: TrendSignal[] = [];
  for (const item of probe.items) {
    const normal = normalizeTerm(item.term);
    const trendWords = new Set(normal.split(" ").filter((word) => word.length >= 4 && !genericWords.has(word)));
    const alreadyCovered = covered.has(normal) || [...covered.keys()].some((term) => term.includes(normal) || normal.includes(term));
    const beat = [...beatVocabulary.entries()]
      .find(([, vocabulary]) => [...trendWords].some((word) => vocabulary.has(word)))?.[0];
    const signal: TrendSignal = {
      term: item.term,
      ...(item.traffic === undefined ? {} : { traffic: item.traffic }),
      alreadyCovered,
      ...(beat === undefined ? {} : { beat }),
    };
    if (alreadyCovered) reinforcing.push(signal);
    else novel.push(signal);
  }
  return contentTrendsReading({ probed: true, source: probe.source, novel, reinforcing });
}
