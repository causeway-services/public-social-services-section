import assert from "node:assert/strict";
import { existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { selectRoutineQueueJob } from "../src/routine-job-queue.mjs";

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "koios-routine-job-queue-"));
  const queueRoot = join(root, "queue"), replayRoot = join(root, "replay");
  mkdirSync(queueRoot); mkdirSync(replayRoot);
  writeFileSync(join(queueRoot, "010-first.json"), "{\"job\":\"first\"}\n");
  writeFileSync(join(queueRoot, "020-second.json"), "{\"job\":\"second\"}\n");
  return { root, queueRoot, replayRoot };
}

test("reserves queue jobs in bytewise order and binds retries to their first occurrence", () => {
  const x = fixture();
  try {
    const first = selectRoutineQueueJob({ ...x, pulseId: "urn:test:delivery:1" });
    assert.equal(first.jobName, "010-first.json");
    assert.equal(selectRoutineQueueJob({ ...x, pulseId: "urn:test:delivery:1" }).jobName, "010-first.json");
    assert.equal(selectRoutineQueueJob({ ...x, pulseId: "urn:test:delivery:2" }).jobName, "020-second.json");
    assert.throws(() => selectRoutineQueueJob({ ...x, pulseId: "urn:test:delivery:3" }), /no unreserved jobs/u);
  } finally { rmSync(x.root, { recursive: true, force: true }); }
});

test("preflight identifies the next job without creating a reservation", () => {
  const x = fixture();
  try {
    assert.equal(selectRoutineQueueJob({ ...x, reserve: false }).jobName, "010-first.json");
    assert.equal(existsSync(join(x.replayRoot, "queue-reservations")), false);
    assert.equal(selectRoutineQueueJob({ ...x, pulseId: "urn:test:delivery:1" }).jobName, "010-first.json");
    assert.equal(selectRoutineQueueJob({ ...x, reserve: false }).jobName, "020-second.json");
  } finally { rmSync(x.root, { recursive: true, force: true }); }
});

test("refuses a queue entry that changes after it is reserved", () => {
  const x = fixture();
  try {
    selectRoutineQueueJob({ ...x, pulseId: "urn:test:delivery:1" });
    writeFileSync(join(x.queueRoot, "010-first.json"), "{\"job\":\"changed\"}\n");
    assert.throws(() => selectRoutineQueueJob({ ...x, pulseId: "urn:test:delivery:1" }), /changed after reservation/u);
  } finally { rmSync(x.root, { recursive: true, force: true }); }
});
