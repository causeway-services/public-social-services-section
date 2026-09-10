// Koios-owned post-publication correction transaction.
//
// Opening a correction withdraws the exact manuscript from publication and
// invalidates its prior editorial acceptance. Closing is possible only after
// the corrected bytes have independently passed the ordinary exact-digest
// editorial and publication gates and every declared public carrier has been
// rebuilt and witnessed.

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

import { decodeFrontMatterDocument, encodeFrontMatterDocument, type FrontMatterDocument, type FrontMatterRecord } from "@red-cup-engineering/organizing-a-content-farm";

import { buildStaticPublication, verifyStaticPublication, type StaticShadowArtifact } from "../administrating/deploying/static-shadow.mts";
import { latestLivePublicationWitness } from "../administrating/deploying/live-publication-witness.mts";
import { DEFAULT_CORRECTION_AFFECTED_SURFACES, type CorrectionKind } from "../researching/writing/editing/publishing/managing/circulating/corrections.mts";
import { reviewPublicationAdmission } from "../researching/writing/editing/standards.mts";
import { appendKoiosAct, recordDigest, type JsonObject } from "./ledger.mts";

export type OpenCorrectionInput = Readonly<{
  slug: string;
  kind: CorrectionKind;
  correctedAt: string;
  summary: string;
  details?: string;
  correctedBody?: string;
  replacements?: readonly Readonly<{ from: string; to: string }>[];
  expectedManuscriptDigest?: string;
  affectedSurfaces?: readonly string[];
  trigger: Readonly<{
    act: "source-claim.superseded" | "source-claim.withdrawn" | "claim.narrowed";
    evidenceDigest: string;
    reason: string;
    sourceSubjects?: readonly string[];
    claimIds?: readonly string[];
  }>;
  priorManifestDigest: string;
  priorRouteDigests: Readonly<Record<string, string>>;
  contentDir?: string;
  dataDir?: string;
}>;

export type OpenCorrectionResult = Readonly<{
  correctionId: string;
  slug: string;
  path: string;
  priorManuscriptDigest: string;
  correctedDraftDigest: string;
  affectedSurfaces: readonly string[];
  triggerActDigest: string;
  priorManifestDigest: string;
}>;

export type CloseCorrectionInput = Readonly<{
  slug: string;
  correctionId: string;
  closedAt: string;
  outputDir: string;
  contentDir?: string;
  dataDir?: string;
}>;

export type AmendCorrectionInput = Readonly<{
  slug: string;
  correctionId: string;
  amendedAt: string;
  summary: string;
  details?: string;
  contentDir?: string;
  dataDir?: string;
}>;

export type ReopenCorrectionInput = Readonly<{
  slug: string;
  correctionId: string;
  reopenedAt: string;
  reason: string;
  replacements: readonly Readonly<{ from: string; to: string }>[];
  contentDir?: string;
  dataDir?: string;
}>;

export type CloseCorrectionResult = Readonly<{
  correctionId: string;
  slug: string;
  manuscriptDigest: string;
  editorialAcceptanceDigest: string;
  triggerActDigest: string;
  priorManifestDigest: string;
  manifestDigest: string;
  routeDigests: Readonly<Record<string, string>>;
  routeChanges: Readonly<Record<string, Readonly<{ relation: "changed" | "semantically-witnessed-byte-unchanged"; before?: string; after: string; reason?: string }>>>;
}>;

type CorrectionMetadata = Readonly<{
  id: string;
  kind: CorrectionKind;
  corrected_at: string;
  summary: string;
  details?: string;
  affected_surfaces: readonly string[];
  body_requirements?: Readonly<{ must_include: readonly string[]; must_not_include: readonly string[] }>;
  trigger_act_digest: string;
  trigger_evidence_digest: string;
  prior_manifest_digest: string;
  prior_route_digests: readonly Readonly<{ route: string; digest: string }>[];
}>;

const KINDS: ReadonlySet<string> = new Set(["correction", "clarification", "update", "retraction"]);

function validInstant(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/u.test(value) && !Number.isNaN(Date.parse(value));
}

function nonempty(value: string, field: string): string {
  const result = value.trim();
  if (result === "") throw new Error(`${field} must not be empty`);
  return result;
}

