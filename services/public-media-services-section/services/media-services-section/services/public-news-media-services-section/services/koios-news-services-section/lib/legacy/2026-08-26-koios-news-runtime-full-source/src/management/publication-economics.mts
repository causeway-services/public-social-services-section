// Koios-owned economic projection for one published product.
//
// Provider list-price estimates, contracted cash prices, and externally
// receipted revenue remain different measurements. The audience planner may
// use their conservative allocation cost; none of them can warrant reporting.

import { appendKoiosAct, readKoiosLedger, recordDigest, type JsonObject } from "./ledger.mjs";

type RecordValue = Readonly<Record<string, unknown>>;

export type PublicationEconomicReading = Readonly<{
  kind: "koios.publication-economic-reading";
  version: 1;
  assignmentId: string;
  assignmentLineage: readonly string[];
  slug: string;
  providerUsageReceipts: number;
  contractedCashCostMicros: number;
  providerEstimatedCostMicros: number;
  allocationCostMicros: number;
  unpricedResourceUses: number;
  externalRevenueReceiptCount: number;
  revenueObserved: boolean;
  revenueMicros: number;
  directContractMarginMicros: number | null;
  profitStatus: "unproven-no-external-revenue-receipt" | "direct-contract-margin-observed";
  factualWarrant: false;
  readingDigest: string;
}>;

function record(value: unknown): RecordValue {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as RecordValue : Object.freeze({});
}

function nonnegativeMicros(value: unknown): number {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? Math.round(amount) : 0;
}

function usdMicros(value: unknown): number {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 1_000_000) : 0;
}

function modelUsageCostMicros(data: RecordValue): number {
  return Object.values(record(data["modelUsage"])).reduce<number>((sum, value) => sum + usdMicros(record(value)["costUSD"]), 0);
}

function usdPriceMicros(data: RecordValue): number {
  const price = record(data["price"]);
  return String(price["currency"] ?? "").toUpperCase() === "USD" ? usdMicros(price["amount"]) : 0;
}

function attributed(entry: RecordValue, assignmentIds: ReadonlySet<string>, slug: string): boolean {
  const data = record(entry["data"]);
  if (data["slug"] === slug || assignmentIds.has(String(data["assignmentId"] ?? ""))) return true;
  const searchable = `${String(entry["subject"] ?? "")} ${String(data["purpose"] ?? "")}`;
  return searchable.includes(slug) || [...assignmentIds].some((assignmentId) => searchable.includes(assignmentId));
}

export function assignmentLineageFromRecords(records: readonly RecordValue[], assignmentId: string): readonly string[] {
  const predecessorBySuccessor = new Map<string, string>();
  for (const entry of records) {
    if (entry["kind"] !== "koios.assignment-successor-witness") continue;
    const assignment = record(entry["assignment"]);
    const successor = String(assignment["assignmentId"] ?? "");
    const predecessor = String(entry["predecessorAssignmentId"] ?? "");
    if (successor !== "" && predecessor !== "") predecessorBySuccessor.set(successor, predecessor);
  }
  const lineage: string[] = [];
  const seen = new Set<string>();
  let cursor: string | undefined = assignmentId;
  while (cursor !== undefined && cursor !== "" && !seen.has(cursor)) {
    lineage.push(cursor);
    seen.add(cursor);
    cursor = predecessorBySuccessor.get(cursor);
  }
  return Object.freeze(lineage);
}

export function publicationEconomicReading(input: Readonly<{
  assignmentId: string;
  assignmentRecords?: readonly RecordValue[];
  providerUsage?: readonly RecordValue[];
  revenueCost?: readonly RecordValue[];
  slug: string;
}>): PublicationEconomicReading {
  const assignmentLineage = assignmentLineageFromRecords(input.assignmentRecords ?? [], input.assignmentId);
  const assignmentIds = new Set(assignmentLineage);
  const usage = (input.providerUsage ?? []).filter((entry) => attributed(entry, assignmentIds, input.slug));
  const uniqueInference = new Map<string, RecordValue>();
  const uniqueServices = new Map<string, RecordValue>();
  for (const entry of usage) {
    const key = String(entry["subject"] ?? entry["recordDigest"] ?? recordDigest(entry));
    if (entry["act"] === "inference.consumed") uniqueInference.set(key, entry);
    if (entry["act"] === "provider.service.consumed") uniqueServices.set(key, entry);
  }
  const providerEstimatedCostMicros = [...uniqueInference.values()].reduce((sum, entry) => sum + modelUsageCostMicros(record(entry["data"])), 0);
  const contractedCashCostMicros = [...uniqueServices.values()].reduce((sum, entry) => sum + usdPriceMicros(record(entry["data"])), 0);
  const unpricedResourceUses = [...uniqueInference.values()].filter((entry) => {
    const data = record(entry["data"]);
    const cost = record(data["cost"]);
    return modelUsageCostMicros(data) === 0 && cost["denomination"] !== undefined;
  }).length;
  const revenueReceipts = (input.revenueCost ?? []).filter((entry) => {
    const data = record(entry["data"]);
    return entry["act"] === "external.revenue.received"
      && (data["slug"] === input.slug || assignmentIds.has(String(data["assignmentId"] ?? "")))
      && typeof data["receiptDigest"] === "string"
      && typeof data["counterparty"] === "string";
  });
  const revenueMicros = revenueReceipts.reduce((sum, entry) => sum + nonnegativeMicros(record(entry["data"])["revenueMicros"]), 0);
  const revenueObserved = revenueReceipts.length > 0;
  const allocationCostMicros = Math.max(contractedCashCostMicros, providerEstimatedCostMicros);
  const body = Object.freeze({
    kind: "koios.publication-economic-reading" as const,
    version: 1 as const,
    assignmentId: input.assignmentId,
    assignmentLineage,
    slug: input.slug,
    providerUsageReceipts: uniqueInference.size + uniqueServices.size,
    contractedCashCostMicros,
    providerEstimatedCostMicros,
    allocationCostMicros,
    unpricedResourceUses,
    externalRevenueReceiptCount: revenueReceipts.length,
    revenueObserved,
    revenueMicros,
    directContractMarginMicros: revenueObserved ? revenueMicros - contractedCashCostMicros : null,
    profitStatus: revenueObserved ? "direct-contract-margin-observed" as const : "unproven-no-external-revenue-receipt" as const,
    factualWarrant: false as const,
  });
  return Object.freeze({ ...body, readingDigest: recordDigest(body) });
}

export function settlePublicationEconomics(input: Readonly<{ dataDir: string; assignmentId: string; slug: string; now: string }>): PublicationEconomicReading {
  const reading = publicationEconomicReading({
    assignmentId: input.assignmentId,
    slug: input.slug,
    assignmentRecords: readKoiosLedger(input.dataDir, "assignments"),
    providerUsage: readKoiosLedger(input.dataDir, "provider-usage"),
    revenueCost: readKoiosLedger(input.dataDir, "revenue-cost"),
  });
  appendKoiosAct({
    dataRoot: input.dataDir,
    ledger: "revenue-cost",
    instant: input.now,
    act: "publication.economics.observed",
    subject: input.assignmentId,
    data: {
      ...reading,
      costMicros: reading.allocationCostMicros,
      costBasis: "maximum-of-contracted-cash-and-provider-estimated-usage",
      revenueBasis: reading.revenueObserved ? "exact-external-receipts" : "no-external-revenue-receipt",
      fixedSubscriptionAllocation: "unsettled",
    } as JsonObject,
  });
  return reading;
}
