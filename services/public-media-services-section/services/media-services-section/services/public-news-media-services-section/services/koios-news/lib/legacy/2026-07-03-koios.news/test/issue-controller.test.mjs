import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { decodeFrontMatterDocument } from "@red-cup-engineering/organizing-a-content-farm";

import {
  ACTIVITYSTREAMS_CONTEXT,
  PUBLICATION_ACTOR,
  boundedCandidateEvaluationSlate,
  completedCircuitAssignmentIds,
  inspectAdmittedIssuePulse,
  assignmentSourceUrls,
  diversifySourceNominations,
  keywordOpportunityCandidates,
  resolvedKeywordEventTerm,
  reservedSourceUrls,
  repairCommodityOrder,
  selectRepairableBacklog,
  selectSourceIntelligenceBacklog,
  selectSourceOriginalityRevalidationBacklog,
  settleOpenAssignmentPortfolio,
  settleIssuePulse,
  sourceDiscoveryRequestId,
} from "../dist/management/issue-controller.mjs";
import { planAudienceProducts, productClassFor, productPerformanceReading } from "../dist/management/audience-product-planning.mjs";
import { commissionForAssignment } from "../dist/management/editorial-commissioning.mjs";
import { corroboratingSourceUrlsForNomination, foldTrends } from "../dist/researching/sourcing/discovery.mjs";
import { appendDatedRecord, appendKoiosAct, readKoiosLedger, recordDigest } from "../dist/management/ledger.mjs";
import { assignmentLineageFromRecords, publicationEconomicReading } from "../dist/management/publication-economics.mjs";
import { createAssignment, createSuccessorAssignment, readActionableAssignments, recordAssignmentDisposition } from "../dist/researching/writing/assignments.mjs";
import { createDraftManuscript } from "../dist/researching/writing/manuscripts.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const CONFIG = join(ROOT, "producing-content.config.json");
const TEST_TRIGGER = Object.freeze({ actor: "urn:test:ant-colony-pulser", capability: "urn:test:capability:koios-issue-pulse" });
const byteDigest = (value) => `sha256:${createHash("sha256").update(value).digest("hex")}`;
const BASE_POLICY = Object.freeze({
  ...JSON.parse(readFileSync(join(ROOT, "lib", "law", "publication-issue-policy.json"), "utf8")),
  triggerAuthorities: Object.freeze([TEST_TRIGGER]),
});

test("source-discovery identity omits a keyword lead's intentionally absent URL", () => {
  const withoutUrl = sourceDiscoveryRequestId({ pulseId: "urn:test:pulse", term: "marco rubio", beat: "culture" });
  const withUrl = sourceDiscoveryRequestId({ pulseId: "urn:test:pulse", term: "marco rubio", beat: "culture", primaryUrl: "https://example.test/report" });
  assert.match(withoutUrl, /^urn:test:pulse:source-discovery:[A-Za-z0-9_-]{16}$/u);
  assert.notEqual(withoutUrl, withUrl);
});

test("the standing publication cadence can produce eight daily issues", () => {
  assert.equal(BASE_POLICY.minimumHoursBetweenNewIssues, 3);
  assert.equal(BASE_POLICY.maxIssuesPerPulse, 1);
  assert.equal(BASE_POLICY.maxOpenAssignments, 4);
});

test("a completed circuit terminal witness releases a stale assignment projection", () => {
  const territory = mkdtempSync(join(tmpdir(), "koios-completed-circuit-"));
  const dataDir = join(territory, "data");
  mkdirSync(dataDir, { recursive: true });
  appendKoiosAct({
    dataRoot: dataDir,
    ledger: "contract-events",
    instant: "2026-07-19T05:40:14.758Z",
    act: "newsroom.circuit.completed",
    subject: "technology-stale-assignment",
    data: { disposition: "published" },
  });
  assert.deepEqual([...completedCircuitAssignmentIds(dataDir)], ["technology-stale-assignment"]);
});

test("a terminal refusal reserves its sources until an explicit source-release act", () => {
  const assignment = { assignmentId: "culture-source-repair-pending", sourceUrls: ["https://example.test/event"] };
  assert.deepEqual([...reservedSourceUrls([assignment], [], new Set())], ["https://example.test/event"]);
  assert.deepEqual([...reservedSourceUrls([assignment], [], new Set([assignment.assignmentId]))], []);
});

test("repair procurement skips a stale editorial failure and buys current executable work", () => {
  const territory = mkdtempSync(join(tmpdir(), "koios-repair-procurement-"));
  const dataDir = join(territory, "data");
  const contentDir = join(territory, "content");
  mkdirSync(dataDir, { recursive: true });
  mkdirSync(contentDir, { recursive: true });
  const terminal = (assignmentId, slug, failureLayer, minute) => {
    appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: `2026-07-19T20:${minute}:00.000Z`, act: "newsroom.circuit.opened", subject: assignmentId, data: { slug } });
    appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: `2026-07-19T20:${minute}:02.000Z`, act: "newsroom.circuit.refused", subject: assignmentId, data: { slug, reason: `${failureLayer} exhausted` } });
  };

  const staleSlug = "stale-priority-manuscript";
  const stalePath = join(contentDir, `${staleSlug}.md`);
  writeFileSync(stalePath, "historical manuscript\n", "utf8");
  appendDatedRecord({ dataRoot: dataDir, ledger: "editorial-judgments", instant: "2026-07-19T20:00:01.000Z", record: { kind: "koios.editorial-judgment", recordedAt: "2026-07-19T20:00:01.000Z", slug: staleSlug, manuscriptDigest: byteDigest("historical manuscript\n"), disposition: "revise", report: "Repair this historical manuscript.", pipelineDiagnosis: { failureLayer: "draft-repair" } } });
  terminal("a-stale-repair", staleSlug, "draft repair", "00");
  writeFileSync(stalePath, "manuscript changed after judgment\n", "utf8");

  const currentSlug = "current-writer-replay-manuscript";
  const currentBody = "current manuscript\n";
  writeFileSync(join(contentDir, `${currentSlug}.md`), currentBody, "utf8");
  appendDatedRecord({ dataRoot: dataDir, ledger: "editorial-judgments", instant: "2026-07-19T20:01:01.000Z", record: { kind: "koios.editorial-judgment", recordedAt: "2026-07-19T20:01:01.000Z", slug: currentSlug, manuscriptDigest: byteDigest(currentBody), disposition: "revise", report: "Replay the writer against this manuscript.", pipelineDiagnosis: { failureLayer: "writer-model" } } });
  terminal("b-current-replay", currentSlug, "writer model", "01");

  const selected = selectRepairableBacklog(dataDir, "2026-07-19T20:02:00.000Z", contentDir);
  assert.equal(selected?.assignmentId, "b-current-replay");
  assert.equal(selected?.proposedMove, "replay-writer");
});

test("repair procurement sells an exact staged headline job without demanding an Editor judgment", () => {
  const territory = mkdtempSync(join(tmpdir(), "koios-headline-repair-procurement-"));
  const dataDir = join(territory, "data");
  const contentDir = join(territory, "content");
  mkdirSync(dataDir, { recursive: true });
  mkdirSync(contentDir, { recursive: true });
  const assignmentId = "politics-rent-credit-deadline";
  const slug = "rent-credit-deadline-staged";
  const sources = ["https://city.example/rent-credit", "https://housing.example/filing-guide"];
  const draft = createDraftManuscript(contentDir, {
    title: "Provisional internal title",
    summary: "A staged report awaiting an accountable headline.",
    body: `Rent credit applications close Friday. The housing office says eligible tenants need proof of income. [The filing notice](${sources[0]}) and [filing guide](${sources[1]}) explain the process.\n`,
    seoTerm: "rent credit deadline",
    beat: "politics",
    assignmentId,
    references: sources.map((URL, index) => ({ id: `source-${index}`, title: `Source ${index}`, URL })),
    slug,
    date: "2026-07-20",
    tags: ["rent credit"],
    category: "politics",
  });
  const document = decodeFrontMatterDocument(readFileSync(join(contentDir, `${draft.slug}.md`), "utf8"));
  const packet = { term: "rent credit deadline", beat: "politics", selectedCount: 2, sourceUrls: sources, intakeSources: sources.map((url, index) => ({ subject: `urn:source:${index}`, title: index === 0 ? "Rent credit applications close Friday" : "Housing filing guide", url })), candidateReferences: [] };
  appendDatedRecord({ dataRoot: dataDir, ledger: "source-claims", instant: "2026-07-20T10:00:00.000Z", record: { kind: "koios.admissible-research-packet-admission", assignmentId, packet, packetDigest: recordDigest(packet) } });
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-20T10:00:00.000Z", act: "newsroom.circuit.opened", subject: assignmentId, data: {} });
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-20T10:01:00.000Z", act: "newsroom.circuit.body-staged", subject: assignmentId, data: { slug, bodyDigest: recordDigest(document.body), manuscriptDigest: recordDigest(readFileSync(join(contentDir, `${slug}.md`), "utf8")), attentionSurfaceState: "pending" } });
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-20T10:02:00.000Z", act: "newsroom.circuit.replan-required", subject: assignmentId, data: { slug, failureLayer: "attention-headline", proposedMove: "repair-headline" } });
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-20T10:03:00.000Z", act: "newsroom.circuit.refused", subject: assignmentId, data: { slug, reason: "headline contribution failed accountable-originality admission" } });

  const selected = selectRepairableBacklog(dataDir, "2026-07-20T10:04:00.000Z", contentDir);
  assert.equal(selected?.assignmentId, assignmentId);
  assert.equal(selected?.proposedMove, "repair-headline");
});

