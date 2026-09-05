import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { appendKoiosAct } from "../dist/management/ledger.mjs";
import { publicationOperationsReading } from "../dist/operations.mjs";

test("operations exposes observed free and subscription inference routes", () => {
  const dataDir = mkdtempSync(join(tmpdir(), "koios-operations-"));
  appendKoiosAct({
    dataRoot: dataDir,
    ledger: "provider-usage",
    instant: "2026-07-19T10:00:00.000Z",
    act: "inference.consumed",
    subject: "groq-exchange",
    data: { provider: "groq-inference-team", model: "llama-3.1-8b-instant", cost: { denomination: "groq-api-requests" } },
  });
  appendKoiosAct({
    dataRoot: dataDir,
    ledger: "provider-usage",
    instant: "2026-07-19T10:01:00.000Z",
    act: "inference.consumed",
    subject: "gemini-exchange",
    data: { provider: "gemini-inference-team", model: "gemini-3.1-flash-lite", cost: { denomination: "google-ai-studio-api-requests" } },
  });
  appendKoiosAct({
    dataRoot: dataDir,
    ledger: "provider-usage",
    instant: "2026-07-19T10:01:30.000Z",
    act: "inference.consumed",
    subject: "claude-exchange",
    data: { provider: "claude-code-inference-team", model: "claude-sonnet-4-6", cost: { denomination: "claude-code-cli-invocations" } },
  });
  appendKoiosAct({
    dataRoot: dataDir,
    ledger: "contract-events",
    instant: "2026-07-19T10:02:00.000Z",
    act: "newsroom.circuit.drafted",
    subject: "assignment-free",
    data: { slug: "free-draft", writer: { provider: "groq-inference-team", tier: "free-groq", model: "llama-3.1-8b-instant" } },
  });
  appendKoiosAct({
    dataRoot: dataDir,
    ledger: "contract-events",
    instant: "2026-07-19T10:03:00.000Z",
    act: "newsroom.circuit.drafted",
    subject: "assignment-subscription",
    data: { slug: "subscription-draft", writer: { provider: "claude-code-inference-team", tier: "leader-claude", model: "claude-sonnet-4-6" } },
  });
  appendKoiosAct({
    dataRoot: dataDir,
    ledger: "contract-events",
    instant: "2026-07-19T10:04:00.000Z",
    act: "publication.cycle.started",
    subject: "assignment-free",
    data: { triggerActor: "urn:colony:cold-red-gate:clockkeeper", triggerCapability: "urn:test:clockkeeper-capability", triggerPulseId: "urn:test:clockkeeper-pulse", triggerActivityDigest: "sha256:test" },
  });
  appendKoiosAct({
    dataRoot: dataDir,
    ledger: "contract-events",
    instant: "2026-07-19T10:05:00.000Z",
    act: "publication.cycle.settled",
    subject: "assignment-free",
    data: { disposition: "published", code: "cloudflare-release-pending", triggerActor: "urn:colony:cold-red-gate:clockkeeper", triggerCapability: "urn:test:clockkeeper-capability", triggerPulseId: "urn:test:clockkeeper-pulse", triggerActivityDigest: "sha256:test" },
  });

  const reading = publicationOperationsReading({ posts: [], items: [], dataDir, correctionCount: 0 });
  assert.deepEqual(reading.resources.inferenceCarriers, { "claude-code-cli-invocations": 1, "google-ai-studio-api-requests": 1, "groq-api-requests": 1 });
  assert.deepEqual(reading.resources.inferenceAccessClasses, { "free-allocation": 2, "leader-subscription": 1 });
  assert.equal(reading.resources.freeAllocationInferenceSettlementCount, 2);
  assert.equal(reading.resources.leaderSubscriptionInferenceSettlementCount, 1);
  assert.deepEqual(reading.resources.writerRoute.configuredTierOrder, ["free-groq", "free-gemini", "free-nim", "leader-claude"]);
  assert.deepEqual(reading.resources.writerRoute.selectedTierCounts, { "free-groq": 1, "leader-claude": 1 });
  assert.equal(reading.cadence.clockkeeperInitiatedCycleCount, 1);
  assert.deepEqual(reading.cadence.latestClockkeeperInitiatedCycle, { pulseId: "urn:test:clockkeeper-pulse", assignmentId: "assignment-free" });
  assert.equal(reading.cadence.clockkeeperSettledCycleCount, 1);
  assert.deepEqual(reading.cadence.latestClockkeeperSettledCycle, { disposition: "published", code: "cloudflare-release-pending", pulseId: "urn:test:clockkeeper-pulse", assignmentId: "assignment-free" });
});
