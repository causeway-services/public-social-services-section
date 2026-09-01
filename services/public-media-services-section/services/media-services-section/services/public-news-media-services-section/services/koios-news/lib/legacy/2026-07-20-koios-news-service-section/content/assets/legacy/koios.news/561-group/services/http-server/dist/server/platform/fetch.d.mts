export type FetchOptions = {
    method?: string;
    headers?: Record<string, string>;
    body?: string | Buffer;
    timeoutMs?: number;
    retries?: number;
    retryDelayMs?: number;
    retryOn?: (status: number) => boolean;
    followRedirects?: number;
};
export type FetchResponse = {
    status: number;
    headers: Record<string, string>;
    body(): Promise<Buffer>;
    json<T = unknown>(): Promise<T>;
    text(): Promise<string>;
};
export declare function fetch(url: string, opts?: FetchOptions): Promise<FetchResponse>;
/** Fetch with JSON body shorthand. */
export declare function fetchJson<T = unknown>(url: string, body: unknown, opts?: Omit<FetchOptions, "body">): Promise<T>;
//# sourceMappingURL=fetch.d.mts.map