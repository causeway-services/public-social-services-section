import type { App } from "../types.mjs";
import { type Clock } from "../internal/clock.mjs";
import type { Store } from "../internal/store.mjs";
export type JobHandler = (job: JobRecord) => void | Promise<void>;
export type JobRecord = {
    id: string;
    name: string;
    payload?: unknown;
    scheduledAt: number;
    attempts: number;
};
export type JobOptions = {
    /** Stable durable identifier. Defaults to a generated id, or a previously persisted id for this name. */
    id?: string;
    name: string;
    handler: JobHandler;
    /** Cron expression (5-field: min hour dom mon dow). */
    cron?: string;
    /** Fixed interval in ms. */
    intervalMs?: number;
    /** One-shot delay in ms. */
    delayMs?: number;
    maxAttempts?: number;
    retryDelayMs?: number;
    payload?: unknown;
    onSuccess?: (job: JobRecord) => void;
    onFailure?: (job: JobRecord, err: unknown) => void;
};
export type SchedulerOptions = {
    clock?: Clock;
    store?: Store<ScheduledJobState>;
};
export type ScheduledJobKind = "manual" | "delay" | "interval" | "cron";
export type ScheduledJobState = {
    id: string;
    name: string;
    kind: ScheduledJobKind;
    nextAt: number | null;
    cron?: string;
    intervalMs?: number;
    delayMs?: number;
    payload?: unknown;
    maxAttempts?: number;
    retryDelayMs?: number;
};
export type ParsedCron = {
    minute: Set<number>;
    hour: Set<number>;
    dom: Set<number>;
    month: Set<number>;
    dow: Set<number>;
    domRestricted: boolean;
    dowRestricted: boolean;
};
export declare function parseCron(expr: string): ParsedCron;
export declare function nextRun(expr: string | ParsedCron, afterMs?: number): number | null;
export declare class PlatformScheduler {
    private store;
    private timers;
    private jobs;
    private states;
    private names;
    private readonly clock;
    private readonly persistentStore;
    private persistTail;
    readonly ready: Promise<void>;
    constructor(opts?: SchedulerOptions);
    register(opts: JobOptions): string;
    cancel(id: string): void;
    private validate;
    private loadPersisted;
    private persist;
    private deletePersisted;
    flush(): Promise<void>;
    private kindOf;
    private existingStateFor;
    private sameSchedule;
    private nextAtFor;
    private stateFor;
    private record;
    private clearTimer;
    private setTimer;
    private arm;
    private jobCancelled;
    private retry;
    private rearmAfterRun;
    private run;
    status(id: string): string;
    stop(): void;
    stopAll(): void;
}
export declare function platformScheduler(opts?: SchedulerOptions): PlatformScheduler;
/** Build a /jobs status endpoint resource. */
export declare function schedulerResource(scheduler: PlatformScheduler, jobIds: string[]): NonNullable<App["resources"]>[number];
//# sourceMappingURL=scheduler.d.mts.map