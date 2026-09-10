import { readdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  charge,
  chargeValue,
  chargeValueName,
  mark,
  valueOf,
  type ChargeValueName,
  type JsonValue,
} from "@emsenn/metroplat";
import { parse as parseEavt, type EAVT } from "@emsenn/metroplat/codecs/text/json/jsonl/eavt";
import {
  appendWitnessesAtRoot,
  projectLogPathState,
} from "@emsenn/metroplat/services/filesystem-store";

import { type KoiosPost } from "./content.mjs";
import {
  DEFAULT_DATA_DIR,
  DEFAULT_DEMAND_RECORD,
  demandTable,
  type DemandEntry,
} from "./demand.mjs";
import { normalizeTerm } from "./demand.mjs";
import { type ViewCounts } from "./views.mjs";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const DEFAULT_DESK_DATA_DIR = DEFAULT_DATA_DIR;
export const DEFAULT_CABLE_STORE_DIR = resolve(packageRoot, "store");

const DESK_FEED = "koios-desk";
const ATTR_KIND = "koios.news.desk.kind";
const ATTR_SLUG = "koios.news.desk.slug";
const ATTR_TITLE = "koios.news.desk.title";
const ATTR_SUMMARY = "koios.news.desk.summary";
const ATTR_SOURCE = "koios.news.desk.source";
const ATTR_BEAT = "koios.news.desk.beat";
const ATTR_IDENTITY = "koios.news.desk.identity";
const ATTR_CHARGE = "koios.news.desk.charge";
const ATTR_METROPLAT_CHARGE = "koios.news.desk.metroplat_charge";
const ATTR_CANDIDATE = "koios.news.desk.candidate";
const CABLE_BUNDLE_ATTR = "koios.news.cable.bundle";

export type DeskItemCharge = "open" | "settled" | "contested";
export type DeskCandidateSource = "demand" | "wire";

export type DeskCandidate = Readonly<{
  source: DeskCandidateSource;
  slug: string;
  identity: string;
  title: string;
  summary: string;
  beat?: string;
  demand?: DemandEntry;
  wire?: Readonly<{
    entity: string;
    wire: string;
    url: string;
    sourceUrl?: string;
    fingerprint?: string;
    published?: string;
  }>;
}>;

export type DeskWorkItem = Readonly<{
  kind: "koios.news.desk.work-item";
  slug: string;
  identity: string;
  title: string;
  summary: string;
  source: DeskCandidateSource;
  charge: DeskItemCharge;
  metroplatCharge: ChargeValueName;
  beat?: string;
  demand?: Readonly<{
    term: string;
    rank: number;
    score: number;
    priority: number;
    normalizedTerm: string;
  }>;
  wire?: DeskCandidate["wire"];
  positedAt: string;
}>;

export type DeskQueue = Readonly<{
  kind: "koios.news.desk.queue";
  generatedAt: string;
  store: "koios-desk";
  open: readonly DeskWorkItem[];
  counts: Readonly<{
    open: number;
    demand: number;
    wire: number;
  }>;
  primitives: readonly string[];
}>;

export type DeskRunResult = Readonly<{
  kind: "koios.news.desk.run";
  at: string;
  candidates: number;
  posited: number;
  skippedExistingPost: number;
  skippedOpenItem: number;
  logPath?: string;
  statePath?: string;
  queue: DeskQueue;
}>;

type DemandRecord = Readonly<{
  demand?: readonly DemandEntry[];
}>;

type CableBundle = Readonly<{
  entity?: string;
  wire?: string;
  fingerprint?: string;
  item?: Readonly<{
    title?: string;
    url?: string;
    summary?: string;
    published?: string;
  }>;
  article?: Readonly<{
    slug?: string;
    title?: string;
    section?: string;
  }>;
  provenance?: Readonly<{
    sourceUrl?: string;
    itemUrl?: string;
  }>;
}>;

