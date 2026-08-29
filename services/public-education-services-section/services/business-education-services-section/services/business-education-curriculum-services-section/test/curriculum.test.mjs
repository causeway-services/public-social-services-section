import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { DurableA2aTaskStore } from "@red-cup-engineering/a2a-contracted-agent-service/durable-task-store";
import { DurablePushNotificationStore } from "@red-cup-engineering/a2a-contracted-agent-service/durable-push-notifications";
import { localA2aMembrane } from "../src/local-a2a-membrane.mjs";
import { formNextLessonOffer, loadCourse, validateCourse } from "../src/curriculum.mjs";
test("business course is a nine-lesson acyclic situated-evidence graph", () => { const assay = validateCourse(loadCourse()); assert.equal(assay.lessonCount, 9); assert.equal(assay.competencyCount, 5); });
test("business curriculum offers only a prerequisite-eligible lesson with situated evidence terms", () => { const first = formNextLessonOffer({ offeredAt: "2096-07-21T12:00:00Z" }); assert.equal(first.object.lesson.sequence, 1); const second = formNextLessonOffer({ completedLessonIds: [first.object.lesson.id], offeredAt: "2096-07-21T12:01:00Z" }); assert.equal(second.object.lesson.sequence, 2); assert.ok(second.object.requiredResearchProductTerms.includes("organization industry scale and jurisdiction")); });
test("business curriculum refuses cyclic or skipped completion", () => { const changed = structuredClone(loadCourse()); changed.lessons[0].prerequisites = [changed.lessons[1].id]; assert.throws(() => validateCourse(changed), /point backward/u); assert.throws(() => formNextLessonOffer({ completedLessonIds: [loadCourse().lessons[1].id] }), /prerequisite-incomplete/u); });
test("production A2A membrane satisfies the durable 2.1 task and coordination contracts", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "business-curriculum-a2a-")); t.after(() => rmSync(root, { recursive: true, force: true }));
  const membrane = localA2aMembrane(root, "delivery"), tasks = new DurableA2aTaskStore(membrane.taskSource), pushes = new DurablePushNotificationStore(membrane.coordinationSource);
  const task = { id: "task-1", contextId: "context-1", status: { state: "TASK_STATE_WORKING", timestamp: "2096-07-21T12:00:00.000Z" }, artifacts: [], history: [], metadata: {} };
  await tasks.save(task); assert.equal((await tasks.load(task.id)).id, task.id);
  await pushes.save(task.id, {}, { id: "push-1", url: "https://customer.example/callback" }); assert.equal((await pushes.load(task.id, {}))[0].id, "push-1");
});
