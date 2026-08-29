import type { IncomingMessage } from "node:http";
import type { Resource, Context } from "../types.mjs";
type RouteContext = Partial<Context> & {
    params?: Record<string, string>;
    path?: string;
};
export type FsRouterOptions = {
    dir: string;
    extensions?: string[];
    lazy?: boolean;
};
export type FsRouterResult = {
    resources: FileSystemResource[];
    routes: {
        pattern: string;
        file: string;
    }[];
};
export type FileSystemResource = Resource & {
    pattern: string;
    file: string;
    match: (path: string, ctx?: RouteContext) => Record<string, string> | null;
    handle: (req: IncomingMessage, ctx: RouteContext) => Promise<unknown>;
};
/**
 * fileSystemRouter(opts) — scan `dir` and return Resources ordered most-specific-first.
 * Route modules may default-export a handler or export method-named handlers (GET, POST, …).
 * Lazy-loads modules on first match (when `lazy: true`, the default).
 */
export declare function fileSystemRouter(opts: FsRouterOptions): Promise<FsRouterResult>;
export {};
//# sourceMappingURL=fs-router.d.mts.map