function text(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function record(value: unknown): Readonly<Record<string, unknown>> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Readonly<Record<string, unknown>>
    : Object.freeze({});
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

function jsonValue(value: unknown): JsonValue {
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return Object.freeze(value.map(jsonValue));
  const source = record(value);
  return Object.freeze(Object.fromEntries(Object.entries(source).map(([key, item]) => [key, jsonValue(item)])));
}

function postSlugs(posts: readonly KoiosPost[]): ReadonlySet<string> {
  return new Set(posts.map((post) => post.slug));
}

function postReferenceUrls(posts: readonly KoiosPost[]): ReadonlySet<string> {
  return new Set(posts.flatMap((post) => post.frontMatter.references.map((reference) => reference.URL)));
}

function postClaimedTerms(posts: readonly KoiosPost[]): ReadonlySet<string> {
  return new Set(posts.flatMap((post) => [
    post.frontMatter.koios.seo_term,
    ...post.frontMatter.keywords,
    ...post.frontMatter.tags,
  ].flatMap((term) => term === undefined ? [] : [normalizeTerm(term)]).filter(Boolean)));
}

async function readJsonIfExists(path: string): Promise<unknown | null> {
  try {
    return JSON.parse(await readFile(path, "utf8")) as unknown;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") return null;
    throw error;
  }
}

async function demandRows(input: Readonly<{
  posts: readonly KoiosPost[];
  views: ViewCounts;
  demandRecordPath?: string;
}>): Promise<readonly DemandEntry[]> {
  const value = await readJsonIfExists(input.demandRecordPath ?? DEFAULT_DEMAND_RECORD);
  const rows = Array.isArray((value as DemandRecord | null)?.demand)
    ? (value as DemandRecord).demand!
    : demandTable({ posts: input.posts, views: input.views });
  return Object.freeze(rows);
}

async function filesUnder(dir: string, suffix: string): Promise<readonly string[]> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return Object.freeze([]);
  }
  const files: string[] = [];
  for (const entry of entries) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) files.push(...await filesUnder(full, suffix));
    else if (entry.isFile() && entry.name.endsWith(suffix)) files.push(full);
  }
  return Object.freeze(files.sort());
}

async function eavtRowsUnder(dir: string): Promise<readonly EAVT[]> {
  const rows: EAVT[] = [];
  for (const file of await filesUnder(dir, ".jsonl")) {
    rows.push(...parseEavt(await readFile(file, "utf8")));
  }
  return Object.freeze(rows);
}

async function eavtRowsUnderAny(dirs: readonly string[]): Promise<readonly EAVT[]> {
  const rows: EAVT[] = [];
  for (const dir of dirs) rows.push(...await eavtRowsUnder(dir));
  return Object.freeze(rows);
}

function asCableBundle(value: unknown): CableBundle | null {
  const bundle = record(value);
  if (bundle["kind"] !== "koios.news.cable.claim-state-bundle") return null;
  const entity = text(bundle["entity"]);
  const wire = text(bundle["wire"]);
  const item = record(bundle["item"]);
  const article = record(bundle["article"]);
  const provenance = record(bundle["provenance"]);
  const title = text(item["title"]) ?? text(article["title"]);
  const url = text(item["url"]) ?? text(provenance["itemUrl"]);
  const articleSlug = text(article["slug"]);
  if (entity === undefined || wire === undefined || title === undefined || url === undefined || articleSlug === undefined) return null;
  return Object.freeze({
    entity,
    wire,
    ...(text(bundle["fingerprint"]) === undefined ? {} : { fingerprint: text(bundle["fingerprint"])! }),
    item: Object.freeze({
      title,
      url,
      ...(text(item["summary"]) === undefined ? {} : { summary: text(item["summary"])! }),
      ...(text(item["published"]) === undefined ? {} : { published: text(item["published"])! }),
    }),
    article: Object.freeze({
      slug: articleSlug,
      title,
      ...(text(article["section"]) === undefined ? {} : { section: text(article["section"])! }),
    }),
    provenance: Object.freeze({
      ...(text(provenance["sourceUrl"]) === undefined ? {} : { sourceUrl: text(provenance["sourceUrl"])! }),
      itemUrl: url,
    }),
  });
}

function wireCandidate(bundle: CableBundle): DeskCandidate | null {
  const item = bundle.item;
  const article = bundle.article;
  const entity = bundle.entity;
  const wire = bundle.wire;
  if (item === undefined || article === undefined || entity === undefined || wire === undefined) return null;
  const title = item.title ?? article.title;
  const url = item.url ?? bundle.provenance?.itemUrl;
  const articleSlug = article.slug;
  if (title === undefined || url === undefined || articleSlug === undefined) return null;
  return Object.freeze({
    source: "wire" as const,
    slug: articleSlug,
    identity: articleSlug,
    title,
    summary: item.summary ?? "",
    ...(article.section === undefined ? {} : { beat: article.section }),
    wire: Object.freeze({
      entity,
      wire,
      url,
      ...(bundle.provenance?.sourceUrl === undefined ? {} : { sourceUrl: bundle.provenance.sourceUrl }),
      ...(bundle.fingerprint === undefined ? {} : { fingerprint: bundle.fingerprint }),
      ...(item.published === undefined ? {} : { published: item.published }),
    }),
  });
}