test("repair procurement accepts a current source-originality warranty claim before editor review", () => {
  const territory = mkdtempSync(join(tmpdir(), "koios-originality-replay-"));
  const dataDir = join(territory, "data");
  const contentDir = join(territory, "content");
  mkdirSync(dataDir, { recursive: true });
  mkdirSync(contentDir, { recursive: true });
  const assignmentId = "environment-originality-replay";
  const slug = "heat-counting-methods";
  const copiedSentence = "Researchers have studied the relationship between heat and mortality for nearly a century.";
  const manuscript = `---\ntitle: Heat counting methods\n---\n\n${copiedSentence}\n`;
  writeFileSync(join(contentDir, `${slug}.md`), manuscript, "utf8");
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-20T00:00:00.000Z", act: "newsroom.circuit.opened", subject: assignmentId, data: { slug } });
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-20T00:01:00.000Z", act: "newsroom.circuit.source-originality-refused", subject: assignmentId, data: {
    slug,
    failureLayer: "writer-model",
    replayFrom: "writer-model",
    findings: [{ sourceUrl: "https://source.example/heat", draftSentence: copiedSentence, sourceSentence: copiedSentence }],
  } });
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-20T00:02:00.000Z", act: "newsroom.circuit.refused", subject: assignmentId, data: { slug, reason: "source-originality gate found source-shaped prose" } });

  const selected = selectRepairableBacklog(dataDir, "2026-07-20T00:03:00.000Z", contentDir);
  assert.equal(selected?.assignmentId, assignmentId);
  assert.equal(selected?.proposedMove, "replay-writer");
});

test("premium writer repair is refused when the bound product packet lacks source depth", () => {
  const territory = mkdtempSync(join(tmpdir(), "koios-repair-source-floor-"));
  const dataDir = join(territory, "data");
  const contentDir = join(territory, "content");
  mkdirSync(dataDir, { recursive: true });
  mkdirSync(contentDir, { recursive: true });
  const assignmentId = "technology-firefox-cadence";
  const slug = "firefox-cadence";
  const copiedSentence = "Mozilla will move Firefox releases to a two-week cadence.";
  const manuscript = `---\ntitle: Firefox cadence\n---\n\n${copiedSentence}\n`;
  const packet = { term: "mozilla firefox release schedule", beat: "technology", sourceUrls: ["https://theregister.com/firefox"], intakeSources: [{ title: "Mozilla speeds Firefox release schedule to biweekly", url: "https://theregister.com/firefox" }] };
  const packetDigest = recordDigest(packet);
  writeFileSync(join(contentDir, `${slug}.md`), manuscript, "utf8");
  appendDatedRecord({ dataRoot: dataDir, ledger: "source-claims", instant: "2026-07-20T00:00:00.000Z", record: { kind: "koios.admissible-research-packet-admission", assignmentId, packet, packetDigest } });
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-20T00:01:00.000Z", act: "newsroom.circuit.opened", subject: assignmentId, data: { slug } });
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-20T00:02:00.000Z", act: "newsroom.circuit.source-originality-refused", subject: assignmentId, data: { slug, packetDigest, manuscriptDigest: byteDigest(manuscript), failureLayer: "writer-model", findings: [{ sourceUrl: "https://theregister.com/firefox", draftSentence: copiedSentence, sourceSentence: copiedSentence }] } });
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-20T00:03:00.000Z", act: "newsroom.circuit.refused", subject: assignmentId, data: { slug, reason: "source-originality gate found source-shaped prose" } });
  assert.equal(selectRepairableBacklog(dataDir, "2026-07-20T00:04:00.000Z", contentDir), undefined);
  const refusal = readKoiosLedger(dataDir, "contract-events").find((entry) => entry.act === "newsroom.repair.source-depth-refused");
  assert.equal(refusal?.data.actualIndependentSources, 1);
  assert.equal(refusal?.data.requiredIndependentSources, 2);
  assert.equal(refusal?.data.providerInvocation, false);
});

test("source procurement does not deepen a predecessor again after forming its successor", () => {
  const territory = mkdtempSync(join(tmpdir(), "koios-source-successor-once-"));
  const dataDir = join(territory, "data");
  const contentDir = join(territory, "content");
  mkdirSync(dataDir, { recursive: true });
  mkdirSync(contentDir, { recursive: true });
  const assignmentId = "culture-box-office-event";
  const packet = { term: "film opens with record box office", beat: "culture", sourceUrls: ["https://example.test/film"], intakeSources: [{ title: "Film opens with record box office", url: "https://example.test/film" }] };
  const packetDigest = recordDigest(packet);
  appendDatedRecord({ dataRoot: dataDir, ledger: "source-claims", instant: "2026-07-20T00:00:00.000Z", record: { kind: "koios.admissible-research-packet-admission", assignmentId, packet, packetDigest } });
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-20T00:01:00.000Z", act: "newsroom.circuit.opened", subject: assignmentId, data: {} });
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-20T00:02:00.000Z", act: "newsroom.circuit.replan-required", subject: assignmentId, data: { failureLayer: "sources" } });
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-20T00:03:00.000Z", act: "newsroom.circuit.refused", subject: assignmentId, data: { reason: "insufficient source support" } });
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-20T00:04:00.000Z", act: "source-intelligence.replay-settled", subject: assignmentId, data: { disposition: "ready", predecessorPacketDigest: packetDigest, successorAssignmentId: `${assignmentId}:source:successor` } });
  const laterPacket = { ...packet, sourceUrls: [...packet.sourceUrls, "https://second.example/report"], intakeSources: [...packet.intakeSources, { title: "A later predecessor projection", url: "https://second.example/report" }] };
  appendDatedRecord({ dataRoot: dataDir, ledger: "source-claims", instant: "2026-07-20T00:04:30.000Z", record: { kind: "koios.admissible-research-packet-admission", assignmentId, packet: laterPacket, packetDigest: recordDigest(laterPacket) } });
  assert.equal(selectSourceIntelligenceBacklog(dataDir, "2026-07-20T00:05:00.000Z", contentDir), undefined);
});

test("a newsroom refusal authorizes source repair while exact source-market exhaustion closes it", () => {
  const seed = (contract) => {
    const territory = mkdtempSync(join(tmpdir(), "koios-source-terminal-kind-"));
    const dataDir = join(territory, "data");
    const contentDir = join(territory, "content");
    mkdirSync(dataDir, { recursive: true });
    mkdirSync(contentDir, { recursive: true });
    const assignmentId = "technology-source-terminal-kind";
    const packet = { term: "Example project revival", beat: "technology", sourceUrls: ["https://example.test/revival"], intakeSources: [{ title: "Example project revival begins", url: "https://example.test/revival" }] };
    const packetDigest = recordDigest(packet);
    appendDatedRecord({ dataRoot: dataDir, ledger: "source-claims", instant: "2026-07-20T00:00:00.000Z", record: { kind: "koios.admissible-research-packet-admission", assignmentId, packet, packetDigest } });
    appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-20T00:01:00.000Z", act: "newsroom.circuit.opened", subject: assignmentId, data: {} });
    appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-20T00:02:00.000Z", act: "newsroom.circuit.replan-required", subject: assignmentId, data: { failureLayer: "sources" } });
    appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-20T00:03:00.000Z", act: "newsroom.circuit.refused", subject: assignmentId, data: { reason: "insufficient source support" } });
    appendDatedRecord({ dataRoot: dataDir, ledger: "assignments", instant: "2026-07-20T00:03:00.000Z", record: { kind: "koios.assignment-disposition-witness", assignmentId, disposition: "refused", reason: "insufficient source support", authority: "koios.news/editorial-operation", contract, at: "2026-07-20T00:03:00.000Z" } });
    return { dataDir, contentDir, assignmentId };
  };
  const newsroom = seed("koios.news/newsroom-circuit-refusal/v1");
  assert.equal(selectSourceIntelligenceBacklog(newsroom.dataDir, "2026-07-20T00:04:00.000Z", newsroom.contentDir)?.assignmentId, newsroom.assignmentId);
  const exhausted = seed("koios.news/source-intelligence-exhaustion/v1");
  assert.equal(selectSourceIntelligenceBacklog(exhausted.dataDir, "2026-07-20T00:04:00.000Z", exhausted.contentDir), undefined);
});

