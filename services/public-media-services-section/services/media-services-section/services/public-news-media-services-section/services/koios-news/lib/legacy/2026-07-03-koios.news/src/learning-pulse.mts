#!/usr/bin/env node

import { inspectNewsroomLearning, settleNewsroomLearningPulse } from "./management/newsroom-learning.mjs";

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

const now = argument("--now") ?? new Date().toISOString();
const pulseId = argument("--pulse") ?? `koios-learning-${now}`;
const input = { now, pulseId, ...(argument("--data") === undefined ? {} : { dataDir: argument("--data")! }) };
const result = process.argv.includes("--dry-run") ? inspectNewsroomLearning(input) : await settleNewsroomLearningPulse(input);
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
