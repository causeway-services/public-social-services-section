import type { Middleware } from "../types.mjs";
import { type ProxyPassOptions } from "./proxy.mjs";
export type UpstreamStrategy = "round-robin" | "least-connections" | "ip-hash";
export type UpstreamPoolOptions = {
    strategy?: UpstreamStrategy;
    cooldownMs?: number;
    proxyOptions?: ProxyPassOptions;
};
export type UpstreamHealth = {
    target: string;
    up: boolean;
    inFlight: number;
    fails: number;
    downUntil: number;
};
export type UpstreamPoolMiddleware = Middleware & {
    targets: string[];
    readonly health: UpstreamHealth[];
};
export declare function upstreamPool(targets: readonly string[], options?: UpstreamPoolOptions): UpstreamPoolMiddleware;
//# sourceMappingURL=upstream.d.mts.map