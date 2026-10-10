import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { ACTOR, channelIdentity, contentId, digest } from "../src/channel.mjs";
import { admitBootstrapCompletion } from "../src/bootstrap-completion.mjs";
import { INVENTORY_CATEGORY } from "../src/inventory.mjs";
import { admitLegacyBootstrapPublication, LEGACY_BOOTSTRAP_PUBLICATION_ADMISSION_CATEGORY, loadLegacyBootstrapEvidence, planLegacyBootstrapPublication, youtubeReadCapability } from "../src/legacy-bootstrap-publication-admission.mjs";
import { querySettlementRecords, recordSettlementRecord } from "../src/record-journal.mjs";
import { BOOTSTRAP_CATEGORY, claimAlternatingRelease } from "../src/release.mjs";
import { UPLOAD_CATEGORY } from "../src/scheduled-upload-bridge.mjs";

const AT = "2096-07-22T18:00:00.000Z", PUBLISH_AT = "2026-07-23T15:00:00.000Z", VIDEO_ID = "fRnoCLDnn2g", CHANNEL_ID = channelIdentity().youtubeChannelId;
const executeFile = promisify(execFile);
function sha(bytes) { return `sha256:${createHash("sha256").update(bytes).digest("hex")}`; }
function exact(body) { return { id: contentId(body), ...body }; }
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "business-legacy-bootstrap-")), dataRoot = join(root, "data"), runtimeRoot = join(root, "runtime"), bytes = Buffer.from("exact legacy carrier"), metadata = { title: "Value Propositions, Business Models, and Institutional Purpose", description: "Exact historical metadata." };
  const artifact = { type: "ModernBusinessNotebookLMVideoMaterialization", lesson: "value-proposition-business-model-purpose", path: "video.mp4", sha256: sha(bytes), byteLength: bytes.byteLength, intendedReleaseAt: PUBLISH_AT };
  const plan = { type: "ModernBusinessRoutineProductionPlan", firstLesson: "value-proposition-business-model-purpose", materializedArtifact: "ignored-by-injected-path", metadata: "ignored-by-injected-path", intendedReleaseAt: PUBLISH_AT, firstScheduledRelease: { youtubeVideoId: VIDEO_ID, observedPublishAt: PUBLISH_AT } };
  const paths = { productionPlanPath: join(root, "production-plan.json"), artifactPath: join(root, "artifact.json"), videoPath: join(root, "video.mp4"), metadataPath: join(root, "metadata.json") };
  writeFileSync(paths.productionPlanPath, JSON.stringify(plan)); writeFileSync(paths.artifactPath, JSON.stringify(artifact)); writeFileSync(paths.videoPath, bytes); writeFileSync(paths.metadataPath, JSON.stringify(metadata));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const state = { channelId: CHANNEL_ID, videoId: VIDEO_ID, videoChannelId: CHANNEL_ID, title: metadata.title, privacyStatus: "public", uploadStatus: "processed", processingStatus: "succeeded", publishedAt: PUBLISH_AT, publishAt: null };
  const calls = [], authorizedFetch = async (url, init) => { calls.push({ url: String(url), method: init?.method }); if (String(url).includes("/channels?")) return new Response(JSON.stringify({ items: [{ id: state.channelId, snippet: { title: "Modern Business Practices" } }] }), { status: 200 }); return new Response(JSON.stringify({ items: [{ id: state.videoId, snippet: { channelId: state.videoChannelId, title: state.title, publishedAt: state.publishedAt }, status: { privacyStatus: state.privacyStatus, uploadStatus: state.uploadStatus, ...(state.publishAt === null ? {} : { publishAt: state.publishAt }) }, processingDetails: { processingStatus: state.processingStatus } }] }), { status: 200 }); };
  return { root, dataRoot, runtimeRoot, paths, plan, artifact, metadata, state, calls, authorizedFetch, options: { at: AT, dataRoot, runtimeRoot, paths, authorizedFetch } };
}
async function seed(dataRoot, category, row) { return recordSettlementRecord({ root: dataRoot, category, recordedAt: AT, record: row }); }

test("legacy publication planning is deterministic and has no observation or append authority", (t) => {
  const f = fixture(t), first = planLegacyBootstrapPublication(f.paths), replay = planLegacyBootstrapPublication(f.paths);
  assert.deepEqual(replay, first);
  assert.equal(first.type, "LegacyBootstrapPublicationAdmissionPlan");
  assert.equal(first.confirmation, first.operation.id);
  assert.equal(first.disposition, "planned-no-observation-no-append");
  assert.deepEqual(first.externalEffects, []);
});

