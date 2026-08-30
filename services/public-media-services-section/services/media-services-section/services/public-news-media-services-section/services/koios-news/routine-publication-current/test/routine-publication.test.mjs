import assert from "node:assert/strict";
import { createHash, generateKeyPairSync, sign } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { planRoutinePublication, recoverRoutinePublication, writeRoutinePublication } from "../src/routine-publication.mjs";
import { canonicalJson } from "../../services/editorial-publication-authority/src/editorial-publication-authority.mjs";

const digest = (value) => `sha256:${createHash("sha256").update(value).digest("hex")}`;
const ni = (value) => `ni:///sha-256;${createHash("sha256").update(value).digest("base64url")}`;
function draft() {
  return "---\ntitle: Exact accepted item\ndate: 2026-08-29\ndraft: true\nslug: exact-accepted-item\n---\nA bounded, editorially admitted item.\n";
}
function acceptance(bytes, additions = {}) {
  return { slug: "exact-accepted-item", manuscriptDigest: digest(bytes), disposition: "accept", publishable: true, serviceAccepted: true, contract: "ni:///sha-256;GTSsfC0lmcjPLQvtlGmYwLJLCa9pirz1d8oUqRweioo", selectedTool: "submit_editorial_acceptance", toolSelectionValidated: true, toolSelectionDigest: "ni:///sha-256;example", ...additions };
}
function setup() {
  const temp = mkdtempSync(join(tmpdir(), "koios-routine-publication-"));
  const contentDir = join(temp, "posts");
  mkdirSync(contentDir);
  const draftPath = join(contentDir, "exact-accepted-item.md");
  const admissionPath = join(temp, "admission.json");
  const authorityGrantPath = join(temp, "authority-grant.json");
  const authorityKeysPath = join(temp, "authority-keys.json");
  const authorityNow = "2026-08-29T12:00:00.000Z";
  const productionBaselineDir = join(temp, "baseline"); mkdirSync(productionBaselineDir);
  const retained = "retained production byte\n"; writeFileSync(join(productionBaselineDir, "retained.txt"), retained);
  writeFileSync(join(productionBaselineDir, "manifest.json"), `${JSON.stringify({ kind: "koios.static-publication-manifest", profile: "cutover-candidate", authority: "non-authoritative-cutover-candidate", canonicalOrigin: "https://koios.news", routeCount: 1, aliasCount: 0, artifacts: [{ route: "/retained.txt", file: "retained.txt", mediaType: "text/plain", bytes: Buffer.byteLength(retained), digest: ni(retained) }] })}\n`);
  const bytes = draft();
  writeFileSync(draftPath, bytes);
  writeFileSync(join(contentDir, "existing-post.md"), "---\ntitle: Existing public item\ndate: 2026-08-28\ndraft: false\nslug: existing-post\n---\nA previously published corpus item.\n");
  writeFileSync(admissionPath, `${JSON.stringify(acceptance(bytes))}\n`);
  const { privateKey, publicKey } = generateKeyPairSync("ed25519");
  const issuerKeyId = "routine-authority-key-0001";
  const unsignedGrant = { expiresAt: "2026-08-30T00:00:00.000Z", grantId: "routine-grant-id-0001", issuedAt: "2026-08-29T00:00:00.000Z", issuerKeyId, kind: "koios.news.editorial-publication-grant/v1", scope: { manuscript: { digest: digest(bytes), slug: "exact-accepted-item" }, type: "exact-manuscript" } };
  const signature = sign(null, Buffer.from(canonicalJson(unsignedGrant), "utf8"), privateKey).toString("base64url");
  writeFileSync(authorityGrantPath, `${canonicalJson({ ...unsignedGrant, signature })}\n`);
  writeFileSync(authorityKeysPath, `${JSON.stringify({ [issuerKeyId]: publicKey.export({ format: "jwk" }).x })}\n`);
  return { temp, contentDir, draftPath, admissionPath, authorityGrantPath, authorityKeysPath, authorityNow, productionBaselineDir, outputDir: join(temp, "candidate"), replayRoot: join(temp, "replay"), bytes };
}

test("defaults to a no-write exact-admission plan", () => {
  const fixture = setup();
  try {
    const result = planRoutinePublication(fixture);
    assert.equal(result.disposition, "ready");
    assert.equal(result.executionMode, "dry-run");
    assert.equal(result.authority, "authenticated-editorial-publication-grant");
    assert.deepEqual(result.effects, []);
    assert.equal(existsSync(fixture.outputDir), false);
    assert.match(result.candidate.sourceSha256, /^sha256:[a-f0-9]{64}$/);
    assert.equal(result.candidate.corpusFileCount, 2);
    assert.match(result.candidate.corpusSha256, /^sha256:[a-f0-9]{64}$/);
    assert.equal(result.provenance.runtime.executionMode, "offline-static-candidate");
    assert.equal(result.provenance.runtime.providerInvocations, 0);
    assert.equal(result.provenance.authority.scope, "exact-manuscript");
  } finally { rmSync(fixture.temp, { recursive: true, force: true }); }
});

