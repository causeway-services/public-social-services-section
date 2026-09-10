import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { createServer } from "node:net";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";

import { decodeFrontMatterDocument } from "@emsenn/organizing-a-content-farm";

import { createDraftManuscript } from "../dist/researching/writing/manuscripts.mjs";
import {
  createAssignment,
  createSuccessorAssignment,
  readAssignment,
  readAssignmentDisposition,
  recordAssignmentDisposition,
} from "../dist/researching/writing/assignments.mjs";
import { dispatchNewsroomRepair, editorRequestsCarrierRepair } from "../dist/management/newsroom-repair-dispatch.mjs";
import { appendDatedRecord, appendKoiosAct, recordDigest } from "../dist/management/ledger.mjs";
import { digest, formNewsroomRepairDemand, solicitLissProseRepair, verifyProseInferenceSettlement } from "../dist/management/newsroom-repair-dispatcher.mjs";
import { licensedClaimDeck, licensedEditorialBrief } from "../dist/researching/sourcing/licensed-editorial-state-contract.mjs";

const CONTEXT = "https://www.w3.org/ns/activitystreams";
const LISS = "urn:ame:logical-inference-service-section";
const CONTRACT = "inference-fabric-activitystreams-service";

test("a full writer replay escalates to Sonnet and names the originality constraint", () => {
  const sourcePacket = { sourceUrls: ["https://example.test/source"], summary: "VERBATIM SOURCE NARRATIVE MUST STAY CUSTOMER-SIDE" };
  const assignmentContext = { assignmentId: "environment-example", sourceUrls: sourcePacket.sourceUrls };
  const instructions = "Reconstruct the complete manuscript in materially independent language.";
  const writerEvidenceProjection = { kind: "koios-news.clean-room-claim-deck", evidenceBudget: { targetWords: { minimum: 600, maximum: 850 }, licensedMaximumWords: 850 }, claims: [{ id: "claim-1", fact: "A reported event occurred.", sourceUrl: "https://example.test/source" }] };
  const context = {
    currentBody: "A source-shaped draft body.",
    manuscriptDigest: digest("A source-shaped draft body."),
    editorReport: "The deterministic source-originality gate requires a full writer replay.",
    editorJudgmentDigest: `sha256:${"a".repeat(64)}`,
    repairAuthority: "deterministic-source-originality-gate",
    witnessedResearchPacket: sourcePacket,
    sourcePacketDigest: digest(sourcePacket),
    writerEvidenceProjection,
    writerEvidenceProjectionDigest: digest(writerEvidenceProjection),
    assignmentContext,
    assignmentDigest: digest(assignmentContext),
    renderedInstructions: instructions,
    instructionsDigest: digest(instructions),
  };
  const demand = formNewsroomRepairDemand({
    assignmentId: "environment-example",
    learningEvidenceDigest: `sha256:${"b".repeat(64)}`,
    assignmentDigest: context.assignmentDigest,
    sourcePacketDigest: context.sourcePacketDigest,
    terminalCircuitDigest: `sha256:${"c".repeat(64)}`,
    failureLayer: "writer-model",
    proposedMove: "replay-writer",
  }, context);
  const request = solicitLissProseRepair(demand).object.request;
  assert.deepEqual(request.admissibleTiers, ["leader-claude"]);
  assert.deepEqual(request.models, { "leader-claude": "claude-sonnet-4-6" });
  assert.match(request.messages[0].content, /Reconstruct all language independently/u);
  assert.match(request.messages[1].content, /DETERMINISTIC SOURCE-ORIGINALITY GATE REPORT/u);
  assert.match(request.messages[1].content, /clean-room writer replay/iu);
  assert.match(request.messages[1].content, /Return 600 to 850 words/u);
  assert.match(request.messages[1].content, /Do not pad/u);
  assert.match(request.messages[1].content, /LICENSED CLEAN-ROOM CLAIM DECK/u);
  assert.match(request.messages[1].content, /A reported event occurred/u);
  assert.doesNotMatch(request.messages[1].content, /VERBATIM SOURCE NARRATIVE/u);
  assert.doesNotMatch(request.messages[1].content, /A source-shaped draft body/u);
  assert.doesNotMatch(request.messages[1].content, /CURRENT BODY:/u);
  assert.throws(() => verifyProseInferenceSettlement(demand, {
    type: "Accept",
    actor: LISS,
    object: { type: "InferenceSettlementResult", contract: CONTRACT, jobId: request.id, jobDigest: digest(request), result: { model: "meta/llama-3.1-8b-instruct", text: "A nonempty but inadmissible result." } },
  }), /outside the buyer-admitted set/u);
});

