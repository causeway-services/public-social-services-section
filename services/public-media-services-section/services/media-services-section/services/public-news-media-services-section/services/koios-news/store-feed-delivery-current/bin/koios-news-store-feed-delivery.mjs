#!/usr/bin/env node
import { writeStoreFeedArtifacts } from "../src/store-feed-delivery.mjs";

function usage() {
  return `Usage: koios-news-store-feed-delivery --store <store-root> --out <output-dir> [--rss-path feed.xml] [--atom-path feed.atom] [--json-path feed.json] [--news-sitemap-path news-sitemap.xml] [--wire-path wire.json]\n`;
}

const arguments_ = process.argv.slice(2);
if (arguments_.includes("--help") || arguments_.includes("-h")) {
  process.stdout.write(usage());
  process.exit(0);
}
const flags = ["--store", "--out", "--rss-path", "--atom-path", "--json-path", "--news-sitemap-path", "--wire-path"];
const values = new Map();
for (let index = 0; index < arguments_.length; index += 1) {
  const flag = arguments_[index];
  if (!flags.includes(flag)) throw new Error(`unknown option: ${flag}`);
  const value = arguments_[index + 1];
  if (value === undefined || value.startsWith("--")) throw new Error(`missing value for ${flag}`);
  values.set(flag, value);
  index += 1;
}
if (!values.has("--store") || !values.has("--out")) throw new Error(usage().trim());
try {
  const result = writeStoreFeedArtifacts({
    storeRoot: values.get("--store"),
    outDir: values.get("--out"),
    paths: {
      rss: values.get("--rss-path"),
      atom: values.get("--atom-path"),
      json: values.get("--json-path"),
      newsSitemap: values.get("--news-sitemap-path"),
      wire: values.get("--wire-path"),
    },
  });
  process.stdout.write(`${JSON.stringify({ itemCount: result.itemCount, skippedCount: result.skippedCount, newest: result.newest, oldest: result.oldest, files: result.files })}\n`);
} catch (error) {
  process.stderr.write(`koios-news-store-feed-delivery: ${error.message}\n`);
  process.exitCode = 1;
}
