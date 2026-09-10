#!/usr/bin/env node

import { resolve } from "node:path";

import { DEFAULT_DATA_DIR } from "./config.mts";
import { latestLivePublicationWitness } from "./administrating/deploying/live-publication-witness.mts";
import { settleMutableRouteDispositions } from "./administrating/deploying/mutable-route-dispositions.mts";
import { appendKoiosAct } from "./management/ledger.mts";

import { argument } from "@red-cup-engineering/javascript-argv-parsing-services-section/parse-javascript-argv";

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
