/** sha-256 of an arbitrary identity → a 32-byte node id buffer. */
export declare function sha256(identity?: string | Buffer): Buffer;
/** XOR distance metric d(a,b) = a ⊕ b as a 32-byte Buffer. */
export declare function xorDistance(a: Buffer, b: Buffer): Buffer;
/** Compare two XOR-distance buffers (big-endian). <0 = a nearer, >0 = a farther. */
export declare function compareDistance(a: Buffer, b: Buffer): number;
/** Index of the k-bucket a peer falls in relative to `self` (⌊log2 XOR⌋). -1 = self. */
export declare function bucketIndex(self: Buffer, peer: Buffer): number;
export type KadContact = {
    id: Buffer;
    [key: string]: unknown;
};
export declare class RoutingTable {
    readonly selfId: Buffer;
    readonly k: number;
    readonly buckets: Map<number, KadContact[]>;
    constructor(selfId: Buffer, opts?: {
        k?: number;
    });
    private _bucket;
    has(id: Buffer): boolean;
    insert(contact: KadContact, opts?: {
        ping?: (c: KadContact) => boolean;
    }): "self" | "updated" | "added" | "evicted" | "rejected";
    remove(id: Buffer): boolean;
    contacts(): KadContact[];
    get size(): number;
    closest(targetId: Buffer, count?: number): KadContact[];
}
/**
 * findNode(targetId, opts) — Kademlia iterative node lookup (§2.3).
 * `query(contact, targetId) => Promise<KadContact[]>` is the injected transport probe.
 */
export declare function findNode(targetId: Buffer, opts: {
    table: RoutingTable;
    query: (contact: KadContact, target: Buffer) => Promise<KadContact[]>;
    k?: number;
    alpha?: number;
    signal?: AbortSignal;
}): Promise<KadContact[]>;
export declare const DNS_TYPE: {
    readonly A: 1;
    readonly PTR: 12;
    readonly TXT: 16;
    readonly SRV: 33;
    readonly AAAA: 28;
    readonly ANY: 255;
};
type DnsRR = {
    name: string;
    type: string | number;
    data?: string | string[] | Record<string, string> | Buffer;
    priority?: number;
    weight?: number;
    port?: number;
    target?: string;
    ttl?: number;
    cacheFlush?: boolean;
};
type DecodedRR = DnsRR & {
    class: number;
    cacheFlush: boolean;
};
type DnsMessage = {
    id?: number;
    flags?: number;
    questions?: {
        name: string;
        type: string | number;
        unicastResponse?: boolean;
    }[];
    answers?: DnsRR[];
    authorities?: DnsRR[];
    additionals?: DnsRR[];
};
/** Encode a DNS message to a Buffer. */
export declare function encodeDnsMessage(msg?: DnsMessage): Buffer;
/** Decode a DNS message from a Buffer. */
export declare function decodeDnsMessage(buf: Buffer): {
    id: number;
    flags: number;
    qr: boolean;
    questions: {
        name: string;
        type: string | number;
        unicastResponse: boolean;
    }[];
    answers: DecodedRR[];
    authorities: DecodedRR[];
    additionals: DecodedRR[];
};
export type PeerRecord = {
    id: Buffer;
    name: string;
    host: string | null;
    port: number | null;
    addresses: string[];
    txt: Record<string, string | true>;
};
export type PeerDiscoveryOptions = {
    port?: number;
    serviceName?: string;
    nodeId?: Buffer;
    identity?: string;
    instance?: string;
    txt?: Record<string, string>;
    host?: string;
    addresses?: string[];
    k?: number;
    ttl?: number;
    multicast?: boolean;
};
export type PeerDiscovery = {
    nodeId: Buffer;
    serviceName: string;
    instanceName: string;
    routingTable: RoutingTable;
    peers(): PeerRecord[];
    on(event: string, fn: (...args: unknown[]) => void): PeerDiscovery;
    off(event: string, fn: (...args: unknown[]) => void): PeerDiscovery;
    once(event: string, fn: (...args: unknown[]) => void): PeerDiscovery;
    announce(): boolean;
    browse(): boolean;
    findNode(target: Buffer, query: (c: KadContact, t: Buffer) => Promise<KadContact[]>, opts?: {
        alpha?: number;
        signal?: AbortSignal;
    }): Promise<KadContact[]>;
    readonly bound: boolean;
    close(): void;
};
/**
 * peerDiscovery(opts) — start LAN peer discovery + a Kademlia routing table.
 *
 * Events: "peer" (new peer seen), "peer-down" (peer gone), "error" (socket failure).
 * The dgram socket is unref'd so it never prevents process exit.
 * If multicast fails, the object still works as an in-memory routing table.
 */
export declare function peerDiscovery(opts?: PeerDiscoveryOptions): PeerDiscovery;
export {};
//# sourceMappingURL=discovery.d.mts.map