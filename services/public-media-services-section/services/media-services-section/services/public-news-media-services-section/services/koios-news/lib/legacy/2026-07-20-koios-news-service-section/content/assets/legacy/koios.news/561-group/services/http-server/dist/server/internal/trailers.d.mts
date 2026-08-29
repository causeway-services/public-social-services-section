import type { ServerResponse } from "node:http";
import type { ResponseTrailers } from "../types.mjs";
export declare function applyTrailerHeader(headers: Record<string, string>, trailers: ResponseTrailers | undefined): boolean;
export declare function setTrailerHeader(res: ServerResponse, trailers: ResponseTrailers | undefined): boolean;
export declare function writeResponseTrailers(res: ServerResponse, trailers: ResponseTrailers | undefined): void;
export declare function immediateResponseTrailers(response: Response): ResponseTrailers | undefined;
export declare function resolveResponseTrailers(response: Response): Promise<ResponseTrailers | undefined>;
//# sourceMappingURL=trailers.d.mts.map