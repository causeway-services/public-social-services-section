import type { IncomingMessage, ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import { type CacheControl } from "../codecs/http/index.mjs";
import { type MultipartForm } from "../codecs/multipart/index.mjs";
export type Body = string | Buffer | NodeJS.ReadableStream | AsyncIterable<Uint8Array>;
export type ResponseTrailerValue = string | number | readonly string[];
export type ResponseTrailers = Readonly<Record<string, ResponseTrailerValue>>;
export type Repr = {
    status?: number;
    headers?: Record<string, string | readonly string[]>;
    trailers?: ResponseTrailers;
    body?: Body;
    type?: string;
    etag?: string;
    lastModified?: Date;
    cacheControl?: CacheControl | string;
    security?: SecurityHeaders | true;
};
export type ReprOptions = Readonly<{
    status?: number;
    headers?: Record<string, string>;
    trailers?: ResponseTrailers;
    cacheControl?: CacheControl | string;
    security?: SecurityHeaders | true;
    etag?: string;
    lastModified?: Date;
}>;
export type JsonReprOptions = ReprOptions & Readonly<{
    type?: string;
    pretty?: boolean | number;
    newline?: boolean;
}>;
export type TextReprOptions = ReprOptions & Readonly<{
    type?: string;
}>;
export type HandlerResult = Repr | Response | null | undefined | void;
export type RequestHookResult = boolean | HandlerResult;
export type ErrorHookResult = boolean | HandlerResult;
export type ProblemResponseOptions = Readonly<{
    headers?: Readonly<Record<string, string>>;
    cacheControl?: CacheControl | string;
    security?: SecurityHeaders | true;
    includeErrorDetail?: boolean;
    includeStack?: boolean;
    instance?: string | ((ctx: Context) => string | undefined);
}>;
export type RequestTraceEntry = Readonly<{
    e: unknown;
    a: string;
    v: unknown;
    t: unknown;
}>;
export type RequestTrace = Readonly<{
    kind: "web-server.request-trace";
    id: string;
    entries: readonly RequestTraceEntry[];
}>;
export type Handler = (ctx: Context) => HandlerResult | Promise<HandlerResult>;
export type Middleware = (ctx: Context) => MiddlewareResult | Promise<MiddlewareResult>;
export type MiddlewareResult = RequestTraceEntry[] | boolean | HandlerResult;
export type Resource = {
    match: string | RegExp | ((path: string, ctx: Context) => boolean | Record<string, string> | null | undefined);
    route?: string;
    id?: string;
    name?: string;
    methods?: readonly string[];
    produces?: readonly string[];
    languages?: readonly string[];
    middlewares?: readonly Middleware[];
    handler: Handler;
};
export type Context = {
    req: IncomingMessage;
    res: ServerResponse;
    app: App;
    url: URL;
    params: Readonly<Record<string, string>>;
    locals: Record<string, unknown>;
    nonce: string;
    negotiatedType?: string;
    negotiatedLanguage?: string;
    resource?: Resource;
    route?: string;
    routeTemplate?: string;
    matchedRoute?: string;
    routeId?: string;
    routeName?: string;
    signal: AbortSignal;
    trace: RequestTrace;
    startedAt: number;
};
export type UpgradeHandler = {
    match?: string | RegExp | ((path: string) => boolean) | ((req: IncomingMessage) => boolean);
    handler?: (req: IncomingMessage, socket: unknown, head: Buffer) => void;
    handleUpgrade?: (req: IncomingMessage, socket: unknown, head: Buffer, ctx: {
        app: App;
    }) => void;
};
export type ServerLifecycle = {
    onStart?: (server: unknown) => void | Promise<void>;
    onStop?: (server: unknown) => void | Promise<void>;
    onConnection?: (socket: unknown) => void;
};
export type ExpectContinueHook = (req: IncomingMessage, res: ServerResponse, app: App) => boolean | void | Promise<boolean | void>;
export type ClientError = Error & {
    code?: string;
    bytesParsed?: number;
    rawPacket?: Buffer;
};
export type ClientErrorHook = (error: ClientError, socket: unknown, app: App) => boolean | void | Promise<boolean | void>;
export type CorsOriginPattern = string | RegExp;
export type CorsOptions = {
    origins?: readonly CorsOriginPattern[] | ((origin: string, ctx: {
        req: IncomingMessage;
    }) => boolean);
    methods?: readonly string[];
    headers?: readonly string[];
    expose?: readonly string[];
    credentials?: boolean;
    maxAge?: number;
    allowPrivateNetwork?: boolean;
    strictPreflight?: boolean;
    preflightDenyStatus?: number;
};
export type StrictTransportSecurity = string | false | {
    maxAge?: number;
    includeSubDomains?: boolean;
    preload?: boolean;
};
export type SecurityHeaders = {
    contentSecurityPolicy?: string | false;
    contentSecurityPolicyReportOnly?: string | false;
    strictTransportSecurity?: StrictTransportSecurity;
    contentTypeOptions?: "nosniff" | false;
    referrerPolicy?: string | false;
    frameOptions?: "DENY" | "SAMEORIGIN" | false;
    permissionsPolicy?: string | false;
    reportingEndpoints?: string | Readonly<Record<string, string>> | false;
    crossOriginOpenerPolicy?: string | false;
    crossOriginResourcePolicy?: string | false;
    crossOriginEmbedderPolicy?: string | false;
    originAgentCluster?: "?1" | false;
    dnsPrefetchControl?: "on" | "off" | false;
    downloadOptions?: "noopen" | false;
    permittedCrossDomainPolicies?: "none" | "master-only" | "by-content-type" | "by-ftp-filename" | "all" | false;
};
export type App = {
    resources?: readonly Resource[];
    middlewares?: readonly Middleware[];
    upgrades?: readonly UpgradeHandler[];
    tls?: {
        key: string;
        cert: string;
        ca?: string;
    };
    http2?: boolean;
    cors?: CorsOptions;
    cacheControl?: CacheControl | string;
    security?: SecurityHeaders | true;
    problems?: boolean | ProblemResponseOptions;
    base?: string;
    trustProxy?: boolean | number;
    expectContinue?: boolean | ExpectContinueHook;
    clientError?: false | ClientErrorHook;
    locals?: Record<string, unknown>;
    onStart?: (app: App) => void | Promise<void>;
    onStop?: (app: App) => void | Promise<void>;
    onConnection?: (socket: unknown) => void;
    lifecycle?: ServerLifecycle;
    onRequest?: (ctx: Context) => RequestHookResult | Promise<RequestHookResult>;
    onResponse?: (ctx: Context) => void | Promise<void>;
    onError?: (err: unknown, ctx: Context) => ErrorHookResult | Promise<ErrorHookResult>;
};
export type StartResult = {
    server: unknown;
    port: number;
    address: AddressInfo | string | null;
    close: {
        (): Promise<void>;
        (grace: number): Promise<void>;
    };
};
export interface Servable {
    readonly app: App;
    refresh(): Promise<void>;
    start(intervalMs?: number): void;
    stop(): void;
}
export type SseWriter = {
    send(event: string, data: unknown, id?: string): void;
    comment(text: string): void;
    close(): void;
};
export type SseSink = {
    write(chunk: string): unknown;
};
export type TopicEvent = Readonly<{
    type?: string;
    topic?: string;
    [key: string]: unknown;
}>;
export declare function sse(req: IncomingMessage, res: ServerResponse, onClose?: () => void): SseWriter;
export declare function writeSseEvent(sink: SseSink, name: string, data: unknown, id?: string): boolean;
export declare function writeSseComment(sink: SseSink, text?: string): boolean;
export declare function createProjectedEventHub(): {
    subscribe(sink: SseSink, opts?: {
        topics?: Iterable<string> | string;
    }): () => void;
    publish(events: TopicEvent | readonly TopicEvent[]): void;
    keepAlive(): number;
    size(): number;
};
export type WellKnownEntry = {
    name: string;
    handler?: Handler;
    repr?: Repr | ((pathRemainder: string, ctx: Parameters<Handler>[0]) => Repr | Promise<Repr>);
    methods?: readonly string[];
    produces?: readonly string[];
    prefix?: boolean;
};
export type WellKnownOptions = {
    basePath?: string;
};
export declare function wellKnown(entries: readonly WellKnownEntry[], opts?: WellKnownOptions): App;
export declare function jsonRepr(body: unknown, options?: number | JsonReprOptions): Repr;
export declare function textRepr(body: string, options?: number | TextReprOptions): Repr;
export declare function htmlRepr(body: string, options?: number | TextReprOptions): Repr;
export declare function emptyRepr(status?: number, options?: ReprOptions): Repr;
export type BodyParseOptions = Readonly<{
    maxBytes?: number;
    maxEncodedBytes?: number;
    contentType?: string;
    contentEncoding?: string | readonly string[];
    decodeContentEncoding?: boolean;
}>;
export type JsonBodyOptions<T = unknown> = BodyParseOptions & Readonly<{
    empty?: T;
}>;
export declare function readBody(req: IncomingMessage, options?: number | BodyParseOptions): Promise<Buffer>;
export declare function readTextBody(req: IncomingMessage, options?: BodyParseOptions): Promise<string>;
export declare function readJsonBody<T = unknown>(req: IncomingMessage, options?: JsonBodyOptions<T>): Promise<T>;
export declare function readFormBody(req: IncomingMessage, options?: BodyParseOptions): Promise<URLSearchParams>;
export declare function readMultipartBody(req: IncomingMessage, options?: BodyParseOptions): Promise<MultipartForm>;
//# sourceMappingURL=index.d.mts.map