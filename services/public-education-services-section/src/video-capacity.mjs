// Gemini Notebook video capacity, as education consumes it. The account's
// allowance recurs per usage window (gemini-notebook entitlement-plans.json)
// and is lost at reset, so production is sized to it rather than to the
// publication buffer alone:
//
//   commissioning   each channel is commissioned enough researched lessons to
//                   take its fair share of the next windows (production.json
//                   `capacity`), within its publication horizon;
//   submission      a lesson holds its format's units from the current window
//                   just before Gemini Notebook is asked for the video, and
//                   waits (`awaiting-capacity`) when the window is spent;
//   settlement      a bound artifact spends the units; a confirmed refusal
//                   spends none; a quota refusal marks the window spent.
import { join } from "node:path";
import { accountArtifactCapacityStorePath, currentPlanEntitlement, exhaustPlanEntitlement, observeAccountArtifactCapacity, reservePlanEntitlement, transitionAccountArtifactCapacity } from "@red-cup-engineering/computer-inference-engine/media/account-artifact-capacity";
import { allocateEntitlementUnits } from "@red-cup-engineering/computer-inference-engine/media/entitlement-plan";
import { loadNotebookEntitlementPlans, notebookVideoPlan, videoCapability } from "@red-cup-engineering/gemini-notebook-services-section/entitlement-plans";
import { readJson, writeAtomic } from "./channel.mjs";

const DAY = 86_400_000;
const PRINCIPAL = "urn:ame:public-education-services-section";

const packetPathOf = (work) => join(work, "video-capacity.json");
const unitsOf = (plan, format) => plan.unitsByCapability[videoCapability(format)];

/** The lesson's capacity cannot be accounted for until its operator acts; `status` says why. */
export class VideoCapacityBlocked extends Error {
  constructor(status, message = status) { super(message); this.status = status; }
}

/** The retained, unsettled capacity packet for this lesson, if any. */
function retainedPacket(work, state) {
  if (!state.videoCapacityPacket) return null;
  const packet = readJson(packetPathOf(work), null);
  if (packet?.id !== state.videoCapacityPacket) throw new VideoCapacityBlocked("video-capacity-packet-missing", `Restore ${packetPathOf(work)} before the video is submitted or settled`);
  return packet;
}

/**
 * Hold and claim one video's units immediately before submission. Returns
 * true to submit, or `{ message }` to wait for the next window.
 */
export async function admitVideoGeneration({ work, state, save, record, format, request, env = process.env, now = () => new Date() }) {
  const storePath = accountArtifactCapacityStorePath(env);
  const plan = notebookVideoPlan(format);
  const evaluatedAt = now().toISOString();
  let packet = retainedPacket(work, state());
  if (packet && packet.capability !== videoCapability(format)) {
    // A retry moved to another format: an unclaimed hold is returned; a claimed one stays charged.
    const released = await transitionAccountArtifactCapacity(packet, [], { storePath, action: "release", evaluatedAt });
    if (released.disposition !== "released") await transitionAccountArtifactCapacity(packet, [], { storePath, action: "settle", unitsSpent: packet.quotedUnits, evaluatedAt });
    save({ videoCapacityPacket: null });
    packet = null;
  }
  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (!packet) {
      const held = await reservePlanEntitlement(plan, { ...request, principal: PRINCIPAL, capability: videoCapability(format), outputMimeType: "video/mp4" }, { storePath, evaluatedAt });
      if (held.disposition !== "held") return { message: `Gemini Notebook ${format} capacity is spent (${held.reason}); the window resets at ${held.window.resetsAt}` };
      writeAtomic(packetPathOf(work), held.packet);
      save({ videoCapacityPacket: held.packet.id });
      record({ step: "video", outcome: "capacity-held", format, units: held.packet.quotedUnits, window: held.window.windowIdentity, resetsAt: held.window.resetsAt });
      packet = held.packet;
    }
    const claimed = await transitionAccountArtifactCapacity(packet, [], { storePath, action: "attempt", evaluatedAt });
    if (claimed.disposition === "attempted") return true;
    if (claimed.reason !== "resource-availability-evidence-not-current") return { message: `Gemini Notebook capacity could not be claimed (${claimed.reason})` };
    // The hold's window reset before submission: return it and hold from the current window.
    await transitionAccountArtifactCapacity(packet, [], { storePath, action: "release", evaluatedAt });
    save({ videoCapacityPacket: null });
    packet = null;
  }
  return { message: "Gemini Notebook capacity could not be held" };
}

/**
 * Account for the submission advanceNotebookVideo just made or resolved.
 * `submittedThisRun` distinguishes a fresh quota refusal from one still
 * being reconciled, so a later window is never marked spent by an old answer.
 */
