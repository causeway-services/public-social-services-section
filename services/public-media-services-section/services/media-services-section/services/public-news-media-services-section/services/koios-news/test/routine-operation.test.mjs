import assert from "node:assert/strict";
import { createHash, generateKeyPairSync, sign } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { canonicalJson } from "../services/editorial-publication-authority/src/editorial-publication-authority.mjs";

const command = fileURLToPath(new URL("../bin/koios-news-routine-operation.mjs", import.meta.url));
const pulse = Object.freeze({
  "@context": "https://www.w3.org/ns/activitystreams",
  id: "urn:test:scheduled-delivery:koios:0",
  type: "Create",
  actor: "https://bare-cedar-fog.561.group/actors/cold-red-gate-scheduled-activity-delivery",
  target: "https://bare-cedar-fog.561.group/actors/koios-news",
  capability: "urn:capability:koios-news:cold-red-gate:routine-publication:v1",
  published: "2026-08-29T12:00:00.000Z",
  object: {
    type: "KoiosRoutinePublicationDemand",
    contract: "koios-news/routine-operation/v1",
    pulseId: "urn:test:scheduled-delivery:koios:0#0",
    operation: "form-offline-candidate",
  },
});

const digest = (value) => `sha256:${createHash("sha256").update(value).digest("hex")}`;
const ni = (value) => `ni:///sha-256;${createHash("sha256").update(value).digest("base64url")}`;

function invoke(activity, environment = process.env) {
  const result = spawnSync(process.execPath, [command], { input: JSON.stringify(activity), encoding: "utf8", env: environment });
  return { ...result, response: JSON.parse(result.stdout) };
}

function authorizedJob() {
  const root = mkdtempSync(join(tmpdir(), "koios-routine-operation-"));
  const contentDir = join(root, "posts"), outputRoot = join(root, "candidates"), replayRoot = join(root, "replay"), baselineRoot = join(root, "baseline");
  mkdirSync(contentDir); mkdirSync(outputRoot); mkdirSync(replayRoot); mkdirSync(baselineRoot);
  const retained = "scheduled retained byte\n"; writeFileSync(join(baselineRoot, "retained.txt"), retained);
  writeFileSync(join(baselineRoot, "manifest.json"), `${JSON.stringify({ kind: "koios.static-publication-manifest", profile: "cutover-candidate", authority: "non-authoritative-cutover-candidate", canonicalOrigin: "https://koios.news", routeCount: 1, aliasCount: 0, artifacts: [{ route: "/retained.txt", file: "retained.txt", mediaType: "text/plain", bytes: Buffer.byteLength(retained), digest: ni(retained) }] })}\n`);
  const manuscript = "---\ntitle: Scheduled exact item\ndate: 2026-08-29\ndraft: true\nslug: scheduled-exact-item\n---\nAn admitted scheduled item.\n";
  const draftPath = join(contentDir, "scheduled-exact-item.md"), admissionPath = join(root, "admission.json"), authorityGrantPath = join(root, "grant.json"), authorityKeysPath = join(root, "keys.json"), jobPath = join(root, "job.json");
  writeFileSync(draftPath, manuscript);
  writeFileSync(admissionPath, `${JSON.stringify({ slug: "scheduled-exact-item", manuscriptDigest: digest(manuscript), disposition: "accept", publishable: true, serviceAccepted: true, contract: "ni:///sha-256;GTSsfC0lmcjPLQvtlGmYwLJLCa9pirz1d8oUqRweioo", selectedTool: "submit_editorial_acceptance", toolSelectionValidated: true, toolSelectionDigest: "ni:///sha-256;scheduled-test" })}\n`);
  const { privateKey, publicKey } = generateKeyPairSync("ed25519"), issuerKeyId = "scheduled-authority-key-0001";
  const grant = { expiresAt: "2026-08-30T00:00:00.000Z", grantId: "scheduled-grant-id-0001", issuedAt: "2026-08-29T00:00:00.000Z", issuerKeyId, kind: "koios.news.editorial-publication-grant/v1", scope: { manuscript: { digest: digest(manuscript), slug: "scheduled-exact-item" }, type: "exact-manuscript" } };
  writeFileSync(authorityGrantPath, `${canonicalJson({ ...grant, signature: sign(null, Buffer.from(canonicalJson(grant), "utf8"), privateKey).toString("base64url") })}\n`);
  writeFileSync(authorityKeysPath, `${JSON.stringify({ [issuerKeyId]: publicKey.export({ format: "jwk" }).x })}\n`);
  writeFileSync(jobPath, `${JSON.stringify({ admissionPath, authorityGrantPath, candidateName: "scheduled-exact-item", contentDir, draftPath, jobId: "scheduled-job-id-0001", operation: "form-offline-candidate" })}\n`);
  return { root, candidate: join(outputRoot, "scheduled-exact-item"), environment: { ...process.env, KOIOS_NEWS_ROUTINE_PUBLICATION_JOB: jobPath, KOIOS_NEWS_ROUTINE_PUBLICATION_AUTHORITY_KEYS: authorityKeysPath, KOIOS_NEWS_ROUTINE_PUBLICATION_BASELINE_ROOT: baselineRoot, KOIOS_NEWS_ROUTINE_PUBLICATION_OUTPUT_ROOT: outputRoot, KOIOS_NEWS_ROUTINE_PUBLICATION_REPLAY_ROOT: replayRoot } };
}

