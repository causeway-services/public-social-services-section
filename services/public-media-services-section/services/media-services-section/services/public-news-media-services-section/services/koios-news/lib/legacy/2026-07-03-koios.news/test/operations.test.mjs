import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { appendDatedRecord, appendKoiosAct } from "../dist/management/ledger.mjs";
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
    ledger: "internal-market",
    instant: "2026-07-19T10:09:31.000Z",
    act: "internal-service.receipt.settled",
    subject: "urn:test:keyword-receipt",
    data: { id: "urn:test:keyword-receipt", contract: "koios.news/keyword-opportunity-research/v1", buyer: "urn:micro-enterprise:koios.news:journalism-commissioning", seller: "urn:micro-enterprise:koios.news:keyword-research", commodity: { unit: "keyword-opportunity-brief" }, payment: { monetaryClaim: false } },
  });
  appendKoiosAct({
    dataRoot: dataDir,
    ledger: "advertising",
    instant: "2026-07-19T10:09:32.000Z",
    act: "advertising.inventory-lot.available",
    subject: "assignment-free",
    data: { id: "urn:test:inventory", contract: "koios.news/article-ad-inventory/v1", slug: "free-draft", externalRevenueObserved: false },
  });
  appendDatedRecord({
    dataRoot: dataDir,
    ledger: "editorial-judgments",
    instant: "2026-07-19T10:06:00.000Z",
    record: { kind: "koios.editorial-judgment", recordedAt: "2026-07-19T10:06:00.000Z", slug: "free-draft", manuscriptDigest: "sha256:draft-one", disposition: "revise", serviceAccepted: true, toolSelectionValidated: true },
  });
  appendDatedRecord({
    dataRoot: dataDir,
    ledger: "editorial-judgments",
    instant: "2026-07-19T10:07:00.000Z",
    record: { kind: "koios.editorial-judgment", recordedAt: "2026-07-19T10:07:00.000Z", slug: "free-draft", manuscriptDigest: "sha256:draft-two", disposition: "accept", serviceAccepted: true, toolSelectionValidated: true },
  });
  appendDatedRecord({
    dataRoot: dataDir,
    ledger: "source-claims",
    instant: "2026-07-19T10:08:00.000Z",
    record: { kind: "koios.source-corpus-refresh", at: "2026-07-19T10:08:00.000Z", contract: "newscable-source-custody" },
  });
  appendDatedRecord({
    dataRoot: dataDir,
    ledger: "source-claims",
    instant: "2026-07-19T10:08:01.000Z",
    record: { kind: "koios.source-bundle-admission", at: "2026-07-19T10:08:01.000Z", offered: 4, admitted: [{ subject: "one" }, { subject: "two" }, { subject: "three" }], duplicates: [{ subject: "old" }], collisions: [], refused: [], deliveryDigest: "sha256:source-delivery" },
  });
  appendDatedRecord({
    dataRoot: dataDir,
    ledger: "audience-product",
    instant: "2026-07-19T10:09:00.000Z",
    record: {
      kind: "koios.audience-product-reading",
      version: 2,
      generatedAt: "2026-07-19T10:09:00.000Z",
      portfolio: {
        kind: "koios.publication-portfolio",
        version: 1,
        horizon: { dailyHours: 24, depthDays: 7 },
        observed: { dailyReach: 1, dailyCore: 0, weeklyDepth: 0 },
        nextRequiredBand: "core",
        slots: [],
        unmet: ["core"],
        law: ["Koios measures external reader value; it does not fabricate internal revenue."],
      },
    },
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
    act: "publication.internal-service.started",
    subject: "assignment-free",
    data: { triggerActor: "urn:colony:cold-red-gate:clockkeeper", triggerCapability: "urn:test:clockkeeper-capability", triggerPulseId: "urn:test:clockkeeper-pulse", triggerActivityDigest: "sha256:test", internalService: { customer: "urn:ame:koios.news", provider: "urn:micro-enterprise:koios.news:publication-operations" } },
  });
  appendKoiosAct({
    dataRoot: dataDir,
    ledger: "contract-events",
    instant: "2026-07-19T10:05:00.000Z",
    act: "publication.internal-service.settled",
    subject: "assignment-free",
    data: { disposition: "published", code: "cloudflare-release-pending", triggerActor: "urn:colony:cold-red-gate:clockkeeper", triggerCapability: "urn:test:clockkeeper-capability", triggerPulseId: "urn:test:clockkeeper-pulse", triggerActivityDigest: "sha256:test", internalService: { customer: "urn:ame:koios.news", provider: "urn:micro-enterprise:koios.news:publication-operations" } },
  });
  appendKoiosAct({
    dataRoot: dataDir,
    ledger: "internal-market",
    instant: "2026-07-19T10:09:30.000Z",
    act: "internal-service.receipt.settled",
    subject: "urn:test:internal-receipt",
    data: { id: "urn:test:internal-receipt", buyer: "urn:ame:koios.news", seller: "urn:micro-enterprise:koios.news:publication-operations", payment: { monetaryClaim: false } },
  });

  const reading = publicationOperationsReading({ posts: [], items: [], dataDir, correctionCount: 0 });
  assert.deepEqual(reading.resources.inferenceCarriers, { "claude-code-cli-invocations": 1, "google-ai-studio-api-requests": 1, "groq-api-requests": 1 });
  assert.deepEqual(reading.resources.inferenceAccessClasses, { "free-allocation": 2, "leader-subscription": 1 });
  assert.equal(reading.resources.freeAllocationInferenceSettlementCount, 2);
  assert.equal(reading.resources.leaderSubscriptionInferenceSettlementCount, 1);
  assert.deepEqual(reading.resources.writerRoute.configuredTierOrder, ["free-groq", "free-gemini", "free-nim", "leader-claude"]);
  assert.match(reading.resources.writerRoute.providerFailure, /continue-forward-within-the-accepted-finite-route/u);
  assert.deepEqual(reading.resources.writerRoute.selectedTierCounts, { "free-groq": 1, "leader-claude": 1 });
  assert.equal(reading.cadence.clockkeeperInitiatedCycleCount, 1);
  assert.deepEqual(reading.cadence.latestScheduleDeliveryInitiatedCycle, { pulseId: "urn:test:clockkeeper-pulse", assignmentId: "assignment-free" });
  assert.equal(reading.cadence.clockkeeperSettledCycleCount, 1);
  assert.deepEqual(reading.cadence.latestScheduleDeliverySettledCycle, { disposition: "published", code: "cloudflare-release-pending", pulseId: "urn:test:clockkeeper-pulse", assignmentId: "assignment-free" });
  assert.equal(reading.internalMarket.customer, "urn:ame:koios.news");
  assert.equal(reading.internalMarket.provider, "urn:micro-enterprise:koios.news:publication-operations");
  assert.equal(reading.internalMarket.internalTradeIsReal, true);
  assert.equal(reading.internalMarket.settledReceiptCount, 2);
  assert.equal(reading.internalMarket.edges.find((edge) => edge.contract === "koios.news/keyword-opportunity-research/v1").buyer, "urn:micro-enterprise:koios.news:journalism-commissioning");
  assert.match(reading.internalMarket.topology, /keyword research sells opportunity briefs/u);
  assert.match(reading.internalMarket.relationship, /buys publication cycles/u);
  assert.match(reading.internalMarket.consolidationRule, /eliminate one-for-one/u);
  assert.match(reading.internalMarket.valueAdjustment, /does not become outside revenue/u);
  assert.equal(reading.boundaries.availableArticleInventoryLotCount, 1);
  assert.equal(reading.boundaries.latestArticleInventoryLot.externalRevenueObserved, false);
  assert.equal(reading.boundaries.aadsPerformance.inventoryRouting.mode, "bootstrap-unobserved");
  assert.equal(reading.quality.independentEditorialJudgmentCount, 2);
  assert.equal(reading.quality.acceptedEditorialJudgmentCount, 1);
  assert.equal(reading.quality.revisionEditorialJudgmentCount, 1);
  assert.equal(reading.quality.toolValidatedEditorialJudgmentCount, 2);
  assert.equal(reading.quality.exactAcceptedManuscriptCount, 1);
  assert.deepEqual(reading.quality.latestIndependentEditorialJudgment, { at: "2026-07-19T10:07:00.000Z", slug: "free-draft", disposition: "accept", toolSelectionValidated: true });
  assert.equal(reading.sourcing.sourceCorpusRefreshCount, 1);
  assert.equal(reading.sourcing.sourceBundleSettlementCount, 1);
  assert.deepEqual(reading.sourcing.latestSourceBundleSettlement, { at: "2026-07-19T10:08:01.000Z", offered: 4, admitted: 3, duplicates: 1, collisions: 0, refused: 0, deliveryDigest: "sha256:source-delivery" });
  assert.equal(reading.publication.portfolio.nextRequiredBand, "core");
  assert.deepEqual(reading.publication.portfolio.observed, { dailyReach: 1, dailyCore: 0, weeklyDepth: 0 });
  assert.match(reading.publication.portfolio.law[0], /does not fabricate internal revenue/u);
  assert.equal(reading.asOf, "2026-07-19T10:09:32.000Z");
});