function requiredDigest(value: string, field: string): string {
  if (!/^sha256:[a-f0-9]{64}$/u.test(value)) throw new Error(`${field} must be a canonical sha256 digest`);
  return value;
}

function manuscriptPath(contentDir: string, slug: string): string {
  const found = readdirSync(contentDir)
    .filter((name) => name.endsWith(".md") && !name.startsWith("_"))
    .map((name) => join(contentDir, name))
    .find((path) => {
      const document = decodeFrontMatterDocument(readFileSync(path, "utf8"));
      return String(document.frontMatter["slug"] ?? basename(path).replace(/\.md$/u, "")) === slug;
    });
  if (found === undefined) throw new Error(`no such manuscript: ${slug}`);
  return found;
}

function record(value: unknown): Readonly<Record<string, unknown>> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Readonly<Record<string, unknown>>
    : Object.freeze({});
}

function corrections(document: FrontMatterDocument): readonly Readonly<Record<string, unknown>>[] {
  const direct = document.frontMatter["corrections"];
  const namespaced = record(document.frontMatter["koios"])["corrections"];
  const raw = Array.isArray(direct) ? direct : Array.isArray(namespaced) ? namespaced : [];
  return Object.freeze(raw.flatMap((entry) => entry !== null && typeof entry === "object" && !Array.isArray(entry)
    ? [entry as Readonly<Record<string, unknown>>]
    : []));
}

function admittedSurfaces(values: readonly string[] | undefined): readonly string[] {
  const surfaces = Object.freeze([...new Set((values ?? DEFAULT_CORRECTION_AFFECTED_SURFACES).map((value) => value.trim().toLowerCase()).filter(Boolean))]);
  const missing = DEFAULT_CORRECTION_AFFECTED_SURFACES.filter((surface) => !surfaces.includes(surface));
  if (missing.length > 0) throw new Error(`correction propagation omits required surfaces: ${missing.join(", ")}`);
  return surfaces;
}

function correctionId(slug: string, correctedAt: string, summary: string): string {
  const suffix = recordDigest({ slug, correctedAt, summary }).replace(/^sha256:/u, "").slice(0, 12);
  return `${slug}-correction-${correctedAt.slice(0, 10)}-${suffix}`;
}

function applyReplacements(body: string, replacements: readonly Readonly<{ from: string; to: string }>[]): Readonly<{
  body: string;
  count: number;
  requirements?: Readonly<{ must_include: readonly string[]; must_not_include: readonly string[] }>;
}> {
  let correctedBody = body;
  let count = 0;
  for (const replacement of replacements) {
    const from = nonempty(replacement.from, "replacement.from");
    const to = nonempty(replacement.to, "replacement.to");
    if (from === to) throw new Error("correction replacement must change the body");
    const occurrences = correctedBody.split(from).length - 1;
    if (occurrences === 0) throw new Error(`correction replacement target is absent: ${JSON.stringify(from)}`);
    correctedBody = correctedBody.split(from).join(to);
    count += occurrences;
  }
  return Object.freeze({
    body: correctedBody,
    count,
    ...(replacements.length === 0 ? {} : { requirements: Object.freeze({
      must_include: Object.freeze([...new Set(replacements.map(({ to }) => to))]),
      must_not_include: Object.freeze([...new Set(replacements.map(({ from }) => from))]),
    }) }),
  });
}

