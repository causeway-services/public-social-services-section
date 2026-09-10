/**
 * acting/codecs — the argv-selectable wire vocabulary.
 *
 * A `WireCodec` adapts one boundary document (a string on stdin/stdout) to the
 * carrier an action's morphism consumes and produces. The wire is NOT forced:
 * the articulation family defaults to `string` (a Mark payload is opaque), and
 * everything passed between scripts defaults to `json`; `--in`/`--out` select a
 * codec by name. EAVT is offered as a wire too, but it is primarily the shape of
 * the LOG, not the wire. Each codec is the boundary face of a holography
 * projector; an unknown name is rejected (a finite vocabulary, witnessed).
 */
import { type JsonValue } from "../codecs/json.mjs";
/** A wire codec: decode a boundary document into a carrier, encode it back. */
export interface WireCodec {
    readonly name: string;
    readonly mediaType: string;
    decode(document: string): JsonValue;
    encode(value: JsonValue): string;
}
/** The plain-string wire: identity on the boundary document. */
export declare const stringCodec: WireCodec;
/** The JSON wire: the canonical resource form passed between scripts. */
export declare const jsonCodec: WireCodec;
/** The EAVT wire: the carrier is the array of witnessed records. */
export declare const eavtCodec: WireCodec;
/** The form wire: `application/x-www-form-urlencoded` decoded to a flat object.
 *  This is the encoding behind an HTTP query string and a web form — another
 *  representation of a record carrier (e.g. `token=foo&claim=bar` ↔ {token,claim}),
 *  not a second ontology. Repeated keys keep the last value; nesting is not a
 *  form concern (compose with `json` for structure). */
export declare const formCodec: WireCodec;
/** The available wire codec names — the finite vocabulary. */
export declare const WIRE_CODEC_NAMES: readonly string[];
/** Resolve a wire codec by name, or throw — the vocabulary witness. */
export declare function wireCodec(name: string): WireCodec;
//# sourceMappingURL=codecs.d.mts.map