test("the remote plan mode needs neither OAuth nor an inherited operation confirmation", async (t) => {
  const f = fixture(t);
  const path = fileURLToPath(new URL("../src/legacy-bootstrap-publication-admission.mjs", import.meta.url));
  const environment = { PATH: process.env.PATH, EMSWEB_LEGACY_BOOTSTRAP_MODE: "plan" };
  const evidenceArguments = ["--production-plan", f.paths.productionPlanPath, "--artifact-manifest", f.paths.artifactPath, "--video", f.paths.videoPath, "--metadata", f.paths.metadataPath];
  const planned = JSON.parse((await executeFile(process.execPath, [path, ...evidenceArguments], { env: environment })).stdout);
  assert.equal(planned.type, "LegacyBootstrapPublicationAdmissionPlan");
  await assert.rejects(executeFile(process.execPath, [path, ...evidenceArguments], { env: { ...environment, EMSWEB_OPERATION_CONFIRMATION: planned.confirmation } }), /legacy bootstrap plan forbids append authority/u);
});

test("legacy publication admission is a GET-only, digest-bound dry-run by default", async (t) => {
  const f = fixture(t), result = await admitLegacyBootstrapPublication(f.options), evidence = loadLegacyBootstrapEvidence(f.paths);
  assert.equal(result.disposition, "dry-run-no-append");
  assert.equal(result.operation.productionPlanDigest, evidence.productionPlanDigest);
  assert.equal(result.operation.artifactManifestDigest, evidence.artifactManifestDigest);
  assert.equal(result.operation.videoSha256, evidence.videoSha256);
  assert.equal(result.operation.metadataDigest, evidence.metadataDigest);
  assert.deepEqual(f.calls.map((call) => call.method), ["GET", "GET"]);
  assert.equal((await querySettlementRecords(LEGACY_BOOTSTRAP_PUBLICATION_ADMISSION_CATEGORY, { root: f.dataRoot })).length, 0);
  assert.equal(evidence.youtubeVideoId, VIDEO_ID);
});

test("the YouTube observation membrane rejects every non-GET request", async () => {
  let crossed = false; const capability = youtubeReadCapability(async () => { crossed = true; return new Response("{}"); });
  await assert.rejects(() => capability("https://www.googleapis.com/youtube/v3/videos", { method: "POST" }), /forbids YouTube writes/u);
  assert.equal(crossed, false);
});

test("append requires exact confirmation, writes one generation, and replay has no effect", async (t) => {
  const f = fixture(t), dry = await admitLegacyBootstrapPublication(f.options);
  await assert.rejects(() => admitLegacyBootstrapPublication({ ...f.options, append: true, confirmation: "wrong" }), /exact admission operation id/u);
  assert.equal((await querySettlementRecords(LEGACY_BOOTSTRAP_PUBLICATION_ADMISSION_CATEGORY, { root: f.dataRoot })).length, 0);
  const admission = await admitLegacyBootstrapPublication({ ...f.options, append: true, confirmation: dry.operation.id });
  assert.equal(admission.type, "LegacyBootstrapPublicationAdmission"); assert.equal(admission.generation, 1); assert.equal(admission.previousAdmission, null); assert.ok(admission.authorityWithheld.includes("scheduled-upload-receipt"));
  const replay = await admitLegacyBootstrapPublication({ ...f.options, append: true, confirmation: dry.operation.id, authorizedFetch: async () => { throw new Error("replay crossed YouTube"); } });
  assert.deepEqual(replay, admission);
  assert.equal((await querySettlementRecords(LEGACY_BOOTSTRAP_PUBLICATION_ADMISSION_CATEGORY, { root: f.dataRoot })).length, 1);
});

test("foreign channel, video, publication time, metadata, and non-public state are refused", async (t) => {
  const cases = [
    ["channelId", "UC" + "x".repeat(22), /foreign channel/u],
    ["videoId", "aaaaaaaaaaa", /exact requested video|foreign video/u],
    ["videoChannelId", "UC" + "y".repeat(22), /foreign channel/u],
    ["publishedAt", "2026-07-23T15:01:00.000Z", /foreign publishedAt/u],
    ["publishAt", "2026-07-23T15:01:00.000Z", /foreign publishAt/u],
    ["title", "Foreign title", /metadata conflicts/u],
    ["privacyStatus", "private", /not observed public/u],
    ["uploadStatus", "failed", /not observed public/u],
    ["processingStatus", "failed", /not observed public/u]
  ];
  for (const [field, value, pattern] of cases) { const f = fixture(t); f.state[field] = value; await assert.rejects(() => admitLegacyBootstrapPublication(f.options), pattern, field); }
});

