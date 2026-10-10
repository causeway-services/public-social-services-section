#!/usr/bin/env node
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { querySettlementRecords } from "./journal-client.mjs";
import { NODE_ROOT, channelIdentity } from "./channel.mjs";
import { observePublicRelease, PUBLICATION_CATEGORY, SCHEDULE_CATEGORY } from "./public-release.mjs";
import { createAuthorizedFetch, loadChannelEnvironment, refreshAccessToken } from "./private-pilot.mjs";
import { REFRESH_TOKEN_ENV } from "./oauth-setup.mjs";
import { authorReleaseNotice, RELEASE_NOTICE_CATEGORY } from "./release-notice.mjs";
import { DISTRIBUTION_COMMISSION_CATEGORY, DISTRIBUTION_PROCESSING_RECEIPT_CATEGORY, processDistribution, selectUnprocessedNotice } from "./release-distribution.mjs";
import { requireSettlementAccountId, settlementAccountIdFromEnvironment } from "./settlement-account.mjs";
export function selectPendingPublication(schedules, publications) { const completed = new Set(publications.map((row) => row.scheduledPublicationReceipt)); return schedules.filter((row) => row.status === "scheduled-not-observed" && !completed.has(row.id)).sort((a, b) => Date.parse(a.publishAt) - Date.parse(b.publishAt))[0] ?? null; }
export async function runPendingPublicationObservation(options = {}) {
  const settlementAccountId = requireSettlementAccountId(options.settlementAccountId);
  const at = options.at ?? new Date().toISOString(), dataRoot = resolve(options.dataRoot ?? join(NODE_ROOT, "data")), publications = await querySettlementRecords(PUBLICATION_CATEGORY, { dataRoot }), notices = await querySettlementRecords(RELEASE_NOTICE_CATEGORY, { dataRoot });
  const missingNotice = publications.filter((row) => row.publicUrl && !notices.some((notice) => notice.channelRelease === row.id)).sort((a, b) => Date.parse(a.publishedAt) - Date.parse(b.publishedAt))[0];
  if (missingNotice) await (options.authorNotice ?? authorReleaseNotice)(missingNotice, { dataRoot, witnessJournalAgentUrl: options.witnessJournalAgentUrl ?? process.env.WITNESS_JOURNAL_RDF_AGENT, at });
  const recoverable = selectUnprocessedNotice(await querySettlementRecords(RELEASE_NOTICE_CATEGORY, { dataRoot }), await querySettlementRecords(DISTRIBUTION_COMMISSION_CATEGORY, { dataRoot }), await querySettlementRecords(DISTRIBUTION_PROCESSING_RECEIPT_CATEGORY, { dataRoot }));
  if (recoverable) { const receipt = await (options.processDistribution ?? processDistribution)(recoverable, { dataRoot, witnessJournalAgentUrl: options.witnessJournalAgentUrl ?? process.env.WITNESS_JOURNAL_RDF_AGENT, at, client: options.distributionClient }); return { type: "MathematicsPendingPublicationObservationRun", status: "release-distribution-planned", releaseNotice: recoverable.id, distributionPlan: receipt.deliveryPlan, distributionProcessingReceipt: receipt.id, at }; }
  const scheduledReceipt = selectPendingPublication(await querySettlementRecords(SCHEDULE_CATEGORY, { dataRoot }), publications);
  if (!scheduledReceipt) return { type: "MathematicsPendingPublicationObservationRun", status: "no-pending-scheduled-publication", at };
  const env = options.environment ?? loadChannelEnvironment(), token = await (options.refreshToken ?? refreshAccessToken)({ clientId: env.YOUTUBE_OAUTH_CLIENT_ID, clientSecret: env.YOUTUBE_OAUTH_CLIENT_SECRET, refreshToken: env[REFRESH_TOKEN_ENV] }), capability = options.authorizedFetch ?? createAuthorizedFetch(token.accessToken), result = await (options.observe ?? observePublicRelease)({ scheduledReceipt }, { authorizedFetch: capability, expectedChannelId: channelIdentity().youtubeChannelId, dataRoot, settlement: settlementAccountId, witnessJournalAgentUrl: options.witnessJournalAgentUrl ?? process.env.WITNESS_JOURNAL_RDF_AGENT, at });
  const notice = result.publicUrl ? await (options.authorNotice ?? authorReleaseNotice)(result, { dataRoot, witnessJournalAgentUrl: options.witnessJournalAgentUrl ?? process.env.WITNESS_JOURNAL_RDF_AGENT, at }) : null, distribution = notice ? await (options.processDistribution ?? processDistribution)(notice, { dataRoot, witnessJournalAgentUrl: options.witnessJournalAgentUrl ?? process.env.WITNESS_JOURNAL_RDF_AGENT, at, client: options.distributionClient }) : null;
  return { type: "MathematicsPendingPublicationObservationRun", status: result.publicUrl ? "public-and-processed-observed" : "pending-venue-transition", scheduledPublicationReceipt: scheduledReceipt.id, youtubeVideoId: scheduledReceipt.youtubeVideoId, publishAt: scheduledReceipt.publishAt, result: result.id ?? result.observation, releaseNotice: notice?.id ?? null, distributionPlan: distribution?.deliveryPlan ?? null, distributionProcessingReceipt: distribution?.id ?? null, at };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) await runPendingPublicationObservation({ settlementAccountId: settlementAccountIdFromEnvironment() }).then((result) => process.stdout.write(`${JSON.stringify(result)}\n`)).catch((error) => { process.stderr.write(`refused: ${error.message}\n`); process.exitCode = 78; });