test("repair commodities alternate when both source and manuscript work remain executable", () => {
  assert.deepEqual(repairCommodityOrder([]), ["source-intelligence", "manuscript-repair"]);
  assert.deepEqual(repairCommodityOrder([
    { recordedAt: "2026-07-20T00:00:00.000Z", act: "source-intelligence.replay-settled", data: { disposition: "refused" } },
  ]), ["manuscript-repair", "source-intelligence"]);
  assert.deepEqual(repairCommodityOrder([
    { recordedAt: "2026-07-20T00:00:00.000Z", act: "source-intelligence.replay-settled", data: { disposition: "refused" } },
    { recordedAt: "2026-07-20T00:01:00.000Z", act: "newsroom.repair.commodity-selected", data: { commodity: "manuscript-repair" } },
  ]), ["source-intelligence", "manuscript-repair"]);
});

test("repair procurement charges attempts to the whole successor lineage", () => {
  const territory = mkdtempSync(join(tmpdir(), "koios-lineage-repair-cap-"));
  const dataDir = join(territory, "data");
  const contentDir = join(territory, "content");
  mkdirSync(dataDir, { recursive: true });
  mkdirSync(contentDir, { recursive: true });
  const assignmentId = "environment-story:repair:first:repair:second:repair:third";
  const slug = "exhausted-repair-story";
  const copiedSentence = "Researchers documented the same source-shaped sentence after three paid repair attempts.";
  writeFileSync(join(contentDir, `${slug}.md`), `---\ntitle: Independent title\n---\n\n${copiedSentence}\n`, "utf8");
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-20T00:00:00.000Z", act: "newsroom.circuit.opened", subject: assignmentId, data: { slug } });
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-20T00:01:00.000Z", act: "newsroom.circuit.source-originality-refused", subject: assignmentId, data: { slug, failureLayer: "writer-model", findings: [{ sourceUrl: "https://source.example/report", draftSentence: copiedSentence, sourceSentence: copiedSentence }] } });
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-20T00:02:00.000Z", act: "newsroom.circuit.refused", subject: assignmentId, data: { slug, reason: "source-originality gate found source-shaped prose" } });
  assert.equal(selectRepairableBacklog(dataDir, "2026-07-20T00:03:00.000Z", contentDir), undefined);
});

test("a narrow originality failure earns one gate refinement without raising the ordinary reach budget", () => {
  const dataDir = mkdtempSync(join(tmpdir(), "koios-originality-refinement-"));
  const contentDir = join(dataDir, "posts");
  mkdirSync(contentDir, { recursive: true });
  const now = "2026-07-20T01:00:00.000Z";
  const sourceUrl = "https://example.test/report";
  const created = createAssignment(dataDir, { term: "reported culture event", beat: "culture", priority: 8, sourceUrls: [sourceUrl] }, [], now).assignment;
  const successor = createSuccessorAssignment(dataDir, {
    predecessorAssignmentId: created.assignmentId,
    successorAssignmentId: `${created.assignmentId}:repair:one`,
    reason: "first paid writer replay",
    authority: "koios.news/newsroom-learning",
    contract: "newsroom-repair-dispatcher/v4",
    terminalCircuitDigest: recordDigest({ terminal: "fixture" }),
  }, [], "2026-07-20T01:01:00.000Z").assignment;
  const draft = createDraftManuscript(contentDir, { title: "Independent culture report", summary: "A fully sourced report awaiting one originality refinement.", body: `${"Independent reporting sentence with useful context and attribution. ".repeat(110)}[Source](${sourceUrl}).\n`, seoTerm: "reported culture event", beat: "culture", assignmentId: successor.assignmentId, references: [{ id: "source", type: "webpage", title: "Report", URL: sourceUrl }], slug: "originality-refinement", date: "2026-07-20", tags: ["culture"], category: "culture" });
  const manuscript = readFileSync(join(contentDir, `${draft.slug}.md`), "utf8");
  appendDatedRecord({ dataRoot: dataDir, ledger: "source-claims", instant: now, record: { kind: "koios.admissible-research-packet-admission", at: now, assignmentId: successor.assignmentId, packet: { term: successor.term, beat: successor.beat, selectedCount: 2, intakeSources: [{ url: sourceUrl }, { url: "https://second.example/report" }] }, packetDigest: `sha256:${"b".repeat(64)}` } });
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-20T01:02:00.000Z", act: "newsroom.repair-replay.settled", subject: successor.assignmentId, data: { predecessorAssignmentId: created.assignmentId, successorAssignmentId: successor.assignmentId, disposition: "refused", capacityConsumed: true, settlementDigest: `sha256:${"c".repeat(64)}` } });
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-20T01:03:00.000Z", act: "newsroom.circuit.source-originality-refused", subject: successor.assignmentId, data: { slug: draft.slug, manuscriptDigest: byteDigest(manuscript), failureLayer: "writer-model", findingCount: 1, findings: [{ sourceUrl, draftSentence: "A shared sentence.", sourceSentence: "A shared sentence." }] } });
  recordAssignmentDisposition(dataDir, { assignmentId: successor.assignmentId, disposition: "refused", reason: "one exact originality finding", authority: "koios.news/editorial-operation", contract: "koios.news/newsroom-circuit-refusal/v1" }, "2026-07-20T01:03:01.000Z");
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-20T01:03:01.000Z", act: "newsroom.circuit.refused", subject: successor.assignmentId, data: { slug: draft.slug, failureLayer: "writer-model", reason: "one exact originality finding" } });
  assert.equal(selectRepairableBacklog(dataDir, "2026-07-20T01:04:00.000Z", contentDir)?.assignmentId, successor.assignmentId);
});

test("changed originality law revalidates the exact refused manuscript once without buying prose", () => {
  const dataDir = mkdtempSync(join(tmpdir(), "koios-originality-revalidation-"));
  const contentDir = join(dataDir, "posts");
  mkdirSync(contentDir, { recursive: true });
  const slug = "rigid-market-list";
  const assignmentId = "culture:rigid-market-list:repair:one";
  const manuscript = "---\ntitle: Rigid market list\n---\nA complete attributed manuscript body.\n";
  writeFileSync(join(contentDir, `${slug}.md`), manuscript);
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-20T02:00:00.000Z", act: "newsroom.circuit.source-originality-refused", subject: assignmentId, data: { slug, manuscriptDigest: recordDigest(manuscript), gateMechanismDigest: `sha256:${"0".repeat(64)}`, failureLayer: "writer-model", findingCount: 1 } });
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-20T02:00:01.000Z", act: "newsroom.circuit.refused", subject: assignmentId, data: { slug, reason: "one rigid attributed enumeration" } });
  const selected = selectSourceOriginalityRevalidationBacklog(dataDir, "2026-07-20T02:01:00.000Z", contentDir);
  assert.equal(selected?.assignmentId, assignmentId);
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-20T02:01:01.000Z", act: "newsroom.source-originality-gate-revalidation.settled", subject: assignmentId, data: { refusalDigest: selected.refusalDigest, gateMechanismDigest: selected.currentMechanismDigest, disposition: "refused", revalidationAdmitted: true } });
  assert.equal(selectSourceOriginalityRevalidationBacklog(dataDir, "2026-07-20T02:02:00.000Z", contentDir), undefined);
});

