// Audience/product planning for Koios.News.
//
// This module allocates scarce newsroom attention between source-owned story
// candidates and source-acquisition opportunities. The latter are procurement
// plans, never assignments: traffic, trends, and revenue may buy attention but
// can never become factual evidence.

import type { KoiosPost } from "../content.mjs";

export const PRODUCT_CLASSES = Object.freeze([
  "service-utility",
  "entertainment-celebrity",
  "politics-power",
  "business-consumer",
  "technology-science",
  "culture",
  "environment",
  "sports",
  "investigations",
] as const);

export type ProductClass = (typeof PRODUCT_CLASSES)[number];

export type ProductBand = "reach" | "core" | "depth";
export type WriterTier = "free-groq" | "free-gemini" | "free-nim" | "leader-claude";

export type ProductResourceEnvelope = Readonly<{
  band: ProductBand;
  costClass: "free-writing" | "free-first-analysis" | "depth-capacity";
  admissibleWriterTiers: readonly WriterTier[];
  maximumDraftRepairs: number;
  editorialModel: "claude-sonnet-4-6";
  independentSourceFloor: number;
}>;

function writerTiers(...tiers: WriterTier[]): readonly WriterTier[] { return Object.freeze(tiers); }

const PRODUCT_RESOURCE_ENVELOPES: Readonly<Record<ProductClass, ProductResourceEnvelope>> = Object.freeze({
  "service-utility": Object.freeze({ band: "reach", costClass: "free-writing", admissibleWriterTiers: writerTiers("free-groq", "free-gemini", "free-nim"), maximumDraftRepairs: 1, editorialModel: "claude-sonnet-4-6", independentSourceFloor: 1 }),
  "entertainment-celebrity": Object.freeze({ band: "reach", costClass: "free-writing", admissibleWriterTiers: writerTiers("free-groq", "free-gemini", "free-nim"), maximumDraftRepairs: 1, editorialModel: "claude-sonnet-4-6", independentSourceFloor: 2 }),
  culture: Object.freeze({ band: "reach", costClass: "free-writing", admissibleWriterTiers: writerTiers("free-groq", "free-gemini", "free-nim"), maximumDraftRepairs: 1, editorialModel: "claude-sonnet-4-6", independentSourceFloor: 2 }),
  sports: Object.freeze({ band: "reach", costClass: "free-writing", admissibleWriterTiers: writerTiers("free-groq", "free-gemini", "free-nim"), maximumDraftRepairs: 1, editorialModel: "claude-sonnet-4-6", independentSourceFloor: 2 }),
  "politics-power": Object.freeze({ band: "core", costClass: "free-first-analysis", admissibleWriterTiers: writerTiers("free-groq", "free-gemini", "free-nim", "leader-claude"), maximumDraftRepairs: 2, editorialModel: "claude-sonnet-4-6", independentSourceFloor: 2 }),
  "business-consumer": Object.freeze({ band: "core", costClass: "free-first-analysis", admissibleWriterTiers: writerTiers("free-groq", "free-gemini", "free-nim", "leader-claude"), maximumDraftRepairs: 2, editorialModel: "claude-sonnet-4-6", independentSourceFloor: 2 }),
  "technology-science": Object.freeze({ band: "core", costClass: "free-first-analysis", admissibleWriterTiers: writerTiers("free-groq", "free-gemini", "free-nim", "leader-claude"), maximumDraftRepairs: 2, editorialModel: "claude-sonnet-4-6", independentSourceFloor: 2 }),
  environment: Object.freeze({ band: "core", costClass: "free-first-analysis", admissibleWriterTiers: writerTiers("free-groq", "free-gemini", "free-nim", "leader-claude"), maximumDraftRepairs: 2, editorialModel: "claude-sonnet-4-6", independentSourceFloor: 2 }),
  investigations: Object.freeze({ band: "depth", costClass: "depth-capacity", admissibleWriterTiers: writerTiers("free-gemini", "free-nim", "leader-claude"), maximumDraftRepairs: 3, editorialModel: "claude-sonnet-4-6", independentSourceFloor: 3 }),
});