test("refuses a record not bound to the exact draft or an unvalidated selection", () => {
  const fixture = setup();
  try {
    writeFileSync(fixture.admissionPath, JSON.stringify(acceptance(fixture.bytes, { manuscriptDigest: "sha256:wrong" })));
    assert.throws(() => planRoutinePublication(fixture), /manuscriptDigest/);
    writeFileSync(fixture.admissionPath, JSON.stringify(acceptance(fixture.bytes, { toolSelectionValidated: false })));
    assert.throws(() => planRoutinePublication(fixture), /toolSelectionValidated/);
    assert.equal(existsSync(fixture.outputDir), false);
  } finally { rmSync(fixture.temp, { recursive: true, force: true }); }
});

test("refuses absent, expired, or byte-inexact publication authority before candidate writes", () => {
  const fixture = setup();
  try {
    assert.throws(() => planRoutinePublication({ ...fixture, authorityGrantPath: undefined }), /authorityGrantPath/u);
    assert.throws(() => planRoutinePublication({ ...fixture, authorityNow: "2026-08-30T00:00:00.000Z" }), /expired/u);
    const changed = `${fixture.bytes}changed`;
    writeFileSync(fixture.draftPath, changed);
    writeFileSync(fixture.admissionPath, `${JSON.stringify(acceptance(changed))}\n`);
    assert.throws(() => planRoutinePublication(fixture), /does not bind/u);
    assert.equal(existsSync(fixture.outputDir), false);
  } finally { rmSync(fixture.temp, { recursive: true, force: true }); }
});

test("refuses corpus symlinks before any candidate write", () => {
  const fixture = setup();
  try {
    symlinkSync(fixture.draftPath, join(fixture.contentDir, "linked-draft.md"));
    assert.throws(() => planRoutinePublication(fixture), /content corpus contains a symlink/);
    assert.equal(existsSync(fixture.outputDir), false);
  } finally { rmSync(fixture.temp, { recursive: true, force: true }); }
});

test("writes a marked two-phase offline candidate without changing source bytes or losing public corpus posts", () => {
  const fixture = setup();
  try {
    const result = writeRoutinePublication(fixture);
    assert.equal(result.disposition, "written");
    assert.equal(readFileSync(fixture.draftPath, "utf8"), fixture.bytes);
    assert.equal(existsSync(join(fixture.outputDir, ".koios-routine-publication-current")), true);
    assert.equal(readFileSync(join(fixture.outputDir, "public", "retained.txt"), "utf8"), "retained production byte\n");
    assert.equal(existsSync(join(fixture.outputDir, "public", ".koios-static-delivery-current")), false);
    assert.equal(readFileSync(join(fixture.outputDir, "public", "manifest.json"), "utf8").includes(fixture.temp), false);
    assert.match(readFileSync(join(fixture.outputDir, "public", "index.html"), "utf8"), /Exact accepted item/);
    assert.match(readFileSync(join(fixture.outputDir, "public", "index.html"), "utf8"), /Existing public item/);
    assert.match(readFileSync(join(fixture.outputDir, "public", "posts", "existing-post", "index.html"), "utf8"), /Existing public item/);
    const receipt = JSON.parse(readFileSync(join(fixture.outputDir, "routine-publication-receipt.json"), "utf8"));
    assert.equal(receipt.provenance.sourceSha256, digest(fixture.bytes));
    assert.equal(receipt.provenance.corpusFileCount, 2);
    assert.match(receipt.provenance.corpusSha256, /^sha256:[a-f0-9]{64}$/);
    assert.equal(receipt.provenance.transition.sourceMutated, false);
    assert.equal(receipt.authority.kind, "Ed25519");
    assert.equal(receipt.authority.scope, "exact-manuscript");
    assert.equal(receipt.authority.issuedAt, "2026-08-29T00:00:00.000Z");
    assert.equal(receipt.authority.expiresAt, "2026-08-30T00:00:00.000Z");
    assert.match(receipt.staticCarrier.manifestSha256, /^sha256:[a-f0-9]{64}$/u);
    assert.ok(receipt.staticCarrier.artifactCount > 0);
    assert.equal(receipt.provenance.baseline.artifactCount, 1);
    assert.match(result.consumptionId, /^grant:/u);
    assert.throws(() => writeRoutinePublication(fixture), /candidate output exists/u);
    assert.throws(() => writeRoutinePublication({ ...fixture, replace: true }), /already been consumed/u);
  } finally { rmSync(fixture.temp, { recursive: true, force: true }); }
});