async function wireCandidates(storeDir: string): Promise<readonly DeskCandidate[]> {
  const rows = await eavtRowsUnder(storeDir);
  const bundles = new Map<string, CableBundle>();
  for (const [entity, attribute, value] of rows) {
    if (attribute !== CABLE_BUNDLE_ATTR || typeof entity !== "string") continue;
    const bundle = asCableBundle(value);
    if (bundle !== null) bundles.set(entity, bundle);
  }
  return Object.freeze([...bundles.values()]
    .flatMap((bundle) => {
      const candidate = wireCandidate(bundle);
      return candidate === null ? [] : [candidate];
    })
    .sort((left, right) => left.slug.localeCompare(right.slug)));
}

function demandCandidate(row: DemandEntry): DeskCandidate | null {
  if (row.covered > 0 || row.score <= 0) return null;
  const title = row.term;
  return Object.freeze({
    source: "demand" as const,
    slug: slug(row.term),
    identity: slug(row.term),
    title,
    summary: `Uncovered Koios demand term: ${row.term}.`,
    beat: row.beat,
    demand: row,
  });
}

export async function withheldCandidates(input: Readonly<{
  posts: readonly KoiosPost[];
  views: ViewCounts;
  demandRecordPath?: string;
  cableStoreDir?: string;
}>): Promise<readonly DeskCandidate[]> {
  const demand = (await demandRows(input)).flatMap((row) => {
    const candidate = demandCandidate(row);
    return candidate === null ? [] : [candidate];
  });
  const wires = await wireCandidates(input.cableStoreDir ?? DEFAULT_CABLE_STORE_DIR);
  const slugs = postSlugs(input.posts);
  const urls = postReferenceUrls(input.posts);
  const terms = postClaimedTerms(input.posts);
  const candidates = [...demand, ...wires].filter((candidate) => {
    if (slugs.has(candidate.slug)) return false;
    if (candidate.demand !== undefined && terms.has(candidate.demand.normalizedTerm)) return false;
    const url = candidate.wire?.url;
    return url === undefined || !urls.has(url);
  });
  const bySlug = new Map<string, DeskCandidate>();
  for (const candidate of candidates) {
    if (!bySlug.has(candidate.slug)) bySlug.set(candidate.slug, candidate);
  }
  return Object.freeze([...bySlug.values()].sort((left, right) =>
    left.source.localeCompare(right.source) || left.slug.localeCompare(right.slug)));
}

function openCharge(slugValue: string): ChargeValueName {
  const carrier = charge(chargeValue("potential"), [[mark({ kind: "koios.news.desk.posited", slug: slugValue })], []]);
  return chargeValueName(valueOf(carrier));
}

function rowsFromCandidate(candidate: DeskCandidate, at: string): readonly EAVT[] {
  const entity = `koios:desk:${candidate.slug}`;
  const metroplatCharge = openCharge(candidate.slug);
  const rows: EAVT[] = [
    [entity, ATTR_KIND, "koios.news.desk.work-item", at],
    [entity, ATTR_SLUG, candidate.slug, at],
    [entity, ATTR_IDENTITY, candidate.identity, at],
    [entity, ATTR_TITLE, candidate.title, at],
    [entity, ATTR_SUMMARY, candidate.summary, at],
    [entity, ATTR_SOURCE, candidate.source, at],
    [entity, ATTR_CHARGE, "open", at],
    [entity, ATTR_METROPLAT_CHARGE, metroplatCharge, at],
    [entity, ATTR_CANDIDATE, jsonValue(candidate), at],
  ];
  if (candidate.beat !== undefined) rows.push([entity, ATTR_BEAT, candidate.beat, at]);
  return Object.freeze(rows);
}

function rowTime(row: EAVT): string {
  return typeof row[3] === "string" ? row[3] : "";
}

