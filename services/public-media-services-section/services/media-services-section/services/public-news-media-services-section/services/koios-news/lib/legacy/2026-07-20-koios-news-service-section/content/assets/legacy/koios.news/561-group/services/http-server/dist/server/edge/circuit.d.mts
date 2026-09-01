import type { Middleware } from "../types.mjs";
export type CircuitBreakerOptions = {
    threshold?: number;
    failureThreshold?: number;
    windowMs?: number;
    resetMs?: number;
    coolDownMs?: number;
    halfOpenRequests?: number;
    halfOpenMax?: number;
    successThreshold?: number;
    keyBy?: (ctx: Parameters<Middleware>[0]) => string;
    onOpen?: (key: string) => void;
    onClose?: (key: string) => void;
    onHalfOpen?: (key: string) => void;
    statusCode?: number;
    message?: string;
    isFailure?: (outcome: {
        ctx: Parameters<Middleware>[0];
        error: unknown;
        status: number | null;
        committed: boolean;
    }) => boolean;
};
export type CircuitBreakerMiddleware = Middleware & {
    readonly state: "closed" | "open" | "half-open";
    readonly stats: {
        state: "closed" | "open" | "half-open";
        failures: number;
        successes: number;
        openedAt: number;
        nextProbeAt: number;
        halfOpenInFlight: number;
    };
    reset(): void;
};
export declare function circuitBreaker(opts?: CircuitBreakerOptions): Middleware;
export declare function circuitBreaker(inner: Middleware, opts?: CircuitBreakerOptions): CircuitBreakerMiddleware;
//# sourceMappingURL=circuit.d.mts.map