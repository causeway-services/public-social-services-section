import { type HeaderValue } from "./header-value.mjs";
export type ByteRange = {
    start: number;
    end: number;
};
export declare function parseRanges(value: HeaderValue, total: number): readonly ByteRange[] | 416 | null;
/** As parseRanges, but only a single satisfiable range is acceptable. */
export declare function parseRange(value: HeaderValue, total: number): ByteRange | 416 | null;
/** Content-Range field value; null range is the unsatisfied-range form ("bytes *\/N"). */
export declare function contentRange(range: ByteRange | null, total: number): string;
/** Deterministic boundary for a multipart/byteranges body over the given selection. */
export declare function multipartRangeBoundary(total: number, ranges: readonly ByteRange[]): string;
/** One part's delimiter and headers, up to and including the blank line before its bytes. */
export declare function byterangesPartHeader(boundary: string, type: string, range: ByteRange, total: number): string;
/** The close-delimiter ending a multipart/byteranges body. */
export declare function byterangesCloseDelimiter(boundary: string): string;
/** A whole multipart/byteranges body over an in-memory representation. */
export declare function multipartByterangesBody(body: Buffer, ranges: readonly ByteRange[], type: string, boundary: string): Buffer;
//# sourceMappingURL=range.d.mts.map