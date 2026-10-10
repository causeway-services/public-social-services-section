#!/usr/bin/env node
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { NODE_ROOT, channelIdentity } from "./channel.mjs";
import { REFRESH_TOKEN_ENV } from "./oauth-setup.mjs";
import { createAuthorizedFetch, loadChannelEnvironment, loadPilotInputs, readExactJson, refreshAccessToken } from "./private-pilot.mjs";
import { observePublicRelease, schedulePublicRelease } from "./public-release.mjs";

const MODES = new Map([["--execute-schedule-public", "schedule"], ["--observe-public", "observe"]]);
const VALUES = new Map([
  ["--claim", "claimPath"], ["--inventory", "inventoryPath"], ["--video", "videoPath"], ["--metadata", "metadataPath"],
  ["--thumbnail", "thumbnailPath"], ["--release-claim-id", "releaseClaimId"], ["--scheduled-receipt", "scheduledReceiptPath"],
  ["--data-root", "dataRoot"], ["--runtime-root", "runtimeRoot"], ["--category-id", "categoryId"], ["--at", "at"],
]);

export function parsePublicReleaseCli(argv) {
  const parsed = { mode: null };
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    if (MODES.has(flag)) { if (parsed.mode) throw new TypeError("public release command requires exactly one mode"); parsed.mode = MODES.get(flag); continue; }
    const key = VALUES.get(flag); if (!key) throw new TypeError(`unknown public-release argument ${flag}`);
    const value = argv[index += 1]; if (!value || value.startsWith("--")) throw new TypeError(`${flag} requires one value`); parsed[key] = value;
  }
  if (!parsed.mode) throw new TypeError("public release command requires --execute-schedule-public or --observe-public");
  if (!parsed.dataRoot || !resolve(parsed.dataRoot)) throw new TypeError("public release command requires --data-root");
  if (parsed.at && !Number.isFinite(Date.parse(parsed.at))) throw new TypeError("--at must be an ISO timestamp");
  if (parsed.mode === "schedule") {
    for (const key of ["claimPath", "inventoryPath", "videoPath", "metadataPath", "releaseClaimId", "runtimeRoot"]) if (!parsed[key]) throw new TypeError(`scheduled public release requires ${key}`);
  } else if (!parsed.scheduledReceiptPath) throw new TypeError("publication observation requires --scheduled-receipt");
  return parsed;
}

function credentials(env) { return { clientId: env.YOUTUBE_OAUTH_CLIENT_ID, clientSecret: env.YOUTUBE_OAUTH_CLIENT_SECRET, refreshToken: env[REFRESH_TOKEN_ENV] }; }

export async function executePublicReleaseCli(cli, options = {}) {
  const env = options.env ?? loadChannelEnvironment(), activation = options.activation ?? readExactJson(join(NODE_ROOT, "content/config/activation.json"), "channel activation");
  const token = await (options.refresh ?? refreshAccessToken)(credentials(env), { fetchImpl: options.fetchImpl });
  const authorizedFetch = (options.authorize ?? createAuthorizedFetch)(token.accessToken, { fetchImpl: options.fetchImpl });
  const common = { activation, expectedChannelId: channelIdentity().youtubeChannelId, authorizedFetch, dataRoot: resolve(cli.dataRoot),
    witnessJournalAgentUrl: env.WITNESS_JOURNAL_RDF_AGENT, at: cli.at ?? new Date().toISOString(), fetchImpl: options.fetchImpl };
  if (cli.mode === "observe") return observePublicRelease({ scheduledReceipt: readExactJson(cli.scheduledReceiptPath, "scheduled publication receipt") }, common);
  const inputs = loadPilotInputs(cli); if (inputs.releaseClaim.id !== cli.releaseClaimId) throw new TypeError("scheduled public release requires the exact --release-claim-id");
  return schedulePublicRelease(inputs, { ...common, runtimeRoot: resolve(cli.runtimeRoot), categoryId: cli.categoryId, uploadFetch: options.uploadFetch });
}

export async function main(argv = process.argv.slice(2)) {
  const result = await executePublicReleaseCli(parsePublicReleaseCli(argv)); process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
