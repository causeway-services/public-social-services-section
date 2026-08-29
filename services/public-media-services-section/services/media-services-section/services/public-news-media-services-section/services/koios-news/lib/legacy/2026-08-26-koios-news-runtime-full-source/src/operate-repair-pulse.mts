#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { DEFAULT_CONTENT_DIR, DEFAULT_DATA_DIR } from "./config.mjs";
import { pendingPrimaryStaticRelease, settlePrimaryStaticRelease, witnessPrimaryStaticRelease } from "./management/cloudflare-primary-release-contract.mjs";
import { preparePrimaryStaticRelease } from "./management/primary-static-release-preparation.mjs";
import { settlePendingAttentionSurfaces } from "./management/pending-attention-surface-settlement.mjs";
import { repairCommodityOrder, selectRepairableBacklog, selectSourceIntelligenceBacklog, selectSourceOriginalityRevalidationBacklog, type RepairCommodity } from "./management/issue-controller.mjs";
import { appendKoiosAct, readKoiosLedger, recordDigest, type JsonObject } from "./management/ledger.mjs";
import { newsroomRepairMechanismDigest, settleNewsroomRepairReplay } from "./management/newsroom-repair-replay.mjs";
import { repairStartCooldownDecision, REPAIR_START_COOLDOWN_MILLISECONDS } from "./management/repair-start-cooldown.mjs";
import { settleSourceIntelligenceReplay } from "./management/source-intelligence-replay.mjs";
import { runNewsroomCircuitSafely } from "./management/newsroom-circuit.mjs";

const CONTEXT = "https://www.w3.org/ns/activitystreams";
const PUBLICATION = "https://koios.news/activitypub/actor";
const CLOCKKEEPER = "urn:colony:cold-red-gate:clockkeeper";
export const REPAIR_PULSE_CONTRACT = "koios-news/newsroom-repair-pulse/v1";
export const REPAIR_PULSE_CAPABILITY = "urn:capability:koios-news:clockkeeper:cold-red-gate:newsroom-repair-pulse:v1";
export { REPAIR_START_COOLDOWN_MILLISECONDS };
const CAPACITY_CONSUMING_REPAIR_DISPOSITIONS = new Set(["replay-ready", "release-pending", "released", "published"]);

function argument(name: string): string | undefined { const index = process.argv.indexOf(name); return index === -1 ? undefined : process.argv[index + 1]; }
function object(value: unknown): value is JsonObject { return value !== null && typeof value === "object" && !Array.isArray(value); }
function response(activity: JsonObject, type: "Accept" | "Question" | "Reject", payload: JsonObject): JsonObject { return { "@context": CONTEXT, type, actor: PUBLICATION, target: activity["actor"] ?? "urn:actor:unidentified", ...(typeof activity["id"] === "string" ? { inReplyTo: activity["id"] } : {}), object: { type: "NewsroomRepairPulseSettlement", contract: REPAIR_PULSE_CONTRACT, ...payload } }; }

