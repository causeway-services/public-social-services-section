export const DEFAULT_MCP_PROTOCOL_VERSION = "2025-06-18";
export const MCP_JSON_TYPE = "application/json";
const CAPABILITIES = Object.freeze({ tools: Object.freeze({ listChanged: false }) });
function rpcId(id) {
    return id ?? null;
}
export function mcpOk(id, result) {
    return Object.freeze({ jsonrpc: "2.0", id: rpcId(id), result });
}
export function mcpRpcError(id, code, message) {
    return Object.freeze({
        jsonrpc: "2.0",
        id: rpcId(id),
        error: Object.freeze({ code, message }),
    });
}
export function mcpInitializeResult(options) {
    return Object.freeze({
        protocolVersion: options.protocolVersion ?? DEFAULT_MCP_PROTOCOL_VERSION,
        capabilities: CAPABILITIES,
        serverInfo: options.serverInfo,
        ...(options.instructions === undefined ? {} : { instructions: options.instructions }),
    });
}
export function mcpReachability(serverInfo, tools) {
    return Object.freeze({
        status: "ok",
        transport: "mcp",
        protocol: "streamable_http",
        serverInfo,
        capabilities: CAPABILITIES,
        tools: Object.freeze(tools.map((tool) => tool.name)),
    });
}
export function mcpToolsListResult(tools, nextCursor) {
    return Object.freeze({
        tools: Object.freeze([...tools]),
        ...(nextCursor === undefined ? {} : { nextCursor }),
    });
}
export function mcpToolTextResult(value) {
    return Object.freeze({
        content: Object.freeze([{ type: "text", text: JSON.stringify(value, null, 1) }]),
    });
}
export function mcpToolStructuredResult(value) {
    return Object.freeze({
        content: Object.freeze([{ type: "text", text: JSON.stringify(value, null, 1) }]),
        structuredContent: value,
    });
}
export function mcpToolTextError(error) {
    const text = error instanceof Error ? error.message : String(error);
    return Object.freeze({
        content: Object.freeze([{ type: "text", text }]),
        isError: true,
    });
}
//# sourceMappingURL=index.mjs.map