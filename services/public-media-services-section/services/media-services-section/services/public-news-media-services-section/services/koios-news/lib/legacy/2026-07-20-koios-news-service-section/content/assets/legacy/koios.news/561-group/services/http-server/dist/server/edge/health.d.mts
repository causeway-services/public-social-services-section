import type { Context, Resource } from "../types.mjs";
import type { GracefulShutdownHandle } from "../server.mjs";
export type HealthStatus = "pass" | "warn" | "fail";
export type HealthCheckResult = boolean | HealthStatus | {
    status?: HealthStatus;
    ok?: boolean;
    detail?: string;
    evidence?: readonly string[];
    data?: unknown;
};
export type HealthCheck = {
    name: string;
    check: (ctx: Context) => HealthCheckResult | Promise<HealthCheckResult>;
};
export type HealthResourceOptions = {
    match?: string;
    id?: string;
    name?: string;
    checks?: readonly HealthCheck[];
    now?: () => Date;
};
export type HealthResourcesOptions = {
    healthPath?: string | false;
    livePath?: string | false;
    readyPath?: string | false;
    startupPath?: string | false;
    health?: readonly HealthCheck[];
    live?: readonly HealthCheck[];
    ready?: readonly HealthCheck[];
    startup?: readonly HealthCheck[];
    now?: () => Date;
};
export type ShutdownReadinessCheckOptions = {
    name?: string;
};
export type TransferCodingHealthCheckOptions = {
    name?: string;
};
export declare function healthResource(options?: HealthResourceOptions): Resource;
export declare function healthResources(options?: HealthResourcesOptions): Resource[];
export declare function shutdownReadinessCheck(shutdown: GracefulShutdownHandle, options?: ShutdownReadinessCheckOptions): HealthCheck;
export declare function transferCodingHealthCheck(options?: TransferCodingHealthCheckOptions): HealthCheck;
//# sourceMappingURL=health.d.mts.map