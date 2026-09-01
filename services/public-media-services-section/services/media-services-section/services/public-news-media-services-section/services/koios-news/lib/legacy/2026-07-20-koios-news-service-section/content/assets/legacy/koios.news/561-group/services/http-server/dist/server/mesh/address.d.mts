export type PeerId = string;
export type PeerAddress = {
    id: PeerId;
    address: string;
    tags?: string[];
    meta?: Record<string, string>;
};
export type PeerHealth = "up" | "down" | "unknown";
export declare class PeerRegistry {
    private store;
    private peers;
    register(peer: PeerAddress): void;
    deregister(id: PeerId): void;
    markHealth(id: PeerId, health: PeerHealth): void;
    settle(id: PeerId): "potential" | "active" | "stable" | "absurd";
    get(id: PeerId): PeerAddress | undefined;
    byTag(tag: string): PeerAddress[];
    all(): PeerAddress[];
}
export declare function parsePeerAddress(raw: string): PeerAddress;
//# sourceMappingURL=address.d.mts.map