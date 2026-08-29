import { createHash } from "node:crypto";
import { closeSync, cpSync, existsSync, fsyncSync, lstatSync, mkdirSync, mkdtempSync, openSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { tmpdir } from "node:os";

import { buildPublication, parsePost, verifyProductionBaseline } from "../../static-delivery-current/src/publication.mjs";
import { consumePublicationAuthority, verifyPublicationAuthority } from "../../services/editorial-publication-authority/src/editorial-publication-authority.mjs";

const MARKER = ".koios-routine-publication-current";
const EDITORIAL_CONTRACT = "ni:///sha-256;GTSsfC0lmcjPLQvtlGmYwLJLCa9pirz1d8oUqRweioo";
const digest = (value) => `sha256:${createHash("sha256").update(value).digest("hex")}`;
const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const bytewiseNameOrder = (left, right) => Buffer.compare(Buffer.from(left.name, "utf8"), Buffer.from(right.name, "utf8"));

function readJson(path, label) {
  try { return JSON.parse(readFileSync(path, "utf8")); }
  catch (error) { throw new Error(`${label} is not readable JSON: ${error.message}`); }
}
function fsyncDirectory(path) {
  const descriptor = openSync(path, "r");
  try { fsyncSync(descriptor); }
  finally { closeSync(descriptor); }
}
function persistCandidateTree(path) {
  const stat = lstatSync(path);
  if (stat.isSymbolicLink()) throw new Error(`candidate persistence refuses a symlink: ${path}`);
  if (stat.isFile()) {
    const descriptor = openSync(path, "r");
    try { fsyncSync(descriptor); }
    finally { closeSync(descriptor); }
    return;
  }
  if (!stat.isDirectory()) throw new Error(`candidate persistence requires a regular file or directory: ${path}`);
  for (const entry of readdirSync(path, { withFileTypes: true }).sort(bytewiseNameOrder)) persistCandidateTree(join(path, entry.name));
  fsyncDirectory(path);
}
function replaceDraftFlag(source, file) {
  const lines = source.replace(/\r\n?/gu, "\n").split("\n");
  const close = lines.indexOf("---", 1);
  if (lines[0] !== "---" || close < 0) throw new Error(`${file}: cannot project malformed front matter`);
  let found = false;
  for (let index = 1; index < close; index += 1) {
    if (/^draft:\s*true\s*$/u.test(lines[index])) { lines[index] = "draft: false"; found = true; }
  }
  if (!found) throw new Error(`${file}: admitted routine publication requires draft: true`);
  return lines.join("\n");
}
function corpusDigest(files) {
  const hash = createHash("sha256");
  for (const file of files) hash.update(file.relative).update("\0").update(file.sha256).update("\0");
  return `sha256:${hash.digest("hex")}`;
}
function inspectCorpus(contentDir, draftPath) {
  const root = resolve(contentDir);
  const rootStat = lstatSync(root);
  if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) throw new Error(`content corpus root must be a real directory: ${root}`);
  const draft = resolve(draftPath);
  const draftRelative = relative(root, draft);
  if (draftRelative === "" || draftRelative === ".." || draftRelative.startsWith(`..${sep}`)) throw new Error(`draft must be strictly inside content corpus root: ${root}`);
  if (dirname(draftRelative) !== ".") throw new Error(`draft must be a direct Markdown file in the static-delivery content root: ${draftRelative}`);
  const draftStat = lstatSync(draft);
  if (draftStat.isSymbolicLink() || !draftStat.isFile()) throw new Error(`draft must be a regular file: ${draft}`);
  const files = [];
  function visit(directory, prefix = "") {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort(bytewiseNameOrder)) {
      const relativePath = prefix === "" ? entry.name : join(prefix, entry.name);
      const path = join(directory, entry.name);
      const stat = lstatSync(path);
      if (stat.isSymbolicLink()) throw new Error(`content corpus contains a symlink: ${relativePath}`);
      if (stat.isDirectory()) { visit(path, relativePath); continue; }
      if (!stat.isFile()) throw new Error(`content corpus contains a non-regular file: ${relativePath}`);
      const bytes = readFileSync(path);
      files.push(Object.freeze({ relative: relativePath.split(sep).join("/"), path, sha256: digest(bytes) }));
    }
  }
  visit(root);
  if (!files.some((file) => file.path === draft)) throw new Error(`draft is not an ordinary corpus member: ${draft}`);
  return Object.freeze({ root, draftRelative: draftRelative.split(sep).join("/"), files: Object.freeze(files), sha256: corpusDigest(files), fileCount: files.length });
}
function copyCorpus(corpus, destination) {
  for (const file of corpus.files) {
    const target = join(destination, file.relative);
    mkdirSync(dirname(target), { recursive: true });
    const bytes = readFileSync(file.path);
    if (digest(bytes) !== file.sha256) throw new Error(`content corpus changed during candidate formation: ${file.relative}`);
    writeFileSync(target, bytes, { mode: 0o600 });
  }
}
export function validateAdmission({ draftPath, admissionPath, corpus }) {
  const absoluteDraft = resolve(draftPath);
  const absoluteAdmission = resolve(admissionPath);
  const source = readFileSync(absoluteDraft, "utf8");
  const file = basename(absoluteDraft);
  const draft = parsePost(source, file);
  if (!draft.draft) throw new Error(`${file}: routine publication accepts an editorially-admitted draft only (draft: true required)`);
  const admission = readJson(absoluteAdmission, "admission");
  if (!isRecord(admission)) throw new Error("admission must be a JSON object");
  const expected = digest(source);
  const required = [
    ["slug", draft.slug],
    ["manuscriptDigest", expected],
    ["disposition", "accept"],
    ["publishable", true],
    ["serviceAccepted", true],
    ["contract", EDITORIAL_CONTRACT],
    ["selectedTool", "submit_editorial_acceptance"],
    ["toolSelectionValidated", true],
  ];
  for (const [field, value] of required) if (admission[field] !== value) throw new Error(`admission does not prove ${field}=${JSON.stringify(value)}`);
  if (typeof admission.toolSelectionDigest !== "string" || admission.toolSelectionDigest.trim() === "") throw new Error("admission does not prove a validated tool-selection digest");
  return Object.freeze({ draft, source, sourceDigest: expected, draftPath: absoluteDraft, admission, admissionPath: absoluteAdmission, admissionDigest: digest(readFileSync(absoluteAdmission)), corpus });
}
function validateAuthority({ admission, authorityGrantPath, authorityKeysPath, assessmentReceiptPath, assessmentKeysPath, authorityNow }) {
  if (![authorityGrantPath, authorityKeysPath, authorityNow].every((value) => typeof value === "string" && value !== "")) throw new Error("authorityGrantPath, authorityKeysPath, and authorityNow are required");
  const grantSource = readFileSync(resolve(authorityGrantPath), "utf8");
  const authorityKeys = readJson(resolve(authorityKeysPath), "authority key map");
  const assessmentReceiptSource = assessmentReceiptPath === undefined ? undefined : readFileSync(resolve(assessmentReceiptPath), "utf8");
  const assessmentKeys = assessmentKeysPath === undefined ? undefined : readJson(resolve(assessmentKeysPath), "assessment key map");
  const verified = verifyPublicationAuthority({ grantSource, authorityKeys, manuscriptSource: admission.source, manuscriptSlug: admission.draft.slug, assessmentReceiptSource, assessmentKeys, now: authorityNow });
  return Object.freeze({ ...verified, grantPath: resolve(authorityGrantPath), keyMapPath: resolve(authorityKeysPath), assessmentReceiptPath: assessmentReceiptPath === undefined ? null : resolve(assessmentReceiptPath), assessmentKeyMapPath: assessmentKeysPath === undefined ? null : resolve(assessmentKeysPath), verifiedAt: authorityNow });
}
export function createFileReplayStore(replayRoot) {
  if (typeof replayRoot !== "string" || replayRoot === "") throw new Error("replayRoot is required for offline candidate formation");
  const root = resolve(replayRoot);
  if (root === resolve("/") || root === resolve(process.cwd())) throw new Error(`refusing broad replay root: ${root}`);
  if (existsSync(root) && (lstatSync(root).isSymbolicLink() || !lstatSync(root).isDirectory())) throw new Error(`replay root must be a real directory: ${root}`);
  const parent = dirname(root);
  if (!existsSync(parent) || lstatSync(parent).isSymbolicLink() || !lstatSync(parent).isDirectory()) throw new Error(`replay root parent must be an existing real directory: ${parent}`);
  mkdirSync(root, { recursive: true, mode: 0o700 });
  const consumed = join(root, "consumed"); mkdirSync(consumed, { recursive: true, mode: 0o700 });
  // If either directory was just created, make its name durable before it is
  // trusted as the one-use authority ledger.
  fsyncDirectory(parent);
  fsyncDirectory(root);
  function consumptionPath(consumptionId) { return join(consumed, `${digest(consumptionId).slice("sha256:".length)}.json`); }
  return Object.freeze({ consumeIfUnused(consumptionId, receiptSha256) {
    if (typeof receiptSha256 !== "string" || !/^sha256:[a-f0-9]{64}$/u.test(receiptSha256)) throw new Error("authority consumption requires the exact staged receipt digest");
    const path = consumptionPath(consumptionId);
    let descriptor;
    try { descriptor = openSync(path, "wx", 0o600); }
    catch (error) { if (error?.code === "EEXIST") return false; throw error; }
    try { writeFileSync(descriptor, `${JSON.stringify({ kind: "koios.news.routine-publication-authority-consumption/v1", consumptionId, receiptSha256, consumedAt: new Date().toISOString() })}\n`, { encoding: "utf8" }); fsyncSync(descriptor); }
    finally { closeSync(descriptor); }
    // fsyncing the file alone does not make its newly created directory entry
    // durable.  A power loss must not turn a consumed publication authority
    // back into an apparently unused one.
    fsyncDirectory(consumed);
    return true;
  }, hasConsumed(consumptionId, receiptSha256) {
    const path = consumptionPath(consumptionId);
    if (!existsSync(path)) return false;
    const record = readJson(path, "authority consumption record");
    return isRecord(record)
      && record.kind === "koios.news.routine-publication-authority-consumption/v1"
      && record.consumptionId === consumptionId
      && record.receiptSha256 === receiptSha256;
  } });
}
function consumeAuthority({ admission, authorityGrantPath, authorityKeysPath, assessmentReceiptPath, assessmentKeysPath, authorityNow, replayStore, replayRoot, receiptSha256 }) {
  const store = replayStore ?? createFileReplayStore(replayRoot);
  const receiptBoundStore = Object.freeze({ consumeIfUnused(consumptionId) { return store.consumeIfUnused(consumptionId, receiptSha256); } });
  return consumePublicationAuthority({ replayStore: receiptBoundStore, grantSource: readFileSync(resolve(authorityGrantPath), "utf8"), authorityKeys: readJson(resolve(authorityKeysPath), "authority key map"), manuscriptSource: admission.source, manuscriptSlug: admission.draft.slug, assessmentReceiptSource: assessmentReceiptPath === undefined ? undefined : readFileSync(resolve(assessmentReceiptPath), "utf8"), assessmentKeys: assessmentKeysPath === undefined ? undefined : readJson(resolve(assessmentKeysPath), "assessment key map"), now: authorityNow });
}
function runtimeReport() {
  const [major = 0, minor = 0] = process.versions.node.split(".").map(Number);
  if (major < 22 || major === 22 && minor < 18) throw new Error(`Node >=22.18 is required for routine candidate formation; found ${process.versions.node}`);
  return Object.freeze({ executionMode: "offline-static-candidate", nodeVersion: process.versions.node, providerInvocations: 0 });
}
function prepareOutput(outputDir, replace) {
  const target = resolve(outputDir);
  if (target === resolve("/") || target === resolve(process.cwd())) throw new Error(`refusing broad output target: ${target}`);
  const staging = `${target}.next`;
  if (existsSync(staging)) {
    if (!existsSync(join(staging, MARKER))) throw new Error(`refusing unmarked staging directory: ${staging}`);
    throw new Error(`candidate recovery staging exists; recover it before starting another publication: ${staging}`);
  }
  if (existsSync(target)) {
    if (!replace) throw new Error(`candidate output exists; use --replace only for a marked prior candidate: ${target}`);
    if (!existsSync(join(target, MARKER))) throw new Error(`refusing to replace unmarked candidate output: ${target}`);
  }
  mkdirSync(staging, { recursive: true });
  writeFileSync(join(staging, MARKER), "koios.news routine-publication-current v1\n");
  return { target, staging };
}
function safeCandidatePath(root, path) {
  const candidate = resolve(root, path);
  const rel = relative(root, candidate);
  if (rel === "" || rel === ".." || rel.startsWith(`..${sep}`)) throw new Error(`candidate path escaped output: ${path}`);
  return candidate;
}
function sealedArtifactPath(file) {
  if (typeof file !== "string" || file === "" || file.includes("\\") || file.startsWith("/") || file.split("/").some((part) => part === "" || part === "." || part === ".." || part.startsWith("."))) throw new Error(`recovery static carrier has an unsafe artifact path: ${String(file)}`);
  if (file === "manifest.json") throw new Error("recovery static carrier manifest must not list itself as an artifact");
  return file;
}
function regularSealedArtifact(root, file) {
  let cursor = root;
  for (const part of file.split("/")) {
    cursor = join(cursor, part);
    if (!existsSync(cursor) || lstatSync(cursor).isSymbolicLink()) throw new Error(`recovery static carrier artifact is missing or traverses a symlink: ${file}`);
  }
  if (!lstatSync(cursor).isFile()) throw new Error(`recovery static carrier artifact is not a regular file: ${file}`);
  return cursor;
}
function inspectSealedPublicCarrier(publicDir) {
  const manifestPath = safeCandidatePath(publicDir, "manifest.json");
  if (!existsSync(manifestPath) || lstatSync(manifestPath).isSymbolicLink() || !lstatSync(manifestPath).isFile()) throw new Error("recovery static carrier has no regular manifest.json");
  const manifestBytes = readFileSync(manifestPath);
  const manifest = readJson(manifestPath, "recovery static carrier manifest");
  if (!isRecord(manifest) || manifest.kind !== "koios.news.static-publication-manifest/v1" || !Array.isArray(manifest.artifacts)) throw new Error("recovery static carrier manifest has an unsupported shape");
  const declared = new Set();
  for (const artifact of manifest.artifacts) {
    if (!isRecord(artifact) || Object.keys(artifact).length !== 3 || !["file", "sha256", "bytes"].every((field) => Object.hasOwn(artifact, field))) throw new Error("recovery static carrier manifest has an invalid artifact");
    const file = sealedArtifactPath(artifact.file);
    if (declared.has(file)) throw new Error(`recovery static carrier manifest has a duplicate artifact: ${file}`);
    if (!/^[a-f0-9]{64}$/u.test(artifact.sha256) || !Number.isSafeInteger(artifact.bytes) || artifact.bytes < 0) throw new Error(`recovery static carrier manifest has invalid digest metadata: ${file}`);
    const bytes = readFileSync(regularSealedArtifact(publicDir, file));
    if (bytes.length !== artifact.bytes || digest(bytes) !== `sha256:${artifact.sha256}`) throw new Error(`recovery static carrier artifact digest mismatch: ${file}`);
    declared.add(file);
  }
  const actual = new Set();
  function visit(directory, prefix = "") {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort(bytewiseNameOrder)) {
      const file = prefix === "" ? entry.name : `${prefix}/${entry.name}`;
      const path = join(directory, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`recovery static carrier contains a symlink: ${file}`);
      if (entry.isDirectory()) { visit(path, file); continue; }
      if (!entry.isFile()) throw new Error(`recovery static carrier contains an unsupported entry: ${file}`);
      if (file !== "manifest.json") actual.add(file);
    }
  }
  visit(publicDir);
  if (actual.size !== declared.size || [...actual].some((file) => !declared.has(file))) throw new Error("recovery static carrier contains an unsealed artifact");
  return Object.freeze({ manifestSha256: digest(manifestBytes), artifactCount: declared.size });
}
function readRecoveryReceipt(candidateRoot) {
  if (lstatSync(candidateRoot).isSymbolicLink() || !lstatSync(candidateRoot).isDirectory()) throw new Error(`recovery candidate must be a real directory: ${candidateRoot}`);
  if (!existsSync(join(candidateRoot, MARKER))) throw new Error(`recovery candidate is not marked: ${candidateRoot}`);
  const receipt = readJson(safeCandidatePath(candidateRoot, "routine-publication-receipt.json"), "routine publication receipt");
  if (!isRecord(receipt) || receipt.kind !== "koios.news.routine-publication-receipt/v1" || receipt.disposition !== "offline-static-candidate" || !isRecord(receipt.authority) || typeof receipt.authority.consumptionId !== "string" || receipt.authority.consumptionId === "") throw new Error(`recovery candidate has no valid authority consumption coordinate: ${candidateRoot}`);
  const publicDir = safeCandidatePath(candidateRoot, "public");
  if (!existsSync(publicDir) || lstatSync(publicDir).isSymbolicLink() || !lstatSync(publicDir).isDirectory()) throw new Error(`recovery candidate has no real public carrier: ${candidateRoot}`);
  if (!isRecord(receipt.staticCarrier) || typeof receipt.staticCarrier.manifestSha256 !== "string" || !/^sha256:[a-f0-9]{64}$/u.test(receipt.staticCarrier.manifestSha256) || !Number.isSafeInteger(receipt.staticCarrier.artifactCount) || receipt.staticCarrier.artifactCount < 0) throw new Error(`recovery candidate has no sealed public-carrier binding: ${candidateRoot}`);
  const seal = inspectSealedPublicCarrier(publicDir);
  if (seal.manifestSha256 !== receipt.staticCarrier.manifestSha256 || seal.artifactCount !== receipt.staticCarrier.artifactCount) throw new Error(`recovery candidate public carrier does not match its sealed receipt: ${candidateRoot}`);
  return Object.freeze({ receipt, consumptionId: receipt.authority.consumptionId });
}
function finalizeCandidate({ target, staging, persistPublishedParent, renameCandidate = renameSync }) {
  if (existsSync(target)) {
    if (!existsSync(join(target, MARKER))) throw new Error(`refusing to replace unmarked candidate output: ${target}`);
    rmSync(target, { recursive: true });
  }
  renameCandidate(staging, target);
  persistPublishedParent(dirname(target));
}
export function recoverRoutinePublication({ outputDir, replayRoot, persistCandidate = persistCandidateTree, persistPublishedParent = fsyncDirectory, renameCandidate = renameSync }) {
  if (typeof outputDir !== "string" || outputDir === "") throw new Error("outputDir is required for candidate recovery");
  const target = resolve(outputDir);
  if (target === resolve("/") || target === resolve(process.cwd())) throw new Error(`refusing broad output target: ${target}`);
  const staging = `${target}.next`;
  const candidate = existsSync(staging) ? staging : target;
  if (!existsSync(candidate)) throw new Error(`no staged or finalized candidate is available for recovery: ${target}`);
  const recovery = readRecoveryReceipt(candidate);
  const receiptSha256 = digest(readFileSync(join(candidate, "routine-publication-receipt.json")));
  const store = createFileReplayStore(replayRoot);
  if (!store.hasConsumed(recovery.consumptionId, receiptSha256)) throw new Error("recovery candidate has no matching durable authority consumption record");
  // A retained candidate is re-persisted before it becomes visible; recovery
  // only finalizes the already-consumed coordinate and never verifies or reuses authority.
  persistCandidate(candidate);
  if (candidate === staging) finalizeCandidate({ target, staging, persistPublishedParent, renameCandidate });
  else persistPublishedParent(dirname(target));
  return Object.freeze({ disposition: "recovered", outputDir: target, slug: recovery.receipt.slug, consumptionId: recovery.consumptionId, receiptSha256 });
}
function normalizeStaticManifest(candidateRoot, projectedDigest) {
  // Bind the deterministic routine projection without exposing its temporary
  // filesystem coordinate in the public carrier manifest.
  const path = safeCandidatePath(candidateRoot, "manifest.json");
  const manifest = readJson(path, "static carrier manifest");
  if (!isRecord(manifest) || !isRecord(manifest.provenance)) throw new Error("static carrier produced an invalid manifest");
  manifest.provenance.projectedCorpusSha256 = projectedDigest;
  writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`);
}
function prepareRoutinePublication({ contentDir, draftPath, admissionPath, outputDir, productionBaselineDir, authorityGrantPath, authorityKeysPath, assessmentReceiptPath, assessmentKeysPath, authorityNow }) {
  if (![contentDir, draftPath, admissionPath, outputDir, productionBaselineDir].every((value) => typeof value === "string" && value !== "")) throw new Error("contentDir, draftPath, admissionPath, outputDir, and productionBaselineDir are required");
  const corpus = inspectCorpus(contentDir, draftPath);
  const admission = validateAdmission({ draftPath, admissionPath, corpus });
  const baseline = verifyProductionBaseline({ baselineDir: productionBaselineDir });
  const authority = validateAuthority({ admission, authorityGrantPath, authorityKeysPath, assessmentReceiptPath, assessmentKeysPath, authorityNow });
  const runtime = runtimeReport();
  const projected = replaceDraftFlag(admission.source, basename(admission.draftPath));
  parsePost(projected, basename(admission.draftPath));
  const projectedCorpusSha256 = corpusDigest(corpus.files.map((file) => file.relative === corpus.draftRelative ? Object.freeze({ ...file, sha256: digest(projected) }) : file));
  return Object.freeze({ admission, authority, baseline, runtime, projected, projectedCorpusSha256 });
}
function publicationPlan({ outputDir, prepared }) {
  const { admission, authority, baseline, runtime, projected, projectedCorpusSha256 } = prepared;
  return Object.freeze({
    disposition: "ready",
    executionMode: "dry-run",
    authority: "authenticated-editorial-publication-grant",
    effects: Object.freeze([]),
    candidate: Object.freeze({ outputDir: resolve(outputDir), publicDir: join(resolve(outputDir), "public"), slug: admission.draft.slug, sourceSha256: admission.sourceDigest, projectedSha256: digest(projected), admissionSha256: admission.admissionDigest, corpusSha256: admission.corpus.sha256, projectedCorpusSha256, corpusFileCount: admission.corpus.fileCount }),
    provenance: Object.freeze({ contentDir: admission.corpus.root, draftPath: admission.draftPath, admissionPath: admission.admissionPath, editorialContract: EDITORIAL_CONTRACT, baseline, authority: Object.freeze({ scope: authority.scope, grantId: authority.grantId, grantDigest: authority.grantDigest, manuscriptDigest: authority.manuscriptDigest, assessmentReceiptDigest: authority.assessmentReceiptDigest ?? null, verifiedAt: authority.verifiedAt }), runtime }),
    blockers: Object.freeze(["This authenticated authority permits only offline candidate formation. It creates no live publication, ScheduleDelivery receipt, ActivityPub activity, or Cloudflare deployment."]),
  });
}
export function planRoutinePublication(input) {
  return publicationPlan({ outputDir: input.outputDir, prepared: prepareRoutinePublication(input) });
}
export function writeRoutinePublication({ contentDir, draftPath, admissionPath, outputDir, productionBaselineDir, authorityGrantPath, authorityKeysPath, assessmentReceiptPath, assessmentKeysPath, authorityNow, replayRoot, replayStore, replace = false, persistCandidate = persistCandidateTree, persistPublishedParent = fsyncDirectory, renameCandidate = renameSync }) {
  const prepared = prepareRoutinePublication({ contentDir, draftPath, admissionPath, outputDir, productionBaselineDir, authorityGrantPath, authorityKeysPath, assessmentReceiptPath, assessmentKeysPath, authorityNow });
  const plan = publicationPlan({ outputDir, prepared });
  const { admission, baseline, projected, projectedCorpusSha256 } = prepared;
  const { target, staging } = prepareOutput(outputDir, replace);
  const work = mkdtempSync(join(tmpdir(), "koios-routine-publication-"));
  let authorityConsumed = false;
  try {
    copyCorpus(admission.corpus, work);
    const projectedPath = join(work, admission.corpus.draftRelative);
    writeFileSync(projectedPath, projected);
    const carrierOutput = join(work, "carrier");
    buildPublication({ contentDir: work, outputDir: carrierOutput, productionBaselineDir });
    const publicOutput = join(staging, "public");
    cpSync(carrierOutput, publicOutput, { recursive: true });
    normalizeStaticManifest(publicOutput, projectedCorpusSha256);
    const carrierManifest = readJson(join(publicOutput, "manifest.json"), "static carrier manifest");
    if (JSON.stringify(carrierManifest?.provenance?.productionBaseline) !== JSON.stringify(baseline)) throw new Error("production baseline changed between planning and carrier formation");
    const sealedCarrier = inspectSealedPublicCarrier(publicOutput);
    const receipt = Object.freeze({ kind: "koios.news.routine-publication-receipt/v1", disposition: "offline-static-candidate", editorialContract: EDITORIAL_CONTRACT, slug: admission.draft.slug, authority: Object.freeze({ kind: "Ed25519", scope: prepared.authority.scope, grantId: prepared.authority.grantId, grantDigest: prepared.authority.grantDigest, manuscriptDigest: prepared.authority.manuscriptDigest, assessmentReceiptDigest: prepared.authority.assessmentReceiptDigest ?? null, verifiedAt: prepared.authority.verifiedAt, consumptionId: prepared.authority.consumptionId }), provenance: Object.freeze({ contentDir: admission.corpus.root, corpusSha256: admission.corpus.sha256, projectedCorpusSha256, corpusFileCount: admission.corpus.fileCount, sourcePath: admission.draftPath, sourceSha256: admission.sourceDigest, admissionPath: admission.admissionPath, admissionSha256: admission.admissionDigest, projectedSha256: digest(projected), baseline, transition: Object.freeze({ allowedChanges: Object.freeze(["draft"]), sourceDraft: true, candidateDraft: false, sourceMutated: false }) }), limitations: Object.freeze(["The authenticated editorial grant authorizes only this offline candidate; it is not a Cloudflare release grant or ScheduleDelivery acceptance.", "Candidate formation is offline only and grants no deployment or delivery authority."]), staticCarrier: Object.freeze({ package: "@causeway-services/koios-news-static-delivery-current", output: "public/", manifestSha256: sealedCarrier.manifestSha256, artifactCount: sealedCarrier.artifactCount }) });
    const receiptText = `${JSON.stringify(receipt, null, 2)}\n`;
    const receiptSha256 = digest(receiptText);
    writeFileSync(safeCandidatePath(staging, "routine-publication-receipt.json"), receiptText);
    // Finish and persist every staged output before spending one-use editorial
    // authority.  Any persistence failure leaves that authority reusable.
    persistCandidate(staging);
    // Directories cannot be atomically replaced portably.  The complete next
    // candidate is staged first; only a marked prior target may then be removed
    // before this final rename.
    const consumption = consumeAuthority({ admission, authorityGrantPath, authorityKeysPath, assessmentReceiptPath, assessmentKeysPath, authorityNow, replayStore, replayRoot, receiptSha256 });
    authorityConsumed = true;
    // The target becomes visible through its parent directory entry.  Do not
    // report success until that entry is durable as well.
    finalizeCandidate({ target, staging, persistPublishedParent, renameCandidate });
    return Object.freeze({ disposition: "written", outputDir: target, slug: admission.draft.slug, consumptionId: consumption.consumptionId, receiptSha256, plan });
  } catch (error) {
    // Before consumption the staging tree is disposable. After consumption it
    // is the durable recovery artifact and must survive a publication-finalize
    // failure rather than destroying the only bytes paid for by the grant.
    if (!authorityConsumed && existsSync(staging)) rmSync(staging, { recursive: true, force: true });
    throw error;
  } finally { if (existsSync(work)) rmSync(work, { recursive: true, force: true }); }
}
