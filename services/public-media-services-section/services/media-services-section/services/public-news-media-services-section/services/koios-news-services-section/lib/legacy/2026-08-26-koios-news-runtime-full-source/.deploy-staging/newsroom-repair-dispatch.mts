// Koios-owned phase transition from a terminal newsroom learning reading to a
// separately contracted LISS repair, successor assignment, and replay-ready
// manuscript.  LISS supplies prose only; Koios owns context, validation,
// serialization, assignment state, and later independent editorial judgment.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { decodeFrontMatterDocument, encodeFrontMatterDocument } from "@emsenn/organizing-a-content-farm";

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
  createSuccessorAssignment,
  readAssignment,
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
import { procureLissProse } from "../researching/writing/editing/liss-editorial.mjs";
import { repairManuscriptEditorialSurfaces } from "../researching/writing/editing/standards.mjs";
import { exchangeLissActivity } from "./liss-activitystreams-client.mjs";
import { inspectNewsroomLearning, type LearningReading } from "./newsroom-learning.mjs";
import {
  acceptExactLissOffer,
  digest,
  formLissResultInquiry,
  formNewsroomRepairDemand,
  solicitLissProseRepair,
  verifyProseInferenceSettlement,
} from "./newsroom-repair-dispatcher.mjs";
import { appendKoiosAct, readKoiosLedger, recordDigest, type JsonObject } from "./ledger.mjs";

export { editorRequestsCarrierRepair };

type RecordValue = Record<string, unknown>;
const SITE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

export type NewsroomRepairDispatchResult = Readonly<{
  kind: "koios.newsroom-repair-dispatch";
  disposition: "replay-ready" | "refused" | "obstructed";
  predecessorAssignmentId: string;
  successorAssignmentId?: string;
  slug?: string;
  reason?: string;
  repairDemandDigest?: string;
  repairContextDigest?: string;
  providerSettlementDigest?: string;
}>;

