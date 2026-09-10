// Deterministic, non-authoritative static projections of the existing app.
// Both publication profiles reuse the exact HTTP resources Koios already
// serves; neither is a second renderer and neither invokes a delivery provider.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";

import { fromFetch, type App } from "@red-cup-engineering/http-server";

import { DEFAULT_CONTENT_DIR, DEFAULT_DATA_DIR } from "../../config.mjs";
import { loadPosts } from "../../content.mjs";
import { createKoiosNewsSiteApp, type KoiosSiteOptions } from "../../index.mjs";
import { DEFAULT_A_ADS_UNITS } from "../../theme.mjs";
import { verifyLivePublicationWitness, type LivePublicationWitness } from "./live-publication-witness.mjs";
import { inspectNavigation, makeHtmlOriginPortable, originPortabilityDefects } from "./origin-portability.mjs";
import { readKoiosLedger } from "../../management/ledger.mjs";
import { aAdsInventoryRouting } from "../../management/aads-public-performance.mjs";

const MARKER = ".koios-static-shadow";
export const STATIC_PUBLICATION_EXCLUSIONS = Object.freeze([
  "/hit",
  "/views.json",
  "/healthz",
  "/newsroom",
  "/cable",
  "/mcp",
  "/operators",
] as const);
const STATIC_SECURITY_HEADERS = Object.freeze([
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

export type StaticShadowArtifact = Readonly<{
  route: string;
  file: string;
  mediaType: string;
  bytes: number;
  digest: string;
}>;

export type StaticPublicationProfile = "shadow" | "cutover-candidate";

export type StaticPublicationManifest = Readonly<{
  kind: "koios.static-publication-manifest";
  node: "koios-news";
  canonicalOrigin: "https://koios.news";
  profile: StaticPublicationProfile;
  authority: "non-authoritative-shadow" | "non-authoritative-cutover-candidate";
  policy: Readonly<{
    indexing: "noindex-nofollow" | "production-indexable";
    advertising: boolean;
    viewBeacon: false;
    attention: "suspended" | "cloudflare-worker-aggregate/v1";
    mutableRoutes: "excluded";
    navigation: "delivery-origin-portable";
    legacyNavigation: "canonical-static-aliases";
    publicationAdmission: "public-record-carry-forward/v1" | "exact-editorial-acceptance/v1";
  }>;
  exclusions: readonly string[];
  limitations: readonly string[];
  aliasCount: number;
  advertisingUnits: readonly string[];
  routeCount: number;
  livePublicationWitnessDigest?: string;
  artifacts: readonly StaticShadowArtifact[];
}>;

/** Compatibility name for callers that still consume the shadow profile. */
export type StaticShadowManifest = StaticPublicationManifest;

export type StaticPublicationResult = Readonly<{
  outputDir: string;
  manifest: StaticPublicationManifest;
  manifestDigest: string;
  livePublicationWitness?: LivePublicationWitness;
}>;

/** Compatibility name for callers that still consume the shadow profile. */
export type StaticShadowResult = StaticPublicationResult;

function rawNi(bytes: Uint8Array | string): string { return `ni:///sha-256;${createHash("sha256").update(bytes).digest("base64url")}`; }

function headerLabel(name: string): string {
  return name.split("-").map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`).join("-");
}

function staticHeaders(response: Response, profile: StaticPublicationProfile): string {
  const lines = STATIC_SECURITY_HEADERS.map((name) => {
    const value = response.headers.get(name);
    if (value === null || value.trim() === "") throw new Error(`app root omitted required static security header: ${name}`);
    return `  ${headerLabel(name)}: ${value}`;
  });
  if (profile === "shadow") lines.unshift("  X-Robots-Tag: noindex, nofollow, noarchive");
  const semanticMediaTypes = [
    ["/coverage.json", "application/ld+json; charset=utf-8"],
    ["/feed.atom", "application/atom+xml; charset=utf-8"],
    ["/feed.json", "application/feed+json; charset=utf-8"],
    ["/feed.xml", "application/rss+xml; charset=utf-8"],
    ["/fingerprints/*.json", "application/ld+json; charset=utf-8"],
    ["/ninjs.json", "application/vnd.iptc.ninjs+json; charset=utf-8"],
  ] as const;
  return `/*\n${lines.join("\n")}\n\n${semanticMediaTypes.map(([pattern, value]) => `${pattern}\n  Content-Type: ${value}`).join("\n\n")}\n`;
}

function excluded(pathname: string): boolean {
  return STATIC_PUBLICATION_EXCLUSIONS.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function normalizedRoute(value: string, origin: string): string | undefined {
  let url: URL;
  try { url = new URL(value, origin); } catch { return undefined; }
  if (url.origin !== origin || url.protocol !== "https:") return undefined;
  if (url.search !== "" || excluded(url.pathname)) return undefined;
  return url.pathname || "/";
}

function linkedRoutes(html: string, origin: string): readonly string[] {
  const routes = new Set<string>();
  const pattern = /\b(?:href|src)=["']([^"']+)["']/giu;
  for (const match of html.matchAll(pattern)) {
    const route = normalizedRoute(match[1] ?? "", origin);
    if (route !== undefined) routes.add(route);
  }
  return Object.freeze([...routes].sort());
}

function companions(pathname: string): readonly string[] {
  const values: string[] = [];
  if (/^\/topics\/[a-z0-9-]+\/?$/u.test(pathname)) values.push(`${pathname.replace(/\/$/u, "")}.json`);
  if (/^\/tags\/[a-z0-9-]+\/?$/u.test(pathname)) values.push(`${pathname.replace(/\/$/u, "")}.json`);
  if (/^\/bibliography\/[^/]+\/?$/u.test(pathname)) values.push(`${pathname.replace(/\/$/u, "")}.json`);
  const article = pathname.match(/^\/posts\/([^/]+)\/?$/u);
  if (article?.[1] !== undefined) {
    const slug = article[1];
    values.push(`/fingerprints/${slug}.json`, `/fingerprints/${slug}.svg`, `/fingerprints/${slug}.png`);
  }
  return Object.freeze(values);
}

function outputRelativePath(route: string, mediaType: string): string {
  const pathname = new URL(route, "https://koios.news").pathname;
  if (pathname === "/") return "index.html";
  const relativePath = pathname.replace(/^\/+|\/+$/gu, "");
  // A route segment may legitimately contain a dot (bibliography domains such
  // as /bibliography/apnews.com) without being a file extension. Always carry
  // HTML routes as directory indexes so Cloudflare does not infer a bogus MIME
  // type from the last domain-label suffix.
  if (mediaType.startsWith("text/html")) return join(relativePath, "index.html");
  return relativePath;
}

function immutableBytes(route: string, mediaType: string, bytes: Buffer): Buffer {
  if (!mediaType.includes("json") || !(route === "/desks.json" || route === "/sources.json")) return bytes;
  const reading = JSON.parse(bytes.toString("utf8")) as Record<string, unknown>;
  // generatedAt describes the act of reading a live process, not the source
  // state. Carrying it into a static projection would make identical evidence
  // produce different territory without adding information.
  delete reading["generatedAt"];
  return Buffer.from(JSON.stringify(reading), "utf8");
}

function record(value: unknown): Readonly<Record<string, unknown>> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Readonly<Record<string, unknown>>
    : Object.freeze({});
}

function wordpressSlug(value: string): string {
  return value.normalize("NFKD")
    .replace(/[\u0300-\u036f]/gu, "")
    .toLowerCase()
    .replace(/[’']/gu, "")
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "");
}

function aliasPage(route: string, target: string, origin: string): string {
  const title = "Koios.News legacy route";
  return [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<meta http-equiv="refresh" content="0; url=${target}">`,
    `<link rel="canonical" href="${origin}${target}">`,
    `<title>${title}</title>`,
    "</head>",
    `<body><main><h1>${title}</h1><p>The historical path <code>${route}</code> is preserved. <a href="${target}">Continue to its current public surface.</a></p></main></body>`,
    "</html>",
  ].join("\n");
}

function legacyAliases(input: Readonly<{
  contentDir: string;
  origin: string;
  outputDir: string;
  artifacts: readonly StaticShadowArtifact[];
}>): ReadonlyMap<string, string> {
  const available = new Set(input.artifacts.filter((artifact) => artifact.route.startsWith("/")).map((artifact) => artifact.route));
  const aliases = new Map<string, string>();
  const admit = (route: string, target: string): void => {
    // Cloudflare's static asset carrier canonically serves directory indexes
    // without a terminal slash and issues a same-origin 307 for the historical
    // slash form. Bind manifest bytes to the carrier's canonical route while
    // retaining the old slash URL as working browser ingress.
    const carriedRoute = route === "/" ? route : route.replace(/\/+$/u, "");
    if (carriedRoute !== target && !available.has(carriedRoute) && available.has(target) && !excluded(carriedRoute)) aliases.set(carriedRoute, target);
  };

  for (const post of loadPosts(input.contentDir)) {
    const target = `/posts/${encodeURIComponent(post.slug)}`;
    if (!available.has(target)) continue;
    const title = typeof post.document.frontMatter["title"] === "string" ? post.document.frontMatter["title"] : undefined;
    const date = typeof post.document.frontMatter["date"] === "string" ? post.document.frontMatter["date"] : undefined;
    if (title !== undefined && /^\d{4}-\d{2}-\d{2}$/u.test(date ?? "")) {
      admit(`/${date!.replaceAll("-", "/")}/${wordpressSlug(title)}/`, target);
    }
    const original = record(post.document.frontMatter["koios"])["original_permalink"];
    if (typeof original === "string") {
      try {
        const url = new URL(original, input.origin);
        if (url.origin === input.origin) admit(url.pathname, target);
      } catch { /* malformed predecessor metadata does not create authority */ }
    }
  }

  for (const route of available) {
    const tag = route.match(/^\/tags\/([^/.]+)$/u)?.[1];
    if (tag !== undefined) admit(`/tag/${tag}/`, route);
    const topic = route.match(/^\/topics\/([^/.]+)$/u)?.[1];
    if (topic !== undefined) admit(`/category/${topic}/`, route);
  }

  for (const artifact of input.artifacts) {
    if (!artifact.mediaType.startsWith("text/html")) continue;
    const html = readFileSync(join(input.outputDir, artifact.file), "utf8");
    for (const target of inspectNavigation(html, `${input.origin}${artifact.route}`, input.origin).internalTargets) {
      const pathname = new URL(target, input.origin).pathname;
      if (/^\/tag\/[^/]+\/$/u.test(pathname)) admit(pathname, "/tags");
      if (/^\/category\/[^/]+\/$/u.test(pathname)) admit(pathname, "/topics");
    }
  }
  return new Map([...aliases].sort(([left], [right]) => left.localeCompare(right)));
}

