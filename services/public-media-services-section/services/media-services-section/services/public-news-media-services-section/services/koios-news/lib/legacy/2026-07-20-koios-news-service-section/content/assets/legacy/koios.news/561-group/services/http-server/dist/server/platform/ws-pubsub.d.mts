import type { IncomingMessage } from "node:http";
import type { UpgradeHandler } from "../types.mjs";
import { type WsOptions, type WsSession } from "../edge/ws.mjs";
export type WsPubSubWireMessage = {
    op: "subscribe";
    topic: string;
} | {
    op: "unsubscribe";
    topic: string;
} | {
    op: "publish";
    topic: string;
    data: unknown;
} | {
    op: "presence";
    topic: string;
};
export type WsPubSubOperation = {
    type: "subscribe" | "unsubscribe" | "publish" | "presence";
    topic: string;
    data?: unknown;
};
export type WsPubSubConnection = WsSession & {
    topics: Set<string>;
    pubsend(frame: unknown): void;
};
export type WsPubSubOptions = {
    /** Max subscribers per topic (default 10_000). */
    maxPerTopic?: number;
    /** Whether server-side publish delivers to sender when `from` is supplied (default false). */
    echo?: boolean;
    /** Ping interval for idle cleanup. 0 disables. Default 30s. */
    heartbeatMs?: number;
    /** Per-topic backlog size replayed on subscribe. Default 0. */
    backlog?: number;
    /** Enable JSON client wire convention. Default true. */
    wire?: boolean;
    encode?: (frame: unknown) => string | Buffer;
    decode?: (text: string) => unknown;
    onConnection?: (conn: WsPubSubConnection, req: IncomingMessage) => void | Promise<void>;
    authorize?: (conn: WsPubSubConnection, op: WsPubSubOperation) => boolean | Promise<boolean>;
    path?: WsOptions["path"];
    admit?: WsOptions["admit"];
    maxMessageBytes?: number;
};
export type PublishOptions = {
    from?: string | null;
    echo?: boolean;
};
export declare class WsPubSub {
    private readonly store;
    private readonly subscribers;
    private readonly topicIndex;
    private readonly backlogs;
    private readonly maxPerTopic;
    private readonly echo;
    private readonly heartbeatMs;
    private readonly backlog;
    private readonly wire;
    private readonly encode;
    private readonly decode;
    private readonly onConnection;
    private readonly authorize;
    private heartbeat;
    private readonly upgradeHandler;
    constructor(opts?: WsPubSubOptions);
    /** Register a WsSession with the hub. Returns the subscriber handle. */
    subscribe(session: WsSession, topics?: string | readonly string[]): () => void;
    /** Enroll a session and install wire/cleanup handlers. Idempotent. */
    connect(session: WsSession): WsPubSubConnection;
    /** Add a subscriber to a topic. Returns resulting presence count. */
    addTopic(sessionId: string, topic: string): number;
    /** Archive-compatible alias: subscribe one existing connection to one topic. */
    join(session: WsSession, topic: string): number;
    /** Remove a subscriber from a topic. */
    removeTopic(sessionId: string, topic: string): boolean;
    /** Remove a whole session, or one topic when `topic` is provided. */
    unsubscribe(sessionId: string | WsSession, topic?: string): void;
    /** Publish a message to all subscribers of a topic. */
    publish(topic: string, data: unknown, fromOrOptions?: string | PublishOptions | null): number;
    /** Publish to all live sessions, irrespective of topic. */
    broadcast(data: unknown, fromOrOptions?: string | PublishOptions | null): number;
    topics(): string[];
    topicsFor(sessionId: string): string[];
    presence(topic: string): {
        topic: string;
        count: number;
        members: string[];
    };
    subscriberCount(topic: string): number;
    connections(): WsPubSubConnection[];
    get totalSubscribers(): number;
    handleUpgrade(req: IncomingMessage, socket: unknown, head: Buffer): void;
    toUpgrade(match?: UpgradeHandler["match"]): UpgradeHandler;
    close(code?: number, reason?: string): void;
    private recordBacklog;
    private membershipAdmitted;
    private push;
    private pushRaw;
    private onMessage;
    private allowed;
    private startHeartbeat;
    private stopHeartbeat;
}
export declare function wsPubSub(opts?: WsPubSubOptions): WsPubSub;
//# sourceMappingURL=ws-pubsub.d.mts.map