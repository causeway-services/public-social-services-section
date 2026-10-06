import assert from "node:assert/strict";
import test from "node:test";
import {
  isTranscriptionRateLimit,
  planTranscriptionRetry,
  transcriptionRetryDisposition,
} from "../src/transcription-retry.mjs";

test("classifies Cloudflare-style 429 errors", () => {
  assert.equal(isTranscriptionRateLimit(new Error("Workers AI HTTP 429 (codes 4006)")), true);
  assert.equal(isTranscriptionRateLimit({ response: { status: 429 } }), true);
  assert.equal(isTranscriptionRateLimit(new Error("HTTP 500")), false);
});

test("backs off instead of retrying on every producer turn", () => {
  const now = new Date("2026-10-03T13:00:00Z");
  const retry = planTranscriptionRetry(null, { now });
  assert.deepEqual(retry, { attempts: 1, exhausted: false, nextEligibleAt: "2026-10-03T13:15:00.000Z" });
  assert.equal(transcriptionRetryDisposition(retry, new Date("2026-10-03T13:14:59Z")), "waiting");
  assert.equal(transcriptionRetryDisposition(retry, new Date("2026-10-03T13:15:00Z")), "ready");
});

test("honors Retry-After and eventually settles to explicit waiting", () => {
  const now = new Date("2026-10-03T13:00:00Z");
  const first = planTranscriptionRetry(null, { now, retryAfter: "120" });
  assert.equal(first.nextEligibleAt, "2026-10-03T13:02:00.000Z");
  let retry = first;
  for (let i = 0; i < 4; i += 1) retry = planTranscriptionRetry(retry, { now: new Date(retry.nextEligibleAt ?? now) });
  assert.deepEqual(retry, { attempts: 5, exhausted: true, nextEligibleAt: null });
  assert.equal(transcriptionRetryDisposition(retry, now), "exhausted");
});
