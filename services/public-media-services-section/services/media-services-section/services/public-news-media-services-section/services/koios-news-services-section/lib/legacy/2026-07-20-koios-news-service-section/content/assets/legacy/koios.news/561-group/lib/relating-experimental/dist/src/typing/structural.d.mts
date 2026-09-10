/**
 * typing/structural — the structural-type carrier.
 *
 * The codomain of the forgetful functor `realize: Sub(J) → StructuralTypes`. A
 * JSON Schema is a predicate on the universe of JSON values (a subobject in
 * Sub(J)); a TypeScript structural type is an object in a bicartesian category:
 * labeled products (objects), coproducts (unions), intersections, arrays/tuples,
 * literals, and recursion via named fixpoints. This module is that category as
 * data, with no dependency on TypeScript. It is also the semantics the schema
 * codec otherwise lacks: what a schema *means* as a set of values.
 */
import type { JsonValue } from "../codecs/json.mjs";
/** A structural type — an object of the bicartesian category of TS structural types. */
export type StructuralType = {
    readonly kind: "unknown";
} | {
    readonly kind: "never";
} | {
    readonly kind: "primitive";
    readonly name: "string" | "number" | "boolean" | "null";
} | {
    readonly kind: "literal";
    readonly value: JsonValue;
} | {
    readonly kind: "array";
    readonly element: StructuralType;
} | {
    readonly kind: "tuple";
    readonly elements: readonly StructuralType[];
} | {
    readonly kind: "object";
    readonly fields: readonly StructuralField[];
    readonly rest: StructuralType | null;
} | {
    readonly kind: "union";
    readonly members: readonly StructuralType[];
} | {
    readonly kind: "intersection";
    readonly members: readonly StructuralType[];
} | {
    readonly kind: "ref";
    readonly name: string;
};
/** One labeled factor of a product (object) type. */
export interface StructuralField {
    readonly name: string;
    readonly type: StructuralType;
    readonly optional: boolean;
}
export declare const unknownType: StructuralType;
export declare const neverType: StructuralType;
export declare const primitive: (name: "string" | "number" | "boolean" | "null") => StructuralType;
export declare const literal: (value: JsonValue) => StructuralType;
export declare const array: (element: StructuralType) => StructuralType;
export declare const tuple: (elements: readonly StructuralType[]) => StructuralType;
export declare const ref: (name: string) => StructuralType;
export declare const objectType: (fields: readonly StructuralField[], rest?: StructuralType | null) => StructuralType;
/** The coproduct, normalized: drop `never`, collapse a singleton, dedupe by shape. */
export declare function union(members: readonly StructuralType[]): StructuralType;
/** The meet (intersection), normalized: drop `unknown`, collapse a singleton. */
export declare function intersection(members: readonly StructuralType[]): StructuralType;
//# sourceMappingURL=structural.d.mts.map