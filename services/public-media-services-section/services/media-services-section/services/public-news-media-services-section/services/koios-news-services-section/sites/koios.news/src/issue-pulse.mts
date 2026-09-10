#!/usr/bin/env node

import { readActivityStreamsObjectFromStdin } from "./management/activity-ingress.mts";
import { settleIssuePulse } from "./management/issue-controller.mts";

import { argument } from "@red-cup-engineering/javascript-argv-parsing-services-section/parse-javascript-argv";

const now = argument("--now") ?? new Date().toISOString();
const activity = readActivityStreamsObjectFromStdin();
const result = await settleIssuePulse(activity, {
  now,
  ...(argument("--data-dir") === undefined ? {} : { dataDir: argument("--data-dir")! }),
  ...(argument("--content-dir") === undefined ? {} : { contentDir: argument("--content-dir")! }),
  ...(argument("--config") === undefined ? {} : { configPath: argument("--config")! }),
});
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
