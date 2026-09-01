import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";

import { decodeFrontMatterDocument } from "@red-cup-engineering/organizing-a-content-farm";
import { startRwilProviderProcess } from "@lenticule-science/rwil-rdf-projection-service/test-provider";

import { loadPosts } from "../dist/content.mjs";
import { createDraftManuscript } from "../dist/researching/writing/manuscripts.mjs";
import {
  createAssignment,
  createSuccessorAssignment,
  readAssignment,
  readAssignmentDisposition,
  recordAssignmentDisposition,
} from "../dist/researching/writing/assignments.mjs";
import { dispatchNewsroomRepair, editorRequestsCarrierRepair } from "../dist/management/newsroom-repair-dispatch.mjs";
import { appendDatedRecord, appendKoiosAct, readKoiosLedger, recordDigest } from "../dist/management/ledger.mjs";
import { digest, formNewsroomRepairDemand, INFERENCE_WORK_CONTRACT } from "../dist/management/newsroom-repair-dispatcher.mjs";
import { licensedClaimDeck, licensedEditorialBrief } from "../dist/researching/sourcing/licensed-editorial-state-contract.mjs";

const byteDigest = (value) => `sha256:${createHash("sha256").update(value).digest("hex")}`;
const marketCandidate = (text, label) => ({
  text, serviceClass: "accountable-prose", workLot: `urn:work-lot:${label}`,
  requestNi: recordDigest({ label, kind: "request" }), resultNi: recordDigest({ label, kind: "result" }),
  settlementNi: recordDigest({ label, kind: "settlement" }), receiptNi: recordDigest({ label, kind: "receipt" }),
  provider: "urn:ame:fixture-inference-provider", model: "fixture-model",
  marketAccount: "eip155:31337:0x1111111111111111111111111111111111111111", exchange: { type: "FixtureInferenceMarketExchange" },
});

let rwil;
let savedRwilAgent;
test.before(async () => {
  savedRwilAgent = process.env.RWIL_RDF_AGENT;
  rwil = await startRwilProviderProcess();
  process.env.RWIL_RDF_AGENT = rwil.agentCardUrl;
});
test.after(async () => {
  if (savedRwilAgent === undefined) delete process.env.RWIL_RDF_AGENT;
  else process.env.RWIL_RDF_AGENT = savedRwilAgent;
  await rwil.close();
});

test("a full writer replay forms one NI-identified inference-work demand with clean-room custody", () => {
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
    terminalCircuitDigest: recordDigest({ terminal: "fixture" }),
    failureLayer: "writer-model",
    proposedMove: "replay-writer",
  }, context);
  assert.equal(demand.requiredContract, INFERENCE_WORK_CONTRACT);
  assert.match(demand.id, /^ni:\/\/\/sha-256;/u);
  assert.equal(demand.repairMode, "replay-writer");
  assert.deepEqual(demand.repairContext.writerEvidenceProjection, writerEvidenceProjection);
  assert.equal(demand.repairContext.witnessedResearchPacket.summary, "VERBATIM SOURCE NARRATIVE MUST STAY CUSTOMER-SIDE");
  assert.equal(demand.assignment.assignmentId, demand.revision.retainsAssignmentId);
  assert.equal(demand.revision.reopensOnlyAfterRetainedProduct, true);
  assert.equal("successor" in demand, false);
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

