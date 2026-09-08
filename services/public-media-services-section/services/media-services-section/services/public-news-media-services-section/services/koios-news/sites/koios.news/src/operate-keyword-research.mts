#!/usr/bin/env node

import { readFileSync } from "node:fs";

import { settleKeywordOpportunityResearchOrder } from "./management/keyword-opportunity-service.mts";

import { argument } from "@red-cup-engineering/javascript-argv-parsing-services-section/parse-javascript-argv";

const input = JSON.parse(readFileSync(0, "utf8")) as Readonly<Record<string, unknown>>;
const result = await settleKeywordOpportunityResearchOrder(input, {
  ...(argument("--now") === undefined ? {} : { now: argument("--now")! }),
  ...(argument("--data-dir") === undefined ? {} : { dataDir: argument("--data-dir")! }),
  ...(argument("--content-dir") === undefined ? {} : { contentDir: argument("--content-dir")! }),
  ...(argument("--config") === undefined ? {} : { configPath: argument("--config")! }),
});
process.stdout.write(`${JSON.stringify(result)}\n`);
if (result["type"] === "Reject") process.exitCode = 2;
