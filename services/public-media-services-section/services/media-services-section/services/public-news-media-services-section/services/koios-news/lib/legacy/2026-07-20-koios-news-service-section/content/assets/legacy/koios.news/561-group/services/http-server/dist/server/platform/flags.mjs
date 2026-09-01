// platform/flags.ts — Feature flags with injected evaluator.
//
// Each flag decision is a Meme. Observed evaluator output folds to a MEMETICS
// charge value: potential enables, active disables.
//
// The evaluator is pluggable: pass a LaunchDarkly client, a local JSON file,
// a remote config service, or a simple Map.
import { witness, UtteranceLog } from "../internal/witness.mjs";
export function featureFlags(opts) {
    if (!opts.flags && typeof opts.evaluate !== "function") {
        throw new Error("featureFlags: provide `flags` and/or an `evaluate` function");
    }
    const store = new UtteranceLog();
    const localsKey = opts.localsKey ?? "flags";
    const cacheTtlMs = opts.cacheTtlMs ?? 30_000;
    const failClosed = opts.failClosed !== false;
    const cache = new Map();
    return async (ctx) => {
        const userId = opts.userId ? opts.userId(ctx) : (ctx.req.socket?.remoteAddress ?? "anon");
        const resolved = {};
        if (!Array.isArray(opts.flags)) {
            try {
                for (const [key, source] of Object.entries(opts.flags ?? {})) {
                    resolved[key] = typeof source === "function" ? await source(ctx) : source;
                }
                const full = typeof opts.evaluate === "function"
                    ? await opts.evaluate(ctx, resolved)
                    : resolved;
                ctx.locals[localsKey] = full ?? resolved;
            }
            catch {
                ctx.locals[localsKey] = {};
            }
            return;
        }
        if (typeof opts.evaluate !== "function") {
            throw new Error("featureFlags: array flags require an `evaluate` function");
        }
        for (const flag of opts.flags) {
            const cacheKey = `${flag}:${userId}`;
            const cached = cache.get(cacheKey);
            let value;
            if (cached && Date.now() < cached.expiresAt) { // law-allow: wall-clock-as-data — flag cache TTL/freshness bookkeeping (eviction timing), not event ordering
                value = cached.value;
            }
            else {
                try {
                    value = await opts.evaluate({ key: flag, userId, attrs: ctx.locals });
                    if (cacheTtlMs > 0)
                        cache.set(cacheKey, { value, expiresAt: Date.now() + cacheTtlMs }); // law-allow: wall-clock-as-data — cache TTL/freshness bookkeeping (eviction timing), not event ordering
                }
                catch {
                    value = !failClosed; // fail-closed = false on error
                }
            }
            const memeCharge = value ? "potential" : "active";
            const settled = memeCharge === "potential";
            witness(store, { subject: flag, predicate: "flag", object: userId }, settled ? [true, false] : [false, true]);
            resolved[flag] = settled;
        }
        ctx.locals[localsKey] = resolved;
    };
}
/** Read a flag from ctx.locals. */
export function getFlag(ctx, flag, localsKey = "flags", fallback) {
    const flags = ctx.locals[localsKey];
    return flags && flag in flags ? flags[flag] : (fallback ?? false);
}
/** Build an evaluator from a static Record<flag, boolean>. */
export function staticFlags(flags) {
    return (ctx) => flags[ctx.key] ?? false;
}
/** Build an evaluator that fetches from a remote JSON endpoint. */
export function remoteFlagsEvaluator(url, ttlMs = 60_000) {
    let cache = {};
    let lastFetch = 0;
    return async (ctx) => {
        if (Date.now() - lastFetch > ttlMs) { // law-allow: wall-clock-as-data — cache TTL/freshness bookkeeping (eviction timing), not event ordering
            try {
                const res = await fetch(url);
                cache = await res.json();
                lastFetch = Date.now(); // law-allow: wall-clock-as-data — cache TTL/freshness bookkeeping (eviction timing), not event ordering
            }
            catch { /* use stale */ }
        }
        return cache[ctx.key] ?? false;
    };
}
//# sourceMappingURL=flags.mjs.map