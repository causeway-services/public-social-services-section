import { readFileSync } from "node:fs";

import { DEFAULT_ISSUE_POLICY, DEFAULT_WRITER_INFERENCE_ROUTING } from "./config.mjs";
import type { KoiosPost } from "./content.mjs";
import { EDITORIAL_PIPELINE_CONTEXT, EDITORIAL_PIPELINE_CONTEXT_TOTAL_BYTES } from "./generated/editorial-pipeline-context.mjs";
import { readKoiosLedger, recordDigest, type JsonObject } from "./management/ledger.mjs";
import { auditReports, publicItems, type KoiosItem } from "./surface.mjs";

type RecordValue = Readonly<Record<string, unknown>>;

function record(value: unknown): RecordValue {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as RecordValue : Object.freeze({});
}

function instant(value: unknown): string | undefined {
  return typeof value === "string" && Number.isFinite(Date.parse(value)) ? value : undefined;
}

function latest(records: readonly Readonly<JsonObject>[], acts?: ReadonlySet<string>): Readonly<JsonObject> | undefined {
  return records
    .filter((entry) => acts === undefined || acts.has(String(entry["act"] ?? "")))
    .sort((left, right) => String(left["recordedAt"] ?? "").localeCompare(String(right["recordedAt"] ?? "")))
    .at(-1);
}

function nextOccurrence(firstDueAt: string | undefined, intervalSeconds: number | undefined, floor: string): string | undefined {
  if (firstDueAt === undefined || intervalSeconds === undefined || !Number.isFinite(intervalSeconds) || intervalSeconds < 60) return undefined;
  const first = Date.parse(firstDueAt);
  const lower = Date.parse(floor);
  if (!Number.isFinite(first) || !Number.isFinite(lower)) return undefined;
  if (first >= lower) return new Date(first).toISOString();
  return new Date(first + Math.ceil((lower - first) / (intervalSeconds * 1_000)) * intervalSeconds * 1_000).toISOString();
}

function tally(values: readonly string[]): Readonly<Record<string, number>> {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return Object.freeze(Object.fromEntries([...counts.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))));
}

function inferenceAccessClass(denomination: string): "free-allocation" | "leader-subscription" | "unclassified" {
  if (["groq-api-requests", "gemini-api-requests", "google-ai-studio-api-requests", "nvidia-nim-api-requests"].includes(denomination)) return "free-allocation";
  if (denomination === "claude-code-cli-invocations") return "leader-subscription";
  return "unclassified";
}

function clockkeeperSchedule(records: readonly Readonly<JsonObject>[], operation: string): Readonly<JsonObject> | undefined {
  return latest(records.filter((entry) => String(record(record(entry["data"])["target"])["operation"] ?? "") === operation), new Set(["clockkeeper.schedule.accepted", "clockkeeper.schedule.replaced"]));
}

function scheduleReading(schedule: Readonly<JsonObject> | undefined, floor: string): Readonly<Record<string, unknown>> | null {
  if (schedule === undefined) return null;
  const data = record(schedule["data"]);
  const firstDueAt = instant(data["firstDueAt"]);
  const intervalSeconds = Number(data["intervalSeconds"]);
  return Object.freeze({
    provider: String(data["provider"] ?? "urn:colony:cold-red-gate:clockkeeper"),
    firstDueAt: firstDueAt ?? null,
    intervalSeconds: Number.isFinite(intervalSeconds) ? intervalSeconds : null,
    nextScheduledAttemptAt: nextOccurrence(firstDueAt, intervalSeconds, floor) ?? null,
    operation: String(record(data["target"])["operation"] ?? "unknown"),
  });
}

