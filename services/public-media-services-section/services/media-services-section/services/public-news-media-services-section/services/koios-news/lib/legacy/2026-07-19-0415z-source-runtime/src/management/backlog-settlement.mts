// Settle inherited draft backlog from already-paid editorial judgments.
// This operation never asks a model and never deletes a manuscript. It turns
// existing structured judgments into publication-owned assignment lifecycle
// records so old drafts cannot remain an immortal hidden queue.

import { resolve } from "node:path";

import { DEFAULT_CONTENT_DIR, DEFAULT_DATA_DIR } from "../config.mjs";
import { loadPosts } from "../content.mjs";
import type { EditorialJudgment } from "../researching/writing/editing/liss-editorial.mjs";
import { reviewPublicationAdmission } from "../researching/writing/editing/standards.mjs";
import {
  readActionableAssignments,
  readAssignments,
  readAssignmentControls,
  readAssignmentDispositions,
  recordAssignmentControl,
  recordAssignmentDisposition,
} from "../researching/writing/assignments.mjs";
import { appendKoiosAct, recordDigest, type JsonObject } from "./ledger.mjs";

export const BACKLOG_SETTLEMENT_CONTRACT = "koios.news/editorial-backlog-settlement/v1";

export type BacklogDecision = Readonly<{
  assignmentId: string;
  slug?: string;
  decision: "refuse" | "activate" | "defer";
  reason: string;
  judgmentDigest?: string;
  failureLayer?: string;
  replayFrom?: string;
}>;

function repairRank(value: BacklogDecision): number {
  if (value.failureLayer === "draft-repair") return 0;
  if (value.replayFrom === "draft-repair") return 1;
  if (value.failureLayer === "writer-model") return 2;
  return 3;
}

export function planBacklogSettlement(input: Readonly<{ dataDir?: string; contentDir?: string }> = {}): readonly BacklogDecision[] {
  const dataDir = resolve(input.dataDir ?? DEFAULT_DATA_DIR);
  const contentDir = resolve(input.contentDir ?? DEFAULT_CONTENT_DIR);
  const posts = loadPosts(contentDir);
  const terminal = readAssignmentDispositions(dataDir);
  const controls = readAssignmentControls(dataDir);
  const refusals: BacklogDecision[] = [];
  const recoverable: BacklogDecision[] = [];

  for (const assignment of readAssignments(dataDir, posts).filter((value) => (value.status === "assigned" || value.status === "drafted") && !terminal.has(value.assignmentId))) {
    if (terminal.has(assignment.assignmentId)) continue;
    if (assignment.manuscriptSlug === undefined) {
      recoverable.push(Object.freeze({ assignmentId: assignment.assignmentId, decision: "defer", reason: "assignment has no manuscript artifact and requires a new issue-level decision" }));
      continue;
    }
    let admission;
    try { admission = reviewPublicationAdmission(contentDir, assignment.manuscriptSlug); }
    catch {
      recoverable.push(Object.freeze({ assignmentId: assignment.assignmentId, slug: assignment.manuscriptSlug, decision: "defer", reason: "manuscript artifact cannot currently be evaluated" }));
      continue;
    }
    const judgment = admission.acceptance as unknown as EditorialJudgment | undefined;
    if (judgment === undefined || judgment.serviceAccepted !== true || judgment.toolSelectionValidated !== true) {
      recoverable.push(Object.freeze({ assignmentId: assignment.assignmentId, slug: assignment.manuscriptSlug, decision: "defer", reason: "no provider-validated editorial tool selection exists for the exact manuscript" }));
      continue;
    }
    const evidence = Object.freeze({
      judgmentDigest: recordDigest(judgment),
      failureLayer: judgment.pipelineDiagnosis.failureLayer,
      replayFrom: judgment.pipelineDiagnosis.replayFrom,
    });
    if (["assignment", "sources", "deterministic-gates"].includes(judgment.pipelineDiagnosis.failureLayer)) {
      refusals.push(Object.freeze({ assignmentId: assignment.assignmentId, slug: assignment.manuscriptSlug, decision: "refuse", reason: judgment.summary, ...evidence }));
    } else {
      recoverable.push(Object.freeze({ assignmentId: assignment.assignmentId, slug: assignment.manuscriptSlug, decision: "defer", reason: judgment.summary, ...evidence }));
    }
  }

  const ordered = recoverable.sort((left, right) => repairRank(left) - repairRank(right) || left.assignmentId.localeCompare(right.assignmentId));
  const active = ordered.find((decision) => controls.get(decision.assignmentId)?.state === "active") ?? ordered[0];
  return Object.freeze([
    ...refusals,
    ...ordered.map((decision) => decision === active ? Object.freeze({ ...decision, decision: "activate" as const }) : decision),
  ]);
}

export function settleBacklog(input: Readonly<{ dataDir?: string; contentDir?: string; now?: string; apply?: boolean }> = {}): Readonly<{
  kind: "koios.news.backlog-settlement";
  contract: typeof BACKLOG_SETTLEMENT_CONTRACT;
  applied: boolean;
  decisions: readonly BacklogDecision[];
  actionableAfter: readonly string[];
}> {
  const dataDir = resolve(input.dataDir ?? DEFAULT_DATA_DIR);
  const contentDir = resolve(input.contentDir ?? DEFAULT_CONTENT_DIR);
  const now = input.now ?? new Date().toISOString();
  const decisions = planBacklogSettlement({ dataDir, contentDir });
  if (input.apply === true) {
    for (const decision of decisions) {
      if (decision.decision === "refuse") {
        recordAssignmentDisposition(dataDir, { assignmentId: decision.assignmentId, disposition: "refused", reason: decision.reason, authority: "koios.news/editorial-operation", contract: BACKLOG_SETTLEMENT_CONTRACT }, now);
      } else {
        recordAssignmentControl(dataDir, { assignmentId: decision.assignmentId, state: decision.decision === "activate" ? "active" : "deferred", reason: decision.reason, authority: "koios.news/editorial-operation", contract: BACKLOG_SETTLEMENT_CONTRACT }, now);
      }
    }
    appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: now, act: "assignment.backlog.settled", subject: recordDigest(decisions), data: { contract: BACKLOG_SETTLEMENT_CONTRACT, decisions: decisions as unknown as JsonObject, priorInference: "reused accepted editorial judgments; no new inference invoked" } });
  }
  return Object.freeze({ kind: "koios.news.backlog-settlement", contract: BACKLOG_SETTLEMENT_CONTRACT, applied: input.apply === true, decisions, actionableAfter: Object.freeze(readActionableAssignments(dataDir, loadPosts(contentDir)).map(({ assignmentId }) => assignmentId)) });
}
