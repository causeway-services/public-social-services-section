import type { Middleware, Context } from "../types.mjs";
export type IpFilterOptions = {
    /** CIDR ranges to explicitly allow. If set, all others are denied unless in deny list. */
    allow?: string[];
    /** CIDR ranges to deny. Applied after allow. */
    deny?: string[];
    /** Trust X-Forwarded-For header (default true). */
    trustProxy?: boolean;
    onDeny?: (ctx: Context, ip: string) => void | Promise<void>;
    statusCode?: number;
    message?: string;
};
export declare function ipFilter(opts: IpFilterOptions): Middleware;
/** Allow only requests from localhost (127.x, ::1). */
export declare function localhostOnly(): Middleware;
/** Deny requests from a list of known bad CIDRs. */
export declare function denyList(cidrs: string[]): Middleware;
//# sourceMappingURL=ipfilter.d.mts.map