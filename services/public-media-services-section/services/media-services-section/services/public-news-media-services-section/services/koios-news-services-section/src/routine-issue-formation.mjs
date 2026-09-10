import { createHash } from "node:crypto";
import { closeSync, existsSync, fsyncSync, lstatSync, mkdirSync, openSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";

import { verifyAssessmentReceipt, verifyPublicationAuthority } from "../services/editorial-publication-authority/src/editorial-publication-authority.mjs";

const ISSUE_KIND = "koios.news.routine-issue/v1";
const CLAIM_KIND = "koios.news.settled-claim-provenance-bundle/v1";
const sha256 = (value) => `sha256:${createHash("sha256").update(value).digest("hex")}`;
const nameHash = (value) => createHash("sha256").update(value).digest("hex");
const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const isSlug = (value) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(value ?? "");
const isId = (value) => /^[A-Za-z0-9_-]{16,128}$/u.test(value ?? "");
const isDigest = (value) => /^sha256:[a-f0-9]{64}$/u.test(value ?? "");

function fail(message) { throw new TypeError(`routine issue formation: ${message}`); }
function realDirectory(path, label) {
  const absolute = resolve(path ?? "");
  try { const stat = lstatSync(absolute); if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error(); }
  catch { fail(`${label} must be an existing real directory`); }
  return absolute;
}
function realFile(path, label) {
  const absolute = resolve(path ?? "");
  try { const stat = lstatSync(absolute); if (stat.isSymbolicLink() || !stat.isFile()) throw new Error(); }
  catch { fail(`${label} must be an existing real file`); }
  return absolute;
}
function jsonFile(path, label) {
  const source = readFileSync(realFile(path, label), "utf8");
  try { return Object.freeze({ source, value: JSON.parse(source), path: resolve(path) }); }
  catch (error) { fail(`${label} is not JSON: ${error.message}`); }
}
function fsyncDirectory(path) { const descriptor = openSync(path, "r"); try { fsyncSync(descriptor); } finally { closeSync(descriptor); } }
function createOnly(path, source) {
  let descriptor;
  try { descriptor = openSync(path, "wx", 0o600); }
  catch (error) { if (error?.code === "EEXIST") return false; throw error; }
  try { writeFileSync(descriptor, source, "utf8"); fsyncSync(descriptor); } finally { closeSync(descriptor); }
  return true;
}
function exactKeys(value, keys, label) { if (!isRecord(value) || Object.keys(value).length !== keys.length || keys.some((key) => !(key in value))) fail(`${label} has an invalid shape`); }
function claimBundle(source, manuscriptDigest, manuscriptSlug) {
  let value;
  try { value = JSON.parse(source); } catch (error) { fail(`settled claim bundle is not JSON: ${error.message}`); }
  if (!isRecord(value) || value.kind !== CLAIM_KIND || value.settlement !== "settled" || !isRecord(value.manuscript) || value.manuscript.digest !== manuscriptDigest || value.manuscript.slug !== manuscriptSlug || !Array.isArray(value.claims) || value.claims.length === 0) fail("settled claim bundle is not bound to this exact manuscript");
  for (const claim of value.claims) if (!isRecord(claim) || claim.status !== "supported" || !isRecord(claim.provenance)) fail("settled claim bundle contains an unsupported or unprovenanced claim");
  return Object.freeze({ digest: sha256(source), claimCount: value.claims.length });
}
function admission(source, manuscriptDigest, manuscriptSlug) {
  let value;
  try { value = JSON.parse(source); } catch (error) { fail(`admission projection is not JSON: ${error.message}`); }
  if (!isRecord(value) || value.slug !== manuscriptSlug || value.manuscriptDigest !== manuscriptDigest) fail("admission projection is not bound to this exact manuscript");
  // This projection is deliberately not evidence of editorial acceptance. The
  // signed assessment receipt below is the only acceptance authority here.
  return sha256(source);
}
function unconsumed(authorityReplayRoot, consumptionId) {
  const consumed = join(realDirectory(authorityReplayRoot, "authority replay root"), "consumed", `${nameHash(consumptionId)}.json`);
  if (existsSync(consumed)) fail("publication authority use has already been consumed");
}
function issueName(jobId) { return `${jobId}.json`; }

/**
 * Form one immutable queue job from already-settled reporting and independently
 * authenticated editorial evidence. This is a queue effect only: it neither
 * spends publication authority nor forms, releases, or publishes a candidate.
 */
export function formRoutineIssue(input) {
  const manuscriptPath = realFile(input.draftPath, "draft");
  const manuscriptSource = readFileSync(manuscriptPath, "utf8");
  const manuscriptDigest = sha256(manuscriptSource);
  if (!isSlug(input.manuscriptSlug)) fail("manuscriptSlug is invalid");
  if (!isId(input.jobId)) fail("jobId is invalid");
  if (typeof input.candidateName !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/u.test(input.candidateName) || basename(input.candidateName) !== input.candidateName) fail("candidateName is invalid");
  const contentDir = realDirectory(input.contentDir, "content directory");
  const bundle = claimBundle(readFileSync(realFile(input.claimBundlePath, "settled claim bundle"), "utf8"), manuscriptDigest, input.manuscriptSlug);
  const admissionPath = realFile(input.admissionPath, "admission projection");
  const admissionDigest = admission(readFileSync(admissionPath, "utf8"), manuscriptDigest, input.manuscriptSlug);
  const assessment = verifyAssessmentReceipt({ receiptSource: readFileSync(realFile(input.assessmentReceiptPath, "assessment receipt"), "utf8"), assessmentKeys: jsonFile(input.assessmentKeysPath, "assessment key map").value, manuscriptSource, manuscriptSlug: input.manuscriptSlug, now: input.now });
  const grantPath = realFile(input.authorityGrantPath, "publication grant");
  const authority = verifyPublicationAuthority({ grantSource: readFileSync(grantPath, "utf8"), authorityKeys: jsonFile(input.authorityKeysPath, "authority key map").value, assessmentReceiptSource: readFileSync(realFile(input.assessmentReceiptPath, "assessment receipt"), "utf8"), assessmentKeys: jsonFile(input.assessmentKeysPath, "assessment key map").value, manuscriptSource, manuscriptSlug: input.manuscriptSlug, now: input.now });
  unconsumed(input.authorityReplayRoot, authority.consumptionId);
  const queueRoot = realDirectory(input.queueRoot, "routine issue queue root");
  const formationRoot = realDirectory(input.formationReplayRoot, "routine issue formation replay root");
  const claimsRoot = join(formationRoot, "issue-claims"); mkdirSync(claimsRoot, { recursive: true, mode: 0o700 }); fsyncDirectory(formationRoot); fsyncDirectory(claimsRoot);
  const job = Object.freeze({ admissionPath, assessmentReceiptPath: realFile(input.assessmentReceiptPath, "assessment receipt"), authorityGrantPath: grantPath, candidateName: input.candidateName, contentDir, draftPath: manuscriptPath, jobId: input.jobId, operation: "form-offline-candidate" });
  const issue = Object.freeze({ kind: ISSUE_KIND, authority: Object.freeze({ consumptionId: authority.consumptionId, grantDigest: authority.grantDigest, scope: authority.scope }), editorialAssessment: Object.freeze({ assessmentId: assessment.receipt.assessmentId, receiptDigest: assessment.digest }), job, manuscript: Object.freeze({ digest: manuscriptDigest, slug: input.manuscriptSlug }), provenance: Object.freeze({ admissionDigest, claimBundleDigest: bundle.digest, claimCount: bundle.claimCount }) });
  const source = `${JSON.stringify(issue)}\n`;
  const claimPath = join(claimsRoot, `${nameHash(authority.consumptionId)}.json`);
  if (!createOnly(claimPath, source)) {
    const prior = readFileSync(claimPath, "utf8");
    if (prior !== source) fail("publication authority is already reserved by a different routine issue");
  } else fsyncDirectory(claimsRoot);
  const queuePath = join(queueRoot, issueName(input.jobId));
  const createdQueueJob = createOnly(queuePath, `${JSON.stringify(job)}\n`);
  if (!createdQueueJob) {
    if (readFileSync(queuePath, "utf8") !== `${JSON.stringify(job)}\n`) fail("routine issue jobId is already bound to different queue bytes");
  } else fsyncDirectory(queueRoot);
  return Object.freeze({ disposition: "queued", idempotent: !createdQueueJob, issueDigest: sha256(source), jobPath: queuePath, jobSha256: sha256(`${JSON.stringify(job)}\n`), authority: Object.freeze({ consumptionId: authority.consumptionId, consumed: false }) });
}
