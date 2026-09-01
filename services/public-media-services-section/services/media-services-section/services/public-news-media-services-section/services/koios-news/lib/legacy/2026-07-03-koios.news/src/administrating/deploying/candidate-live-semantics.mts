// Semantic migration comparison between the production-shaped local candidate
// and the still-authoritative VPS publication. Intentional improvements remain
// visible as classified deltas instead of being hidden by status/MIME equality.

import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const SECURITY_HEADERS = Object.freeze([
  "content-security-policy",
  "cross-origin-opener-policy",
  "cross-origin-resource-policy",
  "origin-agent-cluster",
  "permissions-policy",
  "referrer-policy",
  "strict-transport-security",
  "x-content-type-options",
  "x-dns-prefetch-control",
  "x-download-options",
  "x-frame-options",
  "x-permitted-cross-domain-policies",
] as const);

type JsonFeed = Readonly<{ items?: unknown }>;
type NinjsItem = Readonly<{ uri?: unknown }>;
type Provenance = Readonly<{ articles?: unknown }>;

export type CandidateLiveSemantics = Readonly<{
  kind: "koios.candidate-live-semantics";
  liveOrigin: string;
  liveStructuredArticleCount: number;
  candidateStructuredArticleCount: number;
  liveStructuredArticlesPreserved: boolean;
  candidateOnlyArticlesExactlyAccepted: boolean;
  editorialEvidenceCoversCandidate: boolean;
  correctionsSurfacePresent: boolean;
  advertisingProviderPreserved: boolean;
  liveAAdsUnits: readonly string[];
  candidateAAdsUnits: readonly string[];
  attentionSuspendedWithDisclosure: boolean;
  privacyAdvertisingBoundaryDeclared: boolean;
  securityHeadersPreserved: boolean;
  securityHeaderDeltas: readonly string[];
  providerManagedRobotsOverlayCompatible: boolean;
  intentionalDeltas: readonly string[];
  obstructions: readonly string[];
  settled: boolean;
}>;

function artifact(outputDir: string, relativePath: string): string {
  return readFileSync(join(outputDir, relativePath), "utf8");
}

function recordArray(value: unknown): readonly Readonly<Record<string, unknown>>[] {
  return Array.isArray(value)
    ? value.filter((item): item is Readonly<Record<string, unknown>> => item !== null && typeof item === "object" && !Array.isArray(item))
    : [];
}

function feedRoutes(value: JsonFeed, origin: string): readonly string[] {
  return Object.freeze(recordArray(value.items).flatMap((item) => {
    if (typeof item["url"] !== "string") return [];
    try {
      const url = new URL(item["url"], origin);
      return url.origin === origin && url.pathname.startsWith("/posts/") ? [url.pathname.replace(/\/$/u, "")] : [];
    } catch { return []; }
  }).sort());
}

function ninjsRoutes(value: unknown, origin: string): readonly string[] {
  return Object.freeze(recordArray(value).flatMap((item: NinjsItem) => {
    if (typeof item.uri !== "string") return [];
    try {
      const url = new URL(item.uri, origin);
      return url.origin === origin && url.pathname.startsWith("/posts/") ? [url.pathname.replace(/\/$/u, "")] : [];
    } catch { return []; }
  }).sort());
}

function aAdsUnits(html: string): readonly string[] {
  return Object.freeze([...new Set([...html.matchAll(/data-aa="([0-9]+)"/gu)].flatMap((match) => match[1] ?? []))].sort());
}

function staticHeaderMap(value: string): ReadonlyMap<string, string> {
  return new Map(value.split(/\r?\n/gu).flatMap((line) => {
    const match = /^\s+([^:]+):\s*(.+)$/u.exec(line);
    return match?.[1] !== undefined && match[2] !== undefined ? [[match[1].toLowerCase(), match[2]] as const] : [];
  }));
}

