// Koios's resumable newsroom pulse. State is derived from owned ledgers,
// assignments, manuscripts, and exact-byte editorial authority; there is no
// ambient scheduler state for this circuit to remember on Koios's behalf.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  cultivate,
  isCultivationObstruction,
  type CultivationResult,
} from "@emsenn/organizing-a-content-farm";
import {
  DEFAULT_CONTENT_DIR,
  DEFAULT_CONTENT_PRODUCTION_CONFIG,
  DEFAULT_DATA_DIR,
} from "../config.mjs";
import { loadPosts } from "../content.mjs";
import { koiosFarmProperty } from "../demand.mjs";
import { repairDraft } from "../draft-repair.mjs";
import { buildStaticPublication, verifyStaticPublication } from "../administrating/deploying/static-shadow.mjs";
import { latestLivePublicationWitness } from "../administrating/deploying/live-publication-witness.mjs";
import {
  completeAssignment,
  createAssignment,
  readAssignment,
  readAssignmentDisposition,
  recordAssignmentDisposition,
  type AssignmentReading,
} from "../researching/writing/assignments.mjs";
import { createDraftManuscript } from "../researching/writing/manuscripts.mjs";
import { procureNewswireProse } from "../researching/writing/newswire-prose-contract.mjs";
import { composeNewsroomProse } from "../researching/writing/prose-contribution.mjs";
import { readAdmissibleResearchPacket } from "../researching/sourcing/admissible-research-packet-contract.mjs";
import { researchPacket, type ResearchPacket } from "../researching/sourcing/research-packets.mjs";
import {
  LicensedEditorialStateRefusal,
  licensedEditorialBrief,
  procureLicensedEditorialState,
} from "../researching/sourcing/licensed-editorial-state-contract.mjs";
import { priorResearchContextBrief, projectPriorResearchForIssue, type PriorResearchContext } from "../researching/sourcing/prior-research-contract.mjs";
import { editorialContextDigestForManuscript, judgeManuscriptUnderContract, type EditorialJudgment } from "../researching/writing/editing/liss-editorial.mjs";
import {
  applyStandardsMetadataDefaults,
  normalizeManuscriptReferences,
  publishManuscript,
  repairManuscriptEditorialSurfaces,
  repairManuscriptHeadings,
  repairManuscriptSeoHeading,
  reviewPublicationAdmission,
} from "../researching/writing/editing/standards.mjs";
import { appendDatedRecord, appendKoiosAct, ledgerRootPath, recordDigest, type JsonObject } from "./ledger.mjs";
import { assignmentSourceUrls } from "./issue-controller.mjs";
import { settleNewsroomLearningPulse } from "./newsroom-learning.mjs";

type CircuitDisposition = "published" | "refused" | "obstructed";
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

type JsonRecord = Record<string, unknown>;
const SITE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function jsonlFiles(root: string): readonly string[] {
  try {
    return readdirSync(root, { withFileTypes: true }).flatMap((entry) => entry.isDirectory()
      ? jsonlFiles(join(root, entry.name))
      : entry.name.endsWith(".jsonl") ? [join(root, entry.name)] : []);
  } catch { return []; }
}

function circuitActs(dataDir: string): readonly JsonRecord[] {
  return [...jsonlFiles(ledgerRootPath(dataDir, "contract-events"))].sort().flatMap((path): JsonRecord[] => {
    try { return readFileSync(path, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line) as JsonRecord); }
    catch { return []; }
  }).filter((record) => record["kind"] === "koios.ledger-act" && String(record["act"] ?? "").startsWith("newsroom.circuit."));
}

function currentEditorialJudgment(dataDir: string, slug: string, manuscriptDigest: string, editorialContextDigest: string): EditorialJudgment | undefined {
  const records = [...jsonlFiles(ledgerRootPath(dataDir, "editorial-judgments"))].sort().flatMap((path): JsonRecord[] => {
    try { return readFileSync(path, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line) as JsonRecord); }
    catch { return []; }
  });
  const value = records.filter((record) => record["kind"] === "koios.editorial-judgment"
    && record["slug"] === slug
    && record["manuscriptDigest"] === manuscriptDigest
    && record["editorialContextDigest"] === editorialContextDigest
    && record["serviceAccepted"] === true
    && record["contract"] === "independent-editorial-assessment/editorial-assessment/v1"
    && record["toolSelectionValidated"] === true).at(-1);
  return value as EditorialJudgment | undefined;
}

function appendPhase(dataDir: string, now: string, assignmentId: string, act: string, data: JsonObject = {}): void {
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: now, act, subject: assignmentId, data });
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

function repairAttemptCount(dataDir: string, assignmentId: string): number {
  return jsonlFiles(ledgerRootPath(dataDir, "contract-events")).flatMap((path): JsonRecord[] => {
    try { return readFileSync(path, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line) as JsonRecord); }
    catch { return []; }
  }).filter((record) => record["kind"] === "koios.draft-repair" && record["assignmentId"] === assignmentId).length;
}

