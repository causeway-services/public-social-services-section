import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { journalRecords, recordJournal } from "./journal.mjs";
import { addressChannelPortfolioRecord } from "@red-cup-engineering/a2a-channel-portfolio-status-service";
const HISTORICAL_PUBLICATION_CATEGORY = "mathematics-youtube.historical-publication-admission";
import { EMPTY_WITNESS_ROOT, identifyJsonSemanticContent } from "@red-cup-engineering/semantic-content-identify-service";
const objectKindFor = (value) => {
  const type = value?.type;
  if (typeof type !== "string" || type.length === 0) throw new TypeError("semantic content requires an explicit record type");
  if (type === "MathematicsLessonBriefAdmission") return "mathematics-curriculum.lesson-brief-admission";
  if (type === "Accept" && value.actor === "urn:ame:mathematics-curriculum-enterprise") return "mathematics-curriculum.lesson-brief-delivery";
  return `mathematics-youtube.${type.replaceAll(/([a-z0-9])([A-Z])/gu, "$1-$2").toLowerCase()}`;
};
const semanticId = (objectKind, value) => identifyJsonSemanticContent({ objectKind, value, witnessRoot: EMPTY_WITNESS_ROOT }).token;
const exactPersistentNotebookRecord = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const { id, ...body } = value;
  return id === semanticId("emsweb.persistent-notebook.record", body);
};
const address = (value, objectKind = objectKindFor(value)) => ({ id: semanticId(objectKind, value), ...value });
const exact = (value, objectKind = objectKindFor(value)) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const { id, ...body } = value;
  return id === semanticId(objectKind, body);
};

export const NODE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const ACTOR = "urn:ame:mathematics-youtube-channel-enterprise";
export const CURRICULUM = "urn:ame:mathematics-curriculum-enterprise";
export const NOTEBOOK = "urn:ame:persistent-notebook-enterprise";
export const NOTEBOOK_LM = "urn:ame:notebooklm-inference-team";

export function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().filter((key) => value[key] !== undefined).map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}
export function digest(value) { return semanticId("mathematics-youtube.semantic-digest", value); }
export function contentId(value, objectKind = undefined) { return semanticId(objectKind ?? `mathematics-youtube.${value.type.replaceAll(/([a-z0-9])([A-Z])/gu, "$1-$2").toLowerCase()}`, value); }
function exactId(value, objectKind = undefined) { return exact(value, objectKind); }
export function channelIdentity() { return JSON.parse(readFileSync(join(NODE_ROOT, "content/config/channel.json"), "utf8")); }

function validLesson(admission) {
  return exactId(admission, "mathematics-curriculum.lesson-brief-admission") && admission.type === "MathematicsLessonBriefAdmission" && admission.provider === CURRICULUM &&
    Array.isArray(admission.authorityWithheld) && admission.authorityWithheld.includes("youtube-channel-authority") &&
    admission.authorityWithheld.includes("upload-schedule-or-publication-authority") && /^ni:\/\/\/sha-256;[A-Za-z0-9_-]{43}$/u.test(admission.notebookPromptDigest ?? "") &&
    admission.notebookPromptDigest === semanticId("mathematics-curriculum.notebook-prompt", admission.notebookPrompt);
}

export function formCinematicOrder(lessonAdmission, orderedAt = new Date().toISOString()) {
  if (!validLesson(lessonAdmission)) throw new TypeError("cinematic order requires a content-valid curriculum lesson product");
  const object = {
    type: "MathematicsCinematicOrder", customer: ACTOR, curriculumProduct: lessonAdmission.id,
    courseId: lessonAdmission.courseId, courseRevision: lessonAdmission.courseRevision, lessonId: lessonAdmission.lessonId,
    sourcePacket: lessonAdmission.sourcePacket, notebookPrompt: lessonAdmission.notebookPrompt,
    notebookPromptDigest: lessonAdmission.notebookPromptDigest, videoFormat: "cinematic", cinematicAllocation: "mathematics-standing",
  };
  const body = { type: "Offer", actor: ACTOR, object, published: orderedAt };
  return { id: contentId(body), ...body };
}

