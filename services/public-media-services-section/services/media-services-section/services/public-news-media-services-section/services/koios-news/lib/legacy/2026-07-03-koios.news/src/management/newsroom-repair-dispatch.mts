// Koios-owned phase transition from a terminal newsroom learning reading to a
// separately contracted market repair, successor assignment, and replay-ready
// manuscript. The selected supplier supplies prose only; Koios owns context, validation,
// serialization, assignment state, and later independent editorial judgment.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { decodeFrontMatterDocument, encodeFrontMatterDocument } from "@red-cup-engineering/organizing-a-content-farm";

import { DEFAULT_CONTENT_DIR, DEFAULT_DATA_DIR } from "../config.mjs";
import { loadPosts } from "../content.mjs";
import { commissionForAssignment } from "./editorial-commissioning.mjs";
import {
  applyBoundedEditorialRepairTools,
  composeDraftRevisionPrompt,
  editorRequestsCarrierRepair,
  latestManuscriptRepairDirective,
  renderedDraftRevisionInstructions,
} from "../draft-repair.mjs";
import {
  readAssignment,
  recordAssignmentRepairRevalidation,
} from "../researching/writing/assignments.mjs";
import {
  canonicalizeSourceUrls,
  descriptionFromProse,
  proseContributionBody,
  summaryFromProse,
} from "../researching/writing/prose-contribution.mjs";
import { headlineCommissionPrompt, headlineMatchesSourceTitle, selectAccountableHeadline } from "../researching/writing/attention-headline.mjs";
import { procureNewswireProse } from "../researching/writing/newswire-prose-contract.mjs";
import { readAdmissibleResearchPacket } from "../researching/sourcing/admissible-research-packet-contract.mjs";
import { researchPacket } from "../researching/sourcing/research-packets.mjs";
import { licensedClaimDeck, procureLicensedEditorialState } from "../researching/sourcing/licensed-editorial-state-contract.mjs";
import { repairManuscriptEditorialSurfaces } from "../researching/writing/editing/standards.mjs";
import { requestTextWorkCandidate, type TextWorkCandidate } from "./inference-work-market-client.mjs";
import { settleStageProduct, STAGE_PRODUCT_REGISTRY_CONTRACT } from "./stage-product-registry.mjs";
import { inspectNewsroomLearning, type LearningReading } from "./newsroom-learning.mjs";
import {
  digest,
  formNewsroomRepairDemand,
  INFERENCE_WORK_CONTRACT,
} from "./newsroom-repair-dispatcher.mjs";
import { appendKoiosAct, readKoiosLedger, recordDigest, type JsonObject } from "./ledger.mjs";

export { editorRequestsCarrierRepair };

type RecordValue = Record<string, unknown>;
const SITE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

export type NewsroomRepairDispatchResult = Readonly<{
  kind: "koios.newsroom-repair-dispatch";
  disposition: "replay-ready" | "refused" | "obstructed";
  assignmentId: string;
  repairAssignmentId?: string;
  slug?: string;
  reason?: string;
  repairDemandDigest?: string;
  repairContextDigest?: string;
  providerSettlementDigest?: string;
  capacityConsumed?: boolean;
}>;