export async function settleVideoCapacity({ work, state, save, record, outcome, submittedThisRun, env = process.env, now = () => new Date() }) {
  const storePath = accountArtifactCapacityStorePath(env);
  const current = state();
  const packet = retainedPacket(work, current);
  const evaluatedAt = now().toISOString();
  if (outcome?.providerCode === "RATE_LIMITED" && submittedThisRun) {
    const format = current.generationAttempt?.format ?? packet?.capability.replace(/^video-overview:/u, "");
    const { window } = exhaustPlanEntitlement(notebookVideoPlan(format), { storePath, observedAt: evaluatedAt, reference: `Gemini Notebook RATE_LIMITED for ${current.channel}/${current.lessonId}` });
    record({ step: "video", outcome: "capacity-exhausted", providerCode: "RATE_LIMITED", window: window.windowIdentity, resetsAt: window.resetsAt });
  }
  if (!packet) return;
  const spent = current.artifactId ? packet.quotedUnits : outcome?.status === "video-refused" ? 0 : null;
  if (spent === null) return;
  const settled = await transitionAccountArtifactCapacity(packet, [], { storePath, action: "settle", unitsSpent: spent, evaluatedAt });
  if (settled.disposition !== "settled") return record({ step: "video", outcome: "capacity-unsettled", reason: settled.reason });
  const resource = { unit: packet.resourceUnit, quoted: packet.quotedUnits, spent, packet: packet.id, accountIdentity: packet.accountIdentity, windowIdentity: packet.windowIdentity };
  save({ videoCapacityPacket: null, ...(current.artifactId ? { videoCapacity: resource } : {}) });
  record({ step: "video", outcome: "capacity-settled", ...resource });
}

/** Publication slots a schedule offers in the next `days` days. */
const slotsWithin = (schedule, days, now) => {
  let slots = 0;
  for (let day = 0; day < days; day += 1) if (schedule.days.includes(new Date(now.getTime() + day * DAY).getUTCDay())) slots += 1;
  return slots;
};

/** Units a channel's submissions drew over the trailing horizon, the allocator's fairness memory. */
const servedUnits = (plan, episodes, since) => episodes.reduce((total, state) => {
  const attempts = [...(state.videoFailures ?? []).map(({ at, format }) => ({ at, format })),
    ...(state.artifactId && state.generationAttempt ? [{ at: state.generationAttempt.startedAt, format: state.generationAttempt.format }] : [])];
  return total + attempts.filter(({ at, format }) => Date.parse(at) >= since && videoCapability(format) in plan.unitsByCapability)
    .reduce((sum, { format }) => sum + unitsOf(plan, format), 0);
}, 0);

/**
 * How many lessons each channel should have commissioned so the coming
 * windows are spent. Each plan's units over `lookaheadWindows` (the current
 * window's uncommitted remainder plus whole later windows) are first claimed
 * by commissioned lessons not yet submitted, then divided among channels by
 * allocateEntitlementUnits. A channel never queues past its publication
 * horizon. Units no channel can take are reported as `idleUnits`: capacity
 * that needs another consumer.
 *
 * @param {Array<{config: object, episodes: object[], queued: number, scheduled: number}>} channels
 *   queued: commissioned lessons not yet submitted; scheduled: upcoming publications plus lessons in production.
 */
export async function planVideoCommissioning(channels, { policy = {}, env = process.env, now = new Date() } = {}) {
  const lookahead = policy.lookaheadWindows ?? 2;
  const horizonDays = policy.horizonDays ?? 21;
  const servedSince = now.getTime() - (policy.fairnessDays ?? 7) * DAY;
  const storePath = accountArtifactCapacityStorePath(env);
  const evaluatedAt = now.toISOString();
  const targets = new Map(), plans = [];
  for (const plan of loadNotebookEntitlementPlans()) {
    const members = channels.filter(({ config }) => videoCapability(config.video.format) in plan.unitsByCapability);
    if (!members.length) { plans.push({ plan: plan.id, product: plan.product, idleUnits: plan.capacity * lookahead, reason: "no-consumer" }); continue; }
    const { window, observation } = currentPlanEntitlement(plan, { storePath, evaluatedAt });
    let current = observation.remaining;
    const uncommitted = await observeAccountArtifactCapacity(observation, { storePath, evaluatedAt }).catch(() => null);
    if (uncommitted?.disposition === "observed") { const { numerator, denominator } = uncommitted.availableResources[0].amount; current = Math.floor(Number(numerator) / Number(denominator)); }
    let units = current + plan.capacity * (lookahead - 1);
    for (const { config, queued } of members) units -= queued * unitsOf(plan, config.video.format);
    const demands = members.map(({ config, episodes, scheduled }) => ({
      consumer: config.id, capability: videoCapability(config.video.format), weight: config.capacityWeight ?? 1,
      wanted: Math.max(0, slotsWithin(config.schedule, horizonDays, now) - scheduled),
      served: servedUnits(plan, episodes, servedSince),
    }));
    const allocation = allocateEntitlementUnits({ available: Math.max(0, units), unitsByCapability: plan.unitsByCapability, demands });
    for (const grant of allocation.grants) targets.set(grant.consumer, grant.artifacts);
    plans.push({ plan: plan.id, product: plan.product, window: window.windowIdentity, resetsAt: window.resetsAt, windowRemaining: current,
      lookaheadUnits: Math.max(0, units), grants: allocation.grants, idleUnits: allocation.unallocatedUnits });
  }
  return { targets, plans };
}
