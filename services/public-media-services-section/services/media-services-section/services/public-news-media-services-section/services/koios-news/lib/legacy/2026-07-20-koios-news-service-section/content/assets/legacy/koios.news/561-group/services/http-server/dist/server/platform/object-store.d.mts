import type { App } from "../types.mjs";
export type ObjectMetadata = {
    key: string;
    size: number;
    contentType?: string;
    etag?: string;
    lastModified?: Date;
    userMeta?: Record<string, string>;
};
export type ObjectBody = Uint8Array | Buffer | AsyncIterable<Uint8Array>;
export type ObjectStoreBackend = {
    get(key: string): Promise<{
        body: AsyncIterable<Uint8Array>;
        meta: ObjectMetadata;
    } | null>;
    put(key: string, body: ObjectBody, meta?: Partial<ObjectMetadata>): Promise<ObjectMetadata>;
    delete(key: string): Promise<boolean>;
    list(prefix?: string, limit?: number): Promise<ObjectMetadata[]>;
    head(key: string): Promise<ObjectMetadata | null>;
};
export type DiskObjectBackendOptions = {
    dir: string;
};
export type BucketedObjectStoreOptions = {
    dir?: string;
};
export type PutObjectOptions = {
    contentType?: string;
    metadata?: Record<string, string>;
};
export type StoredObject = {
    body: Buffer;
    etag?: string;
    size: number;
    lastModified?: Date;
    contentType: string;
    metadata: Record<string, string>;
};
export type ListObjectsOptions = {
    prefix?: string;
    delimiter?: string;
    maxKeys?: number;
    startAfter?: string;
    continuationToken?: string;
};
export type ListObjectsResult = {
    keys: Array<{
        key: string;
        etag?: string;
        size?: number;
        lastModified?: Date;
    }>;
    commonPrefixes: string[];
    isTruncated: boolean;
    nextContinuationToken: string | null;
};
export declare class InMemoryObjectBackend implements ObjectStoreBackend {
    private objects;
    get(key: string): Promise<{
        body: AsyncGenerator<Uint8Array<ArrayBufferLike>, void, unknown>;
        meta: ObjectMetadata;
    } | null>;
    put(key: string, body: ObjectBody, meta?: Partial<ObjectMetadata>): Promise<ObjectMetadata>;
    delete(key: string): Promise<boolean>;
    list(prefix?: string, limit?: number): Promise<ObjectMetadata[]>;
    head(key: string): Promise<ObjectMetadata | null>;
}
export declare class DiskObjectBackend implements ObjectStoreBackend {
    private readonly options;
    private readonly ready;
    constructor(options: DiskObjectBackendOptions);
    private objectPath;
    private metaPath;
    private readMeta;
    get(key: string): Promise<{
        body: AsyncIterable<Uint8Array>;
        meta: ObjectMetadata;
    } | null>;
    put(key: string, body: ObjectBody, meta?: Partial<ObjectMetadata>): Promise<ObjectMetadata>;
    delete(key: string): Promise<boolean>;
    list(prefix?: string, limit?: number): Promise<ObjectMetadata[]>;
    head(key: string): Promise<ObjectMetadata | null>;
}
export declare class ObjectStore {
    private store;
    private readonly backend;
    constructor(backend: ObjectStoreBackend);
    get(key: string): Promise<{
        body: AsyncIterable<Uint8Array>;
        meta: ObjectMetadata;
    } | null>;
    put(key: string, body: ObjectBody, meta?: Partial<ObjectMetadata>): Promise<ObjectMetadata>;
    delete(key: string): Promise<boolean>;
    list(prefix?: string, limit?: number): Promise<ObjectMetadata[]>;
    head(key: string): Promise<ObjectMetadata | null>;
}
export declare class BucketedObjectStore {
    private readonly options;
    private readonly buckets;
    private readonly ready;
    constructor(options?: BucketedObjectStoreOptions);
    private assertBucket;
    private bucketPath;
    private backendFor;
    createBucket(bucket: string): Promise<boolean>;
    hasBucket(bucket: string): Promise<boolean>;
    listBuckets(): Promise<Array<{
        name: string;
    }>>;
    deleteBucket(bucket: string): Promise<"deleted" | "absent" | "not-empty">;
    putObject(bucket: string, key: string, body: ObjectBody, opts?: PutObjectOptions): Promise<StoredObject>;
    getObject(bucket: string, key: string): Promise<StoredObject | null>;
    headObject(bucket: string, key: string): Promise<Omit<StoredObject, "body"> | null>;
    deleteObject(bucket: string, key: string): Promise<boolean>;
    listObjects(bucket: string, opts?: ListObjectsOptions): Promise<ListObjectsResult | null>;
}
export declare function objectStore(options?: BucketedObjectStoreOptions): BucketedObjectStore;
export declare function listObjectsV2Xml(bucket: string, result: ListObjectsResult, opts?: ListObjectsOptions): string;
/** Build a /objects REST API resource set. */
export declare function s3Resource(store: ObjectStore, prefix?: string): NonNullable<App["resources"]>[number][];
export declare function s3Resource(store: BucketedObjectStore, options?: {
    mount?: string;
} | string): NonNullable<App["resources"]>[number];
//# sourceMappingURL=object-store.d.mts.map