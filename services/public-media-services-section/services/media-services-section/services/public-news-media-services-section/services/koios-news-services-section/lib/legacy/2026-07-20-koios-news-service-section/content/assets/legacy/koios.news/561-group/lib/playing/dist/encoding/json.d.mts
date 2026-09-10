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
import { type JsonRecord, type JsonValue } from "@emsenn/relating/writing";
export type Json = JsonValue;
export type JsonObject = JsonRecord;
/** Assert that an unknown value is a JSON carrier. */
export declare function asJson(value: unknown, what: string): Json;
/** Assert that an unknown value is a JSON object, throwing `TypeError` otherwise. */
export declare function asObject(value: unknown, what: string): JsonRecord;
/** Assert that an unknown value is a string, throwing `TypeError` otherwise. */
export declare function asString(value: unknown, what: string): string;
/** Assert that an unknown value is a finite number, throwing `TypeError` otherwise. */
export declare function asNumber(value: unknown, what: string): number;
/** Assert that an unknown value is an array, throwing `TypeError` otherwise. */
export declare function asArray(value: unknown, what: string): readonly Json[];
/** Assert that an unknown value is a boolean, throwing `TypeError` otherwise. */
export declare function asBoolean(value: unknown, what: string): boolean;
/** Read a required property from an object, asserting the object shape first. */
export declare function field(obj: JsonRecord, key: string, what: string): Json;
//# sourceMappingURL=json.d.mts.map