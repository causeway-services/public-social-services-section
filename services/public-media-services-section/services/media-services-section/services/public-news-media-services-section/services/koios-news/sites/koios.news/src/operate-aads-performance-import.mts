#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { DEFAULT_DATA_DIR } from "./config.mts";
import { AADS_PUBLIC_PERFORMANCE_CONTRACT, aAdsSupplierHealth, readAAdsPublicStats, readAAdsPublicUnitState, type AAdsPublicUnitState } from "./management/aads-public-performance.mts";
import { appendKoiosAct, readKoiosLedger, recordDigest, type JsonObject } from "./management/ledger.mts";
import { DEFAULT_A_ADS_UNITS } from "./theme.mts";

const CONTEXT = "https://www.w3.org/ns/activitystreams";
const PUBLICATION = "https://koios.news/activitypub/actor";
const CLOCKKEEPER = "urn:colony:cold-red-gate:clockkeeper";
export const AADS_PERFORMANCE_IMPORT_CONTRACT = "koios-news/aads-performance-import/v1";
export const AADS_PERFORMANCE_IMPORT_CAPABILITY = "urn:capability:koios-news:clockkeeper:cold-red-gate:aads-performance-import:v1";

function argument(name: string): string | undefined { const index = process.argv.indexOf(name); return index === -1 ? undefined : process.argv[index + 1]; }
function object(value: unknown): value is JsonObject { return value !== null && typeof value === "object" && !Array.isArray(value); }
function response(activity: JsonObject, type: "Accept" | "Reject", payload: JsonObject): JsonObject { return { "@context": CONTEXT, type, actor: PUBLICATION, target: activity["actor"] ?? "urn:actor:unidentified", ...(typeof activity["id"] === "string" ? { inReplyTo: activity["id"] } : {}), object: { type: "AAdsPerformanceImportSettlement", contract: AADS_PERFORMANCE_IMPORT_CONTRACT, ...payload } }; }

let activity: JsonObject = {};
try {
  const parsed: unknown = JSON.parse(readFileSync(0, "utf8"));
  if (!object(parsed)) throw new Error("AADS performance import requires one ActivityStreams object");
  activity = parsed;
} catch (error) { process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`); process.exitCode = 1; }

if (process.exitCode !== 1) {
  const demand = object(activity["object"]) ? activity["object"] : undefined;
  if (activity["@context"] !== CONTEXT || activity["type"] !== "Create" || activity["target"] !== PUBLICATION || activity["actor"] !== CLOCKKEEPER || activity["capability"] !== AADS_PERFORMANCE_IMPORT_CAPABILITY || demand?.["type"] !== "AAdsPerformanceImportDemand" || demand["contract"] !== AADS_PERFORMANCE_IMPORT_CONTRACT || typeof demand["pulseId"] !== "string") {
    process.stdout.write(`${JSON.stringify(response(activity, "Reject", { code: "unauthorized-or-invalid-demand", customerMutation: false }))}\n`);
    process.exitCode = 2;
  } else {
    const now = argument("--now") ?? (typeof activity["published"] === "string" ? activity["published"] : new Date().toISOString());
    const throughDay = now.slice(0, 10);
    const fromDay = new Date(Date.parse(`${throughDay}T00:00:00.000Z`) - 30 * 86_400_000).toISOString().slice(0, 10);
    const dataDir = resolve(argument("--data-dir") ?? DEFAULT_DATA_DIR);
    const prior = readKoiosLedger(dataDir, "advertising");
    let readingCount = 0;
    let recordedCount = 0;
    let unitStateCount = 0;
    const unitStates: AAdsPublicUnitState[] = [];
    const obstructions: JsonObject[] = [];
    for (const unitId of DEFAULT_A_ADS_UNITS) {
      try {
        const unitState = await readAAdsPublicUnitState(unitId);
        unitStates.push(unitState);
        unitStateCount += 1;
        const stateCellDigest = recordDigest({ contract: AADS_PUBLIC_PERFORMANCE_CONTRACT, unitState });
        if (!prior.some((entry) => object(entry["data"]) && entry["data"]["providerCellDigest"] === stateCellDigest)) {
          await appendKoiosAct({
            dataRoot: dataDir,
            ledger: "advertising",
            instant: now,
            act: "advertising.aads-unit-state.observed",
            subject: unitId,
            data: { ...unitState, provider: "aads.com", providerContract: AADS_PUBLIC_PERFORMANCE_CONTRACT, providerCellDigest: stateCellDigest, revenueObserved: false, revenueMicros: null, factualWarrant: false },
          });
          recordedCount += 1;
        }
        const readings = await readAAdsPublicStats({ unitId, fromDay, throughDay });
        readingCount += readings.length;
        for (const reading of readings) {
          const providerCellDigest = recordDigest({ contract: AADS_PUBLIC_PERFORMANCE_CONTRACT, reading });
          if (prior.some((entry) => object(entry["data"]) && entry["data"]["providerCellDigest"] === providerCellDigest)) continue;
          await appendKoiosAct({
            dataRoot: dataDir,
            ledger: "advertising",
            instant: now,
            act: "advertising.aads-unit-day.observed",
            subject: unitId,
            data: { ...reading, provider: "aads.com", providerContract: AADS_PUBLIC_PERFORMANCE_CONTRACT, providerCellDigest, revenueObserved: false, revenueMicros: null, storesReaderIdentifiers: false, factualWarrant: false },
          });
          recordedCount += 1;
        }
      } catch (error) {
        obstructions.push({ unitId, message: error instanceof Error ? error.message : String(error) });
      }
    }
    if (unitStates.length > 0) {
      const supplierHealth = aAdsSupplierHealth(unitStates);
      const healthCellDigest = recordDigest({ contract: AADS_PUBLIC_PERFORMANCE_CONTRACT, supplierHealth });
      if (!prior.some((entry) => object(entry["data"]) && entry["data"]["providerCellDigest"] === healthCellDigest)) {
        await appendKoiosAct({ dataRoot: dataDir, ledger: "advertising", instant: now, act: "advertising.supplier-health.observed", subject: "aads.com", data: { ...supplierHealth, provider: "aads.com", providerContract: AADS_PUBLIC_PERFORMANCE_CONTRACT, providerCellDigest: healthCellDigest } });
        recordedCount += 1;
      }
    }
    if (readingCount === 0) {
      process.stdout.write(`${JSON.stringify(response(activity, "Reject", { code: "provider-unavailable", window: { fromDay, throughDay }, obstructions, customerMutation: false }))}\n`);
      process.exitCode = 2;
    } else {
      process.stdout.write(`${JSON.stringify(response(activity, "Accept", { pulseId: demand["pulseId"], window: { fromDay, throughDay }, providerContract: AADS_PUBLIC_PERFORMANCE_CONTRACT, unitCount: DEFAULT_A_ADS_UNITS.length, unitStateCount, readingCount, recordedCount, obstructionCount: obstructions.length, obstructions, revenueObserved: false, revenueStatus: "not-exposed-by-public-unit-statistics", customerMutation: recordedCount > 0 }))}\n`);
    }
  }
}
