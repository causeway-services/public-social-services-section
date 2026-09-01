import { Readable } from "node:stream";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import { type Store } from "../internal/store.mjs";
import { type Clock } from "../internal/clock.mjs";
import type { Context, Resource } from "../types.mjs";
export type DurableStorage = {
    get<T = unknown>(key: string): T | undefined;
    get<T = unknown>(keys: readonly string[]): Map<string, T>;
    has(key: string): boolean;
    put<T = unknown>(key: string, value: T): void;
    put(values: Record<string, unknown>): void;
    set<T = unknown>(key: string, value: T): void;
    delete(key: string): boolean;
    delete(keys: readonly string[]): number;
    list(): Array<[string, unknown]>;
    transaction<T>(fn: (txn: DurableStorage) => T | Promise<T>): Promise<T>;
};
export type DurableObjectState = {
    id: string;
    storage: DurableStorage;
    getAlarm(): number | null;
    setAlarm(atMs: number | Date): void;
    deleteAlarm(): void;
    blockConcurrencyWhile<T>(fn: () => T | Promise<T>): Promise<T>;
};
export type DurableObjectInstance = {
    fetch?: (request: Request, ctx?: Context) => Response | Promise<Response>;
    alarm?: () => void | Promise<void>;
    onAlarm?: () => void | Promise<void>;
    [key: string]: unknown;
};
export type DurableObjectFactory = (id: string, state: DurableObjectState) => DurableObjectInstance;
export type DurableBackend = {
    get(key: string): unknown;
    has(key: string): boolean;
    put(key: string, value: unknown): void;
    delete(key: string): boolean;
    list(): Array<[string, unknown]>;
    getAlarm(): number | null;
    setAlarm(atMs: number): void;
    deleteAlarm(): void;
    ready?: Promise<void>;
    flush?(): Promise<void>;
    close?(): void | Promise<void>;
};
export type DurableObjectHandler = (state: DurableObjectState, ctx: Context) => Promise<void> | void;
export type DurableObjectClass = {
    fetch: DurableObjectHandler;
    alarm?: (state: DurableObjectState) => Promise<void> | void;
};
export type DurableObjectsOptions = {
    factory: DurableObjectFactory;
    storage?: (id: string) => DurableBackend;
    store?: (id: string) => Store<unknown>;
    clock?: Clock;
    idFromRequest?: (req: Context["req"], ctx: Context) => string | null | undefined;
    idParam?: string;
    mount?: string;
};
export type DurableObjectStub = {
    readonly id: string;
    readonly storage: DurableStorage;
    readonly ready: Promise<void>;
    flush(): Promise<void>;
    fetch(request: Request, ctx?: Context): Promise<Response>;
    call<T>(fn: (instance: DurableObjectInstance, storage: DurableStorage) => T | Promise<T>): Promise<T>;
};
export declare function memoryStorage(): (id: string) => DurableBackend;
export declare function idFromName(name: string): string;
export declare class DurableObjectNamespace {
    readonly resource: Resource;
    readonly alarms: {
        fire: (id: string) => Promise<void>;
    };
    private readonly objects;
    private readonly options;
    private readonly storageFactory;
    private readonly legacyHandler;
    constructor(options: DurableObjectsOptions | DurableObjectClass);
    get size(): number;
    idFromName(name: string): string;
    ids(): string[];
    get(id: string): DurableObjectStub;
    fetch(id: string, ctx: Context): Promise<void>;
    alarm(id: string): Promise<void>;
    router(keyFn: (ctx: Context) => string): (ctx: Context) => Promise<void>;
    private recordFor;
    private send;
    private instantiate;
}
export declare function durableObjects(options: DurableObjectsOptions | DurableObjectClass): DurableObjectNamespace;
export declare function bodyToNode(webBody: NodeReadableStream<Uint8Array> | Readable | null): Readable | null;
//# sourceMappingURL=durable.d.mts.map