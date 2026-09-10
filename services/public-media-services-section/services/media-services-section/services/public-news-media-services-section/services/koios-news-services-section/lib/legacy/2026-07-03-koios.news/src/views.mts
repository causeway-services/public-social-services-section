// Koios-owned attention circuit.
//
// The content vocabulary supplies the pure event/count carriers. Durable
// witnesses belong to Koios and cross its hired RWIL/RDF memory boundary;
// neither a content-mill runtime nor a second trace store exists here.

import {
  contentViewCounts,
  contentViewEvent,
  contentViewEventFromRecord,
  type ContentViewCounts,
  type ContentViewEvent,
} from "@red-cup-engineering/producing-content/content-mill";

import { appendDatedRecord, readKoiosLedger, type JsonObject } from "./management/ledger.mjs";

export type ViewAssertion = ContentViewEvent;
export type ViewCounts = ContentViewCounts;

/** Judge a candidate view assertion from query material; null when malformed. */
export function viewAssertion(input: { p?: string | null; r?: string | null; day: string }): ViewAssertion | null {
  return contentViewEvent(input);
}

/** Commit one admitted attention witness into Koios's canonical memory. */
export async function appendViewWitness(dataDir: string, event: ViewAssertion, instant: string): Promise<void> {
  await appendDatedRecord({
    dataRoot: dataDir,
    ledger: "attention",
    instant,
    record: Object.freeze({ ...event, recordedAt: instant }) as JsonObject,
  });
}

/** Fold Koios's canonical attention witnesses into the privacy-light reading. */
export function viewCounts(dataDir: string): ViewCounts {
  const events = readKoiosLedger(dataDir, "attention")
    .map((record) => contentViewEventFromRecord(record))
    .filter((event): event is ContentViewEvent => event !== undefined);
  return contentViewCounts({ events });
}

/** Today's day stamp. Wall-clock as testimony of when a view was witnessed. */
export function dayStamp(): string {
  return new Date().toISOString().slice(0, 10); // law-allow: wall-clock-as-data
}
