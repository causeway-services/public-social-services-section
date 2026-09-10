// Koios's resumable newsroom pulse. State is derived from owned ledgers,
// assignments, manuscripts, and exact-byte editorial authority; there is no
// ambient scheduler state for this circuit to remember on Koios's behalf.

import { createHash, randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  cultivate,
  decodeFrontMatterDocument,
  encodeFrontMatterDocument,
  isCultivationObstruction,
  type CultivationResult,
} from "@red-cup-engineering/organizing-a-content-farm";
import {
  DEFAULT_CONTENT_DIR,
  DEFAULT_CONTENT_PRODUCTION_CONFIG,
  DEFAULT_DATA_DIR,
} from "../config.mjs";
import { loadPosts } from "../content.mjs";
import { koiosFarmProperty } from "../demand.mjs";
import { repairDraft } from "../draft-repair.mjs";
import { buildStaticPublication, verifyStaticPublication } from "../administrating/deploying/static-shadow.mjs";
import { prepareArticle50Fingerprint } from "../administrating/deploying/article50-provenance.mjs";
import { latestLivePublicationWitness } from "../administrating/deploying/live-publication-witness.mjs";
import { koiosMasthead, koiosWireItems } from "../index.mjs";
import {
  completeAssignment,
  createAssignment,
  readAssignment,
  readAssignmentCommission,
  readAssignmentDisposition,
  recordAssignmentDispositionRevalidation,
  recordAssignmentDisposition,
  type AssignmentReading,
} from "../researching/writing/assignments.mjs";
import { createDraftManuscript } from "../researching/writing/manuscripts.mjs";
import { procureNewswireProse } from "../researching/writing/newswire-prose-contract.mjs";
import { composeNewsroomProse } from "../researching/writing/prose-contribution.mjs";
import { headlineCommissionPrompt, headlineMatchesSourceTitle, selectAccountableHeadline } from "../researching/writing/attention-headline.mjs";
import { readAdmissibleResearchPacket } from "../researching/sourcing/admissible-research-packet-contract.mjs";
import { researchPacket, type ResearchPacket } from "../researching/sourcing/research-packets.mjs";
import {
  LicensedEditorialStateRefusal,
  licensedEditorialBrief,
  procureLicensedEditorialState,
} from "../researching/sourcing/licensed-editorial-state-contract.mjs";
import { priorResearchContextBrief, procurePriorResearchForIssue, type PriorResearchContext } from "../researching/sourcing/prior-research-contract.mjs";
import { editorialContextDigestForManuscript, judgeManuscriptUnderContract, type EditorialJudgment } from "../researching/writing/editing/market-editorial.mjs";
import { sourceOriginalityFindings, sourceOriginalityMechanismDigest, type SourceText } from "../researching/writing/editing/source-originality.mjs";
import {
  applyStandardsMetadataDefaults,
  normalizeManuscriptReferences,
  publishManuscript,
  repairManuscriptEditorialSurfaces,
  repairManuscriptHeadings,
  repairManuscriptSeoHeading,
  reviewPublicationAdmission,
  type StandardsFinding,
} from "../researching/writing/editing/standards.mjs";
import { appendDatedRecord, appendKoiosAct, readKoiosLedger, recordDigest, type JsonObject } from "./ledger.mjs";
import { commissionForAssignment } from "./editorial-commissioning.mjs";
import { operatingBeatForProduct } from "./audience-product-planning.mjs";
import { assignmentSourceUrls } from "./issue-controller.mjs";
import { settleNewsroomLearningPulse } from "./newsroom-learning.mjs";
import { settlePublicationEconomics } from "./publication-economics.mjs";

type CircuitDisposition = "published" | "refused" | "obstructed";
export function editorialRepairBudgetExhausted(input: Readonly<{
  repairs: number;
  maxRepairs: number;
  boundedEditorToolRepair: boolean;
}>): boolean {
  // Exact editor-selected tool acts do not buy prose inference and cannot
  // recursively replay earlier stages. A successful act must mutate the named
  // bytes, while a no-op already refuses inside draft-repair. Charging those
  // finite deterministic corrections against the writer's inference budget
  // strands publishable work for reasons unrelated to cost or editorial risk.
  return input.boundedEditorToolRepair ? false : input.repairs >= input.maxRepairs;
}

export type NewsroomCircuitResult = Readonly<{
  kind: "koios.newsroom-circuit";
  disposition: CircuitDisposition;
  assignmentId?: string;
  slug?: string;
  reason?: string;
  transitions: readonly string[];
  candidate?: Readonly<{ manifestDigest: string; routeCount: number; outputDir: string; profile: "cutover-candidate" }>;
  learning?: Readonly<{ evidenceDigest: string; proposedMove: string }>;
}>;

export type NewsroomCircuitInput = Readonly<{
  assignmentId?: string;
  now?: string;
  maxRepairs?: number;
  outputDir?: string;
  dataDir?: string;
  contentDir?: string;
  sourceOriginalityRevalidation?: Readonly<{
    refusalDigest: string;
    priorMechanismDigest: string | null;
    currentMechanismDigest: string;
  }>;
}>;

type JsonRecord = Record<string, unknown>;
const SITE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const CIRCUIT_LEASE_ROOT = join(tmpdir(), "koios-newsroom-circuit-leases");

type CircuitLease = Readonly<{ path: string; token: string }>;

function processIsAlive(pid: number): boolean {
  if (!Number.isSafeInteger(pid) || pid <= 0) return false;
  try { process.kill(pid, 0); return true; }
  catch (error) { return (error as NodeJS.ErrnoException).code === "EPERM"; }
}

function circuitLeasePath(dataDir: string, assignmentId: string): string {
  const key = createHash("sha256").update(resolve(dataDir)).update("\0").update(assignmentId).digest("hex");
  return join(CIRCUIT_LEASE_ROOT, key);
}

/** A process-local filesystem lease serializes the one mutable manuscript and
 * assignment across the autonomous pulse and an operator-requested replay.
 * The ledger remains the durable state; this lease only prevents two runners
 * from independently spending inference and racing to append terminal acts. */
