export type LruOptions<K, V> = {
    max: number;
    onEvict?: (key: K, value: V) => void;
};
export declare class LruMap<K, V> {
    #private;
    constructor({ max, onEvict }: LruOptions<K, V>);
    get(key: K): V | undefined;
    set(key: K, value: V): this;
    peek(key: K): V | undefined;
    has(key: K): boolean;
    delete(key: K): boolean;
    get size(): number;
    keys(): IterableIterator<K>;
    values(): IterableIterator<V>;
    entries(): IterableIterator<[K, V]>;
    clear(): void;
}
export declare function lruMap<K, V>(opts: LruOptions<K, V>): LruMap<K, V>;
export declare function boundedMap<K, V>(opts?: Partial<LruOptions<K, V>>): LruMap<K, V>;
//# sourceMappingURL=lru.d.mts.map