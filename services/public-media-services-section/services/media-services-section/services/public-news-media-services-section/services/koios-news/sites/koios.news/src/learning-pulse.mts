#!/usr/bin/env node

import { inspectNewsroomLearning, settleNewsroomLearningPulse } from "./management/newsroom-learning.mts";

import { argument } from "@red-cup-engineering/parse-javascript-argv-service";

const now = argument("--now") ?? new Date().toISOString();
const pulseId = argument("--pulse") ?? `koios-learning-${now}`;
const input = { now, pulseId, ...(argument("--data") === undefined ? {} : { dataDir: argument("--data")! }) };
const result = process.argv.includes("--dry-run") ? inspectNewsroomLearning(input) : await settleNewsroomLearningPulse(input);
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
