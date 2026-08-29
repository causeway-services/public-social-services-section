export declare const DEFAULT_MCP_PROTOCOL_VERSION = "2025-06-18";
export declare const MCP_JSON_TYPE = "application/json";
export type JsonObject = {
    readonly [key: string]: Json;
};
export type Json = null | boolean | number | string | readonly Json[] | JsonObject;
export type McpToolAnnotations = Readonly<{
    readOnlyHint?: boolean;
    openWorldHint?: boolean;
    destructiveHint?: boolean;
    idempotentHint?: boolean;
    title?: string;
}>;
export type McpTool = Readonly<{
    name: string;
    title?: string;
    description?: string;
    inputSchema?: Readonly<Record<string, unknown>>;
    outputSchema?: Readonly<Record<string, unknown>>;
    annotations?: McpToolAnnotations;
}>;
export type McpServerInfo = Readonly<{
    name: string;
    version: string;
}>;
export type McpToolsCapability = Readonly<{
    listChanged: boolean;
}>;
export type McpCapabilities = Readonly<{
    tools: McpToolsCapability;
}>;
export type McpInitializeResult = Readonly<{
    protocolVersion: string;
    capabilities: McpCapabilities;
    serverInfo: McpServerInfo;
    instructions?: string;
}>;
export type McpReachability = Readonly<{
    status: "ok";
    transport: "mcp";
    protocol: "streamable_http";
    serverInfo: McpServerInfo;
    capabilities: McpCapabilities;
    tools: readonly string[];
}>;
export type McpToolCallResult = Readonly<{
    content: readonly [Readonly<{
        type: "text";
        text: string;
    }>];
    structuredContent?: JsonObject;
    isError?: true;
}>;
export type McpToolsListResult = Readonly<{
    tools: readonly McpTool[];
    nextCursor?: string;
}>;
export type JsonRpcId = string | number | null | undefined;
export type JsonRpcRequest = Readonly<{
    jsonrpc?: "2.0";
    id?: JsonRpcId;
    method?: string;
    params?: Record<string, unknown>;
}>;
export type JsonRpcSuccess = Readonly<{
    jsonrpc: "2.0";
    id: string | number | null;
    result: unknown;
}>;
export type JsonRpcFailure = Readonly<{
    jsonrpc: "2.0";
    id: string | number | null;
    error: Readonly<{
        code: number;
        message: string;
    }>;
}>;
export type JsonRpcEnvelope = JsonRpcSuccess | JsonRpcFailure;
export declare function mcpOk(id: JsonRpcId, result: unknown): JsonRpcSuccess;
export declare function mcpRpcError(id: JsonRpcId, code: number, message: string): JsonRpcFailure;
export declare function mcpInitializeResult(options: {
    serverInfo: McpServerInfo;
    protocolVersion?: string;
    instructions?: string;
}): McpInitializeResult;
export declare function mcpReachability(serverInfo: McpServerInfo, tools: readonly McpTool[]): McpReachability;
export declare function mcpToolsListResult(tools: readonly McpTool[], nextCursor?: string): McpToolsListResult;
export declare function mcpToolTextResult(value: unknown): McpToolCallResult;
export declare function mcpToolStructuredResult(value: JsonObject): McpToolCallResult;
export declare function mcpToolTextError(error: unknown): McpToolCallResult;
//# sourceMappingURL=index.d.mts.map