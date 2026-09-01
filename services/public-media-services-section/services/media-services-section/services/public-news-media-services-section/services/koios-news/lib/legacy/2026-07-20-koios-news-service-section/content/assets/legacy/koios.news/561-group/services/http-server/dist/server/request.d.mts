import type { IncomingMessage } from "node:http";
import { mark, type ChargeValueName, type UtteranceCarrier } from "@emsenn/relating";
export type RequestTraceEntry = Readonly<{
    e: unknown;
    a: string;
    v: unknown;
    t: unknown;
}>;
export type RequestTrace = Readonly<{
    kind: "web-server.request-trace";
    id: string;
    entries: readonly RequestTraceEntry[];
}>;
export type RequestAdmissionJudgment = Readonly<{
    name: string;
    value: ChargeValueName;
    reason: string;
    path: string;
}>;
export type TraceEntry = Readonly<{
    subject: ReturnType<typeof mark>;
    predicate: ReturnType<typeof mark>;
    object: ReturnType<typeof mark>;
    provenance: unknown;
}>;
export type JudgmentSettlement = Readonly<{
    kind: "animating.trace.judgment-settlement";
    value: ChargeValueName;
    judgments: readonly RequestAdmissionJudgment[];
    stableJudgments: readonly RequestAdmissionJudgment[];
}>;
export type RequestTraceSettlement = Readonly<{
    kind: "web-server.request-settlement";
    trace: RequestTrace;
    value: ChargeValueName;
    ready: boolean;
    denied: boolean;
    contradicted: boolean;
    unsettled: boolean;
    judgments: readonly RequestAdmissionJudgment[];
    settlement: JudgmentSettlement;
    utterances: readonly UtteranceCarrier[];
    section: Readonly<{
        contradicted: readonly RequestAdmissionJudgment[];
    }>;
}>;
/** Convert an IncomingMessage to a RequestTrace. The trace id becomes the request identity. */
export declare function traceRequest(req: IncomingMessage): RequestTrace;
/** Read the most recent value of a claim from a request trace. */
export declare function claimOf(trace: RequestTrace, claim: string): string | null;
/** Read all values of a claim (e.g. multiple "middleware.tag" entries). */
export declare function allClaims(trace: RequestTrace, claim: string): string[];
/** Append trace entries to a request trace (returns a new trace). */
export declare function appendEntries(trace: RequestTrace, entries: readonly RequestTraceEntry[]): RequestTrace;
export declare function settleRequestTrace(trace: RequestTrace, judgments: readonly RequestAdmissionJudgment[]): RequestTraceSettlement;
//# sourceMappingURL=request.d.mts.map