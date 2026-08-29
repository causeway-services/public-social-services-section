import { applySecurityHeaders } from "../http.mjs";
export function securityHeaders(policy = true) {
    return (ctx) => {
        applySecurityHeaders(ctx.res, policy);
    };
}
export const helmet = securityHeaders;
//# sourceMappingURL=security.mjs.map