function object(value: unknown): value is RecordValue {
  return value !== null && typeof value === "object" && !Array.isArray(value);
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
  if (!(["repair-draft", "replay-writer"] as const).includes(reading.proposedMove as "repair-draft" | "replay-writer")) {
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

function accountableRepairHeadline(input: Readonly<{
  assignment: ReturnType<typeof readAssignment>;
  assignmentDigest: string;
  packet: ReturnType<typeof researchPacket>;
  body: string;
  currentTitle: string;
  repairDirectiveDigest: string;
  dataDir: string;
}>): string {
  const matchingSource = input.packet.intakeSources.find((source) => headlineMatchesSourceTitle(input.currentTitle, [source.title]));
  if (matchingSource === undefined) return input.currentTitle;
  const now = new Date().toISOString();
  const commission = commissionForAssignment(input.assignment);
  const config = JSON.parse(readFileSync(resolve(SITE_ROOT, "producing-content.config.json"), "utf8")) as RecordValue;
  const writingPolicy = JSON.parse(readFileSync(resolve(SITE_ROOT, "lib/law/accountable-attention-and-publication.json"), "utf8")) as RecordValue;
  const result = procureNewswireProse({
    purpose: `Replace a source-colliding headline for repaired assignment ${input.assignment.assignmentId}.`,
    assignmentId: input.assignment.assignmentId,
    assignmentDigest: input.assignmentDigest,
    prompt: headlineCommissionPrompt({ assignmentTerm: input.assignment.term, sourceTitle: matchingSource.title, body: input.body, commission }),
    licensedEditorialStateDigest: recordDigest({ assignmentDigest: input.assignmentDigest, packetDigest: recordDigest(input.packet), repairDirectiveDigest: input.repairDirectiveDigest }),
    researchPacketDigest: recordDigest(input.packet),
    writingPolicyDigest: recordDigest(writingPolicy),
    stylePolicyDigest: recordDigest(config["voice"] ?? {}),
    requiredSourceUrls: input.packet.sourceUrls,
    shape: "headline",
    admissibleTiers: ["free-groq", "free-gemini", "free-nim"],
    now,
    dataDir: input.dataDir,
  });
  const selection = selectAccountableHeadline({ raw: result.text, fallback: matchingSource.title, assignmentTerm: input.assignment.term, body: input.body, sourceUrls: input.packet.sourceUrls });
  appendKoiosAct({ dataRoot: input.dataDir, ledger: "audience-product", instant: now, act: selection.accepted ? "attention-surface.repair-headline-selected" : "attention-surface.repair-headline-refused", subject: input.assignment.assignmentId, data: { selection, provider: result.selectedProvider, tier: result.selectedTier, model: result.model, sourceCollision: matchingSource.title, factualWarrant: false } });
  if (!selection.accepted) throw new Error(`replacement headline failed accountable-originality admission: ${selection.findings.join("; ")}`);
  return selection.selected;
}

function refusal(input: Readonly<{ dataDir: string; now: string; assignmentId: string; reason: string; slug?: string }>): NewsroomRepairDispatchResult {
  const result = Object.freeze({
    kind: "koios.newsroom-repair-dispatch" as const,
    disposition: "refused" as const,
    predecessorAssignmentId: input.assignmentId,
    ...(input.slug === undefined ? {} : { slug: input.slug }),
    reason: input.reason,
  });
  appendKoiosAct({ dataRoot: input.dataDir, ledger: "contract-events", instant: input.now, act: "newsroom.repair.refused", subject: input.assignmentId, data: result as unknown as JsonObject });
  return result;
}

function resumableSuccessor(dataDir: string, contentDir: string, predecessorAssignmentId: string): NewsroomRepairDispatchResult | undefined {
  const prior = readKoiosLedger(dataDir, "contract-events")
    .filter((candidate) => candidate["act"] === "newsroom.repair.replay-ready")
    .filter((candidate) => object(candidate["data"]) && candidate["data"]["predecessorAssignmentId"] === predecessorAssignmentId)
    .sort((left, right) => String(left["recordedAt"] ?? "").localeCompare(String(right["recordedAt"] ?? "")))
    .at(-1);
  if (prior === undefined || !object(prior["data"])) return undefined;
  const data = prior["data"];
  const successorAssignmentId = typeof prior["subject"] === "string" ? prior["subject"] : undefined;
  const slug = typeof data["slug"] === "string" ? data["slug"] : undefined;
  if (successorAssignmentId === undefined || slug === undefined) return undefined;
  try {
    const manuscript = decodeFrontMatterDocument(readFileSync(resolve(contentDir, `${slug}.md`), "utf8"));
    const koios = object(manuscript.frontMatter["koios"]) ? manuscript.frontMatter["koios"] : {};
    if (koios["assignment_id"] !== successorAssignmentId || koios["predecessor_assignment_id"] !== predecessorAssignmentId) return undefined;
    readAssignment(dataDir, successorAssignmentId, loadPosts(contentDir));
  } catch { return undefined; }
  return Object.freeze({
    kind: "koios.newsroom-repair-dispatch",
    disposition: "replay-ready",
    predecessorAssignmentId,
    successorAssignmentId,
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
  socketPath?: string;
  pollMilliseconds?: number;
  timeoutMilliseconds?: number;
}>): Promise<NewsroomRepairDispatchResult> {
  const now = input.now ?? new Date().toISOString();
  const dataDir = resolve(input.dataDir ?? DEFAULT_DATA_DIR);
  const contentDir = resolve(input.contentDir ?? DEFAULT_CONTENT_DIR);
  const resume = resumableSuccessor(dataDir, contentDir, input.assignmentId);
  if (resume !== undefined) {
    appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: now, act: "newsroom.repair.resumed", subject: resume.successorAssignmentId!, data: { predecessorAssignmentId: input.assignmentId, slug: resume.slug!, providerReinvoked: false } });
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
    editor = latestManuscriptRepairDirective({ dataDir, assignmentId: input.assignmentId, slug, manuscript: before });
    terminal = latestTerminalRecord(dataDir, input.assignmentId);
    instructions = renderedDraftRevisionInstructions(editor.authority);
  } catch (error) {
    return refusal({ dataDir, now, assignmentId: input.assignmentId, slug, reason: `repair context could not be formed: ${error instanceof Error ? error.message : String(error)}` });
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
  const assignmentDigest = recordDigest(assignmentContext);
  const sourcePacketDigest = recordDigest(packet);
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
      appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: new Date().toISOString(), act: "newsroom.repair.claim-deck-admitted", subject: assignment.assignmentId, data: {
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
    terminalCircuitDigest: recordDigest(terminal),
    failureLayer: reading.failureLayer,
    proposedMove: reading.proposedMove,
  });
  const demand = formNewsroomRepairDemand(enrichedReading, repairContext);
  if (demand["type"] === "NewsroomRepairRefusal") {
    return refusal({ dataDir, now, assignmentId: input.assignmentId, slug, reason: `repair demand refused: ${String((demand as RecordValue)["code"] ?? "unknown")}` });
  }
  const acceptedDemand = demand as RecordValue;
  // Prose is not authority to override the structured replay boundary. An
  // Editor may mention metadata while requiring a whole writer replay; only
  // explicit repair tools or a draft-repair learning move authorize the
  // deterministic carrier adapter.
  if (editor.repairTools.length > 0 || (reading.proposedMove === "repair-draft" && editorRequestsCarrierRepair(editor.report))) {
    const deterministicBefore = readFileSync(path, "utf8");
    const surfaceRepair = editor.repairTools.length > 0
      ? applyBoundedEditorialRepairTools(contentDir, slug, editor.repairTools)
      : repairManuscriptEditorialSurfaces(contentDir, slug);
    const deterministicAfter = readFileSync(path, "utf8");
    if (deterministicAfter !== deterministicBefore) {
      const successor = createSuccessorAssignment(dataDir, {
        predecessorAssignmentId: input.assignmentId,
        successorAssignmentId: String((acceptedDemand["successor"] as RecordValue)["assignmentId"]),
        reason: editor.repairTools.length > 0 ? "bounded editor-selected repair tools after terminal newsroom learning" : "deterministic carrier repair after terminal newsroom learning",
        authority: "koios.news/newsroom-learning",
        contract: "newsroom-repair-dispatcher/v4",
        terminalCircuitDigest: recordDigest(terminal),
      }, loadPosts(contentDir), new Date().toISOString());
      const repaired = decodeFrontMatterDocument(deterministicAfter);
      const priorKoios = object(repaired.frontMatter["koios"]) ? repaired.frontMatter["koios"] : {};
      const next = Object.freeze({
        ...repaired,
        frontMatter: Object.freeze({
          ...repaired.frontMatter,
          draft: true,
          koios: Object.freeze({
            ...priorKoios,
            assignment_id: successor.assignment.assignmentId,
            predecessor_assignment_id: input.assignmentId,
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
      appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: new Date().toISOString(), act: "newsroom.repair.deterministic-ready", subject: successor.assignment.assignmentId, data: {
        predecessorAssignmentId: input.assignmentId,
        slug,
        changed: surfaceRepair.changed,
        repairDemandDigest: digest(demand),
        repairContextDigest: String(acceptedDemand["repairContextDigest"]),
        providerSettlementDigest,
        customerMutation: true,
      } });
      appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: new Date().toISOString(), act: "newsroom.repair.replay-ready", subject: successor.assignment.assignmentId, data: {
        predecessorAssignmentId: input.assignmentId,
        slug,
        repairDemandDigest: digest(demand),
        repairContextDigest: String(acceptedDemand["repairContextDigest"]),
        providerSettlementDigest,
        beforeDigest: recordDigest(deterministicBefore),
        afterDigest: recordDigest(after),
        successorCreated: successor.created,
        editorialAcceptance: false,
        publication: false,
        carrier: editor.repairTools.length > 0 ? "koios-bounded-editorial-repair-tools" : "koios-deterministic-editorial-surfaces",
      } });
      return Object.freeze({
        kind: "koios.newsroom-repair-dispatch",
        disposition: "replay-ready",
        predecessorAssignmentId: input.assignmentId,
        successorAssignmentId: successor.assignment.assignmentId,
        slug,
        repairDemandDigest: digest(demand),
        repairContextDigest: String(acceptedDemand["repairContextDigest"]),
        providerSettlementDigest,
      });
    }
    return refusal({ dataDir, now: new Date().toISOString(), assignmentId: input.assignmentId, slug, reason: "editor requested a carrier-only repair but the deterministic carrier projection was already stable; whole-manuscript inference is forbidden and the projection service requires repair" });
  }
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: now, act: "newsroom.repair.lot-issued", subject: input.assignmentId, data: {
    provider: "urn:ame:logical-inference-service-section",
    contract: "inference-fabric-activitystreams-service",
    repairDemandDigest: digest(demand),
    repairContextDigest: String(acceptedDemand["repairContextDigest"]),
    proposedMove: reading.proposedMove,
    customerMutation: false,
  } });
  let settlement: Readonly<JsonObject>;
  try {
    const client = { ...(input.socketPath === undefined ? {} : { socketPath: input.socketPath }), timeoutMilliseconds: 30_000 };
    const solicitation = solicitLissProseRepair(demand) as Readonly<JsonObject>;
    const offer = await exchangeLissActivity(solicitation, client);
    if (offer["type"] !== "Offer") throw new Error(`LISS refused repair solicitation: ${JSON.stringify(offer["object"] ?? offer)}`);
    const contract = acceptExactLissOffer(demand, solicitation, offer) as Readonly<JsonObject>;
    const submission = await exchangeLissActivity(contract, client);
    if (submission["type"] !== "Accept") throw new Error(`LISS refused repair invocation: ${JSON.stringify(submission["object"] ?? submission)}`);
    const inquiry = formLissResultInquiry(submission) as Readonly<JsonObject>;
    const started = Date.now();
    const timeout = input.timeoutMilliseconds ?? 900_000;
    const poll = input.pollMilliseconds ?? 1_000;
    while (true) {
      settlement = await exchangeLissActivity(inquiry, client);
      if (settlement["type"] === "Accept") break;
      const responseObject = object(settlement["object"]) ? settlement["object"] : {};
      if (responseObject["refusalType"] !== "result-not-settled" || responseObject["retryable"] !== true) {
        throw new Error(`LISS repair settlement refused: ${JSON.stringify(responseObject)}`);
      }
      if (Date.now() - started >= timeout) throw new Error("LISS repair did not settle before the customer timeout");
      await new Promise((resolveWait) => setTimeout(resolveWait, poll));
    }
    verifyProseInferenceSettlement(demand, settlement);
  } catch (error) {
    const socketReason = error instanceof Error ? error.message : String(error);
    try {
      const prompt = composeDraftRevisionPrompt({ editorReport: editor.report, researchPacket: packet, currentBody: document.body, renderedInstructions: instructions, repairAuthority: editor.authority });
      const replayWriter = reading.proposedMove === "replay-writer";
      const routed = procureLissProse({
        purpose: `${replayWriter ? "Replay the writer for" : "Repair"} Koios assignment ${input.assignmentId} after terminal newsroom learning.`,
        prompt,
        tiers: replayWriter ? ["leader-claude"] : ["free-gemini", "free-nim", "leader-claude"],
        models: replayWriter ? { "leader-claude": "claude-sonnet-4-6" } : {
          "free-gemini": "gemini-3.1-flash-lite",
          "free-nim": "meta/llama-3.1-8b-instruct",
          "leader-claude": "claude-sonnet-4-6",
        },
        requiredText: [packet.sourceUrls[0]!],
        maxTokens: 4_000,
      });
      const expected = (solicitLissProseRepair(demand) as JsonObject)["object"] as JsonObject;
      const expectedRequest = expected["request"] as JsonObject;
      settlement = Object.freeze({
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Accept",
        actor: "urn:ame:logical-inference-service-section",
        object: Object.freeze({
          type: "InferenceSettlementResult",
          contract: "inference-fabric-activitystreams-service",
          jobId: expectedRequest["id"],
          jobDigest: digest(expectedRequest),
          result: Object.freeze({ text: routed.text, model: routed.model, usage: null, cost: null, selectedTier: routed.selectedTier, selectedProvider: routed.selectedProvider, providerResultDigest: recordDigest(routed.providerResult) }),
          carrier: "contracted-direct-compatibility",
        }),
      });
      appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: new Date().toISOString(), act: "newsroom.repair.carrier-fallback", subject: input.assignmentId, data: { socketReason: socketReason.slice(0, 800), carrier: "contracted-direct-compatibility", proposedMove: reading.proposedMove, selectedTier: routed.selectedTier, selectedProvider: routed.selectedProvider, customerMutation: false } });
    } catch (fallbackError) {
      const reason = `${socketReason}; direct contracted fallback failed: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`;
      appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: new Date().toISOString(), act: "newsroom.repair.obstructed", subject: input.assignmentId, data: { reason, repairDemandDigest: digest(demand), provider: "urn:ame:logical-inference-service-section", customerMutation: false } });
      return Object.freeze({ kind: "koios.newsroom-repair-dispatch", disposition: "obstructed", predecessorAssignmentId: input.assignmentId, slug, reason, repairDemandDigest: digest(demand), repairContextDigest: String(acceptedDemand["repairContextDigest"]) });
    }
  }
  verifyProseInferenceSettlement(demand, settlement);
  const settlementObject = settlement["object"] as JsonObject;
  const providerResult = settlementObject["result"] as JsonObject;
  const providerSettlementDigest = recordDigest(settlement);
  appendKoiosAct({ dataRoot: dataDir, ledger: "provider-usage", instant: new Date().toISOString(), act: "inference.consumed", subject: `newsroom-repair-attempt:${input.assignmentId}:${providerSettlementDigest}`, data: {
    assignmentId: input.assignmentId,
    slug,
    provider: "urn:ame:logical-inference-service-section",
    contract: "inference-fabric-activitystreams-service",
    providerSettlementDigest,
    jobId: settlementObject["jobId"],
    jobDigest: settlementObject["jobDigest"],
    model: providerResult["model"] ?? null,
    usage: providerResult["usage"] ?? null,
    cost: providerResult["cost"] ?? null,
    resultBodyRecorded: false,
    customerAdmission: false,
  } });
  const completion = String(providerResult["text"] ?? "");
  const sourceUrls = packet.sourceUrls as readonly string[];
  let body: string;
  try { body = canonicalizeSourceUrls(proseContributionBody(completion), sourceUrls); }
  catch (error) { return refusal({ dataDir, now: new Date().toISOString(), assignmentId: input.assignmentId, slug, reason: `LISS prose failed customer parsing: ${error instanceof Error ? error.message : String(error)}` }); }
  const words = body.split(/\s+/gu).filter(Boolean).length;
  const bodyProblems = [
    ...(sourceUrls.some((url) => body.includes(url)) ? [] : ["repaired prose omitted every witnessed source citation"]),
    ...(words >= 600 ? [] : [`repaired prose returned ${words} words; minimum is 600`]),
    ...(words <= 1_100 ? [] : [`repaired prose returned ${words} words; maximum is 1100`]),
    ...(body.includes("[claim:") ? ["repaired prose leaked internal claim tokens"] : []),
  ];
  if (bodyProblems.length > 0) return refusal({ dataDir, now: new Date().toISOString(), assignmentId: input.assignmentId, slug, reason: bodyProblems.join("; ") });
  const current = decodeFrontMatterDocument(readFileSync(path, "utf8"));
  if (digest(current.body) !== repairContext.manuscriptDigest) return refusal({ dataDir, now: new Date().toISOString(), assignmentId: input.assignmentId, slug, reason: "manuscript changed after the repair lot was issued" });
  const currentTitle = typeof current.frontMatter["title"] === "string" ? current.frontMatter["title"] : "";
  let headline: string;
  try {
    headline = accountableRepairHeadline({ assignment, assignmentDigest, packet, body, currentTitle, repairDirectiveDigest: editor.digest, dataDir });
  } catch (error) {
    return refusal({ dataDir, now: new Date().toISOString(), assignmentId: input.assignmentId, slug, reason: `headline repair failed: ${error instanceof Error ? error.message : String(error)}` });
  }
  const successor = createSuccessorAssignment(dataDir, {
    predecessorAssignmentId: input.assignmentId,
    successorAssignmentId: String((acceptedDemand["successor"] as RecordValue)["assignmentId"]),
    reason: `digest-bound ${reading.proposedMove} after terminal newsroom learning`,
    authority: "koios.news/newsroom-learning",
    contract: "newsroom-repair-dispatcher/v4",
    terminalCircuitDigest: recordDigest(terminal),
    sourceUrls: packet.sourceUrls,
  }, loadPosts(contentDir), new Date().toISOString());
  const priorKoios = object(current.frontMatter["koios"]) ? current.frontMatter["koios"] : {};
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
        ...priorKoios,
        assignment_id: successor.assignment.assignmentId,
        predecessor_assignment_id: input.assignmentId,
        repair_context_digest: String(acceptedDemand["repairContextDigest"]),
        gates_clear: false,
      }),
    }),
    body: `${body}\n`,
  });
  writeFileSync(path, encodeFrontMatterDocument(next), "utf8");
  const after = readFileSync(path, "utf8");
  appendKoiosAct({ dataRoot: dataDir, ledger: "provider-usage", instant: new Date().toISOString(), act: "inference.result.applied", subject: `newsroom-repair:${successor.assignment.assignmentId}`, data: {
    assignmentId: successor.assignment.assignmentId,
    predecessorAssignmentId: input.assignmentId,
    slug,
    provider: "urn:ame:logical-inference-service-section",
    contract: "inference-fabric-activitystreams-service",
    providerSettlementDigest,
    jobId: settlementObject["jobId"],
    jobDigest: settlementObject["jobDigest"],
    usage: null,
    cost: null,
    resultBodyRecorded: false,
    customerAdmission: true,
  } });
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: new Date().toISOString(), act: "newsroom.repair.replay-ready", subject: successor.assignment.assignmentId, data: {
    predecessorAssignmentId: input.assignmentId,
    slug,
    repairDemandDigest: digest(demand),
    repairContextDigest: String(acceptedDemand["repairContextDigest"]),
    providerSettlementDigest,
    beforeDigest: recordDigest(before),
    afterDigest: recordDigest(after),
    successorCreated: successor.created,
    editorialAcceptance: false,
    publication: false,
  } });
  return Object.freeze({
    kind: "koios.newsroom-repair-dispatch",
    disposition: "replay-ready",
    predecessorAssignmentId: input.assignmentId,
    successorAssignmentId: successor.assignment.assignmentId,
    slug,
    repairDemandDigest: digest(demand),
    repairContextDigest: String(acceptedDemand["repairContextDigest"]),
    providerSettlementDigest,
  });
}
