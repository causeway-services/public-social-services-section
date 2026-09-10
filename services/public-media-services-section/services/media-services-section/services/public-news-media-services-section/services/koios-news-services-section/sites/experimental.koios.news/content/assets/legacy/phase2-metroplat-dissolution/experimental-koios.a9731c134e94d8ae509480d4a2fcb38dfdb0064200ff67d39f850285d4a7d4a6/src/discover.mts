#!/usr/bin/env node
import process from "node:process";
import { resolve } from "node:path";

import {
  DEFAULT_CABLE_CONFIG,
  DEFAULT_STORE_DIR,
  googleTrendsProbe,
  keywordDiscoveryReading,
} from "./discovery.mjs";
import { DEFAULT_CONTENT_DIR } from "./demand.mjs";

function valueAfter(args: readonly string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  return index < 0 ? undefined : args[index + 1];
}

const args = process.argv.slice(2);
const trends = args.includes("--no-trends")
  ? undefined
  : await googleTrendsProbe({ geo: valueAfter(args, "--geo") ?? "US" });
const perBeatValue = valueAfter(args, "--per-beat");
const reading = await keywordDiscoveryReading({
  configPath: resolve(valueAfter(args, "--config") ?? DEFAULT_CABLE_CONFIG),
  contentDir: resolve(valueAfter(args, "--content") ?? DEFAULT_CONTENT_DIR),
  storeDir: resolve(valueAfter(args, "--store") ?? DEFAULT_STORE_DIR),
  ...(perBeatValue === undefined ? {} : { perBeatKeywords: Number(perBeatValue) }),
  ...(trends === undefined ? {} : { trends }),
});

process.stdout.write(`${JSON.stringify(reading, null, 2)}\n`);
