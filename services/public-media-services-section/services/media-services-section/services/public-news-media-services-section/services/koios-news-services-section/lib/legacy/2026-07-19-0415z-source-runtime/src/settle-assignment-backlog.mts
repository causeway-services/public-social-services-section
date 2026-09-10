#!/usr/bin/env node

import { settleBacklog } from "./management/backlog-settlement.mjs";

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

const now = argument("--now");
const result = settleBacklog({ ...(now === undefined ? {} : { now }), apply: process.argv.includes("--apply") });
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
