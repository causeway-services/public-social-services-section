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
  kind: "koios.live-publication-witness/v1";
  origin: string;
  observedAt: string;
  articleRoutes: readonly string[];
  sitemapRoutes: readonly string[];
  surfaces: readonly LiveSurfaceWitness[];
  witnessDigest: string;
}>;

function sha256(value: Uint8Array | string): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value !== null && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical((value as Record<string, unknown>)[key])}`).join(",")}}`;
  return JSON.stringify(value);
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
      digest: sha256(bytes),
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
    kind: "koios.live-publication-witness/v1" as const,
    origin,
    observedAt: input.observedAt,
    articleRoutes,
    sitemapRoutes: sitemap,
    surfaces: Object.freeze(surfaces.sort((left, right) => left.route.localeCompare(right.route))),
  });
  return Object.freeze({ ...body, witnessDigest: sha256(canonical(body)) });
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
  return record["kind"] === "koios.live-publication-witness/v1"
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
  if (sha256(canonical(body)) !== witnessDigest) throw new Error("live-publication witness digest does not verify");
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
