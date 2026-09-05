import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { appendKoiosAct, ledgerRootPath, type JsonObject } from "../../management/ledger.mjs";

const SURFACES = Object.freeze([
  "/feed.json",
  "/feed.xml",
  "/feed.atom",
  "/sitemap.xml",
  "/news-sitemap.xml",
  "/ninjs.json",
  "/newswire-audit.json",
  "/privacy",
  "/standards",
  "/ads.txt",
  "/robots.txt",
] as const);

export type LiveSurfaceWitness = Readonly<{
  route: string;
  status: number;
  mediaType: string;
  bytes: number;
  digest: string;
}>;

export type LivePublicationWitness = Readonly<{
  kind: "koios.live-publication-witness/v2";
  origin: string;
  observedAt: string;
  articleRoutes: readonly string[];
  sitemapRoutes: readonly string[];
  surfaces: readonly LiveSurfaceWitness[];
  witnessDigest: string;
}>;

function rawNi(value: Uint8Array | string): string { return `ni:///sha-256;${createHash("sha256").update(value).digest("base64url")}`; }
function literal(value: unknown): string { return JSON.stringify(String(value)); }
function witnessCarrier(body: Omit<LivePublicationWitness, "witnessDigest">): string {
  const graph = `urn:koios:live-publication-witness:${encodeURIComponent(body.observedAt)}`;
  const root = `<${body.origin}>`;
  const rows = [
    `${root} <urn:rmn:observedAt> ${literal(body.observedAt)} <${graph}> .`,
    ...body.articleRoutes.map((route) => `${root} <urn:koios:articleRoute> ${literal(route)} <${graph}> .`),
    ...body.sitemapRoutes.map((route) => `${root} <urn:koios:sitemapRoute> ${literal(route)} <${graph}> .`),
    ...body.surfaces.flatMap((surface) => {
      const subject = `<urn:koios:surface:${encodeURIComponent(surface.route)}>`;
      return [
        `${root} <urn:koios:surface> ${subject} <${graph}> .`,
        `${subject} <urn:rmn:bytes> ${literal(surface.bytes)} <${graph}> .`,
        `${subject} <urn:rmn:content> <${surface.digest}> <${graph}> .`,
        `${subject} <urn:rmn:mediaType> ${literal(surface.mediaType)} <${graph}> .`,
        `${subject} <urn:rmn:status> ${literal(surface.status)} <${graph}> .`
      ];
    })
  ].sort();
  return `${rows.join("\n")}\n`;
}

function articleRoute(value: unknown, origin: string): string | undefined {
  if (typeof value !== "string") return undefined;
  try {
    const url = new URL(value, origin);
    return url.origin === origin && /^\/posts\/[^/]+\/?$/u.test(url.pathname)
      ? url.pathname.replace(/\/$/u, "")
      : undefined;
  } catch { return undefined; }
}

function sitemapRoutes(xml: string, origin: string): readonly string[] {
  return Object.freeze([...xml.matchAll(/<loc>([^<]+)<\/loc>/giu)].flatMap((match) => {
    try {
      const url = new URL(match[1] ?? "", origin);
      return url.origin === origin ? [url.pathname.replace(/\/$/u, "") || "/"] : [];
    } catch { return []; }
  }).sort());
}

