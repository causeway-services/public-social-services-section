#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { queryJournalRecords } from "./record-journal.mjs";
import { NODE_ROOT } from "./channel.mjs";
import { assertRequiredScopes, PRIVATE_DRAFT_UPDATE_SCOPES, REFRESH_TOKEN_ENV } from "./oauth-setup.mjs";
import { authorizedFetch, loadEnvironment, RECEIPT_CATEGORY as PRIVATE_CATEGORY, refreshAccessToken } from "./private-draft-pilot.mjs";
import { executePrivateDraftSchedule, planPrivateDraftSchedule, SCHEDULE_CATEGORY } from "./private-draft-schedule.mjs";
import { RELEASE_CATEGORY } from "./release.mjs";

export function selectPendingPrivateSchedule({ privateDraftReceipts, releaseClaims, scheduleReceipts, at }) {
  const scheduled = new Set(scheduleReceipts.map((row) => row.privateDraftReceipt));
  const claims = new Map(releaseClaims.map((row) => [row.inventoryAdmission, row]));
  return privateDraftReceipts
    .filter((row) => row.status === "private-draft-not-scheduled" && !scheduled.has(row.id))
    .map((privateDraftReceipt) => ({ privateDraftReceipt, releaseClaim: claims.get(privateDraftReceipt.inventoryAdmission) }))
    .filter((input) => input.releaseClaim && Date.parse(input.releaseClaim.plannedPublishAt) > Date.parse(at))
    .sort((left, right) => Date.parse(left.releaseClaim.plannedPublishAt) - Date.parse(right.releaseClaim.plannedPublishAt))[0] ?? null;
}

export async function runPendingSchedule(supplied = {}) {
  const at = supplied.at ?? new Date().toISOString();
  const dataRoot = resolve(supplied.dataRoot ?? join(NODE_ROOT, "data"));
  const activation = supplied.activation ?? JSON.parse(readFileSync(join(NODE_ROOT, "content/config/activation.json"), "utf8"));
  const input = selectPendingPrivateSchedule({
    privateDraftReceipts: await queryJournalRecords(PRIVATE_CATEGORY),
    releaseClaims: await queryJournalRecords(RELEASE_CATEGORY),
    scheduleReceipts: await queryJournalRecords(SCHEDULE_CATEGORY),
    at,
  });
  if (!input) return { type: "ArtificialIntelligencePendingScheduleRun", status: "no-future-unscheduled-private-draft", at };
  if (activation.youtubeWrites !== "granted") return { type: "ArtificialIntelligencePendingScheduleRun", status: "withheld-pending-full-write-activation", privateDraftReceipt: input.privateDraftReceipt.id, releaseClaim: input.releaseClaim.id, at };
  const env = supplied.environment ?? loadEnvironment();
  const token = await (supplied.refreshToken ?? refreshAccessToken)(
    { clientId: env.YOUTUBE_OAUTH_CLIENT_ID, clientSecret: env.YOUTUBE_OAUTH_CLIENT_SECRET, refreshToken: env[REFRESH_TOKEN_ENV] },
    supplied.fetchImpl,
    PRIVATE_DRAFT_UPDATE_SCOPES,
  );
  if (supplied.grantedScopes) assertRequiredScopes(supplied.grantedScopes, PRIVATE_DRAFT_UPDATE_SCOPES);
  const capability = supplied.authorizedFetch ?? authorizedFetch(token, supplied.fetchImpl);
  const operation = planPrivateDraftSchedule(input, at);
  const receipt = await (supplied.execute ?? executePrivateDraftSchedule)(input, {
    execute: true,
    operationId: operation.id,
    activation,
    authorizedFetch: capability,
    dataRoot,
    runtimeRoot: resolve(supplied.runtimeRoot ?? join(dataRoot, "runtime/private-draft-schedule-locks")),
    at,
  });
  return { type: "ArtificialIntelligencePendingScheduleRun", status: "scheduled-and-observed-private", receipt: receipt.id, youtubeVideoId: receipt.youtubeVideoId, publishAt: receipt.publishAt, at };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await runPendingSchedule().then((result) => process.stdout.write(`${JSON.stringify(result)}\n`)).catch((error) => {
    process.stderr.write(`refused: ${error.message}\n`);
    process.exitCode = 78;
  });
}