export function publicationOperationsReading(input: Readonly<{
  posts: readonly KoiosPost[];
  items: readonly KoiosItem[];
  dataDir: string;
  correctionCount: number;
}>): Readonly<Record<string, unknown>> {
  const contractEvents = readKoiosLedger(input.dataDir, "contract-events");
  const providerUsage = readKoiosLedger(input.dataDir, "provider-usage");
  const deployments = readKoiosLedger(input.dataDir, "deployments");
  const corrections = readKoiosLedger(input.dataDir, "corrections-omissions");
  const revenueCost = readKoiosLedger(input.dataDir, "revenue-cost");
  const attention = readKoiosLedger(input.dataDir, "attention");
  const advertising = readKoiosLedger(input.dataDir, "advertising");
  const researchLessons = readKoiosLedger(input.dataDir, "research-lessons");
  const allRecords = [...contractEvents, ...providerUsage, ...deployments, ...corrections, ...revenueCost, ...attention, ...advertising, ...researchLessons];
  const asOf = allRecords.flatMap((entry) => instant(entry["recordedAt"]) ?? []).sort().at(-1)
    ?? publicItems(input.items).flatMap((item) => instant(item.published) ?? []).sort().at(-1)
    ?? "1970-01-01T00:00:00.000Z";

  const policy = record(JSON.parse(readFileSync(DEFAULT_ISSUE_POLICY, "utf8")));
  const writerRouting = record(JSON.parse(readFileSync(DEFAULT_WRITER_INFERENCE_ROUTING, "utf8")));
  const minimumHours = Number(policy["minimumHoursBetweenNewIssues"] ?? 0);
  const completed = latest(contractEvents, new Set(["newsroom.circuit.completed"]));
  const completedAt = instant(completed?.["recordedAt"]);
  const nextEligibleAt = completedAt === undefined || !Number.isFinite(minimumHours)
    ? undefined
    : new Date(Date.parse(completedAt) + minimumHours * 3_600_000).toISOString();
  const publicationSchedule = clockkeeperSchedule(contractEvents, "operate-issue");
  const learningSchedule = clockkeeperSchedule(contractEvents, "operate-learning-pulse");
  const attentionSchedule = clockkeeperSchedule(contractEvents, "operate-attention-import");
  const aadsPerformanceSchedule = clockkeeperSchedule(contractEvents, "operate-aads-performance-import");
  const repairSchedule = clockkeeperSchedule(contractEvents, "operate-repair-pulse");
  const clockkeeperCycleStarts = contractEvents.filter((entry) => entry["act"] === "publication.cycle.started" && record(entry["data"])["triggerActor"] === "urn:colony:cold-red-gate:clockkeeper");
  const clockkeeperCycles = contractEvents.filter((entry) => entry["act"] === "publication.cycle.settled" && record(entry["data"])["triggerActor"] === "urn:colony:cold-red-gate:clockkeeper");
  const latestClockkeeperCycleStart = latest(clockkeeperCycleStarts);
  const latestClockkeeperCycleStartData = record(latestClockkeeperCycleStart?.["data"]);
  const latestClockkeeperCycle = latest(clockkeeperCycles);
  const latestClockkeeperCycleData = record(latestClockkeeperCycle?.["data"]);
  const attemptFloor = [asOf, nextEligibleAt].filter((value): value is string => value !== undefined).sort().at(-1) ?? asOf;
  const latestLearningProposal = latest(researchLessons, new Set(["newsroom.learning.proposed"]));
  const observedAttention = attention.filter((entry) => entry["act"] === "attention.article-loads.observed");
  const latestAttentionCells = new Map<string, Readonly<JsonObject>>();
  for (const entry of observedAttention.sort((left, right) => String(left["recordedAt"] ?? "").localeCompare(String(right["recordedAt"] ?? "")))) {
    const data = record(entry["data"]);
    latestAttentionCells.set(`${String(data["slug"] ?? entry["subject"] ?? "unknown")}:${String(data["day"] ?? "unknown")}`, entry);
  }
  const attentionLoadCount = [...latestAttentionCells.values()].reduce((total, entry) => total + Number(record(entry["data"])["observedLoads"] ?? 0), 0);
  const observedAAds = advertising.filter((entry) => entry["act"] === "advertising.aads-unit-day.observed");
  const latestAAdsCells = new Map<string, Readonly<JsonObject>>();
  for (const entry of observedAAds.sort((left, right) => String(left["recordedAt"] ?? "").localeCompare(String(right["recordedAt"] ?? "")))) {
    const data = record(entry["data"]);
    latestAAdsCells.set(`${String(data["unitId"] ?? entry["subject"] ?? "unknown")}:${String(data["day"] ?? "unknown")}`, entry);
  }
  const aadsTotals = [...latestAAdsCells.values()].reduce<{ adRequests: number; paidImpressions: number; affiliateImpressions: number; clicks: number }>((totals, entry) => {
    const data = record(entry["data"]);
    totals.adRequests += Number(data["adRequests"] ?? 0);
    totals.paidImpressions += Number(data["paidImpressions"] ?? 0);
    totals.affiliateImpressions += Number(data["affiliateImpressions"] ?? 0);
    totals.clicks += Number(data["clicks"] ?? 0);
    return totals;
  }, { adRequests: 0, paidImpressions: 0, affiliateImpressions: 0, clicks: 0 });

  const admittedItems = publicItems(input.items);
  const recentFloor = Date.parse(asOf) - 7 * 86_400_000;
  const recent = admittedItems.filter((item) => item.published !== undefined && Date.parse(item.published) >= recentFloor);
  const reports = auditReports(input.posts);
  const inference = providerUsage.filter((entry) => entry["act"] === "inference.consumed");
  const service = providerUsage.filter((entry) => entry["act"] === "provider.service.consumed");
  const providerNames = inference.map((entry) => String(record(entry["data"])["provider"] ?? "provider-recorded"));
  const modelNames = inference.map((entry) => String(record(entry["data"])["model"] ?? "provider-recorded-model"));
  const inferenceCarriers = inference.map((entry) => String(record(record(entry["data"])["cost"])["denomination"] ?? "unclassified"));
  const inferenceAccessClasses = inferenceCarriers.map(inferenceAccessClass);
  const writerDrafts = contractEvents.filter((entry) => entry["act"] === "newsroom.circuit.drafted");
  const writerTiers = writerDrafts.map((entry) => record(record(entry["data"])["writer"])["tier"]).filter((tier): tier is string => typeof tier === "string");
  const configuredWriterTiers = Array.isArray(writerRouting["tiers"])
    ? writerRouting["tiers"].map((tier) => record(tier)["id"]).filter((id): id is string => typeof id === "string")
    : [];
  const zeroMarginalServiceEvents = service.filter((entry) => Number(record(record(entry["data"])["price"])["amount"]) === 0).length;
  const latestDeployment = latest(deployments, new Set(["deployment.cloudflare-primary-static.witnessed", "deployment.cloudflare-primary.authority-transferred"]));
  const latestDeploymentData = record(latestDeployment?.["data"]);

  return Object.freeze({
    kind: "koios.publication-operations",
    canonicalOrigin: "https://koios.news",
    asOf,
    publicAuthority: String(latestDeploymentData["publicAuthority"] ?? "cloudflare-worker:koios-news-primary"),
    cadence: Object.freeze({
      minimumHoursBetweenNewIssues: minimumHours,
      latestCompletedAt: completedAt ?? null,
      nextEligibleAt: nextEligibleAt ?? null,
      schedule: scheduleReading(publicationSchedule, attemptFloor),
      clockkeeperInitiatedCycleCount: clockkeeperCycleStarts.length,
      latestClockkeeperInitiatedCycleAt: instant(latestClockkeeperCycleStart?.["recordedAt"]) ?? null,
      latestClockkeeperInitiatedCycle: latestClockkeeperCycleStart === undefined ? null : Object.freeze({
        pulseId: String(latestClockkeeperCycleStartData["triggerPulseId"] ?? "unknown"),
        assignmentId: String(latestClockkeeperCycleStart["subject"] ?? "unknown"),
      }),
      clockkeeperSettledCycleCount: clockkeeperCycles.length,
      latestClockkeeperSettledCycle: latestClockkeeperCycle === undefined ? null : Object.freeze({
        disposition: String(latestClockkeeperCycleData["disposition"] ?? "unknown"),
        code: String(latestClockkeeperCycleData["code"] ?? "unknown"),
        pulseId: String(latestClockkeeperCycleData["triggerPulseId"] ?? "unknown"),
        assignmentId: String(latestClockkeeperCycle["subject"] ?? "unknown"),
      }),
    }),
    publication: Object.freeze({
      publicArticleCount: admittedItems.length,
      recentArticleCount: recent.length,
      recentBeatCounts: tally(recent.flatMap((item) => item.section === undefined ? [] : [item.section.trim().toLowerCase()])),
      recentArticles: Object.freeze(recent.slice(0, 12).map((item) => Object.freeze({ title: item.headline, url: item.url, beat: item.section?.trim().toLowerCase() ?? null, published: item.published ?? null }))),
    }),
    quality: Object.freeze({
      auditedArticleCount: reports.length,
      publishableArticleCount: reports.filter((report) => report.publishable).length,
      correctionCount: input.correctionCount,
      releasedCorrectionCount: corrections.filter((entry) => entry["act"] === "correction.publication.released").length,
    }),
    knowledgeReuse: Object.freeze({
      editorialFailureContext: Object.freeze({
        activation: "included when a manuscript has not cleared the editorial gate",
        sourceCount: EDITORIAL_PIPELINE_CONTEXT.length,
        totalBytes: EDITORIAL_PIPELINE_CONTEXT_TOTAL_BYTES,
        bundleDigest: recordDigest(EDITORIAL_PIPELINE_CONTEXT),
        sources: Object.freeze(EDITORIAL_PIPELINE_CONTEXT.map((entry) => entry.sourceId)),
      }),
    }),
    resources: Object.freeze({
      inferenceSettlementCount: inference.length,
      serviceSettlementCount: service.length,
      zeroMarginalPriceServiceSettlementCount: zeroMarginalServiceEvents,
      inferenceProviders: tally(providerNames),
      inferenceModels: tally(modelNames),
      inferenceCarriers: tally(inferenceCarriers),
      inferenceAccessClasses: tally(inferenceAccessClasses),
      freeAllocationInferenceSettlementCount: inferenceAccessClasses.filter((value) => value === "free-allocation").length,
      leaderSubscriptionInferenceSettlementCount: inferenceAccessClasses.filter((value) => value === "leader-subscription").length,
      writerRoute: Object.freeze({
        selection: String(writerRouting["selection"] ?? "unrecorded"),
        configuredTierOrder: Object.freeze(configuredWriterTiers),
        draftSettlementCount: writerDrafts.length,
        selectionEvidenceCount: writerTiers.length,
        selectedTierCounts: tally(writerTiers),
        freeAllocationDraftSettlementCount: writerTiers.filter((tier) => tier.startsWith("free-")).length,
        leaderSubscriptionDraftSettlementCount: writerTiers.filter((tier) => tier.startsWith("leader-")).length,
      }),
      accountingNote: "Carrier classes report observed execution routes. Free-allocation means a provider free tier or included developer allocation; leader-subscription means an already-paid interactive subscription, not a metered cash charge.",
    }),
    adaptation: Object.freeze({
      replayReadyRepairCount: contractEvents.filter((entry) => entry["act"] === "newsroom.repair.replay-ready").length,
      resumedRepairCount: contractEvents.filter((entry) => entry["act"] === "newsroom.repair.resumed").length,
      refusedCandidateCount: contractEvents.filter((entry) => entry["act"] === "source-intelligence.candidate-refused").length,
      latestPublicReleaseWitnessAt: instant(latestDeployment?.["recordedAt"]) ?? null,
      learningProposalCount: researchLessons.filter((entry) => entry["act"] === "newsroom.learning.proposed").length,
      latestLearningProposalAt: instant(latestLearningProposal?.["recordedAt"]) ?? null,
      learningSchedule: scheduleReading(learningSchedule, asOf),
      attentionSchedule: scheduleReading(attentionSchedule, asOf),
      aadsPerformanceSchedule: scheduleReading(aadsPerformanceSchedule, asOf),
      repairSchedule: scheduleReading(repairSchedule, asOf),
      backgroundRepairSettlementCount: contractEvents.filter((entry) => entry["act"] === "newsroom.repair-replay.settled").length,
      latestBackgroundRepairAt: instant(latest(contractEvents, new Set(["newsroom.repair-replay.settled"]))?.["recordedAt"]) ?? null,
    }),
    boundaries: Object.freeze({
      searchDemandSuppliesFactualWarrant: false,
      attentionSuppliesFactualWarrant: false,
      advertisingSuppliesFactualWarrant: false,
      attentionEventCount: attention.length,
      aggregateArticleLoadCount: attentionLoadCount,
      observedArticleCount: new Set(observedAttention.map((entry) => String(record(entry["data"])["slug"] ?? entry["subject"] ?? ""))).size,
      latestAttentionImportAt: instant(latest(observedAttention)?.["recordedAt"]) ?? null,
      attentionCarrier: "cloudflare-worker-aggregate-attention/v1",
      attentionStoresReaderIdentifiers: false,
      advertisingEventCount: advertising.length,
      aadsPerformance: Object.freeze({
        carrier: "aads-public-ad-unit-statistics/v1",
        observedUnitCount: new Set(observedAAds.map((entry) => String(record(entry["data"])["unitId"] ?? entry["subject"] ?? ""))).size,
        observedDayCellCount: latestAAdsCells.size,
        ...aadsTotals,
        latestImportAt: instant(latest(observedAAds)?.["recordedAt"]) ?? null,
        revenueObserved: observedAAds.some((entry) => record(entry["data"])["revenueObserved"] === true),
        revenueStatus: "not-exposed-by-public-unit-statistics",
      }),
      revenueCostEventCount: revenueCost.length,
    }),
  });
}
