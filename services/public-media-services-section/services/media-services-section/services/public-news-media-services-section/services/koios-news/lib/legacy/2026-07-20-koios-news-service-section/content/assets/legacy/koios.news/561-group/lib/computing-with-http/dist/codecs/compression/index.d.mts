import { type Transform } from "node:stream";
import type { Coding } from "../negotiation/index.mjs";
type CompressionCoding = Exclude<Coding, "identity">;
export declare function zstdSupported(): boolean;
export declare function supportedCompressionCodings(): readonly CompressionCoding[];
export declare function compress(body: Buffer, coding: Coding): Promise<Buffer>;
export declare function decompress(body: Buffer, coding: Coding | "identity"): Promise<Buffer>;
export declare function compressStream(coding: Coding | "identity"): Transform;
export declare function decompressStream(coding: Coding | "identity"): Transform;
export declare const CODINGS: readonly string[];
export {};
//# sourceMappingURL=index.d.mts.map