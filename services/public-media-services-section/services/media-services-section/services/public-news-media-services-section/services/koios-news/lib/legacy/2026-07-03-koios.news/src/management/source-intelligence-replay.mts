// Koios-owned purchase of deeper reporting for an already formed assignment.
// Search produces leads, source providers produce text custody, the Service
// Section admits a packet, and only that admitted packet may reach a writer.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { decodeFrontMatterDocument, encodeFrontMatterDocument } from "@red-cup-engineering/organizing-a-content-farm";

import { DEFAULT_CONTENT_DIR, DEFAULT_DATA_DIR } from "../config.mjs";
import { loadPosts } from "../content.mjs";
import { AdmissibleResearchPacketRefusal, procureAdmissibleResearchPacket, readAdmissibleResearchPacket } from "../researching/sourcing/admissible-research-packet-contract.mjs";
import { recallSourceBundles } from "../researching/sourcing/newscable-contract.mjs";
import { procurePriorResearchForIssue } from "../researching/sourcing/prior-research-contract.mjs";
import { procurePublicSourceDiscovery, PublicSourceDiscoveryRefusal } from "../researching/sourcing/public-source-discovery-contract.mjs";
import { procurePublicWebSourceText } from "../researching/sourcing/public-web-source-contract.mjs";
import { createSuccessorAssignment, readAssignment, readAssignmentDisposition, recordAssignmentDisposition } from "../researching/writing/assignments.mjs";
import { commissionForAssignment } from "./editorial-commissioning.mjs";
import { admittedIndependentSourceDomainCount, independentSourceDomainCount, packetSupportsAssignment, SOURCE_INTELLIGENCE_REPLAY_MECHANISM_VERSION, sourceDiscoveryCandidateSupportsEvent, sourceUrlsMeetingDomainFloor } from "./issue-controller.mjs";
import { appendDatedRecord, appendKoiosAct, readKoiosLedger, recordDigest, type JsonObject } from "./ledger.mjs";

export type SourceIntelligenceReplayResult = Readonly<{
  kind: "koios.source-intelligence-replay";
  disposition: "ready" | "quiescent" | "refused";
  assignmentId: string;
  slug?: string;
  successorAssignmentId?: string;
  predecessorPacketDigest: string;
  admittedPacketDigest?: string;
  sourceCountBefore: number;
  sourceCountAfter: number;
  mechanismVersion: number;
  retryable?: boolean;
  nextRetryAt?: string;
  reason?: string;
}>;

export type SourceIntelligenceReplayDependencies = Readonly<{
  discover: typeof procurePublicSourceDiscovery;
  recall: typeof recallSourceBundles;
  acquirePublicText: typeof procurePublicWebSourceText;
  procurePriorResearch: typeof procurePriorResearchForIssue;
  admitPacket: typeof procureAdmissibleResearchPacket;
}>;

const DEFAULT_DEPENDENCIES: SourceIntelligenceReplayDependencies = Object.freeze({
  discover: procurePublicSourceDiscovery,
  recall: recallSourceBundles,
  acquirePublicText: procurePublicWebSourceText,
  procurePriorResearch: procurePriorResearchForIssue,
  admitPacket: procureAdmissibleResearchPacket,
});

class SourceIntelligenceExhaustion extends Error {
  readonly retryable = false;
}

const TERMINAL_PACKET_REFUSALS = new Set([
  "assignment-lens-unsupported",
  "commission-evidence-budget-insufficient",
  "fresh-evidence-insufficient",
]);

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function bounded(value: unknown, maximum: number): string | undefined {
  if (typeof value !== "string" || value.trim() === "") return undefined;
  return value.trim().slice(0, maximum);
}

