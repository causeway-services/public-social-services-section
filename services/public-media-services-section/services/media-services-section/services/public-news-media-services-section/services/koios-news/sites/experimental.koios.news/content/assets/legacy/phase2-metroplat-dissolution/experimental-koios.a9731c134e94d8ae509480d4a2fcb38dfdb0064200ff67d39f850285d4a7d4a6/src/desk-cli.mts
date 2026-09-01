#!/usr/bin/env node
import process from "node:process";
import { resolve } from "node:path";

import { loadPosts } from "./content.mjs";
import {
  DEFAULT_CABLE_STORE_DIR,
  DEFAULT_DESK_DATA_DIR,
  runDesk,
} from "./desk.mjs";
import {
  DEFAULT_CONTENT_DIR,
  DEFAULT_DEMAND_RECORD,
} from "./demand.mjs";
import { viewCounts, viewStore } from "./views.mjs";

function valueAfter(args: readonly string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  return index < 0 ? undefined : args[index + 1];
}

const args = process.argv.slice(2);
const contentDir = resolve(valueAfter(args, "--content") ?? DEFAULT_CONTENT_DIR);
const dataDir = resolve(valueAfter(args, "--data") ?? DEFAULT_DESK_DATA_DIR);
const cableStoreDir = resolve(valueAfter(args, "--store") ?? DEFAULT_CABLE_STORE_DIR);
const demandRecordPath = resolve(valueAfter(args, "--demand") ?? DEFAULT_DEMAND_RECORD);

const result = await runDesk({
  posts: await loadPosts(contentDir),
  views: viewCounts(viewStore(dataDir)),
  dataDir,
  cableStoreDir,
  demandRecordPath,
});

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
