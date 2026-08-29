// cookies.mts — transport adapters for the cookie codec.
//
// Representation lives in @emsenn/web-codecs-cookie; this module only
// moves the texts on and off node:http req/res objects.
import { assertCookieName, parseCookieHeader, serializeSetCookie, signCookieValue, unsignCookieValue, } from "@emsenn/computing-with-http/codecs/cookie";
export function getCookie(req, name) {
    assertCookieName(name);
    return parseCookieHeader(req.headers.cookie)[name] ?? null;
}
export function setCookie(res, name, value, options = {}) {
    const cookie = serializeSetCookie(name, value, options);
    appendSetCookie(res, cookie);
    return cookie;
}
export function appendSetCookie(res, cookie) {
    const existing = res.getHeader("Set-Cookie");
    if (existing === undefined) {
        res.setHeader("Set-Cookie", cookie);
    }
    else if (Array.isArray(existing)) {
        res.setHeader("Set-Cookie", [...existing.map(String), cookie]);
    }
    else {
        res.setHeader("Set-Cookie", [String(existing), cookie]);
    }
}
export function deleteCookie(res, name, options = {}) {
    return setCookie(res, name, "", {
        ...options,
        expires: new Date(0),
        maxAge: 0,
    });
}
export function setSignedCookie(res, name, value, secret, options = {}) {
    return setCookie(res, name, signCookieValue(value, secret, name), options);
}
export function getSignedCookie(req, name, secret) {
    const value = getCookie(req, name);
    return value === null ? null : unsignCookieValue(value, secret, name);
}
//# sourceMappingURL=cookies.mjs.map