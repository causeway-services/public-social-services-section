// Audience/product planning for Koios.News.
//
// This module is deliberately downstream of factual warrant. It may allocate
// scarce newsroom attention among candidates whose source packets have already
// passed, and it may expose demand for which the publication lacks source
// custody. It can never turn traffic, trends, or revenue into evidence.
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
]);
/** Products and reporting desks are different axes, but a genuinely distinct
 * desk must not be serialized under an inherited ideological intake label. */
export function operatingBeatForProduct(productClass, inheritedBeat) {
    return productClass === "sports" ? "sports" : inheritedBeat;
}
function record(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value) ? value : Object.freeze({});
}
function finite(value) { const number = Number(value); return Number.isFinite(number) ? number : 0; }
const WORDS = Object.freeze({
    service: /\b(?:benefit|deadline|forecast|guide|how|price|recall|refund|schedule|tax|weather|when|where|who qualifies|what to know)\b/iu,
    entertainment: /\b(?:actor|actress|album|box office|cast|celebrity|concert|dating|divorce|emmy|film|grammy|movie|music|netflix|oscar|singer|streaming|television|trailer|wedding)\b/iu,
    politics: /\b(?:administration|campaign|congress|court|election|government|law|minister|parliament|policy|president|senate|statehouse|vote)\b/iu,
    business: /\b(?:bank|business|company|consumer|economy|finance|inflation|jobs|market|mortgage|prices|retail|stock|trade)\b/iu,
    technology: /\b(?:ai|artificial intelligence|computer|cyber|internet|research|robot|science|software|space|technology)\b/iu,
    sports: /\b(?:baseball|basketball|championship|coach|fifa|football|game|league|match|nba|nfl|nhl|olympic|player|soccer|sport|team|tournament|world cup)\b/iu,
    investigation: /\b(?:audit|documents|exclusive|investigation|leak|records show|whistleblower)\b/iu,
});
const GLUE = new Set(["a", "an", "and", "as", "at", "by", "for", "from", "in", "into", "of", "on", "or", "the", "to", "with"]);
function textTokens(value) {
    return new Set(value.toLowerCase().split(/[^a-z0-9]+/u).filter((word) => word.length >= 3 && !GLUE.has(word)));
}
function similarity(left, right) {
    const a = textTokens(left);
    const b = textTokens(right);
    if (a.size === 0 || b.size === 0)
        return 0;
    const intersection = [...a].filter((word) => b.has(word)).length;
    return Math.round((intersection / new Set([...a, ...b]).size) * 1000) / 1000;
}
/** Classify a product opportunity independently of the desk that reports it. */
const ENTERTAINMENT_NEWS_SOURCE = /(?:^|\.)((?:variety|hollywoodreporter|deadline|rollingstone)\.com)$/iu;
const INVESTIGATIVE_NEWS_SOURCE = /(?:^|\.)bellingcat\.com$/iu;
function entertainmentSource(urls) {
    return (urls ?? []).some((value) => {
        try {
            const url = new URL(value);
            return ENTERTAINMENT_NEWS_SOURCE.test(url.hostname)
                || /(?:^|\.)theguardian\.com$/iu.test(url.hostname) && /^\/(?:film|music|tv-and-radio|stage|culture)\//u.test(url.pathname);
        }
        catch {
            return false;
        }
    });
}
function investigativeSource(urls) {
    return (urls ?? []).some((value) => {
        try {
            return INVESTIGATIVE_NEWS_SOURCE.test(new URL(value).hostname);
        }
        catch {
            return false;
        }
    });
}
function independentSourceDomainCount(urls) {
    const domains = new Set();
    for (const value of urls) {
        try {
            domains.add(new URL(value).hostname.toLowerCase().replace(/^www\./u, ""));
        }
        catch { /* malformed URLs contribute no source-depth value */ }
    }
    return domains.size;
}
function sportsSource(urls) {
    return (urls ?? []).some((value) => {
        try {
            const url = new URL(value);
            return /(?:^|\.)(?:espn|skysports)\.com$/iu.test(url.hostname)
                || /(?:^|\.)theguardian\.com$/iu.test(url.hostname) && /^\/(?:football|sport)\//u.test(url.pathname);
        }
        catch {
            return false;
        }
    });
}
export function productClassFor(input) {
    const text = `${input.title ?? ""} ${input.term}`.trim();
    if (WORDS.investigation.test(text) || investigativeSource(input.sourceUrls))
        return "investigations";
    if (WORDS.service.test(text))
        return "service-utility";
    if (WORDS.entertainment.test(text) || entertainmentSource(input.sourceUrls))
        return "entertainment-celebrity";
    if (WORDS.sports.test(text) || sportsSource(input.sourceUrls))
        return "sports";
    const beat = (input.beat ?? "").toLowerCase();
    if (["politics", "war", "decolonization"].includes(beat) || WORDS.politics.test(text))
        return "politics-power";
    if (["economy", "degrowth"].includes(beat) || WORDS.business.test(text))
        return "business-consumer";
    if (beat === "technology" || WORDS.technology.test(text))
        return "technology-science";
    if (beat === "environment")
        return "environment";
    return "culture";
}
function publishedReading(post) {
    const fm = post.document.frontMatter;
    const koios = fm["koios"];
    const local = koios !== null && typeof koios === "object" && !Array.isArray(koios) ? koios : {};
    const categories = fm["categories"];
    const beat = String(local["beat"] ?? (Array.isArray(categories) ? categories[0] : categories) ?? "");
    const title = String(fm["title"] ?? "");
    const term = String(local["seo_term"] ?? "");
    const references = Array.isArray(fm["references"]) ? fm["references"] : [];
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
export function productPerformanceReading(input) {
    const products = new Map(input.posts.map((post) => [post.slug, publishedReading(post).productClass]));
    const observed = new Map();
    const cells = new Map();
    for (const productClass of PRODUCT_CLASSES)
        cells.set(productClass, { publishedArticles: [...products.values()].filter((value) => value === productClass).length, observedLoads: 0, attributedRevenueMicros: 0, attributedCostMicros: 0 });
    for (const entry of input.attention ?? []) {
        const data = record(entry["data"]);
        const slug = String(data["slug"] ?? entry["subject"] ?? "").replace(/^\/posts\//u, "");
        const productClass = products.get(slug);
        if (productClass === undefined)
            continue;
        const cell = cells.get(productClass);
        cell.observedLoads += Math.max(0, finite(data["observedLoads"]));
        const slugs = observed.get(productClass) ?? new Set();
        slugs.add(slug);
        observed.set(productClass, slugs);
    }
    const latestEconomicSnapshot = new Map();
    for (const entry of input.revenueCost ?? []) {
        if (entry["act"] !== "publication.economics.observed")
            continue;
        const data = record(entry["data"]);
        const slug = String(data["slug"] ?? "").replace(/^\/posts\//u, "");
        if (!products.has(slug))
            continue;
        const prior = latestEconomicSnapshot.get(slug);
        if (prior === undefined || String(entry["recordedAt"] ?? "") >= String(prior["recordedAt"] ?? ""))
            latestEconomicSnapshot.set(slug, entry);
    }
    for (const entry of input.revenueCost ?? []) {
        const data = record(entry["data"]);
        const slug = String(data["slug"] ?? "").replace(/^\/posts\//u, "");
        if (entry["act"] === "publication.economics.observed" || latestEconomicSnapshot.has(slug))
            continue;
        const productClass = products.get(slug);
        if (productClass === undefined)
            continue;
        const cell = cells.get(productClass);
        cell.attributedRevenueMicros += Math.max(0, finite(data["revenueMicros"]));
        cell.attributedCostMicros += Math.max(0, finite(data["costMicros"]));
    }
    for (const entry of latestEconomicSnapshot.values()) {
        const data = record(entry["data"]);
        const slug = String(data["slug"] ?? "").replace(/^\/posts\//u, "");
        const productClass = products.get(slug);
        if (productClass === undefined)
            continue;
        const cell = cells.get(productClass);
        cell.attributedRevenueMicros += Math.max(0, finite(data["revenueMicros"]));
        cell.attributedCostMicros += Math.max(0, finite(data["costMicros"]));
    }
    return Object.freeze(Object.fromEntries(PRODUCT_CLASSES.map((productClass) => {
        const cell = cells.get(productClass);
        return [productClass, Object.freeze({ ...cell, observedArticles: observed.get(productClass)?.size ?? 0 })];
    })));
}
/** Rank only already-warranted candidates and record demand that remains
 * unserved because no warranted candidate exists. */
export function planAudienceProducts(input) {
    const ceiling = Date.parse(input.now);
    const floor = ceiling - (input.windowDays ?? 14) * 86_400_000;
    const recent = input.posts.map(publishedReading).filter((post) => !post.draft && Number.isFinite(post.date) && post.date >= floor && post.date <= ceiling);
    const counts = Object.fromEntries(PRODUCT_CLASSES.map((name) => [name, recent.filter((post) => post.productClass === name).length]));
    const performance = input.performance ?? productPerformanceReading({ posts: input.posts });
    const trends = input.trends ?? [];
    const ranked = input.candidates.map((candidate, candidateIndex) => {
        const productClass = productClassFor({ term: candidate.term, beat: candidate.beat, sourceUrls: candidate.sourceUrls, ...(candidate.title === undefined ? {} : { title: candidate.title }) });
        const nearest = recent.map((post) => ({ post, similarity: similarity(`${candidate.title ?? ""} ${candidate.term}`, post.text) }))
            .sort((left, right) => right.similarity - left.similarity || left.post.slug.localeCompare(right.post.slug))[0];
        const matchingTrends = trends.filter((trend) => similarity(candidate.term, trend.term) >= 0.34);
        const recentProductCount = counts[productClass] ?? 0;
        const duplication = nearest?.similarity ?? 0;
        const scarcity = Math.max(0, 3 - recentProductCount) * 40;
        const audience = candidate.evidence.views + candidate.evidence.clicks * 4 + candidate.evidence.impressions * 0.02 + matchingTrends.length * 25;
        const independentDomains = independentSourceDomainCount(candidate.sourceUrls);
        const sourceDepth = Math.min(4, independentDomains) * 4;
        const performanceCell = performance[productClass];
        const loadsPerObservedArticle = performanceCell === undefined || performanceCell.observedArticles === 0 ? 0 : performanceCell.observedLoads / performanceCell.observedArticles;
        const performanceReward = performanceCell === undefined || performanceCell.observedArticles === 0
            ? 0
            : Math.min(60, Math.log2(1 + loadsPerObservedArticle) * 8)
                + Math.max(-20, Math.min(20, (performanceCell.attributedRevenueMicros - performanceCell.attributedCostMicros) / 100_000));
        const duplicatePenalty = duplication >= 0.55 ? 240 : duplication >= 0.38 ? 70 : 0;
        const score = Math.round((scarcity + Math.min(30, candidate.priority) + audience + sourceDepth + performanceReward - duplicatePenalty - (candidate.evidence.covered ? 20 : 0)) * 100) / 100;
        const reasons = [
            `${productClass} has ${recentProductCount} published item(s) in the planning window`,
            matchingTrends.length > 0 ? `matches ${matchingTrends.length} external attention signal(s)` : "no matching external trend signal",
            duplication >= 0.55 ? `near-duplicate of ${nearest?.post.slug ?? "recent work"}` : `nearest recent-work overlap ${duplication}`,
            `${candidate.sourceUrls.length} source URL(s) across ${independentDomains} independent domain(s)`,
            performanceCell === undefined || performanceCell.observedArticles === 0
                ? "no product-class audience outcome observed yet"
                : `${Math.round(loadsPerObservedArticle * 100) / 100} observed load(s) per measured ${productClass} article`,
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
            }) });
    }).sort((left, right) => right.reading.allocationScore - left.reading.allocationScore || left.candidateIndex - right.candidateIndex);
    const unservedDemand = trends.filter((trend) => !input.candidates.some((candidate) => similarity(candidate.term, trend.term) >= 0.34)).map((trend) => Object.freeze({
        term: trend.term,
        ...(trend.traffic === undefined ? {} : { traffic: trend.traffic }),
        productClass: productClassFor({ term: trend.term, ...(trend.beat === undefined ? {} : { beat: trend.beat }) }),
        reason: "no-warranted-candidate",
        requiredMove: "expand-source-custody",
    }));
    const reading = Object.freeze({
        kind: "koios.audience-product-reading",
        version: 1,
        generatedAt: input.now,
        law: Object.freeze([
            "audience demand and commercial performance allocate attention but never supply factual warrant",
            "a trend without a warranted candidate becomes a source-custody demand, not an assignment",
            "recent product scarcity is rewarded and near-duplicate saturation is penalized",
        ]),
        recentProductCounts: Object.freeze(counts),
        productPerformance: Object.freeze(performance),
        rankedCandidates: Object.freeze(ranked.map((entry) => entry.reading)),
        unservedDemand: Object.freeze(unservedDemand),
    });
    return Object.freeze({ candidates: Object.freeze(ranked.map((entry) => entry.candidate)), reading });
}
//# sourceMappingURL=audience-product-planning.mjs.map