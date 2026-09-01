import type { Middleware, Repr } from "../types.mjs";
import type { StaticOptions } from "../static.mjs";
export type TryFilesOptions = {
    root: string;
    /** Candidates in order. Supports $uri (full path), $1…$n (regex captures), literal paths. */
    files?: string[];
    /** Alias for archive-style callers. */
    paths?: string[];
    /** If all candidates miss: "next" (fall through), "404" (return 404), a fixed path, or a representation. */
    fallback?: "next" | "404" | string | Repr;
    /** Static file serving options (for serving matched files). */
    staticOpts?: Omit<StaticOptions, "root">;
};
export declare function tryFiles(opts: TryFilesOptions): Middleware;
//# sourceMappingURL=tryfiles.d.mts.map