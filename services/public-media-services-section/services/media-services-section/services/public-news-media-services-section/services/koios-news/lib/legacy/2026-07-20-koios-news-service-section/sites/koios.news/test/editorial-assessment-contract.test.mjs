import assert from "node:assert/strict";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { EditorialAssessmentRefusal, procureEditorialAssessment, projectEditorialBoundaryValue } from "../dist/researching/writing/editing/editorial-assessment-contract.mjs";
import { appendDatedRecord, recordDigest } from "../dist/management/ledger.mjs";
import { reviewPublicationAdmission } from "../dist/researching/writing/editing/standards.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_PROVIDER = resolve(ROOT, "../../services/independent-editorial-assessment");
const SOURCE_LISS = resolve(ROOT, "../../../../../red-cup-engineering/services/logical-inference-service-section");
const NOW = "2099-07-18T14:00:00.000Z";

test("Koios can rehearse its exact schema-bound editorial treaty without creating a judgment", () => {
  const territory = mkdtempSync(join(tmpdir(), "koios-editorial-customer-"));
  const providerRoot = join(territory, "independent-editorial-assessment");
  const lissRoot = join(territory, "logical-inference-service-section");
  cpSync(SOURCE_PROVIDER, providerRoot, { recursive: true, filter: (path) => !path.startsWith(join(SOURCE_PROVIDER, "data")) });
  cpSync(SOURCE_LISS, lissRoot, { recursive: true, filter: (path) => !path.startsWith(join(SOURCE_LISS, "data")) && !path.includes("content/exchanges") });
  const priorData = process.env.INDEPENDENT_EDITORIAL_ASSESSMENT_DATA_ROOT;
  try {
    process.env.INDEPENDENT_EDITORIAL_ASSESSMENT_DATA_ROOT = join(territory, "provider-data");
    const manuscript = "---\ntitle: Treaty test\ndraft: true\n---\n\nExact manuscript bytes.";
    const standards = { path: "/customer/posts/treaty-test.md", publishable: true, findings: [] };
    const run = { provider: "newswire-editorial-production", outputPath: "/customer/private/run.json" };
    const evidence = [{ sourceUrl: "https://example.test/source", sourcePath: "/customer/private/source.html", claim: "A witnessed claim." }];
    const pipeline = [{ path: "/customer/private/instructions.md", digest: "sha256:instructions", content: "Exact carried instructions." }];
    const context = projectEditorialBoundaryValue({ standards, run, evidence, pipeline });
    assert.equal(JSON.stringify(context).includes("/customer/"), false);
    assert.throws(() => procureEditorialAssessment({
      slug: "treaty-test",
      manuscript,
      manuscriptDigest: recordDigest(manuscript),
      standards,
      run,
      evidence,
      pipeline,
      editorialContextDigest: recordDigest(context),
      now: NOW,
      dataDir: join(territory, "koios-data"),
      model: "claude-sonnet-4-6",
      executionMode: "dry-run",
      providerRoot,
      lissRoot,
    }), (error) => error instanceof EditorialAssessmentRefusal && error.code === "dry-run-has-no-tool-selection");
    const events = readFileSync(join(territory, "provider-data", "events", "2099", "07", "18", "2099-07-18-independent-editorial-assessment-events.jsonl"), "utf8");
    assert.match(events, /provider\.offer/u);
    assert.match(events, /provider\.exchange/u);
  } finally {
    if (priorData === undefined) delete process.env.INDEPENDENT_EDITORIAL_ASSESSMENT_DATA_ROOT; else process.env.INDEPENDENT_EDITORIAL_ASSESSMENT_DATA_ROOT = priorData;
    rmSync(territory, { recursive: true, force: true });
  }
});

test("free-form acceptance prose cannot open the publication gate, but a validated customer tool act can", () => {
  const territory = mkdtempSync(join(tmpdir(), "koios-editorial-gate-"));
  const contentDir = join(territory, "content", "posts");
  const dataDir = join(territory, "data");
  mkdirSync(contentDir, { recursive: true });
  const sourcePost = join(ROOT, "content", "posts", "bybit-hack-weakens-consumer-sentiment.md");
  const manuscript = readFileSync(sourcePost, "utf8");
  const slug = "bybit-hack-weakens-consumer-sentiment";
  writeFileSync(join(contentDir, `${slug}.md`), manuscript, "utf8");
  const manuscriptDigest = recordDigest(manuscript);
  appendDatedRecord({ dataRoot: dataDir, ledger: "editorial-judgments", instant: NOW, record: { kind: "koios.editorial-judgment", slug, manuscriptDigest, disposition: "accept", publishable: true, serviceAccepted: true, provider: "legacy-liss", model: "claude-sonnet", contract: "liss-inference-service", report: "DISPOSITION: ACCEPT" } });
  assert.equal(reviewPublicationAdmission(contentDir, slug).editorialAcceptance, false);

  appendDatedRecord({ dataRoot: dataDir, ledger: "editorial-judgments", instant: "2099-07-18T14:00:01.000Z", record: { kind: "koios.editorial-judgment", slug, manuscriptDigest, disposition: "accept", publishable: true, serviceAccepted: true, provider: "independent-editorial-assessment", model: "claude-sonnet-4-6", contract: "independent-editorial-assessment/editorial-assessment/v1", report: "Prose grounds remain prose.", selectedTool: "submit_editorial_acceptance", toolSelectionValidated: true, toolSelectionDigest: recordDigest({ tool: "submit_editorial_acceptance" }) } });
  assert.equal(reviewPublicationAdmission(contentDir, slug).editorialAcceptance, true);
  rmSync(territory, { recursive: true, force: true });
});
