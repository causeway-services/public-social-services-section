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
import { canonical, parse as parseJson, } from "../codecs/json.mjs";
import { parse as parseEavt, serialize as serializeEavt, } from "../codecs/eavt.mjs";
/** The plain-string wire: identity on the boundary document. */
export const stringCodec = Object.freeze({
    name: "string",
    mediaType: "text/plain; charset=utf-8",
    decode: (document) => document,
    encode: (value) => (typeof value === "string" ? value : canonical(value)),
});
/** The JSON wire: the canonical resource form passed between scripts. */
export const jsonCodec = Object.freeze({
    name: "json",
    mediaType: "application/json; charset=utf-8",
    decode: (document) => parseJson(document),
    encode: (value) => `${canonical(value)}\n`,
});
/** The EAVT wire: the carrier is the array of witnessed records. */
export const eavtCodec = Object.freeze({
    name: "eavt",
    mediaType: "application/eavt+jsonl; charset=utf-8",
    decode: (document) => parseEavt(document),
    encode: (value) => serializeEavt((Array.isArray(value) ? value : [value])),
});
/** The form wire: `application/x-www-form-urlencoded` decoded to a flat object.
 *  This is the encoding behind an HTTP query string and a web form — another
 *  representation of a record carrier (e.g. `token=foo&claim=bar` ↔ {token,claim}),
 *  not a second ontology. Repeated keys keep the last value; nesting is not a
 *  form concern (compose with `json` for structure). */
export const formCodec = Object.freeze({
    name: "form",
    mediaType: "application/x-www-form-urlencoded; charset=utf-8",
    decode: (document) => {
        const out = {};
        for (const [key, value] of new URLSearchParams(document))
            out[key] = value;
        return out;
    },
    encode: (value) => {
        if (value === null || typeof value !== "object" || Array.isArray(value)) {
            throw new TypeError("form codec: can only encode a flat object");
        }
        const params = new URLSearchParams();
        for (const [key, item] of Object.entries(value)) {
            params.set(key, typeof item === "string" ? item : canonical(item));
        }
        return `${params.toString()}\n`;
    },
});
const REGISTRY = Object.freeze({
    string: stringCodec,
    json: jsonCodec,
    eavt: eavtCodec,
    form: formCodec,
});
/** The available wire codec names — the finite vocabulary. */
export const WIRE_CODEC_NAMES = Object.freeze(Object.keys(REGISTRY).sort());
/** Resolve a wire codec by name, or throw — the vocabulary witness. */
export function wireCodec(name) {
    const codec = REGISTRY[name];
    if (codec === undefined) {
        throw new TypeError(`unknown wire codec ${JSON.stringify(name)}; known: ${WIRE_CODEC_NAMES.join(", ")}`);
    }
    return codec;
}
//# sourceMappingURL=codecs.mjs.map