import type { AddressInfo } from "node:net";
import type { App, StartResult } from "./types.mjs";
type RawServer = {
    headersTimeout?: number;
    requestTimeout?: number;
    keepAliveTimeout?: number;
    connectionsCheckingInterval?: number;
    maxRequestsPerSocket?: number | null;
    listen(port: number, cb: () => void): void;
    listen(port: number, host: string, cb: () => void): void;
    listen(port: number, host: string, backlog: number, cb: () => void): void;
    listen(options: ListenOptions, cb: () => void): void;
    listen(path: string, cb: () => void): void;
    close(cb?: (err?: Error) => void): void;
    closeIdleConnections?: () => void;
    closeAllConnections?: () => void;
    on(event: string, listener: (...args: unknown[]) => void): void;
    once(event: string, listener: (...args: unknown[]) => void): void;
    off?: (event: string, listener: (...args: unknown[]) => void) => void;
    removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
    address(): AddressInfo | string | null;
};
type ManagedServer = RawServer & {
    closeGracefully: {
        (): Promise<void>;
        (grace: number): Promise<void>;
    };
};
export type GracefulShutdownPhase = "running" | "draining" | "closed" | "failed";
export type GracefulShutdownState = {
    phase: GracefulShutdownPhase;
    reason?: string;
    signal?: NodeJS.Signals;
    startedAt?: string;
    closedAt?: string;
    error?: string;
};
export type GracefulShutdownSignalSource = {
    on(event: NodeJS.Signals, listener: () => void): unknown;
    off?: (event: NodeJS.Signals, listener: () => void) => unknown;
    removeListener?: (event: NodeJS.Signals, listener: () => void) => unknown;
};
export type GracefulShutdownTarget = Pick<StartResult, "close"> | {
    closeGracefully: {
        (): Promise<void>;
        (grace: number): Promise<void>;
    };
};
export type GracefulShutdownOptions = {
    signals?: readonly NodeJS.Signals[];
    grace?: number;
    source?: GracefulShutdownSignalSource;
    now?: () => Date;
    onDrain?: (state: GracefulShutdownState) => void | Promise<void>;
    onClosed?: (state: GracefulShutdownState) => void | Promise<void>;
    onError?: (error: unknown, state: GracefulShutdownState) => void | Promise<void>;
    forceExit?: false | ((code: number, signal: NodeJS.Signals) => void);
};
export type GracefulShutdownHandle = {
    readonly state: GracefulShutdownState;
    readonly draining: boolean;
    readonly promise: Promise<void> | null;
    drain: {
        (): Promise<void>;
        (reason: string): Promise<void>;
        (reason: string, grace: number): Promise<void>;
    };
    dispose(): void;
};
export type StartOptions = {
    port?: number;
    host?: string;
    backlog?: number;
    path?: string;
    signal?: AbortSignal;
    timeouts?: ServerTimeoutOptions;
};
export type ServerTimeoutOptions = {
    requestMs?: number;
    headersMs?: number;
    idleMs?: number;
    connectionsCheckingIntervalMs?: number;
    maxRequestsPerSocket?: number;
};
type ListenOptions = {
    port?: number;
    host?: string;
    backlog?: number;
    path?: string;
};
/**
 * createServer(app) — build a Node HTTP server bound to an app but NOT yet listening.
 * Attaches the request handler, upgrade dispatcher, connection tracking, and adds
 * `closeGracefully(grace?)` for drain-on-shutdown. Call `.listen()` or use `start()`.
 */
export declare function createServer(app: App): ManagedServer;
export declare function installGracefulShutdown(target: GracefulShutdownTarget, options?: GracefulShutdownOptions): GracefulShutdownHandle;
/** Listen on `port` (0 = ephemeral); resolves `{ server, port, close }`. */
export declare function start(app: App, port?: number): Promise<StartResult>;
export declare function start(app: App, path: string): Promise<StartResult>;
export declare function start(app: App, options: StartOptions): Promise<StartResult>;
export {};
//# sourceMappingURL=server.d.mts.map