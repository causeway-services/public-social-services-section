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
  readAssignment,
  readAssignmentDisposition,
  recordAssignmentDisposition,
} from "../dist/researching/writing/assignments.mjs";
import { dispatchNewsroomRepair } from "../dist/management/newsroom-repair-dispatch.mjs";
import { appendDatedRecord, appendKoiosAct, recordDigest } from "../dist/management/ledger.mjs";
import { digest } from "../dist/management/newsroom-repair-dispatcher.mjs";

const CONTEXT = "https://www.w3.org/ns/activitystreams";
const LISS = "urn:ame:logical-inference-service-section";
const CONTRACT = "inference-fabric-activitystreams-service";

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
        outbound = response("Accept", activity, { type: "InferenceSettlementResult", contract: CONTRACT, jobId: activity.object.id, jobDigest: activity.object.jobDigest, result: { text: prose, usage: { total_tokens: 777 }, cost: { amount: 0, currency: "USD" } } });
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
