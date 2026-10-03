// Gemini Notebook video capacity, as education consumes it. The account's
// allowances renew per usage window (gemini-notebook allowances.json) and what
// is not spent lapses at the turn, so production is sized to them rather than
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
import { allowanceHold, allowanceLedgerLapses, allowanceLedgerPath, attemptAllowance, holdAllowance, readAllowanceLedger, releaseAllowance, settleAllowance } from "@red-cup-engineering/computer-inference-engine/media/allowance-ledger";
import { loadNotebookAllowances, notebookVideoAllowance, studioSource, videoCapability } from "@red-cup-engineering/gemini-notebook-services-section/allowances";
import { shareAllowance } from "@red-cup-engineering/organizing/enterprise";

const DAY = 86_400_000;
const PRINCIPAL = "urn:ame:public-education-services-section";

const allowanceOf = (id) => loadNotebookAllowances().find((allowance) => allowance.id === id) ?? null;
const turnOf = (reading) => reading?.meters.map(({ resetsAt }) => resetsAt).filter(Boolean).sort()[0] ?? null;

/** Let go of the lesson's previous hold: an unsubmitted one is returned, a submitted one failed and is void. */
function dropHold(hold, { storePath, at }) {
  const allowance = allowanceOf(hold.allowance);
  if (!allowance) return;
  if (hold.state === "held") releaseAllowance(allowance, hold.id, { storePath, now: at });
  else if (hold.state === "attempted") settleAllowance(allowance, hold.id, { outcome: "void", storePath, now: at });
}

/**
 * Hold and claim one video's kind immediately before submission. Returns
 * true to submit, or `{ message }` to wait for the window to turn.
 */
export async function admitVideoGeneration({ state, save, record, format, request = {}, env = process.env, now = () => new Date() }) {
  const storePath = allowanceLedgerPath(env);
  const allowance = notebookVideoAllowance(format);
  const kind = videoCapability(format);
  const at = now();
  const current = state();
  let hold = current.videoHold ? allowanceHold(current.videoHold, { storePath }) : null;
  if (current.videoHold && !(hold?.state === "held" && hold.kind === kind)) {
    // A retry after a failure, or in another format: what the last attempt held is done.
    if (hold) dropHold(hold, { storePath, at });
    save({ videoHold: null });
    hold = null;
  }
  if (!hold) {
    const held = holdAllowance(allowance, { kind, principal: PRINCIPAL, reference: request.workLot ?? `${current.channel}/${current.lessonId}`, probe: true }, { storePath, now: at });
    if (held.disposition !== "held") {
      const turn = turnOf(held.reading);
      return { message: `Gemini Notebook ${format} does not fit the current window (${held.reason})${turn ? `; it turns at ${turn}` : ""}` };
    }
    hold = held.hold;
    save({ videoHold: hold.id });
    record({ step: "video", outcome: "capacity-held", format, allowance: allowance.id, hold: hold.id, probe: hold.probe });
  }
  const attempted = attemptAllowance(allowance, hold.id, { storePath, now: at });
  if (attempted.disposition === "attempted") return true;
  save({ videoHold: null });
  const turn = turnOf(attempted.reading);
  return { message: `Gemini Notebook ${format} no longer fits the current window (${attempted.reason})${turn ? `; it turns at ${turn}` : ""}` };
}

/**
 * Account for the submission advanceNotebookVideo just made or resolved.
 * `submittedThisRun` distinguishes a fresh quota refusal from one still
 * being reconciled, so a later window is never marked spent by an old answer.
 */
export async function settleVideoCapacity({ state, save, record, outcome, submittedThisRun, env = process.env, now = () => new Date() }) {
  const storePath = allowanceLedgerPath(env);
  const current = state();
  if (!current.videoHold) return;
  const hold = allowanceHold(current.videoHold, { storePath });
  const allowance = hold ? allowanceOf(hold.allowance) : null;
  if (!hold || !allowance) return save({ videoHold: null });
  const at = now();
  if (outcome?.providerCode === "RATE_LIMITED" && submittedThisRun) {
    settleAllowance(allowance, hold.id, { outcome: "refused", storePath, now: at });
    save({ videoHold: null });
    return record({ step: "video", outcome: "capacity-refused", providerCode: "RATE_LIMITED", allowance: allowance.id, kind: hold.kind, probe: hold.probe });
  }
  if (current.artifactId) {
    const source = studioSource(current.notebookId, current.artifactId);
    settleAllowance(allowance, hold.id, { outcome: "spent", source, storePath, now: at });
    const resource = { allowance: allowance.id, kind: hold.kind, count: hold.count, hold: hold.id, source, accountIdentity: allowance.account };
    save({ videoHold: null, videoCapacity: resource });
    return record({ step: "video", outcome: "capacity-settled", ...resource });
  }
  if (outcome?.status === "video-refused") {
    settleAllowance(allowance, hold.id, { outcome: "void", storePath, now: at });
    save({ videoHold: null });
    record({ step: "video", outcome: "capacity-void", allowance: allowance.id, kind: hold.kind });
  }
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

/**
 * How many lessons each channel should have commissioned so the coming
 * windows are spent. Each allowance's units over `lookaheadWindows` (what is
 * surely left of the current window plus whole later windows at the budget
 * surely known) are first claimed by commissioned lessons not yet submitted,
 * then divided among channels by organizing's shareAllowance. A channel never
 * queues past its publication horizon. Units no channel can take are
 * `idleUnits`, and `lapsed` is what each allowance lost over the fairness
 * horizon: capacity that needs another consumer. An allowance no channel
 * draws on is reported with reason `no-consumer`.
 *
 * @param {Array<{config: object, episodes: object[], queued: number, scheduled: number}>} channels
 *   queued: commissioned lessons not yet submitted; scheduled: upcoming publications plus lessons in production.
 */
export async function planVideoCommissioning(channels, { policy = {}, env = process.env, now = new Date() } = {}) {
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
    const costs = Object.fromEntries(Object.entries(reading.costs).filter(([, { lo, hi }]) => hi !== null && hi > 0 && hi === lo).map(([kind, { hi }]) => [kind, hi]));
    const perWindow = Math.min(...reading.meters.map(({ budget }) => budget.lo));
    const current = Math.min(...reading.meters.map(({ remaining }) => remaining.lo));
    let units = current + perWindow * (lookahead - 1);
    for (const { config, queued } of members) units -= queued * (costs[videoCapability(config.video.format)] ?? 0);
    const demands = members.filter(({ config }) => videoCapability(config.video.format) in costs).map(({ config, episodes, scheduled }) => ({
      consumer: config.id, kind: videoCapability(config.video.format), weight: config.capacityWeight ?? 1,
      wanted: Math.max(0, slotsWithin(config.schedule, horizonDays, now) - scheduled),
      served: servedUnits(costs, episodes, servedSince),
    }));
    const share = shareAllowance({ available: Math.max(0, units), costs, demands });
    for (const grant of share.grants) targets.set(grant.consumer, grant.draws);
    plans.push({ allowance: allowance.id, product: allowance.product, resetsAt: turnOf(reading), windowRemaining: current, perWindow,
      lookaheadUnits: Math.max(0, units), grants: share.grants, idleUnits: share.unallocated, lapsed });
  }
  return { targets, plans };
}
