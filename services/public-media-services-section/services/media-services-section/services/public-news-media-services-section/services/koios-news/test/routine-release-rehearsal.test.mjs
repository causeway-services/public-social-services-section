import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash, generateKeyPairSync, sign } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { TARGET, acceptPreviewProbe, executeObservedAuthorized, plan } from "../cloudflare-release-current/src/carrier.mjs";
import { canonicalJson } from "../services/editorial-publication-authority/src/editorial-publication-authority.mjs";
import { attachExternalSignature, formCloudflareGrant, formEditorialGrant, formRoutineJob } from "../tools/authority-ceremony-current/src/authority-ceremony.mjs";

const routineOperation = fileURLToPath(new URL("../bin/koios-news-routine-operation.mjs", import.meta.url));
const NOW = "2026-08-29T12:00:00.000Z";
const digest = (value) => createHash("sha256").update(value).digest("hex");
const ni = (value) => `ni:///sha-256;${createHash("sha256").update(value).digest("base64url")}`;
const activity = Object.freeze({
  "@context": "https://www.w3.org/ns/activitystreams",
  id: "urn:test:scheduled-delivery:release-rehearsal",
  type: "Create",
  actor: "https://bare-cedar-fog.561.group/actors/cold-red-gate-scheduled-activity-delivery",
  target: "https://bare-cedar-fog.561.group/actors/koios-news",
  capability: "urn:capability:koios-news:cold-red-gate:routine-publication:v1",
  published: NOW,
  object: { type: "KoiosRoutinePublicationDemand", contract: "koios-news/routine-operation/v1", pulseId: "urn:test:scheduled-delivery:release-rehearsal#0", operation: "form-offline-candidate" },
});

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "koios-routine-release-rehearsal-"));
  const content = join(root, "posts"), candidates = join(root, "candidates"), routineReplay = join(root, "routine-replay"), releaseReplay = join(root, "release-replay"), baselineRoot = join(root, "baseline");
  mkdirSync(content); mkdirSync(candidates); mkdirSync(routineReplay); mkdirSync(releaseReplay); mkdirSync(baselineRoot);
  const retained = "release rehearsal retained byte\n"; writeFileSync(join(baselineRoot, "retained.txt"), retained);
  writeFileSync(join(baselineRoot, "manifest.json"), `${JSON.stringify({ kind: "koios.static-publication-manifest", profile: "cutover-candidate", authority: "non-authoritative-cutover-candidate", canonicalOrigin: "https://koios.news", routeCount: 1, aliasCount: 0, artifacts: [{ route: "/retained.txt", file: "retained.txt", mediaType: "text/plain", bytes: Buffer.byteLength(retained), digest: ni(retained) }] })}\n`);
  const manuscript = "---\ntitle: Fixture routine release\ndate: 2026-08-29\ndraft: true\nslug: fixture-routine-release\n---\nFixture-backed, admitted routine content.\n";
  const draft = join(content, "fixture-routine-release.md"), admission = join(root, "admission.json"), job = join(root, "job.json"), editorialGrant = join(root, "editorial-grant.json"), editorialKeys = join(root, "editorial-keys.json");
  writeFileSync(draft, manuscript);
  writeFileSync(admission, `${JSON.stringify({ slug: "fixture-routine-release", manuscriptDigest: `sha256:${digest(manuscript)}`, disposition: "accept", publishable: true, serviceAccepted: true, contract: "ni:///sha-256;GTSsfC0lmcjPLQvtlGmYwLJLCa9pirz1d8oUqRweioo", selectedTool: "submit_editorial_acceptance", toolSelectionValidated: true, toolSelectionDigest: "ni:///sha-256;fixture-rehearsal" })}\n`);
  const editorial = generateKeyPairSync("ed25519"), editorialKeyId = "fixture_editorial_authority_0001";
  const editorialUnsigned = formEditorialGrant({ draftPath: draft, manuscriptSlug: "fixture-routine-release", grantId: "fixture-editorial-grant-0001", issuerKeyId: editorialKeyId, issuedAt: "2026-08-29T00:00:00.000Z", expiresAt: "2026-08-30T00:00:00.000Z" });
  const editorialUnsignedPath = join(root, "editorial-grant-unsigned.json");
  writeFileSync(editorialUnsignedPath, `${canonicalJson(editorialUnsigned)}\n`);
  writeFileSync(editorialKeys, `${JSON.stringify({ [editorialKeyId]: editorial.publicKey.export({ format: "jwk" }).x })}\n`);
  const editorialSignature = sign(null, Buffer.from(canonicalJson(editorialUnsigned), "utf8"), editorial.privateKey).toString("base64url");
  writeFileSync(editorialGrant, `${canonicalJson(attachExternalSignature({ kind: "editorial", unsignedPath: editorialUnsignedPath, signature: editorialSignature, authorityKeysPath: editorialKeys }))}\n`);
  writeFileSync(job, `${JSON.stringify(formRoutineJob({ admissionPath: admission, authorityGrantPath: editorialGrant, candidateName: "fixture-routine-release", contentDir: content, draftPath: draft, jobId: "fixture-routine-release-job" }))}\n`);
  const binding = join(root, "binding.json");
  writeFileSync(binding, `${JSON.stringify({ kind: "koios.news.cloudflare-release-binding/v1", ...TARGET }, null, 2)}\n`);
  return { root, candidate: join(candidates, "fixture-routine-release"), binding, routineReplay, releaseReplay, environment: { ...process.env, KOIOS_NEWS_ROUTINE_PUBLICATION_JOB: job, KOIOS_NEWS_ROUTINE_PUBLICATION_AUTHORITY_KEYS: editorialKeys, KOIOS_NEWS_ROUTINE_PUBLICATION_BASELINE_ROOT: baselineRoot, KOIOS_NEWS_ROUTINE_PUBLICATION_OUTPUT_ROOT: candidates, KOIOS_NEWS_ROUTINE_PUBLICATION_REPLAY_ROOT: routineReplay } };
}

