import type { Middleware, Context } from "../types.mjs";
export type RewriteRule = {
    /** Incoming path pattern. String = exact or :param, RegExp = captures. */
    from: string | RegExp;
    /** Target path. Can reference captures: "$0", "$1", "$uri" for RegExp; ":param" for string patterns. */
    to: string | ((path: string, match: RegExpExecArray | Record<string, string>) => string);
    /** If true, send an HTTP redirect instead of rewriting internally (default false). */
    redirect?: boolean | 301 | 302 | 307 | 308;
    /** Redirect status code (301/302/307/308, default 301). */
    status?: 301 | 302 | 307 | 308;
    /** Only apply if query string matches this pattern. */
    queryMatch?: RegExp | ((search: string) => boolean);
    /** Only apply for these methods (default: all). */
    methods?: string[];
};
export declare function rewrite(rules: RewriteRule[]): Middleware;
/** Convenience: redirect all HTTP → HTTPS. */
export declare function httpsRedirect(statusCode?: 301 | 302): Middleware;
/** Enforce HTTPS, honoring X-Forwarded-Proto for TLS-terminating proxies. */
export declare function forceHttps({ status, hsts, }?: {
    status?: 301 | 302 | 307 | 308;
    hsts?: true | string;
}): Middleware;
/**
 * redirect(location, status=308) — build a representation that sends a Location redirect.
 * 308/307 preserve the method+body; 301/302 are the classic GET redirects.
 */
export declare function redirect(location: string, status?: number): {
    status: number;
    type: string;
    body: string;
    headers: {
        location: string;
    };
};
/**
 * location(matcher, mw) — scope a middleware (or array of middlewares) to a subset of paths,
 * the way nginx `location` scopes its directives. Returns a middleware that runs the inner
 * middleware(s) ONLY when `ctx.url.pathname` matches `matcher`, falling through otherwise.
 *
 *   • string  → path prefix ("/api" matches "/api", "/api/", "/api/x")
 *   • RegExp  → tested against the pathname
 *   • function (path, ctx) => boolean
 */
export declare function location(matcher: string | RegExp | ((path: string, ctx: Context) => boolean), mw: Middleware | Middleware[]): Middleware;
/** Convenience: strip trailing slashes (redirect to canonical URL). */
export declare function trailingSlash(mode?: "remove" | "add"): Middleware;
//# sourceMappingURL=rewrite.d.mts.map