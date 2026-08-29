import type { WsSession } from "../edge/ws.mjs";
export type NostrEvent = {
    id: string;
    pubkey: string;
    created_at: number;
    kind: number;
    tags: string[][];
    content: string;
    sig: string;
};
export type NostrFilter = {
    ids?: string[];
    authors?: string[];
    kinds?: number[];
    since?: number;
    until?: number;
    limit?: number;
    [key: string]: unknown;
};
export type NostrRelayMessage = ["EVENT", string, NostrEvent] | ["EOSE", string] | ["NOTICE", string] | ["OK", string, boolean, string];
export type NostrClientMessage = ["EVENT", NostrEvent] | ["REQ", string, ...NostrFilter[]] | ["CLOSE", string];
export type NostrRelayOptions = {
    /** Verify event signature. Return true to accept. Default: always accept (dev mode). */
    verify?: (event: NostrEvent) => boolean | Promise<boolean>;
    /** Max events to store (default 10_000). */
    maxEvents?: number;
    /** Max filters per subscription (default 10). */
    maxFilters?: number;
    /** Persist events beyond in-memory (optional). */
    onEvent?: (event: NostrEvent) => void;
};
export declare class NostrRelay {
    private store;
    private events;
    private sessions;
    private opts;
    constructor(opts?: NostrRelayOptions);
    private send;
    private publish;
    /** Connect a WsSession to the relay. Returns cleanup function. */
    connect(session: WsSession): () => void;
    private handleEvent;
    get eventCount(): number;
    get sessionCount(): number;
}
export declare function nostrRelay(opts?: NostrRelayOptions): NostrRelay;
//# sourceMappingURL=nostr.d.mts.map