function releaseAuthority(f, candidate, phase) {
  const pair = generateKeyPairSync("ed25519"), issuerKeyId = `fixture_cloudflare_${phase}_key_0001`, keys = join(f.root, `${phase}-keys.json`);
  writeFileSync(keys, `${JSON.stringify({ [issuerKeyId]: pair.publicKey.export({ format: "jwk" }).x })}\n`);
  let productionBaselinePath;
  if (phase === "release") {
    productionBaselinePath = join(f.root, "production-baseline.json");
    const candidateManifest = JSON.parse(readFileSync(join(candidate, "manifest.json"), "utf8"));
    const artifacts = candidateManifest.artifacts.map((artifact) => ({ route: `/${artifact.file}`, file: artifact.file, mediaType: "application/octet-stream", bytes: artifact.bytes, digest: ni(readFileSync(join(candidate, artifact.file))) }));
    writeFileSync(productionBaselinePath, `${JSON.stringify({ kind: "koios.static-publication-manifest", profile: "cutover-candidate", authority: "non-authoritative-cutover-candidate", canonicalOrigin: "https://koios.news", routeCount: artifacts.length, aliasCount: 0, artifacts })}\n`);
  }
  const unsigned = formCloudflareGrant({ candidateDir: candidate, bindingPath: f.binding, action: phase, productionBaselinePath, grantId: `fixture-${phase}-grant-0001`, issuerKeyId, issuedAt: "2026-08-29T00:00:00.000Z", expiresAt: "2026-08-30T00:00:00.000Z" });
  const unsignedPath = join(f.root, `${phase}-grant-unsigned.json`);
  writeFileSync(unsignedPath, `${canonicalJson(unsigned)}\n`);
  const signature = sign(null, Buffer.from(canonicalJson(unsigned), "utf8"), pair.privateKey).toString("base64url");
  const grant = join(f.root, `${phase}-grant.json`);
  writeFileSync(grant, `${canonicalJson(attachExternalSignature({ kind: "cloudflare", unsignedPath, signature, authorityKeysPath: keys }))}\n`);
  return { grant, keys, productionBaselinePath };
}

