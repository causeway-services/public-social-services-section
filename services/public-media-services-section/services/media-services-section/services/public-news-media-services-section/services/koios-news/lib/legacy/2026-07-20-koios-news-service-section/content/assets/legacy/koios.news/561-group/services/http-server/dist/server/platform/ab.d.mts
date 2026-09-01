import type { Middleware, Context } from "../types.mjs";
export type Bucket<N extends string = string> = {
    name: N;
    weight: number;
};
export type AbExperiment<N extends string = string> = {
    id: string;
    buckets: Bucket<N>[];
    /** Extract a stable user identifier. Default: client IP. */
    userId?: (ctx: Context) => string;
    /** Cookie name for sticky assignment (default: "ab_" + id). */
    cookieName?: string;
    /** HMAC secret to sign/verify cookie assignments. If omitted, no signing (dev only). */
    secret?: string;
    /** Cookie max-age in seconds (default 86400). */
    maxAge?: number;
    /** Put bucket name on ctx.locals under this key (default: id). */
    localsKey?: string;
};
export declare function abTest<N extends string>(experiment: AbExperiment<N>): Middleware;
/** Read the bucket assigned to an experiment from ctx.locals. */
export declare function getBucket<N extends string>(ctx: Context, experimentId: string): N | undefined;
//# sourceMappingURL=ab.d.mts.map