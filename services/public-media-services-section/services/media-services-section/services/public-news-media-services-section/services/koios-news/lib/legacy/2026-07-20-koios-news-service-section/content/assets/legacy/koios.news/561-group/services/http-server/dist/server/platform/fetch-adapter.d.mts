import type { IncomingMessage, ServerResponse } from "node:http";
import type { App, Context, Middleware } from "../types.mjs";
import { type WebResponseCompressionOptions } from "../internal/web-response-compression.mjs";
export type WebFetchHandler = (request: Request) => Promise<Response>;
export type FetchHandler = (request: Request, ctx: Context) => Response | null | undefined | Promise<Response | null | undefined>;
export type FromFetchOptions = {
    passThrough?: boolean;
    onError?: (error: unknown, req: IncomingMessage) => void;
};
export type FetchMiddleware = {
    (ctx: Context): Promise<boolean>;
    (req: IncomingMessage, res: ServerResponse, ctx: Context): Promise<boolean>;
};
export declare function toWebRequest(req: IncomingMessage, ctx?: Partial<Context> & {
    base?: string;
}): Request;
type SendOptions = {
    method?: string;
} & WebResponseCompressionOptions;
export declare function sendWebResponse(res: ServerResponse, response: Response, options?: SendOptions): Promise<void>;
export declare function sendWebResponse(response: Response, res: ServerResponse, options?: SendOptions): Promise<void>;
export declare function fromFetch(app: App): WebFetchHandler;
export declare function fromFetch(fetchHandler: FetchHandler, options?: FromFetchOptions): Middleware & FetchMiddleware;
export {};
//# sourceMappingURL=fetch-adapter.d.mts.map