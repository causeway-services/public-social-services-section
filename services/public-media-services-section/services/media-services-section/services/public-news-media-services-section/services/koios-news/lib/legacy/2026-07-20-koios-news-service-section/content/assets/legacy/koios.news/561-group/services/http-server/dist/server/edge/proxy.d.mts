import * as http from "node:http";
import type { IncomingMessage, ServerResponse, OutgoingHttpHeaders } from "node:http";
import type { Middleware, Context } from "../types.mjs";
export type ProxyTarget = {
    url: string;
    weight?: number;
    healthy?: boolean;
};
export type ProxyRetryMethods = "all" | readonly string[];
export type ProxyOptions = {
    targets: ProxyTarget[];
    stripPrefix?: string;
    rewritePath?: (path: string, ctx: Context) => string;
    timeout?: number;
    retries?: number;
    retryMethods?: ProxyRetryMethods;
    onProxyReq?: (proxyReq: http.ClientRequest, req: IncomingMessage, res: ServerResponse) => void;
    onProxyRes?: (proxyRes: IncomingMessage, req: IncomingMessage, res: ServerResponse) => void;
    headers?: OutgoingHttpHeaders;
    preserveHost?: boolean;
    xForwardedFor?: boolean;
    balancer?: "round-robin" | "random" | "weighted-random";
};
export type ProxyPassOptions = {
    changeOrigin?: boolean;
    xfwd?: boolean;
    pathRewrite?: (path: string, ctx: Context) => string;
    timeout?: number;
    headers?: OutgoingHttpHeaders;
    onError?: (err: unknown, req: IncomingMessage, res: ServerResponse) => void;
};
export declare class ProxyUpstreamError extends Error {
    readonly statusCode: number;
    readonly code: string;
    constructor(message: string, statusCode?: number, code?: string);
}
export declare const DEFAULT_PROXY_TIMEOUT_MS = 30000;
export declare function abortProxyOnClientAbort(signal: AbortSignal, proxyReq: http.ClientRequest, reason?: string): void;
export declare function proxyTimeoutMs(timeout: number | undefined): number | undefined;
export declare function upstreamTimeoutError(): ProxyUpstreamError;
export declare function proxyFailureStatus(error: unknown): number;
export declare function writeProxyFailureResponse(res: ServerResponse, error: unknown): void;
export declare function proxy(opts: ProxyOptions): Middleware;
/** Expose a function that marks a target healthy/unhealthy at runtime. */
export declare function proxyHealthToggle(targets: ProxyTarget[], url: string, healthy: boolean): void;
/** nginx-style `proxy_pass` convenience middleware for a single upstream prefix. */
export declare function proxyPass(target: string, options?: ProxyPassOptions): Middleware;
//# sourceMappingURL=proxy.d.mts.map