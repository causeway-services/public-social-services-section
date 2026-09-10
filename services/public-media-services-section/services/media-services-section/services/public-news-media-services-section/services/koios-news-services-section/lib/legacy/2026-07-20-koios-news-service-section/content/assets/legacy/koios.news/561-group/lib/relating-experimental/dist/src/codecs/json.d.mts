/**
 * codecs/json — the JSON representation boundary.
 *
 * JSON is the wire form for everything passed *between* scripts. This codec
 * witnesses JSON membership, canonicalizes (object keys sorted, stable bytes so
 * idempotence is detectable across a pipe), and projects JSON-line documents.
 * Free data enters or leaves only through here; core code works over carriers.
 */
import { type Projector } from "../holography/index.mjs";
/** A JSON value: the closed universe of JSON. */
export type JsonValue = null | boolean | number | string | readonly JsonValue[] | {
    readonly [key: string]: JsonValue;
};
/** A JSON object. */
export type JsonRecord = {
    readonly [key: string]: JsonValue;
};
/** Whether a value inhabits the JSON universe (finite numbers only, plain objects). */
export declare function isJsonValue(value: unknown): value is JsonValue;
/** Whether a value is a JSON object (not null, not an array). */
export declare function isJsonRecord(value: unknown): value is JsonRecord;
/** Witness a value as JSON or throw — the free-data gate. */
export declare function requireJsonValue(value: unknown, context: string): JsonValue;
/** Parse JSON text and witness the result as a JSON value. */
export declare function parse(text: string): JsonValue;
/** Witness an arbitrary runtime value as a JSON resource by round-tripping it
 *  through JSON and checking membership. The boundary gate for carriers (frozen
 *  class instances, etc.) whose enumerable shape is JSON. */
export declare function jsonResource(value: unknown, context?: string): JsonValue;
/** The canonical serialization of a JSON value: object keys sorted, stable bytes. */
export declare function canonical(value: JsonValue): string;
/** The non-blank lines of a document. */
export declare const nonBlankLines: (content: string) => string[];
/** Parse newline-delimited JSON, skipping blank lines; each line witnessed. */
export declare function parseLines(content: string): JsonValue[];
/** Serialize values as newline-delimited canonical JSON (trailing newline). */
export declare function serializeLines(values: readonly JsonValue[]): string;
/** The JSON projector: recognizes any content that parses as JSON; reads it as a
 *  single carried value; writes one canonical document. */
export declare const jsonProjector: Projector<JsonValue>;
/** The JSON-lines projector: a restriction reading each line as a carried value. */
export declare const jsonlProjector: Projector<JsonValue>;
//# sourceMappingURL=json.d.mts.map