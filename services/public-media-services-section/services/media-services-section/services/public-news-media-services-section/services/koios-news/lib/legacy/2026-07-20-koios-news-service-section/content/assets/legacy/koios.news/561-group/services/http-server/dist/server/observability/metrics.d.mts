import type { Context, Middleware, Resource } from "../types.mjs";
export declare const DEFAULT_BUCKETS: number[];
type LabelSet = Record<string, string | number | boolean | null | undefined>;
type PickedLabels = Record<string, string>;
type CounterFamily = {
    name: string;
    type: "counter";
    help: string;
    labelNames: string[];
    series: Map<string, {
        labels: PickedLabels;
        value: number;
    }>;
};
type GaugeFamily = {
    name: string;
    type: "gauge";
    help: string;
    labelNames: string[];
    series: Map<string, {
        labels: PickedLabels;
        value: number;
    }>;
};
type HistogramFamily = {
    name: string;
    type: "histogram";
    help: string;
    labelNames: string[];
    buckets: number[];
    series: Map<string, {
        labels: PickedLabels;
        counts: number[];
        sum: number;
        count: number;
    }>;
};
type MetricFamily = CounterFamily | GaugeFamily | HistogramFamily;
export declare class Counter {
    family: CounterFamily;
    constructor(family: CounterFamily);
    get name(): string;
    get help(): string;
    get labelNames(): string[];
    inc(labels?: LabelSet, delta?: number): void;
    get(labels?: LabelSet): number;
    collect(): string;
}
export declare class Gauge {
    family: GaugeFamily;
    constructor(family: GaugeFamily);
    get name(): string;
    get help(): string;
    get labelNames(): string[];
    private at;
    set(labels: LabelSet | undefined, value: number): void;
    inc(labels?: LabelSet, delta?: number): void;
    dec(labels?: LabelSet, delta?: number): void;
    get(labels?: LabelSet): number;
    collect(): string;
}
export declare class Histogram {
    family: HistogramFamily;
    constructor(family: HistogramFamily);
    get name(): string;
    get help(): string;
    get labelNames(): string[];
    private at;
    observe(labels: LabelSet | undefined, value: number): void;
    get(labels?: LabelSet): {
        labels: PickedLabels;
        counts: number[];
        sum: number;
        count: number;
    } | undefined;
    collect(): string;
}
export declare class MetricsRegistry {
    readonly families: Map<string, MetricFamily>;
    readonly render: (() => string) & {
        contentType: string;
    };
    constructor();
    registerFamily(name: string, type: MetricFamily["type"], help: string, labelNames?: string[], buckets?: number[]): MetricFamily;
    counter(name: string, help: string, labelNames?: string[]): Counter;
    gauge(name: string, help: string, labelNames?: string[]): Gauge;
    histogram(name: string, help: string, labelNames?: string[], buckets?: number[]): Histogram;
    collect(): string;
    reset(): void;
    scrapeHandler(): (ctx: Context) => Promise<void>;
}
export declare function registry(): MetricsRegistry;
export declare function normalizeRoute(ctx?: Partial<Context> & Record<string, unknown>, req?: {
    url?: string | undefined;
}): string;
type ResponseInfo = Context | {
    req?: Context["req"];
    res?: Context["res"];
    ctx?: Partial<Context> & Record<string, unknown>;
    status?: number;
    ms?: number;
};
export type OtelSpan = {
    name: string;
    traceId: string;
    spanId: string;
    parentSpanId?: string;
    kind: string;
    startTimeUnixNano: string;
    endTimeUnixNano: string;
    durationNanos: string;
    attributes: Record<string, unknown>;
    status: unknown;
};
export declare function span({ name, attrs, kind, traceId, parentSpanId, exporter, }?: {
    name?: string;
    attrs?: Record<string, unknown>;
    kind?: string;
    traceId?: string;
    parentSpanId?: string;
    exporter?: (span: OtelSpan) => void;
}): {
    spanId: string;
    traceId: string;
    setAttribute(key: string, value: unknown): void;
    setStatus(status: unknown): void;
    end(endAttrs?: Record<string, unknown>): OtelSpan | null;
};
export type MetricsOptions = {
    registry?: MetricsRegistry;
    buckets?: number[];
    exporter?: (span: OtelSpan) => void;
};
export declare function metrics(options?: MetricsOptions): {
    registry: MetricsRegistry;
    middleware: Middleware;
    onResponse(info: ResponseInfo): void;
    resource: Resource;
    span(options?: Parameters<typeof span>[0]): ReturnType<typeof span>;
};
export type RequestMetricsOptions = {
    registry: MetricsRegistry;
    labelFn?: (ctx: Context) => LabelSet;
};
export declare function requestMetrics(opts: RequestMetricsOptions): Middleware;
export {};
//# sourceMappingURL=metrics.d.mts.map