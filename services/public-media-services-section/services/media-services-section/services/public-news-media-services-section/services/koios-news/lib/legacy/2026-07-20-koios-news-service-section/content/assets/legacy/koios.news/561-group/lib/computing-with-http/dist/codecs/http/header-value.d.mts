/** A field value as node:http hands it over: absent, one line, or repeated lines. */
export type HeaderValue = string | readonly string[] | undefined;
/** First line of a possibly repeated field. */
export declare function firstHeader(value: HeaderValue): string | undefined;
/** All lines of a possibly repeated field, joined as one comma list. */
export declare function joinedHeader(value: HeaderValue): string;
/**
 * Split a parameterized field value on unquoted semicolons. Quoted
 * strings (with backslash escapes) are honored; the pieces come back
 * trimmed with empties dropped.
 */
export declare function splitHeaderParameters(value: string): string[];
/**
 * Remove quoted-string framing and backslash escapes. Retraction:
 * unquoteHeaderValue ∘ quoteHeaderValue = id, but bare tokens pass
 * through unchanged, so distinct wire forms share a semantic value.
 */
export declare function unquoteHeaderValue(value: string): string;
/** Frame a value as a quoted-string, escaping quotes and backslashes. */
export declare function quoteHeaderValue(value: string): string;
/**
 * Parse a comma-separated directive list (Cache-Control,
 * Surrogate-Control, and friends): each item is a token, or
 * token=argument with an optionally quoted argument. Valueless
 * directives map to true; names are lowercased.
 */
export declare function parseDirectiveList(value: HeaderValue): Record<string, true | string>;
//# sourceMappingURL=header-value.d.mts.map