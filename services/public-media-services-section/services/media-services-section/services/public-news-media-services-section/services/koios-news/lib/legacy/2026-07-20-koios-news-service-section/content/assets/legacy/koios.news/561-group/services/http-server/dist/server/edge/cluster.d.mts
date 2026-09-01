import type { App, StartResult } from "../types.mjs";
export type ClusterOptions = {
    workers?: number;
    restartDelay?: number;
    gracefulTimeoutMs?: number;
    onWorkerStart?: (pid: number) => void;
    onWorkerExit?: (pid: number, code: number | null, signal: string | null) => void;
};
export declare function clusterStart(app: App, port: number, startFn: (app: App, port: number) => Promise<StartResult>, opts?: ClusterOptions): Promise<StartResult | null>;
//# sourceMappingURL=cluster.d.mts.map