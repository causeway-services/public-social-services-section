import type { IncomingMessage, ServerResponse } from "node:http";
import { type WebResponseCompressionOptions } from "./web-response-compression.mjs";
export declare function toWebRequest(req: IncomingMessage, base?: string): Request;
export type SendWebResponseOptions = {
    method?: string;
} & WebResponseCompressionOptions;
export declare function sendWebResponse(res: ServerResponse, response: Response, options?: SendWebResponseOptions): Promise<void>;
//# sourceMappingURL=web-bridge.d.mts.map