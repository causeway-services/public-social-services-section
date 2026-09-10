#!/usr/bin/env node
import process from "node:process";
import { resolve } from "node:path";

import { loadPosts } from "./content.mjs";
import {
  DEFAULT_CONTENT_DIR,
  DEFAULT_DATA_DIR,
  DEFAULT_DEMAND_RECORD,
  demandReading,
  readSearchConsole,
  writeDemandRecord,
} from "./demand.mjs";
import { viewCounts, viewStore } from "./views.mjs";

function valueAfter(args: readonly string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  return index < 0 ? undefined : args[index + 1];
}

const args = process.argv.slice(2);
const contentDir = resolve(valueAfter(args, "--content") ?? DEFAULT_CONTENT_DIR);
const dataDir = resolve(valueAfter(args, "--data") ?? DEFAULT_DATA_DIR);
const out = resolve(valueAfter(args, "--out") ?? DEFAULT_DEMAND_RECORD);
const reading = demandReading({
  posts: await loadPosts(contentDir),
  views: viewCounts(viewStore(dataDir)),
  searchConsole: await readSearchConsole(dataDir),
});

if (!args.includes("--no-write")) await writeDemandRecord(reading, out);
process.stdout.write(`${JSON.stringify(reading, null, 2)}\n`);
