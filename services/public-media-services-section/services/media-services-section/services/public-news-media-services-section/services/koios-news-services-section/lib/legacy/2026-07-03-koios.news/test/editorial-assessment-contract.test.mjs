import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { startRwilProviderProcess } from "@lenticule-science/rwil-rdf-projection-service/test-provider";
import { querySettlementRecords } from "@lenticule-science/rwil-rdf-projection-service/client";

import { EDITORIAL_ASSESSMENT_CONTRACT, EditorialAssessmentRefusal, procureEditorialAssessment, projectEditorialBoundaryValue } from "../dist/researching/writing/editing/editorial-assessment-contract.mjs";
import { appendDatedRecord, recordDigest } from "../dist/management/ledger.mjs";
import { reviewPublicationAdmission } from "../dist/researching/writing/editing/standards.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function firstPackage(...candidates) {
  const found = candidates.find((candidate) => existsSync(join(candidate, "package.json")));
  if (found === undefined) throw new Error(`test fixture is unavailable: ${candidates.join(", ")}`);
  return found;
}
const SOURCE_PROVIDER = firstPackage(resolve(ROOT, "services/independent-editorial-assessment"), resolve(ROOT, "../../services/independent-editorial-assessment"));
const NOW = "2099-07-18T14:00:00.000Z";
const byteDigest = (value) => `sha256:${createHash("sha256").update(value).digest("hex")}`;

let rwil;
let priorRwilAgent;
test.before(async () => { priorRwilAgent = process.env.RWIL_RDF_AGENT; rwil = await startRwilProviderProcess(); process.env.RWIL_RDF_AGENT = rwil.agentCardUrl; });
test.after(async () => { if (priorRwilAgent === undefined) delete process.env.RWIL_RDF_AGENT; else process.env.RWIL_RDF_AGENT = priorRwilAgent; await rwil.close(); });

test("Koios uses the exact NI editorial law and refuses an uncontracted inference route", async () => {
  const territory = mkdtempSync(join(tmpdir(), "koios-editorial-customer-"));
  const providerRoot = join(territory, "independent-editorial-assessment");
  cpSync(SOURCE_PROVIDER, providerRoot, { recursive: true, filter: (path) => !path.startsWith(join(SOURCE_PROVIDER, "data")) });
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
    await assert.rejects(() => procureEditorialAssessment({
      slug: "treaty-test",
      manuscript,
      manuscriptDigest: byteDigest(manuscript),
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
    }), (error) => error instanceof EditorialAssessmentRefusal && error.code === "inference-route-unavailable");
    const refusal = await querySettlementRecords("independent-editorial-assessment.provider.refusal");
    assert.equal(refusal.length, 1);
    assert.equal(refusal[0].law, EDITORIAL_ASSESSMENT_CONTRACT);
  } finally {
    if (priorData === undefined) delete process.env.INDEPENDENT_EDITORIAL_ASSESSMENT_DATA_ROOT; else process.env.INDEPENDENT_EDITORIAL_ASSESSMENT_DATA_ROOT = priorData;
    rmSync(territory, { recursive: true, force: true });
  }
});

test("free-form acceptance prose cannot open the publication gate, but a validated customer tool act can", async () => {
  const territory = mkdtempSync(join(tmpdir(), "koios-editorial-gate-"));
  const contentDir = join(territory, "content", "posts");
  const dataDir = join(territory, "data");
  mkdirSync(contentDir, { recursive: true });
  const sourcePost = join(ROOT, "content", "posts", "bybit-hack-weakens-consumer-sentiment.md");
  const manuscript = readFileSync(sourcePost, "utf8");
  const slug = "bybit-hack-weakens-consumer-sentiment";
  writeFileSync(join(contentDir, `${slug}.md`), manuscript, "utf8");
  const manuscriptDigest = byteDigest(manuscript);
  await appendDatedRecord({ dataRoot: dataDir, ledger: "editorial-judgments", instant: NOW, record: { kind: "koios.editorial-judgment", slug, manuscriptDigest, disposition: "accept", publishable: true, serviceAccepted: true, provider: "uncontracted-inference", model: "unspecified", contract: "uncontracted-inference", report: "DISPOSITION: ACCEPT" } });
  assert.equal(reviewPublicationAdmission(contentDir, slug).editorialAcceptance, false);

  await appendDatedRecord({ dataRoot: dataDir, ledger: "editorial-judgments", instant: "2099-07-18T14:00:01.000Z", record: { kind: "koios.editorial-judgment", slug, manuscriptDigest, disposition: "accept", publishable: true, serviceAccepted: true, provider: "independent-editorial-assessment", model: "claude-sonnet-4-6", contract: EDITORIAL_ASSESSMENT_CONTRACT, report: "Prose grounds remain prose.", selectedTool: "submit_editorial_acceptance", toolSelectionValidated: true, toolSelectionDigest: recordDigest({ tool: "submit_editorial_acceptance" }) } });
  assert.equal(reviewPublicationAdmission(contentDir, slug).editorialAcceptance, true);
  rmSync(territory, { recursive: true, force: true });
});