test("the clean-room claim deck is deterministic, order-independent, and excludes source prose and titles", () => {
  const sourceSentence = "Majorities linked climate change to worsening wildfires (64%), droughts (63%), flooding and flash flooding (62%), hurricanes (59%), and severe thunderstorms and hailstorms (59%).";
  const state = {
    assignment: { assignmentId: "test", term: "reported event", beat: "technology", demandStatus: "attention-pressure-not-evidence" },
    assertions: [
      { id: "claim-b", sourceSubject: "urn:b", sourceUrl: "https://example.test/b", sourceTitle: "Copied source title", text: sourceSentence, force: "alleges", status: "source-supported", attribution: "required", scope: "event" },
      { id: "claim-a", sourceSubject: "urn:a", sourceUrl: "https://example.test/a", sourceTitle: "Another copied title", text: "The first evidence-bearing proposition.", force: "alleges", status: "source-supported", attribution: "required", scope: "event" },
    ],
    plan: { genre: "reported-analysis", evidenceBudget: { targetWords: { minimum: 600, maximum: 900 }, licensedMaximumWords: 900, distinctAssertionCount: 2, primaryAssertionCount: 0, maximumWordsPerAssertion: 450, status: "cleared" } },
    prohibitions: ["Do not invent claims."],
  };
  const left = licensedClaimDeck(state);
  const right = licensedClaimDeck({ ...state, assertions: [...state.assertions].reverse() });
  assert.deepEqual(left, right);
  assert.equal(JSON.stringify(left).includes("Copied source title"), false);
  assert.equal(JSON.stringify(left).includes("sourceSubject"), false);
  assert.equal(JSON.stringify(left).includes(sourceSentence), false);
  assert.equal(JSON.stringify(left).includes("Majorities linked climate change to worsening wildfires"), false);
  assert.ok(left.claims.every((claim) => claim.evidenceLexemes.every((lexeme) => !/\s/u.test(lexeme))));
  assert.equal(left.version, 2);
  assert.equal(left.claims.length, 2);
  const brief = licensedEditorialBrief({ ...state, plan: {
    ...state.plan,
    headline: { subject: "reported event", claimIds: ["claim-b"], law: "Use original headline language." },
    ledeClaimIds: ["claim-b"],
    sections: [{ id: "evidence", purpose: "Report the admitted evidence.", claimIds: ["claim-b", "claim-a"] }],
    interpretation: { requestedAngle: "Explain the result.", authority: "editorial-purpose-only", law: "Do not turn interpretation into fact." },
    writerPromptLaws: [],
  }, correctionPolicy: "Correct errors.", version: 1, kind: "koios-news.licensed-editorial-state", formedAt: "2026-07-20T00:00:00.000Z" });
  assert.equal(brief.includes(sourceSentence), false);
  assert.equal(brief.includes("Copied source title"), false);
});

function response(type, source, object) {
  return { "@context": CONTEXT, id: `urn:test:${type.toLowerCase()}:${digest({ source: source.id, object })}`, type, actor: LISS, target: source.actor, inReplyTo: source.id, object };
}

