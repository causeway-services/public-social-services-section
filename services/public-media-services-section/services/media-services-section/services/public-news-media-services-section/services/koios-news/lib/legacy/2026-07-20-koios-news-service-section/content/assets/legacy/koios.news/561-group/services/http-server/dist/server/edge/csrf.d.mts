import type { Middleware, Context } from "../types.mjs";
import type { CookieOptions } from "@emsenn/computing-with-http/codecs/cookie";
export type CsrfOptions = Readonly<{
    secret: string;
    cookieName?: string;
    headerName?: string;
    methods?: readonly string[];
    tokenBytes?: number;
    cookie?: CookieOptions;
    localsKey?: string;
    tokenFrom?: (ctx: Context) => string | null | undefined;
    onDeny?: (ctx: Context, reason: string) => void | Promise<void>;
}>;
export declare function csrfProtection(options: CsrfOptions): Middleware;
export { csrfProtection as csrf };
//# sourceMappingURL=csrf.d.mts.map