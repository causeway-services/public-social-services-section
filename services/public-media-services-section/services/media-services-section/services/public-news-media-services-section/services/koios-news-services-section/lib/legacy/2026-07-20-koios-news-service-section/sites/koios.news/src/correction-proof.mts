// Disposable integration fixture for the complete correction branch.
// Production editorial authority is copied only as a byte/digest witness into
// an isolated temporary settlement; fixture acceptances are explicitly named
// as such and can never enter the production publication gate.

import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { buildStaticShadow } from "./administrating/deploying/static-shadow.mjs";
import { closeCorrection, openCorrection } from "./management/corrections.mjs";
import { appendDatedRecord, appendKoiosAct, datedLedgerPath, latestKoiosAct, recordDigest } from "./management/ledger.mjs";
import { publishManuscript, reviewPublicationAdmission } from "./researching/writing/editing/standards.mjs";

const SLUG = "indigenous-leaders-confront-the-collision-of-climate-and-extraction";
const OPENED_AT = "2026-07-18T12:00:00.000Z";
const ACCEPTED_AT = "2026-07-18T12:01:00.000Z";
const CLOSED_AT = "2026-07-18T12:02:00.000Z";

function fixtureAcceptance(slug: string, manuscriptDigest: string, recordedAt: string) {
  return Object.freeze({
    kind: "koios.fixture-editorial-acceptance",
    fixture: true,
    slug,
    manuscriptDigest,
    disposition: "accept",
    publishable: true,
    serviceAccepted: true,
    provider: "correction-propagation-fixture",
    model: "none",
    contract: "independent-editorial-assessment/editorial-assessment/v1",
    report: "Synthetic exact-digest acceptance confined to the correction integration fixture.",
    selectedTool: "submit_editorial_acceptance",
    toolSelectionValidated: true,
    toolSelectionDigest: recordDigest({ fixture: true, slug, manuscriptDigest, tool: "submit_editorial_acceptance" }),
    recordedAt,
  });
}

function routeDigests(manifest: Awaited<ReturnType<typeof buildStaticShadow>>["manifest"]): Readonly<Record<string, string>> {
  return Object.freeze(Object.fromEntries(manifest.artifacts.map((artifact) => [artifact.route, artifact.digest])));
}

const fixtureRoot = mkdtempSync(join(tmpdir(), "koios-correction-proof-"));
try {
  const contentDir = join(fixtureRoot, "content", "posts");
  const dataDir = join(fixtureRoot, "data");
  const beforeDir = join(fixtureRoot, "shadow-before");
  const afterDir = join(fixtureRoot, "shadow-after");
  mkdirSync(contentDir, { recursive: true });
  const source = resolve("content/posts", `${SLUG}.md`);
  cpSync(source, join(contentDir, `${SLUG}.md`));

  const sourceAdmission = reviewPublicationAdmission(resolve("content/posts"), SLUG);
  if (!sourceAdmission.publishable) throw new Error(`proof source is no longer exact-admitted: ${SLUG}`);
  appendDatedRecord({ dataRoot: dataDir, ledger: "editorial-judgments", instant: "2026-07-18T11:59:00.000Z", record: fixtureAcceptance(SLUG, sourceAdmission.manuscriptDigest, "2026-07-18T11:59:00.000Z") });
  const before = await buildStaticShadow({ outputDir: beforeDir, site: { contentDir, dataDir } });
  const beforeDigests = routeDigests(before.manifest);

  const opened = openCorrection({
    slug: SLUG,
    kind: "clarification",
    correctedAt: OPENED_AT,
    summary: "Integration fixture: clarified the article record and propagated its modification time.",
    details: "This statement exists only inside the disposable correction proof settlement.",
    contentDir,
    dataDir,
    expectedManuscriptDigest: sourceAdmission.manuscriptDigest,
    trigger: {
      act: "claim.narrowed",
      evidenceDigest: recordDigest({ fixture: true, source: "integration-proof", claim: "article record modification time requires clarification" }),
      reason: "Disposable fixture narrows one article-record claim to prove causal correction propagation.",
      sourceSubjects: ["fixture:integration-proof-source"],
      claimIds: ["fixture:article-record-modification-time"],
    },
    priorManifestDigest: before.manifestDigest,
    priorRouteDigests: beforeDigests,
  });
  appendDatedRecord({ dataRoot: dataDir, ledger: "editorial-judgments", instant: ACCEPTED_AT, record: fixtureAcceptance(SLUG, opened.correctedDraftDigest, ACCEPTED_AT) });
  publishManuscript(contentDir, SLUG);
  const closed = await closeCorrection({ slug: SLUG, correctionId: opened.correctionId, closedAt: CLOSED_AT, outputDir: afterDir, contentDir, dataDir });

  const requiredChanges = [
    `/posts/${SLUG}`,
    "/corrections",
    "/corrections.json",
    "/feed.xml",
    "/feed.atom",
    "/feed.json",
    "/ninjs.json",
    `/fingerprints/${SLUG}.json`,
    `/fingerprints/${SLUG}.svg`,
    `/fingerprints/${SLUG}.png`,
  ];
  const unchanged = requiredChanges.filter((route) => beforeDigests[route] === closed.routeDigests[route]);
  if (unchanged.length > 0) throw new Error(`correction did not change dependent carriers: ${unchanged.join(", ")}`);
  const proof = Object.freeze({
    kind: "koios.correction-propagation-proof",
    fixture: true,
    slug: SLUG,
    correctionId: opened.correctionId,
    triggerActDigest: opened.triggerActDigest,
    beforeManifestDigest: before.manifestDigest,
    afterManifestDigest: closed.manifestDigest,
    editorialAcceptanceDigest: closed.editorialAcceptanceDigest,
    changedRoutes: Object.freeze(requiredChanges),
    witnessedWithoutRequiredByteChange: Object.freeze(["/sitemap.xml", "/news-sitemap.xml"]),
    carrierNote: "Sitemap modification dates are day-granular, so a same-day correction is witnessed without requiring dishonest byte churn.",
    correctionLedger: readFileSync(datedLedgerPath(dataDir, "corrections-omissions", CLOSED_AT), "utf8").trim().split("\n").length,
    sourceClaimLedger: readFileSync(datedLedgerPath(dataDir, "source-claims", OPENED_AT), "utf8").trim().split("\n").length,
  });
  const priorProof = latestKoiosAct(resolve("data"), "contract-events", "correction.fixture.proved");
  const priorData = priorProof?.["data"] as Record<string, unknown> | undefined;
  if (priorProof?.["subject"] !== opened.correctionId
    || priorData?.["beforeManifestDigest"] !== proof.beforeManifestDigest
    || priorData?.["afterManifestDigest"] !== proof.afterManifestDigest) {
    appendKoiosAct({ dataRoot: resolve("data"), ledger: "contract-events", instant: CLOSED_AT, act: "correction.fixture.proved", subject: opened.correctionId, data: proof });
  }
  process.stdout.write(`${JSON.stringify(proof, null, 2)}\n`);
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true });
}