function confined(root: string, candidate: string): boolean {
  const rel = relative(root, candidate);
  return rel !== "" && rel !== ".." && !rel.startsWith(`..${sep}`);
}

function markerProfile(directory: string): StaticPublicationProfile | undefined {
  const path = join(directory, MARKER);
  if (!existsSync(path)) return undefined;
  try {
    const value = JSON.parse(readFileSync(path, "utf8")) as Readonly<{ kind?: unknown; profile?: unknown }>;
    return value.kind === "koios.static-publication-output"
      && (value.profile === "shadow" || value.profile === "cutover-candidate")
      ? value.profile
      : undefined;
  } catch { return undefined; }
}

function prepareOutput(outputDir: string, replace: boolean, profile: StaticPublicationProfile): Readonly<{ target: string; staging: string }> {
  const target = resolve(outputDir);
  const staging = `${target}.next`;
  if (target === resolve("/") || target === resolve(process.cwd())) throw new Error(`refusing broad static output target: ${target}`);
  if (existsSync(staging)) {
    const marker = join(staging, MARKER);
    if (!existsSync(marker)) throw new Error(`refusing to replace unmarked staging directory: ${staging}`);
    rmSync(staging, { recursive: true });
  }
  if (existsSync(target)) {
    if (!replace) throw new Error(`static output exists; pass replace only for a marked Koios artifact: ${target}`);
    if (!existsSync(join(target, MARKER))) throw new Error(`refusing to replace unmarked output directory: ${target}`);
    const existingProfile = markerProfile(target);
    if (existingProfile !== undefined && existingProfile !== profile) throw new Error(`refusing to replace ${existingProfile} output with ${profile} bytes: ${target}`);
  }
  mkdirSync(staging, { recursive: true });
  writeFileSync(join(staging, MARKER), `${JSON.stringify({ kind: "koios.static-publication-output", node: "koios-news", profile })}\n`, "utf8");
  return Object.freeze({ target, staging });
}

