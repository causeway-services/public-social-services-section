#!/usr/bin/env node
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { DEFAULT_DATA_DIR } from "./config.mjs";
import { appendProviderUsage } from "./management/ledger.mjs";
function argument(name) {
    const index = process.argv.indexOf(name);
    return index === -1 ? undefined : process.argv[index + 1];
}
function jsonlFiles(root) {
    try {
        return readdirSync(root, { withFileTypes: true }).flatMap((entry) => entry.isDirectory()
            ? jsonlFiles(join(root, entry.name))
            : entry.name.endsWith(".jsonl") ? [join(root, entry.name)] : []);
    }
    catch {
        return [];
    }
}
const now = argument("--now");
if (now === undefined)
    throw new Error("provider usage projection requires --now with an explicit UTC instant");
const dataRoot = resolve(DEFAULT_DATA_DIR);
const sources = ["editorial-judgments", "draft-repairs"];
let projected = 0;
for (const source of sources)
    for (const path of [...jsonlFiles(join(dataRoot, "records", source))].sort()) {
        for (const line of readFileSync(path, "utf8").split("\n").filter(Boolean)) {
            const record = JSON.parse(line);
            const providerResult = record["providerResult"] ?? record["inference"]?.["providerResult"];
            if (providerResult === undefined)
                continue;
            projected += appendProviderUsage({ dataRoot, instant: now, providerResult, purpose: `${source}:${String(record["slug"] ?? "unspecified")}` }).length;
        }
    }
process.stdout.write(`${JSON.stringify({ kind: "koios.provider-usage-projection", projected })}\n`);
//# sourceMappingURL=project-provider-usage.mjs.map