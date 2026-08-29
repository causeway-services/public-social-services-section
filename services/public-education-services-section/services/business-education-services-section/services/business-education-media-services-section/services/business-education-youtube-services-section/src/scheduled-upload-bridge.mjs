#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, lstatSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createSettlementStore, querySettlementRecords } from "./record-journal.mjs";
import { buildVideoInsertBody, observeAuthorizedChannel, observeVideo, uploadVideo } from "@red-cup-engineering/youtube-services-section";
import { ACTOR, NODE_ROOT, channelIdentity, contentId, digest } from "./channel.mjs";
import { releaseTarget } from "./cadence.mjs";
import { authorizedFetch, loadEnvironment, refreshAccessToken } from "./private-draft-pilot.mjs";
import { REFRESH_TOKEN_ENV } from "./oauth-setup.mjs";

const INTENT_CATEGORY = "modern-business-youtube.scheduled-upload-bridge-intent";
export const UPLOAD_CATEGORY = "modern-business-youtube.scheduled-upload-bridge-receipt";
export const OBSERVATION_CATEGORY = "modern-business-youtube.scheduled-upload-bridge-observation";
export const PUBLICATION_CATEGORY = "modern-business-youtube.scheduled-upload-bridge-publication-receipt";
function sha(bytes) { return `sha256:${createHash("sha256").update(bytes).digest("hex")}`; }
function exactFile(path, maximum, label) { const target = resolve(path), stat = lstatSync(target); if (stat.isSymbolicLink() || !stat.isFile() || stat.size < 1 || stat.size > maximum) throw new TypeError(`${label} must be an exact bounded regular file`); return readFileSync(target); }
function exactJson(path, label) { try { return JSON.parse(exactFile(path, 1_000_000, label).toString("utf8")); } catch { throw new TypeError(`${label} must be exact JSON`); } }
function civilDayAt(instant) { const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(instant)); const value = (type) => parts.find((part) => part.type === type)?.value; return `${value("year")}-${value("month")}-${value("day")}`; }
function operationFor(videoBytes, metadata, publishAt) { const body = { type: "ModernBusinessScheduledUploadBridgeOperation", channel: ACTOR, youtubeChannelId: channelIdentity().youtubeChannelId, videoSha256: sha(videoBytes), metadataDigest: digest(metadata), publishAt, publishMode: "scheduled-public", containsSyntheticMedia: true }; return { id: contentId(body), ...body }; }
async function record(store, category, at, value) { await store.record({ category, recordedAt: at, record: { ...value } }); }

export function planScheduledUpload({ videoBytes, metadata, publishAt, now = new Date().toISOString() }) {
  if (!(videoBytes instanceof Uint8Array) || videoBytes.byteLength < 12 || Buffer.from(videoBytes).subarray(4, 8).toString("ascii") !== "ftyp") throw new TypeError("scheduled bridge requires one MP4 carrier");
  if (!metadata || typeof metadata.title !== "string" || !metadata.title.trim() || typeof metadata.description !== "string") throw new TypeError("scheduled bridge requires title and description");
  if (!Number.isFinite(Date.parse(publishAt ?? "")) || Date.parse(publishAt) <= Date.parse(now)) throw new TypeError("scheduled bridge requires a future publishAt");
  const exactPublishAt = new Date(publishAt).toISOString(), civilDay = civilDayAt(exactPublishAt);
  if (releaseTarget(civilDay) !== 1) throw new TypeError("scheduled bridge publishAt is outside the Tuesday Thursday Saturday cadence");
  return { ...operationFor(videoBytes, metadata, exactPublishAt), civilDay, disposition: "dry-run-no-effect" };
}

export async function executeScheduledUpload({ videoBytes, metadata, publishAt }, options = {}) {
  const operation = planScheduledUpload({ videoBytes, metadata, publishAt, now: options.at });
  if (options.execute !== true) return operation;
  if (options.operationId !== operation.id) throw new TypeError("live scheduled bridge requires exact --operation-id");
  if (options.activation?.youtubeWrites !== "granted") throw new TypeError("scheduled bridge requires full YouTube-write activation");
  const dataRoot = resolve(options.dataRoot), at = options.at ?? new Date().toISOString();
  const store = createSettlementStore({ settlementRoot: dataRoot, agentUrl: options.witnessJournalAgentUrl });
  const completed = (await querySettlementRecords(UPLOAD_CATEGORY,{root:dataRoot})).find((row) => row.operation === operation.id);
  if (completed) return observeScheduledUpload(completed, { ...options, dataRoot, at });
  const runtimeRoot = resolve(options.runtimeRoot), lock = join(runtimeRoot, operation.id.slice(11)); mkdirSync(runtimeRoot, { recursive: true });
  try { mkdirSync(lock); } catch (error) { if (error?.code === "EEXIST") throw new TypeError("scheduled upload is concurrently executing"); throw error; }
  try {
    if ((await querySettlementRecords(INTENT_CATEGORY,{root:dataRoot})).some((row) => row.operation?.id === operation.id)) throw new TypeError("scheduled upload has ambiguous prior effect intent");
    const channel = await observeAuthorizedChannel({ authorizedFetch: options.authorizedFetch });
    if (channel.id !== operation.youtubeChannelId) throw new TypeError(`authorized ${channel.id}, not Modern Business ${operation.youtubeChannelId}`);
    const intentBody = { type: "ModernBusinessScheduledUploadBridgeEffectIntent", operation, status: "effect-intent-recorded", startedAt: at };
    await record(store, INTENT_CATEGORY, at, { id: contentId(intentBody), ...intentBody });
    const venue = await uploadVideo({ authorizedFetch: options.authorizedFetch, uploadFetch: options.uploadFetch, bytes: videoBytes, body: buildVideoInsertBody({ metadata, publishMode: "scheduled-public", plannedPublishAt: operation.publishAt, containsSyntheticMedia: true, selfDeclaredMadeForKids: false }) });
    const body = { type: "ModernBusinessScheduledUploadBridgeReceipt", operation: operation.id, channel: ACTOR, youtubeChannelId: channel.id, youtubeVideoId: venue.videoId, videoSha256: operation.videoSha256, metadataDigest: operation.metadataDigest, privacyStatus: "private", publishAt: operation.publishAt, publicUrl: null, status: "scheduled-not-observed", protocolLaw: "youtube-services-section.1.2", venueResponse: venue.response, completedAt: at };
    const receipt = { id: contentId(body), ...body }; await record(store, UPLOAD_CATEGORY, at, receipt);
    return observeScheduledUpload(receipt, { ...options, dataRoot, at });
  } finally { rmSync(lock, { recursive: true, force: true }); }
}

