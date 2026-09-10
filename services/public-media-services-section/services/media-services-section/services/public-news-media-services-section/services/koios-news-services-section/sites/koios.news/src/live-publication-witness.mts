#!/usr/bin/env node

import { DEFAULT_DATA_DIR } from "./config.mts";
import { appendLivePublicationWitness, captureLivePublicationWitness } from "./administrating/deploying/live-publication-witness.mts";

import { argument } from "@red-cup-engineering/javascript-argv-parsing-services-section/parse-javascript-argv";

const observedAt = argument("--now");
if (observedAt === undefined) throw new Error("live publication witnessing requires --now with an explicit UTC instant");
const origin = argument("--live");
const witness = await captureLivePublicationWitness({ ...(origin === undefined ? {} : { origin }), observedAt });
appendLivePublicationWitness(DEFAULT_DATA_DIR, witness);
process.stdout.write(`${JSON.stringify(witness)}\n`);
