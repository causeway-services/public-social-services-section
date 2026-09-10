#!/usr/bin/env node
import { readActivityStreamsObjectFromStdin } from "./management/activity-ingress.mjs";
import { settleIssuePulse } from "./management/issue-controller.mjs";
function argument(name) {
    const index = process.argv.indexOf(name);
    return index === -1 ? undefined : process.argv[index + 1];
}
const now = argument("--now") ?? new Date().toISOString();
const activity = readActivityStreamsObjectFromStdin();
const result = await settleIssuePulse(activity, {
    now,
    ...(argument("--data-dir") === undefined ? {} : { dataDir: argument("--data-dir") }),
    ...(argument("--content-dir") === undefined ? {} : { contentDir: argument("--content-dir") }),
    ...(argument("--config") === undefined ? {} : { configPath: argument("--config") }),
});
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
//# sourceMappingURL=issue-pulse.mjs.map