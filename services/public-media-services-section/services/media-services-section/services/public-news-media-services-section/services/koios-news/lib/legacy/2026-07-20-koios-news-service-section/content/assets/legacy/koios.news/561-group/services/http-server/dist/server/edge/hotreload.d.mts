import type { App, Middleware } from "../types.mjs";
export type HotReloadOptions = {
    /** Path to a JSON manifest with at minimum { "module": "./path/to/app.mjs" }. */
    manifestPath: string;
    /** Called after a successful reload with the new App. */
    onReload?: (app: App, version: number) => void;
    /** Called if a reload fails. Default: log to stderr. */
    onError?: (err: unknown, version: number) => void;
    /** Watch the manifest file for changes (default true). */
    watch?: boolean;
    /** Also reload on SIGHUP (default true). */
    sighup?: boolean;
};
export type Manifest = {
    module: string;
    [key: string]: unknown;
};
export type ReloadableApp = {
    /** Current live App. */
    current(): App;
    /** Middleware that always forwards to the current App's handler. */
    middleware: Middleware;
    /** Trigger a reload now. */
    reload(): Promise<void>;
    /** Stop watching. */
    stop(): void;
};
export declare function hotReload(opts: HotReloadOptions): ReloadableApp;
//# sourceMappingURL=hotreload.d.mts.map