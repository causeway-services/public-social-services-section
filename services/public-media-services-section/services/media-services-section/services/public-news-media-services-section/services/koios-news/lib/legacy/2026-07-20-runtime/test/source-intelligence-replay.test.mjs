import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { decodeFrontMatterDocument } from "@emsenn/organizing-a-content-farm";

import { settleSourceIntelligenceReplay } from "../dist/management/source-intelligence-replay.mjs";
import { admittedIndependentSourceDomainCount, sourceDiscoveryCandidateSupportsEvent } from "../dist/management/issue-controller.mjs";
import { appendDatedRecord, appendKoiosAct, readKoiosLedger, recordDigest } from "../dist/management/ledger.mjs";
import { readAdmissibleResearchPacket } from "../dist/researching/sourcing/admissible-research-packet-contract.mjs";
import { createAssignment, readAssignment } from "../dist/researching/writing/assignments.mjs";

const NOW = "2026-07-20T03:00:00.000Z";
const PRIMARY = "https://example.test/example-revival";
const SECONDARY = "https://example.net/example-revival-analysis";
const TERTIARY = "https://example.org/example-revival-records";

function packet(sourceUrls) {
  return {
    kind: "producing-content.farm.research-packet",
    term: "Example project revival",
    beat: "technology",
    generatedAt: NOW,
    sourceCount: sourceUrls.length,
    selectedCount: sourceUrls.length,
    intakeSources: sourceUrls.map((url, index) => ({ url, title: index === 0 ? "Example project revival begins" : "Example project revival analysis", summary: "The Example project revival has a tested roadmap and independent compatibility analysis.", score: 10 })),
    claims: sourceUrls.map((url, index) => ({ id: `claim-${index}`, subject: "Example project revival", predicate: "reports", object: "The Example project revival has a tested roadmap.", force: "reports", status: "supported", provenance: { citation: url } })),
    warrant: { supportClaimCount: sourceUrls.length, refutationClaimCount: 0, uncertainClaimCount: 0, sourceDomainCount: sourceUrls.length, sourceDomains: sourceUrls.map((url) => new URL(url).hostname), note: "fixture" },
    editorialRisks: [],
    sourceUrls,
    candidateReferences: sourceUrls.map((url, index) => ({ id: `source-${index}`, type: "article-journal", title: index === 0 ? "Example project revival begins" : "Example project revival analysis", URL: url })),
    context: [],
  };
}

test("source replay buys corroboration, admits the richer packet, and never treats search metadata as prose warrant", async () => {
  const territory = mkdtempSync(join(tmpdir(), "koios-source-replay-"));
  const dataDir = join(territory, "data");
  const contentDir = join(territory, "content");
  mkdirSync(contentDir, { recursive: true });
  const created = createAssignment(dataDir, { term: "Example project revival", beat: "technology", priority: 12, sourceUrls: [PRIMARY] }, [], NOW);
  const initial = packet([PRIMARY]);
  appendDatedRecord({ dataRoot: dataDir, ledger: "source-claims", instant: NOW, record: { kind: "koios.admissible-research-packet-admission", at: NOW, assignmentId: created.assignment.assignmentId, packet: initial, packetDigest: recordDigest(initial) } });
  const slug = "example-project-revival";
  await import("node:fs").then(({ writeFileSync }) => writeFileSync(join(contentDir, `${slug}.md`), `---\ntitle: Example project revival\ndraft: true\nreferences:\n  - id: source-0\n    type: article-journal\n    title: Example project revival begins\n    URL: ${PRIMARY}\nkoios:\n  gates_clear: false\n---\n\nPrivate draft body.\n`, "utf8"));

  let recalled = [];
  const deeper = packet([PRIMARY, SECONDARY]);
  const priorDelivery = { type: "Accept", object: { type: "PriorResearchProjectionResult" } };
  const result = await settleSourceIntelligenceReplay({
    assignmentId: created.assignment.assignmentId,
    slug,
    now: NOW,
    dataDir,
    contentDir,
    dependencies: {
      discover: () => ({ delivery: { object: { deliveryDigest: "sha256:discovery" } }, candidates: [{ title: "Example project revival analysis", url: SECONDARY }], candidateUrls: [SECONDARY] }),
      recall: ({ sourceUrls }) => { recalled = [...sourceUrls]; return { type: "Accept", object: { type: "SourceBundleDelivery", bundles: [] } }; },
      acquirePublicText: () => ({ type: "Accept", object: { type: "PublicWebSourceDelivery" } }),
      projectPriorResearch: ({ assignmentId }) => ({ contract: "fixture", assignmentId, sourceRecovery: "fixture", contextualBundleDigest: "sha256:context", gapBundleDigest: "sha256:gaps", contextualBundle: {}, gapBundle: {}, providerResultDigest: "sha256:prior", providerDelivery: priorDelivery, filesystemReads: 0 }),
      admitPacket: async ({ assignment }) => {
        assert.deepEqual(assignment.sourceUrls, [PRIMARY, SECONDARY]);
        const packetDigest = recordDigest(deeper);
        appendDatedRecord({ dataRoot: dataDir, ledger: "source-claims", instant: NOW, record: { kind: "koios.admissible-research-packet-admission", at: NOW, assignmentId: assignment.assignmentId, packet: deeper, packetDigest } });
        return { packet: deeper, packetDigest, custody: {}, custodyDigest: "sha256:custody", providerExchange: { exchangeId: "fixture" } };
      },
    },
  });

  assert.equal(result.disposition, "ready");
  assert.deepEqual(recalled, [PRIMARY, SECONDARY]);
  const manuscript = decodeFrontMatterDocument(readFileSync(join(contentDir, `${slug}.md`), "utf8"));
  assert.equal(manuscript.frontMatter.draft, true);
  assert.equal(manuscript.frontMatter.koios.gates_clear, false);
  assert.deepEqual(manuscript.frontMatter.references.map((reference) => reference.URL), [PRIMARY, SECONDARY]);
  assert.equal(manuscript.body.trim(), "Private draft body.");
  const settlement = readKoiosLedger(dataDir, "contract-events").find((entry) => entry.act === "source-intelligence.replay-settled");
  assert.equal(settlement.data.rawSearchMetadataUsedAsWarrant, false);
  assert.equal(settlement.data.proseProviderInvoked, false);
});

