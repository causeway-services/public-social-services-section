import type { Resource } from "./types.mjs";
import { type RequestAdmissionJudgment, type RequestTrace, type RequestTraceSettlement } from "./request.mjs";
export type RouteAdmissionResource = Pick<Resource, "methods" | "produces" | "languages"> | null;
export type RouteAdmissionDenial = "route" | "method" | "accept" | "accept-language" | null;
export type RouteAdmissionInput = Readonly<{
    trace: RequestTrace;
    resource: RouteAdmissionResource;
    method: string;
    accept?: string;
    acceptLanguage?: string;
}>;
export type RouteAdmissionReport = Readonly<{
    trace: RequestTrace;
    settled: RequestTraceSettlement;
    judgments: readonly RequestAdmissionJudgment[];
    denial: RouteAdmissionDenial;
    allow: string | null;
    negotiatedType?: string;
    negotiatedLanguage?: string;
}>;
export declare function routeAllowedMethods(resource: RouteAdmissionResource): readonly string[] | null;
export declare function routeAllowHeader(resource: RouteAdmissionResource): string | null;
export declare function routeMethodAllowed(resource: RouteAdmissionResource, method: string): boolean;
export declare function routeAdmissionJudgments(input: RouteAdmissionInput): {
    judgments: readonly RequestAdmissionJudgment[];
    denial: RouteAdmissionDenial;
    allow: string | null;
    negotiatedType?: string;
    negotiatedLanguage?: string;
};
export declare function routeAdmissionReport(input: RouteAdmissionInput): RouteAdmissionReport;
//# sourceMappingURL=route-admission.d.mts.map