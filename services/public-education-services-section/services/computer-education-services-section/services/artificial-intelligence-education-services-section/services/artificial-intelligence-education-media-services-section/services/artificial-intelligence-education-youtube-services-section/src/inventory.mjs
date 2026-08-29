import { mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { createRecordJournal, queryJournalRecords, recordJournalRecord } from "./record-journal.mjs";
import { addressChannelPortfolioRecord } from "./channel-portfolio-status.mjs";
import { ACTOR, NODE_ROOT, channelIdentity, contentId, digest } from "./channel.mjs";
import { releaseTarget } from "./cadence.mjs";

export const CURRICULUM = "urn:ame:artificial-intelligence-curriculum-enterprise";
export const NOTEBOOK = "urn:ame:artificial-intelligence-persistent-notebook-enterprise";
export const NOTEBOOK_LM = "urn:ame:notebooklm-inference-team";
export const VIDEO_CAPACITY_ALLOCATION = "ai-history-frontiers-alternating";
export const INVENTORY_CATEGORY = "artificial-intelligence-youtube.explainer-inventory-admission";

function exactId(value) { if (!value || typeof value !== "object") return false; const { id, ...body } = value; return id === contentId(body); }
function validLesson(value) {
  return exactId(value) && value.type === "ArtificialIntelligenceLessonProductAdmission" && value.provider === CURRICULUM &&
    typeof value.courseId === "string" && Number.isInteger(value.courseRevision) && typeof value.lessonId === "string" && Number.isInteger(value.sequence) &&
    Array.isArray(value.prerequisites) && /^sha256:[a-f0-9]{64}$/u.test(value.courseDigest ?? "") && /^sha256:[a-f0-9]{64}$/u.test(value.sourceCorpusDigest ?? "") &&
    typeof value.researchProduct === "string" && typeof value.researchSettlementReceipt === "string" && value.researchSettlementStatus === "settled" &&
    Number.isFinite(Date.parse(value.observedThrough ?? "")) && Number.isFinite(Date.parse(value.expiresAt ?? "")) && Date.parse(value.expiresAt) > Date.parse(value.observedThrough) &&
    Array.isArray(value.reuseGrant) && value.reuseGrant.includes("notebooklm-transformation") && value.reuseGrant.includes("public-youtube-release") &&
    typeof value.sourcePacket === "string" && typeof value.correctionIdentity === "string" && value.notebookPromptDigest === digest(value.notebookPrompt) &&
    Array.isArray(value.authorityWithheld) && value.authorityWithheld.includes("youtube-channel-authority") && value.authorityWithheld.includes("upload-schedule-or-publication-authority");
}
async function record(category, value, options = {}) {
  const at = options.at ?? new Date().toISOString(), row = { ...value };
  const store = createRecordJournal({ root: resolve(options.dataRoot ?? join(NODE_ROOT, "data")) });
  return store.record({ category, recordedAt: at, record: row });
}

export function formExplainerOrder(lesson, orderedAt = new Date().toISOString()) {
  if (!validLesson(lesson)) throw new TypeError("AI explainer order requires one settled reusable curriculum lesson product");
  const object = { type: "ArtificialIntelligenceExplainerOrder", customer: ACTOR, curriculumProduct: lesson.id, courseId: lesson.courseId, courseRevision: lesson.courseRevision, lessonId: lesson.lessonId, researchProduct: lesson.researchProduct, researchSettlementReceipt: lesson.researchSettlementReceipt, sourcePacket: lesson.sourcePacket, notebookPrompt: lesson.notebookPrompt, notebookPromptDigest: lesson.notebookPromptDigest, videoFormat: "explainer", videoCapacityAllocation: VIDEO_CAPACITY_ALLOCATION };
  const body = { type: "Offer", actor: ACTOR, object, published: orderedAt }; return { id: contentId(body), ...body };
}

export async function admitExplainerInventory({ order, curriculumDelivery, notebookDelivery } = {}, options = {}) {
  const lesson = curriculumDelivery?.object, delivery = notebookDelivery?.object;
  if (!exactId(order) || order.type !== "Offer" || order.actor !== ACTOR || order.object?.type !== "ArtificialIntelligenceExplainerOrder") throw new TypeError("AI inventory requires the channel's exact explainer order");
  if (!exactId(curriculumDelivery) || curriculumDelivery.type !== "Accept" || curriculumDelivery.actor !== CURRICULUM || !validLesson(lesson) || order.object.curriculumProduct !== lesson.id) throw new TypeError("AI inventory requires the curriculum provider's exact lesson delivery");
  if (!exactId(notebookDelivery) || notebookDelivery.type !== "Accept" || notebookDelivery.actor !== NOTEBOOK || delivery?.type !== "ArtificialIntelligencePersistentNotebookExplainerDelivery") throw new TypeError("AI inventory requires its dedicated notebook delivery");
  if (typeof options.verifyDelivery !== "function" || (await options.verifyDelivery("curriculum", curriculumDelivery)) !== true || (await options.verifyDelivery("persistent-notebook", notebookDelivery)) !== true) throw new TypeError("AI inventory lacks authenticated supplier delivery evidence");
  const demand = delivery.demand, video = delivery.videoAdmission, capacity = delivery.videoOverviewCapacityReceipt;
  if (!exactId(demand) || demand.type !== "PersistentNotebookVideoDemand" || demand.customer !== ACTOR || demand.provider !== NOTEBOOK_LM || demand.providerRequest?.videoFormat !== "explainer" || demand.providerRequest?.videoCapacityCustomer !== ACTOR || demand.providerRequest?.videoCapacityAllocation !== VIDEO_CAPACITY_ALLOCATION) throw new TypeError("AI notebook demand is not the exact channel explainer demand");
  if (demand.providerRequest.prompt !== lesson.notebookPrompt || lesson.notebookPromptDigest !== digest(demand.providerRequest.prompt)) throw new TypeError("AI notebook demand does not preserve the curriculum prompt");
  if (!exactId(video) || video.type !== "PersistentNotebookVideoArtifactAdmission" || video.demand !== demand.id || video.videoFormat !== "explainer" || video.mediaType !== "video/mp4" || video.provider !== NOTEBOOK_LM || video.videoOverviewCapacityReceipt !== capacity?.id) throw new TypeError("AI video admission does not bind the explainer demand and total capacity");
  if (!exactId(capacity) || capacity.type !== "NotebookLMVideoOverviewCapacityReceipt" || capacity.provider !== NOTEBOOK_LM || capacity.customer !== ACTOR || capacity.allocation !== VIDEO_CAPACITY_ALLOCATION || capacity.format !== "explainer" || capacity.timezone !== "America/Chicago" || capacity.disposition !== "spent" || releaseTarget(capacity.civilDay) !== 1) throw new TypeError("AI capacity receipt is not spent eligible alternating capacity");
  if (capacity.requestDigest !== demand.providerRequestDigest) throw new TypeError("AI capacity receipt does not bind the notebook request");
  if (Date.parse(lesson.expiresAt) <= Date.parse(options.at ?? new Date().toISOString())) throw new TypeError("AI research product is stale at inventory admission");
  const dataRoot = resolve(options.dataRoot ?? join(NODE_ROOT, "data")), runtimeRoot = resolve(options.runtimeRoot ?? join(NODE_ROOT, "content/runtime/inventory-locks")); mkdirSync(runtimeRoot, { recursive: true }); const lock = join(runtimeRoot, "inventory");
  try { mkdirSync(lock); } catch (error) { if (error?.code === "EEXIST") throw new TypeError("AI inventory is concurrently admitting"); throw error; }
  try {
    const rows = await queryJournalRecords(INVENTORY_CATEGORY, { root: dataRoot });
    if (rows.some((row) => row.curriculumProduct === lesson.id || row.notebookVideoAdmission === video.id || row.videoOverviewCapacityReceipt === capacity.id)) throw new TypeError("AI supplier product, artifact, or capacity is already booked");
    if (rows.some((row) => row.capacityCivilDay === capacity.civilDay)) throw new TypeError("AI eligible generation civil day already has inventory");
    const body = { type: "ArtificialIntelligenceExplainerInventoryAdmission", channel: ACTOR, order: order.id, courseId: lesson.courseId, courseRevision: lesson.courseRevision, courseDigest: lesson.courseDigest, lessonId: lesson.lessonId, sequence: lesson.sequence, prerequisites: [...lesson.prerequisites], curriculumProduct: lesson.id, researchProduct: lesson.researchProduct, researchSettlementReceipt: lesson.researchSettlementReceipt, sourcePacket: lesson.sourcePacket, correctionIdentity: lesson.correctionIdentity, notebookDemand: demand.id, notebookVideoAdmission: video.id, videoOverviewCapacityReceipt: capacity.id, capacityCivilDay: capacity.civilDay, videoSha256: video.sha256, admittedAt: options.at ?? new Date().toISOString() };
    const admission = { id: contentId(body), ...body }; await record(INVENTORY_CATEGORY, admission, options); return admission;
  } finally { rmSync(lock, { recursive: true, force: true }); }
}

export function formPortfolioStatus(
  { civilDay, dataRoot = join(NODE_ROOT, "data"), reportedAt = new Date().toISOString() } = {}
) {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(civilDay ?? "") || !Number.isFinite(Date.parse(reportedAt))) throw new TypeError("AI portfolio status requires civil day and report instant");
  const root = resolve(dataRoot), identity = channelIdentity(), inventory = queryJournalRecords(INVENTORY_CATEGORY, { root }), claims = queryJournalRecords("artificial-intelligence-youtube.alternating-release-claim", { root }), publications = queryJournalRecords("artificial-intelligence-youtube.publication-receipt", { root });
  const generationAdmissions = inventory.map((row) => ({ id: row.id, civilDay: row.capacityCivilDay, format: "explainer", artifact: row.notebookVideoAdmission, admittedAt: row.admittedAt }));
  const releaseClaims = claims.map((row) => ({ id: row.id, civilDay: row.civilDay, inventory: row.inventoryAdmission, plannedPublishAt: row.plannedPublishAt })), claimDay = new Map(releaseClaims.map((row) => [row.inventory, row.civilDay]));
  const publicationReceipts = publications.filter((row) => typeof row.publicUrl === "string" && Number.isFinite(Date.parse(row.publishedAt))).map((row) => ({ id: row.id, civilDay: row.civilDay, releaseClaim: row.releaseClaim, inventory: row.inventoryAdmission, venueEvidence: row.venueEvidence, publicUrl: row.publicUrl, publishedAt: row.publishedAt }));
  const body = { type: "ChannelPortfolioStatus", channel: ACTOR, youtubeChannelId: identity.youtubeChannelId, youtubeHandle: identity.youtubeHandle, line: "artificial-intelligence-history-and-frontiers", format: "explainer", civilDay, timezone: "America/Chicago", generationAdmissions, releaseClaims, publicationReceipts, privateDraftReceipts: [], inventory: inventory.map((row) => ({ id: row.id, sourceGenerationAdmission: row.id, artifact: row.notebookVideoAdmission, generatedCivilDay: row.capacityCivilDay, admittedAt: row.admittedAt, releaseEligible: "held", releaseClaimCivilDay: claimDay.get(row.id) ?? null })), reportedAt };
  return addressChannelPortfolioRecord(body);
}