test("persists the complete staged candidate before consuming publication authority", () => {
  const fixture = setup();
  try {
    let staged = false, consumed = false, published = false;
    const result = writeRoutinePublication({
      ...fixture,
      persistCandidate: (path) => {
        assert.equal(path, `${fixture.outputDir}.next`);
        assert.equal(existsSync(join(path, "routine-publication-receipt.json")), true);
        assert.equal(existsSync(join(path, "public", "manifest.json")), true);
        staged = true;
      },
      replayStore: { consumeIfUnused() { assert.equal(staged, true); consumed = true; return true; } },
      persistPublishedParent: (path) => { assert.equal(path, fixture.temp); published = true; },
    });
    assert.equal(result.disposition, "written");
    assert.equal(consumed, true);
    assert.equal(published, true);
  } finally { rmSync(fixture.temp, { recursive: true, force: true }); }
});

test("does not consume publication authority when staged-candidate persistence fails", () => {
  const fixture = setup();
  try {
    let consumed = false;
    assert.throws(() => writeRoutinePublication({
      ...fixture,
      persistCandidate: () => { throw new Error("candidate fsync failed"); },
      replayStore: { consumeIfUnused() { consumed = true; return true; } },
    }), /candidate fsync failed/u);
    assert.equal(consumed, false);
    assert.equal(existsSync(fixture.outputDir), false);
    assert.equal(existsSync(`${fixture.outputDir}.next`), false);
  } finally { rmSync(fixture.temp, { recursive: true, force: true }); }
});

test("recovers a persisted candidate after authority consumption without reusing authority", () => {
  const fixture = setup();
  try {
    assert.throws(() => writeRoutinePublication({
      ...fixture,
      renameCandidate: () => { throw new Error("final candidate rename failed"); },
    }), /final candidate rename failed/u);
    assert.equal(existsSync(fixture.outputDir), false);
    assert.equal(existsSync(`${fixture.outputDir}.next`), true);
    assert.throws(() => writeRoutinePublication(fixture), /recovery staging exists/u);
    const recovered = recoverRoutinePublication(fixture);
    assert.equal(recovered.disposition, "recovered");
    assert.equal(recovered.consumptionId, "grant:routine-grant-id-0001");
    assert.equal(existsSync(fixture.outputDir), true);
    assert.equal(existsSync(`${fixture.outputDir}.next`), false);
    assert.match(readFileSync(join(fixture.outputDir, "public", "index.html"), "utf8"), /Exact accepted item/);
    assert.throws(() => writeRoutinePublication({ ...fixture, replace: true }), /already been consumed/u);
  } finally { rmSync(fixture.temp, { recursive: true, force: true }); }
});

function stageConsumedCandidate(fixture) {
  assert.throws(() => writeRoutinePublication({
    ...fixture,
    renameCandidate: () => { throw new Error("final candidate rename failed"); },
  }), /final candidate rename failed/u);
  return `${fixture.outputDir}.next`;
}

test("recovery rejects a receipt modified after its authority consumption", () => {
  const fixture = setup();
  try {
    const staging = stageConsumedCandidate(fixture);
    const receiptPath = join(staging, "routine-publication-receipt.json");
    const receipt = JSON.parse(readFileSync(receiptPath, "utf8"));
    receipt.slug = "tampered-item";
    writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
    assert.throws(() => recoverRoutinePublication(fixture), /matching durable authority consumption record/u);
    assert.equal(existsSync(staging), true);
  } finally { rmSync(fixture.temp, { recursive: true, force: true }); }
});

test("recovery rejects a public manifest modified after authority consumption", () => {
  const fixture = setup();
  try {
    const staging = stageConsumedCandidate(fixture);
    const manifestPath = join(staging, "public", "manifest.json");
    writeFileSync(manifestPath, `${readFileSync(manifestPath, "utf8")} `);
    assert.throws(() => recoverRoutinePublication(fixture), /does not match its sealed receipt/u);
    assert.equal(existsSync(staging), true);
  } finally { rmSync(fixture.temp, { recursive: true, force: true }); }
});

test("recovery rejects changed or unsealed public artifacts after authority consumption", () => {
  for (const mutate of [
    (staging) => writeFileSync(join(staging, "public", "index.html"), "tampered\n"),
    (staging) => writeFileSync(join(staging, "public", "unsealed.txt"), "extra\n"),
  ]) {
    const fixture = setup();
    try {
      const staging = stageConsumedCandidate(fixture);
      mutate(staging);
      assert.throws(() => recoverRoutinePublication(fixture), /artifact digest mismatch|unsealed artifact/u);
      assert.equal(existsSync(staging), true);
    } finally { rmSync(fixture.temp, { recursive: true, force: true }); }
  }
});

test("refuses absent, unsafe, and corrupt baselines before authority consumption", () => {
  const fixture = setup();
  try {
    assert.throws(() => planRoutinePublication({ ...fixture, productionBaselineDir: undefined }), /productionBaselineDir/);
    writeFileSync(join(fixture.productionBaselineDir, "retained.txt"), "corrupt\n");
    assert.throws(() => writeRoutinePublication(fixture), /digest mismatch/);
    assert.equal(existsSync(join(fixture.replayRoot, "consumed")), false);
    assert.equal(existsSync(fixture.outputDir), false);
  } finally { rmSync(fixture.temp, { recursive: true, force: true }); }
});
