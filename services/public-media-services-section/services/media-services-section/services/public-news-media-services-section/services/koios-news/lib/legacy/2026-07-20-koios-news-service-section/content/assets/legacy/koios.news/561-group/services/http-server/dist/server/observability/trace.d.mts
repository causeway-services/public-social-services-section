import type { IncomingMessage } from "node:http";
import type { Context, Middleware } from "../types.mjs";
type AnyCtx = Partial<Context> & Record<string | symbol, unknown>;
type AnyReq = Pick<IncomingMessage, "headers" | "method" | "url"> & {
    id?: string;
};
type AnyRes = {
    headersSent?: boolean;
    setHeader(name: string, value: unknown): unknown;
    writeHead?: (...args: unknown[]) => unknown;
    end?: (...args: unknown[]) => unknown;
};
export declare function renderServerTiming(ctx: AnyCtx | undefined): string;
export type ServerTimingContext = {
    start(name: string, desc?: string): () => number;
    end(name: string, desc?: string): number;
    record(name: string, dur?: number, desc?: string): void;
    add(name: string, dur: number, desc?: string): void;
};
export type ServerTimingSurface = {
    middleware: Middleware & ((req: AnyReq, res: AnyRes, ctx: AnyCtx) => false | void);
    start(ctx: AnyCtx, name: string, desc?: string): () => number;
    end(ctx: AnyCtx, name: string, desc?: string): number;
    record(ctx: AnyCtx, name: string, dur?: number, desc?: string): void;
    header(ctx: AnyCtx): string;
    onResponse(info?: {
        req?: AnyReq;
        res?: AnyRes;
        ctx?: AnyCtx;
    } | Context): void;
};
export declare function serverTiming(options?: {
    headerName?: string;
    total?: boolean;
    totalName?: string;
}): ServerTimingSurface;
export type TraceFlags = 0 | 1;
export type TraceCtx = {
    traceId: string;
    spanId: string;
    flags: TraceFlags;
    state?: string;
};
export type ParsedTraceparent = {
    version: string;
    traceId: string;
    parentId: string;
    flags: string;
    sampled: boolean;
};
export type TracestateMember = {
    key: string;
    value: string;
};
export declare function newTraceId(): string;
export declare function newSpanId(): string;
export declare function parseTraceparent(value: unknown): ParsedTraceparent | null;
export declare function formatTraceparent({ traceId, spanId, flags, sampled, }: {
    traceId: string;
    spanId: string;
    flags?: string;
    sampled?: boolean;
}): string;
export declare function parseTracestate(value: unknown): TracestateMember[];
export declare function formatTracestate(members: TracestateMember[] | Record<string, string | number | boolean | undefined>): string;
export type TraceObject = {
    traceId: string;
    spanId: string;
    parentId: string | null;
    sampled: boolean;
    flags: string;
    version: string;
    tracestate: TracestateMember[];
    traceparent(): string;
    propagationHeaders(extra?: Record<string, string>): Record<string, string>;
    child(): {
        traceId: string;
        spanId: string;
        parentId: string;
        sampled: boolean;
        flags: string;
        traceparent(): string;
    };
};
export type TraceContextOptions = {
    trustIncoming?: boolean | ((req: AnyReq, ctx: AnyCtx) => boolean);
    sampler?: (incoming: ParsedTraceparent | null, req: AnyReq, ctx: AnyCtx) => boolean;
    vendor?: string;
    respond?: boolean;
    headerName?: string;
    forceSample?: boolean;
    sampleRate?: number;
    localsKey?: string;
};
export declare function traceObjectOf(ctx: AnyCtx, key?: string | symbol): TraceObject | undefined;
export declare function traceContext(options?: TraceContextOptions): Middleware & ((req: AnyReq, res: AnyRes, ctx: AnyCtx) => false);
export declare function propagationHeaders(tc: TraceCtx | TraceObject): Record<string, string>;
export type SpanAttributes = Record<string, string | number | boolean>;
export type Span = {
    traceId: string;
    spanId: string;
    parentSpanId?: string;
    name: string;
    startMs: number;
    endMs?: number;
    attributes: SpanAttributes;
    status: "unset" | "ok" | "error";
    end(attrs?: SpanAttributes): void;
};
export type SpanExporter = (span: Span) => void;
export type SpanOptions = {
    exporter?: SpanExporter;
    localsKey?: string;
};
export declare function span(name: string, opts?: SpanOptions): Middleware;
export type CorrelationIdOptions = {
    header?: string;
    headerName?: string;
    headerNames?: string[];
    generate?: (req?: AnyReq, ctx?: AnyCtx) => string;
    trustIncoming?: boolean | ((req: AnyReq, ctx: AnyCtx) => boolean);
    trustProxy?: boolean;
    localsKey?: string;
    echo?: boolean;
};
export declare function correlationId(options?: CorrelationIdOptions): Middleware & ((req: AnyReq, res: AnyRes, ctx: AnyCtx) => false);
export {};
//# sourceMappingURL=trace.d.mts.map