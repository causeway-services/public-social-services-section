import { mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { createSettlementStore, querySettlementRecords, recordSettlementRecord } from "./record-journal.mjs";
import { addressChannelPortfolioRecord } from "@red-cup-engineering/a2a-channel-portfolio-status-service";
import { ACTOR, NODE_ROOT, channelIdentity, contentId, digest } from "./channel.mjs";
import { releaseTarget } from "./cadence.mjs";
import { LEGACY_BOOTSTRAP_PUBLICATION_ADMISSION_CATEGORY } from "./legacy-bootstrap-publication-admission.mjs";

export const CURRICULUM = "urn:ame:modern-business-curriculum-enterprise";
export const NOTEBOOK = "urn:ame:modern-business-persistent-notebook-enterprise";
export const NOTEBOOK_LM = "urn:ame:notebooklm-inference-team";
export const VIDEO_CAPACITY_ALLOCATION = "modern-business-practices-alternating";
export const INVENTORY_CATEGORY = "modern-business-youtube.explainer-inventory-admission";

function exactId(value) { if (!value || typeof value !== "object") return false; const { id, ...body } = value; return id === contentId(body); }
function nonemptyStrings(value) { return Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === "string" && item.trim() !== ""); }
function validContext(value) { return value && ["organizationForm", "industry", "scale", "jurisdiction"].every((key) => typeof value[key] === "string" && value[key].trim() !== "") && Number.isFinite(Date.parse(value.observedAt ?? "")) && nonemptyStrings(value.descriptiveEvidence) && Array.isArray(value.prescriptiveInference) && value.prescriptiveInference.every((item) => typeof item === "string" && item.trim() !== "") && nonemptyStrings(value.uncertainty) && nonemptyStrings(value.counterevidence); }
function validLesson(value) { return exactId(value) && value.type === "ModernBusinessLessonProductAdmission" && value.provider === CURRICULUM && typeof value.courseId === "string" && Number.isInteger(value.courseRevision) && typeof value.lessonId === "string" && Number.isInteger(value.sequence) && Array.isArray(value.prerequisites) && /^sha256:[a-f0-9]{64}$/u.test(value.courseDigest ?? "") && /^sha256:[a-f0-9]{64}$/u.test(value.sourceCorpusDigest ?? "") && typeof value.researchProduct === "string" && typeof value.researchSettlementReceipt === "string" && value.researchSettlementStatus === "settled" && Number.isFinite(Date.parse(value.observedThrough ?? "")) && Number.isFinite(Date.parse(value.expiresAt ?? "")) && Date.parse(value.expiresAt) > Date.parse(value.observedThrough) && validContext(value.situatedContext) && Array.isArray(value.reuseGrant) && value.reuseGrant.includes("notebooklm-transformation") && value.reuseGrant.includes("public-youtube-release") && typeof value.sourcePacket === "string" && typeof value.correctionIdentity === "string" && value.notebookPromptDigest === digest(value.notebookPrompt) && Array.isArray(value.authorityWithheld) && value.authorityWithheld.includes("youtube-channel-authority") && value.authorityWithheld.includes("upload-schedule-or-publication-authority") && value.authorityWithheld.includes("business-advice-warranty"); }
async function record(category, value, options = {}) { const at = options.at ?? new Date().toISOString(), row = { ...value }; if (options.settlement) return recordSettlementRecord({ root: options.dataRoot ?? join(NODE_ROOT, "data"), agentUrl: options.witnessJournalAgentUrl ?? process.env.WITNESS_JOURNAL_RDF_AGENT, settlement: options.settlement, actor: ACTOR, category, recordedAt: at, record: row }); const store = createSettlementStore({ settlementRoot: options.dataRoot ?? join(NODE_ROOT, "data"), agentUrl: options.witnessJournalAgentUrl ?? process.env.WITNESS_JOURNAL_RDF_AGENT }); return store.record({ category, recordedAt: at, record: row }); }