function record(category, value, options = {}) {
  const at = options.at ?? new Date().toISOString();
  return recordJournal(resolve(options.dataRoot ?? NODE_ROOT), category, at, value);
}

export async function admitCinematicInventory({ order, curriculumDelivery, notebookDelivery } = {}, options = {}) {
  const lesson = curriculumDelivery?.object;
  if (!exactId(order) || order.type !== "Offer" || order.actor !== ACTOR || order.object?.type !== "MathematicsCinematicOrder") throw new TypeError("inventory admission requires the channel's content-valid order");
  if (!exactId(curriculumDelivery, "mathematics-curriculum.lesson-brief-delivery") || curriculumDelivery?.type !== "Accept" || curriculumDelivery.actor !== CURRICULUM || curriculumDelivery.target !== ACTOR || !validLesson(lesson) || order.object.curriculumProduct !== lesson.id) throw new TypeError("inventory admission requires the curriculum provider's exact lesson delivery");
  const delivery = notebookDelivery?.object;
  if (!exactId(notebookDelivery) || notebookDelivery?.type !== "Accept" || notebookDelivery.actor !== NOTEBOOK || delivery?.type !== "PersistentNotebookCinematicDelivery") throw new TypeError("inventory admission requires the persistent notebook provider's delivery");
  if (typeof options.verifyDelivery !== "function" || (await options.verifyDelivery("curriculum", curriculumDelivery)) !== true || (await options.verifyDelivery("persistent-notebook", notebookDelivery)) !== true) throw new TypeError("inventory admission lacks authenticated supplier delivery evidence");
  const demand = delivery.demand; const video = delivery.videoAdmission; const capacity = delivery.capacityReceipt;
  if (!exactPersistentNotebookRecord(demand) || demand.type !== "PersistentNotebookVideoDemand" || demand.customer !== ACTOR || demand.provider !== NOTEBOOK_LM || demand.providerRequest?.videoFormat !== "cinematic" || demand.providerRequest?.cinematicAllocation !== "mathematics-standing" || demand.providerRequest?.capacityCustomer !== ACTOR) throw new TypeError("notebook demand is not the exact channel cinematic demand");
  if (demand.providerRequest.prompt !== lesson.notebookPrompt || lesson.notebookPromptDigest !== digest(demand.providerRequest.prompt)) throw new TypeError("notebook demand does not preserve the curriculum prompt");
  if (!exactPersistentNotebookRecord(video) || video.type !== "PersistentNotebookVideoArtifactAdmission" || video.demand !== demand.id || video.videoFormat !== "cinematic" || video.mediaType !== "video/mp4" || video.provider !== NOTEBOOK_LM || video.cinematicCapacityReceipt !== capacity?.id) throw new TypeError("video admission does not bind the exact cinematic demand and capacity");
  if (!exactPersistentNotebookRecord(capacity) || capacity.type !== "NotebookLMCinematicCapacityReceipt" || capacity.provider !== NOTEBOOK_LM || capacity.customer !== ACTOR || capacity.allocation !== "mathematics-standing" || capacity.slot !== "cinematic-1" || capacity.timezone !== "America/Chicago" || capacity.disposition !== "spent" || !/^\d{4}-\d{2}-\d{2}$/u.test(capacity.civilDay ?? "")) throw new TypeError("capacity receipt is not spent mathematics standing capacity");
  if (capacity.requestDigest !== demand.providerRequestDigest) throw new TypeError("capacity receipt does not bind the notebook request");
  const dataRoot = resolve(options.dataRoot ?? join(NODE_ROOT, "data"));
  const runtimeRoot = resolve(options.runtimeRoot ?? join(dataRoot, "runtime/inventory-locks"));
  mkdirSync(runtimeRoot, { recursive: true }); const lock = join(runtimeRoot, "inventory");
  try { mkdirSync(lock); } catch (error) { if (error?.code === "EEXIST") throw new TypeError("cinematic inventory is concurrently admitting"); throw error; }
  try {
    const records = journalRecords(dataRoot, "mathematics-youtube.cinematic-inventory-admission");
    if (records.some((entry) => entry.curriculumProduct === lesson.id)) throw new TypeError("curriculum product is already booked into channel inventory");
    if (records.some((entry) => entry.notebookVideoAdmission === video.id)) throw new TypeError("notebook video is already booked into channel inventory");
    if (records.some((entry) => entry.cinematicCapacityReceipt === capacity.id)) throw new TypeError("cinematic capacity receipt is already booked into channel inventory");
    if (records.some((entry) => entry.capacityCivilDay === capacity.civilDay)) throw new TypeError("cinematic generation civil day already has channel inventory");
    const body = {
      type: "MathematicsCinematicInventoryAdmission", channel: ACTOR, order: order.id, courseId: lesson.courseId,
      courseRevision: lesson.courseRevision, courseDigest: lesson.courseDigest, lessonId: lesson.lessonId, sequence: lesson.sequence,
      prerequisites: [...lesson.prerequisites], curriculumProduct: lesson.id, sourcePacket: lesson.sourcePacket,
      notebookDemand: demand.id, notebookVideoAdmission: video.id, cinematicCapacityReceipt: capacity.id,
      capacityCivilDay: capacity.civilDay, videoSha256: video.sha256, admittedAt: options.at ?? new Date().toISOString(),
    };
    const admission = { id: contentId(body), ...body };
    await record("mathematics-youtube.cinematic-inventory-admission", admission, options);
    return admission;
  } finally { rmSync(lock, { recursive: true, force: true }); }
}

