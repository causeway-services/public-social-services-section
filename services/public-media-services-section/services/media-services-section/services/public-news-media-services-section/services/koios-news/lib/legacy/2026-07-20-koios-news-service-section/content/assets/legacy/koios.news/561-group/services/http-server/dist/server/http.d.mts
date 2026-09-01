import type { IncomingMessage, ServerResponse } from "node:http";
import { strongEtag } from "./internal/hash.mjs";
import { type CacheControl } from "@emsenn/computing-with-http/codecs/http";
import type { Repr, CorsOptions, SecurityHeaders, ResponseTrailers } from "./types.mjs";
export { readBody, readFormBody, readJsonBody, readMultipartBody, readTextBody, type BodyParseOptions, type JsonBodyOptions, sse, type SseWriter, } from "@emsenn/computing-with-http/app";
export { strongEtag };
export declare function ensureDateHeader(res: ServerResponse, now?: Date | number): void;
export type CorsPreflightDecision = {
    ok: boolean;
    status: number;
    reason?: "origin" | "method" | "headers" | "private-network";
};
export declare function corsOriginAllowed(req: IncomingMessage, opts: CorsOptions): boolean;
export declare function corsPreflightDecision(req: IncomingMessage, opts: CorsOptions): CorsPreflightDecision;
export declare function applyCors(res: ServerResponse, req: IncomingMessage, opts: CorsOptions): void;
export declare function corsPreflight(req: IncomingMessage, res: ServerResponse, opts: CorsOptions, status?: number): void;
export declare function appendVary(res: ServerResponse, field: string): void;
export declare function applyCacheControl(res: ServerResponse, policy: CacheControl | string | undefined): void;
export declare function applySecurityHeaders(res: ServerResponse, policy: SecurityHeaders | true | undefined, nonce?: string): void;
export type ReprOptions = Readonly<{
    status?: number;
    headers?: Record<string, string>;
    trailers?: ResponseTrailers;
    cacheControl?: CacheControl | string;
    security?: SecurityHeaders | true;
    etag?: string;
    lastModified?: Date;
}>;
export type JsonReprOptions = ReprOptions & Readonly<{
    type?: string;
    pretty?: boolean | number;
    newline?: boolean;
}>;
export type TextReprOptions = ReprOptions & Readonly<{
    type?: string;
}>;
export declare function jsonRepr(body: unknown, options?: number | JsonReprOptions): Repr;
export declare function textRepr(body: string, options?: number | TextReprOptions): Repr;
export declare function htmlRepr(body: string, options?: number | TextReprOptions): Repr;
export declare function emptyRepr(status?: number, options?: ReprOptions): Repr;
export declare function send(req: IncomingMessage, res: ServerResponse, repr: Repr): Promise<void>;
//# sourceMappingURL=http.d.mts.map