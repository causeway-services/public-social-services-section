import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { NODE_ROOT as RESEARCH_ROOT } from "@emsenn/mathematics-research-enterprise";
import { journalRecords as researchJournalRecords } from "@emsenn/mathematics-research-enterprise/journal";
import { NODE_ROOT as CURRICULUM_ROOT } from "@emsenn/mathematics-curriculum-enterprise";
import { journalRecords as curriculumJournalRecords } from "@emsenn/mathematics-curriculum-enterprise/journal";
import { selectNextLesson, witnessedLessons } from "../src/daily-cinematic-runner.mjs";
import { replenishOneMathematicsLesson } from "../src/replenish-one-lesson.mjs";

const NOW = "2096-07-21T12:00:00.000Z";

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "math-replenishment-"));
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

test("one bounded replenishment becomes the exact next production selection and replays", async (t) => {
  const options = fixture(t);
  const first = await replenishOneMathematicsLesson(options);
  const replay = await replenishOneMathematicsLesson({ ...options, at: "2096-07-21T12:01:00.000Z" });
  assert.equal(first.type, "MathematicsOneLessonReplenishmentResult");
  assert.equal(first.outcome, "completed");
  assert.equal(replay.outcome, "replayed");
  assert.equal(replay.sourcePacket, first.sourcePacket);
  assert.equal(replay.curriculumProduct, first.curriculumProduct);
  assert.deepEqual(first.authenticatedSuppliers, ["urn:ame:mathematics-research-enterprise", "urn:ame:mathematics-curriculum-enterprise"]);
  assert.equal(researchJournalRecords(options.researchJournalRoot, "mathematics-research.source-packet-admission").length, 1);
  assert.equal(curriculumJournalRecords(options.curriculumJournalRoot, "mathematics-curriculum.lesson-brief-admission").length, 1);
  const selected = selectNextLesson(await witnessedLessons(options.curriculumJournalRoot), []);
  assert.equal(selected.id, first.curriculumProduct);
  assert.equal(selected.lessonId, "order-before-distance");
});

test("fabricated mounts, shared custody, and concurrent replenishment fail closed", async (t) => {
  const options = fixture(t), fabricated = join(options.channelJournalRoot, "fabricated-service");
  mkdirSync(fabricated, { recursive: true });
  writeFileSync(join(fabricated, "package.json"), '{"name":"@emsenn/not-mathematics-research"}\n');
  await assert.rejects(replenishOneMathematicsLesson({ ...options, researchServiceRoot: fabricated }), /service mount names/u);
  await assert.rejects(replenishOneMathematicsLesson({ ...options, curriculumJournalRoot: options.researchJournalRoot }), /subject-owned and distinct/u);
  const lockRoot = join(options.channelJournalRoot, "held-locks"); mkdirSync(join(lockRoot, "one-lesson"), { recursive: true });
  const refused = await replenishOneMathematicsLesson({ ...options, lockRoot });
  assert.equal(refused.outcome, "refused");
  assert.equal(refused.code, "replenishment-concurrent");
  assert.deepEqual(refused.externalEffects, []);
});