export async function observeScheduledUpload(receipt, options = {}) {
  const dataRoot = resolve(options.dataRoot);
  const completed = (await querySettlementRecords(PUBLICATION_CATEGORY,{root:dataRoot})).find((row) => row.scheduledUploadReceipt === receipt.id); if (completed) return completed;
  if (!(await querySettlementRecords(UPLOAD_CATEGORY,{root:dataRoot})).some((row) => row.id === receipt.id)) throw new TypeError("bridge observation requires a witnessed scheduled upload receipt");
  const venue = await observeVideo({ authorizedFetch: options.authorizedFetch, videoId: receipt.youtubeVideoId });
  if (venue.channelId !== receipt.youtubeChannelId) throw new TypeError("scheduled video observation resolved a foreign channel");
  const at = options.at ?? new Date().toISOString(), retained = venue.publishAt === receipt.publishAt;
  const publicProcessed = Date.parse(at) >= Date.parse(receipt.publishAt) && venue.privacyStatus === "public" && venue.uploadStatus === "processed";
  const disposition = publicProcessed ? "public-observed" : retained ? "schedule-retained" : "publication-lock-observed";
  const body = { type: "ModernBusinessScheduledUploadBridgeObservation", channel: ACTOR, scheduledUploadReceipt: receipt.id, youtubeChannelId: venue.channelId, youtubeVideoId: venue.videoId, title: venue.title, requestedPublishAt: receipt.publishAt, observedPublishAt: venue.publishAt, privacyStatus: venue.privacyStatus, uploadStatus: venue.uploadStatus, processingStatus: venue.processingStatus, disposition, publicUrl: publicProcessed ? `https://www.youtube.com/watch?v=${venue.videoId}` : null, observedAt: at };
  const observation = { id: contentId(body), ...body }, store = createSettlementStore({ settlementRoot: dataRoot, agentUrl: options.witnessJournalAgentUrl }); await record(store, OBSERVATION_CATEGORY, at, observation);
  if (!publicProcessed) return observation;
  if (!Number.isFinite(Date.parse(venue.publishedAt ?? ""))) throw new TypeError("public bridge venue state has no finite publishedAt");
  const publicationBody = { type: "ModernBusinessScheduledUploadBridgePublicationReceipt", channel: ACTOR, scheduledUploadReceipt: receipt.id, civilDay: civilDayAt(receipt.publishAt), youtubeChannelId: venue.channelId, youtubeVideoId: venue.videoId, privacyStatus: "public", publicUrl: body.publicUrl, publishedAt: venue.publishedAt, plannedPublishAt: receipt.publishAt, venueEvidence: observation.id, protocolLaw: "youtube-services-section.1.2", observedAt: at };
  const publication = { id: contentId(publicationBody), ...publicationBody }; await record(store, PUBLICATION_CATEGORY, at, publication); return publication;
}

export async function main(argv = process.argv.slice(2)) { const value = (flag) => { const index = argv.indexOf(flag); return index < 0 ? undefined : argv[index + 1]; }, videoBytes = exactFile(value("--video"), 8_000_000_000, "video"), metadata = exactJson(value("--metadata"), "metadata"), publishAt = value("--publish-at"), execute = argv.includes("--execute-scheduled"), options = { execute, operationId: value("--operation-id"), dataRoot: value("--data-root"), runtimeRoot: value("--runtime-root") }; if (execute) { if (!options.operationId || !options.dataRoot || !options.runtimeRoot) throw new TypeError("live scheduled bridge requires operation, data, and runtime paths"); const env = loadEnvironment(), accessToken = await refreshAccessToken({ clientId: env.YOUTUBE_OAUTH_CLIENT_ID, clientSecret: env.YOUTUBE_OAUTH_CLIENT_SECRET, refreshToken: env[REFRESH_TOKEN_ENV] }); options.authorizedFetch = authorizedFetch(accessToken); options.witnessJournalAgentUrl = env.WITNESS_JOURNAL_RDF_AGENT ?? "http://127.0.0.1:19764/.well-known/agent-card.json"; options.activation = exactJson(join(NODE_ROOT, "content/config/activation.json"), "activation"); }
  process.stdout.write(`${JSON.stringify(await executeScheduledUpload({ videoBytes, metadata, publishAt }, options), null, 2)}\n`); }
if (process.argv[1] === fileURLToPath(import.meta.url)) await main().catch((error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 2; });
