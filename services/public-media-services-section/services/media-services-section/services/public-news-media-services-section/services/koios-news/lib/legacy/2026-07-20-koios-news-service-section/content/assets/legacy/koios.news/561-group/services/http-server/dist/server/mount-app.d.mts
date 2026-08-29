import type { App } from "./types.mjs";
/** Mount `app` under `prefix` as an App, ready to mergeApps into a host app.
 *  Resources answer under `<prefix>/…` with the prefix stripped before the
 *  inner app runs; app-level middlewares become prefix-scoped. */
export declare function mountAt(prefix: string, app: App): App;
//# sourceMappingURL=mount-app.d.mts.map