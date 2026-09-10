/**
 * codecs/turtle — the Turtle/IRI term writers.
 *
 * `iriRef` writes an IRI reference `<...>` (percent-encoding the delimiters a
 * Turtle IRIREF forbids); `turtleLiteral` writes a quoted literal with Turtle
 * escaping (finite numbers and booleans pass through bare). Pure string
 * functions — the RDF primitives any linked-data vocabulary downstream reuses.
 */
import { type JsonValue } from "./json.mjs";
/** Write an IRI as a Turtle IRIREF `<...>`. */
export declare function iriRef(iri: string): string;
/** Write a value as a Turtle literal. */
export declare function turtleLiteral(value: JsonValue): string;
//# sourceMappingURL=turtle.d.mts.map