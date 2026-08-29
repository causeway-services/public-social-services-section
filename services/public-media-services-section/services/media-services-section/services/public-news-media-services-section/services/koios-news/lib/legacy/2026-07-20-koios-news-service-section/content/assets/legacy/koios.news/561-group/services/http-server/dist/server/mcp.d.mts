import { type Json, type McpServerInfo, type McpTool, type McpToolAnnotations } from "@emsenn/computing-with-http/codecs/mcp";
import type { App, Context } from "./types.mjs";
export declare const DEFAULT_PROTOCOL_VERSION = "2025-06-18";
export type { Json, McpTool, McpToolAnnotations, };
/** Request-scoped metadata handed to a dispatch alongside the tool call. The
 *  `bearer` is the verified access token (when the request carried one), so a
 *  tool can resolve WHO is calling — e.g. to key per-user state. Absent on
 *  loopback requests, which bypass the bearer gate. */
export type McpRequestMeta = Readonly<{
    bearer?: string;
}>;
export type McpDispatch = (name: string, args: Readonly<Record<string, unknown>>, meta?: McpRequestMeta) => unknown | Promise<unknown>;
export type McpAuth = Readonly<{
    verify: (bearer: string) => boolean;
    realm: string;
    resourceMetadataUrl: string;
}>;
export type McpOriginPolicy = readonly (string | RegExp)[] | ((origin: string, ctx: Context) => boolean);
export type McpAppOptions = Readonly<{
    path?: string;
    serverInfo: McpServerInfo;
    protocolVersion?: string;
    acceptedProtocolVersions?: readonly string[];
    instructions?: string;
    tools: readonly McpTool[];
    dispatch: McpDispatch;
    auth?: McpAuth;
    allowedOrigins?: McpOriginPolicy;
    maxBodyBytes?: number;
    toolsPageSize?: number;
}>;
export type McpApp = Readonly<{
    app: App;
}>;
export declare function createMcpApp(options: McpAppOptions): McpApp;
//# sourceMappingURL=mcp.d.mts.map