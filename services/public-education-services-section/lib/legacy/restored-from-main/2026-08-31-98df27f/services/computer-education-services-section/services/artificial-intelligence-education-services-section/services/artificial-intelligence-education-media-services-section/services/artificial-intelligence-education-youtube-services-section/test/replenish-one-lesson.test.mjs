import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { selectNextLesson } from "@emsenn/artificial-intelligence-curriculum-enterprise/a2a-delivery-executor";
import { NODE_ROOT as CURRICULUM_ROOT, admittedLessonProducts, loadCourse } from "@emsenn/artificial-intelligence-curriculum-enterprise/curriculum";
import { NODE_ROOT as RESEARCH_ROOT } from "@emsenn/artificial-intelligence-research-enterprise/research";
import { contentId } from "../src/channel.mjs";
import { recordJournalRecord } from "../src/record-journal.mjs";
import { replenishOneArtificialIntelligenceLesson } from "../src/replenish-one-lesson.mjs";

const NOW = "2026-08-15T12:00:00.000Z";
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "ai-replenishment-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return {
    at: NOW,
    researchServiceRoot: RESEARCH_ROOT,
    curriculumServiceRoot: CURRICULUM_ROOT,
    researchJournalRoot: join(root, "research"),
    curriculumJournalRoot: join(root, "curriculum"),
    channelJournalRoot: join(root, "channel"),
  };
}

test("one bounded AI replenishment becomes selectNextLesson's exact production supply and replays", async (t) => {
  const options = fixture(t), first = await replenishOneArtificialIntelligenceLesson(options);
  const replay = await replenishOneArtificialIntelligenceLesson({ ...options, at: "2026-08-15T12:01:00.000Z" });
  assert.equal(first.type, "ArtificialIntelligenceOneLessonReplenishmentResult");
  assert.equal(first.outcome, "completed");
  assert.equal(replay.outcome, "replayed");
  assert.equal(replay.researchProduct, first.researchProduct);
  assert.equal(replay.curriculumProduct, first.curriculumProduct);
  assert.deepEqual(first.authenticatedSuppliers, ["urn:ame:artificial-intelligence-research-enterprise", "urn:ame:artificial-intelligence-curriculum-enterprise"]);
  assert.deepEqual(first.externalEffects, []);
  const selected = selectNextLesson(admittedLessonProducts({ dataRoot: options.curriculumJournalRoot }), []);
  assert.equal(selected.id, first.curriculumProduct);
  assert.equal(selected.lessonId, "cybernetics-computation-symbolic-ai");
});

test("fabricated mounts, shared custody, and concurrent AI replenishment fail closed", async (t) => {
  const options = fixture(t), fabricated = join(options.channelJournalRoot, "fabricated-service");
  mkdirSync(fabricated, { recursive: true });
  writeFileSync(join(fabricated, "package.json"), '{"name":"@emsenn/not-artificial-intelligence-research","exports":{"./research":"./research.mjs"}}\n');
  writeFileSync(join(fabricated, "research.mjs"), "export const counterfeit = true;\n");
  await assert.rejects(replenishOneArtificialIntelligenceLesson({ ...options, researchServiceRoot: fabricated }), /service mount names/u);
  await assert.rejects(replenishOneArtificialIntelligenceLesson({ ...options, curriculumJournalRoot: options.researchJournalRoot }), /subject-owned and distinct/u);
  const lockRoot = join(options.channelJournalRoot, "held-locks");
  mkdirSync(join(lockRoot, "one-lesson"), { recursive: true });
  const refused = await replenishOneArtificialIntelligenceLesson({ ...options, lockRoot });
  assert.equal(refused.outcome, "refused");
  assert.equal(refused.code, "replenishment-concurrent");
  assert.deepEqual(refused.externalEffects, []);
});

test("a prerequisite-eligible lesson without declared research is typed no-work", async (t) => {
  const options = fixture(t), course = loadCourse();
  for (const lesson of course.lessons.slice(0, 3)) {
    const body = { type: "ArtificialIntelligenceExplainerInventoryAdmission", channel: "urn:ame:artificial-intelligence-youtube-channel-enterprise", courseId: course.courseId, courseRevision: course.revision, lessonId: lesson.id };
    recordJournalRecord({ root: options.channelJournalRoot, category: "artificial-intelligence-youtube.explainer-inventory-admission", recordedAt: NOW, record: { id: contentId(body), ...body } });
  }
  const result = await replenishOneArtificialIntelligenceLesson(options);
  assert.equal(result.outcome, "no-work");
  assert.equal(result.code, "no-declared-research-packet");
  assert.equal(result.lessonId, course.lessons[3].id);
  assert.deepEqual(result.externalEffects, []);
});