test("routine operation shape-checks the exact ScheduleDelivery pulse and refuses when its package-selected job environment is absent", () => {
  const result = invoke(pulse);
  assert.equal(result.status, 2);
  assert.equal(result.response.type, "Reject");
  assert.equal(result.response.actor, pulse.target);
  assert.equal(result.response.target, pulse.actor);
  assert.equal(result.response.inReplyTo, pulse.id);
  assert.equal(result.response.object.contract, pulse.object.contract);
  assert.equal(result.response.object.code, "offline-candidate-unavailable");
  assert.equal(result.response.object.customerTerritoryMutation, false);
  assert.match(result.response.object.reason, /KOIOS_NEWS_ROUTINE_PUBLICATION_JOB/u);
});

test("routine operation refuses a forged provider identity without reaching a carrier", () => {
  const result = invoke({ ...pulse, actor: "urn:actor:intruder" });
  assert.equal(result.status, 2);
  assert.equal(result.response.type, "Reject");
  assert.equal(result.response.object.code, "invalid-work-order");
  assert.match(result.response.object.reason, /retained ScheduleDelivery provider/u);
});

test("routine operation refuses an inexact delivery capability", () => {
  const result = invoke({ ...pulse, capability: "urn:capability:test:too-broad" });
  assert.equal(result.status, 2);
  assert.equal(result.response.type, "Reject");
  assert.equal(result.response.object.code, "invalid-work-order");
  assert.match(result.response.object.reason, /exact Koios routine-publication capability/u);
});

test("routine operation consumes signed authority and writes one offline candidate", () => {
  const fixture = authorizedJob();
  try {
    const result = invoke(pulse, fixture.environment);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.response.type, "Accept");
    assert.equal(result.response.object.customerTerritoryMutation, true);
    assert.equal(result.response.object.jobId, "scheduled-job-id-0001");
    assert.deepEqual(result.response.object.effects, ["offline-static-candidate-written", "publication-authority-use-recorded"]);
    assert.equal(existsSync(join(fixture.candidate, "public", "index.html")), true);
    assert.match(readFileSync(join(fixture.candidate, "public", "index.html"), "utf8"), /Scheduled exact item/u);
    assert.equal(readFileSync(join(fixture.candidate, "public", "retained.txt"), "utf8"), "scheduled retained byte\n");
    const replay = invoke({ ...pulse, id: `${pulse.id}:retry`, object: { ...pulse.object, pulseId: `${pulse.object.pulseId}:retry` } }, fixture.environment);
    assert.equal(replay.status, 2);
    assert.equal(replay.response.type, "Reject");
  } finally { rmSync(fixture.root, { recursive: true, force: true }); }
});

test("routine operation preflight proves the selected signed job without consuming or writing", () => {
  const fixture = authorizedJob();
  try {
    const result = spawnSync(process.execPath, [command, "preflight", "--now", pulse.published], { encoding: "utf8", env: fixture.environment });
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    assert.equal(report.ready, true);
    assert.equal(report.jobId, "scheduled-job-id-0001");
    assert.equal(report.authorityScope, "exact-manuscript");
    assert.equal(report.baseline.artifactCount, 1);
    assert.deepEqual(report.effects, []);
    assert.equal(existsSync(fixture.candidate), false);
    const execution = invoke(pulse, fixture.environment);
    assert.equal(execution.status, 0, execution.stderr);
  } finally { rmSync(fixture.root, { recursive: true, force: true }); }
});

test("routine job cannot override the independently configured production baseline", () => {
  const fixture = authorizedJob();
  try {
    const jobPath = fixture.environment.KOIOS_NEWS_ROUTINE_PUBLICATION_JOB;
    const job = JSON.parse(readFileSync(jobPath, "utf8"));
    job.productionBaselineDir = "/attacker-selected-baseline";
    writeFileSync(jobPath, JSON.stringify(job));
    const result = invoke(pulse, fixture.environment);
    assert.equal(result.status, 2);
    assert.match(result.response.object.reason, /job manifest has an invalid shape/);
    assert.equal(existsSync(fixture.candidate), false);
  } finally { rmSync(fixture.root, { recursive: true, force: true }); }
});
