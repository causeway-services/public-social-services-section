#!/usr/bin/env node

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { DEFAULT_DATA_DIR } from "./config.mts";
import { buildStaticPublication, verifyStaticPublication, type StaticPublicationProfile } from "./administrating/deploying/static-shadow.mts";
import { latestLivePublicationWitness } from "./administrating/deploying/live-publication-witness.mts";

import { argument } from "@red-cup-engineering/parse-javascript-argv-service";

const rawProfile = argument("--profile") ?? "shadow";
if (rawProfile !== "shadow" && rawProfile !== "cutover-candidate") throw new Error(`unknown static publication profile: ${rawProfile}`);
const profile: StaticPublicationProfile = rawProfile;
const outputDir = resolve(argument("--out") ?? (profile === "shadow" ? ".static/koios.news" : ".static/koios.news-candidate"));
const verify = process.argv.includes("--verify");
const replace = process.argv.includes("--replace");
if (process.argv.includes("--record-missing-grant")) throw new Error("the off-chain grant path was removed; publication authority is an EVM effect-cell seam");
const livePublicationWitness = latestLivePublicationWitness(DEFAULT_DATA_DIR);

if (verify) {
  const firstDir = mkdtempSync(join(tmpdir(), `koios-${profile}-a-`));
  const secondDir = mkdtempSync(join(tmpdir(), `koios-${profile}-b-`));
  try {
    const first = await buildStaticPublication({ outputDir: join(firstDir, "site"), profile, livePublicationWitness });
    const second = await buildStaticPublication({ outputDir: join(secondDir, "site"), profile, livePublicationWitness });
    verifyStaticPublication(first);
    verifyStaticPublication(second);
    if (first.manifestDigest !== second.manifestDigest) throw new Error("identical inputs produced different static manifests");
    process.stdout.write(`${JSON.stringify({ kind: "koios.static-publication-verification", profile, valid: true, manifestDigest: first.manifestDigest, routeCount: first.manifest.routeCount })}\n`);
  } finally {
    rmSync(firstDir, { recursive: true, force: true });
    rmSync(secondDir, { recursive: true, force: true });
  }
} else {
  const result = await buildStaticPublication({ outputDir, profile, replace, livePublicationWitness });
  const verification = verifyStaticPublication(result);
  process.stdout.write(`${JSON.stringify({ kind: "koios.static-publication-build", ...verification, outputDir: result.outputDir, authority: result.manifest.authority })}\n`);
}
