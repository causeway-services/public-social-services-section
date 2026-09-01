export type CacheQueryOptions = {
    ignoreSearch?: boolean;
    ignoreMethod?: boolean;
    ignoreVary?: boolean;
};
export type MultiCacheQueryOptions = CacheQueryOptions & {
    cacheName?: string;
};
export type CacheApiOptions = {
    fetch?: typeof fetch | null;
};
export type OpenCacheOptions = CacheApiOptions & {
    storage?: CacheStorage;
};
export type CacheRequest = Request | URL | string;
export type CacheResponse = Response;
export declare class Cache {
    #private;
    constructor(options?: CacheApiOptions);
    match(request: CacheRequest, options?: CacheQueryOptions): Promise<Response | undefined>;
    matchAll(request?: CacheRequest, options?: CacheQueryOptions): Promise<Response[]>;
    put(request: CacheRequest, response: Response): Promise<void>;
    add(request: CacheRequest): Promise<void>;
    addAll(requests: CacheRequest[]): Promise<void>;
    delete(request: CacheRequest, options?: CacheQueryOptions): Promise<boolean>;
    keys(request?: CacheRequest, options?: CacheQueryOptions): Promise<Request[]>;
}
export declare class CacheStorage {
    #private;
    constructor(options?: CacheApiOptions);
    open(name: string): Promise<Cache>;
    has(name: string): Promise<boolean>;
    delete(name: string): Promise<boolean>;
    keys(): Promise<string[]>;
    match(request: CacheRequest, options?: MultiCacheQueryOptions): Promise<Response | undefined>;
}
export declare const caches: CacheStorage;
export declare function openCache(name: string, options?: OpenCacheOptions): Promise<Cache>;
//# sourceMappingURL=cache-api.d.mts.map