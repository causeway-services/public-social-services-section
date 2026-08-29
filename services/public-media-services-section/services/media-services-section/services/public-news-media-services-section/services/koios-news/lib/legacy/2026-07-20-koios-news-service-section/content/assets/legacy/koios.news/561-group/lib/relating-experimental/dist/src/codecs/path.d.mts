import { type Projector, type Resource } from "../holography/index.mjs";
import { type UtteranceCarrier } from "../articulating/utterance.mjs";
import { type EAVT, type EAVTRecord } from "./eavt.mjs";
import type { JsonValue } from "./json.mjs";
/** An addressable term: a JSON value or a readonly array of JSON path parts. */
export type AddressTerm = JsonValue | readonly JsonValue[];
/** Dehydrate utterance carriers into a JSON-compatible utterance-log carrier. */
export declare function dehydrateUtterances(utterances: readonly UtteranceCarrier[]): JsonValue;
/** Rehydrate a JSON utterance-log carrier into fresh utterance carriers. */
export declare function rehydrateUtterances(value: JsonValue): readonly UtteranceCarrier[];
/** The canonical key for a term: plain strings unchanged (reserved prefixes
 *  escaped), non-strings serialized to stable JSON with sorted keys. */
export declare function termKey(term: JsonValue): string;
/** Encode a string into a single filesystem-safe path segment. */
export declare function sanitizeSegment(value: string): string;
/** Decode a path segment produced by sanitizeSegment back into its string. */
export declare function desanitizeSegment(segmentText: string): string;
/** A term as a single filesystem-safe path segment. */
export declare const segment: (term: JsonValue) => string;
/** The typed filepath for a term under a root. */
export declare function address(root: string, term: AddressTerm, type: string): string;
/** The address of a term's append-only log under a root (the `jsonl` type). */
export declare const logPath: (root: string, term: AddressTerm) => string;
/** The subject and predicate log paths for an EAVT row under a root. */
export declare function eavtLogPaths(root: string, row: EAVT | EAVTRecord): readonly string[];
/** The slash-separated term recovered from a filepath under a root. */
export declare function termOf(root: string, path: string): string;
/** The typed filepath for a term given as already-split parts. */
export declare function addressNested(root: string, parts: JsonValue | readonly JsonValue[], type: string): string;
/** The term parts recovered from a filepath under a root (unjoined). */
export declare function termOfNested(root: string, path: string): string[];
/** A slash-separated term built from a namespace and optional parts. */
export declare function composeTerm(namespace: JsonValue, parts?: JsonValue | readonly JsonValue[]): string;
/** The frozen decomposition of a slash-separated term into namespace and parts. */
export declare function decomposeTerm(term: string): Readonly<{
    readonly namespace: string;
    readonly parts: readonly string[];
}>;
/** The namespace of a slash-separated term: its first segment desanitized. */
export declare function namespaceOf(term: string): string;
/** Whether a term belongs to a namespace (its first segment is that namespace). */
export declare function withinNamespace(term: string, namespace: JsonValue): boolean;
export type PathResource = Resource;
export declare const POSIX_PATHNAME_PATTERN: RegExp;
export declare const isPathname: (value: string) => boolean;
/** A POSIX lexical path is a non-empty string with no NUL byte. */
export declare const validPath: (path: unknown) => path is string;
/** Lexically normalize a path: drop "." and empty segments, resolve "..". */
export declare function normalizePath(path: string): string;
/** The normalized parent path, or null at a root path ("/" or "."). */
export declare function pathParent(path: string): string | null;
/** The final normalized path segment. */
export declare function pathBasename(path: string): string;
/** The point identifier for a normalized POSIX path. */
export declare function pathPoint(path: string): string;
/** The path carried by a path point, or null when not path-shaped. */
export declare function pathOfPoint(point: string): string | null;
/** The root path projector: recognizes POSIX pathnames. */
export declare const pathProjector: Projector<JsonValue>;
//# sourceMappingURL=path.d.mts.map