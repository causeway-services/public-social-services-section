#!/usr/bin/env node
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { computeClaimTopicDistribution } from "../src/topic-distribution.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_STORE_ROOT = resolve(HERE, "..", "..", "..", "sites", "koios.news", "store");

/**
 * Parses `--store <path>` from an argv slice; defaults to the real koios.news
 * claim store.
 * @param {string[]} argv `process.argv.slice(2)`.
 * @returns {string} The resolved store root.
 */
function storeRootFrom(argv) {
  const flagIndex = argv.indexOf("--store");
  if (flagIndex === -1) return DEFAULT_STORE_ROOT;
  const value = argv[flagIndex + 1];
  if (!value) throw new TypeError("--store requires a path argument");
  return resolve(value);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const storeRoot = storeRootFrom(process.argv.slice(2));
    const distribution = computeClaimTopicDistribution({ storeRoot });
    process.stdout.write(`${JSON.stringify(distribution, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`measure-claim-topic-distribution: ${error.message}\n`);
    process.exitCode = 2;
  }
}
