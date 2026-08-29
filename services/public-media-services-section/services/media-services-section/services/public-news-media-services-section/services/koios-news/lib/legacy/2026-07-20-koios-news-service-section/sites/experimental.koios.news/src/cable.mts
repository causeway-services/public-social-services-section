import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  articleCarrier,
  cell,
  charge,
  chargeValue,
  claim,
  composeFibers,
  mark,
  meme,
  predicateOfClaim,
  predicationSite,
  token,
  type Article,
  type Meme,
  type Valuation,
} from "@emsenn/metroplat";
import { parse as parseEavt, type EAVT } from "@emsenn/metroplat/codecs/text/json/jsonl/eavt";
import { parseSyndicationItems, type SyndicationItem } from "@emsenn/metroplat/codecs/text/xml/rss";
import {
  appendWitnessesAtRoot,
  projectLogPathState,
} from "@emsenn/metroplat/services/filesystem-store";

import { topicSubject } from "./topics.mjs";

export type KoiosCableSource = Readonly<{
  adapter: "rss";
  url: string;
  max?: number;
}>;

export type KoiosCableWire = Readonly<{
  name: string;
  title: string;
  description?: string;
  keyword: string;
  sources: readonly KoiosCableSource[];
}>;

export type KoiosCableConfig = Readonly<{
  name: string;
  newscable: Readonly<{
    title: string;
    description?: string;
    wires: readonly KoiosCableWire[];
  }>;
}>;

export type KoiosCableProvenance = Readonly<{
  witness: string;
  sourceUrl: string;
  itemUrl: string;
  fetchedAt: string;
  fingerprint: string;
}>;

export type KoiosCableClaimBundle = Readonly<{
  kind: "koios.news.cable.claim-state-bundle";
  entity: string;
  wire: string;
  iptcKeyword: string;
  iptcSubject?: Readonly<{ code: string; name: string }>;
  fingerprint: string;
  article: Article;
  item: SyndicationItem;
  memes: readonly Meme[];
  valuation: Valuation;
  provenance: KoiosCableProvenance;
}>;

export type KoiosCableSourceResult = Readonly<{
  wire: string;
  sourceUrl: string;
  fetched: number;
  projected: number;
  written: number;
  skipped: number;
  logPath?: string;
  statePath?: string;
  errors: readonly string[];
}>;

export type KoiosCableWireResult = Readonly<{
  wire: string;
  fetched: number;
  projected: number;
  written: number;
  skipped: number;
  sources: readonly KoiosCableSourceResult[];
  errors: readonly string[];
}>;

export type KoiosCableIngestOptions = Readonly<{
  configPath?: string;
  storeDir?: string;
  now?: Date;
  fetchTimeoutMs?: number;
  wires?: readonly string[];
  onSkip?: (message: string) => void;
}>;

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const defaultCableConfigPath = resolve(packageRoot, "cable.config.json");
const defaultStoreDir = resolve(packageRoot, "store");
const FINGERPRINT_ATTRIBUTE = "koios.news.cable.content_fingerprint";
const FUNCTIONAL_ATTRIBUTES = Object.freeze([
  "koios.news.cable.title",
  "koios.news.cable.url",
  "koios.news.cable.summary",
  "koios.news.cable.published",
  "koios.news.cable.author",
  "koios.news.cable.wire",
  "koios.news.cable.iptc_keyword",
  "koios.news.cable.source_url",
  FINGERPRINT_ATTRIBUTE,
  "koios.news.cable.bundle",
] as const);

function record(value: unknown): Readonly<Record<string, unknown>> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Readonly<Record<string, unknown>>
    : Object.freeze({});
}

function stringValue(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function stableJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right));
  return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`).join(",")}}`;
}

function slug(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "")
    .slice(0, 120) || "item";
}

function jsonHash(value: unknown): string {
  return createHash("sha256").update(stableJson(value)).digest("hex");
}

function sourceFrom(value: unknown): KoiosCableSource | null {
  const source = record(value);
  const adapter = source["adapter"];
  const url = stringValue(source["url"]);
  if (adapter !== "rss" || url === undefined) return null;
  return Object.freeze({
    adapter,
    url,
    ...(numberValue(source["max"]) === undefined ? {} : { max: numberValue(source["max"])! }),
  });
}