test("a paid repair refusal without a successor still exhausts the lineage budget", () => {
  const territory = mkdtempSync(join(tmpdir(), "koios-refused-repair-capacity-"));
  const dataDir = join(territory, "data");
  const contentDir = join(territory, "content");
  mkdirSync(dataDir, { recursive: true });
  mkdirSync(contentDir, { recursive: true });
  const assignmentId = "technology-refused-repair-capacity";
  const slug = "technology-refused-repair-capacity";
  const copiedSentence = "The provider returned copied language after consuming the purchased repair capacity.";
  writeFileSync(join(contentDir, `${slug}.md`), `---\ntitle: Independent title\n---\n\n${copiedSentence}\n`, "utf8");
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-20T00:00:00.000Z", act: "newsroom.circuit.opened", subject: assignmentId, data: { slug } });
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-20T00:01:00.000Z", act: "newsroom.circuit.source-originality-refused", subject: assignmentId, data: { slug, failureLayer: "writer-model", findings: [{ sourceUrl: "https://source.example/report", draftSentence: copiedSentence, sourceSentence: copiedSentence }] } });
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-20T00:02:00.000Z", act: "newsroom.circuit.refused", subject: assignmentId, data: { slug, reason: "source-originality gate found source-shaped prose" } });
  for (let index = 0; index < 3; index += 1) {
    const minute = 3 + index;
    appendKoiosAct({ dataRoot: dataDir, ledger: "provider-usage", instant: `2026-07-20T00:0${minute}:00.000Z`, act: "inference.consumed", subject: `repair-provider-${index}`, data: { assignmentId, providerSettlementDigest: `sha256:provider-${index}`, customerAdmission: false } });
    appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: `2026-07-20T00:0${minute}:01.000Z`, act: "newsroom.repair-replay.settled", subject: assignmentId, data: { predecessorAssignmentId: assignmentId, settlementDigest: `sha256:attempt-${index}`, disposition: "refused", capacityConsumed: false } });
  }
  assert.equal(selectRepairableBacklog(dataDir, "2026-07-20T00:07:00.000Z", contentDir), undefined);
  const exhausted = readKoiosLedger(dataDir, "contract-events").find((entry) => entry.act === "newsroom.repair.economically-exhausted");
  assert.equal(exhausted?.data.attempts, 3);
  assert.equal(exhausted?.data.budget, 3);
});

test("the pure ingress witness identifies only an exactly admitted issue pulse", () => {
  const admitted = pulse(BASE_POLICY, "authority-witness");
  assert.deepEqual(inspectAdmittedIssuePulse(admitted), {
    actor: TEST_TRIGGER.actor,
    capability: TEST_TRIGGER.capability,
    pulseId: "authority-witness",
    policyDigest: recordDigest(BASE_POLICY),
    activityDigest: recordDigest(admitted),
  });
  assert.equal(inspectAdmittedIssuePulse({ ...admitted, actor: "urn:test:intruder" }), undefined);
  assert.equal(inspectAdmittedIssuePulse({ ...admitted, capability: "urn:test:wrong-capability" }), undefined);
});

test("audience/product planning favors an unserved entertainment product and penalizes a near-duplicate", () => {
  const posts = [
    { slug: "ai-grid-demand-one", document: { frontMatter: { title: "AI grid demand rises again", date: "2026-07-19", draft: false, categories: ["Technology"], koios: { beat: "technology", seo_term: "AI grid demand" } } } },
    { slug: "ai-grid-demand-two", document: { frontMatter: { title: "Data centers add pressure to the grid", date: "2026-07-18", draft: false, categories: ["technology"], koios: { beat: "technology" } } } },
    { slug: "indigenous-un-summit", document: { frontMatter: { title: "Indigenous leaders address climate at UN summit", date: "2026-07-18", draft: false, categories: ["Environment"], koios: { beat: "environment", seo_term: "indigenous climate UN summit" } } } },
  ];
  const candidate = (id, term, beat, priority = 1) => ({ id, term, beat, priority, sourceUrls: [`https://example.test/${id}`], evidence: { views: 0, impressions: 0, clicks: 0, covered: false } });
  const plan = planAudienceProducts({
    posts,
    now: "2026-07-19T15:40:00.000Z",
    trends: [
      { term: "celebrity wedding surprise", traffic: "200K+", alreadyCovered: false },
      { term: "baseball playoff schedule", traffic: "50K+", alreadyCovered: false },
    ],
    candidates: [
      candidate("another-ai-story", "AI grid demand outlook", "technology", 30),
      candidate("duplicate-un-story", "indigenous climate UN summit", "environment", 30),
      candidate("celebrity-story", "celebrity wedding surprise", "culture", 1),
    ],
  });
  assert.equal(plan.candidates[0].id, "celebrity-story");
  assert.equal(plan.candidates.at(-1).id, "duplicate-un-story");
  assert.equal(plan.reading.rankedCandidates[0].productClass, "entertainment-celebrity");
  assert.equal(plan.reading.unservedDemand[0].term, "baseball playoff schedule");
  assert.equal(plan.reading.unservedDemand[0].productClass, "sports");
  assert.equal(plan.reading.unservedDemand[0].requiredMove, "expand-source-custody");
});

test("a bounded issue pulse evaluates portfolio bands before score-ranked overflow", () => {
  const candidate = (id, term, beat, priority) => ({ id, term, beat, priority, sourceUrls: [`https://${id}.test/report`], evidence: { views: 0, impressions: 0, clicks: 0, covered: false } });
  const planned = planAudienceProducts({
    posts: [],
    now: "2026-07-20T00:00:00.000Z",
    candidates: [
      candidate("reach-one", "celebrity wedding surprise", "culture", 30),
      candidate("reach-two", "movie trailer release", "culture", 29),
      candidate("reach-three", "concert album announcement", "culture", 28),
      candidate("core-one", "administration changes national monument policy", "politics", 20),
      candidate("depth-one", "documents show procurement investigation", "politics", 10),
    ],
  });
  const slate = boundedCandidateEvaluationSlate(planned.candidates, planned.reading, 4);
  assert.deepEqual(slate.map((entry) => productClassFor(entry)), [
    "entertainment-celebrity",
    "politics-power",
    "entertainment-celebrity",
    "investigations",
  ]);
});

test("an entertainment-wire story remains an entertainment product when its title assumes celebrity knowledge", () => {
  assert.equal(productClassFor({
    term: "zendaya earrings part bigger problem",
    beat: "culture",
    title: "Zendaya's Earrings Are Part of a Bigger Red-Carpet Story",
    sourceUrls: ["https://variety.com/2026/style/news/zendaya-earrings-123/"],
  }), "entertainment-celebrity");
  assert.equal(productClassFor({
    term: "zendaya earrings part bigger problem",
    beat: "culture",
    title: "Zendaya’s Earrings Are Part of a Much Bigger Problem",
    sourceUrls: ["https://hyperallergic.com/zendayas-earrings-are-part-of-a-much-bigger-problem/"],
  }), "entertainment-celebrity");
  assert.equal(productClassFor({
    term: "living memorial palestinian activist alex odeh",
    beat: "culture",
    sourceUrls: ["https://hyperallergic.com/a-living-memorial/"],
  }), "culture");
});

test("Guardian entertainment paths and an investigative provider retain their market products", () => {
  assert.equal(productClassFor({ term: "tricky honest playlist", beat: "culture", title: "Tricky's honest playlist", sourceUrls: ["https://www.theguardian.com/music/2026/jul/19/tricky-honest-playlist"] }), "entertainment-celebrity");
  assert.equal(productClassFor({ term: "crypto entrepreneur leaked forum", beat: "war", title: "Identifying the Crypto Entrepreneur Linked to a Forum", sourceUrls: ["https://www.bellingcat.com/news/2026/07/16/example/"] }), "investigations");
});

test("a provider politics desk makes a terse officeholder action a politics-and-power product", () => {
  assert.equal(productClassFor({
    term: "trump shrinks utah national monuments",
    beat: "culture",
    title: "Trump again shrinks Bears Ears and Grand Staircase-Escalante National Monuments",
    sourceUrls: [
      "https://hyperallergic.com/trump-shrinks-utah-national-monuments-by-90/",
      "https://grist.org/politics/trump-again-shrinks-bears-ears-and-grand-staircase-escalante-national-monuments/",
    ],
  }), "politics-power");
});

test("World Cup and sports-wire offers settle into the sports product rather than generic culture", () => {
  assert.equal(productClassFor({ term: "cup spain argentina final buildup security", beat: "sports", title: "World Cup 2026: Spain v Argentina final buildup" }), "sports");
  assert.equal(productClassFor({ term: "final buildup", beat: "culture", title: "Live buildup", sourceUrls: ["https://www.theguardian.com/football/2026/jul/19/world-cup-final-live"] }), "sports");
  assert.equal(productClassFor({ term: "aaron judge", beat: "culture", title: "Aaron Judge news and updates", sourceUrls: ["https://www.foxsports.com/mlb/aaron-judge-player"] }), "sports");
  assert.equal(productClassFor({ term: "trade update", beat: "culture", title: "Trade update", sourceUrls: ["https://www.mlb.com/news/example"] }), "sports");
});

