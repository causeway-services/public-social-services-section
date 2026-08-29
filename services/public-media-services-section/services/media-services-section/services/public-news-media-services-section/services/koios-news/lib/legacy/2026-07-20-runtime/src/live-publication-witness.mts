#!/usr/bin/env node

import { DEFAULT_DATA_DIR } from "./config.mjs";
import { appendLivePublicationWitness, captureLivePublicationWitness } from "./administrating/deploying/live-publication-witness.mjs";

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

const observedAt = argument("--now");
if (observedAt === undefined) throw new Error("live publication witnessing requires --now with an explicit UTC instant");
const origin = argument("--live");
const witness = await captureLivePublicationWitness({ ...(origin === undefined ? {} : { origin }), observedAt });
appendLivePublicationWitness(DEFAULT_DATA_DIR, witness);
process.stdout.write(`${JSON.stringify(witness)}\n`);
