import type { Middleware, Resource } from "../types.mjs";
import { type RequestAdmissionJudgment, type RequestTrace, type RequestTraceSettlement } from "../request.mjs";
import type { JsonSchema, OpenApiMetadata } from "./openapi.mjs";
export type ValidationIssue = Readonly<{
    path: string;
    keyword: string;
    message: string;
}>;
export type ValidationResult = Readonly<{
    valid: boolean;
    issues: readonly ValidationIssue[];
}>;
export type RequestValidationSpec = Readonly<{
    params?: JsonSchema;
    query?: JsonSchema;
    headers?: JsonSchema;
    body?: JsonSchema;
    contentType?: string | readonly string[];
    maxBytes?: number;
}>;
export type ValidatedRequest = Readonly<{
    params?: unknown;
    query?: unknown;
    headers?: unknown;
    body?: unknown;
}>;
export type ValidatedResource = Resource & Readonly<{
    validation?: RequestValidationSpec;
}>;
export type RequestValidationArea = keyof ValidatedRequest | "contentType";
export type RequestValidationInput = Readonly<{
    trace: RequestTrace;
    spec: RequestValidationSpec;
    values: ValidatedRequest;
    contentType?: string;
}>;
export type RequestValidationReport = Readonly<{
    trace: RequestTrace;
    settled: RequestTraceSettlement;
    judgments: readonly RequestAdmissionJudgment[];
    valid: boolean;
    invalidArea: RequestValidationArea | null;
    issues: readonly ValidationIssue[];
    validated?: ValidatedRequest;
}>;
export type ResponseValidationContract = Readonly<{
    description?: string;
    body?: JsonSchema;
    headers?: JsonSchema;
    contentType?: string | readonly string[];
}>;
export type ResponseValidationSpec = Readonly<Record<string | number, ResponseValidationContract>>;
export type ObservedResponse = Readonly<{
    status: number;
    headers?: Readonly<Record<string, string>>;
    body?: unknown;
    contentType?: string;
}>;
export type ResponseValidationArea = "status" | "headers" | "body" | "contentType";
export type ResponseValidationInput = Readonly<{
    trace: RequestTrace;
    spec: ResponseValidationSpec;
    response: ObservedResponse;
}>;
export type ResponseValidationReport = Readonly<{
    trace: RequestTrace;
    settled: RequestTraceSettlement;
    judgments: readonly RequestAdmissionJudgment[];
    valid: boolean;
    invalidArea: ResponseValidationArea | null;
    issues: readonly ValidationIssue[];
    contract?: ResponseValidationContract;
}>;
export declare function validateJsonSchema(value: unknown, schema: JsonSchema): ValidationResult;
export declare function requestValidationJudgments(input: RequestValidationInput): readonly RequestAdmissionJudgment[];
export declare function requestValidationReport(input: RequestValidationInput): RequestValidationReport;
export declare function responseValidationJudgments(input: ResponseValidationInput): readonly RequestAdmissionJudgment[];
export declare function responseValidationReport(input: ResponseValidationInput): ResponseValidationReport;
export declare function requestValidation(spec: RequestValidationSpec): Middleware;
export declare function validationOpenApiMetadata(spec: RequestValidationSpec): OpenApiMetadata;
export declare function responseValidationOpenApiMetadata(spec: ResponseValidationSpec): OpenApiMetadata;
export declare function validatedResource(resource: Resource, validation: RequestValidationSpec, operation?: OpenApiMetadata | Readonly<Record<string, OpenApiMetadata>>): ValidatedResource;
//# sourceMappingURL=validation.d.mts.map