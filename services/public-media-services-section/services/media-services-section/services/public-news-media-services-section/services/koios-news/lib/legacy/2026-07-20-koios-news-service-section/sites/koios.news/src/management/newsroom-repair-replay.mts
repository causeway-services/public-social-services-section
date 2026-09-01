import { resolve } from "node:path";

import { DEFAULT_CONTENT_DIR, DEFAULT_DATA_DIR } from "../config.mjs";
import { pendingPrimaryStaticRelease } from "./cloudflare-primary-release-contract.mjs";
import { appendKoiosAct, recordDigest } from "./ledger.mjs";
import { runNewsroomCircuit } from "./newsroom-circuit.mjs";
import { dispatchNewsroomRepair } from "./newsroom-repair-dispatch.mjs";

export type NewsroomRepairReplaySettlement = Readonly<Record<string, unknown>>;

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
  const repair = await dispatchNewsroomRepair({ assignmentId: input.assignmentId, now, dataDir, contentDir, ...(input.socketPath === undefined ? {} : { socketPath: input.socketPath }) });
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
      : await runNewsroomCircuit({ assignmentId: repair.successorAssignmentId, now: new Date().toISOString(), maxRepairs: 3, outputDir });
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
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: settlement.recordedAt, act: "newsroom.repair-replay.settled", subject: repair.successorAssignmentId ?? input.assignmentId, data: { settlementDigest: recordDigest(settlement), disposition: settlement.disposition, predecessorAssignmentId: input.assignmentId, ...(repair.successorAssignmentId === undefined ? {} : { successorAssignmentId: repair.successorAssignmentId }) } });
  return settlement;
}
