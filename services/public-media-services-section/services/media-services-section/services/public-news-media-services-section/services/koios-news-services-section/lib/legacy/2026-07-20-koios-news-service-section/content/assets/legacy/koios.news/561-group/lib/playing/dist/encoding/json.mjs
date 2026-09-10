/**
 * Json — the plain-data target of charge-faithful serialization.
 *
 * The codecs in this package map the frozen carriers of `@emsenn/game-algebra`
 * and `@emsenn/game-topology` (the algebraic substrate of the theory of
 * computing, $\mathbf{CGS}$, and the ludics that underlies it) onto and off of
 * ordinary JSON values.  Encoders produce `Json`; decoders accept `unknown`
 * (an honest boundary — decoded data has no type until checked) and throw
 * `TypeError` on malformed input, reusing the algebra's own constructors so a
 * decoded carrier is a *real* frozen carrier, not a look-alike literal.
 *
 * `Json` is the relating package's JSON carrier. This module only supplies the
 * small asserting helpers every decoder reuses; each throws `TypeError`, so the
 * whole package is total: it either returns a valid carrier or throws.
 */
import { isJsonRecord, requireJsonValue, } from "@emsenn/relating/writing";
/** Assert that an unknown value is a JSON carrier. */
export function asJson(value, what) {
    return requireJsonValue(value, what);
}
/** Assert that an unknown value is a JSON object, throwing `TypeError` otherwise. */
export function asObject(value, what) {
    const json = requireJsonValue(value, what);
    if (!isJsonRecord(json)) {
        throw new TypeError(`game-codecs: expected object for ${what}, got ${describe(value)}`);
    }
    return json;
}
/** Assert that an unknown value is a string, throwing `TypeError` otherwise. */
export function asString(value, what) {
    const json = requireJsonValue(value, what);
    if (typeof json !== "string") {
        throw new TypeError(`game-codecs: expected string for ${what}, got ${describe(value)}`);
    }
    return json;
}
/** Assert that an unknown value is a finite number, throwing `TypeError` otherwise. */
export function asNumber(value, what) {
    const json = requireJsonValue(value, what);
    if (typeof json !== "number") {
        throw new TypeError(`game-codecs: expected number for ${what}, got ${describe(value)}`);
    }
    return json;
}
/** Assert that an unknown value is an array, throwing `TypeError` otherwise. */
export function asArray(value, what) {
    const json = requireJsonValue(value, what);
    if (!Array.isArray(json)) {
        throw new TypeError(`game-codecs: expected array for ${what}, got ${describe(value)}`);
    }
    return json;
}
/** Assert that an unknown value is a boolean, throwing `TypeError` otherwise. */
export function asBoolean(value, what) {
    const json = requireJsonValue(value, what);
    if (typeof json !== "boolean") {
        throw new TypeError(`game-codecs: expected boolean for ${what}, got ${describe(value)}`);
    }
    return json;
}
/** Read a required property from an object, asserting the object shape first. */
export function field(obj, key, what) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) {
        throw new TypeError(`game-codecs: missing field "${key}" in ${what}`);
    }
    return obj[key];
}
function describe(value) {
    if (value === null)
        return "null";
    if (Array.isArray(value))
        return "array";
    return typeof value;
}
//# sourceMappingURL=json.mjs.map