function wireFrom(value: unknown): KoiosCableWire | null {
  const wire = record(value);
  const name = stringValue(wire["name"]);
  const title = stringValue(wire["title"]);
  const keyword = stringValue(wire["keyword"]);
  const rawSources = wire["sources"];
  if (name === undefined || title === undefined || keyword === undefined || !Array.isArray(rawSources)) return null;
  return Object.freeze({
    name,
    title,
    ...(stringValue(wire["description"]) === undefined ? {} : { description: stringValue(wire["description"])! }),
    keyword,
    sources: Object.freeze(rawSources.flatMap((item) => {
      const parsed = sourceFrom(item);
      return parsed === null ? [] : [parsed];
    })),
  });
}

function configFrom(value: unknown): KoiosCableConfig {
  const root = record(value);
  const newscable = record(root["newscable"]);
  const rawWires = newscable["wires"];
  if (!Array.isArray(rawWires)) throw new TypeError("Koios cable config missing newscable.wires");
  const wires = Object.freeze(rawWires.flatMap((item) => {
    const parsed = wireFrom(item);
    return parsed === null ? [] : [parsed];
  }));
  return Object.freeze({
    name: stringValue(root["name"]) ?? "koios.news",
    newscable: Object.freeze({
      title: stringValue(newscable["title"]) ?? "Koios News Cable",
      ...(stringValue(newscable["description"]) === undefined ? {} : { description: stringValue(newscable["description"])! }),
      wires,
    }),
  });
}

export async function readKoiosCableConfig(path = defaultCableConfigPath): Promise<KoiosCableConfig> {
  return configFrom(JSON.parse(await readFile(path, "utf8")) as unknown);
}

function sourceUrlText(sourceUrl: string, configPath: string, timeoutMs: number): Promise<string> {
  if (/^https?:\/\//iu.test(sourceUrl)) {
    return fetch(sourceUrl, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        "accept": "application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.8",
        "user-agent": "Koios.News cable-ingest/0.1 (+https://koios.news)",
      },
    }).then(async (response) => {
      if (!response.ok) throw new Error(`${sourceUrl}: HTTP ${response.status}`);
      return response.text();
    });
  }
  const path = sourceUrl.startsWith("file://")
    ? fileURLToPath(sourceUrl)
    : isAbsolute(sourceUrl)
      ? sourceUrl
      : resolve(dirname(configPath), sourceUrl);
  return readFile(path, "utf8");
}

export function cableItemFingerprint(item: SyndicationItem): string {
  return jsonHash({
    title: item.title,
    url: item.url,
    summary: item.summary ?? "",
    published: item.published ?? item.updated ?? "",
  });
}

function normalizedDate(value: string | undefined, fallback: Date): string {
  if (value === undefined) return fallback.toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback.toISOString() : parsed.toISOString();
}

function articleFromItem(wire: KoiosCableWire, item: SyndicationItem, fingerprint: string, now: Date): Article {
  const subject = topicSubject(wire.name);
  const date = normalizedDate(item.published ?? item.updated, now);
  const summary = item.summary ?? "";
  return articleCarrier.assert({
    title: item.title,
    slug: slug(item.title),
    author: item.author ?? "source feed",
    date,
    draft: false,
    url: item.url,
    canonicalUrl: item.url,
    summary,
    description: summary,
    section: wire.name,
    beat: wire.name,
    keywords: Object.freeze([wire.keyword, ...item.categories]),
    categories: Object.freeze([wire.name]),
    tags: Object.freeze([
      wire.keyword,
      ...(subject === null ? [] : [subject.name, subject.code]),
      ...item.categories,
    ]),
    sources: Object.freeze([{
      url: item.url,
      title: item.title,
      source: wire.title,
      observed: now.toISOString(),
      adapter: "rss",
      wire: wire.name,
      citation: item.id ?? item.url,
    }]),
    koios: Object.freeze({
      original_permalink: item.url,
    }),
    body: summary,
  }, `koios cable item ${wire.name} ${fingerprint}`) as Article;
}

function claimEvidence(provenance: KoiosCableProvenance) {
  return Object.freeze([
    Object.freeze([mark({ kind: "koios.cable.provenance", ...provenance })]),
    Object.freeze([]),
  ] as const);
}

function claimMeme(entity: string, predicate: string, object: unknown, provenance: KoiosCableProvenance): Meme {
  return meme(
    cell(
      token(mark(entity)),
      predicateOfClaim(claim(mark(predicate))),
      token(mark(object)),
    ),
    charge(chargeValue("potential"), claimEvidence(provenance)),
  );
}

