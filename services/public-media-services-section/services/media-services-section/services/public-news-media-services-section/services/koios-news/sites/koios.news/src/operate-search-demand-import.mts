#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { DEFAULT_DATA_DIR } from "./config.mts";
import { appendKoiosAct, recordDigest, type JsonObject } from "./management/ledger.mts";

const CONTEXT = "https://www.w3.org/ns/activitystreams";
const PUBLICATION = "https://koios.news/activitypub/actor";
const CLOCKKEEPER = "urn:colony:cold-red-gate:clockkeeper";
export const SEARCH_DEMAND_IMPORT_CONTRACT = "koios-news/search-demand-import/v1";
export const SEARCH_DEMAND_IMPORT_CAPABILITY = "urn:capability:koios-news:clockkeeper:cold-red-gate:search-demand-import:v1";
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

import { argument } from "@red-cup-engineering/parse-javascript-argv-service";
function object(value: unknown): value is JsonObject { return value !== null && typeof value === "object" && !Array.isArray(value); }
function response(activity: JsonObject, type: "Accept" | "Reject", payload: JsonObject): JsonObject { return { "@context": CONTEXT, type, actor: PUBLICATION, target: activity["actor"] ?? "urn:actor:unidentified", ...(typeof activity["id"] === "string" ? { inReplyTo: activity["id"] } : {}), object: { type: "SearchDemandImportSettlement", contract: SEARCH_DEMAND_IMPORT_CONTRACT, ...payload } }; }
function dayOffset(day: string, offset: number): string { return new Date(Date.parse(`${day}T00:00:00.000Z`) + offset * 86_400_000).toISOString().slice(0, 10); }

let activity: JsonObject = {};
try {
  const parsed: unknown = JSON.parse(readFileSync(0, "utf8"));
  if (!object(parsed)) throw new Error("search-demand import requires one ActivityStreams object");
  activity = parsed;
} catch (error) { process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`); process.exitCode = 1; }

if (process.exitCode !== 1) {
  const demand = object(activity["object"]) ? activity["object"] : undefined;
  if (activity["@context"] !== CONTEXT || activity["type"] !== "Create" || activity["target"] !== PUBLICATION || activity["actor"] !== CLOCKKEEPER || activity["capability"] !== SEARCH_DEMAND_IMPORT_CAPABILITY || demand?.["type"] !== "SearchDemandImportDemand" || demand["contract"] !== SEARCH_DEMAND_IMPORT_CONTRACT || typeof demand["pulseId"] !== "string") {
    process.stdout.write(`${JSON.stringify(response(activity, "Reject", { code: "unauthorized-or-invalid-demand", customerMutation: false }))}\n`);
    process.exitCode = 2;
  } else {
    const now = argument("--now") ?? (typeof activity["published"] === "string" ? activity["published"] : new Date().toISOString());
    const throughDay = now.slice(0, 10);
    const fromDay = dayOffset(throughDay, -28);
    const dataDir = resolve(argument("--data-dir") ?? DEFAULT_DATA_DIR);
    const outputPath = join(dataDir, "records", "search-console.json");
    const executable = join(ROOT, "node_modules", ".bin", "content-demand-pull");
    const args = [`--property=sc-domain:koios.news`, `--start=${fromDay}`, `--end=${throughDay}`, `--out=${outputPath}`];
    const keyFile = process.env["KOIOS_SEARCH_CONSOLE_KEY_FILE"];
    if (keyFile !== undefined && keyFile.trim() !== "") args.push(`--key-file=${resolve(keyFile)}`);
    const run = spawnSync(executable, args, { cwd: ROOT, encoding: "utf8", timeout: 120_000, env: process.env });
    if (run.status !== 0 || !existsSync(outputPath)) {
      const obstruction = (run.stderr || run.stdout || run.error?.message || `content-demand-pull exited ${run.status}`).replace(/\s+/gu, " ").trim().slice(0, 1200);
      await appendKoiosAct({ dataRoot: dataDir, ledger: "audience-product", instant: now, act: "search-demand.import-obstructed", subject: "sc-domain:koios.news", data: { provider: "google-search-console", contract: SEARCH_DEMAND_IMPORT_CONTRACT, fromDay, throughDay, obstruction, requiredMove: "admit-search-console-service-account-or-repair-provider-route", factualWarrant: false } });
      process.stdout.write(`${JSON.stringify(response(activity, "Reject", { code: "provider-obstructed", pulseId: demand["pulseId"], fromDay, throughDay, obstruction, requiredMove: "admit-search-console-service-account-or-repair-provider-route", customerMutation: true }))}\n`);
      process.exitCode = 2;
    } else {
      const reading = JSON.parse(readFileSync(outputPath, "utf8")) as JsonObject;
      const queries = Array.isArray(reading["queries"]) ? reading["queries"] : [];
      const readingDigest = recordDigest(reading);
      await appendKoiosAct({ dataRoot: dataDir, ledger: "audience-product", instant: now, act: "search-demand.observed", subject: "sc-domain:koios.news", data: { provider: "google-search-console", contract: SEARCH_DEMAND_IMPORT_CONTRACT, fromDay, throughDay, queryCount: queries.length, readingDigest, outputPath, factualWarrant: false } });
      process.stdout.write(`${JSON.stringify(response(activity, "Accept", { pulseId: demand["pulseId"], fromDay, throughDay, queryCount: queries.length, readingDigest, customerMutation: true }))}\n`);
    }
  }
}
