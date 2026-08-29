import type { IncomingMessage, ServerResponse } from "node:http";
import type { CacheControl } from "@emsenn/computing-with-http/codecs/http";
import type { Context, Repr, SecurityHeaders } from "./types.mjs";
export type ProblemDetails = {
    type: string;
    title: string;
    status: number;
    detail?: string;
    instance?: string;
    [key: string]: unknown;
};
export type ProblemResponseOptions = Readonly<{
    headers?: Readonly<Record<string, string>>;
    cacheControl?: CacheControl | string;
    security?: SecurityHeaders | true;
    includeErrorDetail?: boolean;
    includeStack?: boolean;
    instance?: string | ((ctx: Context) => string | undefined);
}>;
export type HttpProblemOptions = Readonly<{
    type?: string;
    detail?: string;
    instance?: string;
    headers?: Readonly<Record<string, string>>;
    extensions?: Readonly<Record<string, unknown>>;
    cause?: unknown;
}>;
export declare class HttpProblem extends Error {
    readonly status: number;
    readonly type: string;
    readonly title: string;
    readonly detail: string | undefined;
    readonly instance: string | undefined;
    readonly headers: Readonly<Record<string, string>>;
    readonly extensions: Readonly<Record<string, unknown>>;
    constructor(status: number, title?: string, options?: HttpProblemOptions);
}
export declare function httpProblem(status: number, title?: string, options?: HttpProblemOptions): HttpProblem;
export declare const problem: typeof httpProblem;
export declare function isHttpProblem(value: unknown): value is HttpProblem;
export declare function problemFromError(error: unknown, options?: ProblemResponseOptions): HttpProblem;
export declare function problemDetails(input: HttpProblem | ProblemDetails): ProblemDetails;
export declare function problemRepr(input: HttpProblem | ProblemDetails, options?: ProblemResponseOptions): Repr;
export declare function sendProblem(req: IncomingMessage, res: ServerResponse, input: HttpProblem | ProblemDetails, options?: ProblemResponseOptions): Promise<void>;
export declare function problemErrorHandler(options?: ProblemResponseOptions): (err: unknown, ctx: Context) => Promise<void>;
export declare function resolveProblemInstance(ctx: Context, options?: ProblemResponseOptions): string | undefined;
export declare function statusTitle(status: number): string;
//# sourceMappingURL=problem.d.mts.map