function seedRoutes(app: App): readonly string[] {
  return Object.freeze([...(app.resources ?? [])].flatMap((resource) => {
    if (resource.route === undefined || resource.route.includes(":")) return [];
    if (resource.methods !== undefined && !resource.methods.includes("GET")) return [];
    return excluded(resource.route) ? [] : [resource.route];
  }).sort());
}

export async function buildStaticPublication(input: Readonly<{
  outputDir: string;
  profile: StaticPublicationProfile;
  replace?: boolean;
  site?: KoiosSiteOptions;
  livePublicationWitness?: LivePublicationWitness;
}>): Promise<StaticPublicationResult> {
  if (input.livePublicationWitness !== undefined) verifyLivePublicationWitness(input.livePublicationWitness);
  const shadow = input.profile === "shadow";
  const dataDir = input.site?.dataDir ?? DEFAULT_DATA_DIR;
  const advertisingUnits = shadow ? Object.freeze([]) : aAdsInventoryRouting(readKoiosLedger(dataDir, "advertising"), DEFAULT_A_ADS_UNITS).activeUnits;
  const origin = "https://koios.news";
  const app = createKoiosNewsSiteApp({
    ...input.site,
    siteUrl: origin,
    advertising: !shadow,
    beacon: false,
    editorialAdmission: input.livePublicationWitness === undefined ? (input.site?.editorialAdmission ?? "exact") : "public-record",
    ...(input.livePublicationWitness === undefined ? {} : { predecessorPublicRoutes: input.livePublicationWitness.articleRoutes }),
  });
  const fetchApp = fromFetch(app);
  const { target, staging } = prepareOutput(input.outputDir, input.replace === true, input.profile);
  const queue = [...seedRoutes(app)];
  const seen = new Set<string>();
  const artifacts: StaticShadowArtifact[] = [];
  let headers: string | undefined;

  while (queue.length > 0) {
    const route = queue.shift()!;
    if (seen.has(route) || excluded(route)) continue;
    seen.add(route);
    const response = await fetchApp(new Request(`${origin}${route}`, { method: "GET" }));
    if (response.status === 404) continue;
    if (response.status !== 200) throw new Error(`static projection ${route} returned ${response.status}`);
    if (route === "/") headers = staticHeaders(response, input.profile);
    const mediaType = response.headers.get("content-type") ?? "application/octet-stream";
    let bytes = immutableBytes(route, mediaType, Buffer.from(await response.arrayBuffer()));
    if (mediaType.startsWith("text/html")) {
      bytes = Buffer.from(makeHtmlOriginPortable(bytes.toString("utf8"), origin), "utf8");
    }
    if (shadow && route === "/robots.txt") bytes = Buffer.from("User-agent: *\nDisallow: /\n", "utf8");
    const file = outputRelativePath(route, mediaType);
    const path = resolve(staging, file);
    if (!confined(staging, path)) throw new Error(`static route escaped output membrane: ${route}`);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, bytes);
    artifacts.push(Object.freeze({ route, file: file.split(sep).join("/"), mediaType, bytes: bytes.length, digest: rawNi(bytes) }));

    if (mediaType.startsWith("text/html")) {
      const html = bytes.toString("utf8");
      for (const discovered of linkedRoutes(html, origin)) if (!seen.has(discovered)) queue.push(discovered);
    }
    for (const companion of companions(route)) if (!seen.has(companion)) queue.push(companion);
  }

  const aliases = legacyAliases({
    contentDir: input.site?.contentDir ?? DEFAULT_CONTENT_DIR,
    origin,
    outputDir: staging,
    artifacts,
  });
  for (const [route, targetRoute] of aliases) {
    const html = aliasPage(route, targetRoute, origin);
    const file = outputRelativePath(route, "text/html; charset=utf-8");
    const path = resolve(staging, file);
    if (!confined(staging, path)) throw new Error(`static alias escaped output membrane: ${route}`);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, html, "utf8");
    artifacts.push(Object.freeze({ route, file: file.split(sep).join("/"), mediaType: "text/html; charset=utf-8", bytes: Buffer.byteLength(html), digest: rawNi(html) }));
  }

  if (headers === undefined) throw new Error("static publication did not render its root security policy");
  writeFileSync(join(staging, "_headers"), headers, "utf8");
  artifacts.push(Object.freeze({ route: "urn:cloudflare-pages:_headers", file: "_headers", mediaType: "text/plain", bytes: Buffer.byteLength(headers), digest: rawNi(headers) }));
  artifacts.sort((left, right) => left.route.localeCompare(right.route));

  const manifest: StaticPublicationManifest = Object.freeze({
    kind: "koios.static-publication-manifest",
    node: "koios-news",
    canonicalOrigin: origin,
    profile: input.profile,
    authority: shadow ? "non-authoritative-shadow" : "non-authoritative-cutover-candidate",
    policy: Object.freeze({ indexing: shadow ? "noindex-nofollow" : "production-indexable", advertising: !shadow, viewBeacon: false, attention: shadow ? "suspended" : "cloudflare-worker-aggregate/v1", mutableRoutes: "excluded", navigation: "delivery-origin-portable", legacyNavigation: "canonical-static-aliases", publicationAdmission: input.livePublicationWitness === undefined ? "exact-editorial-acceptance/v1" : "public-record-carry-forward/v1" }),
    exclusions: STATIC_PUBLICATION_EXCLUSIONS,
    limitations: Object.freeze([
      "Predecessor-published articles are carried as public record, not represented as newly accepted under the current exact-manuscript editorial gate.",
      "Search is a static empty-query surface until a separately contracted edge search operation exists.",
      ...(shadow ? ["Aggregate attention is omitted from this non-authoritative profile."] : ["The primary Cloudflare Worker counts successful article loads by canonical path and UTC day without retaining reader identifiers; imported totals remain separate from factual warrant."]),
      ...(shadow ? ["Advertising is suppressed so the noindex shadow cannot create impressions or revenue events."] : ["A-Ads carriers are production-shaped; ad-performance settlement remains unavailable until separately contracted."]),
      ...(shadow ? [] : ["Production-indexable candidate bytes may reach a public preview only through the provider-owned separately digested noindex overlay; removing that overlay requires an explicit cutover act."]),
      "This artifact does not confer upload, preview-hostname, DNS, or cutover authority.",
    ]),
    ...(input.livePublicationWitness === undefined ? {} : { livePublicationWitnessDigest: input.livePublicationWitness.witnessDigest }),
    aliasCount: aliases.size,
    advertisingUnits,
    routeCount: artifacts.filter((artifact) => artifact.route.startsWith("/")).length,
    artifacts: Object.freeze(artifacts),
  });
  const manifestBytes = `${JSON.stringify(manifest, null, 2)}\n`;
  writeFileSync(join(staging, "manifest.json"), manifestBytes, "utf8");
  const manifestDigest = rawNi(manifestBytes);

  if (existsSync(target)) rmSync(target, { recursive: true });
  renameSync(staging, target);
  return Object.freeze({ outputDir: target, manifest, manifestDigest, ...(input.livePublicationWitness === undefined ? {} : { livePublicationWitness: input.livePublicationWitness }) });
}

