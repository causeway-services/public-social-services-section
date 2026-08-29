import { type Coding } from "@emsenn/computing-with-http/codecs/negotiation";
import type { Readable } from "node:stream";
export type WebResponseCompressionOptions = {
    method?: string;
    acceptEncoding?: string | string[];
    range?: string | string[];
    codings?: readonly Coding[];
};
export type WebResponseCompressionPlan = {
    kind: "compress";
    coding: Exclude<Coding, "identity">;
} | {
    kind: "identity";
} | {
    kind: "not-acceptable";
};
export declare function bodyForbidden(status: number): boolean;
export declare function planWebResponseCompression(status: number, headers: Record<string, string>, options?: WebResponseCompressionOptions): WebResponseCompressionPlan;
export declare function pipeCompressed(source: Readable, plan: WebResponseCompressionPlan): Readable;
export declare function writeContentCodingNotAcceptable(headers: Record<string, string>): void;
//# sourceMappingURL=web-response-compression.d.mts.map