function latestByEntity(rows: readonly EAVT[]): ReadonlyMap<string, Map<string, { value: JsonValue; time: string }>> {
  const state = new Map<string, Map<string, { value: JsonValue; time: string }>>();
  for (const [entity, attribute, value, time] of rows) {
    if (typeof entity !== "string" || typeof attribute !== "string") continue;
    if (!attribute.startsWith("koios.news.desk.")) continue;
    const bucket = state.get(entity) ?? new Map<string, { value: JsonValue; time: string }>();
    const t = typeof time === "string" ? time : String(time);
    const existing = bucket.get(attribute);
    if (existing === undefined || t >= existing.time) bucket.set(attribute, { value, time: t });
    state.set(entity, bucket);
  }
  return state;
}

function candidateFromValue(value: JsonValue): DeskCandidate | null {
  const source = record(value);
  const kind = source["source"];
  const slugValue = text(source["slug"]);
  const identity = text(source["identity"]);
  const title = text(source["title"]);
  const summary = text(source["summary"]);
  if ((kind !== "demand" && kind !== "wire") || slugValue === undefined || identity === undefined || title === undefined || summary === undefined) {
    return null;
  }
  const demand = record(source["demand"]);
  const wire = record(source["wire"]);
  return Object.freeze({
    source: kind,
    slug: slugValue,
    identity,
    title,
    summary,
    ...(text(source["beat"]) === undefined ? {} : { beat: text(source["beat"])! }),
    ...(kind === "demand" ? {
      demand: Object.freeze({
        beat: text(demand["beat"]) ?? "",
        term: text(demand["term"]) ?? title,
        priority: numberValue(demand["priority"]) ?? 0,
        rank: numberValue(demand["rank"]) ?? 0,
        normalizedTerm: text(demand["normalizedTerm"]) ?? normalizeTerm(title),
        score: numberValue(demand["score"]) ?? 0,
        baseScore: numberValue(demand["baseScore"]) ?? 0,
        earnedViews: numberValue(demand["earnedViews"]) ?? 0,
        searchConsoleClicks: numberValue(demand["searchConsoleClicks"]) ?? 0,
        searchConsoleImpressions: numberValue(demand["searchConsoleImpressions"]) ?? 0,
        covered: numberValue(demand["covered"]) ?? 0,
        coverageDecay: numberValue(demand["coverageDecay"]) ?? 1,
        decayed: demand["decayed"] === true,
        evidence: Object.freeze([]),
      }) as DemandEntry,
    } : {}),
    ...(kind === "wire" ? {
      wire: Object.freeze({
        entity: text(wire["entity"]) ?? "",
        wire: text(wire["wire"]) ?? "",
        url: text(wire["url"]) ?? "",
        ...(text(wire["sourceUrl"]) === undefined ? {} : { sourceUrl: text(wire["sourceUrl"])! }),
        ...(text(wire["fingerprint"]) === undefined ? {} : { fingerprint: text(wire["fingerprint"])! }),
        ...(text(wire["published"]) === undefined ? {} : { published: text(wire["published"])! }),
      }),
    } : {}),
  });
}

function workItemFromState(entity: string, fields: ReadonlyMap<string, { value: JsonValue; time: string }>): DeskWorkItem | null {
  if (fields.get(ATTR_KIND)?.value !== "koios.news.desk.work-item") return null;
  const chargeState = fields.get(ATTR_CHARGE)?.value;
  if (chargeState !== "open" && chargeState !== "settled" && chargeState !== "contested") return null;
  const slugValue = text(fields.get(ATTR_SLUG)?.value) ?? entity.replace(/^koios:desk:/u, "");
  const candidate = candidateFromValue(fields.get(ATTR_CANDIDATE)?.value ?? null);
  const source = candidate?.source ?? (fields.get(ATTR_SOURCE)?.value === "wire" ? "wire" : "demand");
  const metroplatCharge = text(fields.get(ATTR_METROPLAT_CHARGE)?.value);
  return Object.freeze({
    kind: "koios.news.desk.work-item" as const,
    slug: slugValue,
    identity: text(fields.get(ATTR_IDENTITY)?.value) ?? slugValue,
    title: text(fields.get(ATTR_TITLE)?.value) ?? candidate?.title ?? slugValue,
    summary: text(fields.get(ATTR_SUMMARY)?.value) ?? candidate?.summary ?? "",
    source,
    charge: chargeState,
    metroplatCharge: metroplatCharge === "absurd" || metroplatCharge === "potential" || metroplatCharge === "active" || metroplatCharge === "stable"
      ? metroplatCharge
      : chargeState === "contested" ? "stable" : "potential",
    ...(text(fields.get(ATTR_BEAT)?.value) === undefined ? {} : { beat: text(fields.get(ATTR_BEAT)?.value)! }),
    ...(candidate?.demand === undefined ? {} : {
      demand: Object.freeze({
        term: candidate.demand.term,
        rank: candidate.demand.rank,
        score: candidate.demand.score,
        priority: candidate.demand.priority,
        normalizedTerm: candidate.demand.normalizedTerm,
      }),
    }),
    ...(candidate?.wire === undefined ? {} : { wire: candidate.wire }),
    positedAt: [...fields.values()].map((item) => item.time).sort().at(0) ?? rowTime(["", "", "", ""]),
  });
}