async function fakeLiss(socketPath, prose) {
  const server = createServer((socket) => {
    let text = "";
    socket.setEncoding("utf8");
    socket.on("data", (chunk) => { text += chunk; });
    socket.on("end", () => {
      const activity = JSON.parse(text.trim());
      let outbound;
      if (activity.type === "Offer") {
        const job = activity.object.request;
        const consideration = { type: "InferenceResolutionConsideration", expectedAmount: 0, unit: "fixture", settlementProtocol: "supplier-resource-observation", monetaryClaim: false, x402Applicable: false };
        outbound = response("Offer", activity, { type: "ExecutableServiceOffer", contract: CONTRACT, sourceActivity: activity.id, job, jobDigest: digest(job), consideration, considerationDigest: digest(consideration), scope: { registryDigest: "sha256:fixture" } });
      } else if (activity.type === "Accept") {
        const job = activity.object.offer.object.job;
        outbound = response("Accept", activity, { type: "InferenceSubmissionResult", contract: CONTRACT, offer: activity.object.offer.id, jobId: job.id, jobDigest: digest(job), resultInquiry: { type: "InferenceResultQuery", id: job.id, jobDigest: digest(job) } });
      } else {
        outbound = response("Accept", activity, { type: "InferenceSettlementResult", contract: CONTRACT, jobId: activity.object.id, jobDigest: activity.object.jobDigest, result: { model: "claude-sonnet-4-6", text: prose, usage: { total_tokens: 777 }, cost: { amount: 0, currency: "USD" } } });
      }
      socket.end(`${JSON.stringify(outbound)}\n`);
    });
  });
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(socketPath, resolve); });
  return server;
}

