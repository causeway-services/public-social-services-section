import type { CorsOptions, Middleware } from "../types.mjs";
export type CorsMiddlewareOptions = CorsOptions & {
    preflight?: boolean;
    optionsSuccessStatus?: number;
};
export declare function cors(options?: CorsMiddlewareOptions): Middleware;
//# sourceMappingURL=cors.d.mts.map