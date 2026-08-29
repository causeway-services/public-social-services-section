import type { App } from "./types.mjs";
/** Merge multiple apps into one, combining their resources, middlewares, hooks, and options. */
export declare function mergeApps(...apps: App[]): App;
/** Apply a sequence of plugins (functions App → App) left-to-right. */
export declare function compose(app: App, ...plugins: Array<(app: App) => App>): App;
//# sourceMappingURL=compose.d.mts.map