let activity: JsonObject = {};
try {
  const parsed: unknown = JSON.parse(readFileSync(0, "utf8"));
  if (!object(parsed)) throw new Error("repair pulse requires one ActivityStreams object");
  activity = parsed;
} catch (error) { process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`); process.exitCode = 1; }

if (process.exitCode !== 1) {
  const demand = object(activity["object"]) ? activity["object"] : undefined;
  if (activity["@context"] !== CONTEXT || activity["type"] !== "Create" || activity["target"] !== PUBLICATION || activity["actor"] !== CLOCKKEEPER || activity["capability"] !== REPAIR_PULSE_CAPABILITY || demand?.["type"] !== "NewsroomRepairPulseDemand" || demand["contract"] !== REPAIR_PULSE_CONTRACT || typeof demand["pulseId"] !== "string") {
    process.stdout.write(`${JSON.stringify(response(activity, "Reject", { code: "unauthorized-or-invalid-demand", customerMutation: false }))}\n`);
    process.exitCode = 2;
  } else {
    const now = argument("--now") ?? (typeof activity["published"] === "string" ? activity["published"] : new Date().toISOString());
    const dataDir = resolve(argument("--data-dir") ?? DEFAULT_DATA_DIR);
    const contentDir = resolve(argument("--content-dir") ?? DEFAULT_CONTENT_DIR);
    const outputDir = resolve(argument("--out") ?? ".static/koios.news-candidate");
    const pending = pendingPrimaryStaticRelease(dataDir, outputDir);
    if (pending !== undefined) {
      let release;
      let witness;
      let reason;
      let attention;
      try {
        attention = await settlePendingAttentionSurfaces({ pending, now, dataDir, contentDir });
        if (attention.disposition === "clear") {
          const prepared = await preparePrimaryStaticRelease({ assignmentId: pending.assignmentId, slug: pending.slug, candidateDir: pending.candidate.outputDir, dataDir, now: new Date().toISOString() });
          release = settlePrimaryStaticRelease({ assignmentId: prepared.assignmentId, slug: prepared.slug, candidateDir: prepared.candidate.outputDir, dataDir, now });
          if (release.accepted) witness = await witnessPrimaryStaticRelease({ slug: prepared.slug, dataDir });
        }
      } catch (error) { reason = error instanceof Error ? error.message : String(error); }
      const released = release?.accepted === true && witness?.witnessed === true;
      const predecessor = readKoiosLedger(dataDir, "contract-events")
        .filter((entry) => entry["act"] === "newsroom.repair.replay-ready" && entry["subject"] === pending.assignmentId)
        .map((entry) => object(entry["data"]) ? entry["data"]["predecessorAssignmentId"] : undefined)
        .filter((value): value is string => typeof value === "string" && value !== "")
        .at(-1);
      const settlement = Object.freeze({
        kind: "koios.pending-primary-release-settlement",
        contract: "koios.news/newsroom-repair-replay/v1",
        recordedAt: new Date().toISOString(),
        predecessorAssignmentId: predecessor ?? null,
        successorAssignmentId: pending.assignmentId,
        slug: pending.slug,
        release: release ?? null,
        publicWitness: witness ?? null,
        attentionSurfaceSettlement: attention ?? null,
        disposition: released ? "released" : attention?.disposition === "reprojected" ? "attention-surface-settled-release-pending" : "release-obstructed",
        ...(reason === undefined ? {} : { reason }),
      });
      appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: settlement.recordedAt, act: "newsroom.repair-replay.settled", subject: pending.assignmentId, data: { settlementDigest: recordDigest(settlement), repairMechanismDigest: newsroomRepairMechanismDigest(), disposition: settlement.disposition, ...(predecessor === undefined ? {} : { predecessorAssignmentId: predecessor }), successorAssignmentId: pending.assignmentId } });
      process.stdout.write(`${JSON.stringify(response(activity, released ? "Accept" : "Question", { pulseId: demand["pulseId"], disposition: settlement.disposition, selectedAssignmentId: pending.assignmentId, proposedMove: attention?.disposition === "reprojected" ? "resume-reprojected-primary-release" : "resume-primary-release", settlement, customerMutation: true }))}\n`);
    } else {
    const gateRevalidations: Array<Readonly<{ assignmentId: string; slug: string; newsroom: Awaited<ReturnType<typeof runNewsroomCircuitSafely>> }>> = [];
    for (let index = 0; index < 6; index += 1) {
      const gateRevalidation = selectSourceOriginalityRevalidationBacklog(dataDir, now, contentDir);
      if (gateRevalidation === undefined) break;
      const newsroom = await runNewsroomCircuitSafely({
        assignmentId: gateRevalidation.assignmentId,
        now: new Date().toISOString(),
        maxRepairs: 0,
        outputDir,
        dataDir,
        contentDir,
        sourceOriginalityRevalidation: {
          refusalDigest: gateRevalidation.refusalDigest,
          priorMechanismDigest: gateRevalidation.priorMechanismDigest,
          currentMechanismDigest: gateRevalidation.currentMechanismDigest,
        },
      });
      const recordedAt = new Date().toISOString();
      appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: recordedAt, act: "newsroom.source-originality-gate-revalidation.settled", subject: gateRevalidation.assignmentId, data: {
        slug: gateRevalidation.slug,
        refusalDigest: gateRevalidation.refusalDigest,
        priorGateMechanismDigest: gateRevalidation.priorMechanismDigest,
        gateMechanismDigest: gateRevalidation.currentMechanismDigest,
        disposition: newsroom.disposition,
        newsroomDigest: recordDigest(newsroom),
        revalidationAdmitted: newsroom.transitions.includes("deterministic-form-settled"),
        providerInvocation: false,
        customerMutation: true,
      } });
      gateRevalidations.push(Object.freeze({ assignmentId: gateRevalidation.assignmentId, slug: gateRevalidation.slug, newsroom }));
      if (!newsroom.transitions.includes("source-originality-refused")) break;
    }
    if (gateRevalidations.length > 0) {
      const last = gateRevalidations.at(-1)!;
      process.stdout.write(`${JSON.stringify(response(activity, "Question", { pulseId: demand["pulseId"], disposition: last.newsroom.disposition === "published" ? "release-pending" : last.newsroom.disposition, selectedAssignmentId: last.assignmentId, proposedMove: "revalidate-source-originality-gate", revalidationCount: gateRevalidations.length, revalidations: gateRevalidations, customerMutation: true }))}\n`);
    } else {
    // Select the next executable commodity before evaluating anti-thrashing.
    // Cooldown identity belongs to the exact capacity purchase, not to the
    // market as a whole.
    const sourceCandidate = selectSourceIntelligenceBacklog(dataDir, now, contentDir);
    const repairCandidate = selectRepairableBacklog(dataDir, now, contentDir);
    const candidates = new Map<RepairCommodity, typeof sourceCandidate | typeof repairCandidate>([
      ["source-intelligence", sourceCandidate],
      ["manuscript-repair", repairCandidate],
    ]);
    const selectedCommodity = repairCommodityOrder(readKoiosLedger(dataDir, "contract-events")).find((commodity) => candidates.get(commodity) !== undefined);
    const selectedCandidate = selectedCommodity === undefined ? undefined : candidates.get(selectedCommodity);
    const latestRepair = readKoiosLedger(dataDir, "contract-events")
      .filter((entry) => {
        if (entry["act"] !== "newsroom.repair-replay.settled") return false;
        const data = object(entry["data"]) ? entry["data"] : undefined;
        return data?.["capacityConsumed"] === true || CAPACITY_CONSUMING_REPAIR_DISPOSITIONS.has(String(data?.["disposition"] ?? ""));
      })
      .sort((left, right) => String(left["recordedAt"] ?? "").localeCompare(String(right["recordedAt"] ?? "")))
      .at(-1);
    const latestRepairAt = typeof latestRepair?.["recordedAt"] === "string" ? Date.parse(latestRepair["recordedAt"]) : Number.NaN;
    const pulseAt = Date.parse(now);
    const latestRepairData = latestRepair !== undefined && object(latestRepair["data"]) ? latestRepair["data"] : undefined;
    const priorRepairMechanismDigest = typeof latestRepairData?.["repairMechanismDigest"] === "string" ? latestRepairData["repairMechanismDigest"] : undefined;
    const currentRepairMechanismDigest = newsroomRepairMechanismDigest();
    const latestPurchasedAssignmentId = typeof latestRepairData?.["predecessorAssignmentId"] === "string"
      ? latestRepairData["predecessorAssignmentId"]
      : typeof latestRepair?.["subject"] === "string" ? latestRepair["subject"] : undefined;
    const cooldown = repairStartCooldownDecision({
      pulseAt,
      latestRepairAt,
      ...(latestPurchasedAssignmentId === undefined ? {} : { latestPurchasedAssignmentId }),
      ...(selectedCandidate === undefined ? {} : { candidateAssignmentId: selectedCandidate.assignmentId }),
      ...(selectedCommodity === undefined ? {} : { candidateCommodity: selectedCommodity }),
      sameMechanism: priorRepairMechanismDigest === currentRepairMechanismDigest,
    });
    if (cooldown.blocked) {
      process.stdout.write(`${JSON.stringify(response(activity, "Accept", {
        pulseId: demand["pulseId"],
        disposition: "quiescent",
        code: "repair-start-cooldown",
        nextRepairEligibleAt: cooldown.nextEligibleAt!,
        selectedAssignmentId: null,
        customerMutation: false,
      }))}\n`);
    } else {
    if (cooldown.changedMechanismCrossing) {
      appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: now, act: "newsroom.repair.mechanism-change-admitted", subject: currentRepairMechanismDigest, data: { priorRepairMechanismDigest: priorRepairMechanismDigest ?? null, currentRepairMechanismDigest, latestRepairAt: new Date(latestRepairAt).toISOString(), ordinaryNextRepairEligibleAt: new Date(latestRepairAt + REPAIR_START_COOLDOWN_MILLISECONDS).toISOString(), authority: "changed-executable-remedy", customerMutation: false } });
    }
    // Repair the earliest defective layer inside each lineage. Across
    // independent lineages, alternate executable source and manuscript
    // commodities so a scarce discovery provider cannot starve ready prose
    // repairs, while evidence remains the cold-start preference.
    const sourceSelection = selectedCommodity === "source-intelligence" ? sourceCandidate : undefined;
    const repairSelection = selectedCommodity === "manuscript-repair" ? repairCandidate : undefined;
    if (selectedCommodity !== undefined) appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: now, act: "newsroom.repair.commodity-selected", subject: String(candidates.get(selectedCommodity)!.assignmentId), data: { commodity: selectedCommodity, sourceCandidateAssignmentId: sourceCandidate?.assignmentId ?? null, manuscriptCandidateAssignmentId: repairCandidate?.assignmentId ?? null, allocation: "alternating-executable-commodity-v1", customerMutation: false, providerInvocation: false } });
    let sourceSettlement;
    if (sourceSelection !== undefined) {
      sourceSettlement = await settleSourceIntelligenceReplay({ assignmentId: sourceSelection.assignmentId, ...(sourceSelection.slug === null ? {} : { slug: sourceSelection.slug }), now, dataDir, contentDir, forceDeepen: true });
    }
    let sourceCircuitSettlement;
    if (sourceSettlement?.disposition === "ready" && sourceSettlement.successorAssignmentId !== undefined) {
      const newsroom = await runNewsroomCircuitSafely({ assignmentId: sourceSettlement.successorAssignmentId, now: new Date().toISOString(), maxRepairs: 3, outputDir, dataDir, contentDir });
      const disposition = newsroom.disposition === "published" ? "release-pending" : newsroom.disposition;
      sourceCircuitSettlement = Object.freeze({
        kind: "koios.source-intelligence-circuit-replay-settlement",
        contract: "koios.news/source-intelligence-circuit-replay/v1",
        recordedAt: new Date().toISOString(),
        predecessorAssignmentId: sourceSelection!.assignmentId,
        successorAssignmentId: sourceSettlement.successorAssignmentId,
        sourceIntelligenceSettlement: sourceSettlement,
        newsroom,
        disposition,
      });
      appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: sourceCircuitSettlement.recordedAt, act: "source-intelligence.circuit-replay.settled", subject: sourceSettlement.successorAssignmentId, data: { predecessorAssignmentId: sourceSelection!.assignmentId, successorAssignmentId: sourceSettlement.successorAssignmentId, disposition, settlementDigest: recordDigest(sourceCircuitSettlement), proseRepairCapacityConsumed: false } });
    }
    const selected = repairSelection ?? (sourceSettlement?.disposition === "ready" && sourceSettlement.successorAssignmentId === undefined
      ? sourceSelection
      : undefined);
    if (sourceCircuitSettlement !== undefined) {
      process.stdout.write(`${JSON.stringify(response(activity, "Question", { pulseId: demand["pulseId"], disposition: sourceCircuitSettlement.disposition, selectedAssignmentId: sourceCircuitSettlement.successorAssignmentId, proposedMove: "replay-source-intelligence", sourceIntelligenceSettlement: sourceSettlement!, settlement: sourceCircuitSettlement, customerMutation: true }))}\n`);
    } else if (selected === undefined) {
      process.stdout.write(`${JSON.stringify(response(activity, sourceSettlement?.disposition === "refused" ? "Question" : "Accept", { pulseId: demand["pulseId"], disposition: sourceSettlement?.disposition === "refused" ? "source-intelligence-refused" : "quiescent", selectedAssignmentId: sourceSelection?.assignmentId ?? null, ...(sourceSettlement === undefined ? {} : { sourceIntelligenceSettlement: sourceSettlement }), customerMutation: sourceSettlement !== undefined }))}\n`);
    } else {
      const settlement = await settleNewsroomRepairReplay({ assignmentId: selected.assignmentId, now, dataDir, contentDir, outputDir });
      const disposition = String(settlement["disposition"] ?? "obstructed");
      const complete = ["released", "published"].includes(disposition);
      process.stdout.write(`${JSON.stringify(response(activity, complete ? "Accept" : "Question", { pulseId: demand["pulseId"], disposition, selectedAssignmentId: selected.assignmentId, proposedMove: selected.proposedMove, ...(sourceSettlement === undefined ? {} : { sourceIntelligenceSettlement: sourceSettlement }), settlement, customerMutation: true }))}\n`);
    }
    }
    }
    }
  }
}
