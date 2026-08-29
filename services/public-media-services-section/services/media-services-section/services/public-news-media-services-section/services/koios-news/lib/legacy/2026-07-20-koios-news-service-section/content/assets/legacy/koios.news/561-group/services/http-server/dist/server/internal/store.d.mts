export type Store<T = unknown> = {
    get(key: string): Promise<T | undefined>;
    set(key: string, value: T): Promise<void>;
    delete(key: string): Promise<boolean>;
    has(key: string): Promise<boolean>;
    entries(): AsyncIterable<[string, T]>;
    clear(): Promise<void>;
    close(): Promise<void>;
};
export declare function memoryStore<T = unknown>(): Store<T>;
export declare function diskStore<T = unknown>({ dir }: {
    dir: string;
}): Store<T>;
//# sourceMappingURL=store.d.mts.map