export type ClockHandle = ReturnType<typeof setTimeout> | number;
export type Clock = {
    now(): number;
    schedule(atMs: number, fn: () => void): ClockHandle;
    interval(everyMs: number, fn: () => void): ClockHandle;
    cancel(handle: ClockHandle): void;
};
export type ManualClock = Clock & {
    tick(ms: number): number;
    advanceTo(absMs: number): number;
    set(absMs: number): void;
    pending(): number;
};
export declare function realClock(): Clock;
export declare function manualClock(start?: number): ManualClock;
//# sourceMappingURL=clock.d.mts.map