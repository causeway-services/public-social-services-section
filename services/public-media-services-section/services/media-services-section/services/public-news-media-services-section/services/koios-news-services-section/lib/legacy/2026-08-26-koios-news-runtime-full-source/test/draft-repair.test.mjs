import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  applyExactBodyRepairTools,
  composeCompletenessRepairPrompt,
  draftRepairInferenceRoute,
  editorRequestsCarrierRepair,
  latestManuscriptRepairDirective,
  shouldRetryIncompleteDraft,
} from "../dist/draft-repair.mjs";
import { appendKoiosAct, recordDigest } from "../dist/management/ledger.mjs";

test("editor-selected exact repair tools change only the named unique body span", () => {
  const body = "Spain will face Argentina. Geometry may shape the final.";
  assert.equal(applyExactBodyRepairTools(body, [{ tool: "replace_exact_body_text", before: "will face", after: "face" }]), "Spain face Argentina. Geometry may shape the final.");
  assert.equal(applyExactBodyRepairTools(body, [{ tool: "repair_editorial_surfaces" }]), body);
  assert.throws(() => applyExactBodyRepairTools("will face and will face", [{ tool: "replace_exact_body_text", before: "will face", after: "face" }]), /one exact unique body span/u);
});

test("a short otherwise-valid Sonnet revision receives one bounded completion pass", () => {
  const problem = "draft repair returned 562 words; the deterministic completeness floor is 600";
  assert.equal(shouldRetryIncompleteDraft({ provider: "liss", problems: [problem], words: 562 }), true);
  assert.equal(shouldRetryIncompleteDraft({ provider: "property", problems: [problem], words: 562 }), false);
  assert.equal(shouldRetryIncompleteDraft({ provider: "liss", problems: [problem, "citation missing"], words: 562 }), false);
  assert.equal(shouldRetryIncompleteDraft({ provider: "liss", problems: [], words: 650 }), false);

  const prompt = composeCompletenessRepairPrompt({
    editorReport: "Preserve the thesis and repair its unsupported conclusion.",
    researchPacket: { sources: [{ url: "https://example.test/source" }] },
    candidateBody: "A short candidate with a [source](https://example.test/source).",
    candidateWords: 562,
  });
  assert.match(prompt, /650 to 1,000 words/u);
  assert.match(prompt, /562 words/u);
  assert.match(prompt, /https:\/\/example\.test\/source/u);
  assert.match(prompt, /Return prose only/u);
});

test("carrier-only defects never authorize whole-manuscript inference", () => {
  assert.equal(editorRequestsCarrierRepair("The description and summary metadata fields need repair; body is returned byte-for-byte."), true);
  assert.equal(editorRequestsCarrierRepair("The lede invents a score and must be rewritten."), false);
});

test("a writer-model failure selects Sonnet directly instead of retrying a failed cheap route", () => {
  assert.deepEqual(draftRepairInferenceRoute("leader").tiers, ["leader-claude"]);
  assert.equal(draftRepairInferenceRoute("leader").models["leader-claude"], "claude-sonnet-4-6");
  assert.deepEqual(draftRepairInferenceRoute().tiers, ["free-gemini", "free-nim", "leader-claude"]);
});

test("a source-originality directive survives citation enrichment while its offending sentence remains", () => {
  const dataDir = mkdtempSync(join(tmpdir(), "koios-source-directive-citations-"));
  const assignmentId = "technology-citation-enrichment";
  const slug = "citation-enrichment";
  const sentence = "The release schedule will move from four weeks to two weeks in September.";
  const original = `---\ntitle: Citation enrichment\ndraft: true\nreferences:\n  - URL: https://lead.example/story\n---\n\n${sentence}\n`;
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-20T03:00:00.000Z", act: "newsroom.circuit.source-originality-refused", subject: assignmentId, data: { slug, manuscriptDigest: recordDigest(original), findings: [{ draftSentence: sentence, sourceSentence: "Schedule moves from four weeks to two.", sourceUrl: "https://lead.example/story" }] } });
  const enriched = original.replace("  - URL: https://lead.example/story", "  - URL: https://lead.example/story\n  - URL: https://independent.example/report");
  const directive = latestManuscriptRepairDirective({ dataDir, assignmentId, slug, manuscript: enriched });
  assert.equal(directive.authority, "deterministic-source-originality-gate");
  assert.match(directive.report, /source-shaped sentence/u);
});
