import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { inspectNewsroomLearning, settleNewsroomLearningPulse } from "../dist/management/newsroom-learning.mjs";
import { appendDatedRecord, appendKoiosAct, readKoiosLedger } from "../dist/management/ledger.mjs";

function territory(name) {
  return join(mkdtempSync(join(tmpdir(), `koios-learning-${name}-`)), "data");
}

function circuit(dataDir, instant, assignmentId, act, data = {}) {
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant, act: `newsroom.circuit.${act}`, subject: assignmentId, data });
}

test("attention and revenue cannot turn an editorial refusal into success", () => {
  const dataDir = territory("separation");
  const assignmentId = "economy-example-1";
  const slug = "example-economy-story";
  circuit(dataDir, "2026-07-18T20:00:00.000Z", assignmentId, "opened");
  appendDatedRecord({ dataRoot: dataDir, ledger: "editorial-judgments", instant: "2026-07-18T20:01:00.000Z", record: {
    kind: "koios.editorial-judgment",
    recordedAt: "2026-07-18T20:01:00.000Z",
    slug,
    disposition: "revise",
    failureLayer: "source-intelligence",
  } });
  circuit(dataDir, "2026-07-18T20:02:00.000Z", assignmentId, "refused", { slug, reason: "insufficient source support" });
  appendKoiosAct({ dataRoot: dataDir, ledger: "attention", instant: "2026-07-18T20:03:00.000Z", act: "attention.aggregate.observed", subject: slug, data: { impressions: 1_000_000 } });
  appendKoiosAct({ dataRoot: dataDir, ledger: "revenue-cost", instant: "2026-07-18T20:04:00.000Z", act: "revenue.observed", subject: assignmentId, data: { slug, revenueMicros: 500_000_000 } });

  const pulse = inspectNewsroomLearning({ dataDir, pulseId: "separation", now: "2026-07-18T20:05:00.000Z" });
  assert.equal(pulse.readings.length, 1);
  assert.equal(pulse.readings[0].outcome, "refused");
  assert.equal(pulse.readings[0].proposedMove, "replay-source-intelligence");
  assert.equal(pulse.readings[0].evidence.attentionObserved, true);
  assert.equal(pulse.readings[0].evidence.revenueObserved, true);
});

test("an unmeasured publication yields observation, not punishment or policy churn", () => {
  const dataDir = territory("observation");
  circuit(dataDir, "2026-07-18T20:00:00.000Z", "technology-example-1", "opened");
  circuit(dataDir, "2026-07-18T20:01:00.000Z", "technology-example-1", "completed", { slug: "example-technology-story" });
  const reading = inspectNewsroomLearning({ dataDir, pulseId: "observation", now: "2026-07-18T20:02:00.000Z" }).readings[0];
  assert.equal(reading.outcome, "published");
  assert.equal(reading.proposedMove, "observe-more");
  assert.equal(reading.failureLayer, "none");
});

test("provider unavailability proposes route review and a repeated evidence pulse is idempotent", () => {
  const dataDir = territory("provider");
  circuit(dataDir, "2026-07-18T20:00:00.000Z", "culture-example-1", "opened");
  circuit(dataDir, "2026-07-18T20:01:00.000Z", "culture-example-1", "obstructed", { reason: "provider unavailable at admitted route" });

  const first = settleNewsroomLearningPulse({ dataDir, pulseId: "provider-1", now: "2026-07-18T20:02:00.000Z" });
  const second = settleNewsroomLearningPulse({ dataDir, pulseId: "provider-2", now: "2026-07-18T20:03:00.000Z" });
  assert.equal(first.settlement, "recorded");
  assert.equal(second.settlement, "unchanged");
  assert.equal(first.readings[0].proposedMove, "review-provider-route");
  assert.equal(second.evidenceDigest, first.evidenceDigest);
  assert.equal(readKoiosLedger(dataDir, "research-lessons").length, 1);
});

test("a source-originality verdict replays the writer instead of replacing sound sources", () => {
  const dataDir = territory("source-originality");
  const assignmentId = "environment-source-originality-1";
  const slug = "heat-death-counting-methods";
  circuit(dataDir, "2026-07-20T00:00:00.000Z", assignmentId, "opened");
  circuit(dataDir, "2026-07-20T00:01:00.000Z", assignmentId, "source-originality-refused", {
    slug,
    failureLayer: "writer-model",
    replayFrom: "writer-model",
    findings: [{
      sourceUrl: "https://source.example/report",
      draftSentence: "The draft sentence follows the source much too closely.",
      sourceSentence: "The source sentence follows this language much too closely.",
    }],
  });
  circuit(dataDir, "2026-07-20T00:02:00.000Z", assignmentId, "refused", {
    slug,
    reason: "source-originality gate found source-shaped prose",
  });

  const reading = inspectNewsroomLearning({ dataDir, pulseId: "source-originality", now: "2026-07-20T00:03:00.000Z" }).readings[0];
  assert.equal(reading.failureLayer, "writer-model");
  assert.equal(reading.proposedMove, "replay-writer");
});

test("a failed headline preserves the staged body and proposes only headline repair", () => {
  const dataDir = territory("headline-return");
  const assignmentId = "politics-bears-ears-1";
  const slug = "bears-ears-staged-report";
  circuit(dataDir, "2026-07-20T10:00:00.000Z", assignmentId, "opened");
  circuit(dataDir, "2026-07-20T10:01:00.000Z", assignmentId, "body-staged", {
    slug,
    bodyDigest: `sha256:${"a".repeat(64)}`,
    attentionSurfaceState: "pending",
  });
  circuit(dataDir, "2026-07-20T10:02:00.000Z", assignmentId, "replan-required", {
    slug,
    failureLayer: "attention-headline",
    proposedMove: "repair-headline",
    preservedWriterInvestment: true,
  });
  circuit(dataDir, "2026-07-20T10:03:00.000Z", assignmentId, "refused", {
    slug,
    reason: "headline contribution failed accountable-originality admission",
  });

  const reading = inspectNewsroomLearning({ dataDir, pulseId: "headline-return", now: "2026-07-20T10:04:00.000Z" }).readings[0];
  assert.equal(reading.slug, slug);
  assert.equal(reading.failureLayer, "attention-headline");
  assert.equal(reading.proposedMove, "repair-headline");
  assert.match(reading.rationale, /preserve the writer investment exactly/u);
});
