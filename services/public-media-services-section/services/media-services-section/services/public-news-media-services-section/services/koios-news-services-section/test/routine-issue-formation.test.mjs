import assert from "node:assert/strict";
import { createHash, generateKeyPairSync, sign } from "node:crypto";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { canonicalJson } from "../services/editorial-publication-authority/src/editorial-publication-authority.mjs";
import { formRoutineIssue } from "../src/routine-issue-formation.mjs";

const NOW = "2099-01-01T00:00:00.000Z";
const manuscript = "---\ntitle: Exact\ndraft: true\nslug: exact\n---\nExact reporting.\n";
const digest = (value) => `sha256:${createHash("sha256").update(value).digest("hex")}`;
function key(id) { const pair = generateKeyPairSync("ed25519"); return { id, privateKey: pair.privateKey, keys: { [id]: pair.publicKey.export({ format: "jwk" }).x } }; }
function signed(record, signer) { const unsigned = { ...record, issuerKeyId: signer.id }; return `${canonicalJson({ ...unsigned, signature: sign(null, Buffer.from(canonicalJson(unsigned), "utf8"), signer.privateKey).toString("base64url") })}\n`; }
function fixture() {
  const root = mkdtempSync(join(tmpdir(), "koios-routine-issue-"));
  const paths = Object.fromEntries(["content", "queue", "formation", "authority-replay"].map((name) => [name, join(root, name)]));
  for (const path of Object.values(paths)) mkdirSync(path); mkdirSync(join(paths["authority-replay"], "consumed"));
  const draftPath = join(paths.content, "exact.md"), admissionPath = join(root, "admission.json"), claimBundlePath = join(root, "claims.json"), assessmentReceiptPath = join(root, "assessment.json"), assessmentKeysPath = join(root, "assessment-keys.json"), authorityGrantPath = join(root, "grant.json"), authorityKeysPath = join(root, "authority-keys.json");
  writeFileSync(draftPath, manuscript); writeFileSync(admissionPath, JSON.stringify({ slug: "exact", manuscriptDigest: digest(manuscript) }));
  writeFileSync(claimBundlePath, JSON.stringify({ kind: "koios.news.settled-claim-provenance-bundle/v1", settlement: "settled", manuscript: { digest: digest(manuscript), slug: "exact" }, claims: [{ status: "supported", provenance: { source: "primary" } }] }));
  const assessor = key("assessment-key-0001"), authority = key("authority-key-0001"), policyDigest = `sha256:${"1".repeat(64)}`;
  writeFileSync(assessmentKeysPath, JSON.stringify(assessor.keys)); writeFileSync(authorityKeysPath, JSON.stringify(authority.keys));
  writeFileSync(assessmentReceiptPath, signed({ assessmentId: "assessment-id-0001", disposition: "accept", expiresAt: "2099-01-02T00:00:00.000Z", issuedAt: "2098-12-31T00:00:00.000Z", kind: "koios.news.independent-editorial-assessment-receipt/v1", manuscript: { digest: digest(manuscript), slug: "exact" }, policyDigest, publishable: true }, assessor));
  writeFileSync(authorityGrantPath, signed({ expiresAt: "2099-01-02T00:00:00.000Z", grantId: "standing-grant-0001", issuedAt: "2098-12-31T00:00:00.000Z", kind: "koios.news.editorial-publication-grant/v1", scope: { policyDigest, type: "standing-policy" } }, authority));
  return { root, ...paths, draftPath, admissionPath, claimBundlePath, assessmentReceiptPath, assessmentKeysPath, authorityGrantPath, authorityKeysPath };
}
function input(x) { return { ...x, manuscriptSlug: "exact", jobId: "routine-job-id-0001", candidateName: "exact", now: NOW, contentDir: x.content, queueRoot: x.queue, formationReplayRoot: x.formation, authorityReplayRoot: x["authority-replay"] }; }

test("forms one immutable queue job with exact claim, assessment, and grant joins", () => { const x = fixture(); try { const result = formRoutineIssue(input(x)); const job = JSON.parse(readFileSync(result.jobPath, "utf8")); assert.equal(job.draftPath, x.draftPath); assert.equal(job.assessmentReceiptPath, x.assessmentReceiptPath); assert.equal(result.authority.consumed, false); } finally { rmSync(x.root, { recursive: true, force: true }); } });
test("refuses hand-authored acceptance projections without an independently signed assessment", () => { const x = fixture(); try { writeFileSync(x.assessmentReceiptPath, JSON.stringify({ assessmentId: "forged" })); assert.throws(() => formRoutineIssue(input(x)), /assessment receipt|canonical|invalid/i); } finally { rmSync(x.root, { recursive: true, force: true }); } });
test("is idempotent and refuses a different job for the same finite authority coordinate", () => { const x = fixture(); try { const first = formRoutineIssue(input(x)); const second = formRoutineIssue(input(x)); assert.equal(first.idempotent, false); assert.equal(second.idempotent, true); assert.equal(first.jobSha256, second.jobSha256); assert.throws(() => formRoutineIssue({ ...input(x), jobId: "routine-job-id-0002", candidateName: "other" }), /already reserved/u); } finally { rmSync(x.root, { recursive: true, force: true }); } });