test("a software release cadence is technology reporting, not a one-source schedule service", () => {
  const input = {
    term: "mozilla speeds firefox release schedule biweekly",
    beat: "technology",
    title: "Mozilla speeds Firefox release schedule to biweekly",
  };
  assert.equal(productClassFor(input), "technology-science");
  assert.equal(commissionForAssignment(input).evidenceBudget.minimumIndependentSources, 2);
  assert.equal(productClassFor({ term: "when are the World Cup games", beat: "sports", title: "World Cup TV schedule and game times" }), "sports");
  assert.equal(productClassFor({ term: "festival dates", beat: "culture", title: "Summer festival event schedule and times" }), "service-utility");
});

test("ordinary where and how language does not turn scientific reporting into a service brief", () => {
  assert.equal(productClassFor({
    term: "anthropic hidden space claude puzzles concepts",
    title: "Anthropic found a hidden space where Claude puzzles over concepts",
    beat: "technology",
    sourceUrls: ["https://www.technologyreview.com/2026/07/09/example"],
  }), "technology-science");
  assert.equal(productClassFor({ term: "how AI models reason", beat: "technology" }), "technology-science");
  assert.equal(productClassFor({ term: "how to claim a tax refund", beat: "economy" }), "service-utility");
});

test("verbose products cannot erase a terse product before audience allocation", () => {
  const nomination = (index, beat, title, url) => Object.freeze({
    kind: "koios.source-driven-nomination",
    beat,
    subject: `subject-${index}`,
    term: title.toLowerCase().replace(/[^a-z0-9]+/gu, " ").trim(),
    title,
    url,
    sourcePublished: "2026-07-19T12:00:00.000Z",
    evidenceCharacters: 500,
    ageDays: 0,
    priority: 40 - index / 100,
  });
  const environment = Array.from({ length: 40 }, (_, index) => nomination(index, "environment", `Climate report number ${index}`, `https://climate.example/${index}`));
  const entertainment = nomination(100, "culture", "Box Office: The Odyssey opens to $124 million", "https://variety.com/2026/film/box-office/the-odyssey/");
  const pool = diversifySourceNominations([...environment, entertainment], { maximumPerProduct: 6, maximumTotal: 12 });
  assert.equal(pool.length, 7);
  assert.ok(pool.some((entry) => entry.url.includes("variety.com")));
});

test("one source asset cannot impersonate a deeper market packet through duplicate URLs", () => {
  const source = (url, title, score) => ({ url, title, summary: title, score });
  const packet = { intakeSources: [
    source("https://deadline.com/odyssey", "The Odyssey conquers global box office", 10),
    source("https://deadline.com/odyssey", "The Odyssey conquers global box office", 9),
    source("https://variety.com/odyssey", "The Odyssey conquers global box office", 8),
  ] };
  assert.deepEqual(assignmentSourceUrls("odyssey conquers global box office", packet), [
    "https://deadline.com/odyssey",
    "https://variety.com/odyssey",
  ]);
});

test("a lead recalls corroboration across desks before it becomes a commission", () => {
  const nomination = Object.freeze({
    kind: "koios.source-driven-nomination",
    beat: "environment",
    subject: "lead",
    term: "trump shrinks bears ears grand staircase",
    title: "Trump shrinks Bears Ears and Grand Staircase",
    url: "https://grist.org/lead",
    sourcePublished: "2026-07-19T12:00:00.000Z",
    evidenceCharacters: 900,
    ageDays: 0,
    priority: 20,
  });
  const item = (sourceUrl, title, summary, sourcePublished = "2026-07-19T11:00:00.000Z") => ({ sourceUrl, title, summary, sourcePublished });
  const intake = [
    { beat: "environment", storeDir: "/unused/environment", items: [item("https://grist.org/same-outlet", nomination.title, "Trump shrinks Bears Ears and Grand Staircase. ".repeat(12))] },
    { beat: "culture", storeDir: "/unused/culture", items: [
      item("https://hyperallergic.com/corroboration", "Trump Shrinks Utah National Monuments", "Trump shrinks Bears Ears and Grand Staircase while tribal governments prepare a legal response. ".repeat(8)),
      item("https://roundup.test/newsletter", "Required reading roundup", "Trump shrinks Bears Ears and Grand Staircase. Read more. Read more. Read more. ".repeat(8)),
      item("https://coincidence.test/story", "Words without an event", "Bears trump grand plans whenever staircase designers shrink ears. ".repeat(12)),
      item("https://unrelated.test/story", "Unrelated museum opening", "A museum opens a new collection with local artists. ".repeat(12)),
    ] },
  ];
  assert.deepEqual(corroboratingSourceUrlsForNomination({ nomination, intake, now: "2026-07-19T20:00:00.000Z", maxAgeDays: 14 }), [
    "https://grist.org/lead",
    "https://hyperallergic.com/corroboration",
  ]);
});

test("audience allocation prices independent source domains rather than URL volume", () => {
  const base = { term: "consumer refund deadline", beat: "economy", priority: 10, evidence: { views: 0, impressions: 0, clicks: 0, covered: false } };
  const sameSupplier = { ...base, id: "same", sourceUrls: ["https://example.test/a", "https://example.test/b", "https://example.test/c"] };
  const independent = { ...base, id: "independent", sourceUrls: ["https://one.test/a", "https://two.test/b", "https://three.test/c"] };
  const plan = planAudienceProducts({ candidates: [sameSupplier, independent], posts: [], now: "2026-07-19T19:00:00.000Z" });
  assert.equal(plan.candidates[0].id, "independent");
  assert.match(plan.reading.rankedCandidates[0].reasons.join(" "), /3 independent domain/u);
});

test("general-interest Google trends remain visible when the old beat vocabulary cannot classify them", () => {
  const reading = foldTrends({
    ok: true,
    source: "google-trends:US",
    items: [
      { term: "Baseball playoff schedule", traffic: "200K+" },
      { term: "Climate policy vote", traffic: "50K+" },
    ],
  }, new Map(), new Set());
  assert.equal(reading.novel.length, 2);
  assert.equal(reading.novel[0].term, "Baseball playoff schedule");
  assert.equal(reading.novel[0].beat, undefined);
  assert.equal(reading.novel[1].beat, "environment");
});

test("keyword research can originate a source-acquisition purchase without impersonating warrant", () => {
  const brief = Object.freeze({
    type: "KeywordOpportunityBrief",
    contract: "koios.news/keyword-opportunity-research/v1",
    orderId: "urn:test:keyword-order",
    generatedAt: "2026-07-19T20:00:00.000Z",
    measuredDemand: Object.freeze([]),
    discovery: Object.freeze({
      trends: Object.freeze({
        probed: true,
        source: "google-trends:US",
        novel: Object.freeze([{ term: "Baseball playoff schedule", traffic: "200K+", alreadyCovered: false }]),
        reinforcing: Object.freeze([]),
      }),
      candidateKeywords: Object.freeze([{ phrase: "consumer tax refund deadline", beat: "economy", documentFrequency: 3, sourceBreadth: 2, score: 19, evidence: Object.freeze(["Refund agency guidance", "Consumer filing calendar"]) }]),
    }),
    trendProbe: Object.freeze({ ok: true, source: "google-trends:US", items: Object.freeze([{ term: "Baseball playoff schedule", traffic: "200K+" }]) }),
    observations: Object.freeze({ searchConsoleQueries: 0, attentionRecords: 0, advertisingRecords: 0, externalRevenueRecords: 0 }),
    factualWarrant: false,
    use: "assignment-selection-only",
    briefDigest: "sha256:test-keyword-brief",
  });
  const candidates = keywordOpportunityCandidates({ brief, permittedBeats: new Set(BASE_POLICY.permittedBeats), configPath: CONFIG });
  assert.equal(candidates.length, 2);
  assert.equal(candidates[0].origin, "keyword-research");
  assert.equal(candidates[0].term, "Baseball playoff schedule");
  assert.equal(candidates[0].beat, "sports");
  assert.equal(candidates[0].sourceStatus, "source-discovery-required");
  assert.deepEqual(candidates[0].sourceUrls, []);
  assert.equal(candidates[0].packet.selectedCount, 0);
  assert.equal(candidates[0].keywordOpportunity.factualWarrant, false);
  assert.equal(candidates[0].keywordOpportunity.briefDigest, brief.briefDigest);
  assert.match(candidates[1].angle, /eligibility, deadline, cost/u);

  const plan = planAudienceProducts({ candidates, posts: [], now: "2026-07-19T20:00:00.000Z" });
  assert.equal(plan.reading.rankedCandidates[0].sourceStatus, "source-discovery-required");
  assert.equal(plan.reading.portfolio.slots[0].disposition, "procurement");
  assert.match(plan.reading.rankedCandidates[0].reasons.join(" "), /source-discovery and admission purchase/u);
});

