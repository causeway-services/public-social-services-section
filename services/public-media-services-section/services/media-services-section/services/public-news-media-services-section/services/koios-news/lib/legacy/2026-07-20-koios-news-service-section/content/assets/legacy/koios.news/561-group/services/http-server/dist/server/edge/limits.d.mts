import type { Middleware } from "../types.mjs";
type Context = Parameters<Middleware>[0];
export type RateLimitHeaderMode = "legacy" | "standard" | "both";
export type RateLimitHit = {
    totalHits: number;
    resetTime: Date;
};
export type RateLimitStore = {
    increment(key: string, windowMs: number, now: number): RateLimitHit | Promise<RateLimitHit>;
    decrement?(key: string): void | Promise<void>;
    resetKey?(key: string): void | Promise<void>;
};
export type RateLimitOptions = {
    windowMs?: number;
    maxRequests?: number;
    /** Alias for archive-style callers. */
    max?: number;
    keyBy?: (ctx: Context) => string;
    /** Alias for archive-style callers; receives the Node request and context. */
    key?: (req: Context["req"], ctx: Context) => string;
    statusCode?: number;
    message?: string;
    headers?: boolean | RateLimitHeaderMode;
    /** Express-rate-limit compatible switch for X-RateLimit-* headers. */
    legacyHeaders?: boolean;
    /** Emit RFC 9333 RateLimit-* fields. */
    standardHeaders?: boolean;
    /** Refund the hit after successful responses. */
    skipSuccessfulRequests?: boolean;
    /** Refund the hit after failed responses. */
    skipFailedRequests?: boolean;
    requestWasSuccessful?: (ctx: Context) => boolean;
    skip?: (ctx: Context) => boolean | Promise<boolean>;
    now?: () => number;
    store?: RateLimitStore;
    policyName?: string;
};
export type BodyLimitOptions = {
    maxBytes?: number;
    message?: string;
    statusCode?: number;
    headers?: Record<string, string>;
};
export type ConcurrencyLimitOptions = {
    max: number;
    keyBy?: (ctx: Context) => string;
    key?: (req: Context["req"], ctx: Context) => string;
    statusCode?: number;
    message?: string;
};
export type TimeoutOptions = {
    requestMs?: number;
    idleMs?: number;
    headersMs?: number;
};
export type RequestTimeoutOptions = {
    ms: number;
    message?: string;
    statusCode?: number;
    headers?: Record<string, string>;
    destroy?: boolean;
    onTimeout?: (ctx: Context) => void;
};
export declare function memoryRateLimitStore(): RateLimitStore & {
    readonly size: number;
};
export declare function rateLimit(opts?: RateLimitOptions): Middleware;
export declare function bodyLimit(opts?: BodyLimitOptions): Middleware;
export declare function concurrencyLimit(opts: ConcurrencyLimitOptions): Middleware;
export declare function requestTimeout(ms: number, message?: string): Middleware;
export declare function requestTimeout(options: RequestTimeoutOptions): Middleware;
export declare function timeouts(opts?: TimeoutOptions): <T extends {
    headersTimeout?: number;
    requestTimeout?: number;
    keepAliveTimeout?: number;
} | null | undefined>(server: T) => T;
export {};
//# sourceMappingURL=limits.d.mts.map