import type { App } from "./types.mjs";
export type ScriptFn = (params: Record<string, string>) => Promise<unknown>;
export type ScriptMap = Record<string, ScriptFn>;
/** Wrap a named map of async functions as a minimal JSON App.
 *  Each entry in `scripts` becomes GET /<key> → application/json.
 *  A GET /health endpoint is always included, listing the script names. */
export declare function serveScripts(scripts: ScriptMap): App;
//# sourceMappingURL=serve-scripts.d.mts.map