export async function captureLivePublicationWitness(input: Readonly<{
  origin?: string;
  observedAt: string;
}>): Promise<LivePublicationWitness> {
  const origin = new URL(input.origin ?? "https://koios.news").origin;
  const bodies = new Map<string, Uint8Array>();
  const surfaces: LiveSurfaceWitness[] = [];
  for (const route of SURFACES) {
    const response = await fetch(`${origin}${route}`, { headers: { accept: "*/*" } });
    const bytes = new Uint8Array(await response.arrayBuffer());
    bodies.set(route, bytes);
    surfaces.push(Object.freeze({
      route,
      status: response.status,
      mediaType: (response.headers.get("content-type") ?? "application/octet-stream").split(";", 1)[0]!.trim().toLowerCase(),
      bytes: bytes.byteLength,
      digest: rawNi(bytes),
    }));
  }
  const feedBytes = bodies.get("/feed.json");
  if (feedBytes === undefined) throw new Error("live publication witness omitted /feed.json");
  const feed = JSON.parse(Buffer.from(feedBytes).toString("utf8")) as { items?: unknown };
  const items = Array.isArray(feed.items) ? feed.items : [];
  const articleRoutes = Object.freeze([...new Set(items.flatMap((item) => {
    if (item === null || typeof item !== "object" || Array.isArray(item)) return [];
    const route = articleRoute((item as Record<string, unknown>)["url"], origin);
    return route === undefined ? [] : [route];
  }))].sort());
  if (articleRoutes.length === 0) throw new Error("live publication witness found no public article routes");
  const sitemapBytes = bodies.get("/sitemap.xml");
  if (sitemapBytes === undefined) throw new Error("live publication witness omitted /sitemap.xml");
  const sitemap = sitemapRoutes(Buffer.from(sitemapBytes).toString("utf8"), origin);
  const body = Object.freeze({
    kind: "koios.live-publication-witness/v2" as const,
    origin,
    observedAt: input.observedAt,
    articleRoutes,
    sitemapRoutes: sitemap,
    surfaces: Object.freeze(surfaces.sort((left, right) => left.route.localeCompare(right.route))),
  });
  return Object.freeze({ ...body, witnessDigest: rawNi(witnessCarrier(body)) });
}

function jsonlFiles(root: string): readonly string[] {
  try {
    return Object.freeze(readdirSync(root, { withFileTypes: true }).flatMap((entry) => entry.isDirectory()
      ? jsonlFiles(join(root, entry.name))
      : entry.name.endsWith(".jsonl") ? [join(root, entry.name)] : []));
  } catch { return Object.freeze([]); }
}

function isWitness(value: unknown): value is LivePublicationWitness {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return record["kind"] === "koios.live-publication-witness/v2"
    && typeof record["origin"] === "string"
    && typeof record["observedAt"] === "string"
    && Array.isArray(record["articleRoutes"])
    && typeof record["witnessDigest"] === "string";
}

export function latestLivePublicationWitness(dataRoot: string): LivePublicationWitness {
  const candidates = jsonlFiles(ledgerRootPath(dataRoot, "deployments")).flatMap((path) => {
    try {
      return readFileSync(path, "utf8").split("\n").filter(Boolean).flatMap((line) => {
        const record = JSON.parse(line) as JsonObject;
        const data = record["data"];
        return record["act"] === "deployment.live-publication-witnessed" && isWitness(data) ? [data] : [];
      });
    } catch { return []; }
  }).sort((left, right) => left.observedAt.localeCompare(right.observedAt));
  const witness = candidates.at(-1);
  if (witness === undefined) throw new Error("no frozen live-publication witness exists; run shadow:witness-live with an explicit --now first");
  return verifyLivePublicationWitness(witness);
}

export function verifyLivePublicationWitness(witness: LivePublicationWitness): LivePublicationWitness {
  const { witnessDigest, ...body } = witness;
  if (rawNi(witnessCarrier(body)) !== witnessDigest) throw new Error("live-publication witness identity does not verify");
  if (new Set(witness.articleRoutes).size !== witness.articleRoutes.length) throw new Error("live-publication witness repeats an article route");
  if (witness.articleRoutes.some((route) => !/^\/posts\/[^/]+$/u.test(route))) throw new Error("live-publication witness contains a non-canonical article route");
  return witness;
}

export function appendLivePublicationWitness(dataRoot: string, witness: LivePublicationWitness): Readonly<JsonObject> {
  return appendKoiosAct({
    dataRoot,
    ledger: "deployments",
    instant: witness.observedAt,
    act: "deployment.live-publication-witnessed",
    subject: witness.origin,
    data: witness as unknown as JsonObject,
  });
}