function stop(input: Readonly<{
  dataDir: string;
  now: string;
  assignmentId?: string;
  slug?: string;
  disposition: "refused" | "obstructed";
  reason: string;
  transitions: readonly string[];
}>): NewsroomCircuitResult {
  if (input.assignmentId !== undefined) {
    if (input.disposition === "refused") {
      recordAssignmentDisposition(input.dataDir, {
        assignmentId: input.assignmentId,
        disposition: "refused",
        reason: input.reason,
        authority: "koios.news/editorial-operation",
        contract: "koios.news/newsroom-circuit-refusal/v1",
      }, input.now);
    }
    appendPhase(input.dataDir, input.now, input.assignmentId, input.disposition === "refused" ? "newsroom.circuit.refused" : "newsroom.circuit.obstructed", {
      reason: input.reason,
      ...(input.slug === undefined ? {} : { slug: input.slug }),
    });
  }
  const learning = input.assignmentId === undefined ? undefined : settleNewsroomLearningPulse({
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

export async function runNewsroomCircuit(input: Readonly<{
  assignmentId?: string;
  now?: string;
  maxRepairs?: number;
  outputDir?: string;
}> = {}): Promise<NewsroomCircuitResult> {
  const now = input.now ?? new Date().toISOString();
  const day = now.slice(0, 10);
  const dataDir = resolve(DEFAULT_DATA_DIR);
  const contentDir = resolve(DEFAULT_CONTENT_DIR);
  const transitions: string[] = [];
  const posts = () => loadPosts(contentDir);
  let assignment: AssignmentReading | undefined;

  const requested = input.assignmentId;
  if (requested === undefined) {
    return stop({ dataDir, now, disposition: "obstructed", reason: "the newsroom runner requires an exact publication-owned assignment from the issue controller", transitions });
  }
  try { assignment = readAssignment(dataDir, requested, posts()); }
  catch { assignment = undefined; }
  if (assignment === undefined) {
    return stop({ dataDir, now, disposition: "obstructed", reason: `the issue controller named no readable assignment: ${requested}`, transitions });
  }
  const priorDisposition = readAssignmentDisposition(dataDir, assignment.assignmentId);
  if (priorDisposition !== undefined) {
    return Object.freeze({ kind: "koios.newsroom-circuit", disposition: "refused", assignmentId: assignment.assignmentId, reason: `assignment already ${priorDisposition.disposition}: ${priorDisposition.reason}`, transitions: Object.freeze([]) });
  }

  appendPhase(dataDir, now, assignment.assignmentId, "newsroom.circuit.opened", { status: assignment.status });

  let slug = assignment.manuscriptSlug;
  if (slug === undefined) {
    const packet = packetFor(assignment, dataDir);
    if (packet.selectedCount === 0) {
      return stop({ dataDir, now, assignmentId: assignment.assignmentId, disposition: "refused", reason: "assignment has no admitted source evidence", transitions });
    }
    let priorResearch: PriorResearchContext | undefined;
    try {
      const issueTerms = [...new Set([assignment.term, assignment.beat, ...assignment.term.split(/[^a-z0-9]+/iu).filter((term) => term.length >= 5)])].slice(0, 10);
      priorResearch = projectPriorResearchForIssue({ assignmentId: assignment.assignmentId, terms: issueTerms, dataDir, now: new Date().toISOString(), maxFiles: 8 });
      transitions.push("prior-research-context-admitted");
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      appendPhase(dataDir, new Date().toISOString(), assignment.assignmentId, "prior-research.context.refused", { provider: "corpus-management-team", reason: reason.slice(0, 800), requiredMove: "continue-with-current-event-evidence-or-repair-prior-research-contract" });
      transitions.push("prior-research-context-refused");
    }
    let licensedEditorialState;
    try {
      licensedEditorialState = await procureLicensedEditorialState({
        assignment: {
          assignmentId: assignment.assignmentId,
          term: assignment.term,
          beat: assignment.beat,
          summary: assignment.summary ?? `Report the ${assignment.term} story from admitted source evidence.`,
          angle: assignment.angle ?? "Establish the reported event before adding only source-licensed systems interpretation.",
          sourceUrls: assignment.sourceUrls,
        },
        researchPacket: packet,
        now: new Date().toISOString(),
      });
    } catch (error) {
      const refusedAt = new Date().toISOString();
      let replacementAssignmentId: string | undefined;
      if (error instanceof LicensedEditorialStateRefusal) {
        const suggested = error.diagnosis.suggestedAssignment;
        if (suggested !== undefined && suggested.term.trim().toLowerCase() !== assignment.term.trim().toLowerCase()) {
          const replacement = createAssignment(dataDir, {
            term: suggested.term,
            beat: assignment.beat,
            priority: assignment.priority,
            summary: suggested.summary,
            angle: suggested.angle,
            assignee: assignment.assignee ?? "koios-news/writer",
            sourceUrls: [...suggested.sourceUrls],
            ...(assignment.evidence === undefined ? {} : { evidence: assignment.evidence }),
          }, posts());
          replacementAssignmentId = replacement.assignment.assignmentId;
          appendDatedRecord({
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
          appendPhase(dataDir, refusedAt, replacement.assignment.assignmentId, "newsroom.assignment.nominated", {
            selectionOrigin: "licensed-editorial-state-replan",
            predecessorAssignmentId: assignment.assignmentId,
            term: replacement.assignment.term,
            beat: replacement.assignment.beat,
            sourceUrls: [...replacement.assignment.sourceUrls],
          });
          transitions.push("assignment-replanned-from-source-event");
        }
        appendDatedRecord({
          dataRoot: dataDir,
          ledger: "research-lessons",
          instant: refusedAt,
          record: Object.freeze({
            kind: "koios.research-settlement-refusal",
            at: refusedAt,
            assignmentId: assignment.assignmentId,
            contract: "koios-news-service-section/licensed-editorial-state/v1",
            code: error.code,
            reason: error.message,
            diagnosis: error.diagnosis,
            ...(replacementAssignmentId === undefined ? {} : { replacementAssignmentId }),
          }) as JsonObject,
        });
        appendPhase(dataDir, refusedAt, assignment.assignmentId, "newsroom.circuit.replan-required", {
          code: error.code,
          failureLayer: error.diagnosis.failureLayer,
          requiredMove: error.diagnosis.requiredMove,
          replayFrom: error.diagnosis.replayFrom,
          ...(replacementAssignmentId === undefined ? {} : { replacementAssignmentId }),
        });
      }
      return stop({
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
    appendDatedRecord({
      dataRoot: dataDir,
      ledger: "source-claims",
      instant: new Date().toISOString(),
      record: Object.freeze({
        kind: "koios.licensed-editorial-state-admission",
        at: new Date().toISOString(),
        assignmentId: assignment.assignmentId,
        contract: "koios-news-service-section/licensed-editorial-state/v1",
        stateDigest: licensedEditorialState.stateDigest,
        providerExchange: licensedEditorialState.providerExchange,
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
          licensedEditorialBrief(licensedEditorialState.state),
          ...(priorResearch === undefined ? [] : [priorResearchContextBrief(priorResearch)]),
        ]),
      }),
    });
    const licensedSourceUrls = new Set(licensedEditorialState.state.assertions.map((assertion) => assertion.sourceUrl));
    const items = packet.intakeSources.filter((source) => licensedSourceUrls.has(source.url)).map((source) => Object.freeze({
      kind: "producing-content.syndication-item" as const,
      id: source.subject,
      title: source.title,
      url: source.url,
      ...(source.summary === undefined ? {} : { summary: source.summary }),
      ...(source.published === undefined ? {} : { published: source.published }),
    }));
    let writerReceipt: Readonly<{ model: string; selectedTier: string; selectedProvider: string }> | undefined;
    let cultivated;
    try {
      cultivated = await cultivate(property, {
        at: day,
        term: assignment.term,
        beat: assignment.beat,
        items,
        dryRun: true,
        env: process.env,
        compose: composeNewsroomProse,
        ask: (prompt: string) => {
          const result = procureNewswireProse({
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
      return stop({
        dataDir,
        now: new Date().toISOString(),
        assignmentId: assignment.assignmentId,
        disposition: "obstructed",
        reason: `writer provider invocation failed: ${error instanceof Error ? error.message : String(error)}`,
        transitions,
      });
    }
    if (isCultivationObstruction(cultivated)) {
      return stop({ dataDir, now, assignmentId: assignment.assignmentId, disposition: "obstructed", reason: cultivated.evidence, transitions });
    }
    slug = draftSlug(cultivated, assignment.assignmentId, contentDir);
    const draft = createDraftManuscript(contentDir, {
      title: cultivated.draft.title,
      summary: cultivated.draft.summary,
      body: cultivated.draft.body,
      seoTerm: assignment.term,
      beat: assignment.beat,
      assignmentId: assignment.assignmentId,
      references: [...packet.candidateReferences],
      slug,
      date: day,
      tags: [assignment.term, assignment.beat],
      category: assignment.beat,
    });
    slug = draft.slug;
    transitions.push("draft-created");
    appendPhase(dataDir, new Date().toISOString(), assignment.assignmentId, "newsroom.circuit.drafted", { slug, writer: { provider: writerReceipt?.selectedProvider ?? "newswire-editorial-production", tier: writerReceipt?.selectedTier ?? "provider-recorded", model: writerReceipt?.model ?? "provider-recorded", usage: cultivated.usage, ...(cultivated.composition === undefined ? {} : { composition: cultivated.composition }) }, packetDigest: recordDigest(packet), licensedEditorialStateDigest: licensedEditorialState.stateDigest, ...(priorResearch === undefined ? {} : { priorResearchContextDigest: priorResearch.contextualBundleDigest, priorResearchGapDigest: priorResearch.gapBundleDigest }) });
  }

  if (!existsSync(join(contentDir, `${slug}.md`))) {
    return stop({ dataDir, now, assignmentId: assignment.assignmentId, slug, disposition: "obstructed", reason: "assignment manuscript artifact is missing", transitions });
  }

  settleDeterministicForm(contentDir, slug);
  transitions.push("deterministic-form-settled");
  const maxRepairs = input.maxRepairs ?? 3;
  let repairs = repairAttemptCount(dataDir, assignment.assignmentId);
  while (true) {
    const admission = reviewPublicationAdmission(contentDir, slug);
    if (admission.publishable) break;
    const editorialContextDigest = editorialContextDigestForManuscript({ slug });
    let judgment = currentEditorialJudgment(dataDir, slug, admission.manuscriptDigest, editorialContextDigest);
    if (judgment === undefined) {
      try {
        judgment = judgeManuscriptUnderContract({ slug, now: new Date().toISOString(), model: "claude-sonnet-4-6" });
      } catch (error) {
        return stop({
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
      return stop({ dataDir, now, assignmentId: assignment.assignmentId, slug, disposition: "refused", reason: `editor refused manuscript at ${judgment.pipelineDiagnosis.failureLayer}: ${judgment.summary}`, transitions });
    }
    if (repairs >= maxRepairs) {
      return stop({ dataDir, now, assignmentId: assignment.assignmentId, slug, disposition: "refused", reason: `editorial repair budget exhausted at ${judgment.pipelineDiagnosis.failureLayer}: ${judgment.summary}`, transitions });
    }
    if (["sources", "assignment", "deterministic-gates"].includes(judgment.pipelineDiagnosis.failureLayer)) {
      return stop({ dataDir, now, assignmentId: assignment.assignmentId, slug, disposition: "refused", reason: `repair must replay from ${judgment.pipelineDiagnosis.failureLayer}: ${judgment.summary}`, transitions });
    }
    const freeRepairCredential = process.env["NVIDIA_API_KEY"] ?? process.env["API_KEY_NVIDIA_NIM"] ?? process.env["NVIDIA_NIM_API_KEY"];
    const provider = judgment.pipelineDiagnosis.failureLayer === "writer-model" || repairs > 0 || freeRepairCredential === undefined ? "liss" : "property";
    try {
      await repairDraft({ slug, provider, now: new Date().toISOString() });
    } catch (error) {
      return stop({ dataDir, now: new Date().toISOString(), assignmentId: assignment.assignmentId, slug, disposition: "obstructed", reason: `draft repair provider invocation failed: ${error instanceof Error ? error.message : String(error)}`, transitions });
    }
    repairs += 1;
    transitions.push(`draft-repaired:${provider}`);
    settleDeterministicForm(contentDir, slug);
  }

  publishManuscript(contentDir, slug);
  transitions.push("published");
  completeAssignment(dataDir, assignment.assignmentId, posts());
  transitions.push("assignment-completed");

  const livePublicationWitness = latestLivePublicationWitness(dataDir);
  const candidate = await buildStaticPublication({ outputDir: resolve(input.outputDir ?? ".static/koios.news-candidate"), replace: true, profile: "cutover-candidate", livePublicationWitness });
  const verification = verifyStaticPublication(candidate);
  transitions.push("static-candidate-projected");
  appendKoiosAct({ dataRoot: dataDir, ledger: "shadow-deliveries", instant: new Date().toISOString(), act: "candidate.projected", subject: assignment.assignmentId, data: { slug, manifestDigest: verification.manifestDigest, routeCount: verification.routeCount, authority: "non-authoritative-cutover-candidate", profile: verification.profile } });
  appendKoiosAct({ dataRoot: dataDir, ledger: "revenue-cost", instant: new Date().toISOString(), act: "publication.cost-accounted", subject: assignment.assignmentId, data: { slug, staticDeliveryMarginalCostUsd: 0, inferenceCost: "see-provider-usage-ledger", revenue: "not-yet-observed", accountingBasis: "provider receipts and owned transition witnesses" } });
  appendPhase(dataDir, new Date().toISOString(), assignment.assignmentId, "newsroom.circuit.completed", { slug, manifestDigest: verification.manifestDigest, transitions });
  const learning = settleNewsroomLearningPulse({ dataDir, now: new Date().toISOString(), pulseId: `newsroom-terminal:${assignment.assignmentId}:${now}` });
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