async function liveText(origin: string, route: string): Promise<Readonly<{ response: Response; text: string }>> {
  const response = await fetch(`${origin}${route}`, { headers: { accept: "*/*" } });
  const text = await response.text();
  if (!response.ok) throw new Error(`live semantic comparison ${route} returned ${response.status}`);
  return Object.freeze({ response, text });
}

export async function compareCandidateToLiveSemantics(input: Readonly<{
  candidateOutputDir: string;
  liveOrigin?: string;
}>): Promise<CandidateLiveSemantics> {
  const outputDir = resolve(input.candidateOutputDir);
  const liveOrigin = new URL(input.liveOrigin ?? "https://koios.news").origin;
  const [liveRoot, livePrivacy, liveRobots, liveFeedReading, liveNinjsReading] = await Promise.all([
    liveText(liveOrigin, "/"),
    liveText(liveOrigin, "/privacy"),
    liveText(liveOrigin, "/robots.txt"),
    liveText(liveOrigin, "/feed.json"),
    liveText(liveOrigin, "/ninjs.json"),
  ]);
  const candidateRoot = artifact(outputDir, "index.html");
  const candidatePrivacy = artifact(outputDir, join("privacy", "index.html"));
  const candidateRobots = artifact(outputDir, "robots.txt");
  const candidateFeed = JSON.parse(artifact(outputDir, "feed.json")) as JsonFeed;
  const candidateNinjs = JSON.parse(artifact(outputDir, "ninjs.json")) as unknown;
  const candidateAudit = recordArray(JSON.parse(artifact(outputDir, "newswire-audit.json")));
  const provenance = JSON.parse(artifact(outputDir, "publication-provenance.json")) as Provenance;
  const manifest = JSON.parse(artifact(outputDir, "manifest.json")) as Readonly<{ artifacts?: unknown }>;
  const manifestRoutes = new Set(recordArray(manifest.artifacts).flatMap((item) => typeof item["route"] === "string" ? [item["route"]] : []));

  const liveFeed = JSON.parse(liveFeedReading.text) as JsonFeed;
  const liveFeedRoutes = new Set(feedRoutes(liveFeed, liveOrigin));
  const candidateFeedRoutes = new Set(feedRoutes(candidateFeed, liveOrigin));
  const liveNinjsRoutes = new Set(ninjsRoutes(JSON.parse(liveNinjsReading.text) as unknown, liveOrigin));
  const candidateNinjsRoutes = new Set(ninjsRoutes(candidateNinjs, liveOrigin));
  const liveStructuredArticlesPreserved = [...liveFeedRoutes].every((route) => candidateFeedRoutes.has(route))
    && [...liveNinjsRoutes].every((route) => candidateNinjsRoutes.has(route));
  const provenanceArticles = recordArray(provenance.articles);
  const exactPaths = new Set(provenanceArticles.flatMap((item) => item["authority"] === "exact-editorial-acceptance" && typeof item["path"] === "string" ? [item["path"]] : []));
  const candidateOnly = [...candidateFeedRoutes].filter((route) => !liveFeedRoutes.has(route));
  const candidateOnlyArticlesExactlyAccepted = candidateOnly.every((route) => exactPaths.has(route));
  const auditSubjects = new Set(candidateAudit.flatMap((item) => typeof item["subject"] === "string" ? [item["subject"]] : []));
  const editorialEvidenceCoversCandidate = provenanceArticles.length === candidateFeedRoutes.size
    && [...candidateFeedRoutes].every((route) => auditSubjects.has(route.replace(/^\/posts\//u, "")));
  const correctionsSurfacePresent = manifestRoutes.has("/corrections") && manifestRoutes.has("/corrections.json");

  const liveUnits = aAdsUnits(liveRoot.text);
  const candidateUnits = aAdsUnits(candidateRoot);
  const advertisingProviderPreserved = liveRoot.text.includes("acceptable.a-ads.com")
    && candidateRoot.includes("acceptable.a-ads.com")
    && liveUnits.every((unit) => candidateUnits.includes(unit));
  const liveBeacon = liveRoot.text.includes("navigator.sendBeacon") || liveRoot.text.includes("var u='/hit");
  const candidateBeacon = candidateRoot.includes("navigator.sendBeacon") || candidateRoot.includes("var u='/hit");
  const attentionSuspendedWithDisclosure = liveBeacon && livePrivacy.text.includes("first-party view counter") && !candidateBeacon
    && candidatePrivacy.includes("does not send a first-party view beacon")
    && candidatePrivacy.includes("Accountable attention remains suspended");
  const privacyAdvertisingBoundaryDeclared = candidatePrivacy.includes("ordinary network request metadata")
    && candidatePrivacy.includes("no-referrer")
    && candidatePrivacy.includes("acceptable.a-ads.com");

  const candidateHeaders = staticHeaderMap(artifact(outputDir, "_headers"));
  const securityHeaderDeltas = Object.freeze(SECURITY_HEADERS.filter((name) => candidateHeaders.get(name) !== liveRoot.response.headers.get(name)));
  const securityHeadersPreserved = securityHeaderDeltas.length === 0;
  const providerManagedRobotsOverlayCompatible = liveRobots.text.endsWith(candidateRobots)
    && liveRobots.text.includes("Content-Signal:")
    && liveRobots.text.includes("# BEGIN Cloudflare Managed content");
  const intentionalDeltas = Object.freeze([
    ...(candidateOnly.length === 0 ? [] : [`exact-accepted-candidate-only-articles:${candidateOnly.length}`]),
    "first-party-attention-suspended-with-updated-privacy",
    "Cloudflare-managed-content-signal-remains-a-delivery-layer-robots-overlay",
    "public-record-provenance-and-current-gate-evidence-added",
  ]);
  const obstructions = Object.freeze([
    ...(liveStructuredArticlesPreserved ? [] : ["live-feed-or-ninjs-article-loss"]),
    ...(candidateOnlyArticlesExactlyAccepted ? [] : ["candidate-only-article-lacks-exact-editorial-acceptance"]),
    ...(editorialEvidenceCoversCandidate ? [] : ["candidate-editorial-evidence-does-not-cover-feed"]),
    ...(correctionsSurfacePresent ? [] : ["candidate-corrections-surface-missing"]),
    ...(advertisingProviderPreserved ? [] : ["live-a-ads-provider-or-unit-not-preserved"]),
    ...(attentionSuspendedWithDisclosure ? [] : ["attention-suspension-and-privacy-do-not-agree"]),
    ...(privacyAdvertisingBoundaryDeclared ? [] : ["candidate-third-party-advertising-request-boundary-undisclosed"]),
    ...(securityHeadersPreserved ? [] : [`live-security-header-delta:${securityHeaderDeltas.join(",")}`]),
    ...(providerManagedRobotsOverlayCompatible ? [] : ["cloudflare-managed-robots-overlay-not-compatible-with-candidate"]),
  ]);
  return Object.freeze({
    kind: "koios.candidate-live-semantics",
    liveOrigin,
    liveStructuredArticleCount: liveFeedRoutes.size,
    candidateStructuredArticleCount: candidateFeedRoutes.size,
    liveStructuredArticlesPreserved,
    candidateOnlyArticlesExactlyAccepted,
    editorialEvidenceCoversCandidate,
    correctionsSurfacePresent,
    advertisingProviderPreserved,
    liveAAdsUnits: liveUnits,
    candidateAAdsUnits: candidateUnits,
    attentionSuspendedWithDisclosure,
    privacyAdvertisingBoundaryDeclared,
    securityHeadersPreserved,
    securityHeaderDeltas,
    providerManagedRobotsOverlayCompatible,
    intentionalDeltas,
    obstructions,
    settled: obstructions.length === 0,
  });
}
