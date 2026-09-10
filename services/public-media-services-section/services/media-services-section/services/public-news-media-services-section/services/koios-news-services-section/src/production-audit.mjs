import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const ORIGIN = "https://koios.news";
const ACTIVITYPUB_ORIGIN = "https://bare-cedar-fog.561.group";
const ACTOR = `${ACTIVITYPUB_ORIGIN}/actors/koios-news`;
const ACCOUNT = "acct:koios-news@bare-cedar-fog.561.group";

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function readJson(path) {
  return path ? JSON.parse(await readFile(path, "utf8")) : null;
}

async function fetchBytes(fetchImpl, url, options = {}) {
  const response = await fetchImpl(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(15_000),
    ...options,
  });
  const bytes = Buffer.from(await response.arrayBuffer());
  return { response, bytes };
}

function publicUrl(path) {
  if (path === "index.html") return `${ORIGIN}/`;
  if (path === "404.html") return `${ORIGIN}/404`;
  return `${ORIGIN}/${path}`;
}

function representativeArtifacts(artifacts) {
  const observable = artifacts.filter(({ file }) => !["_headers", "robots.txt"].includes(file));
  if (observable.length <= 3) return observable;
  return [observable[0], observable[Math.floor(observable.length / 2)], observable.at(-1)];
}

function isSha256(value) {
  return /^[a-f0-9]{64}$/.test(value ?? "");
}

function isNiSha256(value) {
  return /^ni:\/\/\/sha-256;[A-Za-z0-9_-]{43}$/.test(value ?? "");
}

