// Gemini Notebook video capacity, as education consumes it. The account's one
// compute pool renews per usage window (gemini-notebook allowances.json) and
// what is not spent lapses at the turn, so production is sized to them rather than
// to the publication buffer alone:
//
//   commissioning   each channel is commissioned enough researched lessons to
//                   take its fair share of the next windows (production.json
//                   `capacity`), within its publication horizon;
//   submission      a lesson holds its format's kind in the allowance ledger
//                   just before Gemini Notebook is asked for the video, and
//                   waits (`awaiting-capacity`) when the window does not fit
//                   it. Where the fit is unknown (the budget is past what was
//                   stated or seen), one lesson at a time probes;
//   settlement      a bound artifact is a spend under its Studio source; a
//                   fresh RATE_LIMITED answer is a quota refusal the
//                   allowance learns from; any other failure is void.
import { allowanceLedgerLapses, allowanceLedgerPath, readAllowanceLedger } from "@red-cup-engineering/computer-inference-engine/media/allowance-ledger";
import { loadNotebookAllowances, videoCapability } from "@red-cup-engineering/gemini-notebook-services-section/allowances";
import { admitStudioCapacity, settleStudioCapacity } from "@red-cup-engineering/gemini-notebook-services-section/studio-work";
import { shareAllowance } from "@red-cup-engineering/organizing/enterprise";

const DAY = 86_400_000;
export const PRINCIPAL = "urn:ame:public-education-services-section";

// When the current window turns; a rolling meter clears continuously and has no turn to wait for.
const turnOf = (reading) => reading?.meters.filter(({ law }) => law !== "sliding").map(({ resetsAt }) => resetsAt).filter(Boolean).sort()[0] ?? null;

/**
 * Hold and claim one video's kind immediately before submission. Returns
 * true to submit, or `{ message }` to wait for the window to turn.
 */
export async function admitVideoGeneration({ state, save, record, format, request = {}, env = process.env, now = () => new Date() }) {
  const current = state();
  const admission = admitStudioCapacity({ kind: videoCapability(format), principal: PRINCIPAL, reference: request.workLot ?? `${current.channel}/${current.lessonId}`, holdId: current.videoHold ?? null, storePath: allowanceLedgerPath(env), now: now() });
  if (!admission.admitted) {
    if (current.videoHold) save({ videoHold: null });
    return { message: admission.message };
  }
  if (admission.held) {
    save({ videoHold: admission.hold.id });
    record({ step: "video", outcome: "capacity-held", format, allowance: admission.allowance, hold: admission.hold.id, probe: admission.hold.probe });
  }
  return true;
}

/**
 * Account for the submission advanceNotebookVideo just made or resolved.
 * `submittedThisRun` distinguishes a fresh quota refusal from one still
 * being reconciled, so a later window is never marked spent by an old answer.
 */
export async function settleVideoCapacity({ state, save, record, outcome, submittedThisRun, env = process.env, now = () => new Date() }) {
  const current = state();
  if (!current.videoHold) return;
  const settled = outcome?.providerCode === "RATE_LIMITED" && submittedThisRun ? "refused" : current.artifactId ? "spent" : outcome?.status === "video-refused" ? "void" : null;
  if (!settled) return;
  const resource = settleStudioCapacity({ holdId: current.videoHold, outcome: settled, notebookId: current.notebookId, artifactId: current.artifactId, storePath: allowanceLedgerPath(env), now: now() });
  save({ videoHold: null, ...(settled === "spent" && resource ? { videoCapacity: resource } : {}) });
  if (resource) record({ step: "video", outcome: settled === "spent" ? "capacity-settled" : `capacity-${settled}`, ...(settled === "refused" ? { providerCode: "RATE_LIMITED" } : {}), ...resource });
}

/** Publication slots a schedule offers in the next `days` days. */
const slotsWithin = (schedule, days, now) => {
  let slots = 0;
  for (let day = 0; day < days; day += 1) if (schedule.days.includes(new Date(now.getTime() + day * DAY).getUTCDay())) slots += 1;
  return slots;
};

/** Units a channel's submissions drew over the trailing horizon, the allocator's fairness memory. */
const servedUnits = (costs, episodes, since) => episodes.reduce((total, state) => {
  const attempts = [...(state.videoFailures ?? []).map(({ at, format }) => ({ at, format })),
    ...(state.artifactId && state.generationAttempt ? [{ at: state.generationAttempt.startedAt, format: state.generationAttempt.format }] : [])];
  return total + attempts.filter(({ at, format }) => Date.parse(at) >= since && videoCapability(format) in costs)
    .reduce((sum, { format }) => sum + costs[videoCapability(format)], 0);
}, 0);

