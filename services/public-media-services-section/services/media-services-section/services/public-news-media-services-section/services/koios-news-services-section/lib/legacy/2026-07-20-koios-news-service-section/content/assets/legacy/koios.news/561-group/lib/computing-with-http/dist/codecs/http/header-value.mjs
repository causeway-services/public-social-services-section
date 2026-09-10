// header-value.mts — the shape a field value arrives in, and the
// parameterized-value grammar shared by Content-Type, Content-Disposition,
// and friends (RFC 9110 §5.6.6 parameters; quoted-string §5.6.4).
/** First line of a possibly repeated field. */
export function firstHeader(value) {
    return Array.isArray(value) ? value[0] : value;
}
/** All lines of a possibly repeated field, joined as one comma list. */
export function joinedHeader(value) {
    return Array.isArray(value) ? value.join(",") : value == null ? "" : String(value);
}
/**
 * Split a parameterized field value on unquoted semicolons. Quoted
 * strings (with backslash escapes) are honored; the pieces come back
 * trimmed with empties dropped.
 */
export function splitHeaderParameters(value) {
    const out = [];
    let current = "";
    let quoted = false;
    let escaped = false;
    for (const char of value) {
        if (escaped) {
            current += char;
            escaped = false;
            continue;
        }
        if (char === "\\" && quoted) {
            current += char;
            escaped = true;
            continue;
        }
        if (char === "\"")
            quoted = !quoted;
        if (char === ";" && !quoted) {
            out.push(current);
            current = "";
            continue;
        }
        current += char;
    }
    out.push(current);
    return out.map((part) => part.trim()).filter(Boolean);
}
/**
 * Remove quoted-string framing and backslash escapes. Retraction:
 * unquoteHeaderValue ∘ quoteHeaderValue = id, but bare tokens pass
 * through unchanged, so distinct wire forms share a semantic value.
 */
export function unquoteHeaderValue(value) {
    if (value.length >= 2 && value.startsWith("\"") && value.endsWith("\"")) {
        return value.slice(1, -1).replace(/\\(["\\])/g, "$1");
    }
    return value;
}
/** Frame a value as a quoted-string, escaping quotes and backslashes. */
export function quoteHeaderValue(value) {
    return `"${value.replace(/([\\"])/g, "\\$1")}"`;
}
/**
 * Parse a comma-separated directive list (Cache-Control,
 * Surrogate-Control, and friends): each item is a token, or
 * token=argument with an optionally quoted argument. Valueless
 * directives map to true; names are lowercased.
 */
export function parseDirectiveList(value) {
    const directives = {};
    for (const part of joinedHeader(value).split(",")) {
        const item = part.trim();
        if (!item)
            continue;
        const eq = item.indexOf("=");
        if (eq === -1) {
            directives[item.toLowerCase()] = true;
        }
        else {
            directives[item.slice(0, eq).trim().toLowerCase()] = item.slice(eq + 1).trim().replace(/^"(.*)"$/, "$1");
        }
    }
    return directives;
}
//# sourceMappingURL=header-value.mjs.map