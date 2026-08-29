// cookie-header.mts — the Cookie request header representation.
//
// Semantic value: a record of cookie names to (decoded) values. Wire
// form: the Cookie header text, "a=1; b=2". The pair is a RETRACTION:
// parseCookieHeader ∘ serializeCookieHeader = id on valid records, while
// the opposite composite normalizes — malformed parts, invalid names,
// and duplicate names (first one wins) are dropped by the parse.
import { assertCookieName, decodeCookieValue, isCookieName, isFieldValue } from "./grammar.mjs";
export function parseCookieHeader(header) {
    if (!header)
        return Object.freeze({});
    const raw = typeof header === "string" ? header : header.join("; ");
    const cookies = {};
    for (const part of raw.split(";")) {
        const trimmed = part.trim();
        if (!trimmed)
            continue;
        const equals = trimmed.indexOf("=");
        if (equals <= 0)
            continue;
        const name = trimmed.slice(0, equals).trim();
        if (!isCookieName(name) || Object.hasOwn(cookies, name))
            continue;
        cookies[name] = decodeCookieValue(trimmed.slice(equals + 1).trim());
    }
    return Object.freeze(cookies);
}
export function serializeCookieHeader(cookies, encode = encodeURIComponent) {
    const parts = [];
    for (const [name, value] of Object.entries(cookies)) {
        assertCookieName(name);
        const encoded = encode(value);
        if (!isFieldValue(encoded)) {
            throw new TypeError(`serializeCookieHeader: encoded value for ${name} contains invalid characters`);
        }
        parts.push(`${name}=${encoded}`);
    }
    return parts.join("; ");
}
//# sourceMappingURL=cookie-header.mjs.map