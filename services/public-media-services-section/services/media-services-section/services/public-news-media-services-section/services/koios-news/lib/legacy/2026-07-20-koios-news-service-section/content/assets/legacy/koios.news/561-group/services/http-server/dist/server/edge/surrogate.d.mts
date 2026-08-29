import { UtteranceLog } from "../internal/witness.mjs";
import type { IncomingMessage } from "node:http";
import type { Middleware } from "../types.mjs";
type HeaderValue = number | string | string[] | undefined;
export type SurrogateOptions = {
    /** Strip Surrogate-Control/Surrogate-Key/Cache-Tag before forwarding to clients (default true). */
    strip?: boolean;
    /** Resolve CDN-specific max-age from Surrogate-Control (default true). */
    resolveTtl?: boolean;
    onPurge?: (keys: string[]) => void;
};
export type SurrogateCacheOptions = SurrogateOptions & {
    maxEntries?: number;
    defaultTtlMs?: number;
    keyBy?: (req: IncomingMessage) => string;
    varyHeaders?: readonly string[];
};
export type SurrogateStats = {
    entries: number;
    tags: number;
    tagged: number;
    hits: number;
    misses: number;
    purgedTags: number;
    purgedEntries: number;
    surrogateTtlSet: number;
};
export type SurrogateManager = {
    /** Middleware to attach to the App. */
    middleware: Middleware;
    /** Purge all cached/recorded responses tagged with any of these surrogate keys. */
    purge(keys: string[]): string[];
    /** Tag the current response with surrogate keys (call from handler). */
    tag(ctx: Parameters<Middleware>[0], keys: string[]): void;
};
export type SurrogateCacheManager = SurrogateManager & {
    purgeTag(key: string): number;
    purgeAll(): number;
    stats(): SurrogateStats;
};
export type SurrogateControl = {
    maxAge: number | null;
    noStore: boolean;
    staleWhileRevalidate: number | null;
};
export declare function parseTags(value: HeaderValue): string[];
export declare function parseSurrogateControl(value: HeaderValue): SurrogateControl;
export declare function surrogateCache(opts?: SurrogateCacheOptions): SurrogateCacheManager;
export declare function surrogateControl(opts?: SurrogateOptions): SurrogateManager;
/** Check if a response ID has been surrogate-purged. Package-internal boolean
 * convenience (A1: off the root export surface), not an exported judgment. */
declare function isSurrogatePurged(store: UtteranceLog, responseId: string): boolean;
export { isSurrogatePurged };
//# sourceMappingURL=surrogate.d.mts.map