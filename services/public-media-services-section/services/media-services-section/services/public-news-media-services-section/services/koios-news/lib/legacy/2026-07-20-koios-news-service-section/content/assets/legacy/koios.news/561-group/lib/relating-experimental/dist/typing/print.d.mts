/**
 * typing/print — the representation boundary: a structural type printed as TS.
 *
 * The second morphism of the type pipeline (realize, then print). Prints a
 * StructuralType as TypeScript source and assembles a `.d.mts`-style declaration
 * for a schema and its `$defs` — named types so `$ref` recursion is preserved as
 * named fixpoints, never inlined.
 */
import { type JsonValue } from "../codecs/json.mjs";
import type { StructuralType } from "./structural.mjs";
/** Print a structural type as a TypeScript type expression. */
export declare function printType(type: StructuralType): string;
/** Assemble a `.d.mts`-style declaration for a schema's root and its `$defs`. */
export declare function generateDeclaration(schema: JsonValue, rootName: string): string;
//# sourceMappingURL=print.d.mts.map