function civilDayAt(instant) {
  const date = new Date(instant); if (Number.isNaN(date.valueOf())) throw new TypeError("plannedPublishAt must be an ISO instant");
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export async function claimDailyRelease({ inventoryAdmission, civilDay, plannedPublishAt } = {}, options = {}) {
  if (!exactId(inventoryAdmission) || inventoryAdmission.type !== "MathematicsCinematicInventoryAdmission" || inventoryAdmission.channel !== ACTOR) throw new TypeError("release claim requires content-valid channel inventory");
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(civilDay ?? "") || civilDayAt(plannedPublishAt) !== civilDay) throw new TypeError("release claim civil day must match America/Chicago plannedPublishAt");
  const dataRoot = resolve(options.dataRoot ?? join(NODE_ROOT, "data"));
  const runtimeRoot = resolve(options.runtimeRoot ?? join(dataRoot, "runtime/release-locks"));
  mkdirSync(runtimeRoot, { recursive: true }); const lock = join(runtimeRoot, civilDay);
  try { mkdirSync(lock); } catch (error) { if (error?.code === "EEXIST") throw new TypeError("release civil day is concurrently claimed"); throw error; }
  try {
    const records = journalRecords(dataRoot, "mathematics-youtube.daily-release-claim");
    if (records.some((entry) => entry.civilDay === civilDay)) throw new TypeError("release civil day already has a claim");
    if (records.some((entry) => entry.courseId === inventoryAdmission.courseId && entry.courseRevision === inventoryAdmission.courseRevision && entry.lessonId === inventoryAdmission.lessonId)) throw new TypeError("course lesson already has a release claim");
    const released = new Set([...records, ...journalRecords(dataRoot, HISTORICAL_PUBLICATION_CATEGORY)].filter((entry) => entry.courseId === inventoryAdmission.courseId && entry.courseRevision === inventoryAdmission.courseRevision).map((entry) => entry.lessonId));
    if (inventoryAdmission.prerequisites.some((lessonId) => !released.has(lessonId))) throw new TypeError("release claim has unfulfilled course prerequisites");
    const body = {
      type: "MathematicsDailyReleaseClaim", channel: ACTOR, civilDay, timezone: "America/Chicago", plannedPublishAt,
      courseId: inventoryAdmission.courseId, courseRevision: inventoryAdmission.courseRevision, lessonId: inventoryAdmission.lessonId,
      sequence: inventoryAdmission.sequence, inventoryAdmission: inventoryAdmission.id, status: "planned-not-published",
      venueEvidence: null, claimedAt: options.at ?? new Date().toISOString(),
    };
    const claim = { id: contentId(body), ...body };
    await record("mathematics-youtube.daily-release-claim", claim, options);
    return claim;
  } finally { rmSync(lock, { recursive: true, force: true }); }
}

