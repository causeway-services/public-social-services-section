#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { queryJournalRecords } from "./record-journal.mjs";
import { NODE_ROOT, channelIdentity } from "./channel.mjs";
import { observePublicRelease, PUBLICATION_CATEGORY, SCHEDULE_CATEGORY } from "./public-release.mjs";
import { authorizedFetch, loadEnvironment, refreshAccessToken } from "./private-draft-pilot.mjs";
import { REFRESH_TOKEN_ENV } from "./oauth-setup.mjs";
import { authorReleaseNotice, RELEASE_NOTICE_CATEGORY } from "./release-notice.mjs";
import { DISTRIBUTION_COMMISSION_CATEGORY, DISTRIBUTION_PROCESSING_RECEIPT_CATEGORY, processDistribution, selectUnprocessedNotice } from "./release-distribution.mjs";

export function selectPendingPublication(schedules, publications) {
  const completed = new Set(publications.map((row) => row.scheduledPublicationReceipt));
  return schedules.filter((row) => row.status === "scheduled-not-observed" && !completed.has(row.id)).sort((a, b) => Date.parse(a.publishAt) - Date.parse(b.publishAt))[0] ?? null;
}
export async function runPendingPublicationObservation(options = {}) {
  const at = options.at ?? new Date().toISOString(), dataRoot = resolve(options.dataRoot ?? join(NODE_ROOT, "data")), publications = await queryJournalRecords(PUBLICATION_CATEGORY), notices = await queryJournalRecords(RELEASE_NOTICE_CATEGORY);
  const missingNotice = publications.filter((row) => row.publicUrl && !notices.some((notice) => notice.channelRelease === row.id)).sort((a, b) => Date.parse(a.publishedAt) - Date.parse(b.publishedAt))[0];
  if (missingNotice) await (options.authorNotice ?? authorReleaseNotice)(missingNotice, { dataRoot, witnessJournalAgentUrl: options.witnessJournalAgentUrl ?? process.env.WITNESS_JOURNAL_RDF_AGENT, at });
  const recoverable = selectUnprocessedNotice(await queryJournalRecords(RELEASE_NOTICE_CATEGORY), await queryJournalRecords(DISTRIBUTION_COMMISSION_CATEGORY), await queryJournalRecords(DISTRIBUTION_PROCESSING_RECEIPT_CATEGORY));
  if (recoverable) { const receipt = await (options.processDistribution ?? processDistribution)(recoverable, { dataRoot, witnessJournalAgentUrl: options.witnessJournalAgentUrl ?? process.env.WITNESS_JOURNAL_RDF_AGENT, at, client: options.distributionClient }); return { type: "ArtificialIntelligencePendingPublicationObservationRun", status: "release-distribution-planned", releaseNotice: recoverable.id, distributionPlan: receipt.deliveryPlan, distributionProcessingReceipt: receipt.id, at }; }
  const scheduledReceipt = selectPendingPublication(await queryJournalRecords(SCHEDULE_CATEGORY), publications);
  if (!scheduledReceipt) return { type: "ArtificialIntelligencePendingPublicationObservationRun", status: "no-pending-scheduled-publication", at };
  const env = options.environment ?? loadEnvironment(), token = await (options.refreshToken ?? refreshAccessToken)({ clientId: env.YOUTUBE_OAUTH_CLIENT_ID, clientSecret: env.YOUTUBE_OAUTH_CLIENT_SECRET, refreshToken: env[REFRESH_TOKEN_ENV] }), capability = options.authorizedFetch ?? authorizedFetch(token);
  const result = await (options.observe ?? observePublicRelease)({ scheduledReceipt }, { authorizedFetch: capability, expectedChannelId: channelIdentity().youtubeChannelId, dataRoot, at }), notice = result.publicUrl ? await (options.authorNotice ?? authorReleaseNotice)(result, { dataRoot, at }) : null, distribution = notice ? await (options.processDistribution ?? processDistribution)(notice, { dataRoot, at, client: options.distributionClient }) : null;
  return { type: "ArtificialIntelligencePendingPublicationObservationRun", status: result.publicUrl ? "public-and-processed-observed" : "pending-venue-transition", scheduledPublicationReceipt: scheduledReceipt.id, youtubeVideoId: scheduledReceipt.youtubeVideoId, publishAt: scheduledReceipt.publishAt, result: result.id ?? result.observation, releaseNotice: notice?.id ?? null, distributionPlan: distribution?.deliveryPlan ?? null, distributionProcessingReceipt: distribution?.id ?? null, at };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) await runPendingPublicationObservation().then((result) => process.stdout.write(`${JSON.stringify(result)}\n`)).catch((error) => { process.stderr.write(`refused: ${error.message}\n`); process.exitCode = 78; });
