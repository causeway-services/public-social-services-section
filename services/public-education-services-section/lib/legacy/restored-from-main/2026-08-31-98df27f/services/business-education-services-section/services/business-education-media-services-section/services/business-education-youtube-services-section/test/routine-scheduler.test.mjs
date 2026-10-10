import assert from "node:assert/strict";
import test from "node:test";
import { loadReleaseQueue } from "../src/routine-scheduler.mjs";
test("routine scheduler queue binds one future materialized business release", () => { const queue = loadReleaseQueue(); assert.equal(queue.maximumUploadsPerRun, 1); assert.equal(queue.entries[0].id, "value-propositions-business-models-purpose"); assert.equal(queue.entries[0].publishAt, "2026-07-23T15:00:00.000Z"); });
