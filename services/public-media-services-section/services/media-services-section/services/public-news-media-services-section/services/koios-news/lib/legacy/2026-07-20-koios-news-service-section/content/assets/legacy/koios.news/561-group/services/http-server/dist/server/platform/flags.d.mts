import type { Middleware, Context } from "../types.mjs";
export type FlagContext = {
    key: string;
    userId?: string;
    attrs?: Record<string, unknown>;
};
export type FlagValue = unknown;
export type FlagEvaluator = (ctx: FlagContext) => boolean | Promise<boolean>;
export type FlagSource = FlagValue | ((ctx: Context) => FlagValue | Promise<FlagValue>);
export type FlagMapEvaluator = (ctx: Context, base: Record<string, FlagValue>) => Record<string, FlagValue> | Promise<Record<string, FlagValue>>;
export type FeatureFlagsOptions = {
    evaluate?: FlagEvaluator | FlagMapEvaluator;
    /** Flags to resolve per request. */
    flags?: string[] | Record<string, FlagSource>;
    /** Put resolved flags on ctx.locals under this key (default "flags"). */
    localsKey?: string;
    /** User ID extractor for targeting (default: IP). */
    userId?: (ctx: Context) => string;
    /** TTL for flag evaluations in ms (default 30_000). Skip if 0. */
    cacheTtlMs?: number;
    /** Fail-closed: disabled if evaluator throws (default true). */
    failClosed?: boolean;
};
export declare function featureFlags(opts: FeatureFlagsOptions): Middleware;
/** Read a flag from ctx.locals. */
export declare function getFlag<T = boolean>(ctx: Context, flag: string, localsKey?: string, fallback?: T): T;
/** Build an evaluator from a static Record<flag, boolean>. */
export declare function staticFlags(flags: Record<string, boolean>): FlagEvaluator;
/** Build an evaluator that fetches from a remote JSON endpoint. */
export declare function remoteFlagsEvaluator(url: string, ttlMs?: number): FlagEvaluator;
//# sourceMappingURL=flags.d.mts.map