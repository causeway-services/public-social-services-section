#!/usr/bin/env node
import {
  findDeskWorkItem,
  researchPacket,
  writeBrief,
} from "../../lib/koios-workshop.mjs";

const cliArgs = process.argv.slice(2).filter((arg) => arg !== "--");
const selector = cliArgs.join(" ").trim();

if (selector === "" || selector === "--help" || selector === "-h") {
  console.error('usage: pnpm run new-brief -- "<desk demand term or slug>"');
  process.exit(selector === "" ? 2 : 0);
}

const workItem = await findDeskWorkItem(selector);
if (workItem === null) {
  console.error(`no open Koios desk work item matched ${JSON.stringify(selector)}`);
  process.exit(1);
}

const packet = researchPacket(workItem);
if (packet.charge === "absurd") {
  console.error(`refusing to brief ${JSON.stringify(selector)}: charge is "absurd" — no wire source in the pool scored as relevant to this work item, so there is nothing to write from yet`);
  process.exit(1);
}
const file = writeBrief(packet);
console.log(file);
console.log(`sources=${packet.primary_sources.length} charge=${packet.charge} seo_term=${JSON.stringify(packet.seo_term)}`);
