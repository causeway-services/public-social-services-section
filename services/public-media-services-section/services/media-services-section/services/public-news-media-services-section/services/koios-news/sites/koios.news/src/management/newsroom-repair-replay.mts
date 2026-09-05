import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { DEFAULT_CONTENT_DIR, DEFAULT_DATA_DIR } from "../config.mts";
import { pendingPrimaryStaticRelease } from "./cloudflare-primary-release-contract.mts";
import { appendKoiosAct, readKoiosLedger, recordDigest } from "./ledger.mts";
import { runNewsroomCircuitSafely } from "./newsroom-circuit.mts";
import { dispatchNewsroomRepair } from "./newsroom-repair-dispatch.mts";

export type NewsroomRepairReplaySettlement = Readonly<Record<string, unknown>>;

/** Exact executable bytes that decide, retain, apply, and verify one bounded
 * repair. A mechanism change does not turn a legacy recursive successor into
 * a new repair lineage or erase an already-retained stage product. */
export function newsroomRepairMechanismDigest(): string {
  return recordDigest([
    "./newsroom-repair-replay.mts",
    "./newsroom-repair-dispatch.mts",
    "./newsroom-repair-dispatcher.mts",
    "./source-intelligence-replay.mts",
    "./newsroom-circuit.mts",
    "../draft-repair.mts",
    "../researching/writing/attention-headline.mts",
    "../researching/writing/newswire-prose-contract.mts",
    // The adapter deterministically projects repaired prose into the title,
    // description, summary, and body carrier judged by the next circuit. A
    // change here is a changed remedy even when dispatch and routing bytes are
    // identical.
    "../researching/writing/prose-contribution.mts",
  ].map((relative) => Object.freeze({ relative, bytes: readFileSync(new URL(relative, import.meta.url), "utf8") })));
}

function inferenceReceiptDigests(dataDir: string, assignmentId: string): readonly string[] {
  return Object.freeze(readKoiosLedger(dataDir, "provider-usage")
    .filter((entry) => entry["act"] === "inference.consumed")
    .filter((entry) => entry["data"] !== null && typeof entry["data"] === "object" && !Array.isArray(entry["data"]))
    .filter((entry) => String((entry["data"] as Record<string, unknown>)["assignmentId"] ?? "") === assignmentId)
    .map((entry) => recordDigest(entry)));
}

export async function settleNewsroomRepairReplay(input: Readonly<{
  assignmentId: string;
  now?: string;
  dataDir?: string;
  contentDir?: string;
  outputDir?: string;
}>): Promise<NewsroomRepairReplaySettlement> {
  if (input.assignmentId.trim() === "") throw new TypeError("newsroom repair replay requires an assignment id");
  const now = input.now ?? new Date().toISOString();
  const dataDir = resolve(input.dataDir ?? DEFAULT_DATA_DIR);
  const contentDir = resolve(input.contentDir ?? DEFAULT_CONTENT_DIR);
  const outputDir = resolve(input.outputDir ?? ".static/koios.news-candidate");
  const priorInferenceReceipts = new Set(inferenceReceiptDigests(dataDir, input.assignmentId));
  const repair = await dispatchNewsroomRepair({ assignmentId: input.assignmentId, now, dataDir, contentDir });
  const newInferenceReceipts = inferenceReceiptDigests(dataDir, input.assignmentId).filter((receipt) => !priorInferenceReceipts.has(receipt));
  let newsroom;
  let releasePending;
  let releaseObstruction;
  if (repair.disposition === "replay-ready" && repair.repairAssignmentId !== undefined) {
    const pending = pendingPrimaryStaticRelease(dataDir, outputDir);
    newsroom = pending?.assignmentId === repair.repairAssignmentId && pending.slug === repair.slug
      ? Object.freeze({
          kind: "koios.newsroom-circuit",
          disposition: "published",
          assignmentId: pending.assignmentId,
          slug: pending.slug,
          transitions: Object.freeze(["resumed-pending-primary-release"]),
          candidate: Object.freeze({ manifestDigest: pending.candidate.manifestDigest, routeCount: 0, outputDir: pending.candidate.outputDir, profile: "cutover-candidate" }),
        })
      : await runNewsroomCircuitSafely({ assignmentId: repair.repairAssignmentId, now: new Date().toISOString(), maxRepairs: 3, outputDir, dataDir, contentDir });
    if (newsroom.disposition === "published" && newsroom.assignmentId !== undefined && newsroom.slug !== undefined && newsroom.candidate !== undefined) {
      releasePending = Object.freeze({
        assignmentId: newsroom.assignmentId,
        slug: newsroom.slug,
        manifestDigest: newsroom.candidate.manifestDigest,
        candidateDir: newsroom.candidate.outputDir,
        reason: "release is deliberately deferred to a fresh low-memory repair pulse",
      });
    }
  }
  const settlement = Object.freeze({
    kind: "koios.newsroom-repair-replay-settlement",
    contract: "koios.news/newsroom-repair-replay/v2",
    recordedAt: new Date().toISOString(),
    assignmentId: input.assignmentId,
    repair,
    ...(newsroom === undefined ? {} : { newsroom }),
    ...(releasePending === undefined ? {} : { releasePending }),
    ...(releaseObstruction === undefined ? {} : { releaseObstruction }),
    disposition: releasePending !== undefined ? "release-pending" : releaseObstruction === undefined ? newsroom?.disposition ?? repair.disposition : "release-obstructed",
  });
  const capacityConsumed = newInferenceReceipts.length > 0 || repair.capacityConsumed === true;
  await appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: settlement.recordedAt, act: "newsroom.repair-replay.settled", subject: repair.repairAssignmentId ?? input.assignmentId, data: { settlementDigest: recordDigest(settlement), repairMechanismDigest: newsroomRepairMechanismDigest(), disposition: settlement.disposition, capacityConsumed, providerUsageReceiptDigests: newInferenceReceipts, assignmentId: input.assignmentId, ...(repair.providerSettlementDigest === undefined ? {} : { providerSettlementDigest: repair.providerSettlementDigest }) } });
  return settlement;
}
