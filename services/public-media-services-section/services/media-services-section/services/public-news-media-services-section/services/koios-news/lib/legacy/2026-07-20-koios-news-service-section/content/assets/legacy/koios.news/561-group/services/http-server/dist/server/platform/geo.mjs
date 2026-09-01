// platform/geo.ts — Geographic routing and IP geolocation.
//
// GeoIP resolution uses a UtteranceLog as a lookup cache. Geolocation data sources are pluggable
// via a `resolver` callback (maxmind, ip-api, etc.).
//
// GeoRoute selects resources based on client country/region by folding allow/deny evidence.
import { cellValues, witness, UtteranceLog, recallWhere } from "../internal/witness.mjs";
import { chargeValueFromBits } from "../admission.mjs";
import { clientIp as requestClientIp } from "../internal/net.mjs";
export function clientIp(req, trustProxy = false) {
    return requestClientIp(req, { trustProxy });
}
export function geoLookup(opts) {
    const store = new UtteranceLog();
    const ttlMs = opts.ttlMs ?? 3_600_000;
    const localsKey = opts.localsKey ?? "geo";
    const trustProxy = opts.trustProxy ?? false;
    const expiries = new Map();
    return async (ctx) => {
        const ip = clientIp(ctx.req, trustProxy);
        const subject = `geo:${ip}`;
        // Check cache
        const cached = recallWhere(store, { subject: subject, predicate: "geo" });
        const expiresAt = expiries.get(subject);
        if (cached.length > 0 && expiresAt && Date.now() < expiresAt) { // law-allow: wall-clock-as-data — geo cache TTL/freshness bookkeeping (eviction timing), not event ordering
            const raw = String(cellValues(cached[cached.length - 1])?.object);
            try {
                const record = JSON.parse(raw);
                ctx.locals[localsKey] = record;
                if (opts.headerPrefix)
                    injectHeaders(ctx, record, opts.headerPrefix);
                return;
            }
            catch { /* fall through to fresh lookup */ }
        }
        try {
            const record = await opts.resolver(ip);
            if (record) {
                witness(store, { subject, predicate: "geo", object: JSON.stringify(record) }, [true, false]);
                expiries.set(subject, Date.now() + ttlMs); // law-allow: wall-clock-as-data — cache TTL/freshness bookkeeping (eviction timing), not event ordering
                ctx.locals[localsKey] = record;
                if (opts.headerPrefix)
                    injectHeaders(ctx, record, opts.headerPrefix);
            }
        }
        catch { /* resolver failure is non-fatal */ }
    };
}
function injectHeaders(ctx, record, prefix) {
    if (record.country)
        ctx.res.setHeader(`${prefix}Country`, record.country);
    if (record.region)
        ctx.res.setHeader(`${prefix}Region`, record.region);
    if (record.city)
        ctx.res.setHeader(`${prefix}City`, record.city);
}
/** Middleware: block or allow requests based on resolved country. */
export function geoBlock(opts) {
    const localsKey = opts.localsKey ?? "geo";
    return async (ctx) => {
        const record = ctx.locals[localsKey];
        const country = record?.country ?? "";
        const allowedByAllow = opts.allow ? opts.allow.includes(country) : true;
        const deniedByAllow = opts.allow ? !opts.allow.includes(country) : false;
        const deniedByDeny = opts.deny?.includes(country) ?? false;
        const memeCharge = chargeValueFromBits(allowedByAllow && !deniedByDeny, deniedByAllow || deniedByDeny);
        if (memeCharge === "potential")
            return;
        await opts.onDeny?.(ctx, country);
        ctx.res.writeHead(403).end("Forbidden");
        return true;
    };
}
/** Middleware: add latency-based routing headers for CDN geo-steering. */
export function geoHeaders(prefix = "X-Geo-") {
    return (ctx) => {
        const ip = clientIp(ctx.req);
        ctx.res.setHeader(`${prefix}Client-IP`, ip);
        return Promise.resolve(undefined);
    };
}
/**
 * routeByGeo(map, opts) — middleware that branches on the visitor's geo.
 * Keys in `map` are geo field values (e.g. "US", "DE"); `*` is the fallback.
 * Values are either a target URL string (redirect/rewrite) or a nested Middleware.
 */
export function routeByGeo(map, opts = {}) {
    const { field = "country", redirect: doRedirect = true, status = 302, localsKey = "geo" } = opts;
    return async (ctx) => {
        const record = ctx.locals[localsKey];
        const value = record?.[field];
        const target = (value != null && String(value) in map) ? map[String(value)] : map["*"];
        if (target == null)
            return;
        if (typeof target === "function")
            return target(ctx);
        const location = String(target);
        if (doRedirect) {
            let resolved = location;
            try {
                resolved = new URL(location, ctx.url.href).toString();
            }
            catch { /* use raw */ }
            ctx.res.setHeader("Location", resolved);
            ctx.res.writeHead(status).end(`Redirecting to ${resolved}`);
            return true;
        }
        // Internal rewrite
        try {
            const next = new URL(location, ctx.url.href);
            ctx.url = next;
            ctx.req.url = next.pathname + next.search;
        }
        catch { /* leave url unchanged */ }
        return;
    };
}
/**
 * rewriteBy(select, opts) — general personalization router: `select(ctx)` returns a target
 * string (redirect/rewrite) or Middleware, or null to fall through.
 */
export function rewriteBy(select, opts = {}) {
    if (typeof select !== "function")
        throw new TypeError("rewriteBy: `select` must be a function");
    const { redirect: doRedirect = true, status = 302 } = opts;
    return async (ctx) => {
        const target = await select(ctx);
        if (target == null)
            return;
        if (typeof target === "function")
            return target(ctx);
        const location = String(target);
        if (doRedirect) {
            let resolved = location;
            try {
                resolved = new URL(location, ctx.url.href).toString();
            }
            catch { /* use raw */ }
            ctx.res.setHeader("Location", resolved);
            ctx.res.writeHead(status).end(`Redirecting to ${resolved}`);
            return true;
        }
        try {
            const next = new URL(location, ctx.url.href);
            ctx.url = next;
            ctx.req.url = next.pathname + next.search;
        }
        catch { /* leave url unchanged */ }
        return;
    };
}
//# sourceMappingURL=geo.mjs.map