export async function openCorrection(input: OpenCorrectionInput): Promise<OpenCorrectionResult> {
  if (!KINDS.has(input.kind)) throw new Error(`unadmitted correction kind: ${input.kind}`);
  if (!validInstant(input.correctedAt)) throw new Error(`correction requires an explicit UTC instant: ${input.correctedAt}`);
  const summary = nonempty(input.summary, "summary");
  const details = input.details === undefined ? undefined : nonempty(input.details, "details");
  const contentDir = resolve(input.contentDir ?? "content/posts");
  const dataDir = resolve(input.dataDir ?? "data");
  const admission = reviewPublicationAdmission(contentDir, input.slug);
  if (!admission.publishable) throw new Error(`correction can open only against a currently exact-admitted public article: ${input.slug}`);
  if (input.expectedManuscriptDigest !== undefined && input.expectedManuscriptDigest !== admission.manuscriptDigest) {
    throw new Error(`manuscript digest changed before correction opened: expected ${input.expectedManuscriptDigest}, found ${admission.manuscriptDigest}`);
  }
  const path = manuscriptPath(contentDir, input.slug);
  const document = decodeFrontMatterDocument(readFileSync(path, "utf8"));
  if (input.correctedBody !== undefined && input.replacements !== undefined) {
    throw new Error("correction must supply either correctedBody or deterministic replacements, not both");
  }
  const replacement = applyReplacements(input.correctedBody ?? document.body, input.replacements ?? []);
  const correctedBody = replacement.body;
  const replacementCount = replacement.count;
  const existing = corrections(document);
  const id = correctionId(input.slug, input.correctedAt, summary);
  if (existing.some((entry) => entry["id"] === id)) throw new Error(`correction already exists: ${id}`);
  const affectedSurfaces = admittedSurfaces(input.affectedSurfaces);
  const triggerReason = nonempty(input.trigger.reason, "trigger.reason");
  const triggerEvidenceDigest = requiredDigest(input.trigger.evidenceDigest, "trigger.evidenceDigest");
  const sourceSubjects = Object.freeze([...new Set(input.trigger.sourceSubjects ?? [])].map((value) => nonempty(value, "trigger.sourceSubject")));
  const claimIds = Object.freeze([...new Set(input.trigger.claimIds ?? [])].map((value) => nonempty(value, "trigger.claimId")));
  if (sourceSubjects.length === 0 && claimIds.length === 0) throw new Error("correction trigger must name an affected source subject or newsroom claim ID");
  const priorManifestDigest = requiredDigest(input.priorManifestDigest, "priorManifestDigest");
  const priorRouteDigests = Object.freeze(Object.fromEntries(Object.entries(input.priorRouteDigests).map(([route, value]) => [nonempty(route, "prior route"), requiredDigest(value, `prior route digest ${route}`)])));
  const triggerAct = await appendKoiosAct({
    dataRoot: dataDir,
    ledger: "source-claims",
    instant: input.correctedAt,
    act: input.trigger.act,
    subject: id,
    data: {
      slug: input.slug,
      reason: triggerReason,
      triggerEvidenceDigest,
      sourceSubjects,
      claimIds,
      priorManuscriptDigest: admission.manuscriptDigest,
      priorManifestDigest,
    },
  });
  const triggerActDigest = String(triggerAct["recordDigest"]);
  const metadata: CorrectionMetadata = Object.freeze({
    id,
    kind: input.kind,
    corrected_at: input.correctedAt,
    summary,
    ...(details === undefined ? {} : { details }),
    affected_surfaces: affectedSurfaces,
    ...(replacement.requirements === undefined ? {} : { body_requirements: replacement.requirements }),
    trigger_act_digest: triggerActDigest,
    trigger_evidence_digest: triggerEvidenceDigest,
    prior_manifest_digest: priorManifestDigest,
    prior_route_digests: Object.freeze(Object.entries(priorRouteDigests).map(([route, digest]) => Object.freeze({ route, digest }))),
  });
  const priorKoios = record(document.frontMatter["koios"]);
  const frontMatter: FrontMatterRecord = Object.freeze({
    ...document.frontMatter,
    corrections: Object.freeze([...existing, metadata]),
    draft: true,
    koios: Object.freeze({ ...priorKoios, gates_clear: false }),
  });
  writeFileSync(path, encodeFrontMatterDocument(Object.freeze({
    kind: "producing-content.frontmatter-document" as const,
    frontMatter,
    body: correctedBody,
  })), "utf8");
  const correctedDraftDigest = reviewPublicationAdmission(contentDir, input.slug).manuscriptDigest;
  await appendKoiosAct({
    dataRoot: dataDir,
    ledger: "corrections-omissions",
    instant: input.correctedAt,
    act: "correction.opened",
    subject: id,
    data: {
      slug: input.slug,
      kind: input.kind,
      priorManuscriptDigest: admission.manuscriptDigest,
      correctedDraftDigest,
      bodyChanged: correctedBody !== document.body,
      replacementCount,
      affectedSurfaces,
      summary,
      ...(details === undefined ? {} : { details }),
      triggerAct: input.trigger.act,
      triggerActDigest,
      triggerEvidenceDigest,
      sourceSubjects,
      claimIds,
      priorManifestDigest,
      priorRouteDigests,
    },
  });
  return Object.freeze({ correctionId: id, slug: input.slug, path, priorManuscriptDigest: admission.manuscriptDigest, correctedDraftDigest, affectedSurfaces, triggerActDigest, priorManifestDigest });
}