function bundleJson(bundle: KoiosCableClaimBundle) {
  return Object.freeze({
    kind: bundle.kind,
    entity: bundle.entity,
    wire: bundle.wire,
    iptcKeyword: bundle.iptcKeyword,
    ...(bundle.iptcSubject === undefined ? {} : { iptcSubject: bundle.iptcSubject }),
    fingerprint: bundle.fingerprint,
    item: Object.freeze({
      title: bundle.item.title,
      url: bundle.item.url,
      ...(bundle.item.id === undefined ? {} : { id: bundle.item.id }),
      ...(bundle.item.summary === undefined ? {} : { summary: bundle.item.summary }),
      ...(bundle.item.published === undefined ? {} : { published: bundle.item.published }),
      ...(bundle.item.updated === undefined ? {} : { updated: bundle.item.updated }),
      ...(bundle.item.author === undefined ? {} : { author: bundle.item.author }),
      categories: bundle.item.categories,
    }),
    article: Object.freeze({
      title: bundle.article.title,
      slug: bundle.article.slug,
      author: bundle.article.author,
      date: bundle.article.date,
      ...(bundle.article.url === undefined ? {} : { url: bundle.article.url }),
      ...(bundle.article.section === undefined ? {} : { section: bundle.article.section }),
      ...(bundle.article.keywords === undefined ? {} : { keywords: bundle.article.keywords }),
      ...(bundle.article.categories === undefined ? {} : { categories: bundle.article.categories }),
      ...(bundle.article.tags === undefined ? {} : { tags: bundle.article.tags }),
    }),
    claims: Object.freeze([
      "title",
      "url",
      "summary",
      "published",
      "wire",
      "iptc_keyword",
      "source_url",
      "content_fingerprint",
    ]),
    charge: "potential",
    provenance: bundle.provenance,
  });
}

export function cableClaimBundle(
  wire: KoiosCableWire,
  source: KoiosCableSource,
  item: SyndicationItem,
  fetchedAt: Date,
): KoiosCableClaimBundle {
  const fingerprint = cableItemFingerprint(item);
  const entity = `koios:cable:${wire.name}:${fingerprint}`;
  const provenance = Object.freeze({
    witness: wire.name,
    sourceUrl: source.url,
    itemUrl: item.url,
    fetchedAt: fetchedAt.toISOString(),
    fingerprint,
  });
  const article = articleFromItem(wire, item, fingerprint, fetchedAt);
  const subject = topicSubject(wire.name) ?? undefined;
  const claims = Object.freeze([
    ["koios.news.cable.title", item.title],
    ["koios.news.cable.url", item.url],
    ["koios.news.cable.summary", item.summary ?? ""],
    ["koios.news.cable.published", item.published ?? item.updated ?? article.date],
    ["koios.news.cable.author", item.author ?? ""],
    ["koios.news.cable.wire", wire.name],
    ["koios.news.cable.iptc_keyword", wire.keyword],
    ...(subject === undefined ? [] : [["koios.news.cable.iptc_qcode", subject.code]]),
    ["koios.news.cable.source_url", source.url],
    [FINGERPRINT_ATTRIBUTE, fingerprint],
  ] as const);
  const memes = Object.freeze(claims.map(([predicate, object]) => claimMeme(entity, predicate, object, provenance)));
  const site = predicationSite(memes.map((item) => item.cell));
  return Object.freeze({
    kind: "koios.news.cable.claim-state-bundle" as const,
    entity,
    wire: wire.name,
    iptcKeyword: wire.keyword,
    ...(subject === undefined ? {} : { iptcSubject: subject }),
    fingerprint,
    article,
    item,
    memes,
    valuation: composeFibers(memes, site.base),
    provenance,
  });
}

function rowsFromBundle(bundle: KoiosCableClaimBundle, witnessedAt: Date): readonly EAVT[] {
  const t = witnessedAt.toISOString();
  const entity = bundle.entity;
  const rows: EAVT[] = [
    [entity, "koios.news.cable.kind", bundle.kind, t],
    [entity, "koios.news.cable.title", bundle.item.title, t],
    [entity, "koios.news.cable.url", bundle.item.url, t],
    [entity, "koios.news.cable.summary", bundle.item.summary ?? "", t],
    [entity, "koios.news.cable.published", bundle.item.published ?? bundle.item.updated ?? bundle.article.date, t],
    [entity, "koios.news.cable.author", bundle.item.author ?? "", t],
    [entity, "koios.news.cable.wire", bundle.wire, t],
    [entity, "koios.news.cable.iptc_keyword", bundle.iptcKeyword, t],
    [entity, "koios.news.cable.source_url", bundle.provenance.sourceUrl, t],
    [entity, "koios.news.cable.item_url", bundle.provenance.itemUrl, t],
    [entity, FINGERPRINT_ATTRIBUTE, bundle.fingerprint, t],
    [entity, "koios.news.cable.bundle", bundleJson(bundle), t],
  ];
  if (bundle.iptcSubject !== undefined) rows.push([entity, "koios.news.cable.iptc_qcode", bundle.iptcSubject.code, t]);
  for (const category of bundle.item.categories) rows.push([entity, "koios.news.cable.source_category", category, t]);
  return Object.freeze(rows);
}

