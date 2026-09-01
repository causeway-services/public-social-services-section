export type CacheControl = {
    visibility?: "public" | "private";
    maxAge?: number;
    sMaxage?: number;
    noStore?: boolean;
    noCache?: boolean;
    mustRevalidate?: boolean;
    proxyRevalidate?: boolean;
    immutable?: boolean;
    staleWhileRevalidate?: number;
    staleIfError?: number;
};
export declare function cacheControl(policy: CacheControl | string): string;
export declare function parseCacheControl(value: string | readonly string[] | null | undefined): CacheControl;
//# sourceMappingURL=cache-control.d.mts.map