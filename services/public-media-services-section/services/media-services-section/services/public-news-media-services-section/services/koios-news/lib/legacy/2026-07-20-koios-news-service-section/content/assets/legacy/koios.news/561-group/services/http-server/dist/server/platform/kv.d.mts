import type { Resource } from "../types.mjs";
import { type Store } from "../internal/store.mjs";
import { type Clock } from "../internal/clock.mjs";
export type KvKey = string | readonly string[];
export type KvRecord<T = unknown> = {
    value: T;
    versionstamp: string;
    expireAt: number | null;
};
export type KvVersionedEntry<T = unknown> = {
    key: string[];
    value: T;
    versionstamp: string;
    expireAt: number | null;
};
export type KvGetOptions = {
    asJson?: boolean;
};
export type KvSetOptions = {
    ttlMs?: number;
    json?: boolean;
};
export type KvListOptions = {
    prefix?: KvKey;
    limit?: number;
    reverse?: boolean;
};
export type KvEntry<T = unknown> = {
    key: string | string[];
    value: T;
    expiresAt: number | null;
    versionstamp?: string;
};
export type KvMutation<T = unknown> = {
    type: "set";
    key: string[];
    value: T;
    versionstamp: string;
    expireAt: number | null;
} | {
    type: "delete";
    key: string[];
    versionstamp?: string;
};
export type KvBackend<T = unknown> = {
    get(key: string): KvRecord<T> | null;
    set(key: string, record: KvRecord<T>): void;
    delete(key: string): void;
    entries(): Iterable<[string, KvRecord<T>]>;
    clear?(): void;
    close?(): void | Promise<void>;
    ready?: Promise<void>;
    flush?(): Promise<void>;
    store?: Store<KvRecord<T>>;
};
export type KvStoreOptions<T = unknown> = {
    backend?: KvBackend<T>;
    store?: Store<KvRecord<T>>;
    defaultTtlMs?: number;
    sweepMs?: number;
    clock?: Clock;
    now?: () => number;
    onChange?: (mutation: KvMutation<T>) => void;
};
export type AtomicKvTransaction<T = unknown> = {
    check(key: KvKey, versionstamp: string | null): AtomicKvTransaction<T>;
    set(key: KvKey, value: T, opts?: KvSetOptions): AtomicKvTransaction<T>;
    delete(key: KvKey): AtomicKvTransaction<T>;
    commit(): {
        ok: boolean;
        versionstamp?: string;
    };
};
export type FunctionalKvStore<T = unknown> = {
    get(key: KvKey): KvVersionedEntry<T> | null;
    set(key: KvKey, value: T, opts?: KvSetOptions): {
        ok: true;
        versionstamp: string;
    };
    delete(key: KvKey): void;
    list(opts?: KvListOptions): KvVersionedEntry<T>[];
    atomic(): AtomicKvTransaction<T>;
    applyRemote(mutation: KvMutation<T>): {
        ok: boolean;
    };
    sweep(): void;
    close(): void | Promise<void>;
    encodeKey(key: KvKey): string;
    backend: KvBackend<T>;
    ready: Promise<void>;
    flush(): Promise<void>;
};
export type KvResourceOptions = {
    /** URL prefix for the KV resource (default "/kv/"). */
    mount?: string;
    /** If true, only GET/HEAD are allowed. */
    readonly?: boolean;
    /** Custom value parser (default JSON.parse). */
    parse?: (text: string) => unknown;
    /** Custom value serializer (default JSON.stringify). */
    serialize?: (value: unknown) => string;
};
export declare function storeBackend<T = unknown>(store: Store<KvRecord<T>>): KvBackend<T>;
export declare function memoryBackend<T = unknown>(): KvBackend<T>;
export declare function diskBackend<T = unknown>({ dir }: {
    dir: string;
}): KvBackend<T>;
export declare function kvStore<T = unknown>(options?: KvStoreOptions<T>): FunctionalKvStore<T>;
export declare class KvStore<T = unknown> {
    private readonly namespace;
    private readonly core;
    constructor(namespace?: string, options?: KvStoreOptions<T>);
    private scoped;
    get ready(): Promise<void>;
    flush(): Promise<void>;
    close(): void | Promise<void>;
    getEntry(key: KvKey): KvVersionedEntry<T> | null;
    set(key: KvKey, value: T, opts?: KvSetOptions): {
        ok: true;
        versionstamp: string;
    };
    get<U = T>(key: KvKey, opts?: KvGetOptions): U | null;
    has(key: KvKey): boolean;
    delete(key: KvKey): void;
    list(opts?: KvListOptions): KvEntry<T>[];
    increment(key: KvKey, by?: number, opts?: KvSetOptions): number;
    cas(key: KvKey, expected: T | null, next: T, opts?: KvSetOptions): boolean;
}
/**
 * kvResource(store, opts) — expose a KV store as an HTTP resource.
 *
 *   GET    <mount>/a/b  -> 200 JSON value, strong ETag versionstamp, or 404
 *   HEAD   <mount>/a/b  -> same headers without a body
 *   PUT    <mount>/a/b  -> 200 { ok, versionstamp }, honors If-Match
 *   DELETE <mount>/a/b  -> 204
 *   GET    <mount>/a/   -> 200 JSON entries under hierarchical prefix
 */
export declare function kvResource(store: FunctionalKvStore | KvStore, opts?: KvResourceOptions): Resource;
//# sourceMappingURL=kv.d.mts.map