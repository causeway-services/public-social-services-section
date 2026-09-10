import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { auditProduction } from "../src/production-audit.mjs";

const digest = (value) => createHash("sha256").update(value).digest("hex");

async function fixture() {
  const directory = await mkdtemp(join(tmpdir(), "koios-production-audit-"));
  const bodies = new Map([
    ["/", Buffer.from("home")],
    ["/feed.xml", Buffer.from("feed")],
    ["/sitemap.xml", Buffer.from("sitemap")],
    ["/operations.json", Buffer.from("operations")],
    ["/newswire-audit.json", Buffer.from("audit")],
    ["/about.json", Buffer.from("about")],
    ["/actors/koios-news", Buffer.from("actor")],
    ["/.well-known/webfinger", Buffer.from("webfinger")],
  ]);
  const artifacts = [
    { file: "index.html", bytes: 4, sha256: digest("home") },
    { file: "about.json", bytes: 5, sha256: digest("about") },
    { file: "operations.json", bytes: 10, sha256: digest("operations") },
  ];
  const manifestBytes = Buffer.from(JSON.stringify({
    kind: "koios.news.static-publication-manifest/v1",
    artifacts,
  }));
  bodies.set("/manifest.json", manifestBytes);

  const releaseReceiptPath = join(directory, "release.json");
  await writeFile(releaseReceiptPath, JSON.stringify({
    kind: "koios.news.cloudflare-release-receipt/v1",
    candidateManifestSha256: digest(manifestBytes),
    binding: { hostname: "koios.news", workerName: "koios-news-primary" },
    probe: { accepted: true, manifestSha256: digest(manifestBytes) },
    deployment: { readback: {
      deploymentId: "88fd07b2-9773-4ea9-8c29-a22844918a14",
      versionId: "e3332b95-de44-4a9b-b139-1f3e014849ed",
    } },
    rollback: { priorVersionId: "a59429d7-28f3-4f2c-9f5f-c42dfa0cd0ec" },
  }));
  const backupReceiptPath = join(directory, "backup.json");
  const restoreReceiptPath = join(directory, "restore.json");
  const scheduleTransitionReceiptPath = join(directory, "schedule.json");
  const schedulerTickPath = join(directory, "tick.json");
  const backupReceiptBytes = JSON.stringify({
    kind: "koios.news.off-provider-backup-receipt/v1",
    accepted: true,
    productionManifestSha256: digest(manifestBytes),
    artifactCount: artifacts.length,
    backupObjectSha256: digest("backup-object"),
  });
  await writeFile(backupReceiptPath, backupReceiptBytes);
  await writeFile(restoreReceiptPath, JSON.stringify({
    kind: "koios.news.fresh-restore-receipt/v1",
    accepted: true,
    productionManifestSha256: digest(manifestBytes),
    restoredManifestSha256: digest(manifestBytes),
    backupReceiptSha256: digest(backupReceiptBytes),
    backupObjectSha256: digest("backup-object"),
    restoredObjectSha256: digest("backup-object"),
    artifactCount: artifacts.length,
  }));
  const ni = `ni:///sha-256;${"A".repeat(43)}`;
  await writeFile(scheduleTransitionReceiptPath, JSON.stringify({ object: {
    status: "settled",
    successorRegistration: {
      id: ni,
      status: "active",
      targetBinding: { packageDigest: ni, selectedBinDigest: ni, runtimeClosureDigest: ni },
    },
    predecessorRetirement: { id: ni, status: "retired" },
  } }));
  await writeFile(schedulerTickPath, JSON.stringify({ attempted: 0, receipts: [] }));

  const fetchImpl = async (url) => {
    const parsed = new URL(url);
    const key = parsed.pathname;
    const body = bodies.get(key);
    return body ? new Response(body, { status: 200 }) : new Response("missing", { status: 404 });
  };
  return { directory, releaseReceiptPath, backupReceiptPath, restoreReceiptPath, scheduleTransitionReceiptPath, schedulerTickPath, fetchImpl };
}

test("accepts a live release bound to sealed assets and proven recovery", async (t) => {
  const state = await fixture();
  t.after(() => rm(state.directory, { recursive: true, force: true }));
  const result = await auditProduction(state);
  assert.equal(result.status, "healthy");
  assert.equal(result.productionHealthy, true);
  assert.equal(result.recoveryReady, true);
  assert.equal(result.alertRequired, false);
  assert.deepEqual(result.problems, []);
});

test("alerts on a scheduler receipt that calls a written candidate a transport failure", async (t) => {
  const state = await fixture();
  t.after(() => rm(state.directory, { recursive: true, force: true }));
  await writeFile(state.schedulerTickPath, JSON.stringify({
    attempted: 1,
    receipts: [{
      id: "ni:///sha-256;receipt",
      disposition: "transport-failure",
      targetResponseProblem: "target-mutation-claim",
      process: { status: 0 },
      targetResponse: { object: { code: "offline-candidate-written", disposition: "written" } },
    }],
  }));
  const result = await auditProduction(state);
  assert.equal(result.status, "failed");
  assert.equal(result.alertRequired, true);
  assert.equal(result.scheduler.failures[0].targetCode, "offline-candidate-written");
  assert.equal(result.problems.at(-1).name, "scheduler-last-tick");
});

test("treats provider rollback without backup and restore receipts as degraded", async (t) => {
  const state = await fixture();
  t.after(() => rm(state.directory, { recursive: true, force: true }));
  const result = await auditProduction({
    releaseReceiptPath: state.releaseReceiptPath,
    scheduleTransitionReceiptPath: state.scheduleTransitionReceiptPath,
    schedulerTickPath: state.schedulerTickPath,
    fetchImpl: state.fetchImpl,
  });
  assert.equal(result.status, "degraded");
  assert.equal(result.productionHealthy, true);
  assert.equal(result.recoveryReady, false);
  assert.equal(result.alertRequired, true);
  assert.deepEqual(result.warnings.map(({ name }) => name).slice(-2), [
    "off-provider-backup-unproven",
    "fresh-restore-unproven",
  ]);
});