test("terminal newsroom learning contracts full-context prose and forms a replay successor", async () => {
  const root = mkdtempSync(join(tmpdir(), "koios-repair-dispatch-"));
  const dataDir = join(root, "data"), contentDir = join(root, "content"), socketPath = join(root, "liss.sock");
  mkdirSync(dataDir, { recursive: true }); mkdirSync(contentDir, { recursive: true });
  const now = "2026-07-19T05:00:00.000Z";
  const sourceUrl = "https://example.test/witnessed-source";
  try {
    const created = createAssignment(dataDir, { term: "grid-scale batteries", beat: "technology", priority: 9, summary: "Report the evidence.", angle: "Keep claims attributed.", assignee: "koios-news/reporter", sourceUrls: [sourceUrl] }, [], now);
    const predecessor = created.assignment.assignmentId;
    const draft = createDraftManuscript(contentDir, { title: "A witnessed draft", summary: "A draft awaiting repair.", body: `The first report cites [the witnessed source](${sourceUrl}) but needs a fuller article.\n`, seoTerm: "grid-scale batteries", beat: "technology", assignmentId: predecessor, references: [{ id: "source", title: "Witnessed source", URL: sourceUrl }], slug: "witnessed-draft", date: "2026-07-19", tags: ["technology"], category: "technology" });
    const manuscriptPath = join(contentDir, `${draft.slug}.md`);
    const manuscriptDigest = recordDigest(readFileSync(manuscriptPath, "utf8"));
    const packet = { selectedCount: 1, sourceUrls: [sourceUrl], intakeSources: [{ subject: "urn:source", title: "Witnessed source", url: sourceUrl }], candidateReferences: [{ id: "source", title: "Witnessed source", URL: sourceUrl }], editorialRisks: [] };
    appendDatedRecord({ dataRoot: dataDir, ledger: "source-claims", instant: now, record: { kind: "koios.admissible-research-packet-admission", at: now, assignmentId: predecessor, packet, packetDigest: recordDigest(packet) } });
    appendDatedRecord({ dataRoot: dataDir, ledger: "editorial-judgments", instant: now, record: { kind: "koios.editorial-judgment", recordedAt: now, slug: draft.slug, manuscriptDigest, disposition: "revise", report: "The current body is too thin. Expand only from the witnessed packet and preserve attribution.", pipelineDiagnosis: { failureLayer: "draft-repair" } } });
    recordAssignmentDisposition(dataDir, { assignmentId: predecessor, disposition: "refused", reason: "editorial repair budget exhausted at draft-repair", authority: "koios.news/editorial-operation", contract: "koios.news/newsroom-circuit-refusal/v1" }, now);
    appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: now, act: "newsroom.circuit.refused", subject: predecessor, data: { slug: draft.slug, reason: "editorial repair budget exhausted at draft-repair" } });
    const sentence = `The witnessed source documents grid-scale batteries under reported conditions and keeps every claim attributed to [the source](${sourceUrl}).`;
    const prose = Array.from({ length: 58 }, (_, index) => `${index % 7 === 0 ? "## Evidence and limits\n\n" : ""}${sentence}`).join("\n\n");
    const server = await fakeLiss(socketPath, prose);
    let first;
    try {
      first = await dispatchNewsroomRepair({ assignmentId: predecessor, now: "2026-07-19T05:01:00.000Z", dataDir, contentDir, socketPath, pollMilliseconds: 1, timeoutMilliseconds: 5_000 });
      assert.equal(first.disposition, "replay-ready");
      assert.notEqual(first.successorAssignmentId, predecessor);
      assert.equal(readAssignmentDisposition(dataDir, predecessor).disposition, "refused");
      const successor = readAssignment(dataDir, first.successorAssignmentId, []);
      assert.equal(successor.term, created.assignment.term);
      const repaired = decodeFrontMatterDocument(readFileSync(manuscriptPath, "utf8"));
      assert.equal(repaired.frontMatter.koios.assignment_id, first.successorAssignmentId);
      assert.equal(repaired.frontMatter.koios.predecessor_assignment_id, predecessor);
      assert.match(repaired.body, /witnessed source/u);
    } finally { await new Promise((resolve) => server.close(resolve)); }
    const resumed = await dispatchNewsroomRepair({ assignmentId: predecessor, now: "2026-07-19T05:02:00.000Z", dataDir, contentDir, socketPath: join(root, "missing.sock") });
    assert.equal(resumed.disposition, "replay-ready");
    assert.equal(resumed.successorAssignmentId, first.successorAssignmentId);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("one successor witness atomically supersedes a circuit-terminal open assignment", () => {
  const root = mkdtempSync(join(tmpdir(), "koios-successor-transition-"));
  const dataDir = join(root, "data");
  mkdirSync(dataDir, { recursive: true });
  try {
    const predecessor = createAssignment(dataDir, {
      term: "world cup final",
      beat: "sports",
      priority: 8,
      sourceUrls: ["https://example.test/match-report"],
    }, [], "2026-07-19T06:00:00.000Z").assignment;
    const terminalCircuitDigest = `sha256:${"a".repeat(64)}`;
    const successor = createSuccessorAssignment(dataDir, {
      predecessorAssignmentId: predecessor.assignmentId,
      successorAssignmentId: `${predecessor.assignmentId}:repair:fixture`,
      reason: "rewrite after witnessed newsroom obstruction",
      authority: "koios.news/newsroom-learning",
      contract: "newsroom-repair-dispatcher/v4",
      terminalCircuitDigest,
    }, [], "2026-07-19T06:01:00.000Z");
    assert.equal(successor.created, true);
    assert.equal(successor.predecessorDisposition.disposition, "superseded");
    assert.equal(successor.predecessorDisposition.replacementAssignmentId, successor.assignment.assignmentId);
    assert.deepEqual(readAssignmentDisposition(dataDir, predecessor.assignmentId), successor.predecessorDisposition);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("editorial metadata and process-artifact findings route to the deterministic carrier adapter", () => {
  assert.equal(editorRequestsCarrierRepair("The description and summary metadata fields contain process narration."), true);
  assert.equal(editorRequestsCarrierRepair("The current body is too thin and needs more sourced reporting."), false);
});
