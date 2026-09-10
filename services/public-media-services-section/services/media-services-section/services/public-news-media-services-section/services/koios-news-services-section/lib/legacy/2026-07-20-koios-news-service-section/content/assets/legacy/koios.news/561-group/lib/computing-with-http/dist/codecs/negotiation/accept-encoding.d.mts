export type Coding = "zstd" | "br" | "gzip" | "deflate" | "identity";
export declare function parseAcceptEncoding(header: string): Map<string, number>;
/** Negotiate content-coding among the offered codings: the best one, or null if none is acceptable. */
export declare function negotiateEncoding(acceptEncodingHeader: string | undefined, offered: readonly Coding[]): Coding | null;
//# sourceMappingURL=accept-encoding.d.mts.map