async function refusal(input: Readonly<{
  assignmentId: string;
  slug?: string;
  now: string;
  dataDir: string;
  predecessorPacketDigest: string;
  sourceCountBefore: number;
  reason: string;
  retryable: boolean;
}>): Promise<SourceIntelligenceReplayResult> {
  const nextRetryAt = input.retryable ? new Date(Date.parse(input.now) + 4 * 60 * 60 * 1_000).toISOString() : undefined;
  const result = Object.freeze({
    kind: "koios.source-intelligence-replay" as const,
    disposition: "refused" as const,
    assignmentId: input.assignmentId,
    ...(input.slug === undefined ? {} : { slug: input.slug }),
    predecessorPacketDigest: input.predecessorPacketDigest,
    sourceCountBefore: input.sourceCountBefore,
    sourceCountAfter: input.sourceCountBefore,
    mechanismVersion: SOURCE_INTELLIGENCE_REPLAY_MECHANISM_VERSION,
    retryable: input.retryable,
    ...(nextRetryAt === undefined ? {} : { nextRetryAt }),
    reason: input.reason,
  });
  await appendKoiosAct({ dataRoot: input.dataDir, ledger: "contract-events", instant: input.now, act: "source-intelligence.replay-settled", subject: input.assignmentId, data: result as unknown as JsonObject });
  if (!input.retryable) {
    const reason = input.reason || "bounded source intelligence found no evidence set capable of carrying the commission";
    const priorDisposition = readAssignmentDisposition(input.dataDir, input.assignmentId);
    const disposition = priorDisposition ?? await recordAssignmentDisposition(input.dataDir, {
      assignmentId: input.assignmentId,
      disposition: "refused",
      reason,
      authority: "koios.news/source-intelligence",
      contract: "koios.news/source-intelligence-exhaustion/v1",
    }, input.now);
    await appendKoiosAct({ dataRoot: input.dataDir, ledger: "contract-events", instant: input.now, act: "assignment.source-intelligence-refused", subject: input.assignmentId, data: { dispositionDigest: recordDigest(disposition), sourceSettlementDigest: recordDigest(result), queueReleased: true, sourceReuseReleased: false, reason, customerMutation: true } });
  }
  return result;
}

/** Buy corroboration before another prose purchase. Provider-returned search
 * metadata is used only to select URLs; all reportable warrant must survive
 * retrieval and the Service Section's independent packet admission. */
