import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createSemanticRecordJournal } from "@red-cup-engineering/semantic-record-journal-service";
import { JOURNAL_OBJECT_KIND, journalRecords } from "../src/journal.mjs";
import { EMPTY_WITNESS_ROOT, identifyJsonSemanticContent } from "@red-cup-engineering/semantic-content-identify-service";
const semanticId = (objectKind, value) => identifyJsonSemanticContent({ objectKind, value, witnessRoot: EMPTY_WITNESS_ROOT }).token;
import { ACTOR, admitLessonBrief, formNextLessonOffer, loadCourse, loadLessonBriefDraft, validateCourse } from "../src/curriculum.mjs";

const NOW = "2096-07-21T12:00:00.000Z";
function packet(lessonId, rights = ["notebooklm-transformation", "public-youtube-release"]) {
  const body = { type: "ResearchSourcePacketAdmission", provider: "urn:ame:test-math-research-team", courseId: "causality-and-kinematic-space", lessonId, corpusDigest: semanticId("mathematics-research.source-corpus", { fixture: lessonId }), reuseGrant: rights, admittedAt: NOW };
  return { id: semanticId("mathematics-research.source-packet-admission", body), ...body };
}
function brief() { return { type: "MathematicsLessonBriefDraft", courseId: "causality-and-kinematic-space", courseRevision: 1, lessonId: "order-before-distance", learningObjectives: ["Distinguish causal order from metric distance."], definitions: ["event", "partial order", "causal comparability"], notebookPrompt: "Show how causal order carries structure before distance.", humanFrame: "Name which claims are definitions and which depend on extra geometry.", assessment: "Construct a finite causal poset and identify incomparable events." }; }

test("the first course graph is valid", () => {
  assert.deepEqual(validateCourse(loadCourse()), { courseDigest: validateCourse(loadCourse()).courseDigest, lessonCount: 6, competencyCount: 6 });
});

test("next-lesson offers follow prerequisites and withhold channel authority", () => {
  const first = formNextLessonOffer({ offeredAt: NOW });
  assert.equal(first.actor, ACTOR); assert.equal(first.object.lesson.id, "order-before-distance");
  assert.ok(first.object.authorityWithheld.includes("upload-schedule-or-publication-authority"));
  const third = formNextLessonOffer({ completedLessonIds: ["order-before-distance", "lorentzian-geometry"], offeredAt: NOW });
  assert.equal(third.object.lesson.id, "intervals-to-points");
  assert.throws(() => formNextLessonOffer({ completedLessonIds: ["lorentzian-geometry"], offeredAt: NOW }), /does not satisfy its own prerequisites/u);
});

test("all declared required lasting lesson briefs bind the exact course revision", () => {
  const course = loadCourse();
  for (const lesson of course.lessons) {
    const value = loadLessonBriefDraft({ courseId: course.courseId, lessonId: lesson.id });
    assert.equal(value.type, "MathematicsLessonBriefDraft"); assert.equal(value.courseRevision, course.revision); assert.equal(value.lessonId, lesson.id);
    assert.ok(value.learningObjectives.length > 0); assert.ok(value.definitions.length > 0); assert.ok(value.notebookPrompt.length > 100);
  }
});

test("course validation refuses a forward prerequisite", () => {
  const invalid = structuredClone(loadCourse()); invalid.lessons[0].prerequisites = ["lorentzian-geometry"];
  assert.throws(() => validateCourse(invalid), /acyclic and point backward/u);
});

test("lesson admission requires exact reuse rights and records immutable product evidence", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "math-curriculum-"));
  t.after(() => { rmSync(root, { recursive: true, force: true }); });
  const offer = formNextLessonOffer({ offeredAt: NOW });
  const options = { at: NOW, dataRoot: root, verifySourcePacket: async () => true };
  await assert.rejects(() => admitLessonBrief({ offer, sourcePacket: packet("order-before-distance", ["notebooklm-transformation"]), brief: brief() }, options), /reuse rights/u);
  await assert.rejects(() => admitLessonBrief({ offer, sourcePacket: packet("order-before-distance"), brief: brief() }, { ...options, verifySourcePacket: undefined }), /authenticated supplier delivery/u);
  const admission = await admitLessonBrief({ offer, sourcePacket: packet("order-before-distance"), brief: brief() }, options);
  const replay = await admitLessonBrief({ offer, sourcePacket: packet("order-before-distance"), brief: brief() }, { ...options, at: "2096-07-22T12:00:00.000Z" });
  assert.equal(replay.id, admission.id);
  assert.equal(admission.lessonId, "order-before-distance"); assert.ok(admission.authorityWithheld.includes("youtube-channel-authority"));
  const records = journalRecords(root, "mathematics-curriculum.lesson-brief-admission");
  assert.equal(records.length, 1);
  const claims = createSemanticRecordJournal({ root, objectKind: JOURNAL_OBJECT_KIND }).claims();
  assert.ok(claims.some((claim) => claim.a === "charge:support"));
  assert.ok(!claims.some((claim) => claim.a === "charge:refutation"));
});
