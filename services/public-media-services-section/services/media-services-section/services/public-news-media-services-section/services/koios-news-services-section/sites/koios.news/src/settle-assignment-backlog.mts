#!/usr/bin/env node

import { settleBacklog } from "./management/backlog-settlement.mts";

import { argument } from "@red-cup-engineering/javascript-argv-parsing-services-section/parse-javascript-argv";

const now = argument("--now");
const result = await settleBacklog({ ...(now === undefined ? {} : { now }), apply: process.argv.includes("--apply") });
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
