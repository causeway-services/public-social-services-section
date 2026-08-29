// edge/retry.ts — Exponential-backoff retry policy and passive outlier ejection.
//
// Retry: wraps a fetch-like call (or proxy dispatch) with configurable backoff.
// Outlier ejection: tracks per-upstream consecutive-failure or time-window failure rate;
// ejects outliers from the pool, re-admits after a probe window.
//
// Outlier admission is modeled in MemeCharge vocabulary:
//   potential = upstream healthy (admit)
//   active    = upstream ejected (skip)
//   stable    = contradicted (in ejection + successful probe → re-admit cautiously)
import { witness, UtteranceLog } from "../internal/witness.mjs";
import { chargeValueFromBits } from "../admission.mjs";
function delay(ms, jitter) {
    const actual = jitter ? ms * (0.75 + Math.random() * 0.5) : ms;
    return new Promise((r) => setTimeout(r, actual));
}
export async function withRetries(fn, opts = {}) {
    const maxAttempts = opts.maxAttempts ?? 3;
    const baseDelayMs = opts.baseDelayMs ?? 100;
    const maxDelayMs = opts.maxDelayMs ?? 10_000;
    const jitter = opts.jitter !== false;
    const retryOn = opts.retryOn ?? ((_err, status) => status == null || status >= 500);
    let lastErr;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        }
        catch (err) {
            lastErr = err;
            const shouldRetry = retryOn(err, undefined);
            if (!shouldRetry || attempt === maxAttempts)
                break;
            opts.onRetry?.(attempt, err);
            const backoff = Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs);
            await delay(backoff, jitter);
        }
    }
    throw lastErr;
}
export class OutlierEjector {
    store = new UtteranceLog();
    states = new Map();
    opts;
    constructor(opts = {}) {
        this.opts = {
            consecutiveThreshold: opts.consecutiveThreshold ?? 5,
            windowMs: opts.windowMs ?? 60_000,
            failureRateThreshold: opts.failureRateThreshold ?? 0.5,
            ejectMs: opts.ejectMs ?? 30_000,
            probeSuccesses: opts.probeSuccesses ?? 1,
            onEject: opts.onEject ?? (() => { }),
            onReadmit: opts.onReadmit ?? (() => { }),
        };
    }
    state(id) {
        if (!this.states.has(id))
            this.states.set(id, { consecutive: 0, events: [], ejectedAt: null, probeSuccesses: 0 });
        return this.states.get(id);
    }
    /** Record the outcome of a request to an upstream. */
    record(id, ok) {
        const s = this.state(id);
        const now = Date.now(); // law-allow: wall-clock-as-data — outlier ejection cooldown bookkeeping, not evidence ordering
        if (ok) {
            s.consecutive = 0;
            if (s.ejectedAt !== null) {
                s.probeSuccesses++;
                if (s.probeSuccesses >= this.opts.probeSuccesses) {
                    s.ejectedAt = null;
                    s.probeSuccesses = 0;
                    witness(this.store, { subject: id, predicate: "outlier", object: "readmit" }, [true, false]);
                    this.opts.onReadmit(id);
                }
            }
        }
        else {
            s.consecutive++;
            s.probeSuccesses = 0;
        }
        s.events.push({ ts: now, ok });
        s.events = s.events.filter((e) => now - e.ts < this.opts.windowMs);
        // Check ejection conditions
        const alreadyEjected = s.ejectedAt !== null && now - s.ejectedAt < this.opts.ejectMs;
        if (!alreadyEjected) {
            const triggerConsecutive = s.consecutive >= this.opts.consecutiveThreshold;
            const windowEvents = s.events;
            const failRate = windowEvents.length > 0 ? windowEvents.filter((e) => !e.ok).length / windowEvents.length : 0;
            const triggerRate = failRate >= this.opts.failureRateThreshold && windowEvents.length >= 5;
            if (triggerConsecutive || triggerRate) {
                s.ejectedAt = now;
                witness(this.store, { subject: id, predicate: "outlier", object: "eject" }, [false, true]);
                this.opts.onEject(id);
            }
        }
    }
    /** Settle whether an upstream is currently admissible. */
    isAdmissible(id) {
        const s = this.state(id);
        const now = Date.now(); // law-allow: wall-clock-as-data — outlier ejection cooldown bookkeeping, not evidence ordering
        const g = chargeValueFromBits(s.ejectedAt === null || now - s.ejectedAt >= this.opts.ejectMs, s.ejectedAt !== null);
        return g === "potential" || g === "stable"; // stable = probe window
    }
    /** Whether this upstream is in probe mode (half-ejected). */
    isProbing(id) {
        const s = this.state(id);
        if (s.ejectedAt === null)
            return false;
        return Date.now() - s.ejectedAt >= this.opts.ejectMs; // law-allow: wall-clock-as-data — outlier ejection cooldown bookkeeping, not evidence ordering
    }
}
//# sourceMappingURL=retry.mjs.map