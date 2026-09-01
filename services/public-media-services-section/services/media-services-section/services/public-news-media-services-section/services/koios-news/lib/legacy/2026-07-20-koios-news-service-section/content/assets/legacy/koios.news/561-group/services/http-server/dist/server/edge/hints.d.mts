import type { Middleware } from "../types.mjs";
export type HintEntry = {
    url?: string;
    href?: string;
    rel: "preload" | "prefetch" | "preconnect" | "dns-prefetch" | "modulepreload" | "prerender" | (string & {});
    as?: "script" | "style" | "image" | "font" | "fetch" | "document" | "worker";
    crossorigin?: true | "" | "anonymous" | "use-credentials";
    type?: string;
    [attribute: string]: unknown;
};
export type HintValue = HintEntry | string;
export type HintsOptions = {
    hints: readonly HintValue[] | ((ctx: Parameters<Middleware>[0]) => readonly HintValue[] | Promise<readonly HintValue[]>);
    /** Send 103 Early Hints response before the main response (default true). */
    earlyHints?: boolean;
    /** Also inject Link headers into the final response (default true). */
    linkHeader?: boolean;
    /** Send at most one 103 per response when several hint middlewares run (default true). */
    once?: boolean;
    /** Observe hint computation/framing errors without breaking the final response. */
    onError?: (error: unknown) => void;
};
export type EarlyHintsOptions = Omit<HintsOptions, "hints">;
export declare const REL_TOKENS: readonly string[];
export declare function buildLinkHeader(hints: readonly HintValue[] | undefined | null): string;
export declare function earlyHints(opts: HintsOptions): Middleware;
export declare function earlyHints(hints: HintsOptions["hints"], options?: EarlyHintsOptions): Middleware;
/** Simple preload shorthand for common asset types. */
export declare function preload(urls: string[], as?: HintEntry["as"]): Middleware;
//# sourceMappingURL=hints.d.mts.map