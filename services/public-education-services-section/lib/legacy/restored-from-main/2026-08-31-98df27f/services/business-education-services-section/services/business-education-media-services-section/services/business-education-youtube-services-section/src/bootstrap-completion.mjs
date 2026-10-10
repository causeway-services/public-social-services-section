import { join, resolve } from "node:path";
import { ACTOR, NODE_ROOT, contentId } from "./channel.mjs";
import { LEGACY_BOOTSTRAP_PUBLICATION_ADMISSION_CATEGORY } from "./legacy-bootstrap-publication-admission.mjs";
import { createSettlementStore, querySettlementRecords } from "./record-journal.mjs";
import { BOOTSTRAP_CATEGORY } from "./release.mjs";

function exact(value) { if (!value || typeof value !== "object") return false; const { id, ...body } = value; return id === contentId(body); }

export async function admitBootstrapCompletion(options = {}) {
  const dataRoot = resolve(options.dataRoot ?? join(NODE_ROOT, "data")), prior = await querySettlementRecords(BOOTSTRAP_CATEGORY, { root: dataRoot }), admissions = await querySettlementRecords(LEGACY_BOOTSTRAP_PUBLICATION_ADMISSION_CATEGORY, { root: dataRoot });
  if (admissions.length !== 1) throw new TypeError("business bootstrap requires one admitted legacy publication rectification");
  const admission = admissions[0];
  if (!exact(admission) || admission.type !== "LegacyBootstrapPublicationAdmission" || admission.channel !== ACTOR || admission.generation !== 1 || admission.previousAdmission !== null || admission.courseId !== "modern-firm-as-operational-system" || admission.courseRevision !== 1 || admission.lessonId !== "value-proposition-business-model-purpose" || admission.sequence !== 1 || admission.venueObservation?.privacyStatus !== "public" || admission.venueObservation?.uploadStatus !== "processed" || admission.venueObservation?.processingStatus !== "succeeded" || admission.venueObservation?.youtubeVideoId !== admission.youtubeVideoId || admission.venueObservation?.youtubeChannelId !== admission.youtubeChannelId || admission.venueObservation?.publishedAt !== admission.plannedPublishAt) throw new TypeError("business bootstrap legacy publication admission is not exact");
  if (prior.length) {
    if (prior.length !== 1 || !exact(prior[0]) || prior[0].type !== "ModernBusinessBootstrapCourseCompletion" || prior[0].status !== "legacy-publication-admitted" || prior[0].legacyBootstrapPublicationAdmission !== admission.id || "scheduledUploadReceipt" in prior[0]) throw new TypeError("business bootstrap completion journal conflicts with the admitted rectification");
    return prior[0];
  }
  const at = options.at ?? new Date().toISOString(), body = { type: "ModernBusinessBootstrapCourseCompletion", channel: ACTOR, courseId: admission.courseId, courseRevision: admission.courseRevision, lessonId: admission.lessonId, sequence: admission.sequence, youtubeVideoId: admission.youtubeVideoId, legacyBootstrapPublicationAdmission: admission.id, civilDay: admission.plannedPublishAt.slice(0, 10), publishAt: admission.plannedPublishAt, status: "legacy-publication-admitted", admittedAt: at }, completion = { id: contentId(body), ...body };
  const store = createSettlementStore({ settlementRoot: dataRoot, agentUrl: options.witnessJournalAgentUrl ?? process.env.WITNESS_JOURNAL_RDF_AGENT });
  await store.record({ category: BOOTSTRAP_CATEGORY, recordedAt: at, record: { ...completion } });
  return completion;
}