export async function projectDeskQueue(dataDir = DEFAULT_DESK_DATA_DIR, now = new Date()): Promise<DeskQueue> {
  const rows = await eavtRowsUnderAny([resolve(dataDir, "data/logs")]);
  const items = [...latestByEntity(rows).entries()]
    .flatMap(([entity, fields]) => {
      const item = workItemFromState(entity, fields);
      return item === null || item.charge !== "open" ? [] : [item];
    })
    .sort((left, right) =>
      left.source.localeCompare(right.source) ||
      (left.demand?.rank ?? Number.MAX_SAFE_INTEGER) - (right.demand?.rank ?? Number.MAX_SAFE_INTEGER) ||
      left.slug.localeCompare(right.slug));
  return Object.freeze({
    kind: "koios.news.desk.queue" as const,
    generatedAt: now.toISOString(),
    store: DESK_FEED,
    open: Object.freeze(items),
    counts: Object.freeze({
      open: items.length,
      demand: items.filter((item) => item.source === "demand").length,
      wire: items.filter((item) => item.source === "wire").length,
    }),
    primitives: Object.freeze([
      "@emsenn/metroplat/services/filesystem-store.appendWitnessesAtRoot",
      "@emsenn/metroplat/services/filesystem-store.projectLogPathState",
      "@emsenn/metroplat/codecs/text/json/jsonl/eavt",
      "@emsenn/metroplat/calculus/predicating/positing.charge",
      "@emsenn/metroplat/calculus/predicating/positing.chargeValue",
      "@emsenn/metroplat/calculus/predicating/positing.valueOf",
    ]),
  });
}

export async function runDesk(input: Readonly<{
  posts: readonly KoiosPost[];
  views: ViewCounts;
  dataDir?: string;
  cableStoreDir?: string;
  demandRecordPath?: string;
  now?: Date;
}>): Promise<DeskRunResult> {
  const at = (input.now ?? new Date()).toISOString();
  const dataDir = resolve(input.dataDir ?? DEFAULT_DESK_DATA_DIR);
  const candidates = await withheldCandidates({
    posts: input.posts,
    views: input.views,
    cableStoreDir: input.cableStoreDir,
    demandRecordPath: input.demandRecordPath,
  });
  const existingSlugs = postSlugs(input.posts);
  const openSlugs = new Set((await projectDeskQueue(dataDir, input.now ?? new Date())).open.map((item) => item.slug));
  const rows: EAVT[] = [];
  let positedItems = 0;
  let skippedExistingPost = 0;
  let skippedOpenItem = 0;
  for (const candidate of candidates) {
    if (existingSlugs.has(candidate.slug)) {
      skippedExistingPost += 1;
      continue;
    }
    if (openSlugs.has(candidate.slug)) {
      skippedOpenItem += 1;
      continue;
    }
    rows.push(...rowsFromCandidate(candidate, at));
    positedItems += 1;
  }
  const receipt = appendWitnessesAtRoot(dataDir, "posit", rows, { at, subject: "koios-desk" });
  const state = receipt.appended > 0
    ? projectLogPathState(receipt.path, [
      ATTR_KIND,
      ATTR_SLUG,
      ATTR_IDENTITY,
      ATTR_TITLE,
      ATTR_SUMMARY,
      ATTR_SOURCE,
      ATTR_BEAT,
      ATTR_CHARGE,
      ATTR_METROPLAT_CHARGE,
      ATTR_CANDIDATE,
    ])
    : undefined;
  const queue = await projectDeskQueue(dataDir, input.now ?? new Date());
  return Object.freeze({
    kind: "koios.news.desk.run" as const,
    at,
    candidates: candidates.length,
    posited: receipt.appended === 0 ? 0 : positedItems,
    skippedExistingPost,
    skippedOpenItem,
    ...(receipt.appended === 0 ? {} : { logPath: receipt.path }),
    ...(state === undefined ? {} : { statePath: state.path }),
    queue,
  });
}