test("carrier digest conflicts and any historical bridge receipt are refused", async (t) => {
  const corrupt = fixture(t); writeFileSync(corrupt.paths.videoPath, "changed carrier"); assert.throws(() => loadLegacyBootstrapEvidence(corrupt.paths), /digest or length conflicts/u);
  const bridged = fixture(t), bridge = exact({ type: "ModernBusinessScheduledUploadBridgeReceipt", channel: ACTOR, youtubeVideoId: VIDEO_ID, publishAt: PUBLISH_AT }); await seed(bridged.dataRoot, UPLOAD_CATEGORY, bridge);
  await assert.rejects(() => admitLegacyBootstrapPublication(bridged.options), /refuses an existing scheduled-upload bridge receipt/u);
});

test("foreign or conflicting rectification generations and concurrent append are refused", async (t) => {
  const foreign = fixture(t), malformed = exact({ type: "LegacyBootstrapPublicationAdmission", channel: "urn:foreign", generation: 1, previousAdmission: null, operation: "foreign" }); await seed(foreign.dataRoot, LEGACY_BOOTSTRAP_PUBLICATION_ADMISSION_CATEGORY, malformed);
  await assert.rejects(() => admitLegacyBootstrapPublication(foreign.options), /foreign or malformed/u);
  const conflict = fixture(t), other = exact({ type: "LegacyBootstrapPublicationAdmission", channel: ACTOR, generation: 1, previousAdmission: null, operation: "other" }); await seed(conflict.dataRoot, LEGACY_BOOTSTRAP_PUBLICATION_ADMISSION_CATEGORY, other);
  await assert.rejects(() => admitLegacyBootstrapPublication(conflict.options), /conflicting admission/u);
  const concurrent = fixture(t), dry = await admitLegacyBootstrapPublication(concurrent.options), lock = join(concurrent.runtimeRoot, dry.operation.id.replace(/[^A-Za-z0-9_-]/gu, "_")); mkdirSync(lock, { recursive: true });
  await assert.rejects(() => admitLegacyBootstrapPublication({ ...concurrent.options, append: true, confirmation: dry.operation.id }), /concurrently executing/u);
});

test("bootstrap completion consumes only the admitted rectification and unlocks lesson two", async (t) => {
  const f = fixture(t); await assert.rejects(() => admitBootstrapCompletion({ dataRoot: f.dataRoot, at: AT }), /requires one admitted/u);
  const dry = await admitLegacyBootstrapPublication(f.options), admission = await admitLegacyBootstrapPublication({ ...f.options, append: true, confirmation: dry.operation.id }), completion = await admitBootstrapCompletion({ dataRoot: f.dataRoot, at: AT });
  assert.equal(completion.legacyBootstrapPublicationAdmission, admission.id); assert.equal(completion.scheduledUploadReceipt, undefined); assert.equal(completion.status, "legacy-publication-admitted");
  const inventoryBody = { type: "ModernBusinessExplainerInventoryAdmission", channel: ACTOR, courseId: "modern-firm-as-operational-system", courseRevision: 1, lessonId: "lesson-two", sequence: 2, prerequisites: ["value-proposition-business-model-purpose"] }, inventory = exact(inventoryBody); await seed(f.dataRoot, INVENTORY_CATEGORY, inventory);
  const claim = await claimAlternatingRelease({ inventoryAdmission: inventory, civilDay: "2096-07-24", plannedPublishAt: "2096-07-24T15:00:00.000Z" }, { dataRoot: f.dataRoot, runtimeRoot: join(f.root, "release-locks"), settlement: "eip155:31337:0x9999999999999999999999999999999999999999", at: AT });
  assert.equal(claim.lessonId, "lesson-two"); assert.equal((await querySettlementRecords(BOOTSTRAP_CATEGORY, { root: f.dataRoot })).length, 1);
});

test("bootstrap completion rejects a replay of the never-witnessed scheduled receipt", async (t) => {
  const f = fixture(t), dry = await admitLegacyBootstrapPublication(f.options); await admitLegacyBootstrapPublication({ ...f.options, append: true, confirmation: dry.operation.id });
  const forgedHistory = exact({ type: "ModernBusinessBootstrapCourseCompletion", channel: ACTOR, courseId: "modern-firm-as-operational-system", courseRevision: 1, lessonId: "value-proposition-business-model-purpose", sequence: 1, youtubeVideoId: VIDEO_ID, scheduledUploadReceipt: "urn:sha256:" + "1".repeat(64), civilDay: "2026-07-23", publishAt: PUBLISH_AT, status: "scheduled-first-course-lesson", admittedAt: AT });
  await seed(f.dataRoot, BOOTSTRAP_CATEGORY, forgedHistory);
  await assert.rejects(() => admitBootstrapCompletion({ dataRoot: f.dataRoot, at: AT }), /conflicts with the admitted rectification/u);
});