export function acquireAssignmentCircuitLease(dataDir: string, assignmentId: string): CircuitLease | undefined {
  mkdirSync(CIRCUIT_LEASE_ROOT, { recursive: true, mode: 0o700 });
  const path = circuitLeasePath(dataDir, assignmentId);
  const tryAcquire = (): CircuitLease | undefined => {
    try { mkdirSync(path, { mode: 0o700 }); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      return undefined;
    }
    const lease = Object.freeze({ path, token: randomUUID() });
    writeFileSync(join(path, "owner.json"), `${JSON.stringify({ token: lease.token, pid: process.pid, acquiredAt: new Date().toISOString() })}\n`, { flag: "wx", mode: 0o600 });
    return lease;
  };
  const acquired = tryAcquire();
  if (acquired !== undefined) return acquired;

  // A killed process must not permanently strand an assignment. Never evict
  // an owner whose process is alive; an unreadable or dead owner receives a
  // short grace period so acquisition cannot race its owner-file creation.
  let owner: { pid?: number } = {};
  try { owner = JSON.parse(readFileSync(join(path, "owner.json"), "utf8")) as { pid?: number }; }
  catch { /* handled by the age guard below */ }
  const ageMs = (() => { try { return Date.now() - statSync(path).mtimeMs; } catch { return 0; } })();
  if (processIsAlive(Number(owner.pid)) || ageMs < 60_000) return undefined;
  rmSync(path, { recursive: true, force: true });
  return tryAcquire();
}

export function releaseAssignmentCircuitLease(lease: CircuitLease): void {
  try {
    const owner = JSON.parse(readFileSync(join(lease.path, "owner.json"), "utf8")) as { token?: string };
    if (owner.token !== lease.token) return;
    rmSync(lease.path, { recursive: true, force: true });
  } catch { /* a lost ephemeral lease cannot erase the durable circuit result */ }
}

function circuitActs(dataDir: string): readonly JsonRecord[] {
  return readKoiosLedger(dataDir, "contract-events")
    .filter((record) => record["kind"] === "koios.ledger-act" && String(record["act"] ?? "").startsWith("newsroom.circuit."));
}

export function admitsSourceOriginalityRevalidation(
  dataDir: string,
  assignmentId: string,
  grant: NonNullable<NewsroomCircuitInput["sourceOriginalityRevalidation"]>,
): boolean {
  if (grant.currentMechanismDigest !== sourceOriginalityMechanismDigest()) return false;
  return circuitActs(dataDir).some((record) => {
    if (record["act"] !== "newsroom.circuit.source-originality-refused" || record["subject"] !== assignmentId || recordDigest(record) !== grant.refusalDigest) return false;
    const data = record["data"] !== null && typeof record["data"] === "object" && !Array.isArray(record["data"])
      ? record["data"] as JsonObject : undefined;
    const prior = typeof data?.["gateMechanismDigest"] === "string" ? data["gateMechanismDigest"] : null;
    return prior === grant.priorMechanismDigest && prior !== grant.currentMechanismDigest;
  });
}

function currentEditorialJudgment(dataDir: string, slug: string, manuscriptDigest: string, editorialContextDigest: string): EditorialJudgment | undefined {
  const records = readKoiosLedger(dataDir, "editorial-judgments");
  const value = records.filter((record) => record["kind"] === "koios.editorial-judgment"
    && record["slug"] === slug
    && record["manuscriptDigest"] === manuscriptDigest
    && record["editorialContextDigest"] === editorialContextDigest
    && record["serviceAccepted"] === true
    && record["contract"] === "ni:///sha-256;GTSsfC0lmcjPLQvtlGmYwLJLCa9pirz1d8oUqRweioo"
    && record["toolSelectionValidated"] === true).at(-1);
  return value as EditorialJudgment | undefined;
}

async function appendPhase(dataDir: string, now: string, assignmentId: string, act: string, data: JsonObject = {}): Promise<void> {
  await appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: now, act, subject: assignmentId, data });
}

function packetFor(assignment: AssignmentReading, dataDir: string): ResearchPacket {
  const contracted = readAdmissibleResearchPacket(dataDir, assignment.assignmentId);
  if (contracted !== undefined) return contracted;
  // Legacy compatibility for assignments formed before the Service Section's
  // admissible-research-packet contract existed. New issue formation must not
  // take this path.
  const broad = researchPacket({
    term: assignment.term,
    beat: assignment.beat,
    ...(assignment.sourceUrls.length === 0 ? {} : { sourceUrls: assignment.sourceUrls }),
  });
  const sourceUrls = assignmentSourceUrls(assignment.term, broad);
  return researchPacket({ term: assignment.term, beat: assignment.beat, sourceUrls, limit: 3 });
}

function draftSlug(result: CultivationResult, assignmentId: string, contentDir: string): string {
  if (!existsSync(join(contentDir, `${result.slug}.md`))) return result.slug;
  return `${result.slug}-${recordDigest(assignmentId).replace(/^sha256:/u, "").slice(0, 8)}`;
}

function settleDeterministicForm(contentDir: string, slug: string): void {
  applyStandardsMetadataDefaults(contentDir, slug);
  normalizeManuscriptReferences(contentDir, slug);
  repairManuscriptHeadings(contentDir, slug);
  repairManuscriptSeoHeading(contentDir, slug);
  repairManuscriptEditorialSurfaces(contentDir, slug);
}

export type DeterministicAdmissionRefusal = Readonly<{
  failureLayer: "writer-model" | "deterministic-gates";
  replayFrom: "writer-model" | "deterministic-gates";
  findingCodes: readonly string[];
  reason: string;
}>;

/**
 * Keep checkable manuscript defects out of the independent Editor's context
 * window. A short or script-corrupted body requires a new writer act; any
 * other error surviving Koios's deterministic form settlement means the gate
 * or its carrier adapter needs attention. Warnings remain editorial context.
 */
