import type { App } from "../types.mjs";
export type BundleId = string;
export type Bundle = {
    id: BundleId;
    source: string;
    destination: string;
    createdAt: number;
    expiresAt: number;
    payload: Buffer;
    custodian?: string;
    hopCount: number;
    maxHops: number;
};
export type DtnOptions = {
    nodeId: string;
    maxHops?: number;
    bundleTtlMs?: number;
    onDeliver?: (bundle: Bundle) => void | Promise<void>;
    onExpire?: (bundle: Bundle) => void;
};
export declare function bundleId(): BundleId;
export declare function encodeBundle(bundle: Bundle): Buffer;
export declare function decodeBundle(data: Buffer): Bundle | null;
export declare class DtnNode {
    private store;
    private bundles;
    private delivered;
    private opts;
    constructor(opts: DtnOptions);
    /** Create and store a bundle for forwarding. */
    send(destination: string, payload: Buffer): Bundle;
    private storeBundle;
    /** Receive a bundle (from a peer or relay). Returns true if accepted. */
    receive(bundle: Bundle): Promise<boolean>;
    /** Get bundles to forward to a connected peer (all in-flight, not expired). */
    bundlesFor(_peerId: string): Bundle[];
    /** Acknowledge delivery of a bundle (removes from forward queue). */
    ack(bundleId: BundleId): void;
    /** Purge expired bundles. */
    purgeExpired(): number;
}
export declare function dtnNode(opts: DtnOptions): DtnNode;
/** Build DTN relay endpoints. */
export declare function dtnResource(node: DtnNode): NonNullable<App["resources"]>[number][];
//# sourceMappingURL=dtn.d.mts.map