export function formExplainerOrder(lesson, orderedAt = new Date().toISOString()) { if (!validLesson(lesson)) throw new TypeError("business explainer order requires one settled reusable situated lesson product"); const object = { type: "ModernBusinessExplainerOrder", customer: ACTOR, curriculumProduct: lesson.id, courseId: lesson.courseId, courseRevision: lesson.courseRevision, lessonId: lesson.lessonId, researchProduct: lesson.researchProduct, researchSettlementReceipt: lesson.researchSettlementReceipt, situatedContextDigest: digest(lesson.situatedContext), sourcePacket: lesson.sourcePacket, notebookPrompt: lesson.notebookPrompt, notebookPromptDigest: lesson.notebookPromptDigest, videoFormat: "explainer", videoCapacityAllocation: VIDEO_CAPACITY_ALLOCATION }; const body = { type: "Offer", actor: ACTOR, object, published: orderedAt }; return { id: contentId(body), ...body }; }

export async function admitExplainerInventory({ order, curriculumDelivery, notebookDelivery } = {}, options = {}) {
  const lesson = curriculumDelivery?.object, delivery = notebookDelivery?.object;
  if (!exactId(order) || order.type !== "Offer" || order.actor !== ACTOR || order.object?.type !== "ModernBusinessExplainerOrder") throw new TypeError("business inventory requires the channel's exact explainer order");
  if (!exactId(curriculumDelivery) || curriculumDelivery.type !== "Accept" || curriculumDelivery.actor !== CURRICULUM || !validLesson(lesson) || order.object.curriculumProduct !== lesson.id || order.object.situatedContextDigest !== digest(lesson.situatedContext)) throw new TypeError("business inventory requires the curriculum provider's exact situated lesson delivery");
  if (!exactId(notebookDelivery) || notebookDelivery.type !== "Accept" || notebookDelivery.actor !== NOTEBOOK || delivery?.type !== "ModernBusinessPersistentNotebookExplainerDelivery") throw new TypeError("business inventory requires its dedicated notebook delivery");
  if (typeof options.verifyDelivery !== "function" || (await options.verifyDelivery("curriculum", curriculumDelivery)) !== true || (await options.verifyDelivery("persistent-notebook", notebookDelivery)) !== true) throw new TypeError("business inventory lacks authenticated supplier delivery evidence");
  const demand = delivery.demand, video = delivery.videoAdmission, capacity = delivery.videoOverviewCapacityReceipt;
  if (!exactId(demand) || demand.type !== "PersistentNotebookVideoDemand" || demand.customer !== ACTOR || demand.provider !== NOTEBOOK_LM || demand.providerRequest?.videoFormat !== "explainer" || demand.providerRequest?.videoCapacityCustomer !== ACTOR || demand.providerRequest?.videoCapacityAllocation !== VIDEO_CAPACITY_ALLOCATION) throw new TypeError("business notebook demand is not the exact channel explainer demand");
  if (demand.providerRequest.prompt !== lesson.notebookPrompt || lesson.notebookPromptDigest !== digest(demand.providerRequest.prompt)) throw new TypeError("business notebook demand does not preserve the curriculum prompt");
  if (!exactId(video) || video.type !== "PersistentNotebookVideoArtifactAdmission" || video.demand !== demand.id || video.videoFormat !== "explainer" || video.mediaType !== "video/mp4" || video.provider !== NOTEBOOK_LM || video.videoOverviewCapacityReceipt !== capacity?.id) throw new TypeError("business video admission does not bind the explainer demand and total capacity");
  if (!exactId(capacity) || capacity.type !== "NotebookLMVideoOverviewCapacityReceipt" || capacity.provider !== NOTEBOOK_LM || capacity.customer !== ACTOR || capacity.allocation !== VIDEO_CAPACITY_ALLOCATION || capacity.format !== "explainer" || capacity.timezone !== "America/Chicago" || capacity.disposition !== "spent" || releaseTarget(capacity.civilDay) !== 1) throw new TypeError("business capacity receipt is not spent eligible alternating capacity");
  if (capacity.requestDigest !== demand.providerRequestDigest) throw new TypeError("business capacity receipt does not bind the notebook request");
  if (Date.parse(lesson.expiresAt) <= Date.parse(options.at ?? new Date().toISOString())) throw new TypeError("business research product is stale at inventory admission");
  const dataRoot = resolve(options.dataRoot ?? join(NODE_ROOT, "data")), runtimeRoot = resolve(options.runtimeRoot ?? join(NODE_ROOT, "content/runtime/inventory-locks")); mkdirSync(runtimeRoot, { recursive: true }); const lock = join(runtimeRoot, "inventory");
  try { mkdirSync(lock); } catch (error) { if (error?.code === "EEXIST") throw new TypeError("business inventory is concurrently admitting"); throw error; }
  try { const rows = querySettlementRecords(INVENTORY_CATEGORY,{root:dataRoot}); if (rows.some((row) => row.curriculumProduct === lesson.id || row.notebookVideoAdmission === video.id || row.videoOverviewCapacityReceipt === capacity.id)) throw new TypeError("business supplier product, artifact, or capacity is already booked"); if (rows.some((row) => row.capacityCivilDay === capacity.civilDay)) throw new TypeError("business eligible generation civil day already has inventory"); const body = { type: "ModernBusinessExplainerInventoryAdmission", channel: ACTOR, order: order.id, courseId: lesson.courseId, courseRevision: lesson.courseRevision, courseDigest: lesson.courseDigest, lessonId: lesson.lessonId, sequence: lesson.sequence, prerequisites: [...lesson.prerequisites], curriculumProduct: lesson.id, researchProduct: lesson.researchProduct, researchSettlementReceipt: lesson.researchSettlementReceipt, situatedContextDigest: digest(lesson.situatedContext), sourcePacket: lesson.sourcePacket, correctionIdentity: lesson.correctionIdentity, notebookDemand: demand.id, notebookVideoAdmission: video.id, videoOverviewCapacityReceipt: capacity.id, capacityCivilDay: capacity.civilDay, videoSha256: video.sha256, admittedAt: options.at ?? new Date().toISOString() }; const admission = { id: contentId(body), ...body }; await record(INVENTORY_CATEGORY, admission, options); return admission; } finally { rmSync(lock, { recursive: true, force: true }); }
}

