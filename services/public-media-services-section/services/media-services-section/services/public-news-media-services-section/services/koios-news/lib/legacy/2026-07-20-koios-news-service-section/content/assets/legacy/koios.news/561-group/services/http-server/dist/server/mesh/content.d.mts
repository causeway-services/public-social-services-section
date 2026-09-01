import type { App } from "../types.mjs";
export type Cid = string;
export declare function cidOf(data: Buffer | Uint8Array): Cid;
export declare class ContentStore {
    private store;
    private objects;
    put(data: Buffer): Cid;
    get(cid: Cid): Buffer | null;
    has(cid: Cid): boolean;
    delete(cid: Cid): void;
    /** All known CIDs (including deleted — MPU settles availability). */
    cids(): Cid[];
    /** CIDs available locally (MPU-settled to potential). */
    available(): Cid[];
}
export declare function contentStore(): ContentStore;
/** Build content-store REST endpoints. */
export declare function contentStoreResource(store: ContentStore, prefix?: string): NonNullable<App["resources"]>[number][];
//# sourceMappingURL=content.d.mts.map