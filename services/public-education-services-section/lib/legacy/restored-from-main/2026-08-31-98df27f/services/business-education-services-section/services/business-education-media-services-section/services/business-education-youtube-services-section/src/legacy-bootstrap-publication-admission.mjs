#!/usr/bin/env node
import { createHash } from "node:crypto";
import { lstatSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { observeAuthorizedChannel, observeVideo } from "@red-cup-engineering/youtube-services-section";
import { ACTOR, NODE_ROOT, channelIdentity, contentId, digest } from "./channel.mjs";
import { createSettlementStore, querySettlementRecords } from "./record-journal.mjs";
import { authorizedFetch, loadEnvironment, refreshAccessToken } from "./private-draft-pilot.mjs";
import { REFRESH_TOKEN_ENV } from "./oauth-setup.mjs";
import { UPLOAD_CATEGORY } from "./scheduled-upload-bridge.mjs";

export const LEGACY_BOOTSTRAP_PUBLICATION_ADMISSION_CATEGORY = "modern-business-youtube.legacy-bootstrap-publication-admission";
const PLAN_PATH = join(NODE_ROOT, "content/config/production-plan.json");
const COURSE_ID = "modern-firm-as-operational-system";
const LESSON_ID = "value-proposition-business-model-purpose";
const COMMITTED_DIGESTS = Object.freeze({ productionPlan: "sha256:f6a091d815b37b3c0d8f83ac9eb5e1366d89af73188a15538bdf657b93082b0c", artifactManifest: "sha256:5d5e1a9977a66a222f2993dd6add2975bd1d30360c8cae87bd092e875b6f64d4", metadata: "sha256:10378009e851be112eea778e814e6a0bb908bd70db1da28effe374886ee89ef5", video: "sha256:98f20e11fc4bc9ff9b9e3006a2c604f11da2991b8971e380300e299d237b5ccc" });

function exactFile(path, maximum, label) {
  const target = resolve(path), stat = lstatSync(target);
  if (stat.isSymbolicLink() || !stat.isFile() || stat.size < 1 || stat.size > maximum) throw new TypeError(`${label} must be an exact bounded regular file`);
  return readFileSync(target);
}
function exactJson(path, label) {
  try { return JSON.parse(exactFile(path, 1_000_000, label).toString("utf8")); }
  catch { throw new TypeError(`${label} must be exact JSON`); }
}
function sha(bytes) { return `sha256:${createHash("sha256").update(bytes).digest("hex")}`; }
function exactId(value) { if (!value || typeof value !== "object") return false; const { id, ...body } = value; return id === contentId(body); }
function exactInstant(value, label) { if (!Number.isFinite(Date.parse(value ?? "")) || new Date(value).toISOString() !== value) throw new TypeError(`${label} must be an exact ISO instant`); return value; }

export function loadLegacyBootstrapEvidence(paths = {}) {
  const committed = Object.keys(paths).length === 0;
  const productionPlanPath = resolve(paths.productionPlanPath ?? PLAN_PATH), plan = exactJson(productionPlanPath, "production plan");
  if (plan?.type !== "ModernBusinessRoutineProductionPlan" || plan.firstLesson !== LESSON_ID || plan.intendedReleaseAt !== plan.firstScheduledRelease?.observedPublishAt) throw new TypeError("production plan does not identify the exact legacy bootstrap publication");
  const artifactPath = resolve(paths.artifactPath ?? resolve(NODE_ROOT, plan.materializedArtifact)), artifact = exactJson(artifactPath, "artifact manifest");
  if (artifact?.type !== "ModernBusinessNotebookLMVideoMaterialization" || artifact.lesson !== LESSON_ID || artifact.intendedReleaseAt !== plan.intendedReleaseAt || !/^sha256:[0-9a-f]{64}$/u.test(artifact.sha256 ?? "")) throw new TypeError("artifact manifest is foreign to the legacy bootstrap plan");
  const videoPath = resolve(paths.videoPath ?? resolve(dirname(artifactPath), artifact.path)), videoBytes = exactFile(videoPath, 8_000_000_000, "artifact carrier");
  if (sha(videoBytes) !== artifact.sha256 || videoBytes.byteLength !== artifact.byteLength) throw new TypeError("artifact carrier digest or length conflicts with its manifest");
  const metadataPath = resolve(paths.metadataPath ?? resolve(NODE_ROOT, plan.metadata)), metadata = exactJson(metadataPath, "publication metadata");
  if (typeof metadata.title !== "string" || !metadata.title.trim() || typeof metadata.description !== "string") throw new TypeError("publication metadata is not an exact YouTube description");
  const observedDigests = { productionPlan: digest(plan), artifactManifest: digest(artifact), metadata: digest(metadata), video: artifact.sha256 };
  if (committed && Object.entries(COMMITTED_DIGESTS).some(([name, value]) => observedDigests[name] !== value)) throw new TypeError("legacy bootstrap evidence conflicts with its committed digest anchor");
  return Object.freeze({ courseId: COURSE_ID, courseRevision: 1, lessonId: LESSON_ID, sequence: 1, youtubeVideoId: plan.firstScheduledRelease.youtubeVideoId, plannedPublishAt: exactInstant(plan.intendedReleaseAt, "planned publishAt"), productionPlanDigest: observedDigests.productionPlan, artifactManifestDigest: observedDigests.artifactManifest, videoSha256: observedDigests.video, metadataDigest: observedDigests.metadata, expectedTitle: metadata.title });
}

function operationFor(evidence) {
  const body = { type: "LegacyBootstrapPublicationAdmissionOperation", channel: ACTOR, youtubeChannelId: channelIdentity().youtubeChannelId, generation: 1, previousAdmission: null, courseId: evidence.courseId, courseRevision: evidence.courseRevision, lessonId: evidence.lessonId, sequence: evidence.sequence, youtubeVideoId: evidence.youtubeVideoId, plannedPublishAt: evidence.plannedPublishAt, productionPlanDigest: evidence.productionPlanDigest, artifactManifestDigest: evidence.artifactManifestDigest, videoSha256: evidence.videoSha256, metadataDigest: evidence.metadataDigest };
  return Object.freeze({ id: contentId(body), ...body });
}

export function planLegacyBootstrapPublication(paths = {}) {
  const evidence = loadLegacyBootstrapEvidence(paths);
  const operation = operationFor(evidence);
  return Object.freeze({
    type: "LegacyBootstrapPublicationAdmissionPlan",
    operation,
    confirmation: operation.id,
    disposition: "planned-no-observation-no-append",
    requiredObservation: "YouTube Data API GET channels.list + videos.list",
    externalEffects: [],
  });
}

export function youtubeReadCapability(capability) {
  if (typeof capability !== "function") throw new TypeError("legacy bootstrap admission requires a GET-only YouTube capability");
  return async (url, init = {}) => { const method = String(init.method ?? "GET").toUpperCase(); if (method !== "GET") throw new TypeError("legacy bootstrap admission forbids YouTube writes"); return capability(url, { ...init, method: "GET" }); };
}

async function observeExactPublication(operation, expectedTitle, options) {
  const capability = youtubeReadCapability(options.authorizedFetch), channel = await observeAuthorizedChannel({ authorizedFetch: capability });
  if (channel.id !== operation.youtubeChannelId) throw new TypeError("legacy bootstrap observation resolved a foreign channel");
  const video = await observeVideo({ authorizedFetch: capability, videoId: operation.youtubeVideoId });
  if (video.videoId !== operation.youtubeVideoId) throw new TypeError("legacy bootstrap observation resolved a foreign video");
  if (video.channelId !== operation.youtubeChannelId) throw new TypeError("legacy bootstrap video belongs to a foreign channel");
  if (video.title !== expectedTitle) throw new TypeError("legacy bootstrap video metadata conflicts with the admitted metadata digest");
  if (video.privacyStatus !== "public" || video.uploadStatus !== "processed" || video.processingStatus !== "succeeded") throw new TypeError("legacy bootstrap video is not observed public and processed");
  if (video.publishAt !== undefined && video.publishAt !== null && video.publishAt !== operation.plannedPublishAt) throw new TypeError("legacy bootstrap video has a foreign publishAt");
  if (exactInstant(video.publishedAt, "observed publishedAt") !== operation.plannedPublishAt) throw new TypeError("legacy bootstrap video has a foreign publishedAt");
  return Object.freeze({ method: "YouTube Data API GET channels.list + videos.list", youtubeChannelId: channel.id, youtubeVideoId: video.videoId, title: video.title, privacyStatus: video.privacyStatus, uploadStatus: video.uploadStatus, processingStatus: video.processingStatus, publishedAt: video.publishedAt });
}

function classifyAdmissions(rows, operation) {
  if (rows.some((row) => !exactId(row) || row.type !== "LegacyBootstrapPublicationAdmission" || row.channel !== ACTOR || row.generation !== 1 || row.previousAdmission !== null)) throw new TypeError("legacy bootstrap rectification journal contains a foreign or malformed admission");
  const replay = rows.filter((row) => row.operation === operation.id);
  if (replay.length > 1 || new Set(replay.map((row) => row.id)).size > 1) throw new TypeError("legacy bootstrap rectification journal contains conflicting replays");
  if (rows.length !== replay.length) throw new TypeError("legacy bootstrap rectification journal contains a conflicting admission");
  return replay[0] ?? null;
}

export async function admitLegacyBootstrapPublication(options = {}) {
  const dataRoot = resolve(options.dataRoot ?? join(NODE_ROOT, "data")), runtimeRoot = resolve(options.runtimeRoot ?? join(dataRoot, "runtime/legacy-bootstrap-admission-locks"));
  const evidence = loadLegacyBootstrapEvidence(options.paths ?? {}), operation = operationFor(evidence);
  const prior = classifyAdmissions(await querySettlementRecords(LEGACY_BOOTSTRAP_PUBLICATION_ADMISSION_CATEGORY, { root: dataRoot }), operation);
  if (prior) return prior;
  if ((await querySettlementRecords(UPLOAD_CATEGORY, { root: dataRoot })).length) throw new TypeError("legacy bootstrap rectification refuses an existing scheduled-upload bridge receipt");
  const at = exactInstant(options.at ?? new Date().toISOString(), "observation time"), observation = await observeExactPublication(operation, evidence.expectedTitle, options);
  const proposed = Object.freeze({ operation, observation, disposition: "dry-run-no-append", observedAt: at });
  if (options.append !== true) return proposed;
  if (options.confirmation !== operation.id) throw new TypeError("legacy bootstrap append requires the exact admission operation id");
  mkdirSync(runtimeRoot, { recursive: true });
  const lock = join(runtimeRoot, operation.id.replace(/[^A-Za-z0-9_-]/gu, "_"));
  try { mkdirSync(lock); } catch (error) { if (error?.code === "EEXIST") throw new TypeError("legacy bootstrap admission is concurrently executing"); throw error; }
  try {
    const lockedPrior = classifyAdmissions(await querySettlementRecords(LEGACY_BOOTSTRAP_PUBLICATION_ADMISSION_CATEGORY, { root: dataRoot }), operation);
    if (lockedPrior) return lockedPrior;
    if ((await querySettlementRecords(UPLOAD_CATEGORY, { root: dataRoot })).length) throw new TypeError("legacy bootstrap rectification conflicts with a scheduled-upload bridge receipt");
    const body = { type: "LegacyBootstrapPublicationAdmission", channel: ACTOR, youtubeChannelId: operation.youtubeChannelId, generation: 1, previousAdmission: null, operation: operation.id, courseId: operation.courseId, courseRevision: operation.courseRevision, lessonId: operation.lessonId, sequence: operation.sequence, youtubeVideoId: operation.youtubeVideoId, plannedPublishAt: operation.plannedPublishAt, productionPlanDigest: operation.productionPlanDigest, artifactManifestDigest: operation.artifactManifestDigest, videoSha256: operation.videoSha256, metadataDigest: operation.metadataDigest, venueObservation: observation, publicUrl: `https://www.youtube.com/watch?v=${operation.youtubeVideoId}`, authorityWithheld: ["scheduled-upload-receipt", "upload-effect-claim", "schedule-effect-claim", "historical-observation-time", "youtube-write"], admittedAt: at };
    const admission = Object.freeze({ id: contentId(body), ...body }), store = createSettlementStore({ settlementRoot: dataRoot, agentUrl: options.witnessJournalAgentUrl ?? process.env.WITNESS_JOURNAL_RDF_AGENT });
    await store.record({ category: LEGACY_BOOTSTRAP_PUBLICATION_ADMISSION_CATEGORY, recordedAt: at, record: { ...admission } });
    return admission;
  } finally { rmSync(lock, { recursive: true, force: true }); }
}

export async function main(argv = process.argv.slice(2)) {
  const value = (flag) => { const index = argv.indexOf(flag); return index < 0 ? undefined : argv[index + 1]; };
  const paths = {
    productionPlanPath: value("--production-plan"),
    artifactPath: value("--artifact-manifest"),
    videoPath: value("--video"),
    metadataPath: value("--metadata"),
  };
  for (const key of Object.keys(paths)) if (paths[key] === undefined) delete paths[key];
  const mode = process.env.EMSWEB_LEGACY_BOOTSTRAP_MODE;
  if (mode !== undefined && !new Set(["plan", "apply"]).has(mode)) throw new TypeError("legacy bootstrap mode must be plan or apply");
  if (argv.includes("--plan") || mode === "plan") {
    if (argv.includes("--append") || value("--confirm-operation") !== undefined || process.env.EMSWEB_OPERATION_CONFIRMATION !== undefined) throw new TypeError("legacy bootstrap plan forbids append authority");
    process.stdout.write(`${JSON.stringify(planLegacyBootstrapPublication(paths), null, 2)}\n`);
    return;
  }
  const append = argv.includes("--append") || mode === "apply", env = loadEnvironment(), token = await refreshAccessToken({ clientId: env.YOUTUBE_OAUTH_CLIENT_ID, clientSecret: env.YOUTUBE_OAUTH_CLIENT_SECRET, refreshToken: env[REFRESH_TOKEN_ENV] });
  const result = await admitLegacyBootstrapPublication({ append, confirmation: value("--confirm-operation") ?? process.env.EMSWEB_OPERATION_CONFIRMATION, dataRoot: value("--data-root"), runtimeRoot: value("--runtime-root"), paths, authorizedFetch: authorizedFetch(token) });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}
if (process.argv[1] === fileURLToPath(import.meta.url)) await main().catch((error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 2; });
