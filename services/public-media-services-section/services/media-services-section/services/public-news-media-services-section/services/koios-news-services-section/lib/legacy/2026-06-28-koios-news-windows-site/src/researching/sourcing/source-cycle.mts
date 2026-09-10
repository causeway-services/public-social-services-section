// researching/sourcing/source-cycle — one Koios-owned source refresh plus farm
// tick. This is the operator-visible act that turns external feeds into local
// wire evidence, then lets the content farm assemble context and draft.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import process from "node:process";

import {
  createContentFarmService,
  contentFarmCandidateSnapshots,
  contentFarmCollisionPathSet,
  contentFarmRepairPacketsReading,
  contentFarmSourceCyclePlanFromDocument,
  contentFarmSourceCycleReading,
  farmCycleReading,
  normalizeContentFarmCandidateReferences,
  readContentFarmConfig,
  readContentFarmConfigDocument,
  sourceCycleCandidateDraftInternalLinkGuidance,
  sourceCycleDraftInternalLinkSuggestion,
  restoreContentFarmCandidateWriteCollisions,
  decodeFrontMatterDocument,
  encodeFrontMatterDocument,
  type ContentFarmCandidateState,
  type FarmCycle,
  type FarmCycleReading,
  type ContentFarmRepairPacket,
  type ContentFarmRepairPacketsReading,
  type ContentFarmRepairTask,
  type ContentFarmRepairTaskKind,
  type ContentFarmSourceCyclePlan,
  type ContentFarmSourceCycleReading,
  type ContentFarmSourceCycleWirePlan,
  type SourceCycleCandidateDraftInternalLinkGuidance,
  type SourceCycleCandidateReferenceNormalization,
  type SourceCycleCandidateWriteCollision,
  type ViewCountsReading,
  type FetchLike,
} from "@emsenn/organizing-a-content-farm";
import {
  ingestCableFromConfig,
} from "@emsenn/organizing-a-newscable";

import { DEFAULT_CONTENT_PRODUCTION_CONFIG } from "../../config.mjs";
import { loadPosts } from "../../content.mjs";
import { koiosMasthead } from "../../index.mjs";
import { koiosItems } from "../../surface.mjs";
import { draftInternalLinkGuidanceReading, type DraftInternalLinkSuggestion } from "../writing/editing/publishing/managing/circulating/index.mjs";
import {
  KOIOS_DEFAULT_LICENSE,
  KOIOS_DEFAULT_LICENSE_URL,
  KOIOS_DEFAULT_SYNDICATION_RIGHTS,
} from "../writing/editing/standards.mjs";

export type SourceWirePlan = ContentFarmSourceCycleWirePlan;
export type KoiosSourceCyclePlan = ContentFarmSourceCyclePlan;

export type KoiosSourceCycleReading = ContentFarmSourceCycleReading;

export type KoiosSourceCycleOptions = Readonly<{
  configPath?: string;
  fetchImpl?: FetchLike;
  env?: Readonly<Record<string, string | undefined>>;
  views?: ViewCountsReading;
  now?: () => string;
  onSkip?: (message: string) => void;
}>;

export type SourceCycleRepairTaskKind = ContentFarmRepairTaskKind;
export type SourceCycleRepairTask = ContentFarmRepairTask;
export type SourceCycleCandidateState = ContentFarmCandidateState;
export type SourceCycleRepairPacket = ContentFarmRepairPacket;
export type SourceCycleRepairPacketsReading = ContentFarmRepairPacketsReading;

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function stringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : fallback;
}

function strings(value: unknown): readonly string[] {
  if (value === undefined || value === null || value === "") return Object.freeze([]);
  if (Array.isArray(value)) return Object.freeze(value.flatMap((item) => strings(item)));
  return Object.freeze([String(value)]);
}

function manuscriptSlug(frontMatter: Readonly<Record<string, unknown>>, fallback: string): string {
  return typeof frontMatter["slug"] === "string" && frontMatter["slug"] !== "" ? frontMatter["slug"] : fallback;
}

function koiosFrontMatter(frontMatter: Readonly<Record<string, unknown>>): Readonly<Record<string, unknown>> {
  const value = frontMatter["koios"];
  return isRecord(value) ? value : Object.freeze({});
}

