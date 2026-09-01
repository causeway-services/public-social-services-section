#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { DEFAULT_DATA_DIR } from "./config.mts";
import { CLOUDFLARE_ATTENTION_CONTRACT, settleCloudflareAttention } from "./management/cloudflare-attention-contract.mts";
import { appendKoiosAct, readKoiosLedger, recordDigest, type JsonObject } from "./management/ledger.mts";

const CONTEXT = "https://www.w3.org/ns/activitystreams";
const PUBLICATION = "https://koios.news/activitypub/actor";
const CLOCKKEEPER = "urn:colony:cold-red-gate:clockkeeper";
export const ATTENTION_IMPORT_CONTRACT = "koios-news/attention-import/v1";
export const ATTENTION_IMPORT_CAPABILITY = "urn:capability:koios-news:clockkeeper:cold-red-gate:attention-import:v1";

function argument(name: string): string | undefined { const index = process.argv.indexOf(name); return index === -1 ? undefined : process.argv[index + 1]; }
function object(value: unknown): value is JsonObject { return value !== null && typeof value === "object" && !Array.isArray(value); }
function response(activity: JsonObject, type: "Accept" | "Reject", payload: JsonObject): JsonObject { return { "@context": CONTEXT, type, actor: PUBLICATION, target: activity["actor"] ?? "urn:actor:unidentified", ...(typeof activity["id"] === "string" ? { inReplyTo: activity["id"] } : {}), object: { type: "AttentionImportSettlement", contract: ATTENTION_IMPORT_CONTRACT, ...payload } }; }

let activity: JsonObject = {};
try {
  const parsed: unknown = JSON.parse(readFileSync(0, "utf8"));
  if (!object(parsed)) throw new Error("attention import requires one ActivityStreams object");
  activity = parsed;
} catch (error) { process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`); process.exitCode = 1; }

if (process.exitCode !== 1) {
  const demand = object(activity["object"]) ? activity["object"] : undefined;
  if (activity["@context"] !== CONTEXT || activity["type"] !== "Create" || activity["target"] !== PUBLICATION || activity["actor"] !== CLOCKKEEPER || activity["capability"] !== ATTENTION_IMPORT_CAPABILITY || demand?.["type"] !== "AttentionImportDemand" || demand["contract"] !== ATTENTION_IMPORT_CONTRACT || typeof demand["pulseId"] !== "string") {
    process.stdout.write(`${JSON.stringify(response(activity, "Reject", { code: "unauthorized-or-invalid-demand", customerMutation: false }))}\n`);
    process.exitCode = 2;
  } else {
    const now = argument("--now") ?? (typeof activity["published"] === "string" ? activity["published"] : new Date().toISOString());
    const throughDay = now.slice(0, 10);
    const fromDay = new Date(Date.parse(`${throughDay}T00:00:00.000Z`) - 30 * 86_400_000).toISOString().slice(0, 10);
    const dataDir = resolve(argument("--data-dir") ?? DEFAULT_DATA_DIR);
    const settlement = settleCloudflareAttention({ fromDay, throughDay, now });
    if (!settlement.accepted) {
      process.stdout.write(`${JSON.stringify(response(activity, "Reject", { code: "provider-refused", providerOutcome: settlement.outcome, customerMutation: false }))}\n`);
      process.exitCode = 2;
    } else {
      const circuit = readKoiosLedger(dataDir, "contract-events");
      const prior = readKoiosLedger(dataDir, "attention");
      let recorded = 0;
      for (const reading of settlement.readings) {
        const slug = reading.path.replace(/^\/posts\//u, "");
        const cellDigest = recordDigest({ contract: CLOUDFLARE_ATTENTION_CONTRACT, reading });
        if (prior.some((entry) => object(entry["data"]) && entry["data"]["providerCellDigest"] === cellDigest)) continue;
        const issue = circuit.filter((entry) => object(entry["data"]) && entry["data"]["slug"] === slug && String(entry["act"]).endsWith(".completed")).at(-1);
        await appendKoiosAct({
          dataRoot: dataDir,
          ledger: "attention",
          instant: now,
          act: "attention.article-loads.observed",
          subject: typeof issue?.["subject"] === "string" ? issue["subject"] : slug,
          data: { assignmentId: issue?.["subject"] ?? null, slug, path: reading.path, day: reading.day, observedLoads: reading.observedLoads, firstObservedAt: reading.firstObservedAt, lastObservedAt: reading.lastObservedAt, provider: "urn:ame:resource-brokerage-team", providerContract: CLOUDFLARE_ATTENTION_CONTRACT, providerCellDigest: cellDigest, excludesRecognizedAutomatedUserAgents: reading.excludesRecognizedAutomatedUserAgents, storesReaderIdentifiers: false, storesReferrers: false, factualWarrant: false },
        });
        recorded += 1;
      }
      process.stdout.write(`${JSON.stringify(response(activity, "Accept", { pulseId: demand["pulseId"], window: { fromDay, throughDay }, providerContract: CLOUDFLARE_ATTENTION_CONTRACT, readingCount: settlement.readings.length, recordedCount: recorded, customerMutation: recorded > 0, mutation: recorded > 0 ? `appended ${recorded} new aggregate attention observation(s)` : "none; provider cells were already settled" }))}\n`);
    }
  }
}