async function readExistingFingerprints(storeRoot: string): Promise<ReadonlySet<string>> {
  const found = new Set<string>();
  async function walk(dir: string): Promise<void> {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = resolve(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith(".jsonl")) continue;
      const rows = parseEavt(await readFile(full, "utf8"));
      for (const [_, attribute, value] of rows) {
        if (attribute === FINGERPRINT_ATTRIBUTE && typeof value === "string") found.add(value);
      }
    }
  }
  await walk(resolve(storeRoot, "data/logs"));
  return found;
}

async function ingestSource(
  configPath: string,
  wire: KoiosCableWire,
  source: KoiosCableSource,
  storeRoot: string,
  now: Date,
  timeoutMs: number,
  onSkip: (message: string) => void,
): Promise<KoiosCableSourceResult> {
  const errors: string[] = [];
  try {
    const text = await sourceUrlText(source.url, configPath, timeoutMs);
    const items = parseSyndicationItems(text).slice(0, source.max ?? 50);
    const existing = new Set(await readExistingFingerprints(storeRoot));
    let projected = 0;
    let written = 0;
    let skipped = 0;
    let logPath: string | undefined;
    let statePath: string | undefined;
    for (const item of items) {
      const fingerprint = cableItemFingerprint(item);
      if (existing.has(fingerprint)) {
        skipped += 1;
        continue;
      }
      existing.add(fingerprint);
      const bundle = cableClaimBundle(wire, source, item, now);
      const receipt = appendWitnessesAtRoot(storeRoot, "ingest", rowsFromBundle(bundle, now), {
        at: now.toISOString(),
        subject: wire.name,
      });
      logPath = receipt.path;
      written += receipt.appended;
      skipped += receipt.appended === 0 ? 1 : 0;
      projected += 1;
    }
    if (logPath !== undefined) {
      statePath = projectLogPathState(logPath, FUNCTIONAL_ATTRIBUTES).path;
    }
    return Object.freeze({
      wire: wire.name,
      sourceUrl: source.url,
      fetched: items.length,
      projected,
      written,
      skipped,
      ...(logPath === undefined ? {} : { logPath }),
      ...(statePath === undefined ? {} : { statePath }),
      errors,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(message);
    onSkip(`${wire.name}: skipped ${source.url}: ${message}`);
    return Object.freeze({
      wire: wire.name,
      sourceUrl: source.url,
      fetched: 0,
      projected: 0,
      written: 0,
      skipped: 0,
      errors,
    });
  }
}

export async function ingestKoiosCable(options: KoiosCableIngestOptions = {}): Promise<readonly KoiosCableWireResult[]> {
  const configPath = resolve(options.configPath ?? defaultCableConfigPath);
  const storeDir = resolve(options.storeDir ?? defaultStoreDir);
  const config = await readKoiosCableConfig(configPath);
  const selected = options.wires === undefined ? undefined : new Set(options.wires);
  const now = options.now ?? new Date();
  const timeoutMs = options.fetchTimeoutMs ?? 20_000;
  const onSkip = options.onSkip ?? (() => {});
  const results: KoiosCableWireResult[] = [];
  for (const wire of config.newscable.wires) {
    if (selected !== undefined && !selected.has(wire.name)) continue;
    const storeRoot = resolve(storeDir, wire.name);
    const sources: KoiosCableSourceResult[] = [];
    for (const source of wire.sources) {
      sources.push(await ingestSource(configPath, wire, source, storeRoot, now, timeoutMs, onSkip));
    }
    results.push(Object.freeze({
      wire: wire.name,
      fetched: sources.reduce((sum, item) => sum + item.fetched, 0),
      projected: sources.reduce((sum, item) => sum + item.projected, 0),
      written: sources.reduce((sum, item) => sum + item.written, 0),
      skipped: sources.reduce((sum, item) => sum + item.skipped, 0),
      sources: Object.freeze(sources),
      errors: Object.freeze(sources.flatMap((item) => item.errors)),
    }));
  }
  return Object.freeze(results);
}

export function defaultCableConfigUrl(): string {
  return pathToFileURL(defaultCableConfigPath).href;
}
