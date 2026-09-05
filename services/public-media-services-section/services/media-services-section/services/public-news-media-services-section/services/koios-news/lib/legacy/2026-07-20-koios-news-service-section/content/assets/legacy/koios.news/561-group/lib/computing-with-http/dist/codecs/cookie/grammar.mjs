// grammar.mts — the shared token grammar of the cookie representations.
//
// RFC 6265: a cookie name is an HTTP token; a cookie value (and the
// attribute values we emit) is restricted to the cookie-octet range.
const NAME_RE = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
const FIELD_VALUE_RE = /^[\u0021\u0023-\u002B\u002D-\u003A\u003C-\u005B\u005D-\u007E]*$/;
export const isCookieName = (name) => NAME_RE.test(name);
export function assertCookieName(name) {
    if (!isCookieName(name))
        throw new TypeError(`invalid cookie name: ${JSON.stringify(name)}`);
}
export const isFieldValue = (value) => FIELD_VALUE_RE.test(value);
/** The default value decoding: percent-decoding, with the raw text kept when it does not decode. */
export function decodeCookieValue(value) {
    try {
        return decodeURIComponent(value);
    }
    catch {
        return value;
    }
}
//# sourceMappingURL=grammar.mjs.map