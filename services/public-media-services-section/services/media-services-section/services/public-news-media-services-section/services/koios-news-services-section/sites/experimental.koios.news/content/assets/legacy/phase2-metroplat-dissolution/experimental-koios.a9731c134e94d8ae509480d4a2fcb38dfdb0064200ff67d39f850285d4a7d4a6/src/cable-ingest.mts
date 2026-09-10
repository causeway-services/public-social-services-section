#!/usr/bin/env node
import process from "node:process";

import { ingestKoiosCable } from "./cable.mjs";

function valueAfter(args: readonly string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index < 0) return undefined;
  return args[index + 1];
}

function listAfter(args: readonly string[], flag: string): readonly string[] | undefined {
  const value = valueAfter(args, flag);
  if (value === undefined) return undefined;
  return Object.freeze(value.split(",").map((item) => item.trim()).filter(Boolean));
}

const args = process.argv.slice(2);
const timeout = valueAfter(args, "--fetch-timeout-ms");
const results = await ingestKoiosCable({
  ...(valueAfter(args, "--config") === undefined ? {} : { configPath: valueAfter(args, "--config")! }),
  ...(valueAfter(args, "--store") === undefined ? {} : { storeDir: valueAfter(args, "--store")! }),
  ...(timeout === undefined ? {} : { fetchTimeoutMs: Number(timeout) }),
  ...(listAfter(args, "--wires") === undefined ? {} : { wires: listAfter(args, "--wires")! }),
  onSkip: (message) => process.stderr.write(`${message}\n`),
});

for (const result of results) {
  process.stdout.write(
    `${result.wire}: ${result.projected} projected, ${result.written} rows written, ${result.skipped} skipped` +
      `${result.errors.length > 0 ? `, ${result.errors.length} errors` : ""}\n`,
  );
}
