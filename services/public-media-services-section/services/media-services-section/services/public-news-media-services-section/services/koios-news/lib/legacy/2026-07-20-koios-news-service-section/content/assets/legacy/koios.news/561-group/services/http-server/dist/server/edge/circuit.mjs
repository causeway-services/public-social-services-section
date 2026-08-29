// edge/circuit.ts — Circuit breaker as a charge-settled state machine.
//
// States map to MemeCharge vocabulary:
//   potential  = closed (passing requests)
//   active     = open   (rejecting, tripping)
//   stable     = half-open (probing — contradiction held between closed and open)
//
// The UtteranceLog accumulates success/failure evidence. The breaker maps its failure
// window into charge vocabulary for downstream trace reporting.
import { witness, UtteranceLog } from "../internal/witness.mjs";
import { chargeValueFromBits } from "../admission.mjs";
function observeOutcome(ctx) {
    let status = null;
    const res = ctx.res;
    const origWriteHead = res.writeHead.bind(res);
    res.writeHead = (...args) => {
        if (status === null && typeof args[0] === "number")
            status = args[0];
        return origWriteHead(...args);
    };
    return {
        status: () => status ?? (res.headersSent ? res.statusCode ?? null : null),
        committed: () => res.headersSent,
        restore: () => {
            res.writeHead = origWriteHead;
        },
    };
}
function defaultIsFailure(outcome) {
    if (outcome.error)
        return true;
    if (!outcome.committed)
        return true;
    return typeof outcome.status === "number" && outcome.status >= 500;
}
function retryAfterSeconds(nextProbeAt) {
    return String(Math.max(1, Math.ceil((nextProbeAt - Date.now()) / 1000))); // law-allow: wall-clock-as-data — Retry-After is HTTP protocol testimony
}
function failFast(ctx, statusCode, message, nextProbeAt) {
    if (ctx.res.headersSent) {
        try {
            ctx.res.end();
        }
        catch { }
        return;
    }
    ctx.res.setHeader("Retry-After", retryAfterSeconds(nextProbeAt));
    ctx.res.writeHead(statusCode, { "content-type": "text/plain; charset=utf-8" }).end(message);
}
function wrappedCircuitBreaker(inner, opts = {}) {
    const failureThreshold = opts.failureThreshold ?? opts.threshold ?? 5;
    const coolDownMs = opts.coolDownMs ?? opts.resetMs ?? 10_000;
    const halfOpenMax = opts.halfOpenMax ?? 1;
    const successThreshold = opts.successThreshold ?? opts.halfOpenRequests ?? 1;
    const statusCode = opts.statusCode ?? 503;
    const message = opts.message ?? "Service Unavailable (circuit open)";
    const isFailure = opts.isFailure ?? defaultIsFailure;
    let state = "closed";
    let failures = 0;
    let successes = 0;
    let openedAt = 0;
    let halfOpenInFlight = 0;
    const nextProbeAt = () => openedAt + coolDownMs;
    const toOpen = (key) => {
        state = "open";
        openedAt = Date.now(); // law-allow: wall-clock-as-data — breaker cooldown/rolling-window bookkeeping, not evidence ordering
        successes = 0;
        halfOpenInFlight = 0;
        opts.onOpen?.(key);
    };
    const toHalfOpen = (key) => {
        state = "half-open";
        successes = 0;
        halfOpenInFlight = 0;
        opts.onHalfOpen?.(key);
    };
    const toClosed = (key) => {
        state = "closed";
        failures = 0;
        successes = 0;
        halfOpenInFlight = 0;
        opts.onClose?.(key);
    };
    async function runInner(ctx) {
        const probe = observeOutcome(ctx);
        let error = null;
        try {
            await inner(ctx);
        }
        catch (err) {
            error = err;
        }
        finally {
            probe.restore();
        }
        const status = probe.status();
        const committed = probe.committed();
        let failed;
        try {
            failed = isFailure({ ctx, error, status, committed });
        }
        catch {
            failed = defaultIsFailure({ error, status, committed });
        }
        return { failed, error };
    }
    const middleware = async (ctx) => {
        const key = opts.keyBy?.(ctx) ?? "global";
        if (state === "open") {
            if (Date.now() < nextProbeAt()) { // law-allow: wall-clock-as-data — breaker cooldown/rolling-window bookkeeping, not evidence ordering
                failFast(ctx, statusCode, message, nextProbeAt());
                return true;
            }
            toHalfOpen(key);
        }
        if (state === "half-open") {
            if (halfOpenInFlight >= halfOpenMax) {
                failFast(ctx, statusCode, message, nextProbeAt());
                return true;
            }
            halfOpenInFlight += 1;
            const { failed, error } = await runInner(ctx);
            halfOpenInFlight -= 1;
            if (failed) {
                toOpen(key);
            }
            else {
                successes += 1;
                if (successes >= successThreshold)
                    toClosed(key);
            }
            if (error && !ctx.res.headersSent)
                failFast(ctx, statusCode, message, nextProbeAt());
            return true;
        }
        const { failed, error } = await runInner(ctx);
        if (failed) {
            failures += 1;
            if (failures >= failureThreshold)
                toOpen(key);
        }
        else {
            failures = 0;
        }
        if (error && !ctx.res.headersSent)
            failFast(ctx, statusCode, message, nextProbeAt());
        return true;
    };
    Object.defineProperty(middleware, "state", { get: () => state });
    Object.defineProperty(middleware, "stats", {
        get: () => ({
            state,
            failures,
            successes,
            openedAt,
            nextProbeAt: state === "open" ? nextProbeAt() : 0,
            halfOpenInFlight,
        }),
    });
    return Object.assign(middleware, {
        reset() {
            state = "closed";
            failures = 0;
            successes = 0;
            openedAt = 0;
            halfOpenInFlight = 0;
        },
    });
}
function stateTrackingCircuitBreaker(opts = {}) {
    const threshold = opts.threshold ?? 5;
    const windowMs = opts.windowMs ?? 60_000;
    const resetMs = opts.resetMs ?? 10_000;
    const halfOpenRequests = opts.halfOpenRequests ?? 1;
    const statusCode = opts.statusCode ?? 503;
    const message = opts.message ?? "Circuit Open";
    const store = new UtteranceLog();
    const states = new Map();
    const keyFor = opts.keyBy ?? (() => "global");
    function getState(key) {
        if (!states.has(key))
            states.set(key, { failures: [], successesInHalfOpen: 0, openedAt: null });
        return states.get(key);
    }
    function settle(key) {
        const state = getState(key);
        const now = Date.now(); // law-allow: wall-clock-as-data — breaker cooldown/rolling-window bookkeeping, not evidence ordering
        // Prune failures outside the rolling window
        state.failures = state.failures.filter((t) => now - t < windowMs);
        if (state.openedAt !== null && now - state.openedAt >= resetMs) {
            return "half-open";
        }
        const g = chargeValueFromBits(state.failures.length < threshold, state.failures.length >= threshold);
        // Store the state transition event
        witness(store, { subject: key, predicate: "circuit", object: g }, [true, false]);
        if (g === "potential")
            return "closed";
        if (g === "active") {
            if (state.openedAt === null) {
                state.openedAt = now;
                opts.onOpen?.(key);
            }
            return "open";
        }
        return "half-open"; // stable
    }
    return async (ctx) => {
        const key = keyFor(ctx);
        const state = getState(key);
        const circuitState = settle(key);
        if (circuitState === "open") {
            ctx.res.setHeader("Retry-After", Math.ceil(resetMs / 1000));
            ctx.res.writeHead(statusCode).end(message);
            return true;
        }
        if (circuitState === "half-open") {
            opts.onHalfOpen?.(key);
            // Allow the probe through; track outcome by wrapping res.end
            const origEnd = ctx.res.end.bind(ctx.res);
            ctx.res.end = function (...args) {
                const sc = ctx.res.statusCode;
                if (sc >= 200 && sc < 500) {
                    state.successesInHalfOpen++;
                    if (state.successesInHalfOpen >= halfOpenRequests) {
                        // Re-close
                        state.openedAt = null;
                        state.failures = [];
                        state.successesInHalfOpen = 0;
                        opts.onClose?.(key);
                    }
                }
                else {
                    // Probe failed — re-open
                    state.failures.push(Date.now()); // law-allow: wall-clock-as-data — breaker cooldown/rolling-window bookkeeping, not evidence ordering
                    state.openedAt = Date.now(); // law-allow: wall-clock-as-data — breaker cooldown/rolling-window bookkeeping, not evidence ordering
                }
                return origEnd(...args);
            };
            return;
        }
        // Closed: track failures via wrapped res.end
        const origEnd = ctx.res.end.bind(ctx.res);
        ctx.res.end = function (...args) {
            const sc = ctx.res.statusCode;
            if (sc >= 500)
                state.failures.push(Date.now()); // law-allow: wall-clock-as-data — breaker cooldown/rolling-window bookkeeping, not evidence ordering
            return origEnd(...args);
        };
    };
}
export function circuitBreaker(optsOrInner = {}, maybeOpts = {}) {
    if (typeof optsOrInner === "function")
        return wrappedCircuitBreaker(optsOrInner, maybeOpts);
    return stateTrackingCircuitBreaker(optsOrInner);
}
//# sourceMappingURL=circuit.mjs.map