function candidateState(contentDir: string | undefined, slug: string): SourceCycleCandidateState {
  if (contentDir === undefined || slug === "") return Object.freeze({ status: "missing" as const });
  const path = join(contentDir, `${slug}.md`);
  if (!existsSync(path)) return Object.freeze({ status: "missing" as const, path });
  const document = decodeFrontMatterDocument(readFileSync(path, "utf8"));
  const title = stringValue(document.frontMatter["title"]);
  return Object.freeze({
    status: document.frontMatter["draft"] === true ? "draft" as const : "published" as const,
    path,
    ...(title === "" ? {} : { title }),
  });
}

export function sourceCycleRepairPacketsReading(input: Readonly<{
  runs: readonly unknown[];
  contentDir?: string;
  limit?: number;
}>): SourceCycleRepairPacketsReading {
  return contentFarmRepairPacketsReading({
    runs: input.runs,
    ...(input.limit === undefined ? {} : { limit: input.limit }),
    candidateState: (slug) => candidateState(input.contentDir, slug),
    constraints: Object.freeze([
      "This is a read-only operator backlog over farm run traces.",
      "Repair packets do not rewrite, publish, or silently normalize manuscripts.",
      "Intake sources remain research material; published citations remain CSL references in manuscript frontmatter and body links.",
      "A published candidate stays visible as historical friction but is not counted as open.",
    ]),
  });
}

export function normalizeCandidateReferences(path: string): SourceCycleCandidateReferenceNormalization {
  return normalizeContentFarmCandidateReferences({
    path,
    license: KOIOS_DEFAULT_LICENSE,
    licenseUrl: KOIOS_DEFAULT_LICENSE_URL,
    syndicationRights: KOIOS_DEFAULT_SYNDICATION_RIGHTS,
  });
}

function compactDraftLinkSuggestion(suggestion: DraftInternalLinkSuggestion): SourceCycleCandidateDraftInternalLinkGuidance["suggestions"][number] {
  return sourceCycleDraftInternalLinkSuggestion({
    targetSlug: suggestion.targetSlug,
    targetPath: suggestion.targetPath,
    targetHeadline: suggestion.targetHeadline,
    matchedTerms: suggestion.matchedTerms,
    confidence: suggestion.confidence,
    markdownLink: suggestion.markdownLink,
    writingGuidance: suggestion.writingGuidance,
  });
}