export function resourceEnvelopeForProduct(productClass: ProductClass): ProductResourceEnvelope {
  return PRODUCT_RESOURCE_ENVELOPES[productClass];
}

export function portfolioBandForProduct(productClass: ProductClass): ProductBand {
  return resourceEnvelopeForProduct(productClass).band;
}

/** Products and reporting desks are different axes, but a genuinely distinct
 * desk must not be serialized under an inherited ideological intake label. */
export function operatingBeatForProduct(productClass: ProductClass, inheritedBeat: string): string {
  return productClass === "sports" ? "sports" : inheritedBeat;
}

export type ProductPlanningCandidate = Readonly<{
  term: string;
  beat: string;
  priority: number;
  sourceUrls: readonly string[];
  evidence: Readonly<{ views: number; impressions: number; clicks: number; covered: boolean }>;
  sourceStatus?: "owned-source-candidate" | "source-discovery-required";
  title?: string;
}>;

export type AudienceTrend = Readonly<{
  term: string;
  traffic?: string;
  alreadyCovered: boolean;
  beat?: string;
}>;

export type ProductCandidateReading = Readonly<{
  candidateIndex: number;
  term: string;
  beat: string;
  productClass: ProductClass;
  recentProductCount: number;
  nearestPublishedSlug?: string;
  duplication: number;
  trendMatches: readonly string[];
  allocationScore: number;
  reasons: readonly string[];
  sourceStatus: "owned-source-candidate" | "source-discovery-required";
}>;

export type AudienceProductReading = Readonly<{
  kind: "koios.audience-product-reading";
  version: 3;
  generatedAt: string;
  law: readonly string[];
  recentProductCounts: Readonly<Record<string, number>>;
  productPerformance: Readonly<Record<string, ProductPerformanceCell>>;
  rankedCandidates: readonly ProductCandidateReading[];
  portfolio: PublicationPortfolioReading;
  unservedDemand: readonly Readonly<{
    term: string;
    traffic?: string;
    productClass: ProductClass;
    reason: "no-warranted-candidate";
    requiredMove: "expand-source-custody";
  }>[];
}>;

export type PublicationPortfolioSlot = Readonly<{
  position: number;
  intendedBand: ProductBand;
  disposition: "candidate" | "procurement" | "unfilled";
  candidateIndex?: number;
  term?: string;
  productClass?: ProductClass;
  actualBand?: ProductBand;
  resourceEnvelope?: ProductResourceEnvelope;
}>;

export type PublicationPortfolioReading = Readonly<{
  kind: "koios.publication-portfolio";
  version: 1;
  horizon: Readonly<{
    dailyHours: 24;
    weeklyHours: 168;
    dailySlots: 4;
    dailyReachTarget: 2;
    dailyCoreFloor: 1;
    dailyCoreOrDepthTarget: 2;
    weeklyDepthTarget: 1;
  }>;
  observed: Readonly<{ dailyReach: number; dailyCore: number; weeklyDepth: number }>;
  nextRequiredBand: ProductBand | "flex";
  slots: readonly PublicationPortfolioSlot[];
  unmet: readonly string[];
  law: readonly string[];
}>;

export type ProductPerformanceCell = Readonly<{
  publishedArticles: number;
  observedArticles: number;
  observedLoads: number;
  attributedRevenueMicros: number;
  attributedCostMicros: number;
  unpublishedArticles: number;
  unpublishedInferenceCalls: number;
  unpublishedEditorialCalls: number;
  unpublishedEstimatedCostMicros: number;
}>;

