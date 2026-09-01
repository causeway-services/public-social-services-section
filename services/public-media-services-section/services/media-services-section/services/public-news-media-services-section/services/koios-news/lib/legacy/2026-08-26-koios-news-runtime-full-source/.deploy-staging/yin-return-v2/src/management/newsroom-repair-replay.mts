import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { DEFAULT_CONTENT_DIR, DEFAULT_DATA_DIR } from "../config.mjs";
import { pendingPrimaryStaticRelease } from "./cloudflare-primary-release-contract.mjs";
import { appendKoiosAct, readKoiosLedger, recordDigest } from "./ledger.mjs";
import { runNewsroomCircuitSafely } from "./newsroom-circuit.mjs";
import { dispatchNewsroomRepair } from "./newsroom-repair-dispatch.mjs";

export type NewsroomRepairReplaySettlement = Readonly<Record<string, unknown>>;

/** Exact executable bytes that decide, form, route, and verify one prose or
 * attention-surface repair. A changed digest means a later repair is not the same purchase and
 * may lawfully cross an otherwise active anti-thrashing cooldown once. */
export function newsroomRepairMechanismDigest(): string {
  return recordDigest([
    "./newsroom-repair-replay.mjs",
    "./newsroom-repair-dispatch.mjs",
    "./newsroom-repair-dispatcher.mjs",
    "./source-intelligence-replay.mjs",
    "./newsroom-circuit.mjs",
    "../draft-repair.mjs",
    "../researching/writing/attention-headline.mjs",
    "../researching/writing/newswire-prose-contract.mjs",
    // The adapter deterministically projects repaired prose into the title,
    // description, summary, and body carrier judged by the next circuit. A
    // change here is a changed remedy even when dispatch and routing bytes are
    // identical.
    "../researching/writing/prose-contribution.mjs",
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
  socketPath?: string;
}>): Promise<NewsroomRepairReplaySettlement> {
  if (input.assignmentId.trim() === "") throw new TypeError("newsroom repair replay requires an assignment id");
  const now = input.now ?? new Date().toISOString();
  const dataDir = resolve(input.dataDir ?? DEFAULT_DATA_DIR);
  const contentDir = resolve(input.contentDir ?? DEFAULT_CONTENT_DIR);
  const outputDir = resolve(input.outputDir ?? ".static/koios.news-candidate");
  const priorInferenceReceipts = new Set(inferenceReceiptDigests(dataDir, input.assignmentId));
  const repair = await dispatchNewsroomRepair({ assignmentId: input.assignmentId, now, dataDir, contentDir, ...(input.socketPath === undefined ? {} : { socketPath: input.socketPath }) });
  const newInferenceReceipts = inferenceReceiptDigests(dataDir, input.assignmentId).filter((receipt) => !priorInferenceReceipts.has(receipt));
  let newsroom;
  let releasePending;
  let releaseObstruction;
  if (repair.disposition === "replay-ready" && repair.successorAssignmentId !== undefined) {
    const pending = pendingPrimaryStaticRelease(dataDir, outputDir);
    newsroom = pending?.assignmentId === repair.successorAssignmentId && pending.slug === repair.slug
      ? Object.freeze({
          kind: "koios.newsroom-circuit",
          disposition: "published",
          assignmentId: pending.assignmentId,
          slug: pending.slug,
          transitions: Object.freeze(["resumed-pending-primary-release"]),
          candidate: Object.freeze({ manifestDigest: pending.candidate.manifestDigest, routeCount: 0, outputDir: pending.candidate.outputDir, profile: "cutover-candidate" }),
        })
      : await runNewsroomCircuitSafely({ assignmentId: repair.successorAssignmentId, now: new Date().toISOString(), maxRepairs: 3, outputDir, dataDir, contentDir });
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
    contract: "koios.news/newsroom-repair-replay/v1",
    recordedAt: new Date().toISOString(),
    predecessorAssignmentId: input.assignmentId,
    repair,
    ...(newsroom === undefined ? {} : { newsroom }),
    ...(releasePending === undefined ? {} : { releasePending }),
    ...(releaseObstruction === undefined ? {} : { releaseObstruction }),
    disposition: releasePending !== undefined ? "release-pending" : releaseObstruction === undefined ? newsroom?.disposition ?? repair.disposition : "release-obstructed",
  });
  const capacityConsumed = newInferenceReceipts.length > 0 || repair.providerSettlementDigest !== undefined || repair.disposition === "replay-ready";
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: settlement.recordedAt, act: "newsroom.repair-replay.settled", subject: repair.successorAssignmentId ?? input.assignmentId, data: { settlementDigest: recordDigest(settlement), repairMechanismDigest: newsroomRepairMechanismDigest(), disposition: settlement.disposition, capacityConsumed, providerUsageReceiptDigests: newInferenceReceipts, predecessorAssignmentId: input.assignmentId, ...(repair.providerSettlementDigest === undefined ? {} : { providerSettlementDigest: repair.providerSettlementDigest }), ...(repair.successorAssignmentId === undefined ? {} : { successorAssignmentId: repair.successorAssignmentId }) } });
  return settlement;
}
