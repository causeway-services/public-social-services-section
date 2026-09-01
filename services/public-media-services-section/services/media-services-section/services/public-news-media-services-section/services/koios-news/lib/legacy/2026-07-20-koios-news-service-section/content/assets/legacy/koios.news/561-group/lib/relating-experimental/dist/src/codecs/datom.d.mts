import { type JsonValue } from "./json.mjs";
/** A datom tuple: EAVT plus the computed reading (five parts). */
export type Datom = readonly [entity: JsonValue, attribute: JsonValue, value: JsonValue, time: JsonValue, reading: JsonValue];
/** Whether a value is shaped like a datom tuple. */
export declare function isDatomShape(value: JsonValue): value is Datom;
/** Coerce a value to a datom tuple, or throw. */
export declare function toDatom(value: JsonValue): Datom;
/** A datom from an EAVT tuple and a reading. */
export declare const datom: (eavt: readonly [JsonValue, JsonValue, JsonValue, JsonValue], reading: JsonValue) => Datom;
/** Parse datom JSONL. */
export declare const parse: (content: string) => Datom[];
/** Serialize datoms as JSONL. */
export declare const serialize: (datoms: readonly Datom[]) => string;
/** The assert op. */
export declare const ASSERT = "assert";
/** The retract op. */
export declare const RETRACT = "retract";
/** A datom operation. */
export type DatomOp = typeof ASSERT | typeof RETRACT;
/** An object-spelled datom `{e,a,v,tx,op}`. */
export type ObjectDatom = Readonly<{
    readonly [key: string]: JsonValue;
    readonly e: JsonValue;
    readonly a: JsonValue;
    readonly v: JsonValue;
    readonly tx: JsonValue;
    readonly op: DatomOp;
}>;
/** The current value of a cell after folding. */
export type CurrentDatomFact = Readonly<{
    readonly e: JsonValue;
    readonly a: JsonValue;
    readonly v: JsonValue;
}>;
/** A charge name for a folded section cell. */
export type ObjectDatomCharge = "potential" | "active" | "stable";
/** A folded section cell with its present/absent evidence. */
export type ObjectDatomSectionCell = Readonly<{
    readonly subject: JsonValue;
    readonly predicate: JsonValue;
    readonly object: JsonValue;
    readonly value: ObjectDatomCharge;
    readonly evidence: readonly [readonly JsonValue[], readonly JsonValue[]];
}>;
/** A folded section: the datoms and the per-cell readings. */
export type ObjectDatomSection = Readonly<{
    readonly datoms: readonly ObjectDatom[];
    readonly cells: readonly ObjectDatomSectionCell[];
}>;
/** Witness a value as an object datom `{e,a,v,tx,op}`, or throw. */
export declare function assertObjectDatom(value: unknown): ObjectDatom;
/** An assert datom fact. */
export declare function assertDatomFact(e: JsonValue, a: JsonValue, v: JsonValue, tx: JsonValue): ObjectDatom;
/** A retract datom fact. */
export declare function retractDatomFact(e: JsonValue, a: JsonValue, v: JsonValue, tx: JsonValue): ObjectDatom;
/** The content identity of an object datom. */
export declare function objectDatomId(value: unknown): string;
/** The current (live) cell values after folding assert/retract. */
export declare function currentDatomValue(datoms: readonly unknown[]): CurrentDatomFact[];
/** The object datoms as of a transaction time. */
export declare function objectDatomsAsOf(datoms: readonly unknown[], asOf: JsonValue): ObjectDatom[];
/** Fold an object-datom log into the paraconsistent section. */
export declare function foldObjectDatoms(datoms: readonly unknown[]): ObjectDatomSection;
/** The present-side witnesses of a cell in a folded section. */
export declare function objectDatomWitnesses(section: ObjectDatomSection, cell: {
    readonly subject?: unknown;
    readonly predicate?: unknown;
    readonly object?: unknown;
    readonly e?: unknown;
    readonly a?: unknown;
    readonly v?: unknown;
}): readonly JsonValue[];
//# sourceMappingURL=datom.d.mts.map