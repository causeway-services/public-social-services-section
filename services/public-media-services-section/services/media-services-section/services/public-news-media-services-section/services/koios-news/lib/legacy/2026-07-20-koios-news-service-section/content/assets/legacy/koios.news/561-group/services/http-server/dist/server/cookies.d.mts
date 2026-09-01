import { type CookieOptions } from "@emsenn/computing-with-http/codecs/cookie";
import type { IncomingMessage, ServerResponse } from "node:http";
export type DeleteCookieOptions = Omit<CookieOptions, "expires" | "maxAge">;
export declare function getCookie(req: IncomingMessage, name: string): string | null;
export declare function setCookie(res: ServerResponse, name: string, value: string, options?: CookieOptions): string;
export declare function appendSetCookie(res: ServerResponse, cookie: string): void;
export declare function deleteCookie(res: ServerResponse, name: string, options?: DeleteCookieOptions): string;
export declare function setSignedCookie(res: ServerResponse, name: string, value: string, secret: string, options?: CookieOptions): string;
export declare function getSignedCookie(req: IncomingMessage, name: string, secret: string): string | null;
//# sourceMappingURL=cookies.d.mts.map