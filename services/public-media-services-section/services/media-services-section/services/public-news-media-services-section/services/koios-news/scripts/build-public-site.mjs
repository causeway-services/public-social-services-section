#!/usr/bin/env node
// Builds the complete koios.news public candidate from the two corpora:
//   1. the claim store  -> store-feed-delivery-current (feeds, wire.json, verbatim claims)
//   2. bylined posts + that projection + the desks parameterization + the
//      observed production baseline -> static-delivery-current (sealed public/)
// Deploying the result is a separate act (see cloudflare-release-current).
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const argv = process.argv.slice(2);
const value = (flag) => { const index = argv.indexOf(flag); return index < 0 ? undefined : argv[index + 1]; };
const out = value("--out");
const baseline = value("--production-baseline");
if (!out) { process.stderr.write("Usage: build-public-site --out <public-dir> [--production-baseline <dir>] [--replace]\n"); process.exit(2); }

const wireDir = mkdtempSync(join(tmpdir(), "koios-wire-"));
try {
  const projection = execFileSync(process.execPath, [join(root, "store-feed-delivery-current", "bin", "koios-news-store-feed-delivery.mjs"), "--store", join(root, "sites", "koios.news", "store"), "--out", wireDir], { encoding: "utf8" });
  const { itemCount, skippedCount, newest } = JSON.parse(projection);
  const build = execFileSync(process.execPath, [
    join(root, "static-delivery-current", "bin", "koios-news-static-delivery.mjs"),
    "--content", join(root, "sites", "koios.news", "content", "posts"),
    "--wire", wireDir,
    "--desks", join(root, "config", "public-desks.json"),
    "--out", out,
    ...(baseline ? ["--production-baseline", baseline] : []),
    ...(argv.includes("--replace") ? ["--replace"] : []),
  ], { encoding: "utf8" });
  process.stdout.write(`${JSON.stringify({ wire: { itemCount, skippedCount, newest }, site: JSON.parse(build) })}\n`);
} finally {
  rmSync(wireDir, { recursive: true, force: true });
}