export function enrichCandidateDraftInternalLinkGuidance(path: string, contentDir = dirname(path)): SourceCycleCandidateDraftInternalLinkGuidance {
  const document = decodeFrontMatterDocument(readFileSync(path, "utf8"));
  const slug = manuscriptSlug(document.frontMatter, path.replace(/^.*\//, "").replace(/\.md$/, ""));
  const koios = koiosFrontMatter(document.frontMatter);
  const term = stringValue(koios["seo_term"]) || strings(document.frontMatter["keywords"])[0] || stringValue(document.frontMatter["title"], slug);
  const beat = stringValue(koios["beat"]);
  const tags = strings(document.frontMatter["tags"]);
  const posts = loadPosts(contentDir);
  const guidance = draftInternalLinkGuidanceReading({
    posts,
    items: koiosItems(posts, koiosMasthead()),
    term,
    ...(beat === "" ? {} : { beat }),
    tags,
    excludeSlugs: [slug],
    limit: 3,
  });
  const suggestions = Object.freeze(guidance.suggestions.map(compactDraftLinkSuggestion));
  const nextKoios = Object.freeze({
    ...koios,
    draft_internal_link_guidance: suggestions,
  });
  const changed = JSON.stringify(koios["draft_internal_link_guidance"] ?? []) !== JSON.stringify(suggestions);
  if (changed) {
    writeFileSync(path, encodeFrontMatterDocument({
      kind: "producing-content.frontmatter-document" as const,
      frontMatter: Object.freeze({
        ...document.frontMatter,
        koios: nextKoios,
      }),
      body: document.body.endsWith("\n") ? document.body : `${document.body}\n`,
    }), "utf8");
  }
  return sourceCycleCandidateDraftInternalLinkGuidance({
    slug,
    path,
    changed,
    suggestions,
  });
}

function normalizeCycleCandidateReferences(cycle: FarmCycle, collisions: ReadonlySet<string> = new Set()): readonly SourceCycleCandidateReferenceNormalization[] {
  const normalized: SourceCycleCandidateReferenceNormalization[] = [];
  for (const reading of cycle.readings) {
    const run = reading.run;
    if (run.kind !== "content.farm.cultivation:witness" || run.path === null) continue;
    if (collisions.has(resolve(run.path))) continue;
    normalized.push(normalizeCandidateReferences(run.path));
  }
  return Object.freeze(normalized);
}

function enrichCycleCandidateDraftInternalLinks(cycle: FarmCycle, collisions: ReadonlySet<string> = new Set()): readonly SourceCycleCandidateDraftInternalLinkGuidance[] {
  const enriched: SourceCycleCandidateDraftInternalLinkGuidance[] = [];
  for (const reading of cycle.readings) {
    const run = reading.run;
    if (run.kind !== "content.farm.cultivation:witness" || run.path === null) continue;
    if (collisions.has(resolve(run.path))) continue;
    enriched.push(enrichCandidateDraftInternalLinkGuidance(run.path));
  }
  return Object.freeze(enriched);
}

export function koiosSourceCyclePlan(options: Pick<KoiosSourceCycleOptions, "configPath"> = {}): KoiosSourceCyclePlan {
  const configPath = options.configPath ?? DEFAULT_CONTENT_PRODUCTION_CONFIG;
  const document = readContentFarmConfigDocument(configPath);
  return contentFarmSourceCyclePlanFromDocument({
    configPath,
    document,
    operator: Object.freeze({
      planUrl: "https://newsroom.koios.news/operators/source-cycle/plan.json",
      runUrl: "https://newsroom.koios.news/operators/source-cycle",
      publicationGate: "Draft candidates remain draft:true until the editing and publishing offices approve them.",
    }),
  });
}

export async function runKoiosSourceCycle(options: KoiosSourceCycleOptions = {}): Promise<KoiosSourceCycleReading> {
  const configPath = options.configPath ?? DEFAULT_CONTENT_PRODUCTION_CONFIG;
  const plan = koiosSourceCyclePlan({ configPath });
  const skippedMessages: string[] = [];
  const onSkip = (message: string): void => {
    skippedMessages.push(message);
    options.onSkip?.(message);
  };
  const cableResults = await ingestCableFromConfig(configPath, {
    ...(options.fetchImpl === undefined ? {} : { fetchImpl: options.fetchImpl }),
    onSkip,
  });
  const farmConfig = readContentFarmConfig(configPath);
  const snapshots = contentFarmCandidateSnapshots(farmConfig);
  const service = createContentFarmService(farmConfig, {
    ...(options.fetchImpl === undefined ? {} : { fetchImpl: options.fetchImpl }),
    env: options.env ?? process.env,
    ...(options.views === undefined ? {} : { views: options.views }),
    ...(options.now === undefined ? {} : { now: options.now }),
  });
  const cycle = await service.tick();
  const candidateWriteCollisions = restoreContentFarmCandidateWriteCollisions(cycle, snapshots, {
    instruction: "The farm attempted to write a draft candidate at an existing manuscript path. Koios restored the existing manuscript; create a new assignment or unique draft slug before writing this candidate.",
  });
  const collisionPaths = contentFarmCollisionPathSet(candidateWriteCollisions);
  const candidateReferences = normalizeCycleCandidateReferences(cycle, collisionPaths);
  const candidateDraftInternalLinkGuidance = enrichCycleCandidateDraftInternalLinks(cycle, collisionPaths);
  const farm = farmCycleReading(cycle);
  return contentFarmSourceCycleReading({
    generatedAt: (options.now ?? (() => new Date().toISOString()))(),
    plan,
    cable: {
      wireCount: cableResults.length,
      written: cableResults.reduce((sum, result) => sum + result.written, 0),
      skipped: cableResults.reduce((sum, result) => sum + result.skipped, 0),
      errorCount: cableResults.reduce((sum, result) => sum + result.errors.length, 0),
      results: cableResults,
      skippedMessages,
    },
    farm,
    candidateWriteCollisions,
    candidateReferences,
    candidateDraftInternalLinkGuidance,
    editorialPolicy: {
      record: "draft-candidate" as const,
      publication: "manual-standards-gate" as const,
      note: "The source cycle can write draft candidates and run traces; Koios normalizes candidate citation metadata to CSL references and annotates drafts with same-site link guidance, but publishing remains a separate standards-gated newsroom action.",
    },
  });
}