export async function buildStaticShadow(input: Readonly<{
  outputDir: string;
  replace?: boolean;
  site?: KoiosSiteOptions;
  livePublicationWitness?: LivePublicationWitness;
}>): Promise<StaticShadowResult> {
  return buildStaticPublication({ ...input, profile: "shadow" });
}

export function verifyStaticPublication(result: StaticPublicationResult): Readonly<{ valid: true; profile: StaticPublicationProfile; manifestDigest: string; routeCount: number }> {
  const manifestPath = join(result.outputDir, "manifest.json");
  const manifestBytes = readFileSync(manifestPath);
  if (rawNi(manifestBytes) !== result.manifestDigest) throw new Error("static publication manifest identity changed after projection");
  const shadow = result.manifest.profile === "shadow";
  if (result.manifest.kind !== "koios.static-publication-manifest") throw new Error("static publication manifest has the wrong kind");
  if (result.manifest.authority !== (shadow ? "non-authoritative-shadow" : "non-authoritative-cutover-candidate")) throw new Error("static publication profile and authority disagree");
  if (result.manifest.policy.indexing !== (shadow ? "noindex-nofollow" : "production-indexable")) throw new Error("static publication profile and indexing policy disagree");
  if (result.manifest.policy.advertising !== !shadow || result.manifest.policy.viewBeacon !== false || result.manifest.policy.attention !== (shadow ? "suspended" : "cloudflare-worker-aggregate/v1")) throw new Error("static publication profile and carrier policy disagree");
  if (result.manifest.policy.navigation !== "delivery-origin-portable") throw new Error("static publication does not declare origin-portable navigation");
  if (result.manifest.policy.legacyNavigation !== "canonical-static-aliases") throw new Error("static publication does not declare its legacy-route carrier");
  if (result.manifest.aliasCount < 1) throw new Error("static publication carries no historical route aliases");
  const routes = new Set(result.manifest.artifacts.map((artifact) => artifact.route));
  for (const required of ["/", "/feed.xml", "/sitemap.xml", "/newswire-audit.json", "/publication-provenance.json", "/corrections", "/standards"]) {
    if (!routes.has(required)) throw new Error(`static publication omitted required public surface ${required}`);
  }
  if (![...routes].some((route) => route.startsWith("/posts/"))) throw new Error("static publication contains no public article");
  if (![...routes].some((route) => route.startsWith("/fingerprints/") && route.endsWith(".svg"))) throw new Error("static publication contains no deterministic article fingerprint");
  const provenance = JSON.parse(readFileSync(join(result.outputDir, "publication-provenance.json"), "utf8")) as {
    policy?: unknown;
    articleCount?: unknown;
    exactAcceptanceCount?: unknown;
    predecessorWitnessCount?: unknown;
    articles?: unknown;
  };
  if (provenance.policy !== result.manifest.policy.publicationAdmission) throw new Error("publication provenance policy differs from static manifest admission");
  const articles = Array.isArray(provenance.articles) ? provenance.articles.filter((value): value is Record<string, unknown> => value !== null && typeof value === "object" && !Array.isArray(value)) : [];
  if (provenance.articleCount !== articles.length) throw new Error("publication provenance article count does not close");
  if (result.manifest.policy.publicationAdmission === "public-record-carry-forward/v1") {
    const witness = result.livePublicationWitness;
    if (witness === undefined || result.manifest.livePublicationWitnessDigest !== witness.witnessDigest) throw new Error("public-record publication lacks its exact frozen live witness");
    const predecessor = articles.filter((article) => article["authority"] === "predecessor-publication-witness");
    const exact = articles.filter((article) => article["authority"] === "exact-editorial-acceptance");
    const witnessRoutes = new Set(witness.articleRoutes);
    if (predecessor.some((article) => typeof article["path"] !== "string" || !witnessRoutes.has(article["path"]))) throw new Error("predecessor article lacks a live canonical-route witness");
    if (provenance.predecessorWitnessCount !== predecessor.length || provenance.exactAcceptanceCount !== exact.length) throw new Error("publication provenance authority counts do not close");
  }
  for (const artifact of result.manifest.artifacts) {
    const path = join(result.outputDir, artifact.file);
    if (!existsSync(path)) throw new Error(`manifest artifact missing: ${artifact.file}`);
    const bytes = readFileSync(path);
    if (rawNi(bytes) !== artifact.digest) throw new Error(`artifact identity mismatch: ${artifact.file}`);
    if (bytes.length !== artifact.bytes) throw new Error(`artifact byte count mismatch: ${artifact.file}`);
    if (artifact.mediaType.startsWith("text/html") && !artifact.file.endsWith("index.html")) throw new Error(`HTML route is not carried as a directory index: ${artifact.route}`);
  }
  for (const forbidden of STATIC_PUBLICATION_EXCLUSIONS) if (routes.has(forbidden)) throw new Error(`mutable or private route entered static publication: ${forbidden}`);

  const headers = readFileSync(join(result.outputDir, "_headers"), "utf8");
  const robots = readFileSync(join(result.outputDir, "robots.txt"), "utf8");
  const privacy = readFileSync(join(result.outputDir, "privacy", "index.html"), "utf8");
  const html = result.manifest.artifacts
    .filter((artifact) => artifact.mediaType.startsWith("text/html"))
    .map((artifact) => readFileSync(join(result.outputDir, artifact.file), "utf8"))
    .join("\n");
  const portabilityDefects = originPortabilityDefects(html, result.manifest.canonicalOrigin);
  if (portabilityDefects.length > 0) throw new Error(`static publication contains canonical-origin delivery escapes: ${JSON.stringify(portabilityDefects.slice(0, 10))}`);
  if (html.includes("var u='/hit") || html.includes("navigator.sendBeacon")) throw new Error("static publication emits an uncontracted attention beacon");
  for (const name of STATIC_SECURITY_HEADERS) if (!headers.includes(`${headerLabel(name)}:`)) throw new Error(`static publication omitted security header ${name}`);
  if (!headers.includes("Referrer-Policy: no-referrer")) throw new Error("static publication weakens the app referrer policy");
  if (!headers.includes("Cross-Origin-Opener-Policy: same-origin") || !headers.includes("Cross-Origin-Resource-Policy: same-origin")) throw new Error("static publication omits cross-origin isolation policy");
  if (!headers.includes("Permissions-Policy: geolocation=(), microphone=(), camera=()")) throw new Error("static publication omits permissions policy");
  if (!headers.includes("X-Frame-Options: DENY")) throw new Error("static publication omits frame denial policy");
  if (privacy.includes('href="/views.json"')) throw new Error("static privacy surface links to an excluded attention aggregate");
  if (shadow) {
    if (!privacy.includes("does not send a first-party view beacon") || !privacy.includes("Accountable attention remains suspended")) throw new Error("shadow privacy surface does not declare the actual attention suspension");
    if (!headers.includes("X-Robots-Tag: noindex, nofollow, noarchive")) throw new Error("shadow lacks its response-level noindex policy");
    if (!robots.includes("Disallow: /") || robots.includes("Sitemap:")) throw new Error("shadow robots policy is indexable");
    if (html.includes("data-provider=\"a-ads\"") || html.includes("acceptable.a-ads.com")) throw new Error("shadow contains an advertising carrier");
    if (!privacy.includes("Pages currently carry no third-party advertising")) throw new Error("shadow privacy surface does not declare advertising suspension");
    if (headers.includes("frame-src https://acceptable.a-ads.com")) throw new Error("shadow security policy permits a suppressed advertising provider");
  } else {
    if (!privacy.includes("increments one aggregate counter keyed only by the canonical article path and UTC day") || !privacy.includes("stores no IP address") || !privacy.includes("never supplies factual warrant")) throw new Error("cutover candidate privacy surface omits its aggregate edge-attention boundary");
    if (headers.includes("X-Robots-Tag") || robots.includes("Disallow: /")) throw new Error("cutover candidate retains a shadow noindex policy");
    if (!robots.includes("Sitemap:")) throw new Error("cutover candidate does not advertise its public sitemaps");
    if (!html.includes("data-provider=\"a-ads\"") || !html.includes("acceptable.a-ads.com")) throw new Error("cutover candidate lacks its production A-Ads carriers");
    if (result.manifest.advertisingUnits.length === 0) throw new Error("cutover candidate has no provider-verified A-Ads inventory route");
    for (const unit of result.manifest.advertisingUnits) if (!html.includes(`data-aa=\"${unit}\"`)) throw new Error(`cutover candidate omitted routed A-Ads unit ${unit}`);
    if (!privacy.includes("Pages may carry A-Ads units in embedded frames")) throw new Error("cutover candidate privacy surface omits A-Ads behavior");
    if (!privacy.includes("ordinary network request metadata") || !privacy.includes("no-referrer")) throw new Error("cutover candidate privacy surface omits the third-party request boundary");
    if (!headers.includes("frame-src https://acceptable.a-ads.com")) throw new Error("cutover candidate security policy blocks its declared A-Ads frames");
  }
  return Object.freeze({ valid: true, profile: result.manifest.profile, manifestDigest: result.manifestDigest, routeCount: result.manifest.routeCount });
}

export function verifyStaticShadow(result: StaticShadowResult): Readonly<{ valid: true; profile: "shadow"; manifestDigest: string; routeCount: number }> {
  if (result.manifest.profile !== "shadow") throw new Error("verifyStaticShadow received a non-shadow publication profile");
  const verified = verifyStaticPublication(result);
  return Object.freeze({ ...verified, profile: "shadow" });
}
