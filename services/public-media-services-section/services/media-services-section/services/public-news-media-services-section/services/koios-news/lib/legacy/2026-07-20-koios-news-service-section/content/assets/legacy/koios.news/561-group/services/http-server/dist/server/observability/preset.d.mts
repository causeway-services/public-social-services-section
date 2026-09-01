import type { App } from "../types.mjs";
import { type AccessLogOptions } from "./access-log.mjs";
import { metrics, type MetricsOptions, type MetricsRegistry, type OtelSpan } from "./metrics.mjs";
import { serverTiming, type CorrelationIdOptions, type ServerTimingSurface, type TraceContextOptions } from "./trace.mjs";
export type ServerTimingOptions = Parameters<typeof serverTiming>[0];
export type ObservabilityMetricsOptions = MetricsOptions & Readonly<{
    /** Mount the Prometheus scrape resource here. Set false to keep metrics internal. */
    path?: string | false;
}>;
export type ObservabilityOptions = Readonly<{
    correlation?: boolean | CorrelationIdOptions;
    trace?: boolean | TraceContextOptions;
    serverTiming?: boolean | ServerTimingOptions;
    metrics?: boolean | ObservabilityMetricsOptions;
    accessLog?: boolean | AccessLogOptions;
}>;
export type ObservabilityPreset = App & {
    metrics?: ReturnType<typeof metrics>;
    registry?: MetricsRegistry;
    serverTiming?: ServerTimingSurface;
    spans?: readonly OtelSpan[];
};
export declare function observability(options?: ObservabilityOptions): ObservabilityPreset;
//# sourceMappingURL=preset.d.mts.map