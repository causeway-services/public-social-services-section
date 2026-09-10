#!/usr/bin/env node

import { readActivityStreamsObjectFromStdin } from "./management/activity-ingress.mjs";
import { settleIssuePulse } from "./management/issue-controller.mjs";
import { appendKoiosAct, recordDigest, type JsonObject } from "./management/ledger.mjs";
import { runNewsroomCircuit } from "./management/newsroom-circuit.mjs";
import { pendingPrimaryStaticRelease, settlePrimaryStaticRelease } from "./management/cloudflare-primary-release-contract.mjs";

const CONTEXT = "https://www.w3.org/ns/activitystreams";
const ACTOR = "https://koios.news/activitypub/actor";
const CONTRACT = "koios.news/publication-cycle/v1";

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

const now = argument("--now") ?? new Date().toISOString();
const pulse = readActivityStreamsObjectFromStdin();
const dataDir = argument("--data-dir");
const effectiveDataDir = dataDir ?? "data";
const candidateDir = argument("--out") ?? ".static/koios.news-candidate";
const pendingRelease = pendingPrimaryStaticRelease(effectiveDataDir, candidateDir);
if (pendingRelease !== undefined) {
  const release = settlePrimaryStaticRelease({ assignmentId: pendingRelease.assignmentId, slug: pendingRelease.slug, candidateDir: pendingRelease.candidate.outputDir, dataDir: effectiveDataDir, now: new Date().toISOString() });
  const terminal = Object.freeze({
    "@context": CONTEXT,
    type: release.accepted ? "Accept" : "Question",
    actor: ACTOR,
    target: pulse["actor"],
    published: new Date().toISOString(),
    object: Object.freeze({
      type: "PublicationCycleSettlement",
      contract: CONTRACT,
      code: release.accepted ? "cloudflare-release-completed" : "cloudflare-release-obstructed",
      assignmentId: release.assignmentId,
      release,
      resumedPendingCandidate: true,
    }),
  });
  process.stdout.write(`${JSON.stringify(terminal, null, 2)}\n`);
  process.exit(0);
}
const settlement = await settleIssuePulse(pulse, {
  now,
  ...(dataDir === undefined ? {} : { dataDir }),
  ...(argument("--content-dir") === undefined ? {} : { contentDir: argument("--content-dir")! }),
  ...(argument("--config") === undefined ? {} : { configPath: argument("--config")! }),
});
if (settlement["type"] !== "Accept") {
  // Preserve the controller's exact typed refusal. Clockkeeper can therefore
  // distinguish "no issue was admitted" from a later newsroom obstruction.
  process.stdout.write(`${JSON.stringify(settlement, null, 2)}\n`);
} else {
  const object = settlement["object"] as Record<string, unknown>;
  const assignmentId = String(object["assignmentId"] ?? "");
  const maxRepairs = Number(argument("--max-repairs") ?? 3);
  const result = await runNewsroomCircuit({
    assignmentId,
    now,
    maxRepairs,
    outputDir: candidateDir,
  });
  const release = result.disposition === "published" && result.candidate !== undefined && result.assignmentId !== undefined && result.slug !== undefined
    ? settlePrimaryStaticRelease({ assignmentId: result.assignmentId, slug: result.slug, candidateDir: result.candidate.outputDir, dataDir: effectiveDataDir, now: new Date().toISOString() })
    : undefined;
  const type = result.disposition === "refused" ? "Reject" : release?.accepted === true ? "Accept" : "Question";
  const code = result.disposition === "published"
    ? release?.accepted === true ? "cloudflare-release-completed" : "cloudflare-release-obstructed"
    : result.disposition === "refused"
      ? "newsroom-refused"
      : "newsroom-obstructed";
  const cycleObject = Object.freeze({
    type: "PublicationCycleSettlement",
    contract: CONTRACT,
    code,
    assignmentId,
    controllerSettlementDigest: recordDigest(settlement),
    newsroom: result,
    ...(release === undefined ? {} : { release }),
    next: result.disposition === "published" && release?.accepted !== true
      ? Object.freeze({ type: "StaticPublicationReleaseRetry", requiredContract: "cloudflare-primary-static-release/v1", candidate: result.candidate })
      : Object.freeze({ type: "NewsroomRepairDemand", failure: result.reason ?? result.disposition }),
  });
  const terminal = Object.freeze({
    "@context": CONTEXT,
    type,
    actor: ACTOR,
    target: pulse["actor"],
    published: new Date().toISOString(),
    object: cycleObject,
  });
  appendKoiosAct({
    dataRoot: effectiveDataDir,
    ledger: "contract-events",
    instant: String(terminal.published),
    act: "publication.cycle.settled",
    subject: assignmentId,
    data: {
      contract: CONTRACT,
      disposition: result.disposition,
      code,
      controllerSettlementDigest: recordDigest(settlement),
      terminalDigest: recordDigest(terminal),
      customerTerritoryMutation: result.disposition === "published",
    } as JsonObject,
  });
  process.stdout.write(`${JSON.stringify(terminal, null, 2)}\n`);
}
