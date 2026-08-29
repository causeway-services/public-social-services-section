import { createHash } from "node:crypto";
import { mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { createSettlementStore, querySettlementRecords, recordSettlementRecord } from "./journal-client.mjs";
import { buildVideoInsertBody, observeAuthorizedChannel, observeVideo, setThumbnail, uploadVideo, YOUTUBE_PROTOCOL_LAW } from "@red-cup-engineering/youtube-services-section";
import { ACTOR, NODE_ROOT, contentId, digest } from "./channel.mjs";

const INTENT_CATEGORY = "mathematics-youtube.scheduled-publication-operation";
const UPLOAD_CATEGORY = "mathematics-youtube.scheduled-video-upload";
export const SCHEDULE_CATEGORY = "mathematics-youtube.scheduled-publication-receipt";
const OBSERVATION_CATEGORY = "mathematics-youtube.publication-observation";
export const PUBLICATION_CATEGORY = "mathematics-youtube.publication-receipt";

function exactId(value) { if (!value || typeof value !== "object") return false; const { id, ...body } = value; return id === contentId(body); }
function bytesDigest(bytes) { if (!(bytes instanceof Uint8Array)) throw new TypeError("publication requires materialized video bytes"); return `sha256:${createHash("sha256").update(bytes).digest("hex")}`; }
async function record(category, value, options) {
  const row = { ...value };
  if (options.settlement) await recordSettlementRecord({ agentUrl: options.witnessJournalAgentUrl ?? process.env.WITNESS_JOURNAL_RDF_AGENT, settlement: options.settlement, actor: ACTOR, category, recordedAt: options.at, record: row, dataRoot: options.dataRoot });
  else { const store = createSettlementStore({ dataRoot: options.dataRoot, agentUrl: options.witnessJournalAgentUrl ?? process.env.WITNESS_JOURNAL_RDF_AGENT }); await store.record({ category, recordedAt: options.at, record: row }); }
}

export async function schedulePublicRelease({ releaseClaim, inventoryAdmission, videoBytes, metadata, thumbnailBytes, thumbnailMediaType = "image/png" } = {}, options = {}) {
  if (options.activation?.youtubeWrites !== "granted") throw new TypeError("mathematics scheduled publication requires full public-write activation");
  const expectedChannelId = options.expectedChannelId;
  if (!/^UC[A-Za-z0-9_-]{20,}$/u.test(expectedChannelId ?? "") || typeof options.authorizedFetch !== "function") throw new TypeError("scheduled publication requires exact channel identity and authorized capability");
  if (!exactId(inventoryAdmission) || inventoryAdmission.type !== "MathematicsCinematicInventoryAdmission" || inventoryAdmission.channel !== ACTOR) throw new TypeError("scheduled publication requires exact mathematics inventory");
  if (!exactId(releaseClaim) || releaseClaim.type !== "MathematicsDailyReleaseClaim" || releaseClaim.channel !== ACTOR || releaseClaim.inventoryAdmission !== inventoryAdmission.id || releaseClaim.status !== "planned-not-published") throw new TypeError("scheduled publication requires the exact mathematics claim");
  const videoSha256 = bytesDigest(videoBytes); if (videoSha256 !== inventoryAdmission.videoSha256) throw new TypeError("scheduled bytes differ from mathematics inventory");
  if (!metadata || typeof metadata.title !== "string" || typeof metadata.description !== "string") throw new TypeError("scheduled publication requires metadata");
  const at = options.at ?? new Date().toISOString(), publishAt = new Date(releaseClaim.plannedPublishAt).toISOString();
  if (!Number.isFinite(Date.parse(publishAt)) || Date.parse(publishAt) <= Date.parse(at)) throw new TypeError("scheduled publication requires a future claim publishAt");
  const thumbnailSha256 = thumbnailBytes === undefined ? null : bytesDigest(thumbnailBytes);
  const observed = await observeAuthorizedChannel({ authorizedFetch: options.authorizedFetch }); if (observed.id !== expectedChannelId) throw new TypeError(`authorized YouTube identity ${observed.id} is not the mathematics channel ${expectedChannelId}`);
  const body = { type: "MathematicsScheduledPublicationOperation", channel: ACTOR, releaseClaim: releaseClaim.id, inventoryAdmission: inventoryAdmission.id, videoSha256, metadataDigest: digest(metadata), thumbnailSha256, expectedChannelId, publishAt, publishMode: "scheduled-public", protocolLaw: YOUTUBE_PROTOCOL_LAW.id };
  const operation = { id: contentId(body), ...body }, dataRoot = resolve(options.dataRoot ?? join(NODE_ROOT, "data"));
  if (!(await querySettlementRecords("mathematics-youtube.cinematic-inventory-admission", { dataRoot })).some((row) => row.id === inventoryAdmission.id) || !(await querySettlementRecords("mathematics-youtube.daily-release-claim", { dataRoot })).some((row) => row.id === releaseClaim.id)) throw new TypeError("scheduled mathematics authority is not witnessed");
  const runtimeRoot = resolve(options.runtimeRoot ?? join(dataRoot, "runtime/scheduled-publication-locks")); mkdirSync(runtimeRoot, { recursive: true }); const lock = join(runtimeRoot, operation.id.replace(/[^A-Za-z0-9._-]/gu, "_"));
  try { mkdirSync(lock); } catch (error) { if (error?.code === "EEXIST") throw new TypeError("scheduled mathematics publication is concurrently executing"); throw error; }
  try {
    const completed = (await querySettlementRecords(SCHEDULE_CATEGORY, { dataRoot })).find((row) => row.operation === operation.id); if (completed) return completed;
    let uploaded = (await querySettlementRecords(UPLOAD_CATEGORY, { dataRoot })).find((row) => row.operation === operation.id);
    if ((await querySettlementRecords(INTENT_CATEGORY, { dataRoot })).some((row) => row.operation?.id === operation.id) && !uploaded) throw new TypeError("scheduled mathematics publication has ambiguous prior effect intent; re-upload is refused");
    const recordOptions = { ...options, dataRoot, at };
    if (!uploaded) {
      const intentBody = { type: "MathematicsScheduledPublicationEffectIntent", operation, observedChannelId: observed.id, status: "effect-intent-recorded", startedAt: at }; await record(INTENT_CATEGORY, { id: contentId(intentBody), ...intentBody }, recordOptions);
      const insert = buildVideoInsertBody({ metadata, publishMode: "scheduled-public", plannedPublishAt: publishAt, categoryId: options.categoryId ?? "27", selfDeclaredMadeForKids: false, containsSyntheticMedia: true });
      const venue = await uploadVideo({ authorizedFetch: options.authorizedFetch, uploadFetch: options.uploadFetch, bytes: videoBytes, body: insert });
      const uploadBody = { type: "MathematicsScheduledVideoUpload", operation: operation.id, channel: ACTOR, youtubeChannelId: observed.id, youtubeVideoId: venue.videoId, privacyStatus: "private", publishAt, uploadResponse: venue.response, uploadedAt: at }; uploaded = { id: contentId(uploadBody), ...uploadBody }; await record(UPLOAD_CATEGORY, uploaded, recordOptions);
    }
    let thumbnailResponse = null; if (thumbnailBytes !== undefined) thumbnailResponse = await setThumbnail({ authorizedFetch: options.authorizedFetch, videoId: uploaded.youtubeVideoId, bytes: thumbnailBytes, mediaType: thumbnailMediaType });
    const receiptBody = { type: "MathematicsScheduledPublicationReceipt", operation: operation.id, channel: ACTOR, releaseClaim: releaseClaim.id, inventoryAdmission: inventoryAdmission.id, civilDay: releaseClaim.civilDay, videoSha256, youtubeChannelId: observed.id, youtubeVideoId: uploaded.youtubeVideoId, privacyStatus: "private", publishAt, publicUrl: null, publishedAt: null, status: "scheduled-not-observed", venueEvidence: { upload: uploaded.id, thumbnailResponse }, protocolLaw: YOUTUBE_PROTOCOL_LAW.id, completedAt: at };
    const receipt = { id: contentId(receiptBody), ...receiptBody }; await record(SCHEDULE_CATEGORY, receipt, recordOptions); return receipt;
  } finally { rmSync(lock, { recursive: true, force: true }); }
}

export async function observePublicRelease({ scheduledReceipt } = {}, options = {}) {
  if (!exactId(scheduledReceipt) || scheduledReceipt.type !== "MathematicsScheduledPublicationReceipt" || scheduledReceipt.channel !== ACTOR || scheduledReceipt.status !== "scheduled-not-observed") throw new TypeError("publication observation requires one exact mathematics schedule receipt");
  if (typeof options.authorizedFetch !== "function" || options.expectedChannelId !== scheduledReceipt.youtubeChannelId) throw new TypeError("publication observation requires the scheduled channel capability");
  const dataRoot = resolve(options.dataRoot ?? join(NODE_ROOT, "data")); if (!(await querySettlementRecords(SCHEDULE_CATEGORY, { dataRoot })).some((row) => row.id === scheduledReceipt.id)) throw new TypeError("mathematics schedule receipt is not witnessed");
  const completed = (await querySettlementRecords(PUBLICATION_CATEGORY, { dataRoot })).find((row) => row.scheduledPublicationReceipt === scheduledReceipt.id); if (completed) return completed;
  const channel = await observeAuthorizedChannel({ authorizedFetch: options.authorizedFetch }); if (channel.id !== scheduledReceipt.youtubeChannelId) throw new TypeError("authorized identity differs from scheduled mathematics channel");
  const venue = await observeVideo({ authorizedFetch: options.authorizedFetch, videoId: scheduledReceipt.youtubeVideoId }); if (venue.channelId !== scheduledReceipt.youtubeChannelId) throw new TypeError("observed video belongs to a foreign channel");
  const at = options.at ?? new Date().toISOString(), afterSchedule = Date.parse(at) >= Date.parse(scheduledReceipt.publishAt), publicProcessed = venue.privacyStatus === "public" && venue.uploadStatus === "processed";
  const disposition = afterSchedule && publicProcessed ? "public-observed" : "pending";
  const observationBody = { type: "MathematicsPublicationObservation", channel: ACTOR, scheduledPublicationReceipt: scheduledReceipt.id, youtubeChannelId: venue.channelId, youtubeVideoId: venue.videoId, plannedPublishAt: scheduledReceipt.publishAt, venue, disposition, observedAt: at };
  const observation = { id: contentId(observationBody), ...observationBody }; await record(OBSERVATION_CATEGORY, observation, { ...options, dataRoot, at });
  if (disposition === "pending") return { type: "MathematicsPublicationPending", scheduledPublicationReceipt: scheduledReceipt.id, observation: observation.id, status: "pending", publicUrl: null, publishedAt: null, retryAfterSeconds: 300 };
  if (!Number.isFinite(Date.parse(venue.publishedAt ?? ""))) throw new TypeError("public mathematics venue state has no finite publishedAt");
  const receiptBody = { type: "MathematicsPublicPublicationReceipt", channel: ACTOR, scheduledPublicationReceipt: scheduledReceipt.id, releaseClaim: scheduledReceipt.releaseClaim, inventoryAdmission: scheduledReceipt.inventoryAdmission, civilDay: scheduledReceipt.civilDay, youtubeChannelId: venue.channelId, youtubeVideoId: venue.videoId, privacyStatus: "public", publicUrl: `https://www.youtube.com/watch?v=${venue.videoId}`, publishedAt: venue.publishedAt, plannedPublishAt: scheduledReceipt.publishAt, venueEvidence: observation.id, protocolLaw: YOUTUBE_PROTOCOL_LAW.id, observedAt: at };
  const receipt = { id: contentId(receiptBody), ...receiptBody }; await record(PUBLICATION_CATEGORY, receipt, { ...options, dataRoot, at }); return receipt;
}
