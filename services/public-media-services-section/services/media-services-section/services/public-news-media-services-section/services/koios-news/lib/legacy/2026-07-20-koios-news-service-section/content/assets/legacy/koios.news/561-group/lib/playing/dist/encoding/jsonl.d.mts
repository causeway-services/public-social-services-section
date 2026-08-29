import type { Json } from "./json.mjs";
/** Serialize a JSON value to a single newline-free line. */
export declare function encodeLine(obj: Json): string;
/** Parse a single JSONL line back to an untyped value; `TypeError` on malformed JSON. */
export declare function decodeLine(s: string): unknown;
/** A tagged, optionally-timestamped persistent log record over a JSON payload. */
export interface LogEntry {
    readonly kind: string;
    readonly at?: string;
    readonly payload: Json;
}
/** Encode a log entry; the `at` key is omitted entirely when no timestamp is given. */
export declare function encodeLogEntry(entry: LogEntry): Json;
/** Decode a log entry from `unknown`; `TypeError` on a bad shape. */
export declare function decodeLogEntry(json: unknown): LogEntry;
//# sourceMappingURL=jsonl.d.mts.map