import { type Coding } from "@emsenn/computing-with-http/codecs/negotiation";
import { type CacheControl } from "@emsenn/computing-with-http/codecs/http";
import type { Handler, SecurityHeaders } from "./types.mjs";
export declare const DEFAULT_TYPES: Readonly<Record<string, string>>;
export type StaticOptions = {
    root: string;
    index?: string[];
    maxBuffer?: number;
    etag?: boolean;
    lastModified?: boolean;
    dotFiles?: "deny" | "ignore" | "allow";
    extensions?: string[];
    precompressed?: boolean | readonly Coding[];
    cacheControl?: CacheControl | string;
    security?: SecurityHeaders | true;
};
export declare function staticFiles(opts: StaticOptions): Handler;
//# sourceMappingURL=static.d.mts.map