test("keyword intake refuses bare navigation but retains and resolves a person trend into a concrete event", () => {
  const brief = Object.freeze({
    type: "KeywordOpportunityBrief",
    contract: "koios.news/keyword-opportunity-research/v1",
    orderId: "urn:test:thin-keyword-order",
    generatedAt: "2026-07-19T20:00:00.000Z",
    measuredDemand: Object.freeze([]),
    discovery: Object.freeze({
      trends: Object.freeze({
        probed: true,
        source: "google-trends:US",
        novel: Object.freeze([
          { term: "cnbc", traffic: "200K+", alreadyCovered: false },
          { term: "Victor Munoz", traffic: "100K+", alreadyCovered: false },
        ]),
        reinforcing: Object.freeze([]),
      }),
      candidateKeywords: Object.freeze([]),
    }),
    trendProbe: Object.freeze({ ok: true, source: "google-trends:US", items: Object.freeze([]) }),
    observations: Object.freeze({ searchConsoleQueries: 0, attentionRecords: 0, advertisingRecords: 0, externalRevenueRecords: 0 }),
    factualWarrant: false,
    use: "assignment-selection-only",
    briefDigest: "sha256:test-thin-keyword-brief",
  });
  const candidates = keywordOpportunityCandidates({ brief, permittedBeats: new Set(BASE_POLICY.permittedBeats), configPath: CONFIG });
  assert.deepEqual(candidates.map((candidate) => candidate.term), ["Victor Munoz"]);
  assert.equal(resolvedKeywordEventTerm("Victor Munoz", [
    { title: "Victor Munoz in CA - California Address & Phone Number" },
    { title: "Victor Munoz" },
    { title: "Victor Munoz Wins National Coaching Award After Record Season" },
  ]), "Victor Munoz Wins National Coaching Award After Record Season");
  assert.equal(resolvedKeywordEventTerm("Victor Munoz", [{ title: "Victor Munoz" }]), "Victor Munoz");
});

test("the publication commissions different products without weakening their warrant floor", () => {
  const service = commissionForAssignment({ term: "2026 tax filing deadline", beat: "economy" });
  const entertainment = commissionForAssignment({ term: "actor wedding announcement", beat: "culture" });
  const analysis = commissionForAssignment({ term: "Senate votes on consumer privacy law", beat: "politics" });
  const investigation = commissionForAssignment({ term: "records show procurement audit failures", beat: "politics" });
  assert.equal(service.genre, "service-brief/v1");
  assert.equal(entertainment.genre, "current-news-brief/v1");
  assert.equal(entertainment.evidenceBudget.minimumIndependentSources, 1);
  assert.equal(analysis.genre, "standard-news/v1");
  assert.equal(investigation.genre, "deep-report/v1");
  assert.equal(service.resourceEnvelope.writingServiceClass, "accountable-prose");
  assert.equal(service.resourceEnvelope.maximumDraftRepairs, 2);
  assert.equal(service.resourceEnvelope.editorialServiceClass, "editorial-judgment");
  assert.equal(analysis.resourceEnvelope.writingServiceClass, "accountable-prose");
  assert.equal(analysis.resourceEnvelope.maximumDraftRepairs, 2);
  assert.equal(investigation.resourceEnvelope.editorialServiceClass, "editorial-judgment");
  assert.equal(investigation.resourceEnvelope.maximumDraftRepairs, 2);
  for (const commission of [service, entertainment, analysis, investigation]) {
    assert.match(commission.invariants.join(" "), /never supply factual warrant/u);
    assert.match(commission.invariants.join(" "), /never a subject-admission condition/u);
  }
});

test("the rolling portfolio alternates reach and core before spending the weekly depth slot", () => {
  const candidate = (id, term, beat, url) => ({ id, term, beat, priority: 10, sourceUrls: [url, `https://corroborator.test/${id}`], evidence: { views: 0, impressions: 0, clicks: 0, covered: false } });
  const candidates = [
    candidate("reach", "actor film announcement", "culture", "https://variety.com/reach"),
    candidate("core", "senate votes on consumer privacy law", "politics", "https://politics.test/core"),
    candidate("depth", "records show procurement audit failures", "politics", "https://www.bellingcat.com/news/depth"),
  ];
  const post = (slug, title, term, beat, at) => ({ slug, document: { frontMatter: { title, date: at, draft: false, koios: { beat, seo_term: term } } } });
  const now = "2026-07-19T20:00:00.000Z";

  const empty = planAudienceProducts({ candidates, posts: [], now });
  assert.equal(empty.reading.portfolio.nextRequiredBand, "reach");
  assert.equal(empty.candidates[0].id, "reach");
  assert.equal(empty.reading.portfolio.horizon.dailySlots, 4);
  assert.match(empty.reading.portfolio.law.join(" "), /no fictional internal revenue/u);

  const oneReach = planAudienceProducts({ candidates, posts: [post("reach-one", "Actor film announcement", "actor film announcement", "culture", "2026-07-19T18:00:00.000Z")], now });
  assert.equal(oneReach.reading.portfolio.nextRequiredBand, "core");
  assert.equal(oneReach.candidates[0].id, "core");

  const oneEach = planAudienceProducts({ candidates, posts: [
    post("reach-one", "Actor film announcement", "actor film announcement", "culture", "2026-07-19T18:00:00.000Z"),
    post("core-one", "Senate votes on privacy", "senate privacy law", "politics", "2026-07-19T17:00:00.000Z"),
  ], now });
  assert.equal(oneEach.reading.portfolio.nextRequiredBand, "reach");

  const depthDue = planAudienceProducts({ candidates, posts: [
    post("reach-one", "Actor film announcement", "actor film announcement", "culture", "2026-07-19T18:00:00.000Z"),
    post("reach-two", "Baseball schedule", "baseball playoff schedule", "sports", "2026-07-19T16:00:00.000Z"),
    post("core-one", "Senate votes on privacy", "senate privacy law", "politics", "2026-07-19T17:00:00.000Z"),
  ], now });
  assert.equal(depthDue.reading.portfolio.nextRequiredBand, "depth");
  assert.equal(depthDue.candidates[0].id, "depth");
  assert.equal(depthDue.reading.portfolio.slots[3].resourceEnvelope.costClass, "depth-capacity");
});

test("observed audience response changes later product allocation without becoming warrant", () => {
  const posts = [
    { slug: "measured-game", document: { frontMatter: { title: "Baseball final result", date: "2026-07-01", draft: false, koios: { beat: "culture", seo_term: "baseball final result" } } } },
  ];
  const performance = productPerformanceReading({
    posts,
    attention: [{ act: "attention.article-loads.observed", subject: "measured-game", data: { slug: "measured-game", observedLoads: 1023, factualWarrant: false } }],
  });
  const candidate = (id, term) => ({ id, term, beat: "culture", priority: 1, sourceUrls: [`https://example.test/${id}`, `https://example.net/${id}`], evidence: { views: 0, impressions: 0, clicks: 0, covered: false } });
  const plan = planAudienceProducts({
    posts: [],
    now: "2026-07-19T15:40:00.000Z",
    performance,
    candidates: [candidate("entertainment", "actor film announcement"), candidate("sports", "baseball championship result")],
  });
  assert.equal(plan.candidates[0].id, "sports");
  assert.equal(plan.reading.productPerformance.sports.observedLoads, 1023);
  assert.match(plan.reading.law.join(" "), /never supply factual warrant/u);
});

test("successive cumulative attention snapshots cannot manufacture product demand", () => {
  const posts = [
    { slug: "measured-game", document: { frontMatter: { title: "Baseball final result", date: "2026-07-01", draft: false, koios: { beat: "culture", seo_term: "baseball final result" } } } },
  ];
  const performance = productPerformanceReading({
    posts,
    attention: [
      { act: "attention.article-loads.observed", recordedAt: "2026-07-20T10:00:00.000Z", data: { slug: "measured-game", day: "2026-07-20", observedLoads: 3 } },
      { act: "attention.article-loads.observed", recordedAt: "2026-07-20T11:00:00.000Z", data: { slug: "measured-game", day: "2026-07-20", observedLoads: 5 } },
      { act: "attention.article-loads.observed", recordedAt: "2026-07-21T10:00:00.000Z", data: { slug: "measured-game", day: "2026-07-21", observedLoads: 2 } },
    ],
  });
  assert.equal(performance.sports.observedArticles, 1);
  assert.equal(performance.sports.observedLoads, 7);
  assert.equal(performance.sports.attentionEvidenceDigests.length, 2);
});

