#!/usr/bin/env node

import { settleBacklog } from "./management/backlog-settlement.mts";

import { argument } from "@red-cup-engineering/parse-javascript-argv-service";

const now = argument("--now");
const result = await settleBacklog({ ...(now === undefined ? {} : { now }), apply: process.argv.includes("--apply") });
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
