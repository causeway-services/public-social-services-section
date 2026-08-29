import type { IncomingMessage } from "node:http";
import type { Middleware } from "../types.mjs";
export type CacheOptions = {
    maxEntries?: number;
    /** Alias for maxEntries, for archive-style callers. */
    max?: number;
    defaultTtlMs?: number;
    /** Alias in seconds, for archive-style callers. */
    defaultTtl?: number;
    keyBy?: (req: IncomingMessage) => string;
    invalidateBy?: (req: IncomingMessage) => string | readonly string[];
    invalidateOnUnsafeMethods?: boolean;
    varyHeaders?: readonly string[];
};
type CacheEntry = {
    baseKey: string;
    varyHeaders: readonly string[];
    varyKey: string;
    status: number;
    headers: Record<string, string | string[]>;
    body: Buffer;
    expiresAt: number;
    staleWhileRevalidateUntil: number;
    staleIfErrorUntil: number;
    storedAt: number;
};
export type CacheStats = {
    entries: number;
    maxEntries: number;
    hits: number;
    misses: number;
    bypasses: number;
    stores: number;
    evictions: number;
    purges: number;
    invalidations: number;
    hitRatio: number;
};
export type CacheMiddleware = Middleware & {
    purge(predicate?: (info: {
        key: string;
        entry: CacheEntry;
    }) => boolean): number;
    stats(): CacheStats;
};
export declare function responseCache(opts?: CacheOptions): CacheMiddleware;
export {};
//# sourceMappingURL=cache.d.mts.map