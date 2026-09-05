#!/usr/bin/env node
import { buildPublication } from "../src/publication.mjs";

function usage() {
  return `Usage: koios-news-static-delivery --content <posts-dir> --out <output-dir> [--operations <operations.json>] [--production-baseline <directory>] [--wire <store-feed-output-dir> --desks <desks.json>] [--replace]\n`;
}

const arguments_ = process.argv.slice(2);
if (arguments_.includes("--help") || arguments_.includes("-h")) {
  process.stdout.write(usage());
  process.exit(0);
}
const values = new Map();
let replace = false;
for (let index = 0; index < arguments_.length; index += 1) {
  const flag = arguments_[index];
  if (flag === "--replace") { replace = true; continue; }
  if (!["--content", "--out", "--operations", "--production-baseline", "--wire", "--desks"].includes(flag)) throw new Error(`unknown option: ${flag}`);
  const value = arguments_[index + 1];
  if (value === undefined || value.startsWith("--")) throw new Error(`missing value for ${flag}`);
  values.set(flag, value);
  index += 1;
}
if (!values.has("--content") || !values.has("--out")) throw new Error(usage().trim());
try {
  const result = buildPublication({ contentDir: values.get("--content"), outputDir: values.get("--out"), operationsPath: values.get("--operations"), productionBaselineDir: values.get("--production-baseline"), wireDir: values.get("--wire"), desksPath: values.get("--desks"), replace });
  process.stdout.write(`${JSON.stringify(result)}\n`);
} catch (error) {
  process.stderr.write(`koios-news-static-delivery: ${error.message}\n`);
  process.exitCode = 1;
}
