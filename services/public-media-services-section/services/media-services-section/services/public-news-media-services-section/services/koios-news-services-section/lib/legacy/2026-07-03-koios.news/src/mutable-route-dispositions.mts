#!/usr/bin/env node

import { resolve } from "node:path";

import { DEFAULT_DATA_DIR } from "./config.mjs";
import { latestLivePublicationWitness } from "./administrating/deploying/live-publication-witness.mjs";
import { settleMutableRouteDispositions } from "./administrating/deploying/mutable-route-dispositions.mjs";
import { appendKoiosAct } from "./management/ledger.mjs";

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

const now = argument("--now");
if (now === undefined) throw new Error("mutable-route disposition requires --now with an explicit UTC instant");
const settlement = await settleMutableRouteDispositions({
  candidateOutputDir: resolve(argument("--candidate-out") ?? ".static/koios.news-candidate"),
  livePublicationWitness: latestLivePublicationWitness(DEFAULT_DATA_DIR),
  observedAt: now,
  ...(argument("--live") === undefined ? {} : { liveOrigin: argument("--live")! }),
});
if (process.argv.includes("--record")) {
  await appendKoiosAct({
    dataRoot: DEFAULT_DATA_DIR,
    ledger: "deployments",
    instant: now,
    act: "deployment.mutable-routes.disposed",
    subject: settlement.artifactManifestDigest,
    data: settlement,
  });
}
process.stdout.write(`${JSON.stringify(settlement)}\n`);
