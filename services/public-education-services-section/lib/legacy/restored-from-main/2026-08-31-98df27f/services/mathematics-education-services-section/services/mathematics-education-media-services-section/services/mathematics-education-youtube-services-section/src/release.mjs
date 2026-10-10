import { createHash } from "node:crypto";
import { mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { createSettlementStore, querySettlementRecords, recordSettlementRecord } from "./journal-client.mjs";
import { buildVideoInsertBody, observeAuthorizedChannel, setThumbnail, uploadVideo, YOUTUBE_PROTOCOL_LAW } from "@red-cup-engineering/youtube-services-section";
import { ACTOR, NODE_ROOT, contentId, digest } from "./channel.mjs";

const OPERATION_CATEGORY = "mathematics-youtube.private-publication-operation";
const UPLOAD_CATEGORY = "mathematics-youtube.private-video-upload";
const RECEIPT_CATEGORY = "mathematics-youtube.publication-receipt";

function exactId(value) {
  if (!value || typeof value !== "object") return false;
  const { id, ...body } = value;
  return id === contentId(body);
}

function bytesDigest(bytes) {
  if (!(bytes instanceof Uint8Array)) throw new TypeError("publication requires materialized video bytes");
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

async function record(category, value, options) {
  const recordValue = { ...value };
  if (options.settlement) {
    await recordSettlementRecord({
      agentUrl: options.witnessJournalAgentUrl ?? process.env.WITNESS_JOURNAL_RDF_AGENT,
      settlement: options.settlement, actor: ACTOR, category, recordedAt: options.at, record: recordValue, dataRoot: options.dataRoot,
    });
  } else {
    const store = createSettlementStore({ dataRoot: options.dataRoot, agentUrl: options.witnessJournalAgentUrl ?? process.env.WITNESS_JOURNAL_RDF_AGENT });
    await store.record({ category, recordedAt: options.at, record: recordValue });
  }
}

export async function publishPrivateDraft({ releaseClaim, inventoryAdmission, videoBytes, metadata, thumbnailBytes, thumbnailMediaType = "image/png" } = {}, options = {}) {
  const activation = options.activation;
  const expectedChannelId = options.expectedChannelId;
  if (!['granted-private-only', 'granted'].includes(activation?.youtubeWrites)) throw new TypeError("mathematics YouTube private writes are not activated");
  if (!/^UC[A-Za-z0-9_-]{20,}$/u.test(expectedChannelId ?? "")) throw new TypeError("mathematics publication requires an exact expected YouTube channel ID");
  if (typeof options.authorizedFetch !== "function") throw new TypeError("mathematics publication requires channel-owned authorizedFetch");
  if (!exactId(inventoryAdmission) || inventoryAdmission.type !== "MathematicsCinematicInventoryAdmission" || inventoryAdmission.channel !== ACTOR) throw new TypeError("publication requires exact mathematics cinematic inventory");
  if (!exactId(releaseClaim) || releaseClaim.type !== "MathematicsDailyReleaseClaim" || releaseClaim.channel !== ACTOR || releaseClaim.inventoryAdmission !== inventoryAdmission.id || releaseClaim.status !== "planned-not-published") throw new TypeError("publication requires the exact mathematics release claim");
  const videoSha256 = bytesDigest(videoBytes);
  if (videoSha256 !== inventoryAdmission.videoSha256) throw new TypeError("materialized mathematics video bytes do not match admitted inventory");
  if (!metadata || typeof metadata.title !== "string" || typeof metadata.description !== "string") throw new TypeError("publication requires exact metadata");
  const thumbnailSha256 = thumbnailBytes === undefined ? null : bytesDigest(thumbnailBytes);
  const observed = await observeAuthorizedChannel({ authorizedFetch: options.authorizedFetch });
  if (observed.id !== expectedChannelId) throw new TypeError(`authorized YouTube identity ${observed.id} is not the mathematics channel ${expectedChannelId}`);

  const operationBody = {
    type: "MathematicsPrivatePublicationOperation", channel: ACTOR, releaseClaim: releaseClaim.id,
    inventoryAdmission: inventoryAdmission.id, videoSha256, metadataDigest: digest(metadata), thumbnailSha256,
    expectedChannelId, publishMode: "private-draft", protocolLaw: YOUTUBE_PROTOCOL_LAW.id,
  };
  const operation = { id: contentId(operationBody), ...operationBody };
  const dataRoot = resolve(options.dataRoot ?? join(NODE_ROOT, "data"));
  if (!(await querySettlementRecords("mathematics-youtube.cinematic-inventory-admission", { dataRoot })).some((entry) => entry.id === inventoryAdmission.id) || !(await querySettlementRecords("mathematics-youtube.daily-release-claim", { dataRoot })).some((entry) => entry.id === releaseClaim.id)) throw new TypeError("mathematics publication authority is not witnessed in the channel ledger");
  const runtimeRoot = resolve(options.runtimeRoot ?? join(dataRoot, "runtime/publication-locks"));
  mkdirSync(runtimeRoot, { recursive: true });
  const lock = join(runtimeRoot, operation.id.replace(/[^A-Za-z0-9._-]/gu, "_"));
  try { mkdirSync(lock); } catch (error) { if (error?.code === "EEXIST") throw new TypeError("mathematics publication operation is concurrently executing"); throw error; }
  try {
    const receipts = await querySettlementRecords(RECEIPT_CATEGORY, { dataRoot });
    const completed = receipts.find((entry) => entry.operation === operation.id);
    if (completed) return completed;
    const uploads = await querySettlementRecords(UPLOAD_CATEGORY, { dataRoot });
    let uploaded = uploads.find((entry) => entry.operation === operation.id);
    const starts = await querySettlementRecords(OPERATION_CATEGORY, { dataRoot });
    if (starts.some((entry) => entry.operation?.id === operation.id) && !uploaded) throw new TypeError("mathematics publication has ambiguous prior effect intent; automatic video re-upload is refused");
    const at = options.at ?? new Date().toISOString();
    const recordOptions = { ...options, dataRoot, at };
    if (!uploaded) {
      const startBody = { type: "MathematicsPrivatePublicationEffectIntent", operation, observedChannelId: observed.id, status: "effect-intent-recorded", startedAt: at };
      await record(OPERATION_CATEGORY, { id: contentId(startBody), ...startBody }, recordOptions);
      const body = buildVideoInsertBody({ metadata, publishMode: "private-draft", categoryId: options.categoryId ?? "27", selfDeclaredMadeForKids: false, containsSyntheticMedia: true });
      const venue = await uploadVideo({ authorizedFetch: options.authorizedFetch, uploadFetch: options.uploadFetch, bytes: videoBytes, body });
      const uploadBody = { type: "MathematicsPrivateVideoUpload", operation: operation.id, channel: ACTOR, youtubeChannelId: observed.id, youtubeVideoId: venue.videoId, privacyStatus: "private", publishAt: null, uploadResponse: venue.response, uploadedAt: at };
      uploaded = { id: contentId(uploadBody), ...uploadBody };
      await record(UPLOAD_CATEGORY, uploaded, recordOptions);
    }
    let thumbnailResponse = null;
    if (thumbnailBytes !== undefined) thumbnailResponse = await setThumbnail({ authorizedFetch: options.authorizedFetch, videoId: uploaded.youtubeVideoId, bytes: thumbnailBytes, mediaType: thumbnailMediaType });
    const receiptBody = {
      type: "MathematicsPrivatePublicationReceipt", operation: operation.id, channel: ACTOR,
      releaseClaim: releaseClaim.id, inventoryAdmission: inventoryAdmission.id, civilDay: releaseClaim.civilDay,
      videoSha256, youtubeChannelId: observed.id, youtubeVideoId: uploaded.youtubeVideoId,
      privacyStatus: "private", publishAt: null, publicUrl: null, publishedAt: null,
      venueEvidence: { upload: uploaded.id, thumbnailResponse }, protocolLaw: YOUTUBE_PROTOCOL_LAW.id, completedAt: at,
    };
    const receipt = { id: contentId(receiptBody), ...receiptBody };
    await record(RECEIPT_CATEGORY, receipt, recordOptions);
    return receipt;
  } finally { rmSync(lock, { recursive: true, force: true }); }
}
