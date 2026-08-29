#!/usr/bin/env node

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { DEFAULT_DATA_DIR } from "./config.mjs";
import { buildStaticPublication, verifyStaticPublication, type StaticPublicationProfile } from "./administrating/deploying/static-shadow.mjs";
import { latestLivePublicationWitness } from "./administrating/deploying/live-publication-witness.mjs";
import { appendKoiosAct } from "./management/ledger.mjs";

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

const rawProfile = argument("--profile") ?? "shadow";
if (rawProfile !== "shadow" && rawProfile !== "cutover-candidate") throw new Error(`unknown static publication profile: ${rawProfile}`);
const profile: StaticPublicationProfile = rawProfile;
const outputDir = resolve(argument("--out") ?? (profile === "shadow" ? ".static/koios.news" : ".static/koios.news-candidate"));
const verify = process.argv.includes("--verify");
const replace = process.argv.includes("--replace");
const refusal = process.argv.includes("--record-missing-grant");
const now = argument("--now");
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
  if (refusal) {
    if (now === undefined) throw new Error("--record-missing-grant requires --now with an explicit UTC instant");
    appendKoiosAct({
      dataRoot: DEFAULT_DATA_DIR,
      ledger: "shadow-deliveries",
      instant: now,
      act: "deployment.refused",
      subject: `cloudflare-static-${profile}`,
      data: {
        reason: "missing-provider-resource-grant",
        profile,
        artifactManifestDigest: result.manifestDigest,
        artifactRouteCount: result.manifest.routeCount,
        retainedAuthority: "current-vps-delivery",
        customerTerritoryMutation: false,
      },
    });
  }
  process.stdout.write(`${JSON.stringify({ kind: "koios.static-publication-build", ...verification, outputDir: result.outputDir, authority: result.manifest.authority })}\n`);
}