export function formPortfolioStatus(
  { civilDay, dataRoot = join(NODE_ROOT, "data"), reportedAt = new Date().toISOString() } = {}
) {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(civilDay ?? "") || !Number.isFinite(Date.parse(reportedAt))) throw new TypeError("business portfolio status requires civil day and report instant");
  const root = resolve(dataRoot), identity = channelIdentity();
  const inventory = querySettlementRecords(INVENTORY_CATEGORY,{root:dataRoot});
  const claims = querySettlementRecords("modern-business-youtube.alternating-release-claim",{root:dataRoot});
  const publications = querySettlementRecords("modern-business-youtube.publication-receipt",{root:dataRoot});
  const bootstrap = querySettlementRecords("modern-business-youtube.bootstrap-course-completion",{root:dataRoot});
  const legacyAdmissions = querySettlementRecords(LEGACY_BOOTSTRAP_PUBLICATION_ADMISSION_CATEGORY,{root:dataRoot});
  const bridges = querySettlementRecords("modern-business-youtube.scheduled-upload-bridge-receipt",{root:dataRoot});
  const bridgePublications = querySettlementRecords("modern-business-youtube.scheduled-upload-bridge-publication-receipt",{root:dataRoot});
  const bridgeById = new Map(bridges.map((row) => [row.id, row]));
  const legacyById = new Map(legacyAdmissions.map((row) => [row.id, row]));
  const legacyBootstrap = bootstrap.map((completion) => {
    if (completion.status !== "legacy-publication-admitted") return null;
    const admission = legacyById.get(completion.legacyBootstrapPublicationAdmission);
    if (!exactId(completion) || !exactId(admission) || admission.type !== "LegacyBootstrapPublicationAdmission" || admission.channel !== ACTOR || admission.youtubeChannelId !== identity.youtubeChannelId || admission.courseId !== completion.courseId || admission.courseRevision !== completion.courseRevision || admission.lessonId !== completion.lessonId || admission.sequence !== completion.sequence || admission.youtubeVideoId !== completion.youtubeVideoId || admission.plannedPublishAt !== completion.publishAt || admission.venueObservation?.privacyStatus !== "public" || admission.venueObservation?.uploadStatus !== "processed" || admission.venueObservation?.processingStatus !== "succeeded" || admission.venueObservation?.publishedAt !== completion.publishAt || typeof admission.publicUrl !== "string") throw new TypeError("business portfolio legacy bootstrap chain is not exact");
    return { completion, admission };
  }).filter(Boolean);
  const bridgeBootstrap = bootstrap.filter((row) => row.status === "scheduled-first-course-lesson");
  const generationAdmissions = [
    ...inventory.map((row) => ({ id: row.id, civilDay: row.capacityCivilDay, format: "explainer", artifact: row.notebookVideoAdmission, admittedAt: row.admittedAt })),
    ...bridgeBootstrap.map((row) => ({ id: row.id, civilDay: row.civilDay, format: "explainer", artifact: row.scheduledUploadReceipt, admittedAt: row.admittedAt })),
    ...legacyBootstrap.map(({ completion, admission }) => ({ id: completion.id, civilDay: completion.civilDay, format: "explainer", artifact: admission.videoSha256, admittedAt: completion.admittedAt })),
  ];
  const releaseClaims = [
    ...claims.map((row) => ({ id: row.id, civilDay: row.civilDay, inventory: row.inventoryAdmission, plannedPublishAt: row.plannedPublishAt })),
    ...bridgeBootstrap.map((row) => ({ id: row.id, civilDay: row.civilDay, inventory: row.scheduledUploadReceipt, plannedPublishAt: row.publishAt })),
    ...legacyBootstrap.map(({ completion }) => ({ id: completion.id, civilDay: completion.civilDay, inventory: completion.id, plannedPublishAt: completion.publishAt })),
  ];
  const claimDay = new Map(releaseClaims.map((row) => [row.inventory, row.civilDay]));
  const publicationReceipts = [
    ...publications.filter((row) => typeof row.publicUrl === "string" && Number.isFinite(Date.parse(row.publishedAt))).map((row) => ({ id: row.id, civilDay: row.civilDay, releaseClaim: row.releaseClaim, inventory: row.inventoryAdmission, venueEvidence: row.venueEvidence, publicUrl: row.publicUrl, publishedAt: row.publishedAt })),
    ...bridgePublications.map((row) => { const completion = bridgeBootstrap.find((candidate) => candidate.scheduledUploadReceipt === row.scheduledUploadReceipt); return ({ id: row.id, civilDay: row.civilDay, releaseClaim: completion?.id ?? row.scheduledUploadReceipt, inventory: row.scheduledUploadReceipt, venueEvidence: row.venueEvidence, publicUrl: row.publicUrl, publishedAt: row.publishedAt }); }),
    ...legacyBootstrap.map(({ completion, admission }) => ({ id: admission.id, civilDay: completion.civilDay, releaseClaim: completion.id, inventory: completion.id, venueEvidence: admission.id, publicUrl: admission.publicUrl, publishedAt: admission.venueObservation.publishedAt })),
  ];
  const portfolioInventory = [
    ...inventory.map((row) => ({ id: row.id, sourceGenerationAdmission: row.id, artifact: row.notebookVideoAdmission, generatedCivilDay: row.capacityCivilDay, admittedAt: row.admittedAt, releaseEligible: "held", releaseClaimCivilDay: claimDay.get(row.id) ?? null })),
    ...bridgeBootstrap.map((row) => { const bridge = bridgeById.get(row.scheduledUploadReceipt); return ({ id: row.scheduledUploadReceipt, sourceGenerationAdmission: row.id, artifact: row.scheduledUploadReceipt, generatedCivilDay: row.civilDay, admittedAt: row.admittedAt, releaseEligible: bridge ? "held" : "denied", releaseClaimCivilDay: row.civilDay }); }),
    ...legacyBootstrap.map(({ completion, admission }) => ({ id: completion.id, sourceGenerationAdmission: completion.id, artifact: admission.videoSha256, generatedCivilDay: completion.civilDay, admittedAt: completion.admittedAt, releaseEligible: "held", releaseClaimCivilDay: completion.civilDay })),
  ];
  const body = { type: "ChannelPortfolioStatus", channel: ACTOR, youtubeChannelId: identity.youtubeChannelId, youtubeHandle: identity.youtubeHandle, line: "modern-business-practice", format: "explainer", civilDay, timezone: "America/Chicago", generationAdmissions, releaseClaims, publicationReceipts, privateDraftReceipts: [], inventory: portfolioInventory, reportedAt };
  return addressChannelPortfolioRecord(body);
}