test("publication economics keeps cash, estimated usage, and receipted revenue distinct", () => {
  const predecessor = "politics-election-guide";
  const successor = `${predecessor}:repair:abc123`;
  const assignmentRecords = [{ kind: "koios.assignment-successor-witness", predecessorAssignmentId: predecessor, assignment: { assignmentId: successor } }];
  assert.deepEqual(assignmentLineageFromRecords(assignmentRecords, successor), [successor, predecessor]);
  const reading = publicationEconomicReading({
    assignmentId: successor,
    assignmentRecords,
    slug: "election-deadlines-explained",
    providerUsage: [
      { act: "provider.service.consumed", subject: "service-1", data: { assignmentId: predecessor, price: { amount: 0, currency: "USD" } } },
      { act: "inference.consumed", subject: "inference-1", data: { assignmentId: predecessor, modelUsage: { sonnet: { costUSD: 0.42 } } } },
      { act: "inference.consumed", subject: "inference-2", data: { assignmentId: successor, cost: { denomination: "google-ai-studio-api-requests", "fuel-consumed": 1 } } },
    ],
    revenueCost: [{ act: "external.revenue.received", data: { slug: "election-deadlines-explained", revenueMicros: 700_000, counterparty: "advertiser.test", receiptDigest: "sha256:receipt" } }],
  });
  assert.equal(reading.contractedCashCostMicros, 0);
  assert.equal(reading.providerEstimatedCostMicros, 420_000);
  assert.equal(reading.allocationCostMicros, 420_000);
  assert.equal(reading.unpricedResourceUses, 1);
  assert.equal(reading.revenueMicros, 700_000);
  assert.equal(reading.directContractMarginMicros, 700_000);
  assert.equal(reading.profitStatus, "direct-contract-margin-observed");
  assert.equal(reading.factualWarrant, false);
});

test("the audience planner uses only the latest economic snapshot for a story", () => {
  const posts = [{ slug: "measured-story", document: { frontMatter: { title: "Consumer deadline", date: "2026-07-19", draft: false, koios: { beat: "economy", seo_term: "consumer tax deadline" } } } }];
  const performance = productPerformanceReading({
    posts,
    revenueCost: [
      { act: "external.revenue.received", recordedAt: "2026-07-19T10:00:00.000Z", data: { slug: "measured-story", revenueMicros: 10 } },
      { act: "publication.economics.observed", recordedAt: "2026-07-19T11:00:00.000Z", data: { slug: "measured-story", revenueMicros: 1_000_000, costMicros: 400_000 } },
      { act: "publication.economics.observed", recordedAt: "2026-07-19T12:00:00.000Z", data: { slug: "measured-story", revenueMicros: 1_500_000, costMicros: 600_000 } },
      { act: "external.revenue.received", recordedAt: "2026-07-19T13:00:00.000Z", recordDigest: "sha256:later-revenue-receipt", data: { slug: "measured-story", revenueMicros: 500_000, counterparty: "advertiser.test", receiptDigest: "sha256:stripe-event" } },
    ],
  });
  assert.equal(performance["service-utility"].attributedRevenueMicros, 2_000_000);
  assert.equal(performance["service-utility"].attributedCostMicros, 600_000);
  assert.deepEqual(performance["service-utility"].economicEvidenceDigests, ["sha256:later-revenue-receipt", recordDigest({ act: "publication.economics.observed", recordedAt: "2026-07-19T12:00:00.000Z", data: { slug: "measured-story", revenueMicros: 1_500_000, costMicros: 600_000 } })].sort());
  const candidate = (id, term) => ({ id, term, beat: "culture", priority: 1, sourceUrls: [`https://example.test/${id}`], evidence: { views: 0, impressions: 0, clicks: 0, covered: false } });
  const plan = planAudienceProducts({ candidates: [candidate("culture", "local arts festival"), candidate("service", "consumer tax deadline")], posts: [], performance, now: "2026-07-19T13:00:00.000Z" });
  assert.equal(plan.candidates[0].id, "service", "receipted economics must change allocation even when attention analytics are absent");
  const serviceDecision = plan.reading.rankedCandidates.find((reading) => reading.productClass === "service-utility");
  assert.match(serviceDecision.reasons.join(" "), /2000000 attributed outside-revenue micro\(s\).*600000 allocation-cost micro\(s\).*1400000 observed allocation-margin micro\(s\)/u);
  assert.deepEqual(serviceDecision.performanceEvidenceDigests, performance["service-utility"].economicEvidenceDigests);
});

test("unpublished premium churn changes a later product purchase without becoming warrant", () => {
  const draft = [{ slug: "costly-culture-draft", document: { frontMatter: { title: "Festival review", date: "2026-07-20", draft: true, koios: { beat: "culture", seo_term: "festival review" } } } }];
  const performance = productPerformanceReading({
    posts: draft,
    providerUsage: [
      { act: "inference.consumed", subject: "editor-1", data: { slug: "costly-culture-draft", purpose: "Independently assess Koios manuscript costly-culture-draft.", modelUsage: { sonnet: { costUSD: 1.5 } } } },
      { act: "inference.consumed", subject: "editor-2", data: { slug: "costly-culture-draft", purpose: "Independently assess Koios manuscript costly-culture-draft.", modelUsage: { sonnet: { costUSD: 0.5 } } } },
    ],
  });
  assert.equal(performance.culture.publishedArticles, 0);
  assert.equal(performance.culture.unpublishedArticles, 1);
  assert.equal(performance.culture.unpublishedEditorialCalls, 2);
  assert.equal(performance.culture.unpublishedEstimatedCostMicros, 2_000_000);
  const candidate = (id, term) => ({ id, term, beat: "culture", priority: 1, sourceUrls: [`https://example.test/${id}`, `https://example.net/${id}`], evidence: { views: 0, impressions: 0, clicks: 0, covered: false } });
  const plan = planAudienceProducts({ posts: [], now: "2026-07-20T10:00:00.000Z", performance, candidates: [candidate("culture", "festival review"), candidate("entertainment", "actor film announcement")] });
  assert.equal(plan.candidates[0].id, "entertainment");
  assert.match(plan.reading.rankedCandidates.find((reading) => reading.productClass === "culture").reasons.join(" "), /2 editorial call/u);
  assert.match(plan.reading.law.join(" "), /without becoming factual warrant/u);
});

function pulse(policy, id = "test-pulse") {
  return Object.freeze({
    "@context": ACTIVITYSTREAMS_CONTEXT,
    id: `urn:test:${id}`,
    type: "Create",
    actor: TEST_TRIGGER.actor,
    capability: TEST_TRIGGER.capability,
    target: PUBLICATION_ACTOR,
    published: "2026-07-18T20:00:00.000Z",
    object: Object.freeze({ type: "NewsroomIssueDemand", pulseId: id, policy, policyDigest: recordDigest(policy) }),
  });
}

test("a new issue refuses without the exact evidence-provider deliveries and exact replay returns that durable settlement", async () => {
  const territory = mkdtempSync(join(tmpdir(), "koios-issue-controller-"));
  const dataDir = join(territory, "data");
  const contentDir = join(territory, "content");
  mkdirSync(dataDir, { recursive: true });
  mkdirSync(contentDir, { recursive: true });
  const policy = Object.freeze({
    ...BASE_POLICY,
    minimumHoursBetweenNewIssues: 0,
    sourceRefreshAuthorized: false,
    selectionMode: "source-driven",
  });
  const activity = pulse(policy);
  const first = await settleIssuePulse(activity, { now: "2026-07-18T20:00:00.000Z", dataDir, contentDir, configPath: CONFIG });
  assert.equal(first.type, "Reject");
  assert.equal(first.object.code, "source-intelligence-refused");
  assert.match(first.object.reason, /no exact Newscable provider delivery/u);
  assert.equal(readActionableAssignments(dataDir).length, 0);

  const replay = await settleIssuePulse(activity, { now: "2026-07-18T20:00:01.000Z", dataDir, contentDir, configPath: CONFIG });
  assert.deepEqual(replay, first);
});