export async function amendCorrection(input: AmendCorrectionInput): Promise<Readonly<{ correctionId: string; slug: string; manuscriptDigest: string }>> {
  if (!validInstant(input.amendedAt)) throw new Error(`correction amendment requires an explicit UTC instant: ${input.amendedAt}`);
  const summary = nonempty(input.summary, "summary");
  const details = input.details === undefined ? undefined : nonempty(input.details, "details");
  const contentDir = resolve(input.contentDir ?? "content/posts");
  const dataDir = resolve(input.dataDir ?? "data");
  const path = manuscriptPath(contentDir, input.slug);
  const document = decodeFrontMatterDocument(readFileSync(path, "utf8"));
  if (document.frontMatter["draft"] !== true) throw new Error("correction metadata may be amended only while the corrected manuscript is withdrawn");
  const existing = corrections(document);
  const index = existing.findIndex((entry) => entry["id"] === input.correctionId);
  if (index === -1) throw new Error(`article does not carry correction ${input.correctionId}`);
  const prior = existing[index]!;
  const amended = Object.freeze({
    ...prior,
    summary,
    ...(details === undefined ? {} : { details }),
  });
  const nextCorrections = Object.freeze(existing.map((entry, entryIndex) => entryIndex === index ? amended : entry));
  writeFileSync(path, encodeFrontMatterDocument(Object.freeze({
    ...document,
    frontMatter: Object.freeze({ ...document.frontMatter, corrections: nextCorrections }),
  })), "utf8");
  const manuscriptDigest = reviewPublicationAdmission(contentDir, input.slug).manuscriptDigest;
  await appendKoiosAct({
    dataRoot: dataDir,
    ledger: "corrections-omissions",
    instant: input.amendedAt,
    act: "correction.metadata.amended",
    subject: input.correctionId,
    data: { slug: input.slug, priorSummary: String(prior["summary"] ?? ""), summary, manuscriptDigest },
  });
  return Object.freeze({ correctionId: input.correctionId, slug: input.slug, manuscriptDigest });
}

export async function reopenCorrection(input: ReopenCorrectionInput): Promise<Readonly<{ correctionId: string; slug: string; manuscriptDigest: string; replacementCount: number }>> {
  if (!validInstant(input.reopenedAt)) throw new Error(`correction reopening requires an explicit UTC instant: ${input.reopenedAt}`);
  const reason = nonempty(input.reason, "reason");
  const contentDir = resolve(input.contentDir ?? "content/posts");
  const dataDir = resolve(input.dataDir ?? "data");
  const path = manuscriptPath(contentDir, input.slug);
  const document = decodeFrontMatterDocument(readFileSync(path, "utf8"));
  const existing = corrections(document);
  const index = existing.findIndex((entry) => entry["id"] === input.correctionId);
  if (index === -1) throw new Error(`article does not carry correction ${input.correctionId}`);
  const replacement = applyReplacements(document.body, input.replacements);
  const metadata = Object.freeze({ ...existing[index]!, body_requirements: replacement.requirements });
  const nextCorrections = Object.freeze(existing.map((entry, entryIndex) => entryIndex === index ? metadata : entry));
  const priorKoios = record(document.frontMatter["koios"]);
  writeFileSync(path, encodeFrontMatterDocument(Object.freeze({
    ...document,
    frontMatter: Object.freeze({
      ...document.frontMatter,
      draft: true,
      corrections: nextCorrections,
      koios: Object.freeze({ ...priorKoios, gates_clear: false }),
    }),
    body: replacement.body,
  })), "utf8");
  const manuscriptDigest = reviewPublicationAdmission(contentDir, input.slug).manuscriptDigest;
  await appendKoiosAct({
    dataRoot: dataDir,
    ledger: "corrections-omissions",
    instant: input.reopenedAt,
    act: "correction.propagation.reopened",
    subject: input.correctionId,
    data: { slug: input.slug, reason, manuscriptDigest, replacementCount: replacement.count, bodyRequirements: replacement.requirements },
  });
  return Object.freeze({ correctionId: input.correctionId, slug: input.slug, manuscriptDigest, replacementCount: replacement.count });
}

