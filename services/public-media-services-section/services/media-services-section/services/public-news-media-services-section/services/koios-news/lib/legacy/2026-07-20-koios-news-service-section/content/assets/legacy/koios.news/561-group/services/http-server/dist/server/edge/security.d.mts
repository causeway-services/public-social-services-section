import type { Middleware, SecurityHeaders } from "../types.mjs";
export type SecurityHeadersMiddlewareOptions = SecurityHeaders | true;
export declare function securityHeaders(policy?: SecurityHeadersMiddlewareOptions): Middleware;
export declare const helmet: typeof securityHeaders;
//# sourceMappingURL=security.d.mts.map