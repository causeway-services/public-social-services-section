import type { Context, Middleware } from "../types.mjs";
export type AccessLogFormat = "combined" | "common" | "short";
export type AccessLogOptions = {
    /** Write a completed log line. Default: process.stdout.write. */
    write?: (line: string) => void;
    /** Format: "combined" (default) | "common" | "short" | custom function. */
    format?: AccessLogFormat | ((ctx: Context, ms: number, status: number) => string);
    /** Skip logging for these status codes. */
    skip?: (ctx: Context, status: number) => boolean;
};
export type AccessLogInfo = Context | {
    req: Context["req"];
    res: Context["res"];
    ctx?: Context;
    status?: number;
    ms?: number;
};
export declare function commonLogDate(date?: Date): string;
export declare function formatAccessLog(info: AccessLogInfo, options?: AccessLogOptions): string;
export declare function accessLog(write?: (line: string) => void, options?: AccessLogOptions): (info: AccessLogInfo) => void;
export declare function accessLog(options?: AccessLogOptions): Middleware;
//# sourceMappingURL=access-log.d.mts.map