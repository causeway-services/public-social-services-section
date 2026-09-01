#!/usr/bin/env node

import { createHash } from "node:crypto";
import { appendFileSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, renameSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { admitEnterpriseInstall, inspectMeshScope, revalidateEnterpriseInstall } from "./skills/mesh-scope.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const ACTOR = "urn:ame:turntide-islands";
const PRODUCT = "urn:sha256:5f35c38c5d51cc438ac6da93fe602f6cd1d06b93278021df8f3f36178fb94f0f";
const DECISION = "urn:sha256:475b3c951c5eb7a5da4359556f44de52da5ee9ef0a8f598fe04030832f8ac458";
const DECISION_RECEIPT = "urn:sha256:03434ed20a3eb50ce7ea9e2df74cb51ac1c8623b6ea280fca730ec2b966e2c71";
const DIRECTION = "urn:sha256:1ac3cc9f1cffee6ffe399821ecb831208a73f2393ce336b8632ecfdba87ba77d";
const SOURCE_TARGET_ROOT = "services/state-of-harmonious-union-reporting-service";
const LOCAL_TARGET_ROOT = "services/state-of-harmonious-union-reporting-service";

function assert(value, message) { if (!value) throw new Error(message); }
function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().filter((key) => value[key] !== undefined).map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}
function digest(value) { return `sha256:${createHash("sha256").update(canonical(value)).digest("hex")}`; }
function contentRecord(body) { return { id: `urn:${digest(body)}`, ...body }; }
function arg(name) { const index = process.argv.indexOf(name); return index >= 0 ? process.argv[index + 1] : null; }
function now() { return arg("--now") ?? new Date().toISOString(); }
function readJsonl(path) { return readFileSync(resolve(path), "utf8").split("\n").filter(Boolean).map(JSON.parse); }
function findExact(path, id) {
  const matches = readJsonl(path).flatMap((record) => [record, record.delivery, record.decision, record.receipt].filter(Boolean)).filter((item) => item.id === id);
  assert(matches.length === 1, `${id} must resolve exactly once from the supplied ingress record`); return matches[0];
}
function safeSuffix(path) { return typeof path === "string" && path.length > 0 && !path.includes("\0") && !path.includes("\\") && !path.includes("//") && !path.startsWith("/") && path.split("/").every((part) => part && part !== "." && part !== ".." && part !== ".git"); }
function exactDirectory(path, label) { const lexical = resolve(path); assert(realpathSync(lexical) === lexical && !lstatSync(lexical).isSymbolicLink() && statSync(lexical).isDirectory(), `${label} is not exact`); return lexical; }
function evidencePath(category, recordedAt) { const [year, month, day] = recordedAt.slice(0, 10).split("-"); return join(ROOT, "data", category, year, month, day, `${recordedAt.slice(0, 10)}-turntide-islands-${basename(category)}.jsonl`); }
function record(category, value) { const path = evidencePath(category, value.recordedAt); mkdirSync(dirname(path), { recursive: true }); appendFileSync(path, `${canonical(value)}\n`, { mode: 0o600 }); return value; }
function walk(root) {
  const output = [];
  function descend(path) { for (const entry of readdirSync(path, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const child = join(path, entry.name); assert(!entry.isSymbolicLink(), `symlink refused: ${child}`);
    if (entry.isDirectory()) descend(child); else { assert(entry.isFile(), `special file refused: ${child}`); const bytes = readFileSync(child); output.push({ path: relative(root, child).split(sep).join("/"), digest: digest(bytes.toString("base64")), byteLength: bytes.length }); }
  }}
  descend(root); return output;
}

async function main() {
  const recordedAt = now();
  assert(arg("--leader-direction") === DIRECTION, "exact Leader omnibus direction is required");
  const product = findExact(arg("--delivery-record"), PRODUCT);
  const decision = findExact(arg("--decision-record"), DECISION);
  const decisionReceipt = findExact(arg("--decision-record"), DECISION_RECEIPT);
  assert(product.type === "Accept" && product.object?.type === "ProposedSoftwareDevelopmentProduct" && product.object?.artifacts?.length === 14, "accepted reporting product mismatch");
  assert(decision.type === "Accept" && decision.inReplyTo === PRODUCT && decision.object?.customerUsefulness === true && decision.object?.proposedProduct?.id === PRODUCT, "reporting acceptance chain mismatch");
  assert(decisionReceipt.type === "Accept" && decisionReceipt.inReplyTo === DECISION && decisionReceipt.object?.proposedProduct === PRODUCT && decisionReceipt.object?.decision === "Accept", "reporting decision receipt mismatch");
  const receiptPath = evidencePath("reporting-product-admission-receipts", recordedAt);
  const prior = existsSync(receiptPath) ? readJsonl(receiptPath).find((item) => item.type === "TTIReportingProductAdmissionReceipt" && item.product === PRODUCT) : null;
  const finalTarget = resolve(ROOT, LOCAL_TARGET_ROOT);
  if (prior) { assert(existsSync(finalTarget) && digest(walk(finalTarget)) === prior.admittedTreeDigest, "admitted reporting target drift"); process.stdout.write(`${JSON.stringify({ ...prior, replay: true }, null, 2)}\n`); return; }
  assert(!existsSync(finalTarget), "create-only reporting target already exists");
  const key = digest({ product: PRODUCT, decision: DECISION, leaderDirection: DIRECTION }).slice(7);
  const stage = resolve(ROOT, "data", "reporting-product-admission", key, "staged");
  assert(!existsSync(dirname(stage)), "reporting stage collision"); mkdirSync(stage, { recursive: true, mode: 0o700 });
  const expected = [];
  for (const artifact of product.object.artifacts) {
    assert(artifact.targetPath.startsWith(`${SOURCE_TARGET_ROOT}/`), "reporting artifact target-root mismatch");
    const suffix = artifact.targetPath.slice(SOURCE_TARGET_ROOT.length + 1); assert(safeSuffix(suffix), "unsafe reporting artifact suffix");
    const bytes = Buffer.from(artifact.bytesBase64, "base64");
    assert(bytes.toString("base64") === artifact.bytesBase64 && bytes.length === artifact.byteLength && digest(artifact.bytesBase64) === artifact.digest, `reporting artifact mismatch: ${suffix}`);
    const target = resolve(stage, suffix); assert(target.startsWith(`${stage}${sep}`), "reporting stage escape"); mkdirSync(dirname(target), { recursive: true, mode: 0o700 }); writeFileSync(target, bytes, { flag: "wx", mode: 0o600 });
    expected.push({ path: suffix, digest: artifact.digest, byteLength: artifact.byteLength });
  }
  expected.sort((a, b) => a.path.localeCompare(b.path)); assert(digest(walk(stage)) === digest(expected), "staged reporting tree mismatch");
  const prepared = contentRecord({ type: "TTIReportingProductAdmissionPrepared", recordedAt, actor: ACTOR, leaderDirection: DIRECTION,
    product: PRODUCT, customerDecision: DECISION, customerDecisionReceipt: DECISION_RECEIPT, sourceTargetRoot: SOURCE_TARGET_ROOT,
    localTargetRoot: LOCAL_TARGET_ROOT, stagedTreeDigest: digest(expected), artifactCount: expected.length, externalNetwork: false, externalSpend: 0 });
  record("reporting-product-admission-transitions", prepared);
  const servicesParent = resolve(ROOT, "services"); if (!existsSync(servicesParent)) mkdirSync(servicesParent, { mode: 0o700 }); exactDirectory(servicesParent, "TTI services parent");
  const sourceScope = inspectMeshScope({ authorityRoot: ROOT, subject: stage }); const targetScope = inspectMeshScope({ authorityRoot: ROOT, subject: servicesParent });
  assert(sourceScope.inside && !sourceScope.boundaries.length && targetScope.inside && !targetScope.boundaries.length, "reporting admission escaped TTI");
  const admission = admitEnterpriseInstall({ authorityRoot: ROOT, sourceEnterprise: stage, targetNode: servicesParent, installer: "codex", operation: "install", mode: "apply" });
  const privateCandidate = join(servicesParent, `.reporting-admission-${key}`); mkdirSync(privateCandidate, { mode: 0o700 });
  for (const item of expected) { const target = resolve(privateCandidate, item.path); mkdirSync(dirname(target), { recursive: true, mode: 0o700 }); writeFileSync(target, readFileSync(resolve(stage, item.path)), { flag: "wx", mode: 0o600 }); }
  assert(digest(walk(privateCandidate)) === digest(expected) && !existsSync(finalTarget), "private reporting candidate drift"); revalidateEnterpriseInstall(admission); assert(!existsSync(finalTarget), "reporting target appeared after revalidation"); renameSync(privateCandidate, finalTarget);
  const admittedTreeDigest = digest(walk(finalTarget)); assert(admittedTreeDigest === digest(expected), "admitted reporting tree drift");
  const receipt = contentRecord({ type: "TTIReportingProductAdmissionReceipt", recordedAt, actor: ACTOR, leaderDirection: DIRECTION,
    preparedTransition: prepared.id, product: PRODUCT, customerDecision: DECISION, customerDecisionReceipt: DECISION_RECEIPT,
    localTargetRoot: LOCAL_TARGET_ROOT, admittedTreeDigest, admittedArtifacts: expected, meshAdmissionRequestSha256: `sha256:${admission.requestSha256}`,
    meshAdmissionSnapshotDigest: digest(admission.snapshot), overwrite: false, externalNetwork: false, externalSpend: 0, credentialDisclosure: false });
  record("reporting-product-admission-receipts", receipt); process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
}

main().catch((error) => { const refusal = contentRecord({ type: "TTIReportingProductAdmissionRefusal", recordedAt: now(), actor: ACTOR, leaderDirection: DIRECTION,
  product: PRODUCT, code: "tti-local-reporting-admission-refused", detail: error.message, externalNetwork: false, externalSpend: 0, credentialDisclosure: false });
  try { record("reporting-product-admission-refusals", refusal); } catch {} process.stdout.write(`${JSON.stringify(refusal, null, 2)}\n`); process.exitCode = 2; });
