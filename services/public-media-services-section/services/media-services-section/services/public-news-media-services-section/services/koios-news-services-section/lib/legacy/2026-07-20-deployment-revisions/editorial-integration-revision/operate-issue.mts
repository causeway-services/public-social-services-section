#!/usr/bin/env node

import { readActivityStreamsObjectFromStdin } from "./management/activity-ingress.mjs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { DEFAULT_DATA_DIR } from "./config.mjs";
import { inspectAdmittedIssuePulse, settleIssuePulse } from "./management/issue-controller.mjs";
import { appendKoiosAct, recordDigest, type JsonObject } from "./management/ledger.mjs";
import { INTERNAL_PUBLICATION_CONTRACT, internalServiceAccount } from "./management/internal-publication-service.mjs";
import { runNewsroomCircuitSafely, type NewsroomCircuitResult } from "./management/newsroom-circuit.mjs";
import { dispatchNewsroomRepair, type NewsroomRepairDispatchResult } from "./management/newsroom-repair-dispatch.mjs";
import { pendingPrimaryStaticRelease, settlePrimaryStaticRelease, witnessPrimaryStaticRelease } from "./management/cloudflare-primary-release-contract.mjs";
import { preparePrimaryStaticRelease } from "./management/primary-static-release-preparation.mjs";

const CONTEXT = "https://www.w3.org/ns/activitystreams";
const ACTOR = "https://koios.news/activitypub/actor";
const CONTRACT = INTERNAL_PUBLICATION_CONTRACT;
const SITE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

