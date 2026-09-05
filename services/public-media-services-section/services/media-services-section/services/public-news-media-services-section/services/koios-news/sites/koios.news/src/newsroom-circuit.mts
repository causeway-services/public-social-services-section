#!/usr/bin/env node

import { runNewsroomCircuit } from "./management/newsroom-circuit.mts";

import { argument } from "@red-cup-engineering/parse-javascript-argv-service";

const maxRepairs = argument("--max-repairs");
const result = await runNewsroomCircuit({
  ...(argument("--assignment") === undefined ? {} : { assignmentId: argument("--assignment")! }),
  ...(argument("--now") === undefined ? {} : { now: argument("--now")! }),
  ...(argument("--out") === undefined ? {} : { outputDir: argument("--out")! }),
  ...(maxRepairs === undefined ? {} : { maxRepairs: Number(maxRepairs) }),
});
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (result.disposition !== "published") process.exitCode = 1;
