#!/usr/bin/env node

import { settleNewsroomRepairReplay } from "./management/newsroom-repair-replay.mjs";

function argument(name: string): string | undefined { const index = process.argv.indexOf(name); return index === -1 ? undefined : process.argv[index + 1]; }

const assignmentId = argument("--assignment-id");
if (assignmentId === undefined || assignmentId.trim() === "") throw new TypeError("operate-newsroom-repair requires --assignment-id");
const settlement = await settleNewsroomRepairReplay({
  assignmentId,
  ...(argument("--now") === undefined ? {} : { now: argument("--now")! }),
  ...(argument("--data-dir") === undefined ? {} : { dataDir: argument("--data-dir")! }),
  ...(argument("--content-dir") === undefined ? {} : { contentDir: argument("--content-dir")! }),
  ...(argument("--out") === undefined ? {} : { outputDir: argument("--out")! }),
  ...(process.env["LISS_INFERENCE_SOCKET"] === undefined ? {} : { socketPath: process.env["LISS_INFERENCE_SOCKET"]! }),
});
process.stdout.write(`${JSON.stringify(settlement, null, 2)}\n`);
