import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { startRwilProviderProcess } from "@lenticule-science/rwil-rdf-projection-service/test-provider";

import {
  applyExactBodyRepairTools,
  composeCompletenessRepairPrompt,
  editorRequestsCarrierRepair,
  latestManuscriptRepairDirective,
  requireManuscriptMutation,
  shouldRetryIncompleteDraft,
} from "../dist/draft-repair.mjs";
import { appendKoiosAct, recordDigest } from "../dist/management/ledger.mjs";

let priorRwilAgent;
let rwil;
test.before(async () => {
  priorRwilAgent = process.env.RWIL_RDF_AGENT;
  rwil = await startRwilProviderProcess();
  process.env.RWIL_RDF_AGENT = rwil.agentCardUrl;
});
test.after(async () => {
  if (priorRwilAgent === undefined) delete process.env.RWIL_RDF_AGENT;
  else process.env.RWIL_RDF_AGENT = priorRwilAgent;
  await rwil.close();
});

test("editor-selected exact repair tools change only the named unique body span", () => {
  const body = "Spain will face Argentina. Geometry may shape the final.";
  assert.equal(applyExactBodyRepairTools(body, [{ tool: "replace_exact_body_text", before: "will face", after: "face" }]), "Spain face Argentina. Geometry may shape the final.");
  assert.equal(applyExactBodyRepairTools(body, [{ tool: "repair_editorial_surfaces" }]), body);
  assert.throws(() => applyExactBodyRepairTools("will face and will face", [{ tool: "replace_exact_body_text", before: "will face", after: "face" }]), /one exact unique body span/u);
});

test("a bounded repair cannot settle by claiming unchanged manuscript bytes", () => {
  assert.doesNotThrow(() => requireManuscriptMutation("before", "after"));
  assert.throws(() => requireManuscriptMutation("same", "same"), /changed no manuscript bytes/u);
});

test("a short otherwise-valid market candidate receives one bounded completion pass", () => {
  const problem = "draft repair returned 412 words; the commission completeness floor is 450";
  assert.equal(shouldRetryIncompleteDraft({ problems: [problem], words: 412, minimumWords: 450 }), true);
  assert.equal(shouldRetryIncompleteDraft({ problems: [problem, "citation missing"], words: 412, minimumWords: 450 }), false);
  assert.equal(shouldRetryIncompleteDraft({ problems: [], words: 518, minimumWords: 450 }), false);

  const prompt = composeCompletenessRepairPrompt({
    editorReport: "Preserve the thesis and repair its unsupported conclusion.",
    researchPacket: { sources: [{ url: "https://example.test/source" }] },
    candidateBody: "A short candidate with a [source](https://example.test/source).",
    candidateWords: 412,
    minimumWords: 450,
    maximumWords: 850,
  });
  assert.match(prompt, /450 to 850 words/u);
  assert.match(prompt, /412 words/u);
  assert.match(prompt, /https:\/\/example\.test\/source/u);
  assert.match(prompt, /Return prose only/u);
});

test("carrier-only defects never authorize whole-manuscript inference", () => {
  assert.equal(editorRequestsCarrierRepair("The description and summary metadata fields need repair; body is returned byte-for-byte."), true);
  assert.equal(editorRequestsCarrierRepair("The lede invents a score and must be rewritten."), false);
  assert.equal(editorRequestsCarrierRepair(
    "The summary contains pipeline markers, and the article needs a writer replay.",
    [
      "Strip pipeline markers from the frontmatter summary.",
      "Rewrite the lede around the current exhibition and restore source attribution.",
    ],
    "writer-model",
  ), false);
});

test("a source-originality directive survives citation enrichment while its offending sentence remains", async () => {
  const dataDir = mkdtempSync(join(tmpdir(), "koios-source-directive-citations-"));
  const assignmentId = "technology-citation-enrichment";
  const slug = "citation-enrichment";
  const sentence = "The release schedule will move from four weeks to two weeks in September.";
  const original = `---\ntitle: Citation enrichment\ndraft: true\nreferences:\n  - URL: https://lead.example/story\n---\n\n${sentence}\n`;
  await appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-20T03:00:00.000Z", act: "newsroom.circuit.source-originality-refused", subject: assignmentId, data: { slug, manuscriptDigest: recordDigest(original), findings: [{ draftSentence: sentence, sourceSentence: "Schedule moves from four weeks to two.", sourceUrl: "https://lead.example/story" }] } });
  const enriched = original.replace("  - URL: https://lead.example/story", "  - URL: https://lead.example/story\n  - URL: https://independent.example/report");
  const directive = latestManuscriptRepairDirective({ dataDir, assignmentId, slug, manuscript: enriched });
  assert.equal(directive.authority, "deterministic-source-originality-gate");
  assert.match(directive.report, /source-shaped sentence/u);
});

test("a source-originality directive admits the gate's exact NI manuscript identity even when normalized prose omits Markdown links", async () => {
  const dataDir = mkdtempSync(join(tmpdir(), "koios-source-directive-ni-"));
  const assignmentId = "culture-ni-bound-source-refusal";
  const slug = "ni-bound-source-refusal";
  const manuscript = `---\ntitle: NI-bound refusal\ndraft: true\n---\n\nAs detailed in [the source](https://example.test/story), the memorial became a living project.\n`;
  await appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-20T03:10:00.000Z", act: "newsroom.circuit.source-originality-refused", subject: assignmentId, data: { slug, manuscriptDigest: recordDigest(manuscript), findings: [{ draftSentence: "As detailed in the source, the memorial became a living project.", sourceSentence: "The memorial became a living project.", sourceUrl: "https://example.test/story" }] } });
  const directive = latestManuscriptRepairDirective({ dataDir, assignmentId, slug, manuscript });
  assert.equal(directive.authority, "deterministic-source-originality-gate");
});