export function deterministicAdmissionRefusal(
  findings: readonly StandardsFinding[],
): DeterministicAdmissionRefusal | undefined {
  const blocking = findings.filter((finding) => finding.severity === "error");
  if (blocking.length === 0) return undefined;
  const writerDefect = blocking.some((finding) => ["body-too-short", "script-contamination"].includes(finding.code));
  const failureLayer = writerDefect ? "writer-model" : "deterministic-gates";
  const findingCodes = Object.freeze(blocking.map((finding) => finding.code));
  return Object.freeze({
    failureLayer,
    replayFrom: failureLayer,
    findingCodes,
    reason: blocking.map((finding) => `${finding.code}: ${finding.message}`).join("; "),
  });
}

function sourceTextsFromPacket(packet: ResearchPacket): readonly SourceText[] {
  return Object.freeze(packet.claims.flatMap((claim): SourceText[] => claim.predicate === "summary"
    && typeof claim.sourceUrl === "string"
    && typeof claim.object === "string"
    && claim.object.trim() !== ""
    ? [Object.freeze({ sourceUrl: claim.sourceUrl, text: claim.object })]
    : []));
}

export function newsroomSourceOriginalityFindings(body: string, packet: ResearchPacket): ReturnType<typeof sourceOriginalityFindings> {
  return sourceOriginalityFindings(body, sourceTextsFromPacket(packet));
}

async function refuseSourceShapedProse(input: Readonly<{
  contentDir: string;
  dataDir: string;
  now: string;
  assignmentId: string;
  slug: string;
  packet: ResearchPacket;
}>): Promise<readonly ReturnType<typeof sourceOriginalityFindings>[number][]> {
  const encodedManuscript = readFileSync(join(input.contentDir, `${input.slug}.md`), "utf8");
  const manuscript = decodeFrontMatterDocument(encodedManuscript);
  const bodyFindings = newsroomSourceOriginalityFindings(manuscript.body, input.packet);
  const headline = typeof manuscript.frontMatter["title"] === "string" ? manuscript.frontMatter["title"] : "";
  const matchingSource = input.packet.intakeSources.find((source) => headlineMatchesSourceTitle(headline, [source.title]));
  const findings = Object.freeze([
    ...(matchingSource === undefined ? [] : [Object.freeze({
      sourceUrl: matchingSource.url,
      draftSentence: headline,
      sourceSentence: matchingSource.title,
      sharedWordCount: headline.split(/\s+/u).filter(Boolean).length,
      wordContainment: 1,
      trigramContainment: 1,
      longestSharedRun: headline.split(/\s+/u).filter(Boolean).length,
    })]),
    ...bodyFindings,
  ]);
  if (findings.length === 0) return findings;
  await appendPhase(input.dataDir, input.now, input.assignmentId, "newsroom.circuit.source-originality-refused", {
    contract: "koios.news/source-originality-gate/v1",
    slug: input.slug,
    manuscriptDigest: recordDigest(encodedManuscript),
    packetDigest: recordDigest(input.packet),
    gateMechanismDigest: sourceOriginalityMechanismDigest(),
    findingCount: findings.length,
    findings: findings.map((finding) => ({
      sourceUrl: finding.sourceUrl,
      draftSentence: finding.draftSentence,
      sourceSentence: finding.sourceSentence,
      sharedWordCount: finding.sharedWordCount,
      wordContainment: finding.wordContainment,
      trigramContainment: finding.trigramContainment,
      longestSharedRun: finding.longestSharedRun,
    })),
    failureLayer: "writer-model",
    replayFrom: "writer-model",
  });
  return findings;
}

function repairAttemptCount(dataDir: string, assignmentId: string): number {
  return readKoiosLedger(dataDir, "contract-events")
    .filter((record) => record["kind"] === "koios.draft-repair" && record["assignmentId"] === assignmentId).length;
}

async function stop(input: Readonly<{
  dataDir: string;
  now: string;
  assignmentId?: string;
  slug?: string;
  disposition: "refused" | "obstructed";
  reason: string;
  transitions: readonly string[];
}>): Promise<NewsroomCircuitResult> {
  if (input.assignmentId !== undefined) {
    if (input.disposition === "refused") {
      await recordAssignmentDisposition(input.dataDir, {
        assignmentId: input.assignmentId,
        disposition: "refused",
        reason: input.reason,
        authority: "koios.news/editorial-operation",
        contract: "koios.news/newsroom-circuit-refusal/v1",
      }, input.now);
    }
    await appendPhase(input.dataDir, input.now, input.assignmentId, input.disposition === "refused" ? "newsroom.circuit.refused" : "newsroom.circuit.obstructed", {
      reason: input.reason,
      ...(input.slug === undefined ? {} : { slug: input.slug }),
    });
  }
  const learning = input.assignmentId === undefined ? undefined : await settleNewsroomLearningPulse({
    dataDir: input.dataDir,
    now: input.now,
    pulseId: `newsroom-terminal:${input.assignmentId}:${input.now}`,
  });
  const issueReading = learning?.readings.find((reading) => reading.assignmentId === input.assignmentId);
  return Object.freeze({
    kind: "koios.newsroom-circuit",
    disposition: input.disposition,
    ...(input.assignmentId === undefined ? {} : { assignmentId: input.assignmentId }),
    ...(input.slug === undefined ? {} : { slug: input.slug }),
    reason: input.reason,
    transitions: Object.freeze([...input.transitions]),
    ...(issueReading === undefined ? {} : { learning: Object.freeze({ evidenceDigest: learning!.evidenceDigest, proposedMove: issueReading.proposedMove }) }),
  });
}

