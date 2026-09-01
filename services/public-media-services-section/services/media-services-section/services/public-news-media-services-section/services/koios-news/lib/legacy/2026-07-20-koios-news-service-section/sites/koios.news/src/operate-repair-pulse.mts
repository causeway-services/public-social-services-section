#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { DEFAULT_CONTENT_DIR, DEFAULT_DATA_DIR } from "./config.mjs";
import { pendingPrimaryStaticRelease, settlePrimaryStaticRelease, witnessPrimaryStaticRelease } from "./management/cloudflare-primary-release-contract.mjs";
import { selectRepairableBacklog } from "./management/issue-controller.mjs";
import { appendKoiosAct, readKoiosLedger, recordDigest, type JsonObject } from "./management/ledger.mjs";
import { settleNewsroomRepairReplay } from "./management/newsroom-repair-replay.mjs";

const CONTEXT = "https://www.w3.org/ns/activitystreams";
const PUBLICATION = "https://koios.news/activitypub/actor";
const CLOCKKEEPER = "urn:colony:cold-red-gate:clockkeeper";
export const REPAIR_PULSE_CONTRACT = "koios-news/newsroom-repair-pulse/v1";
export const REPAIR_PULSE_CAPABILITY = "urn:capability:koios-news:clockkeeper:cold-red-gate:newsroom-repair-pulse:v1";
export const REPAIR_START_COOLDOWN_MILLISECONDS = 4 * 60 * 60 * 1_000;

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
      try {
        release = settlePrimaryStaticRelease({ assignmentId: pending.assignmentId, slug: pending.slug, candidateDir: pending.candidate.outputDir, dataDir, now });
        if (release.accepted) witness = await witnessPrimaryStaticRelease({ slug: pending.slug, dataDir });
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
        disposition: released ? "released" : "release-obstructed",
        ...(reason === undefined ? {} : { reason }),
      });
      appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: settlement.recordedAt, act: "newsroom.repair-replay.settled", subject: pending.assignmentId, data: { settlementDigest: recordDigest(settlement), disposition: settlement.disposition, ...(predecessor === undefined ? {} : { predecessorAssignmentId: predecessor }), successorAssignmentId: pending.assignmentId } });
      process.stdout.write(`${JSON.stringify(response(activity, released ? "Accept" : "Question", { pulseId: demand["pulseId"], disposition: settlement.disposition, selectedAssignmentId: pending.assignmentId, proposedMove: "resume-primary-release", settlement, customerMutation: true }))}\n`);
    } else {
    const latestRepair = readKoiosLedger(dataDir, "contract-events")
      .filter((entry) => entry["act"] === "newsroom.repair-replay.settled")
      .sort((left, right) => String(left["recordedAt"] ?? "").localeCompare(String(right["recordedAt"] ?? "")))
      .at(-1);
    const latestRepairAt = typeof latestRepair?.["recordedAt"] === "string" ? Date.parse(latestRepair["recordedAt"]) : Number.NaN;
    const pulseAt = Date.parse(now);
    if (Number.isFinite(latestRepairAt) && Number.isFinite(pulseAt) && pulseAt < latestRepairAt + REPAIR_START_COOLDOWN_MILLISECONDS) {
      process.stdout.write(`${JSON.stringify(response(activity, "Accept", {
        pulseId: demand["pulseId"],
        disposition: "quiescent",
        code: "repair-start-cooldown",
        nextRepairEligibleAt: new Date(latestRepairAt + REPAIR_START_COOLDOWN_MILLISECONDS).toISOString(),
        selectedAssignmentId: null,
        customerMutation: false,
      }))}\n`);
    } else {
    const selected = selectRepairableBacklog(dataDir, now);
    if (selected === undefined) {
      process.stdout.write(`${JSON.stringify(response(activity, "Accept", { pulseId: demand["pulseId"], disposition: "quiescent", selectedAssignmentId: null, customerMutation: false }))}\n`);
    } else {
      const settlement = await settleNewsroomRepairReplay({ assignmentId: selected.assignmentId, now, dataDir, contentDir, outputDir, ...(process.env["LISS_INFERENCE_SOCKET"] === undefined ? {} : { socketPath: process.env["LISS_INFERENCE_SOCKET"]! }) });
      const disposition = String(settlement["disposition"] ?? "obstructed");
      const complete = ["released", "published"].includes(disposition);
      process.stdout.write(`${JSON.stringify(response(activity, complete ? "Accept" : "Question", { pulseId: demand["pulseId"], disposition, selectedAssignmentId: selected.assignmentId, proposedMove: selected.proposedMove, settlement, customerMutation: true }))}\n`);
    }
    }
    }
  }
}