test("source replay rejects generic related search results before buying retrieval", () => {
  assert.equal(sourceDiscoveryCandidateSupportsEvent({ title: "Mozilla speeds Firefox release schedule to biweekly", url: "https://example.test/exact" }, "Mozilla speeds Firefox release schedule biweekly"), true);
  assert.equal(sourceDiscoveryCandidateSupportsEvent({ title: "Some websites are becoming unusable in Firefox", url: "https://example.test/generic" }, "Mozilla speeds Firefox release schedule biweekly"), false);
  assert.equal(sourceDiscoveryCandidateSupportsEvent({ title: "Microsoft says the world is changing faster", url: "https://example.test/unrelated" }, "Mozilla speeds Firefox release schedule biweekly"), false);
});

test("source replay forms a fresh successor when evidence fails before any manuscript exists", async () => {
  const territory = mkdtempSync(join(tmpdir(), "koios-source-successor-"));
  const dataDir = join(territory, "data");
  const contentDir = join(territory, "content");
  mkdirSync(contentDir, { recursive: true });
  const created = createAssignment(dataDir, { term: "Example project revival", beat: "technology", priority: 12, sourceUrls: [PRIMARY, SECONDARY] }, [], NOW);
  const initial = packet([PRIMARY, SECONDARY]);
  appendDatedRecord({ dataRoot: dataDir, ledger: "source-claims", instant: NOW, record: { kind: "koios.admissible-research-packet-admission", at: NOW, assignmentId: created.assignment.assignmentId, packet: initial, packetDigest: recordDigest(initial) } });
  appendDatedRecord({ dataRoot: dataDir, ledger: "assignments", instant: NOW, record: { kind: "koios.assignment-disposition-witness", at: NOW, assignmentId: created.assignment.assignmentId, disposition: "refused", reason: "source evidence too thin", authority: "koios.news/editorial-operation", contract: "koios.news/newsroom-circuit-refusal/v1" } });
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: NOW, act: "newsroom.circuit.refused", subject: created.assignment.assignmentId, data: { reason: "source evidence too thin" } });
  const deeper = packet([PRIMARY, SECONDARY, TERTIARY]);
  const result = await settleSourceIntelligenceReplay({
    assignmentId: created.assignment.assignmentId,
    now: NOW,
    dataDir,
    contentDir,
    forceDeepen: true,
    dependencies: {
      discover: () => ({ delivery: { object: { deliveryDigest: "sha256:discovery" } }, candidates: [{ title: "Example project revival records", url: TERTIARY }], candidateUrls: [TERTIARY] }),
      recall: () => ({ type: "Accept", object: { type: "SourceBundleDelivery", bundles: [] } }),
      acquirePublicText: () => ({ type: "Accept", object: { type: "PublicWebSourceDelivery" } }),
      projectPriorResearch: ({ assignmentId }) => ({ contract: "fixture", assignmentId, sourceRecovery: "fixture", contextualBundleDigest: "sha256:context", gapBundleDigest: "sha256:gaps", contextualBundle: {}, gapBundle: {}, providerResultDigest: "sha256:prior", providerDelivery: { type: "Accept" }, filesystemReads: 0 }),
      admitPacket: async () => ({ packet: deeper, packetDigest: recordDigest(deeper), custody: {}, custodyDigest: "sha256:custody", providerExchange: { exchangeId: "fixture" } }),
    },
  });
  assert.equal(result.disposition, "ready");
  assert.ok(result.successorAssignmentId);
  assert.equal(readAssignment(dataDir, result.successorAssignmentId).term, created.assignment.term);
  assert.deepEqual(readAdmissibleResearchPacket(dataDir, result.successorAssignmentId).sourceUrls, [PRIMARY, SECONDARY, TERTIARY]);
  assert.equal(readKoiosLedger(dataDir, "contract-events").some((entry) => entry.act === "source-intelligence.successor-formed" && entry.subject === result.successorAssignmentId), true);
});

test("source depth counts admitted reporting, not merely requested URLs", () => {
  const reading = packet([PRIMARY]);
  reading.sourceUrls = [PRIMARY, SECONDARY];
  assert.equal(admittedIndependentSourceDomainCount(reading), 1);
});