async function runNewsroomCircuitUnderLease(input: NewsroomCircuitInput = {}): Promise<NewsroomCircuitResult> {
  const now = input.now ?? new Date().toISOString();
  const day = now.slice(0, 10);
  const dataDir = resolve(input.dataDir ?? DEFAULT_DATA_DIR);
  const contentDir = resolve(input.contentDir ?? DEFAULT_CONTENT_DIR);
  const transitions: string[] = [];
  const posts = () => loadPosts(contentDir);
  let assignment: AssignmentReading | undefined;

  const requested = input.assignmentId;
  if (requested === undefined) {
    return await stop({ dataDir, now, disposition: "obstructed", reason: "the newsroom runner requires an exact publication-owned assignment from the issue controller", transitions });
  }
  try { assignment = readAssignment(dataDir, requested, posts()); }
  catch { assignment = undefined; }
  if (assignment === undefined) {
    return await stop({ dataDir, now, disposition: "obstructed", reason: `the issue controller named no readable assignment: ${requested}`, transitions });
  }
  const priorDisposition = readAssignmentDisposition(dataDir, assignment.assignmentId);
  const revalidationAdmitted = priorDisposition?.disposition === "refused"
    && input.sourceOriginalityRevalidation !== undefined
    && admitsSourceOriginalityRevalidation(dataDir, assignment.assignmentId, input.sourceOriginalityRevalidation);
  if (priorDisposition !== undefined && !revalidationAdmitted) {
    return Object.freeze({ kind: "koios.newsroom-circuit", disposition: "refused", assignmentId: assignment.assignmentId, reason: `assignment already ${priorDisposition.disposition}: ${priorDisposition.reason}`, transitions: Object.freeze([]) });
  }

  if (revalidationAdmitted) {
    await recordAssignmentDispositionRevalidation(dataDir, {
      assignmentId: assignment.assignmentId,
      refusalDigest: input.sourceOriginalityRevalidation!.refusalDigest,
      priorGateMechanismDigest: input.sourceOriginalityRevalidation!.priorMechanismDigest,
      gateMechanismDigest: input.sourceOriginalityRevalidation!.currentMechanismDigest,
      authority: "koios.news/changed-deterministic-gate",
      contract: "koios.news/source-originality-revalidation/v1",
    }, now);
    await appendPhase(dataDir, now, assignment.assignmentId, "newsroom.circuit.source-originality-revalidation-opened", {
      refusalDigest: input.sourceOriginalityRevalidation!.refusalDigest,
      priorGateMechanismDigest: input.sourceOriginalityRevalidation!.priorMechanismDigest,
      gateMechanismDigest: input.sourceOriginalityRevalidation!.currentMechanismDigest,
      authority: "changed-deterministic-gate",
    });
  }

  await appendPhase(dataDir, now, assignment.assignmentId, "newsroom.circuit.opened", { status: assignment.status, revalidationAdmitted });

  const commission = readAssignmentCommission(dataDir, assignment.assignmentId)
    ?? commissionForAssignment({ term: assignment.term, beat: assignment.beat });
  const packet = packetFor(assignment, dataDir);
  if (packet.selectedCount === 0) {
    return await stop({ dataDir, now, assignmentId: assignment.assignmentId, disposition: "refused", reason: "assignment has no admitted source evidence", transitions });
  }
  let slug = assignment.manuscriptSlug;
  if (slug === undefined) {
    const publicationBeat = operatingBeatForProduct(commission.productClass, assignment.beat);
    let priorResearch: PriorResearchContext | undefined;
    try {
      const issueTerms = [...new Set([assignment.term, publicationBeat, ...assignment.term.split(/[^a-z0-9]+/iu).filter((term) => term.length >= 5)])].slice(0, 10);
      priorResearch = await procurePriorResearchForIssue({ assignmentId: assignment.assignmentId, terms: issueTerms, dataDir, now: new Date().toISOString(), maxFiles: 8 });
      transitions.push("prior-research-context-admitted");
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      await appendPhase(dataDir, new Date().toISOString(), assignment.assignmentId, "prior-research.context.refused", { provider: "corpus-management-team", reason: reason.slice(0, 800), requiredMove: "continue-with-current-event-evidence-or-repair-prior-research-contract" });
      transitions.push("prior-research-context-refused");
    }
    let licensedEditorialState;
    try {
      licensedEditorialState = await procureLicensedEditorialState({
        assignment: {
          assignmentId: assignment.assignmentId,
          term: assignment.term,
          beat: publicationBeat,
          summary: assignment.summary ?? `Report the ${assignment.term} story from admitted source evidence.`,
          angle: assignment.angle ?? "Establish the reported event before adding only source-licensed systems interpretation.",
          sourceUrls: assignment.sourceUrls,
        },
        researchPacket: packet,
        commission,
        now: new Date().toISOString(),
      });
    } catch (error) {
      const refusedAt = new Date().toISOString();
      let replacementAssignmentId: string | undefined;
      if (error instanceof LicensedEditorialStateRefusal) {
        const suggested = error.diagnosis.suggestedAssignment;
        if (suggested !== undefined && suggested.term.trim().toLowerCase() !== assignment.term.trim().toLowerCase()) {
          const replacement = await createAssignment(dataDir, {
            term: suggested.term,
            beat: publicationBeat,
            priority: assignment.priority,
            summary: suggested.summary,
            angle: suggested.angle,
            assignee: assignment.assignee ?? "koios-news/writer",
            sourceUrls: [...suggested.sourceUrls],
            ...(assignment.evidence === undefined ? {} : { evidence: assignment.evidence }),
          }, posts());
          replacementAssignmentId = replacement.assignment.assignmentId;
          await appendDatedRecord({
            dataRoot: dataDir,
            ledger: "assignments",
            instant: refusedAt,
            record: Object.freeze({
              kind: "koios.assignment-replanning",
              at: refusedAt,
              contract: "licensed-editorial-state-replanning",
              created: replacement.created,
              predecessorAssignmentId: assignment.assignmentId,
              replacementAssignmentId: replacement.assignment.assignmentId,
            }) as JsonObject,
          });
          await appendPhase(dataDir, refusedAt, replacement.assignment.assignmentId, "newsroom.assignment.nominated", {
            selectionOrigin: "licensed-editorial-state-replan",
            predecessorAssignmentId: assignment.assignmentId,
            term: replacement.assignment.term,
            beat: replacement.assignment.beat,
            sourceUrls: [...replacement.assignment.sourceUrls],
          });
          transitions.push("assignment-replanned-from-source-event");
        }
        await appendDatedRecord({
          dataRoot: dataDir,
          ledger: "research-lessons",
          instant: refusedAt,
          record: Object.freeze({
            kind: "koios.research-settlement-refusal",
            at: refusedAt,
            assignmentId: assignment.assignmentId,
            contract: "ni:///sha-256;JeFirv0GtdnxsMK55Mimwdc1_J2y94vFtSMwnw2sePE",
            code: error.code,
            reason: error.message,
            diagnosis: error.diagnosis,
            ...(replacementAssignmentId === undefined ? {} : { replacementAssignmentId }),
          }) as JsonObject,
        });
        await appendPhase(dataDir, refusedAt, assignment.assignmentId, "newsroom.circuit.replan-required", {
          code: error.code,
          failureLayer: error.diagnosis.failureLayer,
          requiredMove: error.diagnosis.requiredMove,
          replayFrom: error.diagnosis.replayFrom,
          ...(replacementAssignmentId === undefined ? {} : { replacementAssignmentId }),
        });
      }
      return await stop({
        dataDir,
        now: refusedAt,
        assignmentId: assignment.assignmentId,
        disposition: error instanceof LicensedEditorialStateRefusal ? "refused" : "obstructed",
        reason: error instanceof LicensedEditorialStateRefusal
          ? `licensed editorial state refused [${error.code}]: ${error.message}`
          : `licensed editorial state contract failed: ${error instanceof Error ? error.message : String(error)}`,
        transitions,
      });
    }
    transitions.push("licensed-editorial-state-formed");
    await appendDatedRecord({
      dataRoot: dataDir,
      ledger: "source-claims",
      instant: new Date().toISOString(),
      record: Object.freeze({
        kind: "koios.licensed-editorial-state-admission",
        at: new Date().toISOString(),
        assignmentId: assignment.assignmentId,
        contract: "ni:///sha-256;JeFirv0GtdnxsMK55Mimwdc1_J2y94vFtSMwnw2sePE",
        stateDigest: licensedEditorialState.stateDigest,
        providerExchange: licensedEditorialState.providerExchange,
        commission,
      }) as JsonObject,
    });
    const baseProperty = koiosFarmProperty();
    const property = Object.freeze({
      ...baseProperty,
      voice: Object.freeze({
        ...baseProperty.voice,
        laws: Object.freeze([
          ...(baseProperty.voice.laws ?? []),
          ...packet.editorialRisks.map((risk) => `RESEARCH PACKET ${risk.severity.toUpperCase()}: ${risk.message}`),
          licensedEditorialBrief(licensedEditorialState.state, commission.writerPromptLaws),
          ...(priorResearch === undefined ? [] : [priorResearchContextBrief(priorResearch)]),
        ]),
      }),
    });
    const licensedSourceUrls = new Set(licensedEditorialState.state.assertions.map((assertion) => assertion.sourceUrl));
    const items = packet.intakeSources.filter((source) => licensedSourceUrls.has(source.url)).map((source, index) => Object.freeze({
      kind: "producing-content.syndication-item" as const,
      id: source.subject,
      // The content-farm composition seam ordinarily sends source title and
      // summary straight to its writer. Koios's writer instead receives the
      // licensed clean-room deck above; keep raw source language customer-side
      // for deterministic gates and the independent editor.
      title: `Reporting source ${index + 1} for ${assignment.term}`,
      url: source.url,
      ...(source.published === undefined ? {} : { published: source.published }),
    }));
    let writerReceipt: Readonly<{ model: string; selectedTier: string; selectedProvider: string }> | undefined;
    let cultivated;
    try {
      cultivated = await cultivate(property, {
        at: day,
        term: assignment.term,
        beat: publicationBeat,
        items,
        dryRun: true,
        env: process.env,
        compose: composeNewsroomProse,
        ask: async (prompt: string) => {
          const result = await procureNewswireProse({
            purpose: `Draft Koios manuscript for assignment ${assignment!.assignmentId}.`,
            assignmentId: assignment!.assignmentId,
            assignmentDigest: recordDigest(assignment),
            prompt,
            licensedEditorialStateDigest: licensedEditorialState.stateDigest,
            researchPacketDigest: recordDigest(packet),
            writingPolicyDigest: recordDigest(JSON.parse(readFileSync(join(SITE_ROOT, "lib", "law", "accountable-attention-and-publication.json"), "utf8"))),
            stylePolicyDigest: recordDigest(property.voice),
            requiredSourceUrls: [packet.sourceUrls[0]!],
            now: new Date().toISOString(),
            dataDir,
          });
          writerReceipt = result;
          return result.text;
        },
      });
    } catch (error) {
      return await stop({
        dataDir,
        now: new Date().toISOString(),
        assignmentId: assignment.assignmentId,
        disposition: "obstructed",
        reason: `writer provider invocation failed: ${error instanceof Error ? error.message : String(error)}`,
        transitions,
      });
    }
    if (isCultivationObstruction(cultivated)) {
      return await stop({ dataDir, now, assignmentId: assignment.assignmentId, disposition: "obstructed", reason: cultivated.evidence, transitions });
    }
    // The accepted prose is already a purchased Koios asset. Stage it before
    // commissioning any attention surface so a bad headline can never erase
    // the body or cause a whole-manuscript replay. Draft status keeps the
    // provisional title private until the headline gate admits replacement
    // copy; the exact body digest is the repair boundary.
    slug = draftSlug(cultivated, assignment.assignmentId, contentDir);
    const staged = createDraftManuscript(contentDir, {
      title: cultivated.draft.title,
      summary: cultivated.draft.summary,
      body: cultivated.draft.body,
      seoTerm: assignment.term,
      beat: publicationBeat,
      assignmentId: assignment.assignmentId,
      references: [...packet.candidateReferences],
      slug,
      date: day,
      tags: [assignment.term, publicationBeat],
      category: publicationBeat,
    });
    slug = staged.slug;
    const stagedPath = join(contentDir, `${slug}.md`);
    const stagedBytes = readFileSync(stagedPath, "utf8");
    const stagedDocument = decodeFrontMatterDocument(stagedBytes);
    const stagedBodyDigest = recordDigest(stagedDocument.body);
    const stagedManuscriptDigest = recordDigest(stagedBytes);
    transitions.push("body-staged");
    await appendPhase(dataDir, new Date().toISOString(), assignment.assignmentId, "newsroom.circuit.body-staged", {
      slug,
      bodyDigest: stagedBodyDigest,
      manuscriptDigest: stagedManuscriptDigest,
      packetDigest: recordDigest(packet),
      licensedEditorialStateDigest: licensedEditorialState.stateDigest,
      writer: {
        provider: writerReceipt?.selectedProvider ?? "newswire-editorial-production",
        tier: writerReceipt?.selectedTier ?? "provider-recorded",
        model: writerReceipt?.model ?? "provider-recorded",
        usage: cultivated.usage,
        ...(cultivated.composition === undefined ? {} : { composition: cultivated.composition }),
      },
      attentionSurfaceState: "pending",
      publication: false,
    });

    let headline = cultivated.draft.title;
    let headlineReceipt: Readonly<{ model: string; selectedTier: string; selectedProvider: string }> | undefined;
    try {
      const result = await procureNewswireProse({
        purpose: `Contribute an accountable headline for assignment ${assignment.assignmentId}.`,
        assignmentId: assignment.assignmentId,
        assignmentDigest: recordDigest(assignment),
        prompt: headlineCommissionPrompt({ assignmentTerm: assignment.term, sourceTitle: packet.intakeSources[0]?.title ?? assignment.term, body: stagedDocument.body, commission }),
        licensedEditorialStateDigest: licensedEditorialState.stateDigest,
        researchPacketDigest: recordDigest(packet),
        writingPolicyDigest: recordDigest(JSON.parse(readFileSync(join(SITE_ROOT, "lib", "law", "accountable-attention-and-publication.json"), "utf8"))),
        stylePolicyDigest: recordDigest(property.voice),
        requiredSourceUrls: [...packet.sourceUrls],
        shape: "headline",
        now: new Date().toISOString(),
        dataDir,
      });
      headlineReceipt = result;
      const selection = selectAccountableHeadline({ raw: result.text, fallback: packet.intakeSources[0]?.title ?? assignment.term, assignmentTerm: assignment.term, body: stagedDocument.body, sourceUrls: packet.sourceUrls });
      headline = selection.selected;
      await appendKoiosAct({ dataRoot: dataDir, ledger: "audience-product", instant: new Date().toISOString(), act: selection.accepted ? "attention-surface.headline-selected" : "attention-surface.headline-refused", subject: assignment.assignmentId, data: { commission: commission.genre, selection, provider: result.selectedProvider, tier: result.selectedTier, model: result.model, factualWarrant: false } });
      if (!selection.accepted) {
        const refusedAt = new Date().toISOString();
        await appendPhase(dataDir, refusedAt, assignment.assignmentId, "newsroom.circuit.replan-required", {
          slug,
          failureLayer: "attention-headline",
          proposedMove: "repair-headline",
          bodyDigest: stagedBodyDigest,
          manuscriptDigest: stagedManuscriptDigest,
          findings: [...selection.findings],
          preservedWriterInvestment: true,
        });
        return await stop({ dataDir, now: refusedAt, assignmentId: assignment.assignmentId, slug, disposition: "refused", reason: `headline contribution failed accountable-originality admission: ${selection.findings.join("; ")}`, transitions });
      }
    } catch (error) {
      const obstructedAt = new Date().toISOString();
      await appendKoiosAct({ dataRoot: dataDir, ledger: "audience-product", instant: obstructedAt, act: "attention-surface.headline-obstructed", subject: assignment.assignmentId, data: { commission: commission.genre, obstruction: error instanceof Error ? error.message.slice(0, 1200) : String(error).slice(0, 1200), fallback: cultivated.draft.title, factualWarrant: false } });
      await appendPhase(dataDir, obstructedAt, assignment.assignmentId, "newsroom.circuit.replan-required", {
        slug,
        failureLayer: "attention-headline",
        proposedMove: "repair-headline",
        obstructionKind: "provider-route",
        bodyDigest: stagedBodyDigest,
        manuscriptDigest: stagedManuscriptDigest,
        preservedWriterInvestment: true,
      });
      return await stop({ dataDir, now: obstructedAt, assignmentId: assignment.assignmentId, slug, disposition: "obstructed", reason: `headline service could not deliver independently admissible publication copy: ${error instanceof Error ? error.message : String(error)}`, transitions });
    }
    const currentStagedBytes = readFileSync(stagedPath, "utf8");
    const currentStagedDocument = decodeFrontMatterDocument(currentStagedBytes);
    if (recordDigest(currentStagedDocument.body) !== stagedBodyDigest) {
      return await stop({ dataDir, now: new Date().toISOString(), assignmentId: assignment.assignmentId, slug, disposition: "obstructed", reason: "staged body changed before its admitted headline could be applied", transitions });
    }
    const stagedKoios = currentStagedDocument.frontMatter["koios"] !== null
      && typeof currentStagedDocument.frontMatter["koios"] === "object"
      && !Array.isArray(currentStagedDocument.frontMatter["koios"])
      ? currentStagedDocument.frontMatter["koios"] as JsonObject
      : {};
    writeFileSync(stagedPath, encodeFrontMatterDocument(Object.freeze({
      ...currentStagedDocument,
      frontMatter: Object.freeze({
        ...currentStagedDocument.frontMatter,
        title: headline,
        tweet: headline,
        koios: Object.freeze({ ...stagedKoios, attention_surface_state: "admitted" }),
      }),
    })), "utf8");
    transitions.push("draft-created");
    await appendPhase(dataDir, new Date().toISOString(), assignment.assignmentId, "newsroom.circuit.drafted", { slug, bodyDigest: stagedBodyDigest, stagedManuscriptDigest, admittedManuscriptDigest: recordDigest(readFileSync(stagedPath, "utf8")), writer: { provider: writerReceipt?.selectedProvider ?? "newswire-editorial-production", tier: writerReceipt?.selectedTier ?? "provider-recorded", model: writerReceipt?.model ?? "provider-recorded", usage: cultivated.usage, ...(cultivated.composition === undefined ? {} : { composition: cultivated.composition }) }, headline: { title: headline, provider: headlineReceipt?.selectedProvider ?? "source-title-fallback", tier: headlineReceipt?.selectedTier ?? "none", model: headlineReceipt?.model ?? "none" }, packetDigest: recordDigest(packet), licensedEditorialStateDigest: licensedEditorialState.stateDigest, ...(priorResearch === undefined ? {} : { priorResearchContextDigest: priorResearch.contextualBundleDigest, priorResearchGapDigest: priorResearch.gapBundleDigest }) });
  }

  if (!existsSync(join(contentDir, `${slug}.md`))) {
    return await stop({ dataDir, now, assignmentId: assignment.assignmentId, slug, disposition: "obstructed", reason: "assignment manuscript artifact is missing", transitions });
  }

  settleDeterministicForm(contentDir, slug);
  transitions.push("deterministic-form-settled");
  const maxRepairs = Math.min(input.maxRepairs ?? commission.resourceEnvelope.maximumDraftRepairs, commission.resourceEnvelope.maximumDraftRepairs);
  let repairs = repairAttemptCount(dataDir, assignment.assignmentId);
  while (true) {
    const originality = await refuseSourceShapedProse({
      contentDir,
      dataDir,
      now: new Date().toISOString(),
      assignmentId: assignment.assignmentId,
      slug,
      packet,
    });
    if (originality.length > 0) {
      transitions.push("source-originality-refused");
      if (repairs >= maxRepairs) return await stop({
          dataDir,
          now: new Date().toISOString(),
          assignmentId: assignment.assignmentId,
          slug,
          disposition: "refused",
          reason: `source-originality gate still found ${originality.length} source-shaped sentence(s) after ${repairs} retained writer repair(s)`,
          transitions,
        });
      try {
        await repairDraft({ slug, now: new Date().toISOString() });
      } catch (error) {
        return await stop({ dataDir, now: new Date().toISOString(), assignmentId: assignment.assignmentId, slug, disposition: "obstructed", reason: `source-originality writer repair failed: ${error instanceof Error ? error.message : String(error)}`, transitions });
      }
      repairs += 1;
      transitions.push("draft-repaired:source-originality:market");
      settleDeterministicForm(contentDir, slug);
      continue;
    }
    const admission = reviewPublicationAdmission(contentDir, slug);
    if (admission.publishable) break;
    const deterministicRefusal = deterministicAdmissionRefusal(admission.standards.findings);
    if (deterministicRefusal !== undefined) {
      await appendPhase(dataDir, new Date().toISOString(), assignment.assignmentId, "newsroom.circuit.deterministic-refused", {
        contract: "koios.news/deterministic-publication-admission/v1",
        slug,
        manuscriptDigest: admission.manuscriptDigest,
        failureLayer: deterministicRefusal.failureLayer,
        replayFrom: deterministicRefusal.replayFrom,
        findingCodes: deterministicRefusal.findingCodes,
      });
      transitions.push("deterministic-admission-refused");
      return await stop({
        dataDir,
        now: new Date().toISOString(),
        assignmentId: assignment.assignmentId,
        slug,
        disposition: "refused",
        reason: `deterministic publication admission requires replay from ${deterministicRefusal.replayFrom}: ${deterministicRefusal.reason}`,
        transitions,
      });
    }
    const editorialContextDigest = editorialContextDigestForManuscript({ slug });
    let judgment = currentEditorialJudgment(dataDir, slug, admission.manuscriptDigest, editorialContextDigest);
    if (judgment === undefined) {
      try {
        judgment = await judgeManuscriptUnderContract({ slug, now: new Date().toISOString() });
      } catch (error) {
        return await stop({
          dataDir,
          now: new Date().toISOString(),
          assignmentId: assignment.assignmentId,
          slug,
          disposition: "obstructed",
          reason: `independent editorial assessment failed: ${error instanceof Error ? error.message : String(error)}`,
          transitions,
        });
      }
      transitions.push(`editorial-${judgment.disposition}`);
    }
    if (judgment.publishable) continue;
    if (judgment.disposition === "refuse") {
      return await stop({ dataDir, now, assignmentId: assignment.assignmentId, slug, disposition: "refused", reason: `editor refused manuscript at ${judgment.pipelineDiagnosis.failureLayer}: ${judgment.summary}`, transitions });
    }
    const boundedEditorToolRepair = judgment.repairTools.length > 0;
    if (editorialRepairBudgetExhausted({ repairs, maxRepairs, boundedEditorToolRepair })) {
      return await stop({ dataDir, now, assignmentId: assignment.assignmentId, slug, disposition: "refused", reason: `editorial repair budget exhausted at ${judgment.pipelineDiagnosis.failureLayer}: ${judgment.summary}`, transitions });
    }
    if (["sources", "assignment", "deterministic-gates"].includes(judgment.pipelineDiagnosis.failureLayer)) {
      return await stop({ dataDir, now, assignmentId: assignment.assignmentId, slug, disposition: "refused", reason: `repair must replay from ${judgment.pipelineDiagnosis.failureLayer}: ${judgment.summary}`, transitions });
    }
    try {
      await repairDraft({
        slug,
        now: new Date().toISOString(),
      });
    } catch (error) {
      return await stop({ dataDir, now: new Date().toISOString(), assignmentId: assignment.assignmentId, slug, disposition: "obstructed", reason: `draft repair provider invocation failed: ${error instanceof Error ? error.message : String(error)}`, transitions });
    }
    repairs += 1;
    transitions.push("draft-repaired:market");
    settleDeterministicForm(contentDir, slug);
  }

  await publishManuscript(contentDir, slug);
  transitions.push("published");

  // A manuscript becoming locally public does not authorize an unsigned
  // carrier. Prepare only this article's exact fingerprint before completing
  // the assignment or projecting the static candidate. If its separately
  // hired providers are unavailable, the next issue pulse resumes this same
  // assignment and retained manuscript; it does not buy prose again.
  try {
    const post = loadPosts(contentDir).find((candidate) => candidate.slug === slug);
    const item = koiosWireItems({ contentDir, dataDir }).find((candidate) => candidate.slug === slug && candidate.isPublic);
    if (post === undefined || item === undefined) throw new Error(`published manuscript has no single public article projection: ${slug}`);
    const provenance = await prepareArticle50Fingerprint({ post, item, masthead: koiosMasthead({ contentDir, dataDir }), contentDir, dataDir });
    transitions.push(provenance.reused ? "article50-provenance-reused" : "article50-provenance-prepared");
    await appendPhase(dataDir, new Date().toISOString(), assignment.assignmentId, "newsroom.circuit.article50-provenance-prepared", {
      slug,
      sourceNi: provenance.sourceNi,
      signedNi: provenance.signedNi,
      reused: provenance.reused,
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    await appendPhase(dataDir, new Date().toISOString(), assignment.assignmentId, "newsroom.circuit.article50-provenance-obstructed", {
      slug,
      reason,
      replayFrom: "article50-provenance",
      retainedManuscript: true,
    });
    return await stop({
      dataDir,
      now: new Date().toISOString(),
      assignmentId: assignment.assignmentId,
      slug,
      disposition: "obstructed",
      reason: `Article 50 provenance provider obstructed the public carrier: ${reason}`,
      transitions,
    });
  }

  await completeAssignment(dataDir, assignment.assignmentId, posts());
  transitions.push("assignment-completed");

  const livePublicationWitness = latestLivePublicationWitness(dataDir);
  const candidate = await buildStaticPublication({ outputDir: resolve(input.outputDir ?? ".static/koios.news-candidate"), replace: true, profile: "cutover-candidate", livePublicationWitness });
  const verification = verifyStaticPublication(candidate);
  transitions.push("static-candidate-projected");
  await appendKoiosAct({ dataRoot: dataDir, ledger: "shadow-deliveries", instant: new Date().toISOString(), act: "candidate.projected", subject: assignment.assignmentId, data: { slug, manifestDigest: verification.manifestDigest, routeCount: verification.routeCount, authority: "non-authoritative-cutover-candidate", profile: verification.profile } });
  await settlePublicationEconomics({ dataDir, assignmentId: assignment.assignmentId, slug, now: new Date().toISOString() });
  await appendPhase(dataDir, new Date().toISOString(), assignment.assignmentId, "newsroom.circuit.completed", { slug, manifestDigest: verification.manifestDigest, transitions });
  const learning = await settleNewsroomLearningPulse({ dataDir, now: new Date().toISOString(), pulseId: `newsroom-terminal:${assignment.assignmentId}:${now}` });
  const issueReading = learning.readings.find((reading) => reading.assignmentId === assignment.assignmentId);
  return Object.freeze({
    kind: "koios.newsroom-circuit",
    disposition: "published",
    assignmentId: assignment.assignmentId,
    slug,
    transitions: Object.freeze(transitions),
    candidate: Object.freeze({ manifestDigest: verification.manifestDigest, routeCount: verification.routeCount, outputDir: candidate.outputDir, profile: "cutover-candidate" }),
    ...(issueReading === undefined ? {} : { learning: Object.freeze({ evidenceDigest: learning.evidenceDigest, proposedMove: issueReading.proposedMove }) }),
  });
}

export async function runNewsroomCircuit(input: NewsroomCircuitInput = {}): Promise<NewsroomCircuitResult> {
  if (input.assignmentId === undefined) return runNewsroomCircuitUnderLease(input);
  const dataDir = resolve(input.dataDir ?? DEFAULT_DATA_DIR);
  const lease = acquireAssignmentCircuitLease(dataDir, input.assignmentId);
  if (lease === undefined) return Object.freeze({
    kind: "koios.newsroom-circuit",
    disposition: "obstructed",
    assignmentId: input.assignmentId,
    reason: "this assignment is already being settled by another newsroom runner; resume from retained state on the next pulse",
    transitions: Object.freeze(["assignment-circuit-busy"]),
  });
  try { return await runNewsroomCircuitUnderLease(input); }
  finally { releaseAssignmentCircuitLease(lease); }
}

export async function runNewsroomCircuitSafely(
  input: NewsroomCircuitInput = {},
  runner: (input: NewsroomCircuitInput) => Promise<NewsroomCircuitResult> = runNewsroomCircuit,
): Promise<NewsroomCircuitResult> {
  try {
    return await runner(input);
  } catch (error) {
    const now = input.now ?? new Date().toISOString();
    const dataDir = resolve(input.dataDir ?? DEFAULT_DATA_DIR);
    const reason = `unexpected internal newsroom service failure: ${error instanceof Error ? error.message : String(error)}`;
    try {
      return await stop({
        dataDir,
        now,
        ...(input.assignmentId === undefined ? {} : { assignmentId: input.assignmentId }),
        disposition: "obstructed",
        reason,
        transitions: Object.freeze(["internal-service-failure-settled"]),
      });
    } catch {
      // A damaged evidence carrier must not erase the service settlement at
      // the customer boundary. Its missing witness remains explicit here.
      return Object.freeze({
        kind: "koios.newsroom-circuit",
        disposition: "obstructed",
        ...(input.assignmentId === undefined ? {} : { assignmentId: input.assignmentId }),
        reason: `${reason}; obstruction evidence could not be appended`,
        transitions: Object.freeze(["internal-service-failure-settled", "obstruction-evidence-append-failed"]),
      });
    }
  }
}
