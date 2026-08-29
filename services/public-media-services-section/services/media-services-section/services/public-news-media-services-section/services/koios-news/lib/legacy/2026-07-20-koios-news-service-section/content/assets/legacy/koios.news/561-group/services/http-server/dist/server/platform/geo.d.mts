import type { Middleware, Context } from "../types.mjs";
import type { IncomingMessage } from "node:http";
export type GeoRecord = {
    ip: string;
    country?: string;
    region?: string;
    city?: string;
    lat?: number;
    lon?: number;
    asn?: string;
    org?: string;
};
export type GeoOptions = {
    resolver: (ip: string) => Promise<GeoRecord | null>;
    ttlMs?: number;
    headerPrefix?: string;
    localsKey?: string;
    /** Trust X-Forwarded-For/X-Real-IP. A number skips that many trusted hops from the right. */
    trustProxy?: boolean | number;
};
export declare function clientIp(req: IncomingMessage, trustProxy?: boolean | number): string;
export declare function geoLookup(opts: GeoOptions): Middleware;
export type GeoBlockOptions = {
    allow?: string[];
    deny?: string[];
    onDeny?: (ctx: Context, country: string) => void | Promise<void>;
    localsKey?: string;
};
/** Middleware: block or allow requests based on resolved country. */
export declare function geoBlock(opts: GeoBlockOptions): Middleware;
/** Middleware: add latency-based routing headers for CDN geo-steering. */
export declare function geoHeaders(prefix?: string): Middleware;
export type RouteByGeoOptions = {
    /** Which field of the geo record to match on (default "country"). */
    field?: keyof GeoRecord;
    /** If true (default), send an HTTP redirect; if false, rewrite the URL internally. */
    redirect?: boolean;
    /** Redirect status code (default 302). */
    status?: number;
    /** ctx.locals key for the geo record (default "geo"). */
    localsKey?: string;
};
/**
 * routeByGeo(map, opts) — middleware that branches on the visitor's geo.
 * Keys in `map` are geo field values (e.g. "US", "DE"); `*` is the fallback.
 * Values are either a target URL string (redirect/rewrite) or a nested Middleware.
 */
export declare function routeByGeo(map: Record<string, string | Middleware>, opts?: RouteByGeoOptions): Middleware;
export type RewriteByOptions = {
    redirect?: boolean;
    status?: number;
};
/**
 * rewriteBy(select, opts) — general personalization router: `select(ctx)` returns a target
 * string (redirect/rewrite) or Middleware, or null to fall through.
 */
export declare function rewriteBy(select: (ctx: Context) => string | Middleware | null | Promise<string | Middleware | null>, opts?: RewriteByOptions): Middleware;
//# sourceMappingURL=geo.d.mts.map