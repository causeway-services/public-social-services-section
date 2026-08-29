import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
export type WsMessage = {
    type: "text";
    data: string;
} | {
    type: "binary";
    data: Buffer;
} | {
    type: "ping";
    data: Buffer;
} | {
    type: "pong";
    data: Buffer;
} | {
    type: "close";
    code: number;
    reason: string;
};
export type WsSession = {
    readonly id: string;
    readonly req: IncomingMessage;
    send(data: string | Buffer): void;
    ping(data?: Buffer): void;
    close(code?: number, reason?: string): void;
    on(event: "message", cb: (msg: WsMessage) => void): void;
    on(event: "close", cb: (code: number, reason: string) => void): void;
    on(event: "error", cb: (err: Error) => void): void;
};
export type WsOptions = {
    path?: string | RegExp;
    admit?: (req: IncomingMessage) => boolean | Promise<boolean>;
    onSession: (session: WsSession) => void | Promise<void>;
    pingIntervalMs?: number;
    maxMessageBytes?: number;
    selectProtocol?: (offered: string[], req: IncomingMessage) => string | undefined;
};
/** Returns an upgrade handler compatible with App.upgrades. */
export declare function wsUpgrade(opts: WsOptions): {
    match: string | RegExp | ((path: string) => boolean);
    handler: (req: IncomingMessage, socket: unknown, head: Buffer) => void;
};
export declare function websocketServer(onConnection: (ws: {
    send(data: string | Buffer): void;
    ping(data?: Buffer): void;
    close(code?: number, reason?: string): void;
    on(event: "message" | "close" | "error", cb: (...args: any[]) => void): unknown;
    readonly readyState: number;
    socket: Duplex;
}, req: IncomingMessage) => void | Promise<void>, options?: {
    selectProtocol?: (offered: string[], req: IncomingMessage) => string | undefined;
    maxPayload?: number;
}): {
    handleUpgrade(req: IncomingMessage, socket: unknown, head: Buffer): void;
    toUpgrade(match?: string | RegExp | ((path: string) => boolean)): {
        handleUpgrade: (req: IncomingMessage, socket: unknown, head: Buffer) => void;
        match?: string | RegExp | ((path: string) => boolean);
    };
};
export declare function websocketProxy(targetWsUrl: string, options?: {
    headers?: Record<string, string>;
}): (req: IncomingMessage, socket: unknown, head: Buffer) => Promise<void>;
//# sourceMappingURL=ws.d.mts.map