import { PeerRegistry, type PeerId, type PeerAddress } from "./address.mjs";
import type { App } from "../types.mjs";
export type GossipOptions = {
    self: PeerAddress;
    registry: PeerRegistry;
    intervalMs?: number;
    ackTimeoutMs?: number;
    indirectK?: number;
    fanout?: number;
    onJoin?: (peer: PeerAddress) => void;
    onLeave?: (peer: PeerId) => void;
    onSuspect?: (peer: PeerId) => void;
};
export type GossipMessage = {
    type: "ping" | "ack" | "ping-req" | "broadcast";
    from: PeerId;
    target?: PeerId;
    members?: Array<{
        id: PeerId;
        address: string;
        status: "alive" | "suspect" | "dead";
    }>;
};
export declare class GossipNode {
    private store;
    private timer;
    private suspects;
    private opts;
    constructor(opts: Required<GossipOptions>);
    start(): void;
    stop(): void;
    private round;
    private directPing;
    private indirectPing;
    private markSuspect;
    private clearSuspect;
    /** Handle an incoming gossip message (from the /mesh/gossip endpoint). */
    handleBroadcast(msg: GossipMessage): void;
    /** Settle peer health from stored charge evidence. */
    settle(id: PeerId): "potential" | "active" | "stable" | "absurd";
}
export declare function gossipNode(opts: GossipOptions): GossipNode;
/** Build mesh endpoint resources to attach to an App. */
export declare function meshResources(node: GossipNode, registry: PeerRegistry): App["resources"];
//# sourceMappingURL=gossip.d.mts.map