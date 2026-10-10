#!/usr/bin/env node
import { lstatSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { authorizedFetch, loadEnvironment, refreshAccessToken } from "./private-draft-pilot.mjs";
import { executeScheduledUpload, planScheduledUpload } from "./scheduled-upload-bridge.mjs";
import { NODE_ROOT } from "./channel.mjs";
import { REFRESH_TOKEN_ENV } from "./oauth-setup.mjs";

function exactFile(relative, maximum, label) { if (typeof relative !== "string" || relative.startsWith("/") || relative.split("/").includes("..")) throw new TypeError(`${label} must be a settlement-relative path`); const path = resolve(NODE_ROOT, relative); if (path !== NODE_ROOT && !path.startsWith(`${NODE_ROOT}/`)) throw new TypeError(`${label} escapes the channel settlement`); const stat = lstatSync(path); if (stat.isSymbolicLink() || !stat.isFile() || stat.size < 1 || stat.size > maximum) throw new TypeError(`${label} must be an exact bounded regular file`); return { path, bytes: readFileSync(path) }; }
export function loadReleaseQueue(path = join(NODE_ROOT, "content/config/release-queue.json")) { const value = JSON.parse(readFileSync(path, "utf8")); if (value?.type !== "ModernBusinessScheduledReleaseQueue" || value.version !== 1 || value.maximumUploadsPerRun !== 1 || !Array.isArray(value.entries) || new Set(value.entries.map((row) => row?.id)).size !== value.entries.length) throw new TypeError("modern-business release queue is malformed"); return value; }
export async function runRoutineScheduler(options = {}) {
  const now = options.at ?? new Date().toISOString(), queue = options.queue ?? loadReleaseQueue(), pending = [];
  for (const entry of queue.entries) { const video = exactFile(entry.video, 8_000_000_000, "queued video"), metadataFile = exactFile(entry.metadata, 1_000_000, "queued metadata"), metadata = JSON.parse(metadataFile.bytes.toString("utf8")); if (Date.parse(entry.publishAt) <= Date.parse(now)) continue; const plan = planScheduledUpload({ videoBytes: video.bytes, metadata, publishAt: entry.publishAt, now }); pending.push({ entry, video, metadata, plan }); }
  if (!pending.length) return { type: "ModernBusinessRoutineSchedulerResult", disposition: "no-future-queued-release", processed: [] };
  const selected = pending.sort((left, right) => Date.parse(left.entry.publishAt) - Date.parse(right.entry.publishAt))[0];
  const env = options.env ?? loadEnvironment(), accessToken = await refreshAccessToken({ clientId: env.YOUTUBE_OAUTH_CLIENT_ID, clientSecret: env.YOUTUBE_OAUTH_CLIENT_SECRET, refreshToken: env[REFRESH_TOKEN_ENV] }, options.fetchImpl);
  const result = await executeScheduledUpload({ videoBytes: selected.video.bytes, metadata: selected.metadata, publishAt: selected.entry.publishAt }, { execute: true, operationId: selected.plan.id, dataRoot: resolve(NODE_ROOT, "data"), runtimeRoot: resolve(NODE_ROOT, "data/runtime/routine-scheduler"), witnessJournalAgentUrl: env.WITNESS_JOURNAL_RDF_AGENT ?? "http://127.0.0.1:19764/.well-known/agent-card.json", activation: JSON.parse(readFileSync(join(NODE_ROOT, "content/config/activation.json"), "utf8")), authorizedFetch: authorizedFetch(accessToken, options.fetchImpl), uploadFetch: options.uploadFetch, at: now });
  return { type: "ModernBusinessRoutineSchedulerResult", disposition: "processed", processed: [{ queueEntry: selected.entry.id, operation: selected.plan.id, result }] };
}
if (process.argv[1] === new URL(import.meta.url).pathname) runRoutineScheduler().then((value) => process.stdout.write(`${JSON.stringify(value)}\n`)).catch((error) => { process.stderr.write(`refused: ${error.message}\n`); process.exitCode = 78; });
