export class LruMap {
    #map = new Map();
    #max;
    #onEvict;
    constructor({ max, onEvict }) {
        this.#max = max;
        this.#onEvict = onEvict;
    }
    get(key) {
        if (!this.#map.has(key))
            return undefined;
        const v = this.#map.get(key);
        this.#map.delete(key);
        this.#map.set(key, v);
        return v;
    }
    set(key, value) {
        if (this.#map.has(key))
            this.#map.delete(key);
        else if (this.#max > 0 && this.#map.size >= this.#max) {
            const oldest = this.#map.keys().next().value;
            this.#onEvict?.(oldest, this.#map.get(oldest));
            this.#map.delete(oldest);
        }
        this.#map.set(key, value);
        return this;
    }
    peek(key) { return this.#map.get(key); }
    has(key) { return this.#map.has(key); }
    delete(key) { return this.#map.delete(key); }
    get size() { return this.#map.size; }
    keys() { return this.#map.keys(); }
    values() { return this.#map.values(); }
    entries() { return this.#map.entries(); }
    clear() { this.#map.clear(); }
}
export function lruMap(opts) {
    return new LruMap(opts);
}
export function boundedMap(opts = {}) {
    const config = { max: opts.max ?? 0 };
    if (opts.onEvict)
        config.onEvict = opts.onEvict;
    return new LruMap(config);
}
//# sourceMappingURL=lru.mjs.map