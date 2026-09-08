#!/usr/bin/env node

import { settleNewsroomRepairReplay } from "./management/newsroom-repair-replay.mts";

import { argument } from "@red-cup-engineering/javascript-argv-parsing-services-section/parse-javascript-argv";

const assignmentId = argument("--assignment-id");
if (assignmentId === undefined || assignmentId.trim() === "") throw new TypeError("operate-newsroom-repair requires --assignment-id");
const settlement = await settleNewsroomRepairReplay({
  assignmentId,
  ...(argument("--now") === undefined ? {} : { now: argument("--now")! }),
  ...(argument("--data-dir") === undefined ? {} : { dataDir: argument("--data-dir")! }),
  ...(argument("--content-dir") === undefined ? {} : { contentDir: argument("--content-dir")! }),
  ...(argument("--out") === undefined ? {} : { outputDir: argument("--out")! }),
});
process.stdout.write(`${JSON.stringify(settlement, null, 2)}\n`);
