#!/usr/bin/env node

import { runNewsroomCircuit } from "./management/newsroom-circuit.mjs";

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

const maxRepairs = argument("--max-repairs");
const result = await runNewsroomCircuit({
  ...(argument("--assignment") === undefined ? {} : { assignmentId: argument("--assignment")! }),
  ...(argument("--now") === undefined ? {} : { now: argument("--now")! }),
  ...(argument("--out") === undefined ? {} : { outputDir: argument("--out")! }),
  ...(maxRepairs === undefined ? {} : { maxRepairs: Number(maxRepairs) }),
});
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (result.disposition !== "published") process.exitCode = 1;
