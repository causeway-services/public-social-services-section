#!/usr/bin/env node
import { fileURLToPath } from "node:url";
import { executeCommissionPickupMessage } from "@coesite-operations/release-distribution-commission-a2a-service";
import { pickupDistributionCommission } from "./release-distribution.mjs";

const PROVIDER = "urn:ame:artificial-intelligence-youtube-channel-enterprise";

export function executeMessage(message, options = {}) {
  return executeCommissionPickupMessage(message, { provider: PROVIDER, pickup: pickupDistributionCommission, pickupOptions: options });
}

async function main() {
  let input = "";
  process.stdin.setEncoding("utf8");
  for await (const chunk of process.stdin) input += chunk;
  const response = await executeMessage(JSON.parse(input), { dataRoot: process.env.ARTIFICIAL_INTELLIGENCE_YOUTUBE_DATA_ROOT });
  process.stdout.write(`${JSON.stringify(response)}\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 2;
});