function object(value: unknown): value is RecordValue {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

type RetainedMarketTextProduct = JsonObject & Readonly<{
  type: "KoiosRetainedMarketTextProduct";
  text: string;
  serviceClass: string;
  workLot: string;
  requestNi: string;
  resultNi: string;
  settlementNi: string;
  receiptNi: string;
  provider: string;
  model: string;
  exchangeDigest: string;
}>;

function admitRetainedMarketTextProduct(value: JsonObject): RetainedMarketTextProduct {
  const required = ["text", "serviceClass", "workLot", "requestNi", "resultNi", "settlementNi", "receiptNi", "provider", "model", "exchangeDigest"] as const;
  if (value["type"] !== "KoiosRetainedMarketTextProduct" || required.some((field) => typeof value[field] !== "string" || String(value[field]).length === 0)) {
    throw new Error("retained newsroom-repair product does not carry complete prose and provider identities");
  }
  return Object.freeze(value as RetainedMarketTextProduct);
}

function latestTerminalRecord(dataDir: string, assignmentId: string): Readonly<JsonObject> {
  const record = readKoiosLedger(dataDir, "contract-events")
    .filter((candidate) => candidate["subject"] === assignmentId
      && ["newsroom.circuit.refused", "newsroom.circuit.obstructed"].includes(String(candidate["act"] ?? "")))
    .sort((left, right) => String(left["recordedAt"] ?? "").localeCompare(String(right["recordedAt"] ?? "")))
    .at(-1);
  if (record === undefined) throw new Error(`assignment ${assignmentId} has no terminal newsroom failure`);
  return record;
}

function readingFor(dataDir: string, assignmentId: string, now: string): Readonly<{ reading: LearningReading; evidenceDigest: string }> {
  const pulse = inspectNewsroomLearning({ dataDir, pulseId: `repair-dispatch:${assignmentId}:${now}`, now });
  const reading = pulse.readings.find((candidate) => candidate.assignmentId === assignmentId);
  if (reading === undefined) throw new Error(`learning pulse has no reading for ${assignmentId}`);
  if (!(["repair-headline", "repair-draft", "replay-writer"] as const).includes(reading.proposedMove as "repair-headline" | "repair-draft" | "replay-writer")) {
    throw new Error(`learning move ${reading.proposedMove} requires a different service`);
  }
  if (reading.slug === null) throw new Error("repairable learning reading has no manuscript slug");
  return Object.freeze({ reading, evidenceDigest: pulse.evidenceDigest });
}

function sourceUrlsFromDocument(document: ReturnType<typeof decodeFrontMatterDocument>, fallback: readonly string[]): readonly string[] {
  const references = Array.isArray(document.frontMatter["references"]) ? document.frontMatter["references"] : [];
  const cited = references.flatMap((reference) => object(reference) && typeof reference["URL"] === "string" ? [reference["URL"]] : []);
  return Object.freeze(cited.length > 0 ? cited : [...fallback]);
}

async function accountableRepairHeadline(input: Readonly<{
  assignment: ReturnType<typeof readAssignment>;
  assignmentDigest: string;
  packet: ReturnType<typeof researchPacket>;
  body: string;
  currentTitle: string;
  repairDirectiveDigest: string;
  dataDir: string;
  force?: boolean;
  procure?: typeof procureNewswireProse;
}>): Promise<Readonly<{ headline: string; capacityConsumed: boolean }>> {
  const matchingSource = input.packet.intakeSources.find((source) => headlineMatchesSourceTitle(input.currentTitle, [source.title]));
  if (matchingSource === undefined && input.force !== true) return Object.freeze({ headline: input.currentTitle, capacityConsumed: false });
  const sourceTitle = matchingSource?.title ?? input.packet.intakeSources[0]?.title ?? input.assignment.term;
  const now = new Date().toISOString();
  const commission = commissionForAssignment(input.assignment);
  const config = JSON.parse(readFileSync(resolve(SITE_ROOT, "producing-content.config.json"), "utf8")) as RecordValue;
  const writingPolicy = JSON.parse(readFileSync(resolve(SITE_ROOT, "lib/law/accountable-attention-and-publication.json"), "utf8")) as RecordValue;
  const result = await (input.procure ?? procureNewswireProse)({
    purpose: `${input.force === true ? "Repair the refused attention surface" : "Replace a source-colliding headline"} for assignment ${input.assignment.assignmentId}.`,
    assignmentId: input.assignment.assignmentId,
    assignmentDigest: input.assignmentDigest,
    prompt: headlineCommissionPrompt({ assignmentTerm: input.assignment.term, sourceTitle, body: input.body, commission }),
    licensedEditorialStateDigest: recordDigest({ assignmentDigest: input.assignmentDigest, packetDigest: recordDigest(input.packet), repairDirectiveDigest: input.repairDirectiveDigest }),
    researchPacketDigest: recordDigest(input.packet),
    writingPolicyDigest: recordDigest(writingPolicy),
    stylePolicyDigest: recordDigest(config["voice"] ?? {}),
    requiredSourceUrls: input.packet.sourceUrls,
    shape: "headline",
    now,
    dataDir: input.dataDir,
  });
  const selection = selectAccountableHeadline({ raw: result.text, fallback: sourceTitle, assignmentTerm: input.assignment.term, body: input.body, sourceUrls: input.packet.sourceUrls });
  await appendKoiosAct({ dataRoot: input.dataDir, ledger: "audience-product", instant: now, act: selection.accepted ? "attention-surface.repair-headline-selected" : "attention-surface.repair-headline-refused", subject: input.assignment.assignmentId, data: { selection, provider: result.selectedProvider, tier: result.selectedTier, model: result.model, ...(matchingSource === undefined ? {} : { sourceCollision: matchingSource.title }), factualWarrant: false } });
  if (!selection.accepted) throw new Error(`replacement headline failed accountable-originality admission: ${selection.findings.join("; ")}`);
  return Object.freeze({ headline: selection.selected, capacityConsumed: result.reused !== true });
}

async function refusal(input: Readonly<{ dataDir: string; now: string; assignmentId: string; reason: string; slug?: string }>): Promise<NewsroomRepairDispatchResult> {
  const result = Object.freeze({
    kind: "koios.newsroom-repair-dispatch" as const,
    disposition: "refused" as const,
    assignmentId: input.assignmentId,
    ...(input.slug === undefined ? {} : { slug: input.slug }),
    reason: input.reason,
  });
  await appendKoiosAct({ dataRoot: input.dataDir, ledger: "contract-events", instant: input.now, act: "newsroom.repair.refused", subject: input.assignmentId, data: result as unknown as JsonObject });
  return result;
}

function resumableRepair(dataDir: string, contentDir: string, assignmentId: string): NewsroomRepairDispatchResult | undefined {
  const prior = readKoiosLedger(dataDir, "contract-events")
    .filter((candidate) => candidate["act"] === "newsroom.repair.replay-ready")
    .filter((candidate) => candidate["subject"] === assignmentId)
    .sort((left, right) => String(left["recordedAt"] ?? "").localeCompare(String(right["recordedAt"] ?? "")))
    .at(-1);
  if (prior === undefined || !object(prior["data"])) return undefined;
  const laterTerminal = readKoiosLedger(dataDir, "contract-events")
    .filter((candidate) => candidate["subject"] === assignmentId && ["newsroom.circuit.refused", "newsroom.circuit.obstructed"].includes(String(candidate["act"] ?? "")))
    .some((candidate) => String(candidate["recordedAt"] ?? "") > String(prior["recordedAt"] ?? ""));
  if (laterTerminal) return undefined;
  const data = prior["data"];
  const slug = typeof data["slug"] === "string" ? data["slug"] : undefined;
  if (slug === undefined) return undefined;
  try {
    const manuscript = decodeFrontMatterDocument(readFileSync(resolve(contentDir, `${slug}.md`), "utf8"));
    const koios = object(manuscript.frontMatter["koios"]) ? manuscript.frontMatter["koios"] : {};
    if (koios["assignment_id"] !== assignmentId || koios["repair_context_digest"] !== data["repairContextDigest"]) return undefined;
    readAssignment(dataDir, assignmentId, loadPosts(contentDir));
  } catch { return undefined; }
  return Object.freeze({
    kind: "koios.newsroom-repair-dispatch",
    disposition: "replay-ready",
    assignmentId,
    repairAssignmentId: assignmentId,
    slug,
    ...(typeof data["repairDemandDigest"] === "string" ? { repairDemandDigest: data["repairDemandDigest"] } : {}),
    ...(typeof data["repairContextDigest"] === "string" ? { repairContextDigest: data["repairContextDigest"] } : {}),
    ...(typeof data["providerSettlementDigest"] === "string" ? { providerSettlementDigest: data["providerSettlementDigest"] } : {}),
  });
}

export async function dispatchNewsroomRepair(input: Readonly<{
  assignmentId: string;
  now?: string;
  dataDir?: string;
  contentDir?: string;
  procureHeadline?: typeof procureNewswireProse;
  procureInference?: typeof requestTextWorkCandidate;
}>): Promise<NewsroomRepairDispatchResult> {
  const now = input.now ?? new Date().toISOString();
  const dataDir = resolve(input.dataDir ?? DEFAULT_DATA_DIR);
  const contentDir = resolve(input.contentDir ?? DEFAULT_CONTENT_DIR);
  const resume = resumableRepair(dataDir, contentDir, input.assignmentId);
  if (resume !== undefined) {
    await appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: now, act: "newsroom.repair.resumed", subject: resume.repairAssignmentId!, data: { assignmentId: input.assignmentId, slug: resume.slug!, providerReinvoked: false } });
    return resume;
  }
  let learning;
  try { learning = readingFor(dataDir, input.assignmentId, now); }
  catch (error) { return refusal({ dataDir, now, assignmentId: input.assignmentId, reason: error instanceof Error ? error.message : String(error) }); }
  const { reading } = learning;
  const slug = reading.slug!;
  const path = resolve(contentDir, `${slug}.md`);
  let before: string;
  let document: ReturnType<typeof decodeFrontMatterDocument>;
  let assignment;
  let packet;
  let editor;
  let terminal;
  let instructions: string;
  try {
    before = readFileSync(path, "utf8");
    document = decodeFrontMatterDocument(before);
    assignment = readAssignment(dataDir, input.assignmentId, loadPosts(contentDir));
    const sourceUrls = sourceUrlsFromDocument(document, assignment.sourceUrls);
    packet = readAdmissibleResearchPacket(dataDir, assignment.assignmentId)
      ?? researchPacket({ term: assignment.term, beat: assignment.beat, sourceUrls, limit: Math.max(4, sourceUrls.length) });
    terminal = latestTerminalRecord(dataDir, input.assignmentId);
  } catch (error) {
    return refusal({ dataDir, now, assignmentId: input.assignmentId, slug, reason: `repair context could not be formed: ${error instanceof Error ? error.message : String(error)}` });
  }
  if (reading.proposedMove === "repair-headline") {
    const stage = readKoiosLedger(dataDir, "contract-events")
      .filter((candidate) => candidate["act"] === "newsroom.circuit.body-staged" && candidate["subject"] === input.assignmentId)
      .filter((candidate) => object(candidate["data"]) && candidate["data"]["slug"] === slug)
      .sort((left, right) => String(left["recordedAt"] ?? "").localeCompare(String(right["recordedAt"] ?? "")))
      .at(-1);
    const stageData = stage !== undefined && object(stage["data"]) ? stage["data"] : undefined;
    const stagedBodyDigest = typeof stageData?.["bodyDigest"] === "string" ? stageData["bodyDigest"] : undefined;
    if (stage === undefined || stagedBodyDigest === undefined || recordDigest(document.body) !== stagedBodyDigest) {
      return refusal({ dataDir, now, assignmentId: input.assignmentId, slug, reason: "headline repair requires the exact digest-bound body staged before the attention-surface refusal" });
    }
    const assignmentDigest = recordDigest({
      assignmentId: assignment.assignmentId,
      term: assignment.term,
      beat: assignment.beat,
      priority: assignment.priority,
      summary: assignment.summary ?? null,
      angle: assignment.angle ?? null,
      assignee: assignment.assignee ?? null,
      sourceUrls: [...packet.sourceUrls],
      evidence: assignment.evidence ?? null,
    });
    let headline: string;
    let headlineCapacityConsumed = false;
    try {
      const contribution = await accountableRepairHeadline({
        assignment,
        assignmentDigest,
        packet,
        body: document.body,
        currentTitle: typeof document.frontMatter["title"] === "string" ? document.frontMatter["title"] : "",
        repairDirectiveDigest: recordDigest(stage),
        dataDir,
        force: true,
        ...(input.procureHeadline === undefined ? {} : { procure: input.procureHeadline }),
      });
      headline = contribution.headline;
      headlineCapacityConsumed = contribution.capacityConsumed;
    } catch (error) {
      return refusal({ dataDir, now: new Date().toISOString(), assignmentId: input.assignmentId, slug, reason: `headline repair failed: ${error instanceof Error ? error.message : String(error)}` });
    }
    const currentBytes = readFileSync(path, "utf8");
    const current = decodeFrontMatterDocument(currentBytes);
    if (recordDigest(current.body) !== stagedBodyDigest) {
      return refusal({ dataDir, now: new Date().toISOString(), assignmentId: input.assignmentId, slug, reason: "staged body changed while the headline repair lot was open" });
    }
    const repairContextDigest = recordDigest({
      kind: "koios.headline-repair-context",
      assignmentDigest,
      sourcePacketDigest: recordDigest(packet),
      stagedBodyDigest,
      terminalCircuitDigest: digest(terminal),
      learningEvidenceDigest: learning.evidenceDigest,
    });
    const priorKoios = object(current.frontMatter["koios"]) ? current.frontMatter["koios"] : {};
    const { predecessor_assignment_id: _retiredPredecessor, ...retainedKoios } = priorKoios;
    const next = Object.freeze({
      ...current,
      frontMatter: Object.freeze({
        ...current.frontMatter,
        draft: true,
        title: headline,
        tweet: headline,
        koios: Object.freeze({
          ...retainedKoios,
          assignment_id: input.assignmentId,
          repair_context_digest: repairContextDigest,
          attention_surface_state: "admitted",
          gates_clear: false,
        }),
      }),
    });
    writeFileSync(path, encodeFrontMatterDocument(next), "utf8");
    const after = readFileSync(path, "utf8");
    const settlementDigest = recordDigest({ kind: "koios.headline-only-repair", stagedBodyDigest, headline, beforeDigest: recordDigest(currentBytes), afterDigest: recordDigest(after) });
    await recordAssignmentRepairRevalidation(dataDir, { assignmentId: input.assignmentId, repairProductDigest: settlementDigest, repairMechanismDigest: repairContextDigest, authority: "koios.news/newsroom-learning", contract: "newsroom-headline-repair-dispatcher/v2" }, now);
    await appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: now, act: "newsroom.repair.headline-ready", subject: input.assignmentId, data: {
      assignmentId: input.assignmentId,
      slug,
      stagedBodyDigest,
      repairContextDigest,
      settlementDigest,
      bodyChanged: false,
      customerMutation: true,
    } });
    await appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: now, act: "newsroom.repair.replay-ready", subject: input.assignmentId, data: {
      assignmentId: input.assignmentId,
      slug,
      repairDemandDigest: repairContextDigest,
      repairContextDigest,
      providerSettlementDigest: settlementDigest,
      capacityConsumed: headlineCapacityConsumed,
      beforeDigest: recordDigest(currentBytes),
      afterDigest: recordDigest(after),
      stagedBodyDigest,
      assignmentIdentityPreserved: true,
      editorialAcceptance: false,
      publication: false,
      carrier: "newswire-headline-only",
    } });
    return Object.freeze({
      kind: "koios.newsroom-repair-dispatch",
      disposition: "replay-ready",
      assignmentId: input.assignmentId,
      repairAssignmentId: input.assignmentId,
      slug,
      repairDemandDigest: repairContextDigest,
      repairContextDigest,
      providerSettlementDigest: settlementDigest,
      capacityConsumed: headlineCapacityConsumed,
    });
  }
  try {
    editor = latestManuscriptRepairDirective({ dataDir, assignmentId: input.assignmentId, slug, manuscript: before });
    instructions = renderedDraftRevisionInstructions(editor.authority);
  } catch (error) {
    return refusal({ dataDir, now, assignmentId: input.assignmentId, slug, reason: `repair directive could not be formed: ${error instanceof Error ? error.message : String(error)}` });
  }
  const assignmentContext = Object.freeze({
    assignmentId: assignment.assignmentId,
    term: assignment.term,
    beat: assignment.beat,
    priority: assignment.priority,
    summary: assignment.summary ?? null,
    angle: assignment.angle ?? null,
    assignee: assignment.assignee ?? null,
    sourceUrls: Object.freeze([...packet.sourceUrls]),
    evidence: assignment.evidence ?? null,
  });
  const assignmentDigest = digest(assignmentContext);
  const sourcePacketDigest = digest(packet);
  let writerEvidenceProjection: Readonly<JsonObject> | undefined;
  let writerEvidenceProjectionDigest: string | undefined;
  if (editor.authority === "deterministic-source-originality-gate") {
    try {
      const commission = commissionForAssignment(assignment);
      const licensed = await procureLicensedEditorialState({
        assignment: {
          assignmentId: assignment.assignmentId,
          term: assignment.term,
          beat: assignment.beat,
          summary: assignment.summary ?? `Report the ${assignment.term} story from admitted source evidence.`,
          angle: assignment.angle ?? "Establish the reported event before adding only source-licensed interpretation.",
          sourceUrls: packet.sourceUrls,
        },
        researchPacket: packet,
        commission,
        now: new Date().toISOString(),
      });
      writerEvidenceProjection = licensedClaimDeck(licensed.state);
      writerEvidenceProjectionDigest = digest(writerEvidenceProjection);
      await appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: new Date().toISOString(), act: "newsroom.repair.claim-deck-admitted", subject: assignment.assignmentId, data: {
        sourcePacketDigest,
        licensedEditorialStateDigest: licensed.stateDigest,
        writerEvidenceProjectionDigest,
        claimCount: licensed.state.assertions.length,
        rawSourceProseSentToWriter: false,
        providerExchange: licensed.providerExchange,
      } });
    } catch (error) {
      return refusal({ dataDir, now: new Date().toISOString(), assignmentId: input.assignmentId, slug, reason: `clean-room claim deck could not be formed: ${error instanceof Error ? error.message : String(error)}` });
    }
  }
  const repairContext = Object.freeze({
    currentBody: document.body,
    manuscriptDigest: digest(document.body),
    editorReport: editor.report,
    editorJudgmentDigest: editor.digest,
    repairAuthority: editor.authority,
    witnessedResearchPacket: packet,
    sourcePacketDigest,
    ...(writerEvidenceProjection === undefined || writerEvidenceProjectionDigest === undefined ? {} : { writerEvidenceProjection, writerEvidenceProjectionDigest }),
    assignmentContext,
    assignmentDigest,
    renderedInstructions: instructions,
    instructionsDigest: digest(instructions),
  });
  const enrichedReading = Object.freeze({
    assignmentId: input.assignmentId,
    learningEvidenceDigest: learning.evidenceDigest,
    assignmentDigest,
    sourcePacketDigest,
    terminalCircuitDigest: digest(terminal),
    failureLayer: reading.failureLayer,
    proposedMove: reading.proposedMove,
  });
  const demand = formNewsroomRepairDemand(enrichedReading, repairContext);
  if (demand["type"] === "NewsroomRepairRefusal") {
    const refusalReason = typeof (demand as RecordValue)["reason"] === "string"
      ? `: ${String((demand as RecordValue)["reason"])}`
      : "";
    return refusal({ dataDir, now, assignmentId: input.assignmentId, slug, reason: `repair demand refused: ${String((demand as RecordValue)["code"] ?? "unknown")}${refusalReason}` });
  }
  const acceptedDemand = demand as RecordValue;
  // Prose is not authority to override the structured replay boundary. An
  // Editor may mention metadata while requiring a whole writer replay; only
  // explicit repair tools or a draft-repair learning move authorize the
  // deterministic carrier adapter.
  if (editor.repairTools.length > 0 || (reading.proposedMove === "repair-draft" && editorRequestsCarrierRepair(editor.report, editor.requiredRepairs, editor.failureLayer))) {
    const deterministicBefore = readFileSync(path, "utf8");
    const surfaceRepair = editor.repairTools.length > 0
      ? applyBoundedEditorialRepairTools(contentDir, slug, editor.repairTools)
      : repairManuscriptEditorialSurfaces(contentDir, slug);
    const deterministicAfter = readFileSync(path, "utf8");
    if (deterministicAfter !== deterministicBefore) {
      const repaired = decodeFrontMatterDocument(deterministicAfter);
      const priorKoios = object(repaired.frontMatter["koios"]) ? repaired.frontMatter["koios"] : {};
      const { predecessor_assignment_id: _retiredPredecessor, ...retainedKoios } = priorKoios;
      const next = Object.freeze({
        ...repaired,
        frontMatter: Object.freeze({
          ...repaired.frontMatter,
          draft: true,
          koios: Object.freeze({
            ...retainedKoios,
            assignment_id: input.assignmentId,
            repair_context_digest: String(acceptedDemand["repairContextDigest"]),
            gates_clear: false,
          }),
        }),
      });
      writeFileSync(path, encodeFrontMatterDocument(next), "utf8");
      const after = readFileSync(path, "utf8");
      const providerSettlementDigest = recordDigest({
        kind: "koios.deterministic-carrier-repair",
        changed: surfaceRepair.changed,
        beforeDigest: recordDigest(deterministicBefore),
        afterDigest: recordDigest(after),
      });
      await recordAssignmentRepairRevalidation(dataDir, { assignmentId: input.assignmentId, repairProductDigest: providerSettlementDigest, repairMechanismDigest: String(acceptedDemand["repairContextDigest"]), authority: "koios.news/newsroom-learning", contract: "newsroom-repair-dispatcher/v5" }, now);
      await appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: now, act: "newsroom.repair.deterministic-ready", subject: input.assignmentId, data: {
        assignmentId: input.assignmentId,
        slug,
        changed: surfaceRepair.changed,
        repairDemandDigest: digest(demand),
        repairContextDigest: String(acceptedDemand["repairContextDigest"]),
        providerSettlementDigest,
        customerMutation: true,
      } });
      await appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: now, act: "newsroom.repair.replay-ready", subject: input.assignmentId, data: {
        assignmentId: input.assignmentId,
        slug,
        repairDemandDigest: digest(demand),
        repairContextDigest: String(acceptedDemand["repairContextDigest"]),
        providerSettlementDigest,
        beforeDigest: recordDigest(deterministicBefore),
        afterDigest: recordDigest(after),
        assignmentIdentityPreserved: true,
        editorialAcceptance: false,
        publication: false,
        carrier: editor.repairTools.length > 0 ? "koios-bounded-editorial-repair-tools" : "koios-deterministic-editorial-surfaces",
      } });
      return Object.freeze({
        kind: "koios.newsroom-repair-dispatch",
        disposition: "replay-ready",
        assignmentId: input.assignmentId,
        repairAssignmentId: input.assignmentId,
        slug,
        repairDemandDigest: digest(demand),
        repairContextDigest: String(acceptedDemand["repairContextDigest"]),
        providerSettlementDigest,
        capacityConsumed: false,
      });
    }
    return refusal({ dataDir, now: new Date().toISOString(), assignmentId: input.assignmentId, slug, reason: "editor requested a carrier-only repair but the deterministic carrier projection was already stable; whole-manuscript inference is forbidden and the projection service requires repair" });
  }
  await appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: now, act: "newsroom.repair.lot-issued", subject: input.assignmentId, data: {
    provider: "urn:ame:inference-work-lot-service",
    contract: INFERENCE_WORK_CONTRACT,
    repairDemandDigest: digest(demand),
    repairContextDigest: String(acceptedDemand["repairContextDigest"]),
    proposedMove: reading.proposedMove,
    customerMutation: false,
  } });
  const repairCommission = commissionForAssignment(assignment);
  const projectionBudget = writerEvidenceProjection !== undefined && object(writerEvidenceProjection["evidenceBudget"])
    ? writerEvidenceProjection["evidenceBudget"]
    : undefined;
  const projectionTarget = projectionBudget !== undefined && object(projectionBudget["targetWords"])
    ? projectionBudget["targetWords"]
    : undefined;
  const projectedMinimum = Number(projectionTarget?.["minimum"]);
  const projectedMaximum = Number(projectionBudget?.["licensedMaximumWords"] ?? projectionTarget?.["maximum"]);
  const minimumWords = Number.isInteger(projectedMinimum) && projectedMinimum > 0
    ? projectedMinimum
    : repairCommission.evidenceBudget.targetWords.minimum;
  const maximumWords = Number.isInteger(projectedMaximum) && projectedMaximum >= minimumWords
    ? projectedMaximum
    : repairCommission.evidenceBudget.targetWords.maximum;
  let routed: RetainedMarketTextProduct;
  let stageProduct: Awaited<ReturnType<typeof settleStageProduct<RetainedMarketTextProduct>>>;
  try {
    const instruction = "Return only the complete revised Markdown article body. Do not return frontmatter, labels, analysis, code fences, or commentary.";
    const prompt = [
      composeDraftRevisionPrompt({ editorReport: editor.report, researchPacket: packet, currentBody: document.body, renderedInstructions: instructions, repairAuthority: editor.authority }),
      `LICENSED ARTICLE LENGTH: Return ${minimumWords} to ${maximumWords} words. The ${maximumWords}-word ceiling is hard; omit secondary detail rather than exceeding it.`,
    ].join("\n\n");
    stageProduct = await settleStageProduct({
      dataDir,
      now,
      stage: "newsroom-repair.complete-revised-markdown-body",
      producerContract: INFERENCE_WORK_CONTRACT,
      mechanismDigest: recordDigest({
        type: "KoiosNewsroomRepairProductMechanism",
        version: 1,
        output: "complete-revised-markdown-body",
        parser: "proseContributionBody+canonicalizeSourceUrls/v1",
        registry: STAGE_PRODUCT_REGISTRY_CONTRACT,
      }),
      inputs: {
        instructionDigest: recordDigest(instruction),
        promptDigest: recordDigest(prompt),
        serviceClass: "accountable-prose",
        currentBodyDigest: digest(document.body),
        researchPacketDigest: recordDigest(packet),
        repairDirectiveDigest: editor.digest,
        minimumWords,
        maximumWords,
      },
      execute: async () => {
        const result: TextWorkCandidate = await (input.procureInference ?? requestTextWorkCandidate)({
          instruction,
          prompt,
          serviceClass: "accountable-prose",
          executionMode: "live",
          routingProfile: "extended",
          extendedRoutingRationale: "daily edition repair work; bounded profile insufficient for source re-research",
        });
        return Object.freeze({
          type: "KoiosRetainedMarketTextProduct",
          text: result.text,
          serviceClass: result.serviceClass,
          workLot: result.workLot,
          requestNi: result.requestNi,
          resultNi: result.resultNi,
          settlementNi: result.settlementNi,
          receiptNi: result.receiptNi,
          provider: result.provider,
          model: result.model,
          exchangeDigest: recordDigest(result.exchange),
        }) as RetainedMarketTextProduct;
      },
      admit: admitRetainedMarketTextProduct,
    });
    routed = stageProduct.product as RetainedMarketTextProduct;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    await appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: new Date().toISOString(), act: "newsroom.repair.obstructed", subject: input.assignmentId, data: { reason, repairDemandDigest: digest(demand), provider: "urn:ame:inference-work-lot-service", contract: INFERENCE_WORK_CONTRACT, customerMutation: false } });
    return Object.freeze({ kind: "koios.newsroom-repair-dispatch", disposition: "obstructed", assignmentId: input.assignmentId, slug, reason, repairDemandDigest: digest(demand), repairContextDigest: String(acceptedDemand["repairContextDigest"]) });
  }
  const providerSettlement = Object.freeze({ type: "InferenceWorkSettlement", workLot: routed.workLot, requestNi: routed.requestNi, resultNi: routed.resultNi, settlementNi: routed.settlementNi, receiptNi: routed.receiptNi, provider: routed.provider, model: routed.model, serviceClass: routed.serviceClass, exchangeDigest: routed.exchangeDigest });
  const providerSettlementDigest = recordDigest(providerSettlement);
  if (stageProduct.reused) {
    await appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: now, act: "newsroom.repair.stage-product-reused", subject: stageProduct.requestDigest, data: {
      assignmentId: input.assignmentId,
      slug,
      stageProductDigest: stageProduct.productDigest,
      providerSettlementDigest,
      inferencePurchased: false,
    } });
  } else {
    await appendKoiosAct({ dataRoot: dataDir, ledger: "provider-usage", instant: now, act: "inference.consumed", subject: `newsroom-repair-attempt:${input.assignmentId}:${providerSettlementDigest}`, data: {
      assignmentId: input.assignmentId,
      slug,
      provider: routed.provider,
      market: "urn:ame:inference-work-lot-service",
      contract: INFERENCE_WORK_CONTRACT,
      providerSettlementDigest,
      workLot: routed.workLot,
      requestNi: routed.requestNi,
      resultNi: routed.resultNi,
      settlementNi: routed.settlementNi,
      receiptNi: routed.receiptNi,
      serviceClass: routed.serviceClass,
      usage: null,
      cost: null,
      resultBodyRecorded: true,
      resultBodyDigest: recordDigest(routed.text),
      stageProductRequestDigest: stageProduct.requestDigest,
      stageProductDigest: stageProduct.productDigest,
      customerAdmission: false,
    } });
  }
  const completion = routed.text;
  const sourceUrls = packet.sourceUrls as readonly string[];
  let body: string;
  try { body = canonicalizeSourceUrls(proseContributionBody(completion), sourceUrls); }
  catch (error) { return refusal({ dataDir, now: new Date().toISOString(), assignmentId: input.assignmentId, slug, reason: `market prose failed customer parsing: ${error instanceof Error ? error.message : String(error)}` }); }
  const words = body.split(/\s+/gu).filter(Boolean).length;
  const bodyProblems = [
    ...(sourceUrls.some((url) => body.includes(url)) ? [] : ["repaired prose omitted every witnessed source citation"]),
    ...(words >= minimumWords ? [] : [`repaired prose returned ${words} words; commission minimum is ${minimumWords}`]),
    ...(words <= maximumWords ? [] : [`repaired prose returned ${words} words; licensed maximum is ${maximumWords}`]),
    ...(body.includes("[claim:") ? ["repaired prose leaked internal claim tokens"] : []),
  ];
  if (bodyProblems.length > 0) return refusal({ dataDir, now: new Date().toISOString(), assignmentId: input.assignmentId, slug, reason: bodyProblems.join("; ") });
  const current = decodeFrontMatterDocument(readFileSync(path, "utf8"));
  if (digest(current.body) !== repairContext.manuscriptDigest) return refusal({ dataDir, now: new Date().toISOString(), assignmentId: input.assignmentId, slug, reason: "manuscript changed after the repair lot was issued" });
  const currentTitle = typeof current.frontMatter["title"] === "string" ? current.frontMatter["title"] : "";
  let headline: string;
  let headlineCapacityConsumed = false;
  try {
    const contribution = await accountableRepairHeadline({ assignment, assignmentDigest, packet, body, currentTitle, repairDirectiveDigest: editor.digest, dataDir });
    headline = contribution.headline;
    headlineCapacityConsumed = contribution.capacityConsumed;
  } catch (error) {
    return refusal({ dataDir, now: new Date().toISOString(), assignmentId: input.assignmentId, slug, reason: `headline repair failed: ${error instanceof Error ? error.message : String(error)}` });
  }
  const priorKoios = object(current.frontMatter["koios"]) ? current.frontMatter["koios"] : {};
  const { predecessor_assignment_id: _retiredPredecessor, ...retainedKoios } = priorKoios;
  const next = Object.freeze({
    ...current,
    frontMatter: Object.freeze({
      ...current.frontMatter,
      draft: true,
      title: headline,
      description: descriptionFromProse(body),
      summary: summaryFromProse(body),
      tweet: headline,
      references: Object.freeze([...packet.candidateReferences]),
      koios: Object.freeze({
        ...retainedKoios,
        assignment_id: input.assignmentId,
        repair_context_digest: String(acceptedDemand["repairContextDigest"]),
        gates_clear: false,
      }),
    }),
    body: `${body}\n`,
  });
  writeFileSync(path, encodeFrontMatterDocument(next), "utf8");
  const after = readFileSync(path, "utf8");
  await recordAssignmentRepairRevalidation(dataDir, { assignmentId: input.assignmentId, repairProductDigest: stageProduct.productDigest, repairMechanismDigest: String(acceptedDemand["repairContextDigest"]), authority: "koios.news/newsroom-learning", contract: "newsroom-repair-dispatcher/v5" }, now);
  await appendKoiosAct({ dataRoot: dataDir, ledger: "provider-usage", instant: now, act: "inference.result.applied", subject: `newsroom-repair:${input.assignmentId}:${stageProduct.productDigest}`, data: {
    assignmentId: input.assignmentId,
    slug,
    provider: routed.provider,
    market: "urn:ame:inference-work-lot-service",
    contract: INFERENCE_WORK_CONTRACT,
    providerSettlementDigest,
    workLot: routed.workLot,
    requestNi: routed.requestNi,
    resultNi: routed.resultNi,
    settlementNi: routed.settlementNi,
    receiptNi: routed.receiptNi,
    usage: null,
    cost: null,
    resultBodyRecorded: true,
    resultBodyDigest: recordDigest(routed.text),
    stageProductRequestDigest: stageProduct.requestDigest,
    stageProductDigest: stageProduct.productDigest,
    inferencePurchased: !stageProduct.reused,
    customerAdmission: true,
  } });
  await appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: now, act: "newsroom.repair.replay-ready", subject: input.assignmentId, data: {
    assignmentId: input.assignmentId,
    slug,
    repairDemandDigest: digest(demand),
    repairContextDigest: String(acceptedDemand["repairContextDigest"]),
    providerSettlementDigest,
    beforeDigest: recordDigest(before),
    afterDigest: recordDigest(after),
    assignmentIdentityPreserved: true,
    editorialAcceptance: false,
    publication: false,
  } });
  return Object.freeze({
    kind: "koios.newsroom-repair-dispatch",
    disposition: "replay-ready",
    assignmentId: input.assignmentId,
    repairAssignmentId: input.assignmentId,
    slug,
    repairDemandDigest: digest(demand),
    repairContextDigest: String(acceptedDemand["repairContextDigest"]),
    providerSettlementDigest,
    capacityConsumed: !stageProduct.reused || headlineCapacityConsumed,
  });
}