/** The planning estimate of a learned interval: its middle, or its floor where it is unbounded. */
const estimate = ({ lo, hi }) => (hi === null ? lo : (lo + hi) / 2);

/**
 * How many lessons each channel should have commissioned so the coming
 * windows are spent. Each allowance's units over `lookaheadWindows` (what is
 * left of the current window plus whole later windows, within what a rolling
 * meter has left, all at the estimate of what was learned: admission itself
 * stays with the ledger's sure reading) are first claimed by commissioned lessons not yet submitted,
 * then divided among channels by organizing's shareAllowance. A channel never
 * queues past its publication horizon. Units no channel can take are
 * `idleUnits`, and `lapsed` is what each allowance lost over the fairness
 * horizon: capacity that needs another consumer. An allowance no channel
 * draws on is reported with reason `no-consumer`, and the kinds of an
 * allowance neither a channel's videos nor the lessons' `companions` make
 * are listed as `unconsumed`.
 *
 * @param {Array<{config: object, episodes: object[], queued: number, scheduled: number}>} channels
 *   queued: commissioned lessons not yet submitted; scheduled: upcoming publications plus lessons in production.
 */
export async function planVideoCommissioning(channels, { policy = {}, companions = [], env = process.env, now = new Date() } = {}) {
  const lookahead = policy.lookaheadWindows ?? 2;
  const horizonDays = policy.horizonDays ?? 21;
  const servedSince = now.getTime() - (policy.fairnessDays ?? 7) * DAY;
  const storePath = allowanceLedgerPath(env);
  const targets = new Map(), plans = [];
  for (const allowance of loadNotebookAllowances()) {
    const since = new Date(Math.max(servedSince, Date.parse(allowance.statedAt))).toISOString();
    const lapses = allowanceLedgerLapses(allowance, { storePath, since, now });
    const lapsed = lapses.meters.map(({ meter, wasted, idleWindows, utilization }) => ({ meter, wasted, idleWindows, utilization }));
    const members = channels.filter(({ config }) => videoCapability(config.video.format) in allowance.costs);
    if (!members.length) { plans.push({ allowance: allowance.id, product: allowance.product, reason: "no-consumer", lapsed }); continue; }
    const { reading } = readAllowanceLedger(allowance, { storePath, now });
    // A kind whose price is unbounded cannot be planned for, only probed.
    const costs = Object.fromEntries(Object.entries(reading.costs).filter(([, cost]) => cost.hi !== null && estimate(cost) > 0).map(([kind, cost]) => [kind, estimate(cost)]));
    const windowed = reading.meters.filter(({ law }) => law !== "sliding");
    const perWindow = Math.min(...windowed.map(({ budget }) => estimate(budget)));
    const current = Math.min(...windowed.map(({ remaining }) => estimate(remaining)));
    let units = Math.min(current + perWindow * (lookahead - 1), ...reading.meters.filter(({ law }) => law === "sliding").map(({ remaining }) => estimate(remaining)));
    for (const { config, queued } of members) units -= queued * (costs[videoCapability(config.video.format)] ?? 0);
    const demands = members.filter(({ config }) => videoCapability(config.video.format) in costs).map(({ config, episodes, scheduled }) => ({
      consumer: config.id, kind: videoCapability(config.video.format), weight: config.capacityWeight ?? 1,
      wanted: Math.max(0, slotsWithin(config.schedule, horizonDays, now) - scheduled),
      served: servedUnits(costs, episodes, servedSince),
    }));
    const share = shareAllowance({ available: Math.max(0, units), costs, demands });
    for (const grant of share.grants) targets.set(grant.consumer, grant.draws);
    const made = new Set([...members.map(({ config }) => videoCapability(config.video.format)), ...companions]);
    plans.push({ allowance: allowance.id, product: allowance.product, resetsAt: turnOf(reading), windowRemaining: current, perWindow,
      lookaheadUnits: Math.max(0, units), grants: share.grants, idleUnits: share.unallocated, unconsumed: Object.keys(allowance.costs).filter((kind) => !made.has(kind)), lapsed });
  }
  return { targets, plans };
}