type LedgerRecord = Readonly<Record<string, unknown>>;
function record(value: unknown): Readonly<Record<string, unknown>> {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Readonly<Record<string, unknown>> : Object.freeze({});
}
function finite(value: unknown): number { const number = Number(value); return Number.isFinite(number) ? number : 0; }
function estimatedModelCostMicros(value: unknown): number {
  return Object.values(record(value)).reduce<number>((sum, model) => sum + Math.max(0, finite(record(model)["costUSD"])) * 1_000_000, 0);
}

const WORDS = Object.freeze({
  service: /\b(?:benefits?|deadline|consumer guide|how to|price|product recall|refund|tax filing|weather forecast|what to know|when (?:can|does|is|will)|where (?:can|is|to)|who qualifies)\b/iu,
  entertainment: /\b(?:actor|actress|album|box office|cast|celebrity|concert|dating|divorce|earrings|emmy|fashion|film|grammy|jewel(?:ry|lery)|movie|music|netflix|oscar|red[- ]carpet|singer|streaming|style|television|trailer|wedding)\b/iu,
  politics: /\b(?:administration|campaign|congress|court|election|government|law|minister|parliament|policy|president|senate|statehouse|vote)\b/iu,
  business: /\b(?:bank|business|company|consumer|economy|finance|inflation|jobs|market|mortgage|prices|retail|stock|trade)\b/iu,
  technology: /\b(?:ai|artificial intelligence|computer|cyber|internet|research|robot|science|software|space|technology)\b/iu,
  sports: /\b(?:baseball|basketball|championship|coach|fifa|football|game|league|match|nba|nfl|nhl|olympic|player|soccer|sport|team|tournament|world cup)\b/iu,
  investigation: /\b(?:audit|documents|exclusive|investigation|leak|records show|whistleblower)\b/iu,
});

const GLUE = new Set(["a", "an", "and", "as", "at", "by", "for", "from", "in", "into", "of", "on", "or", "the", "to", "with"]);
const SCHEDULE_UTILITY = /\b(?:calendar|dates?|event|flight|games?|times?|train|tv)\b.{0,28}\bschedule\b|\bschedule\b.{0,28}\b(?:calendar|dates?|event|flight|games?|times?|train|tv)\b/iu;

function textTokens(value: string): ReadonlySet<string> {
  return new Set(value.toLowerCase().split(/[^a-z0-9]+/u).filter((word) => word.length >= 3 && !GLUE.has(word)));
}

function similarity(left: string, right: string): number {
  const a = textTokens(left);
  const b = textTokens(right);
  if (a.size === 0 || b.size === 0) return 0;
  const intersection = [...a].filter((word) => b.has(word)).length;
  return Math.round((intersection / new Set([...a, ...b]).size) * 1000) / 1000;
}

/** Classify a product opportunity independently of the desk that reports it. */
const ENTERTAINMENT_NEWS_SOURCE = /(?:^|\.)((?:variety|hollywoodreporter|deadline|rollingstone)\.com)$/iu;
const INVESTIGATIVE_NEWS_SOURCE = /(?:^|\.)bellingcat\.com$/iu;

function entertainmentSource(urls: readonly string[] | undefined): boolean {
  return (urls ?? []).some((value) => {
    try {
      const url = new URL(value);
      return ENTERTAINMENT_NEWS_SOURCE.test(url.hostname)
        || /(?:^|\.)theguardian\.com$/iu.test(url.hostname) && /^\/(?:film|music|tv-and-radio|stage|culture)\//u.test(url.pathname);
    }
    catch { return false; }
  });
}

function investigativeSource(urls: readonly string[] | undefined): boolean {
  return (urls ?? []).some((value) => {
    try { return INVESTIGATIVE_NEWS_SOURCE.test(new URL(value).hostname); }
    catch { return false; }
  });
}

/** A provider-authored politics desk is product evidence even when a terse
 * headline names an officeholder without repeating words such as “president.” */
function politicsSource(urls: readonly string[] | undefined): boolean {
  return (urls ?? []).some((value) => {
    try { return /(?:^|\/)politics(?:\/|$)/iu.test(new URL(value).pathname); }
    catch { return false; }
  });
}

