// conditional.mts — entity tags (RFC 9110 §8.8.3) and the precondition
// evaluators over field values (§13). Each evaluator takes the field
// value as received — never the request object; binding a field to a
// live request is transport.
import { parseHttpDate } from "./date.mjs";
import { firstHeader } from "./header-value.mjs";
/** Parse an If-Match / If-None-Match field value into its entity-tag list. */
export function etagList(value) {
    const raw = Array.isArray(value) ? value.join(",") : String(value);
    return raw.split(",").map((etag) => etag.trim()).filter(Boolean);
}
function stripWeak(etag) {
    return etag.startsWith("W/") ? etag.slice(2) : etag;
}
/** Weak comparison (§8.8.3.2): opaque-tags equal, weakness ignored. */
export function weakEtagMatch(a, b) {
    return stripWeak(a) === stripWeak(b);
}
/** Strong comparison (§8.8.3.2): equal, and neither validator is weak. */
export function strongEtagMatch(a, b) {
    return !a.startsWith("W/") && !b.startsWith("W/") && a === b;
}
/** If-None-Match evaluates true when the precondition FAILS for the given validator (§13.1.2). */
export function ifNoneMatch(value, etag) {
    if (!value)
        return false;
    const candidates = etagList(value);
    return candidates.includes("*") || candidates.some((candidate) => weakEtagMatch(candidate, etag));
}
/** If-Match evaluates true when the precondition HOLDS for the given validator (§13.1.1). */
export function ifMatch(value, etag) {
    if (!value)
        return true;
    const candidates = etagList(value);
    return candidates.includes("*") || candidates.some((candidate) => strongEtagMatch(candidate, etag));
}
/** If-Modified-Since evaluates true when the representation changed after the field date (§13.1.3). */
export function ifModifiedSince(value, lastModified) {
    const raw = firstHeader(value);
    if (!raw)
        return false;
    const date = parseHttpDate(raw);
    return date !== null && lastModified <= date;
}
/** If-Unmodified-Since evaluates true when the precondition HOLDS (§13.1.4). */
export function ifUnmodifiedSince(value, lastModified) {
    const raw = firstHeader(value);
    if (!raw)
        return true;
    const date = parseHttpDate(raw);
    return date === null || lastModified <= date;
}
/** If-Range evaluates true when Range may be honored against the selected representation (§13.1.5). */
export function ifRange(value, current) {
    const raw = firstHeader(value);
    if (!raw)
        return true;
    const token = raw.trim();
    if (!token)
        return true;
    if (token.startsWith("W/"))
        return false;
    if (token.startsWith("\""))
        return current.etag !== undefined && strongEtagMatch(token, current.etag);
    const date = parseHttpDate(token);
    if (date === null)
        return false;
    return current.lastModified !== undefined && current.lastModified <= date;
}
//# sourceMappingURL=conditional.mjs.map