const now = argument("--now") ?? new Date().toISOString();
const pulse = readActivityStreamsObjectFromStdin();
const pulseIdentity = inspectAdmittedIssuePulse(pulse);
const dataDir = argument("--data-dir");
const effectiveDataDir = resolve(dataDir ?? DEFAULT_DATA_DIR);
const candidateDir = resolve(argument("--out") ?? join(SITE_ROOT, ".static", "koios.news-candidate"));
try {
const pendingRelease = pendingPrimaryStaticRelease(effectiveDataDir, candidateDir);
if (pendingRelease !== undefined && pulseIdentity !== undefined) {
  const internalService = internalServiceAccount({ pulseId: pulseIdentity.pulseId, assignmentId: pendingRelease.assignmentId });
  const prepared = await preparePrimaryStaticRelease({ assignmentId: pendingRelease.assignmentId, slug: pendingRelease.slug, candidateDir: pendingRelease.candidate.outputDir, dataDir: effectiveDataDir, now: new Date().toISOString() });
  const release = settlePrimaryStaticRelease({ assignmentId: prepared.assignmentId, slug: prepared.slug, candidateDir: prepared.candidate.outputDir, dataDir: effectiveDataDir, now: new Date().toISOString() });
  const publicWitness = release.accepted ? await witnessPrimaryStaticRelease({ slug: release.slug, dataDir: effectiveDataDir }) : undefined;
  const complete = release.accepted && publicWitness?.witnessed === true;
  const terminal = Object.freeze({
    "@context": CONTEXT,
    type: complete ? "Accept" : "Question",
    actor: ACTOR,
    target: pulse["actor"],
    ...(typeof pulse["id"] === "string" ? { inReplyTo: pulse["id"] } : {}),
    published: new Date().toISOString(),
    object: Object.freeze({
      type: "PublicationCycleSettlement",
      contract: CONTRACT,
      code: complete ? "cloudflare-release-completed" : release.accepted ? "cloudflare-release-witness-obstructed" : "cloudflare-release-obstructed",
      assignmentId: release.assignmentId,
      release,
      ...(publicWitness === undefined ? {} : { publicWitness }),
      resumedPendingCandidate: true,
      internalService,
      trigger: pulseIdentity,
    }),
  });
  appendKoiosAct({
    dataRoot: effectiveDataDir,
    ledger: "contract-events",
    instant: String(terminal.published),
    act: "publication.internal-service.settled",
    subject: release.assignmentId,
    data: {
      contract: CONTRACT,
      disposition: complete ? "released" : "release-obstructed",
      code: String((terminal.object as Record<string, unknown>)["code"]),
      triggerActor: pulseIdentity.actor,
      triggerCapability: pulseIdentity.capability,
      triggerPulseId: pulseIdentity.pulseId,
      triggerActivityDigest: pulseIdentity.activityDigest,
      terminalDigest: recordDigest(terminal),
      internalService,
      transportActor: pulseIdentity.actor,
      koiosTerritoryMutation: release.accepted,
    },
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
  if (pulseIdentity === undefined) throw new Error("the issue controller accepted a pulse without a reproducible admitted trigger identity");
  const internalService = internalServiceAccount({ pulseId: pulseIdentity.pulseId, assignmentId });
  appendKoiosAct({
    dataRoot: effectiveDataDir,
    ledger: "contract-events",
    instant: now,
    act: "publication.internal-service.started",
    subject: assignmentId,
    data: {
      contract: CONTRACT,
      controllerSettlementDigest: recordDigest(settlement),
      triggerActor: pulseIdentity.actor,
      triggerCapability: pulseIdentity.capability,
      triggerPulseId: pulseIdentity.pulseId,
      triggerActivityDigest: pulseIdentity.activityDigest,
      internalService,
      transportActor: pulseIdentity.actor,
      koiosTerritoryMutation: false,
    },
  });
  const maxRepairs = Number(argument("--max-repairs") ?? 3);
  let repair: NewsroomRepairDispatchResult | undefined;
  if (object["disposition"] === "repair-assigned") {
    repair = await dispatchNewsroomRepair({
      assignmentId,
      now: new Date().toISOString(),
      ...(dataDir === undefined ? {} : { dataDir }),
      ...(argument("--content-dir") === undefined ? {} : { contentDir: argument("--content-dir")! }),
      ...(process.env["LISS_INFERENCE_SOCKET"] === undefined ? {} : { socketPath: process.env["LISS_INFERENCE_SOCKET"]! }),
    });
  }
  let result: NewsroomCircuitResult;
  if (repair !== undefined && (repair.disposition !== "replay-ready" || repair.successorAssignmentId === undefined)) {
    result = Object.freeze({
      kind: "koios.newsroom-circuit",
      disposition: repair.disposition === "refused" ? "refused" : "obstructed",
      assignmentId,
      ...(repair.slug === undefined ? {} : { slug: repair.slug }),
      reason: repair.reason ?? "the selected repair service did not form a replay-ready successor",
      transitions: Object.freeze([`repair-${repair.disposition}`]),
    });
  } else {
    result = await runNewsroomCircuitSafely({
      assignmentId: repair?.successorAssignmentId ?? assignmentId,
      now: repair === undefined ? now : new Date().toISOString(),
      maxRepairs,
      outputDir: candidateDir,
      dataDir: effectiveDataDir,
      ...(argument("--content-dir") === undefined ? {} : { contentDir: argument("--content-dir")! }),
    });
  }
  if (repair === undefined && (result.disposition === "refused" || result.disposition === "obstructed") && result.assignmentId !== undefined) {
    repair = await dispatchNewsroomRepair({
      assignmentId: result.assignmentId,
      now: new Date().toISOString(),
      ...(dataDir === undefined ? {} : { dataDir }),
      ...(argument("--content-dir") === undefined ? {} : { contentDir: argument("--content-dir")! }),
      ...(process.env["LISS_INFERENCE_SOCKET"] === undefined ? {} : { socketPath: process.env["LISS_INFERENCE_SOCKET"]! }),
    });
    if (repair.disposition === "replay-ready" && repair.successorAssignmentId !== undefined) {
      result = await runNewsroomCircuitSafely({
        assignmentId: repair.successorAssignmentId,
        now: new Date().toISOString(),
        maxRepairs,
        outputDir: candidateDir,
        dataDir: effectiveDataDir,
        ...(argument("--content-dir") === undefined ? {} : { contentDir: argument("--content-dir")! }),
      });
    }
  }
  let releasePending;
  if (result.disposition === "published" && result.candidate !== undefined && result.assignmentId !== undefined && result.slug !== undefined) {
    releasePending = Object.freeze({
      assignmentId: result.assignmentId,
      slug: result.slug,
      manifestDigest: result.candidate.manifestDigest,
      candidateDir: result.candidate.outputDir,
      reason: "release is deliberately deferred to the next fresh low-memory pulse",
    });
  }
  const type = result.disposition === "refused" ? "Reject" : "Question";
  const code = result.disposition === "published"
    ? "cloudflare-release-pending"
    : result.disposition === "refused"
      ? "newsroom-refused"
      : "newsroom-obstructed";
  const cycleObject = Object.freeze({
    type: "PublicationCycleSettlement",
    contract: CONTRACT,
    code,
    assignmentId: result.assignmentId ?? assignmentId,
    controllerAssignmentId: assignmentId,
    controllerSettlementDigest: recordDigest(settlement),
    internalService,
    newsroom: result,
    ...(repair === undefined ? {} : { repair }),
    ...(releasePending === undefined ? {} : { releasePending }),
    next: result.disposition === "published"
      ? Object.freeze({ type: "StaticPublicationReleaseRetry", requiredContract: "cloudflare-primary-static-release/v1", candidate: result.candidate })
      : Object.freeze({ type: "NewsroomRepairDemand", failure: result.reason ?? result.disposition }),
  });
  const terminal = Object.freeze({
    "@context": CONTEXT,
    type,
    actor: ACTOR,
    target: pulse["actor"],
    ...(typeof pulse["id"] === "string" ? { inReplyTo: pulse["id"] } : {}),
    published: new Date().toISOString(),
    object: cycleObject,
  });
  appendKoiosAct({
    dataRoot: effectiveDataDir,
    ledger: "contract-events",
    instant: String(terminal.published),
    act: "publication.internal-service.settled",
    subject: result.assignmentId ?? assignmentId,
    data: {
      contract: CONTRACT,
      disposition: result.disposition,
      code,
      controllerAssignmentId: assignmentId,
      ...(repair === undefined ? {} : { repairDisposition: repair.disposition, predecessorAssignmentId: repair.predecessorAssignmentId }),
      controllerSettlementDigest: recordDigest(settlement),
      terminalDigest: recordDigest(terminal),
      ...(pulseIdentity === undefined ? {} : {
        triggerActor: pulseIdentity.actor,
        triggerCapability: pulseIdentity.capability,
        triggerPulseId: pulseIdentity.pulseId,
        triggerActivityDigest: pulseIdentity.activityDigest,
      }),
      internalService,
      transportActor: pulseIdentity.actor,
      koiosTerritoryMutation: result.disposition === "published",
    } as JsonObject,
  });
  if (repair !== undefined) {
    appendKoiosAct({
      dataRoot: effectiveDataDir,
      ledger: "contract-events",
      instant: String(terminal.published),
      act: "newsroom.repair-replay.settled",
      subject: repair.successorAssignmentId ?? repair.predecessorAssignmentId,
      data: {
        disposition: releasePending === undefined ? result.disposition : "release-pending",
        predecessorAssignmentId: repair.predecessorAssignmentId,
        ...(repair.successorAssignmentId === undefined ? {} : { successorAssignmentId: repair.successorAssignmentId }),
        selectedByIssuePulse: object["disposition"] === "repair-assigned",
        releaseAccepted: false,
        publicWitnessed: false,
      } as JsonObject,
    });
  }
  process.stdout.write(`${JSON.stringify(terminal, null, 2)}\n`);
}
} catch (error) {
  const failedAt = new Date().toISOString();
  const reason = error instanceof Error ? error.message : String(error);
  const terminal = Object.freeze({
    "@context": CONTEXT,
    type: "Question",
    actor: ACTOR,
    target: pulse["actor"],
    ...(typeof pulse["id"] === "string" ? { inReplyTo: pulse["id"] } : {}),
    published: failedAt,
    object: Object.freeze({
      type: "PublicationCycleSettlement",
      contract: CONTRACT,
      code: "publication-cycle-obstructed",
      obstruction: Object.freeze({
        boundary: "koios.news",
        reason,
        requiredMove: "Koios must diagnose or replace the failed internal service before replaying this demand.",
      }),
      ...(pulseIdentity === undefined ? {} : {
        internalService: internalServiceAccount({ pulseId: pulseIdentity.pulseId }),
        trigger: pulseIdentity,
      }),
    }),
  });
  try {
    appendKoiosAct({
      dataRoot: effectiveDataDir,
      ledger: "contract-events",
      instant: failedAt,
      act: "publication.internal-service.obstructed",
      subject: pulseIdentity?.pulseId ?? recordDigest(pulse),
      data: {
        contract: CONTRACT,
        code: "publication-cycle-obstructed",
        reason,
        terminalDigest: recordDigest(terminal),
        ...(pulseIdentity === undefined ? {} : {
          internalService: internalServiceAccount({ pulseId: pulseIdentity.pulseId }),
          transportActor: pulseIdentity.actor,
        }),
        koiosTerritoryMutation: false,
      },
    });
  } catch {
    // The typed customer settlement remains deliverable even when Koios's
    // evidence carrier is itself the obstruction.
  }
  process.stdout.write(`${JSON.stringify(terminal, null, 2)}\n`);
}
