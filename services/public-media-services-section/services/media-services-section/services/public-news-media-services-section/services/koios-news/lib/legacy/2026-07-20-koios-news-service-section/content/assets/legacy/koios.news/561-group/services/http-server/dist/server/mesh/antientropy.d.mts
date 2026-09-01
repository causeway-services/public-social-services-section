import { type JsonValue } from "@emsenn/relating/codecs";
import { UtteranceLog } from "../internal/witness.mjs";
import { PeerRegistry, type PeerAddress } from "./address.mjs";
import type { App } from "../types.mjs";
export type AntiEntropyOptions = {
    self: PeerAddress;
    registry: PeerRegistry;
    store: UtteranceLog;
    intervalMs?: number;
    batchSize?: number;
    onSync?: (peerId: string, added: number, received: number) => void;
};
type SyncRequest = {
    digest: string[];
};
type SyncResponse = {
    missing: JsonValue | null;
    digest: string[];
};
export declare class AntiEntropyNode {
    private timer;
    private opts;
    constructor(opts: Required<AntiEntropyOptions>);
    start(): void;
    stop(): void;
    private buildDigest;
    private round;
    /** Handle an incoming anti-entropy sync request. */
    handleSync(req: SyncRequest): SyncResponse;
}
export declare function antiEntropyNode(opts: AntiEntropyOptions): AntiEntropyNode;
/** Build anti-entropy endpoint resource to attach to an App. */
export declare function antiEntropyResource(node: AntiEntropyNode): NonNullable<App["resources"]>[number];
export {};
//# sourceMappingURL=antientropy.d.mts.map