export function dailyCoverage({ from, through, records }) {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(from ?? "") || !/^\d{4}-\d{2}-\d{2}$/u.test(through ?? "") || from > through) throw new TypeError("coverage requires an ordered civil-day range");
  const claimed = new Set(records.map((entry) => entry.civilDay)); const missing = [];
  for (let cursor = new Date(`${from}T12:00:00Z`); cursor <= new Date(`${through}T12:00:00Z`); cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const day = cursor.toISOString().slice(0, 10); if (!claimed.has(day)) missing.push(day);
  }
  return { targetPerDay: 1, from, through, claimedDays: [...claimed].filter((day) => day >= from && day <= through).sort(), missingDays: missing, complete: missing.length === 0 };
}

export function cinematicGenerationCoverage({ from, through, records }) {
  return dailyCoverage({ from, through, records: records.map((entry) => ({ civilDay: entry.capacityCivilDay })) });
}

export async function formPortfolioStatus(
  { civilDay, dataRoot = join(NODE_ROOT, "data"), reportedAt = new Date().toISOString() } = {}
) {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(civilDay ?? "") || !Number.isFinite(Date.parse(reportedAt))) throw new TypeError("portfolio status requires civil day and report instant");
  const root = resolve(dataRoot), identity = channelIdentity(), inventoryAdmissions = journalRecords(root, "mathematics-youtube.cinematic-inventory-admission"), claims = journalRecords(root, "mathematics-youtube.daily-release-claim"), publicationRecords = journalRecords(root, "mathematics-youtube.publication-receipt");
  const generationAdmissions = inventoryAdmissions.map((entry) => ({ id: entry.id, civilDay: entry.capacityCivilDay, format: "cinematic", artifact: entry.notebookVideoAdmission, admittedAt: entry.admittedAt }));
  const releaseClaims = claims.map((entry) => ({ id: entry.id, civilDay: entry.civilDay, inventory: entry.inventoryAdmission, plannedPublishAt: entry.plannedPublishAt }));
  const claimDay = new Map(releaseClaims.map((entry) => [entry.inventory, entry.civilDay]));
  const inventory = inventoryAdmissions.map((entry) => ({ id: entry.id, sourceGenerationAdmission: entry.id, artifact: entry.notebookVideoAdmission, generatedCivilDay: entry.capacityCivilDay, admittedAt: entry.admittedAt, releaseEligible: "held", releaseClaimCivilDay: claimDay.get(entry.id) ?? null }));
  const publicationReceipts = publicationRecords.filter((entry) => typeof entry.publicUrl === "string" && entry.publicUrl.startsWith("https://") && Number.isFinite(Date.parse(entry.publishedAt))).map((entry) => ({ id: entry.id, civilDay: entry.civilDay, releaseClaim: entry.releaseClaim, inventory: entry.inventoryAdmission, venueEvidence: entry.venueEvidence, publicUrl: entry.publicUrl, publishedAt: entry.publishedAt }));
  const privateDraftReceipts = publicationRecords.filter((entry) => entry.privacyStatus === "private" && entry.publicUrl === null && entry.publishedAt === null).map((entry) => ({ id: entry.id, civilDay: entry.civilDay, releaseClaim: entry.releaseClaim, inventory: entry.inventoryAdmission, youtubeChannelId: entry.youtubeChannelId, youtubeVideoId: entry.youtubeVideoId, privacyStatus: "private", publishAt: null, uploadedAt: entry.completedAt }));
  const body = { type: "ChannelPortfolioStatus", channel: ACTOR, youtubeChannelId: identity.youtubeChannelId, youtubeHandle: identity.youtubeHandle, line: "mathematics", format: "cinematic", civilDay, timezone: "America/Chicago", generationAdmissions, releaseClaims, publicationReceipts, privateDraftReceipts, inventory, reportedAt };
  return addressChannelPortfolioRecord(body);
}