export async function auditProduction({
  releaseReceiptPath,
  scheduleTransitionReceiptPath,
  schedulerTickPath,
  backupReceiptPath,
  restoreReceiptPath,
  fetchImpl = fetch,
} = {}) {
  const problems = [];
  const warnings = [];
  const checks = [];
  const check = (name, accepted, detail = null) => {
    checks.push({ name, accepted, detail });
    if (!accepted) problems.push({ name, detail });
  };

  const releaseReceipt = await readJson(releaseReceiptPath);
  const scheduleTransition = await readJson(scheduleTransitionReceiptPath);
  const schedulerTick = await readJson(schedulerTickPath);
  const backupReceipt = await readJson(backupReceiptPath);
  const restoreReceipt = await readJson(restoreReceiptPath);

  const manifestTransfer = await fetchBytes(fetchImpl, `${ORIGIN}/manifest.json`);
  check("live-manifest-http", manifestTransfer.response.status === 200, manifestTransfer.response.status);
  const liveManifestSha256 = sha256(manifestTransfer.bytes);
  let manifest = null;
  try {
    manifest = JSON.parse(manifestTransfer.bytes.toString("utf8"));
  } catch (error) {
    check("live-manifest-json", false, error.message);
  }

  const artifacts = Array.isArray(manifest?.artifacts) ? manifest.artifacts : [];
  check("live-manifest-kind", manifest?.kind === "koios.news.static-publication-manifest/v1", manifest?.kind);
  check("live-manifest-artifacts", artifacts.length > 0, artifacts.length);
  check(
    "live-manifest-seals",
    artifacts.every(({ bytes, file, sha256: seal }) =>
      Number.isSafeInteger(bytes) && bytes >= 0 && typeof file === "string" &&
      isSha256(seal)),
    `${artifacts.length} artifacts`,
  );

  if (releaseReceipt) {
    check("release-receipt-kind", releaseReceipt.kind === "koios.news.cloudflare-release-receipt/v1", releaseReceipt.kind);
    check(
      "release-manifest-binding",
      releaseReceipt.candidateManifestSha256 === liveManifestSha256,
      { live: liveManifestSha256, receipt: releaseReceipt.candidateManifestSha256 },
    );
    check(
      "release-probe-binding",
      releaseReceipt.probe?.accepted === true &&
        releaseReceipt.probe?.manifestSha256 === liveManifestSha256,
      releaseReceipt.probe ?? null,
    );
    check(
      "release-target-binding",
      releaseReceipt.binding?.hostname === "koios.news" && Boolean(releaseReceipt.binding?.workerName),
      releaseReceipt.binding ?? null,
    );
    check("release-deployment-identity", /^[0-9a-f-]{36}$/i.test(releaseReceipt.deployment?.readback?.deploymentId ?? ""), releaseReceipt.deployment?.readback?.deploymentId);
  } else {
    check("release-receipt-present", false, "pass --release-receipt");
  }

  const rollbackBound = Boolean(
    releaseReceipt?.rollback?.priorVersionId &&
    /^[0-9a-f-]{36}$/i.test(releaseReceipt.rollback.priorVersionId),
  );
  check("provider-rollback-bound", rollbackBound, releaseReceipt?.rollback ?? null);

  if (scheduleTransition) {
    const transition = scheduleTransition.object;
    check("schedule-transition-settled", transition?.status === "settled", transition?.status);
    check(
      "schedule-successor-active",
      transition?.successorRegistration?.status === "active" && Boolean(transition?.successorRegistration?.id),
      transition?.successorRegistration ?? null,
    );
    check(
      "schedule-predecessor-retired",
      transition?.predecessorRetirement?.status === "retired" && Boolean(transition?.predecessorRetirement?.id),
      transition?.predecessorRetirement ?? null,
    );
    const targetBinding = transition?.successorRegistration?.targetBinding;
    check(
      "schedule-target-binding",
      isNiSha256(targetBinding?.packageDigest) &&
        isNiSha256(targetBinding?.selectedBinDigest) &&
        isNiSha256(targetBinding?.runtimeClosureDigest),
      targetBinding ?? null,
    );
  } else {
    warnings.push({ name: "schedule-transition-not-observed", detail: "pass --schedule-transition-receipt" });
  }

  for (const path of ["", "feed.xml", "sitemap.xml", "operations.json", "newswire-audit.json"]) {
    const { response, bytes } = await fetchBytes(fetchImpl, `${ORIGIN}/${path}`);
    check(`endpoint:${path || "/"}`, response.status === 200 && bytes.length > 0, { status: response.status, bytes: bytes.length });
  }

  const actor = await fetchBytes(fetchImpl, ACTOR, { headers: { accept: "application/activity+json" } });
  check("activitypub-actor", actor.response.status === 200, actor.response.status);
  const webfinger = await fetchBytes(
    fetchImpl,
    `${ACTIVITYPUB_ORIGIN}/.well-known/webfinger?resource=${encodeURIComponent(ACCOUNT)}`,
    { headers: { accept: "application/jrd+json" } },
  );
  check("activitypub-webfinger", webfinger.response.status === 200, webfinger.response.status);

  for (const artifact of representativeArtifacts(artifacts)) {
    const { response, bytes } = await fetchBytes(fetchImpl, publicUrl(artifact.file));
    check(
      `artifact:${artifact.file}`,
      response.status === 200 && bytes.length === artifact.bytes && sha256(bytes) === artifact.sha256,
      { status: response.status, expectedBytes: artifact.bytes, observedBytes: bytes.length },
    );
  }

  let scheduler = { observed: false };
  if (schedulerTick) {
    const receipts = Array.isArray(schedulerTick.receipts) ? schedulerTick.receipts : [];
    const failed = receipts.filter((receipt) =>
      receipt.disposition !== "delivered" || receipt.targetResponseProblem);
    scheduler = {
      observed: true,
      attempted: schedulerTick.attempted ?? receipts.length,
      receiptCount: receipts.length,
      failures: failed.map((receipt) => ({
        id: receipt.id,
        disposition: receipt.disposition,
        targetResponseProblem: receipt.targetResponseProblem,
        processStatus: receipt.process?.status,
        targetCode: receipt.targetResponse?.object?.code,
        targetDisposition: receipt.targetResponse?.object?.disposition,
      })),
    };
    check("scheduler-last-tick", failed.length === 0, scheduler.failures);
  } else {
    warnings.push({ name: "scheduler-tick-not-observed", detail: "pass --scheduler-tick" });
  }

  const backupProven = Boolean(
    backupReceipt?.kind === "koios.news.off-provider-backup-receipt/v1" &&
    backupReceipt?.accepted === true &&
    backupReceipt?.productionManifestSha256 === liveManifestSha256 &&
    backupReceipt?.artifactCount === artifacts.length &&
    isSha256(backupReceipt?.backupObjectSha256),
  );
  const backupReceiptSha256 = backupReceiptPath ? sha256(await readFile(backupReceiptPath)) : null;
  const restoreProven = Boolean(
    restoreReceipt?.kind === "koios.news.fresh-restore-receipt/v1" &&
    restoreReceipt?.accepted === true &&
    restoreReceipt?.productionManifestSha256 === liveManifestSha256 &&
    restoreReceipt?.restoredManifestSha256 === liveManifestSha256 &&
    restoreReceipt?.artifactCount === artifacts.length &&
    restoreReceipt?.backupReceiptSha256 === backupReceiptSha256 &&
    restoreReceipt?.backupObjectSha256 === backupReceipt?.backupObjectSha256 &&
    restoreReceipt?.restoredObjectSha256 === backupReceipt?.backupObjectSha256,
  );
  if (!backupProven) warnings.push({ name: "off-provider-backup-unproven", detail: "pass --backup-receipt" });
  if (!restoreProven) warnings.push({ name: "fresh-restore-unproven", detail: "pass --restore-receipt" });
  const recoveryReady = rollbackBound && backupProven && restoreProven;
  const alertRequired = problems.length > 0 || warnings.length > 0;

  return {
    kind: "koios.news.production-audit/v1",
    observedAt: new Date().toISOString(),
    status: problems.length > 0 ? "failed" : warnings.length > 0 ? "degraded" : "healthy",
    productionHealthy: problems.length === 0,
    recoveryReady,
    alertRequired,
    live: { origin: ORIGIN, manifestSha256: liveManifestSha256, artifactCount: artifacts.length },
    release: releaseReceipt ? {
      deploymentId: releaseReceipt.deployment?.readback?.deploymentId ?? null,
      versionId: releaseReceipt.deployment?.readback?.versionId ?? null,
      rollbackPriorVersionId: releaseReceipt.rollback?.priorVersionId ?? null,
    } : null,
    scheduler,
    recovery: {
      providerRollbackBound: rollbackBound,
      offProviderBackupProven: backupProven,
      freshRestoreProven: restoreProven,
      backupReceiptSha256,
      restoreReceiptSha256: restoreReceiptPath ? sha256(await readFile(restoreReceiptPath)) : null,
    },
    checks,
    problems,
    warnings,
  };
}