test("fixture rehearsal carries one ScheduleDelivery pulse through editorial authority, Cloudflare preview/probe, and release without external effects", async () => {
  const f = fixture();
  try {
    const routine = spawnSync(process.execPath, [routineOperation], { input: JSON.stringify(activity), encoding: "utf8", env: f.environment });
    assert.equal(routine.status, 0, routine.stderr);
    assert.equal(JSON.parse(routine.stdout).object.code, "offline-candidate-written");
    const candidate = join(f.candidate, "public");
    assert.equal(existsSync(join(f.candidate, "routine-publication-receipt.json")), true);
    assert.equal(existsSync(join(candidate, "routine-publication-receipt.json")), false);
    assert.equal(existsSync(join(candidate, "index.html")), true);

    const served = new Map();
    for (const artifact of JSON.parse(readFileSync(join(candidate, "manifest.json"), "utf8")).artifacts) served.set(artifact.file, readFileSync(join(candidate, artifact.file)));
    served.set("manifest.json", readFileSync(join(candidate, "manifest.json")));
    const fetchCandidate = async (url) => {
      let file = url.pathname.replace(/^\/candidate\//u, "").replace(/^\//u, "");
      if (file === "404") file = "404.html";
      else if (file === "" || file.endsWith("/")) file = `${file}index.html`;
      const bytes = served.get(file);
      return new Response(bytes, { status: bytes ? 200 : 404, headers: { "content-length": String(bytes?.length ?? 0) } });
    };
    const observedExecutor = ({ absentBefore = false, prior = [] } = {}) => {
      let deployed = false;
      return (_program, args) => {
        if (args[0] === "deployments") {
          if (!deployed && absentBefore) return { status: 1, stdout: "", stderr: "This Worker does not exist on your account. [code: 10007]" };
          const deployments = deployed ? [...prior, { id: `fixture-deployment-${effects + 1}`, created_on: "2026-08-29T12:00:00.000Z", versions: [{ version_id: `fixture-version-${effects + 1}`, percentage: 100 }] }] : prior;
          return { status: 0, stdout: JSON.stringify(deployments), stderr: "" };
        }
        effects += 1;
        deployed = true;
        return { status: 0, stdout: "", stderr: "" };
      };
    };
    const previewAuthority = releaseAuthority(f, candidate, "preview");
    const preview = plan({ phase: "preview", candidateDir: candidate, bindingPath: f.binding, grantPath: previewAuthority.grant, authorityKeysPath: previewAuthority.keys, now: NOW });
    const previewReceipt = join(f.root, "preview-deployment.json");
    let effects = 0;
    const previewDeployment = await executeObservedAuthorized({ phase: "preview", plan: preview, receiptOut: previewReceipt, replayRoot: f.releaseReplay, environment: { CLOUDFLARE_ACCOUNT_ID: TARGET.accountId }, executor: observedExecutor({ absentBefore: true }), url: "https://fixture-rehearsal.workers.dev/candidate/", fetchImpl: fetchCandidate });
    assert.equal(previewDeployment.kind, "koios.news.cloudflare-preview-deployment-receipt/v1");

    const probeReceipt = join(f.root, "preview-probe.json");
    const probe = await acceptPreviewProbe({ candidateDir: candidate, bindingPath: f.binding, url: "https://fixture-rehearsal.workers.dev/candidate/", receiptOut: probeReceipt, fetchImpl: fetchCandidate });
    assert.equal(probe.probe.accepted, true);

    const rollback = join(f.root, "rollback.json");
    writeFileSync(rollback, `${JSON.stringify({ kind: "koios.news.cloudflare-rollback-binding/v1", ...TARGET, bindingSha256: digest(readFileSync(f.binding)), priorVersionId: "fixture-prior-version" })}\n`);
    const releaseAuthorityFixture = releaseAuthority(f, candidate, "release");
    const release = plan({ phase: "release", candidateDir: candidate, bindingPath: f.binding, grantPath: releaseAuthorityFixture.grant, authorityKeysPath: releaseAuthorityFixture.keys, now: NOW, rollbackPath: rollback, previewReceiptPath: probeReceipt, productionBaselinePath: releaseAuthorityFixture.productionBaselinePath });
    assert.notEqual(release.grantId, preview.grantId);
    const released = await executeObservedAuthorized({ phase: "release", plan: release, receiptOut: join(f.root, "release-deployment.json"), replayRoot: f.releaseReplay, environment: { CLOUDFLARE_ACCOUNT_ID: TARGET.accountId }, executor: observedExecutor({ prior: [{ id: "fixture-prior-deployment", created_on: "2026-08-29T11:00:00.000Z", versions: [{ version_id: "fixture-prior-version", percentage: 100 }] }] }), url: "https://koios.news/", fetchImpl: fetchCandidate });
    assert.equal(released.kind, "koios.news.cloudflare-release-receipt/v1");
    assert.equal(released.productionBaselineManifestSha256, digest(readFileSync(releaseAuthorityFixture.productionBaselinePath)));
    assert.equal(released.rollback.priorVersionId, "fixture-prior-version");
    assert.equal(effects, 2);
  } finally { rmSync(f.root, { recursive: true, force: true }); }
});