export async function settleSourceIntelligenceReplay(input: Readonly<{
  assignmentId: string;
  slug?: string;
  now?: string;
  dataDir?: string;
  contentDir?: string;
  maximumAgeHours?: number;
  forceDeepen?: boolean;
  dependencies?: Partial<SourceIntelligenceReplayDependencies>;
}>): Promise<SourceIntelligenceReplayResult> {
  const now = input.now ?? new Date().toISOString();
  const dataDir = resolve(input.dataDir ?? DEFAULT_DATA_DIR);
  const contentDir = resolve(input.contentDir ?? DEFAULT_CONTENT_DIR);
  const dependencies = Object.freeze({ ...DEFAULT_DEPENDENCIES, ...(input.dependencies ?? {}) });
  const assignment = readAssignment(dataDir, input.assignmentId, loadPosts(contentDir));
  const predecessor = readAdmissibleResearchPacket(dataDir, input.assignmentId);
  if (predecessor === undefined) throw new Error(`source-intelligence replay requires an admitted packet for ${input.assignmentId}`);
  const predecessorPacketDigest = recordDigest(predecessor);
  const admittedExistingUrls = Object.freeze(predecessor.intakeSources.map((source) => source.url));
  const sourceCountBefore = admittedIndependentSourceDomainCount(predecessor);
  const lead = predecessor.intakeSources[0];
  const leadTitle = lead?.title ?? assignment.term;
  const commission = commissionForAssignment(assignment);
  // A downstream evidence judge can return a packet that satisfies the
  // nominal domain floor yet carries too few distinct assertions or too
  // little licensed reporting. In that case replay must add information,
  // not declare the same packet quiescent merely because it counted to two.
  const required = input.forceDeepen
    ? Math.min(6, Math.max(commission.evidenceBudget.minimumIndependentSources, sourceCountBefore + 1))
    : commission.evidenceBudget.minimumIndependentSources;
  if (sourceCountBefore >= required) {
    return Object.freeze({ kind: "koios.source-intelligence-replay", disposition: "quiescent", assignmentId: assignment.assignmentId, ...(input.slug === undefined ? {} : { slug: input.slug }), predecessorPacketDigest, admittedPacketDigest: predecessorPacketDigest, sourceCountBefore, sourceCountAfter: sourceCountBefore, mechanismVersion: SOURCE_INTELLIGENCE_REPLAY_MECHANISM_VERSION });
  }

  try {
    const discovered = await dependencies.discover({
      requestId: `${assignment.assignmentId}:source-depth:${predecessorPacketDigest.replace(/^sha256:/u, "").slice(0, 16)}`,
      lead: Object.freeze({
        title: leadTitle,
        ...(lead?.url === undefined ? {} : { url: lead.url }),
        ...(bounded(lead?.published, 100) === undefined ? {} : { published: bounded(lead?.published, 100)! }),
        ...(bounded(lead?.summary, 4_000) === undefined ? {} : { summary: bounded(lead?.summary, 4_000)! }),
      }),
      queryHints: Object.freeze([assignment.term, `${assignment.term} independent reporting`, `${leadTitle} corroboration`]),
      excludedUrls: admittedExistingUrls,
      maximumCandidates: 6,
      now,
      dataDir,
    });
    const relevantCandidates = discovered.candidates.filter((candidate) => sourceDiscoveryCandidateSupportsEvent(candidate, assignment.term));
    const relevantUrls = relevantCandidates.flatMap((candidate) => typeof candidate["url"] === "string" ? [candidate["url"]] : []);
    if (relevantUrls.length === 0) throw new SourceIntelligenceExhaustion("source discovery returned related pages but no candidate whose title preserves the concrete event spine");
    const requestedUrls = sourceUrlsMeetingDomainFloor(admittedExistingUrls, relevantUrls, required);
    if (independentSourceDomainCount(requestedUrls) < required) throw new SourceIntelligenceExhaustion(`source discovery supplied fewer than ${required} independent source domains`);

    const currentEvidence = await dependencies.recall({ sourceUrls: requestedUrls, dataDir, now });
    const publicWebEvidence = await dependencies.acquirePublicText({ assignmentId: assignment.assignmentId, sourceUrls: requestedUrls, currentEvidence, now, dataDir });
    const issueTerms = [...new Set([assignment.term, assignment.beat, ...assignment.term.split(/[^a-z0-9]+/iu).filter((term) => term.length >= 5)])].slice(0, 10);
    const priorResearch = await dependencies.procurePriorResearch({ assignmentId: assignment.assignmentId, terms: issueTerms, dataDir, now, maxFiles: 8, requireProviderDelivery: true });
    const structuralAssignment = Object.freeze({ ...assignment, sourceUrls: Object.freeze([...requestedUrls]) });
    const admitted = await dependencies.admitPacket({ assignment: structuralAssignment, currentEvidence, ...(publicWebEvidence === undefined ? {} : { publicWebEvidence }), priorResearch, commission, now, dataDir, maximumAgeHours: input.maximumAgeHours ?? 7 * 24 });
    const sourceCountAfter = admittedIndependentSourceDomainCount(admitted.packet);
    if (sourceCountAfter < required) throw new Error(`admitted reporting carries ${sourceCountAfter} independent source domains; commission requires ${required}`);
    if (!packetSupportsAssignment(assignment.term, admitted.packet)) throw new Error("the deeper admitted packet does not support the whole assignment lens");

    let successorAssignmentId: string | undefined;
    const manuscriptPath = input.slug === undefined ? undefined : resolve(contentDir, `${input.slug}.md`);
    if (manuscriptPath !== undefined && existsSync(manuscriptPath)) {
      const before = readFileSync(manuscriptPath, "utf8");
      const document = decodeFrontMatterDocument(before);
      if (readFileSync(manuscriptPath, "utf8") !== before) throw new Error("manuscript changed while source intelligence was settling");
      const priorKoios = object(document.frontMatter["koios"]) ? document.frontMatter["koios"] : {};
      const next = Object.freeze({
        ...document,
        frontMatter: Object.freeze({
          ...document.frontMatter,
          draft: true,
          references: Object.freeze([...admitted.packet.candidateReferences]),
          koios: Object.freeze({ ...priorKoios, gates_clear: false, source_packet_digest: admitted.packetDigest, source_intelligence_replay_at: now }),
        }),
      });
      writeFileSync(manuscriptPath, encodeFrontMatterDocument(next), "utf8");
    } else {
      const terminal = readKoiosLedger(dataDir, "contract-events")
        .filter((entry) => entry["subject"] === assignment.assignmentId && ["newsroom.circuit.refused", "newsroom.circuit.obstructed"].includes(String(entry["act"] ?? "")))
        .sort((left, right) => String(left["recordedAt"] ?? "").localeCompare(String(right["recordedAt"] ?? "")))
        .at(-1);
      if (terminal === undefined) throw new Error("source-intelligence successor requires a digest-bound terminal newsroom circuit");
      successorAssignmentId = `${assignment.assignmentId}:source:${admitted.packetDigest.replace(/^sha256:/u, "").slice(0, 12)}`;
      const successor = await createSuccessorAssignment(dataDir, {
        predecessorAssignmentId: assignment.assignmentId,
        successorAssignmentId,
        reason: "deeper admitted reporting formed before prose; replay the newsroom from source intelligence",
        authority: "koios.news/source-intelligence",
        contract: "koios.news/source-intelligence-successor/v1",
        terminalCircuitDigest: recordDigest(terminal),
        sourceUrls: admitted.packet.sourceUrls,
      }, loadPosts(contentDir), now);
      // The packet has no assignment identity in its bytes. Project the same
      // admitted evidence under the successor work order without repurchasing
      // inference or pretending search metadata is warrant.
      await appendDatedRecord({ dataRoot: dataDir, ledger: "source-claims", instant: now, record: Object.freeze({ kind: "koios.admissible-research-packet-admission", at: now, assignmentId: successor.assignment.assignmentId, packet: admitted.packet, packetDigest: admitted.packetDigest, inheritedFromAssignmentId: assignment.assignmentId, providerExchange: admitted.providerExchange }) as unknown as JsonObject });
      await appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: now, act: "source-intelligence.successor-formed", subject: successor.assignment.assignmentId, data: { predecessorAssignmentId: assignment.assignmentId, packetDigest: admitted.packetDigest, sourceCount: sourceCountAfter, sourceReuseReleased: false, providerReinvoked: false } });
    }

    const result = Object.freeze({
      kind: "koios.source-intelligence-replay" as const,
      disposition: "ready" as const,
      assignmentId: assignment.assignmentId,
      ...(input.slug === undefined ? {} : { slug: input.slug }),
      ...(successorAssignmentId === undefined ? {} : { successorAssignmentId }),
      predecessorPacketDigest,
      admittedPacketDigest: admitted.packetDigest,
      sourceCountBefore,
      sourceCountAfter,
      mechanismVersion: SOURCE_INTELLIGENCE_REPLAY_MECHANISM_VERSION,
    });
    await appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: now, act: "source-intelligence.replay-settled", subject: assignment.assignmentId, data: { ...result, discoveryDeliveryDigest: object(discovered.delivery["object"]) ? discovered.delivery["object"]["deliveryDigest"] ?? null : null, packetProviderExchange: admitted.providerExchange, rawSearchMetadataUsedAsWarrant: false, proseProviderInvoked: false } as unknown as JsonObject });
    return result;
  } catch (error) {
    const retryable = error instanceof PublicSourceDiscoveryRefusal
      ? error.retryable
      : error instanceof SourceIntelligenceExhaustion
        ? false
        : error instanceof AdmissibleResearchPacketRefusal && TERMINAL_PACKET_REFUSALS.has(error.code)
          ? false
          : true;
    return await refusal({ assignmentId: assignment.assignmentId, ...(input.slug === undefined ? {} : { slug: input.slug }), now, dataDir, predecessorPacketDigest, sourceCountBefore, reason: error instanceof Error ? error.message.slice(0, 1_200) : String(error).slice(0, 1_200), retryable });
  }
}
