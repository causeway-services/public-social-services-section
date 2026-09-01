export type RetryOptions = {
    maxAttempts?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    jitter?: boolean;
    retryOn?: (err: unknown, status?: number) => boolean;
    onRetry?: (attempt: number, err: unknown) => void;
};
export declare function withRetries<T>(fn: () => Promise<T>, opts?: RetryOptions): Promise<T>;
export type OutlierEjectionOptions = {
    /** Consecutive failures before ejecting (default 5). */
    consecutiveThreshold?: number;
    /** Time window for failure-rate ejection (ms, default 60_000). */
    windowMs?: number;
    /** Failure rate (0–1) within window to trigger ejection (default 0.5). */
    failureRateThreshold?: number;
    /** How long before a probing re-admission attempt (ms, default 30_000). */
    ejectMs?: number;
    /** Successful probes before re-admitting fully (default 1). */
    probeSuccesses?: number;
    onEject?: (id: string) => void;
    onReadmit?: (id: string) => void;
};
export declare class OutlierEjector {
    private store;
    private states;
    private opts;
    constructor(opts?: OutlierEjectionOptions);
    private state;
    /** Record the outcome of a request to an upstream. */
    record(id: string, ok: boolean): void;
    /** Settle whether an upstream is currently admissible. */
    isAdmissible(id: string): boolean;
    /** Whether this upstream is in probe mode (half-ejected). */
    isProbing(id: string): boolean;
}
//# sourceMappingURL=retry.d.mts.map