function independentSourceDomainCount(urls: readonly string[]): number {
  const domains = new Set<string>();
  for (const value of urls) {
    try { domains.add(new URL(value).hostname.toLowerCase().replace(/^www\./u, "")); }
    catch { /* malformed URLs contribute no source-depth value */ }
  }
  return domains.size;
}

function sportsSource(urls: readonly string[] | undefined): boolean {
  return (urls ?? []).some((value) => {
    try {
      const url = new URL(value);
      return /(?:^|\.)(?:cbssports|espn|foxsports|mlb|nba|nfl|nhl|skysports)\.com$/iu.test(url.hostname)
        || /(?:^|\.)sports\.yahoo\.com$/iu.test(url.hostname)
        || /(?:^|\.)apnews\.com$/iu.test(url.hostname) && /^\/(?:article\/)?(?:baseball|basketball|football|hockey|mlb|nba|nfl|nhl|soccer|sports)\b/u.test(url.pathname)
        || /(?:^|\.)theguardian\.com$/iu.test(url.hostname) && /^\/(?:football|sport)\//u.test(url.pathname);
    }
    catch { return false; }
  });
}

export function productClassFor(input: Readonly<{ term: string; beat?: string; title?: string; sourceUrls?: readonly string[] }>): ProductClass {
  const text = `${input.title ?? ""} ${input.term}`.trim();
  if (WORDS.investigation.test(text) || investigativeSource(input.sourceUrls)) return "investigations";
  // A sports schedule is still a sports product. "Schedule" describes the
  // useful format, not the reporting desk or audience market.
  if (WORDS.sports.test(text) || sportsSource(input.sourceUrls)) return "sports";
  // A schedule is a service product only when the wording promises a reader-
  // usable calendar or time answer. Merely changing a software release
  // cadence is technology news and therefore buys the deeper reporting floor.
  if (WORDS.service.test(text) || SCHEDULE_UTILITY.test(text)) return "service-utility";
  if (WORDS.entertainment.test(text) || entertainmentSource(input.sourceUrls)) return "entertainment-celebrity";
  const beat = (input.beat ?? "").toLowerCase();
  if (["politics", "war", "decolonization"].includes(beat) || WORDS.politics.test(text) || politicsSource(input.sourceUrls)) return "politics-power";
  if (["economy", "degrowth"].includes(beat) || WORDS.business.test(text)) return "business-consumer";
  if (beat === "technology" || WORDS.technology.test(text)) return "technology-science";
  if (beat === "environment") return "environment";
  return "culture";
}

function publishedReading(post: Pick<KoiosPost, "slug" | "document">): Readonly<{
  slug: string;
  date: number;
  draft: boolean;
  text: string;
  productClass: ProductClass;
}> {
  const fm = post.document.frontMatter;
  const koios = fm["koios"];
  const local = koios !== null && typeof koios === "object" && !Array.isArray(koios) ? koios as Record<string, unknown> : {};
  const categories = fm["categories"];
  const beat = String(local["beat"] ?? (Array.isArray(categories) ? categories[0] : categories) ?? "");
  const title = String(fm["title"] ?? "");
  const term = String(local["seo_term"] ?? "");
  const references = Array.isArray(fm["references"]) ? fm["references"] as readonly Record<string, unknown>[] : [];
  const sourceUrls = references.flatMap((reference) => typeof reference["URL"] === "string" ? [reference["URL"]] : []);
  return Object.freeze({
    slug: post.slug,
    date: Date.parse(String(fm["date"] ?? "")),
    draft: fm["draft"] === true || fm["draft"] === "true",
    text: `${title} ${term}`.trim(),
    productClass: productClassFor({ term, beat, title, sourceUrls }),
  });
}

/** Project audience and economics evidence onto product classes. A missing
 * observation is unknown, not zero performance. Records are measurements for
 * allocation only and never enter a reporting packet. */