test("the controller refuses policy mutation and capabilities outside its boundary", async () => {
  const territory = mkdtempSync(join(tmpdir(), "koios-issue-controller-refusal-"));
  const dataDir = join(territory, "data");
  const contentDir = join(territory, "content");
  mkdirSync(dataDir, { recursive: true });
  mkdirSync(contentDir, { recursive: true });
  const policy = Object.freeze({ ...BASE_POLICY, sourceRefreshAuthorized: false });
  const original = pulse(policy, "changed-policy");
  const changed = { ...original, object: { ...original.object, policy: { ...policy, minimumHoursBetweenNewIssues: 0 } } };
  const result = await settleIssuePulse(changed, { now: "2026-07-18T20:01:00.000Z", dataDir, contentDir, configPath: CONFIG });
  assert.equal(result.type, "Reject");
  assert.equal(result.object.code, "policy-mismatch");

  const wrong = await settleIssuePulse({ ...pulse(policy, "wrong-boundary"), target: "urn:test:writer" }, { now: "2026-07-18T20:02:00.000Z", dataDir, contentDir, configPath: CONFIG });
  assert.equal(wrong.type, "Reject");
  assert.equal(wrong.object.code, "wrong-boundary");

  const unknown = await settleIssuePulse({ ...pulse(policy, "unknown-trigger"), actor: "urn:test:unknown" }, { now: "2026-07-18T20:02:01.000Z", dataDir, contentDir, configPath: CONFIG });
  assert.equal(unknown.type, "Reject");
  assert.equal(unknown.object.code, "unauthorized-trigger");
  assert.equal(readActionableAssignments(dataDir).length, 0);
});

test("the controller settles inherited overflow into one bounded active portfolio", async () => {
  const territory = mkdtempSync(join(tmpdir(), "koios-issue-controller-capacity-"));
  const dataDir = join(territory, "data");
  const contentDir = join(territory, "content");
  mkdirSync(dataDir, { recursive: true });
  mkdirSync(contentDir, { recursive: true });
  createAssignment(dataDir, { term: "first warranted event", beat: "technology", sourceUrls: ["https://example.test/one"] }, [], "2026-07-18T18:00:00.000Z");
  createAssignment(dataDir, { term: "second warranted event", beat: "environment", sourceUrls: ["https://example.test/two"] }, [], "2026-07-18T18:01:00.000Z");
  const policy = Object.freeze({ ...BASE_POLICY, sourceRefreshAuthorized: false, maxOpenAssignments: 1 });
  const portfolio = settleOpenAssignmentPortfolio({ dataDir, permittedBeats: new Set(policy.permittedBeats), maximum: policy.maxOpenAssignments, now: "2026-07-18T20:03:00.000Z" });
  assert.equal(portfolio.active.length, 1);
  assert.equal(portfolio.deferred.length, 1);
  assert.equal(readActionableAssignments(dataDir).length, 1);
  recordAssignmentDisposition(dataDir, {
    assignmentId: portfolio.active[0],
    disposition: "refused",
    reason: "deterministic backlog fixture refusal",
    authority: "koios.news/editorial-operation",
    contract: "koios.news/backlog-settlement/v1",
  }, "2026-07-18T20:04:00.000Z");
  const promoted = settleOpenAssignmentPortfolio({ dataDir, permittedBeats: new Set(policy.permittedBeats), maximum: policy.maxOpenAssignments, now: "2026-07-18T20:04:01.000Z" });
  assert.deepEqual(promoted.active, portfolio.deferred);
  assert.equal(readActionableAssignments(dataDir).length, 1);
  assert.throws(() => recordAssignmentDisposition(dataDir, {
    assignmentId: portfolio.active[0],
    disposition: "superseded",
    reason: "a contradictory terminal state",
    authority: "koios.news/editorial-operation",
    contract: "koios.news/backlog-settlement/v1",
  }, "2026-07-18T20:05:00.000Z"), /different terminal disposition/u);
});

test("an inherited assignment whose packet cannot support its lens is terminally refused and releases the queue", async () => {
  const territory = mkdtempSync(join(tmpdir(), "koios-issue-controller-evidence-release-"));
  const dataDir = join(territory, "data");
  const contentDir = join(territory, "content");
  mkdirSync(dataDir, { recursive: true });
  mkdirSync(contentDir, { recursive: true });
  const created = createAssignment(dataDir, {
    term: "eva longoria new york appearance",
    beat: "culture",
    sourceUrls: ["https://example.test/unrelated-climate-story"],
  }, [], "2026-07-18T18:00:00.000Z");
  const policy = Object.freeze({ ...BASE_POLICY, sourceRefreshAuthorized: false });
  const result = await settleIssuePulse(pulse(policy, "evidence-release"), { now: "2026-07-18T20:04:00.000Z", dataDir, contentDir, configPath: CONFIG });
  assert.equal(result.type, "Reject");
  assert.equal(result.object.code, "assignment-evidence-no-longer-admissible");
  assert.equal(readActionableAssignments(dataDir).some((entry) => entry.assignmentId === created.assignment.assignmentId), false);
  assert.equal(readKoiosLedger(dataDir, "contract-events").some((entry) => entry.act === "assignment.evidence-refused" && entry.subject === created.assignment.assignmentId), true);
});

test("a terminal failed story cannot preempt the fresh-publication clock", async () => {
  const territory = mkdtempSync(join(tmpdir(), "koios-issue-controller-repair-"));
  const dataDir = join(territory, "data");
  const contentDir = join(territory, "content");
  mkdirSync(dataDir, { recursive: true });
  mkdirSync(contentDir, { recursive: true });
  const assignmentId = "economy-repairable-example";
  const slug = "economy-repairable-story";
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-18T18:00:00.000Z", act: "newsroom.circuit.opened", subject: assignmentId, data: { slug } });
  appendDatedRecord({ dataRoot: dataDir, ledger: "editorial-judgments", instant: "2026-07-18T18:01:00.000Z", record: { kind: "koios.editorial-judgment", recordedAt: "2026-07-18T18:01:00.000Z", slug, disposition: "revise", failureLayer: "draft-repair" } });
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-18T18:02:00.000Z", act: "newsroom.circuit.refused", subject: assignmentId, data: { slug, reason: "draft repair exhausted" } });
  const policy = Object.freeze({ ...BASE_POLICY, minimumHoursBetweenNewIssues: 0, sourceRefreshAuthorized: false });
  const result = await settleIssuePulse(pulse(policy, "repair-backlog"), { now: "2026-07-18T20:06:00.000Z", dataDir, contentDir, configPath: CONFIG });
  assert.equal(result.type, "Reject");
  assert.equal(result.object.code, "source-intelligence-refused");
  assert.notEqual(result.object.disposition, "repair-assigned");
  assert.equal(readActionableAssignments(dataDir).length, 0);
});

test("changed product law retires a stale commission without consuming the whole issue pulse", async () => {
  const territory = mkdtempSync(join(tmpdir(), "koios-product-reclassification-"));
  const dataDir = join(territory, "data");
  const contentDir = join(territory, "content");
  mkdirSync(dataDir, { recursive: true });
  mkdirSync(contentDir, { recursive: true });
  const now = "2026-07-20T04:00:00.000Z";
  const created = createAssignment(dataDir, {
    term: "anthropic hidden space claude puzzles concepts",
    beat: "technology",
    priority: 20,
    sourceUrls: ["https://www.technologyreview.com/2026/07/09/example"],
  }, [], now);
  const inheritedCommission = commissionForAssignment({ term: "how to claim a tax refund", beat: "economy" });
  appendDatedRecord({ dataRoot: dataDir, ledger: "assignments", instant: now, record: { kind: "koios.assignment-selection", at: now, assignmentId: created.assignment.assignmentId, commission: inheritedCommission } });
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-20T04:00:30.000Z", act: "newsroom.circuit.completed", subject: "another-recent-issue", data: { slug: "another-recent-issue" } });
  const settlement = await settleIssuePulse(pulse(BASE_POLICY, "product-reclassification"), { now: "2026-07-20T04:01:00.000Z", dataDir, contentDir, configPath: CONFIG });
  assert.equal(settlement.object.code, "cadence-window-open");
  const disposition = readKoiosLedger(dataDir, "assignments").find((entry) => entry.kind === "koios.assignment-disposition-witness" && entry.assignmentId === created.assignment.assignmentId);
  assert.equal(disposition?.disposition, "refused");
  assert.equal(readKoiosLedger(dataDir, "contract-events").some((entry) => entry.act === "assignment.product-reclassified" && entry.data.sourceReuseReleased === true), true);
});
