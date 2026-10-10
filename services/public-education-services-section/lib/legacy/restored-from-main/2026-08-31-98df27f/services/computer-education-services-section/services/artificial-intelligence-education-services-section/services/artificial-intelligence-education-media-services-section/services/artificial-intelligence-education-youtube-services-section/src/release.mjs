import { mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { createRecordJournal, queryJournalRecords, recordJournalRecord } from "./record-journal.mjs";
import { ACTOR, NODE_ROOT, contentId } from "./channel.mjs";
import { releaseTarget } from "./cadence.mjs";
import { INVENTORY_CATEGORY } from "./inventory.mjs";
const HISTORICAL_PUBLICATION_CATEGORY = "artificial-intelligence-youtube.historical-publication-admission";

export const RELEASE_CATEGORY = "artificial-intelligence-youtube.alternating-release-claim";
function exactId(value) { if (!value || typeof value !== "object") return false; const { id, ...body } = value; return id === contentId(body); }
function civilDayAt(instant) { const date = new Date(instant); if (!Number.isFinite(date.valueOf())) throw new TypeError("AI plannedPublishAt must be an ISO instant"); const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date), get = (type) => parts.find((part) => part.type === type)?.value; return `${get("year")}-${get("month")}-${get("day")}`; }
async function record(value, options) { const at = options.at ?? new Date().toISOString(), row = { ...value }, store = createRecordJournal({ root: resolve(options.dataRoot ?? join(NODE_ROOT, "data")) }); return store.record({ category: RELEASE_CATEGORY, recordedAt: at, record: row }); }

export async function claimAlternatingRelease({ inventoryAdmission, civilDay, plannedPublishAt } = {}, options = {}) {
  if (!exactId(inventoryAdmission) || inventoryAdmission.type !== "ArtificialIntelligenceExplainerInventoryAdmission" || inventoryAdmission.channel !== ACTOR) throw new TypeError("AI release requires exact channel explainer inventory");
  if (releaseTarget(civilDay) !== 1) throw new TypeError("AI release target is zero on this civil day");
  if (civilDayAt(plannedPublishAt) !== civilDay) throw new TypeError("AI release civil day must match America/Chicago plannedPublishAt");
  const dataRoot = resolve(options.dataRoot ?? join(NODE_ROOT, "data")); if (!(await queryJournalRecords(INVENTORY_CATEGORY, { root: dataRoot })).some((row) => row.id === inventoryAdmission.id)) throw new TypeError("AI inventory authority is not witnessed");
  const runtimeRoot = resolve(options.runtimeRoot ?? join(NODE_ROOT, "content/runtime/release-locks")); mkdirSync(runtimeRoot, { recursive: true }); const lock = join(runtimeRoot, civilDay);
  try { mkdirSync(lock); } catch (error) { if (error?.code === "EEXIST") throw new TypeError("AI release civil day is concurrently claimed"); throw error; }
  try {
    const rows = await queryJournalRecords(RELEASE_CATEGORY, { root: dataRoot });
    if (rows.some((row) => row.civilDay === civilDay)) throw new TypeError("AI release civil day already has a claim");
    if (rows.some((row) => row.inventoryAdmission === inventoryAdmission.id || (row.courseId === inventoryAdmission.courseId && row.courseRevision === inventoryAdmission.courseRevision && row.lessonId === inventoryAdmission.lessonId))) throw new TypeError("AI inventory or course lesson already has a release claim");
    const historical = await queryJournalRecords(HISTORICAL_PUBLICATION_CATEGORY, { root: dataRoot }); const released = new Set([...rows, ...historical].filter((row) => row.courseId === inventoryAdmission.courseId && row.courseRevision === inventoryAdmission.courseRevision).map((row) => row.lessonId)); if (inventoryAdmission.prerequisites.some((id) => !released.has(id))) throw new TypeError("AI release has unfulfilled course prerequisites");
    const body = { type: "ArtificialIntelligenceAlternatingReleaseClaim", channel: ACTOR, civilDay, timezone: "America/Chicago", plannedPublishAt, courseId: inventoryAdmission.courseId, courseRevision: inventoryAdmission.courseRevision, lessonId: inventoryAdmission.lessonId, sequence: inventoryAdmission.sequence, inventoryAdmission: inventoryAdmission.id, status: "planned-not-published", venueEvidence: null, claimedAt: options.at ?? new Date().toISOString() };
    const claim = { id: contentId(body), ...body }; await record(claim, { ...options, dataRoot }); return claim;
  } finally { rmSync(lock, { recursive: true, force: true }); }
}