test("terminal newsroom learning retains full-context prose and revalidates the same assignment", async () => {
  const root = mkdtempSync(join(tmpdir(), "koios-repair-dispatch-"));
  const dataDir = join(root, "data"), contentDir = join(root, "content");
  mkdirSync(dataDir, { recursive: true }); mkdirSync(contentDir, { recursive: true });
  const now = "2026-07-19T05:00:00.000Z";
  const sourceUrl = "https://example.test/witnessed-source";
  try {
    const created = await createAssignment(dataDir, { term: "grid-scale batteries", beat: "technology", priority: 9, summary: "Report the evidence.", angle: "Keep claims attributed.", assignee: "koios-news/reporter", sourceUrls: [sourceUrl] }, [], now);
    const predecessor = created.assignment.assignmentId;
    const draft = createDraftManuscript(contentDir, { title: "A witnessed draft", summary: "A draft awaiting repair.", body: `The first report cites [the witnessed source](${sourceUrl}) but needs a fuller article.\n`, seoTerm: "grid-scale batteries", beat: "technology", assignmentId: predecessor, references: [{ id: "source", title: "Witnessed source", URL: sourceUrl }], slug: "witnessed-draft", date: "2026-07-19", tags: ["technology"], category: "technology" });
    const manuscriptPath = join(contentDir, `${draft.slug}.md`);
    const manuscriptDigest = byteDigest(readFileSync(manuscriptPath, "utf8"));
    const packet = { selectedCount: 1, sourceUrls: [sourceUrl], intakeSources: [{ subject: "urn:source", title: "Witnessed source", url: sourceUrl }], candidateReferences: [{ id: "source", title: "Witnessed source", URL: sourceUrl }], editorialRisks: [] };
    await appendDatedRecord({ dataRoot: dataDir, ledger: "source-claims", instant: now, record: { kind: "koios.admissible-research-packet-admission", at: now, assignmentId: predecessor, packet, packetDigest: recordDigest(packet) } });
    await appendDatedRecord({ dataRoot: dataDir, ledger: "editorial-judgments", instant: now, record: { kind: "koios.editorial-judgment", recordedAt: now, slug: draft.slug, manuscriptDigest, disposition: "revise", report: "The current body is too thin. Expand only from the witnessed packet and preserve attribution.", pipelineDiagnosis: { failureLayer: "draft-repair" } } });
    await recordAssignmentDisposition(dataDir, { assignmentId: predecessor, disposition: "refused", reason: "editorial repair budget exhausted at draft-repair", authority: "koios.news/editorial-operation", contract: "koios.news/newsroom-circuit-refusal/v1" }, now);
    await appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: now, act: "newsroom.circuit.refused", subject: predecessor, data: { slug: draft.slug, reason: "editorial repair budget exhausted at draft-repair" } });
    const sentence = `The witnessed source documents grid-scale batteries under reported conditions and keeps every claim attributed to [the source](${sourceUrl}).`;
    const prose = Array.from({ length: 40 }, (_, index) => `${index % 7 === 0 ? "## Evidence and limits\n\n" : ""}${sentence}`).join("\n\n");
    let first;
    first = await dispatchNewsroomRepair({
      assignmentId: predecessor,
      now: "2026-07-19T05:01:00.000Z",
      dataDir,
      contentDir,
      procureInference: async () => marketCandidate(prose, "accepted-repair"),
    });
      assert.equal(first.disposition, "replay-ready", first.reason);
      assert.equal(first.repairAssignmentId, predecessor);
      assert.equal(readAssignmentDisposition(dataDir, predecessor), undefined);
      const repairedAssignment = readAssignment(dataDir, first.repairAssignmentId, []);
      assert.equal(repairedAssignment.term, created.assignment.term);
      const repaired = decodeFrontMatterDocument(readFileSync(manuscriptPath, "utf8"));
      assert.equal(repaired.frontMatter.koios.assignment_id, predecessor);
      assert.equal(repaired.frontMatter.koios.predecessor_assignment_id, undefined);
      assert.match(repaired.body, /witnessed source/u);
    const resumed = await dispatchNewsroomRepair({ assignmentId: predecessor, now: "2026-07-19T05:02:00.000Z", dataDir, contentDir });
    assert.equal(resumed.disposition, "replay-ready");
    assert.equal(resumed.repairAssignmentId, first.repairAssignmentId);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("a refused over-length repair retains its prose and does not buy the identical inference again", async () => {
  const root = mkdtempSync(join(tmpdir(), "koios-retained-refusal-"));
  const dataDir = join(root, "data"), contentDir = join(root, "content");
  mkdirSync(dataDir, { recursive: true }); mkdirSync(contentDir, { recursive: true });
  const sourceUrl = "https://example.test/retained-source";
  try {
    const assignment = (await createAssignment(dataDir, {
      term: "retained newsroom repair",
      beat: "technology",
      priority: 9,
      summary: "Repair this report without losing paid work.",
      angle: "Keep the claim attributed.",
      sourceUrls: [sourceUrl],
    }, [], "2026-07-20T15:00:00.000Z")).assignment;
    const draft = createDraftManuscript(contentDir, {
      title: "Retained repair fixture",
      summary: "A refused draft awaiting repair.",
      body: `A thin report cites [the retained source](${sourceUrl}).\n`,
      seoTerm: assignment.term,
      beat: assignment.beat,
      assignmentId: assignment.assignmentId,
      references: [{ id: "source", title: "Retained source", URL: sourceUrl }],
      slug: "retained-repair-fixture",
      date: "2026-07-20",
      tags: ["technology"],
      category: "technology",
    });
    const manuscriptPath = join(contentDir, `${draft.slug}.md`);
    const packet = {
      selectedCount: 1,
      sourceUrls: [sourceUrl],
      intakeSources: [{ subject: "urn:retained-source", title: "Retained source", url: sourceUrl }],
      candidateReferences: [{ id: "source", title: "Retained source", URL: sourceUrl }],
      editorialRisks: [],
    };
    await appendDatedRecord({ dataRoot: dataDir, ledger: "source-claims", instant: "2026-07-20T15:00:00.000Z", record: { kind: "koios.admissible-research-packet-admission", at: "2026-07-20T15:00:00.000Z", assignmentId: assignment.assignmentId, packet, packetDigest: recordDigest(packet) } });
    await appendDatedRecord({ dataRoot: dataDir, ledger: "editorial-judgments", instant: "2026-07-20T15:00:00.000Z", record: { kind: "koios.editorial-judgment", recordedAt: "2026-07-20T15:00:00.000Z", slug: draft.slug, manuscriptDigest: byteDigest(readFileSync(manuscriptPath, "utf8")), disposition: "revise", report: "Expand the report from the witnessed packet.", pipelineDiagnosis: { failureLayer: "draft-repair" } } });
    await recordAssignmentDisposition(dataDir, { assignmentId: assignment.assignmentId, disposition: "refused", reason: "editorial repair budget exhausted at draft-repair", authority: "koios.news/editorial-operation", contract: "koios.news/newsroom-circuit-refusal/v1" }, "2026-07-20T15:00:00.000Z");
    await appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-20T15:00:00.000Z", act: "newsroom.circuit.refused", subject: assignment.assignmentId, data: { slug: draft.slug, reason: "editorial repair budget exhausted at draft-repair" } });

    let providerCalls = 0;
    const overLength = async ({ model, prompt }) => {
      providerCalls += 1;
      const maximum = Number(prompt.match(/Return \d+ to (\d+) words/u)?.[1]);
      assert.ok(Number.isInteger(maximum));
      const text = [`[source](${sourceUrl})`, ...Array.from({ length: maximum }, () => "reported")].join(" ");
      return marketCandidate(text, "over-length-repair");
    };
    const first = await dispatchNewsroomRepair({ assignmentId: assignment.assignmentId, now: "2026-07-20T15:01:00.000Z", dataDir, contentDir, procureInference: overLength });
    const second = await dispatchNewsroomRepair({ assignmentId: assignment.assignmentId, now: "2026-07-20T15:02:00.000Z", dataDir, contentDir, procureInference: overLength });
    assert.equal(first.disposition, "refused");
    assert.equal(second.disposition, "refused");
    assert.match(first.reason, /licensed maximum/u);
    assert.equal(providerCalls, 1);
    assert.equal(readKoiosLedger(dataDir, "provider-usage").filter((entry) => entry.act === "inference.consumed").length, 1);
    assert.equal(readKoiosLedger(dataDir, "contract-events").filter((entry) => entry.act === "newsroom.repair.stage-product-reused").length, 1);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("headline repair preserves the accepted staged body byte-for-byte", async () => {
  const root = mkdtempSync(join(tmpdir(), "koios-headline-return-"));
  const dataDir = join(root, "data"), contentDir = join(root, "content");
  mkdirSync(dataDir, { recursive: true }); mkdirSync(contentDir, { recursive: true });
  const now = "2026-07-20T10:00:00.000Z";
  const sourceUrls = ["https://city.example/rent-credit", "https://housing.example/filing-guide"];
  try {
    const assignment = (await createAssignment(dataDir, {
      term: "rent credit deadline",
      beat: "politics",
      priority: 9,
      summary: "Report the filing deadline and eligibility requirements.",
      angle: "Give readers an exact, sourced service brief.",
      sourceUrls,
    }, [], now)).assignment;
    const draft = createDraftManuscript(contentDir, {
      title: "Rent credit applications close Friday",
      summary: "A complete service report awaiting an original headline.",
      body: `Rent credit applications close Friday. The housing office says eligible tenants need proof of income. Read [the filing notice](${sourceUrls[0]}) and [the filing guide](${sourceUrls[1]}).\n`,
      seoTerm: assignment.term,
      beat: assignment.beat,
      assignmentId: assignment.assignmentId,
      references: sourceUrls.map((URL, index) => ({ id: `source-${index}`, title: index === 0 ? "Rent credit applications close Friday" : "Housing filing guide", URL })),
      slug: "rent-credit-staged",
      date: "2026-07-20",
      tags: ["rent credit"],
      category: "politics",
    });
    const manuscriptPath = join(contentDir, `${draft.slug}.md`);
    const staged = decodeFrontMatterDocument(readFileSync(manuscriptPath, "utf8"));
    const stagedBody = staged.body;
    const stagedBodyDigest = recordDigest(stagedBody);
    const packet = {
      term: assignment.term,
      beat: assignment.beat,
      selectedCount: 2,
      sourceUrls,
      intakeSources: sourceUrls.map((url, index) => ({ subject: `urn:source:${index}`, title: index === 0 ? "Rent credit applications close Friday" : "Housing filing guide", url })),
      candidateReferences: sourceUrls.map((URL, index) => ({ id: `source-${index}`, title: `Source ${index}`, URL })),
      editorialRisks: [],
    };
    await appendDatedRecord({ dataRoot: dataDir, ledger: "source-claims", instant: now, record: { kind: "koios.admissible-research-packet-admission", at: now, assignmentId: assignment.assignmentId, packet, packetDigest: recordDigest(packet) } });
    await appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: now, act: "newsroom.circuit.opened", subject: assignment.assignmentId, data: {} });
    await appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-20T10:01:00.000Z", act: "newsroom.circuit.body-staged", subject: assignment.assignmentId, data: { slug: draft.slug, bodyDigest: stagedBodyDigest, manuscriptDigest: recordDigest(readFileSync(manuscriptPath, "utf8")), attentionSurfaceState: "pending", publication: false } });
    await appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-20T10:02:00.000Z", act: "newsroom.circuit.replan-required", subject: assignment.assignmentId, data: { slug: draft.slug, failureLayer: "attention-headline", proposedMove: "repair-headline", bodyDigest: stagedBodyDigest, preservedWriterInvestment: true } });
    await recordAssignmentDisposition(dataDir, { assignmentId: assignment.assignmentId, disposition: "refused", reason: "headline contribution failed accountable-originality admission", authority: "koios.news/editorial-operation", contract: "koios.news/newsroom-circuit-refusal/v1" }, "2026-07-20T10:03:00.000Z");
    await appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-20T10:03:00.000Z", act: "newsroom.circuit.refused", subject: assignment.assignmentId, data: { slug: draft.slug, reason: "headline contribution failed accountable-originality admission" } });

    const repaired = await dispatchNewsroomRepair({
      assignmentId: assignment.assignmentId,
      now: "2026-07-20T10:04:00.000Z",
      dataDir,
      contentDir,
      procureHeadline: () => Object.freeze({
        text: "Rent Credit Applications Close Friday—Here’s Who Qualifies",
        model: "fixture-headline-model",
        selectedTier: "free-fixture",
        selectedProvider: "fixture-newswire",
        providerResult: {},
        providerExchange: {},
        recordedAt: "2026-07-20T10:04:00.000Z",
      }),
    });
    assert.equal(repaired.disposition, "replay-ready");
    const after = decodeFrontMatterDocument(readFileSync(manuscriptPath, "utf8"));
    assert.equal(after.body, stagedBody);
    assert.equal(recordDigest(after.body), stagedBodyDigest);
    assert.equal(after.frontMatter.title, "Rent Credit Applications Close Friday—Here’s Who Qualifies");
    assert.equal(repaired.repairAssignmentId, assignment.assignmentId);
    assert.equal(after.frontMatter.koios.assignment_id, assignment.assignmentId);
    assert.equal(after.frontMatter.koios.predecessor_assignment_id, undefined);
    assert.equal(after.frontMatter.koios.attention_surface_state, "admitted");
    assert.equal(readAssignment(dataDir, repaired.repairAssignmentId, loadPosts(contentDir)).manuscriptSlug, draft.slug);
    const ready = readKoiosLedger(dataDir, "contract-events").find((entry) => entry.act === "newsroom.repair.headline-ready");
    assert.equal(ready?.data.bodyChanged, false);
    assert.equal(ready?.data.stagedBodyDigest, stagedBodyDigest);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("a distinct source-intelligence commission may still form a successor assignment", async () => {
  const root = mkdtempSync(join(tmpdir(), "koios-successor-transition-"));
  const dataDir = join(root, "data");
  mkdirSync(dataDir, { recursive: true });
  try {
    const predecessor = (await createAssignment(dataDir, {
      term: "world cup final",
      beat: "sports",
      priority: 8,
      sourceUrls: ["https://example.test/match-report"],
    }, [], "2026-07-19T06:00:00.000Z")).assignment;
    const terminalCircuitDigest = recordDigest({ terminal: "fixture" });
    const successor = await createSuccessorAssignment(dataDir, {
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

test("a writer replay remains a writer replay when editorial prose also mentions metadata", () => {
  const editorialReport = "Replay the writer to reach 600 words and correct the body lede and frontmatter summary.";
  const requiredRepairs = [
    "Strip process narration from the frontmatter summary.",
    "Rewrite the body lede and add the missing sourced reporting.",
  ];
  assert.equal(editorRequestsCarrierRepair(editorialReport, requiredRepairs, "writer-model"), false);
  const proposedMove = "replay-writer";
  const repairTools = [];
  assert.equal(repairTools.length > 0 || (proposedMove === "repair-draft" && editorRequestsCarrierRepair(editorialReport, requiredRepairs, "writer-model")), false);
});