function artifactFor(artifacts: readonly StaticShadowArtifact[], route: string): StaticShadowArtifact {
  const artifact = artifacts.find((candidate) => candidate.route === route);
  if (artifact === undefined) throw new Error(`correction projection omitted ${route}`);
  return artifact;
}

function textAt(outputDir: string, artifact: StaticShadowArtifact): string {
  return readFileSync(join(outputDir, artifact.file), "utf8");
}

function requireText(text: string, needle: string, route: string): void {
  if (!text.includes(needle)) throw new Error(`correction projection ${route} does not carry ${JSON.stringify(needle)}`);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function requireHtmlText(text: string, needle: string, route: string): void {
  if (!text.includes(needle) && !text.includes(escapeHtml(needle))) {
    throw new Error(`correction projection ${route} does not carry ${JSON.stringify(needle)}`);
  }
}

function wireInstant(value: string): string {
  return new Date(value).toISOString().replace(/\.\d{3}Z$/u, "Z");
}

export async function closeCorrection(input: CloseCorrectionInput): Promise<CloseCorrectionResult> {
  if (!validInstant(input.closedAt)) throw new Error(`correction closure requires an explicit UTC instant: ${input.closedAt}`);
  const contentDir = resolve(input.contentDir ?? "content/posts");
  const dataDir = resolve(input.dataDir ?? "data");
  const admission = reviewPublicationAdmission(contentDir, input.slug);
  if (!admission.publishable) throw new Error(`correction cannot close until corrected bytes regain exact editorial publication admission: ${input.slug}`);
  const document = decodeFrontMatterDocument(readFileSync(manuscriptPath(contentDir, input.slug), "utf8"));
  const metadata = corrections(document).find((entry) => entry["id"] === input.correctionId);
  if (metadata === undefined) throw new Error(`article does not carry correction ${input.correctionId}`);
  const correctedAt = String(metadata["corrected_at"] ?? metadata["correctedAt"] ?? "");
  const summary = String(metadata["summary"] ?? "");
  if (!validInstant(correctedAt) || summary.trim() === "") throw new Error(`correction metadata is incomplete: ${input.correctionId}`);
  const triggerActDigest = requiredDigest(String(metadata["trigger_act_digest"] ?? ""), "correction trigger act digest");
  const priorManifestDigest = requiredDigest(String(metadata["prior_manifest_digest"] ?? ""), "correction prior manifest digest");
  const priorRouteValue = metadata["prior_route_digests"];
  const priorRouteDigests = Array.isArray(priorRouteValue)
    ? Object.freeze(Object.fromEntries(priorRouteValue.flatMap((entry) => {
      const pair = record(entry);
      return typeof pair["route"] === "string" && typeof pair["digest"] === "string" ? [[pair["route"], pair["digest"]]] : [];
    })))
    : record(priorRouteValue);
  if (admission.acceptance === undefined || admission.acceptance.serviceAccepted !== true) throw new Error("correction closure lacks an accepted exact-manuscript editorial judgment");
  const editorialAcceptanceDigest = recordDigest(admission.acceptance);
  const bodyRequirements = record(metadata["body_requirements"]);
  const mustInclude = Array.isArray(bodyRequirements["must_include"]) ? bodyRequirements["must_include"].map(String) : [];
  const mustNotInclude = Array.isArray(bodyRequirements["must_not_include"]) ? bodyRequirements["must_not_include"].map(String) : [];
  for (const value of mustInclude) if (!document.body.includes(value)) throw new Error(`corrected manuscript does not satisfy correction postcondition must_include ${JSON.stringify(value)}`);
  for (const value of mustNotInclude) if (document.body.includes(value)) throw new Error(`corrected manuscript does not satisfy correction postcondition must_not_include ${JSON.stringify(value)}`);

  const livePublicationWitness = latestLivePublicationWitness(dataDir);
  const result = await buildStaticPublication({
    outputDir: input.outputDir,
    replace: existsSync(join(resolve(input.outputDir), ".koios-static-shadow")),
    profile: "cutover-candidate",
    site: { contentDir, dataDir },
    livePublicationWitness,
  });
  verifyStaticPublication(result);
  const artifacts = result.manifest.artifacts;
  const routes = [
    `/posts/${input.slug}`,
    "/corrections",
    "/corrections.json",
    "/feed.xml",
    "/feed.atom",
    "/feed.json",
    "/sitemap.xml",
    "/news-sitemap.xml",
    "/ninjs.json",
    `/fingerprints/${input.slug}.json`,
    `/fingerprints/${input.slug}.svg`,
    `/fingerprints/${input.slug}.png`,
  ];
  const selected = routes.map((route) => artifactFor(artifacts, route));
  const article = textAt(result.outputDir, selected[0]!);
  requireHtmlText(article, summary, routes[0]!);
  requireText(article, correctedAt, routes[0]!);
  for (const route of ["/corrections", "/corrections.json"]) {
    const text = textAt(result.outputDir, artifactFor(artifacts, route));
    requireText(text, input.correctionId, route);
    if (route === "/corrections") requireHtmlText(text, summary, route);
    else requireText(text, summary, route);
  }
  const rss = textAt(result.outputDir, artifactFor(artifacts, "/feed.xml"));
  requireText(rss, input.slug, "/feed.xml");
  requireText(rss, new Date(correctedAt).toUTCString(), "/feed.xml");
  for (const route of ["/feed.atom", "/feed.json"]) {
    const text = textAt(result.outputDir, artifactFor(artifacts, route));
    requireText(text, input.slug, route);
    requireText(text, wireInstant(correctedAt), route);
  }
  const sitemap = textAt(result.outputDir, artifactFor(artifacts, "/sitemap.xml"));
  requireText(sitemap, input.slug, "/sitemap.xml");
  requireText(sitemap, correctedAt.slice(0, 10), "/sitemap.xml");
  const newsSitemap = textAt(result.outputDir, artifactFor(artifacts, "/news-sitemap.xml"));
  requireText(newsSitemap, input.slug, "/news-sitemap.xml");
  requireText(article, correctedAt, "article JSON-LD");
  const ninjs = textAt(result.outputDir, artifactFor(artifacts, "/ninjs.json"));
  requireText(ninjs, input.slug, "/ninjs.json");
  requireText(ninjs, correctedAt, "/ninjs.json");
  const fingerprint = JSON.parse(textAt(result.outputDir, artifactFor(artifacts, `/fingerprints/${input.slug}.json`))) as JsonObject;
  const facts = record(fingerprint["facts"]);
  if (facts["dateModified"] !== correctedAt || Number(facts["correctionCount"]) < 1) {
    throw new Error("fingerprint does not carry correction date and count");
  }
  const routeDigests = Object.freeze(Object.fromEntries(selected.map((artifact) => [artifact.route, artifact.digest])));
  const routeChanges = Object.freeze(Object.fromEntries(selected.map((artifact) => {
    const before = typeof priorRouteDigests[artifact.route] === "string" ? String(priorRouteDigests[artifact.route]) : undefined;
    if (before !== undefined && before === artifact.digest) {
      if (!["/sitemap.xml", "/news-sitemap.xml"].includes(artifact.route)) throw new Error(`correction left dependent carrier byte-identical without an admitted semantic reason: ${artifact.route}`);
      return [artifact.route, Object.freeze({ relation: "semantically-witnessed-byte-unchanged" as const, before, after: artifact.digest, reason: "same-day sitemap lastmod is day-granular; semantic propagation was verified without dishonest byte churn" })];
    }
    return [artifact.route, Object.freeze({ relation: "changed" as const, ...(before === undefined ? {} : { before }), after: artifact.digest })];
  })));
  await appendKoiosAct({
    dataRoot: dataDir,
    ledger: "corrections-omissions",
    instant: input.closedAt,
    act: "correction.propagation.closed",
    subject: input.correctionId,
    data: { slug: input.slug, triggerActDigest, priorManifestDigest, manuscriptDigest: admission.manuscriptDigest, editorialAcceptanceDigest, manifestDigest: result.manifestDigest, routeDigests, routeChanges, staticDeliveryMarginalPriceUsd: 0, externalDeploymentEffect: false },
  });
  return Object.freeze({ correctionId: input.correctionId, slug: input.slug, manuscriptDigest: admission.manuscriptDigest, editorialAcceptanceDigest, triggerActDigest, priorManifestDigest, manifestDigest: result.manifestDigest, routeDigests, routeChanges });
}
