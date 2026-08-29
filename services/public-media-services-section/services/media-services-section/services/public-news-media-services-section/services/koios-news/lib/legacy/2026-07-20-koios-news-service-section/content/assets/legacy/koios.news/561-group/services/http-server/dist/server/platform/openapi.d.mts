import type { App, Resource } from "../types.mjs";
import { type RequestValidationSpec } from "./validation.mjs";
export type JsonSchema = boolean | Readonly<Record<string, unknown>>;
export type OpenApiParameter = Readonly<{
    name: string;
    in: "query" | "header" | "path" | "cookie";
    required?: boolean;
    description?: string;
    schema?: JsonSchema;
}>;
export type OpenApiMediaType = Readonly<{
    schema?: JsonSchema;
    examples?: Readonly<Record<string, unknown>>;
    example?: unknown;
}>;
export type OpenApiResponse = Readonly<{
    description: string;
    headers?: Readonly<Record<string, unknown>>;
    content?: Readonly<Record<string, OpenApiMediaType>>;
}>;
export type OpenApiResponses = Readonly<Record<string, OpenApiResponse>>;
export type OpenApiOperation = Readonly<{
    operationId?: string;
    summary?: string;
    description?: string;
    tags?: readonly string[];
    parameters?: readonly OpenApiParameter[];
    requestBody?: unknown;
    responses: OpenApiResponses;
    security?: readonly unknown[];
    deprecated?: boolean;
    readonly [extension: `x-${string}`]: unknown;
}>;
export type OpenApiMetadata = Readonly<Omit<OpenApiOperation, "responses"> & {
    responses?: OpenApiResponses;
    hide?: boolean;
}>;
export type OpenApiResource = Resource & Readonly<{
    openapi?: OpenApiMetadata | Readonly<Record<string, OpenApiMetadata>> | false;
    validation?: RequestValidationSpec;
}>;
export type OpenApiRoute = Readonly<{
    path: string;
    methods: readonly string[];
    operation: OpenApiMetadata | Readonly<Record<string, OpenApiMetadata>>;
    produces?: readonly string[];
    languages?: readonly string[];
    validation?: RequestValidationSpec;
}>;
export type OpenApiDocumentOptions = Readonly<{
    title: string;
    version?: string;
    description?: string;
    servers?: readonly Readonly<{
        url: string;
        description?: string;
    }>[];
    components?: Readonly<Record<string, unknown>>;
    webhooks?: Readonly<Record<string, unknown>>;
}>;
export type OpenApiDocument = Readonly<{
    openapi: "3.1.1";
    info: Readonly<{
        title: string;
        version: string;
        description?: string;
    }>;
    servers?: readonly Readonly<{
        url: string;
        description?: string;
    }>[];
    paths: Readonly<Record<string, unknown>>;
    components?: Readonly<Record<string, unknown>>;
    webhooks?: Readonly<Record<string, unknown>>;
}>;
export declare function openApiPath(pattern: string): string;
export declare function pathParameterNames(pattern: string): readonly string[];
export declare function openApiDocument(routes: readonly OpenApiRoute[], options: OpenApiDocumentOptions): OpenApiDocument;
export declare function documentedResource(resource: Resource, operation: OpenApiMetadata | Readonly<Record<string, OpenApiMetadata>>): OpenApiResource;
export declare function openApiRoutesFromApp(app: Pick<App, "resources">): readonly OpenApiRoute[];
export declare function openApiResource(document: OpenApiDocument | (() => OpenApiDocument), path?: string): Resource;
export declare function withOpenApi(app: App, options: OpenApiDocumentOptions & {
    path?: string;
}): App;
//# sourceMappingURL=openapi.d.mts.map