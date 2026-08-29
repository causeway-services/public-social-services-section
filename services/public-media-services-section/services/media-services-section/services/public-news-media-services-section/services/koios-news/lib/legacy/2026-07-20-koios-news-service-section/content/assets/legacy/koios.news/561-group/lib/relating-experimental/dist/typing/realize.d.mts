/**
 * typing/realize — the forgetful functor `realize: Sub(J) → StructuralTypes`.
 *
 * A JSON Schema is a predicate on the universe of JSON values. `realize` keeps
 * the structural skeleton and FORGETS the refinement predicates (minLength,
 * pattern, minimum, format, if/then/else) that have no image among structural
 * types — which is exactly what makes it canonical and choice-free, a function.
 * Its adjoint (type → schema) is free and must *choose* refinements, which is why
 * schema-as-source-of-truth is the computable direction.
 *
 *   allOf  → intersection (∧)        anyOf/oneOf → union (∨)
 *   properties+required → product    items/prefixItems → array/tuple
 *   enum/const → literals            $ref/$defs → named fixpoint (never inlined)
 *   minLength, pattern, format, …    → forgotten (residual stays in the schema)
 */
import { type JsonValue } from "../codecs/json.mjs";
import { type StructuralType } from "./structural.mjs";
/** Realize a JSON Schema document into its structural type. */
export declare function realize(schema: JsonValue): StructuralType;
/** The named structural types of a schema's `$defs`/`definitions` block. */
export declare function realizeDefs(schema: JsonValue): ReadonlyMap<string, StructuralType>;
//# sourceMappingURL=realize.d.mts.map