export function productPerformanceReading(input: Readonly<{
  posts: readonly Pick<KoiosPost, "slug" | "document">[];
  attention?: readonly LedgerRecord[];
  revenueCost?: readonly LedgerRecord[];
  providerUsage?: readonly LedgerRecord[];
}>): Readonly<Record<string, ProductPerformanceCell>> {
  const articleReadings = input.posts.map(publishedReading);
  const products = new Map(articleReadings.map((article) => [article.slug, article.productClass]));
  const unpublished = new Set(articleReadings.filter((article) => article.draft).map((article) => article.slug));
  const observed = new Map<ProductClass, Set<string>>();
  const unpublishedByProduct = new Map<ProductClass, Set<string>>();
  const cells = new Map<ProductClass, { publishedArticles: number; observedLoads: number; attributedRevenueMicros: number; attributedCostMicros: number; unpublishedInferenceCalls: number; unpublishedEditorialCalls: number; unpublishedEstimatedCostMicros: number }>();
  for (const productClass of PRODUCT_CLASSES) cells.set(productClass, { publishedArticles: articleReadings.filter((article) => !article.draft && article.productClass === productClass).length, observedLoads: 0, attributedRevenueMicros: 0, attributedCostMicros: 0, unpublishedInferenceCalls: 0, unpublishedEditorialCalls: 0, unpublishedEstimatedCostMicros: 0 });
  for (const entry of input.attention ?? []) {
    const data = record(entry["data"]);
    const slug = String(data["slug"] ?? entry["subject"] ?? "").replace(/^\/posts\//u, "");
    const productClass = products.get(slug);
    if (productClass === undefined) continue;
    const cell = cells.get(productClass)!;
    cell.observedLoads += Math.max(0, finite(data["observedLoads"]));
    const slugs = observed.get(productClass) ?? new Set<string>();
    slugs.add(slug);
    observed.set(productClass, slugs);
  }
  const latestEconomicSnapshot = new Map<string, LedgerRecord>();
  for (const entry of input.revenueCost ?? []) {
    if (entry["act"] !== "publication.economics.observed") continue;
    const data = record(entry["data"]);
    const slug = String(data["slug"] ?? "").replace(/^\/posts\//u, "");
    if (!products.has(slug)) continue;
    const prior = latestEconomicSnapshot.get(slug);
    if (prior === undefined || String(entry["recordedAt"] ?? "") >= String(prior["recordedAt"] ?? "")) latestEconomicSnapshot.set(slug, entry);
  }
  for (const entry of input.revenueCost ?? []) {
    const data = record(entry["data"]);
    const slug = String(data["slug"] ?? "").replace(/^\/posts\//u, "");
    if (entry["act"] === "publication.economics.observed" || latestEconomicSnapshot.has(slug)) continue;
    const productClass = products.get(slug);
    if (productClass === undefined) continue;
    const cell = cells.get(productClass)!;
    cell.attributedRevenueMicros += Math.max(0, finite(data["revenueMicros"]));
    cell.attributedCostMicros += Math.max(0, finite(data["costMicros"]));
  }
  for (const entry of latestEconomicSnapshot.values()) {
    const data = record(entry["data"]);
    const slug = String(data["slug"] ?? "").replace(/^\/posts\//u, "");
    const productClass = products.get(slug);
    if (productClass === undefined) continue;
    const cell = cells.get(productClass)!;
    cell.attributedRevenueMicros += Math.max(0, finite(data["revenueMicros"]));
    cell.attributedCostMicros += Math.max(0, finite(data["costMicros"]));
  }
  const uniqueInference = new Map<string, LedgerRecord>();
  for (const entry of input.providerUsage ?? []) {
    if (entry["act"] !== "inference.consumed") continue;
    const data = record(entry["data"]);
    const slug = String(data["slug"] ?? "").replace(/^\/posts\//u, "");
    if (!unpublished.has(slug)) continue;
    uniqueInference.set(String(entry["subject"] ?? entry["recordDigest"] ?? `${slug}:${uniqueInference.size}`), entry);
  }
  for (const entry of uniqueInference.values()) {
    const data = record(entry["data"]);
    const slug = String(data["slug"] ?? "").replace(/^\/posts\//u, "");
    const productClass = products.get(slug);
    if (productClass === undefined) continue;
    const cell = cells.get(productClass)!;
    cell.unpublishedInferenceCalls += 1;
    if (/independently assess koios manuscript/iu.test(String(data["purpose"] ?? ""))) cell.unpublishedEditorialCalls += 1;
    cell.unpublishedEstimatedCostMicros += Math.round(estimatedModelCostMicros(data["modelUsage"]));
    const slugs = unpublishedByProduct.get(productClass) ?? new Set<string>();
    slugs.add(slug);
    unpublishedByProduct.set(productClass, slugs);
  }
  return Object.freeze(Object.fromEntries(PRODUCT_CLASSES.map((productClass) => {
    const cell = cells.get(productClass)!;
    return [productClass, Object.freeze({ ...cell, observedArticles: observed.get(productClass)?.size ?? 0, unpublishedArticles: unpublishedByProduct.get(productClass)?.size ?? 0 })];
  })));
}

/** Rank only already-warranted candidates and record demand that remains
 * unserved because no warranted candidate exists. */
export function planAudienceProducts<T extends ProductPlanningCandidate>(input: Readonly<{
  candidates: readonly T[];
  posts: readonly Pick<KoiosPost, "slug" | "document">[];
  trends?: readonly AudienceTrend[];
  performance?: Readonly<Record<string, ProductPerformanceCell>>;
  now: string;
  windowDays?: number;
}>): Readonly<{ candidates: readonly T[]; reading: AudienceProductReading }> {
  const ceiling = Date.parse(input.now);
  const floor = ceiling - (input.windowDays ?? 14) * 86_400_000;
  const published = input.posts.map(publishedReading).filter((post) => !post.draft && Number.isFinite(post.date) && post.date <= ceiling);
  const recent = published.filter((post) => post.date >= floor);
  const counts = Object.fromEntries(PRODUCT_CLASSES.map((name) => [name, recent.filter((post) => post.productClass === name).length]));
  const performance = input.performance ?? productPerformanceReading({ posts: input.posts });
  const trends = input.trends ?? [];
  const scoreRanked = input.candidates.map((candidate, candidateIndex) => {
    const productClass = productClassFor({ term: candidate.term, beat: candidate.beat, sourceUrls: candidate.sourceUrls, ...(candidate.title === undefined ? {} : { title: candidate.title }) });
    const nearest = recent.map((post) => ({ post, similarity: similarity(`${candidate.title ?? ""} ${candidate.term}`, post.text) }))
      .sort((left, right) => right.similarity - left.similarity || left.post.slug.localeCompare(right.post.slug))[0];
    const matchingTrends = trends.filter((trend) => similarity(candidate.term, trend.term) >= 0.34);
    const recentProductCount = counts[productClass] ?? 0;
    const duplication = nearest?.similarity ?? 0;
    const scarcity = Math.max(0, 3 - recentProductCount) * 40;
    const audience = candidate.evidence.views + candidate.evidence.clicks * 4 + candidate.evidence.impressions * 0.02 + matchingTrends.length * 25;
    const independentDomains = independentSourceDomainCount(candidate.sourceUrls);
    const sourceStatus = candidate.sourceStatus ?? "owned-source-candidate";
    const sourceDepth = Math.min(4, independentDomains) * 4;
    const performanceCell = performance[productClass];
    const loadsPerObservedArticle = performanceCell === undefined || performanceCell.observedArticles === 0 ? 0 : performanceCell.observedLoads / performanceCell.observedArticles;
    const performanceReward = performanceCell === undefined || performanceCell.observedArticles === 0
      ? 0
      : Math.min(60, Math.log2(1 + loadsPerObservedArticle) * 8)
        + Math.max(-20, Math.min(20, (performanceCell.attributedRevenueMicros - performanceCell.attributedCostMicros) / 100_000));
    const unpublishedProductionDrag = performanceCell === undefined ? 0 : Math.min(35,
      performanceCell.unpublishedInferenceCalls * 2
      + performanceCell.unpublishedEditorialCalls * 3
      + performanceCell.unpublishedEstimatedCostMicros / 100_000);
    const duplicatePenalty = duplication >= 0.55 ? 240 : duplication >= 0.38 ? 70 : 0;
    const procurementCost = sourceStatus === "source-discovery-required" ? 12 : 0;
    const score = Math.round((scarcity + Math.min(30, candidate.priority) + audience + sourceDepth + performanceReward - unpublishedProductionDrag - procurementCost - duplicatePenalty - (candidate.evidence.covered ? 20 : 0)) * 100) / 100;
    const reasons = [
      `${productClass} has ${recentProductCount} published item(s) in the planning window`,
      matchingTrends.length > 0 ? `matches ${matchingTrends.length} external attention signal(s)` : "no matching external trend signal",
      duplication >= 0.55 ? `near-duplicate of ${nearest?.post.slug ?? "recent work"}` : `nearest recent-work overlap ${duplication}`,
      `${candidate.sourceUrls.length} source URL(s) across ${independentDomains} independent domain(s)`,
      sourceStatus === "source-discovery-required" ? "assignment requires a separately settled source-discovery and admission purchase" : "candidate begins from Koios-owned source custody",
      performanceCell === undefined || performanceCell.observedArticles === 0
        ? "no product-class audience outcome observed yet"
        : `${Math.round(loadsPerObservedArticle * 100) / 100} observed load(s) per measured ${productClass} article`,
      performanceCell === undefined || performanceCell.unpublishedInferenceCalls === 0
        ? "no unpublished product-class inference cost observed"
        : `${performanceCell.unpublishedInferenceCalls} inference call(s), including ${performanceCell.unpublishedEditorialCalls} editorial call(s), remain invested in ${performanceCell.unpublishedArticles} unpublished ${productClass} artifact(s)`,
    ];
    return Object.freeze({ candidate, candidateIndex, reading: Object.freeze({
      candidateIndex,
      term: candidate.term,
      beat: candidate.beat,
      productClass,
      recentProductCount,
      ...(nearest === undefined ? {} : { nearestPublishedSlug: nearest.post.slug }),
      duplication,
      trendMatches: Object.freeze(matchingTrends.map((trend) => trend.term)),
      allocationScore: score,
      reasons: Object.freeze(reasons),
      sourceStatus,
    }) });
  }).sort((left, right) => right.reading.allocationScore - left.reading.allocationScore || left.candidateIndex - right.candidateIndex);
  const daily = published.filter((post) => post.date >= ceiling - 24 * 3_600_000);
  const weekly = published.filter((post) => post.date >= ceiling - 168 * 3_600_000);
  const dailyReach = daily.filter((post) => portfolioBandForProduct(post.productClass) === "reach").length;
  const dailyCore = daily.filter((post) => portfolioBandForProduct(post.productClass) === "core").length;
  const weeklyDepth = weekly.filter((post) => portfolioBandForProduct(post.productClass) === "depth").length;
  const depthDue = weeklyDepth < 1;
  const nextRequiredBand: ProductBand | "flex" = dailyReach < 2 && (dailyReach / 2) <= Math.min(1, dailyCore)
    ? "reach"
    : dailyCore < 1
      ? "core"
      : dailyReach < 2
        ? "reach"
        : depthDue
          ? "depth"
          : dailyCore < 2
            ? "core"
            : "flex";
  const ranked = nextRequiredBand === "flex"
    ? scoreRanked
    : [
      ...scoreRanked.filter((entry) => portfolioBandForProduct(entry.reading.productClass) === nextRequiredBand),
      ...scoreRanked.filter((entry) => portfolioBandForProduct(entry.reading.productClass) !== nextRequiredBand),
    ];
  const intendedBands: readonly ProductBand[] = Object.freeze(["reach", "core", "reach", depthDue ? "depth" : "core"]);
  const allocated = new Set<number>();
  const slots: PublicationPortfolioSlot[] = intendedBands.map((intendedBand, index) => {
    const selected = scoreRanked.find((entry) => !allocated.has(entry.candidateIndex) && portfolioBandForProduct(entry.reading.productClass) === intendedBand);
    if (selected === undefined) return Object.freeze({ position: index + 1, intendedBand, disposition: "unfilled" as const });
    allocated.add(selected.candidateIndex);
    return Object.freeze({
      position: index + 1,
      intendedBand,
      disposition: selected.reading.sourceStatus === "source-discovery-required" ? "procurement" as const : "candidate" as const,
      candidateIndex: selected.candidateIndex,
      term: selected.reading.term,
      productClass: selected.reading.productClass,
      actualBand: intendedBand,
      resourceEnvelope: resourceEnvelopeForProduct(selected.reading.productClass),
    });
  });
  const unmet = slots.flatMap((slot) => slot.disposition === "unfilled" ? [`no owned-source or source-procurement opportunity can fill portfolio slot ${slot.position}`] : []);
  const portfolio: PublicationPortfolioReading = Object.freeze({
    kind: "koios.publication-portfolio",
    version: 1,
    horizon: Object.freeze({ dailyHours: 24, weeklyHours: 168, dailySlots: 4, dailyReachTarget: 2, dailyCoreFloor: 1, dailyCoreOrDepthTarget: 2, weeklyDepthTarget: 1 }),
    observed: Object.freeze({ dailyReach, dailyCore, weeklyDepth }),
    nextRequiredBand,
    slots: Object.freeze(slots),
    unmet: Object.freeze(unmet),
    law: Object.freeze([
      "two daily reach products earn attention through utility, entertainment, culture, or sport without weakening warrant",
      "at least one daily core product carries consequential reporting; a source-qualified weekly depth product may replace the second core slot",
      "resource envelopes ration inference and repair effort by product economics while independent Sonnet judgment remains mandatory",
      "portfolio allocation spends no fictional internal revenue and treats only outside reader and revenue receipts as user value",
    ]),
  });
  const unservedDemand = trends.filter((trend) => !input.candidates.some((candidate) => similarity(candidate.term, trend.term) >= 0.34)).map((trend) => Object.freeze({
    term: trend.term,
    ...(trend.traffic === undefined ? {} : { traffic: trend.traffic }),
    productClass: productClassFor({ term: trend.term, ...(trend.beat === undefined ? {} : { beat: trend.beat }) }),
    reason: "no-warranted-candidate" as const,
    requiredMove: "expand-source-custody" as const,
  }));
  const reading: AudienceProductReading = Object.freeze({
    kind: "koios.audience-product-reading",
    version: 3,
    generatedAt: input.now,
    law: Object.freeze([
      "audience demand and commercial performance allocate attention but never supply factual warrant",
      "a trend without owned source custody may become a bounded source-discovery purchase; only a later admitted packet may become an assignment",
      "recent product scarcity is rewarded and near-duplicate saturation is penalized",
      "provider-estimated and capacity costs sunk into unpublished artifacts reduce otherwise comparable product allocation without becoming factual warrant",
    ]),
    recentProductCounts: Object.freeze(counts),
    productPerformance: Object.freeze(performance),
    rankedCandidates: Object.freeze(ranked.map((entry) => entry.reading)),
    portfolio,
    unservedDemand: Object.freeze(unservedDemand),
  });
  return Object.freeze({ candidates: Object.freeze(ranked.map((entry) => entry.candidate)), reading });
}
