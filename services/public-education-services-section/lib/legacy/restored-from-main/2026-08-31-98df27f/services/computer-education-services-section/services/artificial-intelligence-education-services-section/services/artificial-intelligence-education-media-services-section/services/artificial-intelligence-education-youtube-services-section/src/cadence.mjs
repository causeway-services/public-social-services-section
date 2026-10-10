import { contentId } from "./channel.mjs";
export const ACTOR = "urn:ame:artificial-intelligence-youtube-channel-enterprise";
const ELIGIBLE = new Set([1, 3, 5]);
export { contentId };
function validDay(value) { return /^\d{4}-\d{2}-\d{2}$/u.test(value ?? "") && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value; }
export function releaseTarget(civilDay) { if (!validDay(civilDay)) throw new TypeError("cadence requires an exact civil day"); return ELIGIBLE.has(new Date(`${civilDay}T12:00:00Z`).getUTCDay()) ? 1 : 0; }
function exactEntries(entries, civilDay, label) { if (!Array.isArray(entries) || new Set(entries.map((row) => row?.id)).size !== entries.length || entries.some((row) => typeof row?.id !== "string" || row.civilDay !== civilDay)) throw new TypeError(`${label} must be unique exact-day channel evidence`); }
export function formCadenceStatus({ civilDay, generationAdmissions = [], releaseClaims = [], publicationReceipts = [], reportedAt = new Date().toISOString() } = {}) {
  const target = releaseTarget(civilDay); exactEntries(generationAdmissions, civilDay, "generation admissions"); exactEntries(releaseClaims, civilDay, "release claims"); exactEntries(publicationReceipts, civilDay, "publication receipts");
  if ([generationAdmissions.length, releaseClaims.length, publicationReceipts.length].some((count) => count > target)) throw new TypeError("AI channel evidence exceeds its alternating-day target");
  if (!Number.isFinite(Date.parse(reportedAt))) throw new TypeError("cadence status requires a finite report time");
  const body = { type: "ProvisionalChannelCadenceStatus", channel: ACTOR, line: "artificial-intelligence-history-and-frontiers", format: "explainer", civilDay, timezone: "America/Chicago", eligible: target === 1, targets: { generation: target, releasePlan: target, publication: target }, counts: { generation: generationAdmissions.length, releasePlan: releaseClaims.length, publication: publicationReceipts.length }, deficits: { generation: target - generationAdmissions.length, releasePlan: target - releaseClaims.length, publication: target - publicationReceipts.length }, reportedAt };
  return { id: contentId(body), ...body };
}
