import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import * as curriculum from "@emsenn/modern-business-curriculum-enterprise";
import * as research from "@emsenn/modern-business-research-enterprise";
import { ACTOR, contentId } from "../src/channel.mjs";
import { INVENTORY_CATEGORY } from "../src/inventory.mjs";
import { LEGACY_BOOTSTRAP_PUBLICATION_ADMISSION_CATEGORY } from "../src/legacy-bootstrap-publication-admission.mjs";
import { recordSettlementRecord } from "../src/record-journal.mjs";
import { replenishOneModernBusinessLesson } from "../src/replenish-one-lesson.mjs";

const NOW = "2026-08-15T12:00:00.000Z", PUBLISHED = "2026-07-23T15:00:00.000Z", VIDEO = "fRnoCLDnn2g";
function exact(body) { return { id: contentId(body), ...body }; }
function fixture(t) { const root = mkdtempSync(join(tmpdir(), "business-replenishment-")); t.after(() => rmSync(root, { recursive: true, force: true })); return { at: NOW, researchServiceRoot: research.NODE_ROOT, curriculumServiceRoot: curriculum.NODE_ROOT, researchJournalRoot: join(root, "research"), curriculumJournalRoot: join(root, "curriculum"), channelJournalRoot: join(root, "channel", "data") }; }
async function seed(options, category, record) { await recordSettlementRecord({ root: options.channelJournalRoot, category, recordedAt: NOW, record }); }
async function seedBootstrap(options) { const channelId = "UC" + "b".repeat(22), admission = exact({ type: "LegacyBootstrapPublicationAdmission", channel: ACTOR, generation: 1, previousAdmission: null, courseId: "modern-firm-as-operational-system", courseRevision: 1, lessonId: "value-proposition-business-model-purpose", sequence: 1, youtubeVideoId: VIDEO, plannedPublishAt: PUBLISHED, venueObservation: { privacyStatus: "public", uploadStatus: "processed", processingStatus: "succeeded", youtubeVideoId: VIDEO, youtubeChannelId: channelId, publishedAt: PUBLISHED }, youtubeChannelId: channelId }); await seed(options, LEGACY_BOOTSTRAP_PUBLICATION_ADMISSION_CATEGORY, admission); return admission; }

test("valid bootstrap evidence replenishes lesson two into the exact next production selection and replays", async (t) => {
  const options = fixture(t); await seedBootstrap(options);
  const first = await replenishOneModernBusinessLesson(options), replay = await replenishOneModernBusinessLesson({ ...options, at: "2026-08-15T12:01:00.000Z" });
  assert.equal(first.outcome, "completed");
  assert.equal(first.lessonId, "customer-discovery-market-intelligence");
  assert.equal(replay.outcome, "replayed");
  assert.equal(replay.researchProduct, first.researchProduct);
  assert.equal(replay.curriculumProduct, first.curriculumProduct);
  assert.deepEqual(first.externalEffects, []);
  const selected = curriculum.formNextLessonOffer({ course: curriculum.loadCourse(), completedLessonIds: ["value-proposition-business-model-purpose"], offeredAt: NOW });
  assert.equal(selected.object.lesson.id, first.lessonId);
  assert.equal(selected.object.courseId, first.courseId);
  assert.equal(selected.object.courseRevision, first.courseRevision);
});

test("bootstrap plus channel inventory yields typed no-work at the first undeclared lesson", async (t) => {
  const options = fixture(t), course = curriculum.loadCourse(); await seedBootstrap(options);
  for (const lesson of course.lessons.slice(1, 3)) await seed(options, INVENTORY_CATEGORY, exact({ type: "ModernBusinessExplainerInventoryAdmission", channel: ACTOR, courseId: course.courseId, courseRevision: course.revision, lessonId: lesson.id, sequence: lesson.sequence, prerequisites: lesson.prerequisites }));
  const noWork = await replenishOneModernBusinessLesson(options);
  assert.equal(noWork.outcome, "no-work");
  assert.equal(noWork.code, "no-declared-research-or-brief");
  assert.equal(noWork.lessonId, "accounting-unit-economics-capital");
  assert.deepEqual(noWork.missingDeclarations, ["research-manifest", "curriculum-brief"]);
  assert.deepEqual(noWork.externalEffects, []);
});

test("fabricated mounts, shared custody, and concurrent business replenishment fail closed", async (t) => {
  const options = fixture(t), fabricated = join(options.channelJournalRoot, "fabricated-service"); await seedBootstrap(options);
  mkdirSync(fabricated, { recursive: true }); writeFileSync(join(fabricated, "package.json"), '{"name":"@emsenn/not-modern-business-research","exports":"./research.mjs"}\n'); writeFileSync(join(fabricated, "research.mjs"), "export const counterfeit = true;\n");
  await assert.rejects(replenishOneModernBusinessLesson({ ...options, researchServiceRoot: fabricated }), /service mount names/u);
  await assert.rejects(replenishOneModernBusinessLesson({ ...options, curriculumJournalRoot: options.researchJournalRoot }), /subject-owned and distinct/u);
  const lockRoot = join(options.channelJournalRoot, "held-locks"); mkdirSync(join(lockRoot, "one-lesson"), { recursive: true });
  const refused = await replenishOneModernBusinessLesson({ ...options, lockRoot });
  assert.equal(refused.outcome, "refused");
  assert.equal(refused.code, "replenishment-concurrent");
  assert.deepEqual(refused.externalEffects, []);
});
