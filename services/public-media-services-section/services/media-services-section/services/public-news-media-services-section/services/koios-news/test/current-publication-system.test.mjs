import assert from "node:assert/strict";
import { createHash, generateKeyPairSync, sign } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { verifyCandidate } from "../cloudflare-release-current/src/carrier.mjs";
import { writeRoutinePublication } from "../routine-publication-current/src/routine-publication.mjs";
import { canonicalJson } from "../services/editorial-publication-authority/src/editorial-publication-authority.mjs";

const sha256 = (value) => `sha256:${createHash("sha256").update(value).digest("hex")}`;
const ni = (value) => `ni:///sha-256;${createHash("sha256").update(value).digest("base64url")}`;

test("routine publication exposes only its sealed public carrier to Cloudflare", () => {
  const root = mkdtempSync(join(tmpdir(), "koios-current-publication-system-"));
  try {
    const contentDir = join(root, "content");
    const draftPath = join(contentDir, "admitted-item.md");
    const admissionPath = join(root, "admission.json");
    const authorityGrantPath = join(root, "authority-grant.json");
    const authorityKeysPath = join(root, "authority-keys.json");
    const outputDir = join(root, "candidate");
    const replayRoot = join(root, "replay");
    const productionBaselineDir = join(root, "baseline");
    const draft = "---\ntitle: Admitted item\ndate: 2026-08-29\ndraft: true\nslug: admitted-item\n---\nExact admitted bytes.\n";
    mkdirSync(contentDir); mkdirSync(productionBaselineDir);
    const retained = "integration retained byte\n";
    writeFileSync(join(productionBaselineDir, "retained.txt"), retained);
    writeFileSync(join(productionBaselineDir, "manifest.json"), `${JSON.stringify({ kind: "koios.static-publication-manifest", profile: "cutover-candidate", authority: "non-authoritative-cutover-candidate", canonicalOrigin: "https://koios.news", routeCount: 1, aliasCount: 0, artifacts: [{ route: "/retained.txt", file: "retained.txt", mediaType: "text/plain", bytes: Buffer.byteLength(retained), digest: ni(retained) }] })}\n`);
    writeFileSync(draftPath, draft);
    writeFileSync(join(contentDir, "existing.md"), "---\ntitle: Existing item\ndate: 2026-08-28\ndraft: false\nslug: existing\n---\nAlready public.\n");
    writeFileSync(admissionPath, `${JSON.stringify({
      slug: "admitted-item",
      manuscriptDigest: sha256(draft),
      disposition: "accept",
      publishable: true,
      serviceAccepted: true,
      contract: "ni:///sha-256;GTSsfC0lmcjPLQvtlGmYwLJLCa9pirz1d8oUqRweioo",
      selectedTool: "submit_editorial_acceptance",
      toolSelectionValidated: true,
      toolSelectionDigest: "ni:///sha-256;AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    })}\n`);
    const { privateKey, publicKey } = generateKeyPairSync("ed25519");
    const issuerKeyId = "integration-authority-key-0001";
    const unsignedGrant = { expiresAt: "2026-08-30T00:00:00.000Z", grantId: "integration-grant-id-0001", issuedAt: "2026-08-29T00:00:00.000Z", issuerKeyId, kind: "koios.news.editorial-publication-grant/v1", scope: { manuscript: { digest: sha256(draft), slug: "admitted-item" }, type: "exact-manuscript" } };
    const signature = sign(null, Buffer.from(canonicalJson(unsignedGrant), "utf8"), privateKey).toString("base64url");
    writeFileSync(authorityGrantPath, `${canonicalJson({ ...unsignedGrant, signature })}\n`);
    writeFileSync(authorityKeysPath, `${JSON.stringify({ [issuerKeyId]: publicKey.export({ format: "jwk" }).x })}\n`);

    const publication = writeRoutinePublication({ contentDir, draftPath, admissionPath, authorityGrantPath, authorityKeysPath, authorityNow: "2026-08-29T12:00:00.000Z", productionBaselineDir, outputDir, replayRoot });
    const publicDir = publication.plan.candidate.publicDir;
    const candidate = verifyCandidate(publicDir);

    assert.equal(candidate.root, publicDir);
    assert.ok(candidate.artifactCount > 1);
    assert.equal(existsSync(join(publicDir, "routine-publication-receipt.json")), false);
    assert.equal(existsSync(join(publicDir, ".koios-routine-publication-current")), false);
    assert.equal(existsSync(join(outputDir, "routine-publication-receipt.json")), true);
    assert.equal(existsSync(join(outputDir, ".koios-routine-publication-current")), true);
    assert.match(readFileSync(join(publicDir, "index.html"), "utf8"), /Admitted item/);
    assert.equal(readFileSync(join(publicDir, "retained.txt"), "utf8"), retained);
    assert.equal(readFileSync(draftPath, "utf8"), draft);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
