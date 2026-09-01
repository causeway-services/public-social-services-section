import type { App, Middleware } from "../types.mjs";
export type VhostEntry = {
    /** Exact hostname, glob pattern ("*.example.com"), or RegExp. */
    host: string | RegExp;
    app: App;
};
export declare function vhost(entries: VhostEntry[]): Middleware;
/** Build a single App that routes by Host header across multiple sub-Apps. */
export declare function mergeByHost(entries: VhostEntry[]): App;
/** Map-style virtual-host router for Host-header dispatch. */
export declare function vhosts(map: Record<string, App>, { fallback }?: {
    fallback?: App;
}): App;
//# sourceMappingURL=vhost.d.mts.map