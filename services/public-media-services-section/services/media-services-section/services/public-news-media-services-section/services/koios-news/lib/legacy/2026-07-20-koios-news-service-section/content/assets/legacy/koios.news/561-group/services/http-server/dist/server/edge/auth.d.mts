import type { Middleware, Context } from "../types.mjs";
import type { ChargeValueName } from "@emsenn/relating";
import { type RequestAdmissionJudgment, type RequestTrace, type RequestTraceEntry, type RequestTraceSettlement } from "../request.mjs";
export type JwtOptions = {
    secret: string | (() => string | Promise<string>);
    algorithms?: string[];
    issuer?: string;
    audience?: string;
    clockSkewMs?: number;
    tokenFrom?: (ctx: Context) => string | undefined;
};
export type BasicAuthOptions = {
    verify: (user: string, pass: string, ctx: Context) => boolean | Promise<boolean>;
    realm?: string;
};
export type BasicAuthMiddlewareOptions = {
    users?: Record<string, string>;
    verify?: (user: string, pass: string, ctx: Context) => boolean | Promise<boolean>;
    realm?: string;
};
export type BearerAuthOptions = {
    verify: (token: string, ctx: Context) => boolean | Record<string, unknown> | Promise<boolean | Record<string, unknown>>;
    realm?: string;
    scope?: string;
};
export type ApiKeyOptions = {
    keys: string[] | Set<string> | ((key: string, ctx: Context) => boolean | Promise<boolean>);
    header?: string;
    query?: string;
};
export type AuthOptions = {
    jwt?: JwtOptions;
    basic?: BasicAuthOptions;
    apiKey?: ApiKeyOptions;
    verify?: (ctx: Context) => boolean | Promise<boolean>;
    onDeny?: (ctx: Context, reason: string) => void | Promise<void>;
    claimsAttribute?: string;
};
export type AuthEvidence = Readonly<{
    source: "jwt" | "basic" | "api-key" | "verify" | "missing";
    admitted: boolean;
    reason?: string;
    claims?: JwtPayload;
}>;
export type AuthAdmissionInput = Readonly<{
    trace: RequestTrace;
    evidence: readonly AuthEvidence[];
    claimsAttribute?: string;
    now?: unknown;
}>;
export type AuthAdmissionReport = Readonly<{
    trace: RequestTrace;
    settled: RequestTraceSettlement;
    judgments: readonly RequestAdmissionJudgment[];
    value: ChargeValueName;
    admitted: boolean;
    denied: boolean;
    contradicted: boolean;
    reason: string;
    claims: JwtPayload | null;
    entries: readonly RequestTraceEntry[];
}>;
type JwtPayload = Record<string, unknown>;
export declare function authAdmissionJudgments(input: AuthAdmissionInput): readonly RequestAdmissionJudgment[];
export declare function authAdmissionReport(input: AuthAdmissionInput): AuthAdmissionReport;
export declare function basicAuth(opts?: BasicAuthMiddlewareOptions): Middleware;
export declare function bearerAuth(opts: BearerAuthOptions): Middleware;
export declare function authenticate(opts?: AuthOptions): Middleware;
export declare function requireClaim(attribute: string, value: string | ((v: string) => boolean), opts?: {
    claimsAttribute?: string;
}): Middleware;
export {};
//# sourceMappingURL=auth.d.mts.map