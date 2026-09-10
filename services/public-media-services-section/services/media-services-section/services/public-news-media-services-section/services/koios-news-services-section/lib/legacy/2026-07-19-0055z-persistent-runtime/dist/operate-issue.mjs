#!/usr/bin/env node
import { readActivityStreamsObjectFromStdin } from "./management/activity-ingress.mjs";
import { settleIssuePulse } from "./management/issue-controller.mjs";
import { runNewsroomCircuit } from "./management/newsroom-circuit.mjs";
function argument(name) {
    const index = process.argv.indexOf(name);
    return index === -1 ? undefined : process.argv[index + 1];
}
const now = argument("--now") ?? new Date().toISOString();
const pulse = readActivityStreamsObjectFromStdin();
const settlement = await settleIssuePulse(pulse, {
    now,
    ...(argument("--data-dir") === undefined ? {} : { dataDir: argument("--data-dir") }),
    ...(argument("--content-dir") === undefined ? {} : { contentDir: argument("--content-dir") }),
    ...(argument("--config") === undefined ? {} : { configPath: argument("--config") }),
});
if (settlement["type"] !== "Accept") {
    process.stdout.write(`${JSON.stringify({ kind: "koios.news.issue-operation", disposition: "refused", pulse: settlement }, null, 2)}\n`);
}
else {
    const object = settlement["object"];
    const assignmentId = String(object["assignmentId"] ?? "");
    const maxRepairs = Number(argument("--max-repairs") ?? 3);
    const result = await runNewsroomCircuit({ assignmentId, now, maxRepairs, ...(argument("--out") === undefined ? {} : { outputDir: argument("--out") }) });
    process.stdout.write(`${JSON.stringify({ kind: "koios.news.issue-operation", disposition: result.disposition, pulse: settlement, newsroom: result }, null, 2)}\n`);
}
//# sourceMappingURL=operate-issue.mjs.map