import { type JsonValue } from "./json.mjs";
import { type EAVT, type EAVTRecord } from "./eavt.mjs";
/** A plain SPO triple. */
export type Triple = Readonly<{
    readonly s: JsonValue;
    readonly p: JsonValue;
    readonly o: JsonValue;
}>;
/** Witness a value as a `{s,p,o}` triple, or throw. */
export declare function assertTriple(value: unknown): Triple;
/** The content identity of a triple. */
export declare function tripleId(value: unknown): string;
/** Dedupe triples by content identity. */
export declare function dedupeTriples(values: readonly unknown[]): Triple[];
/** The triple projected from an EAVT row (drops time). */
export declare function tripleFromEavt(value: EAVT | EAVTRecord): Triple;
/** The triple projected from an object datom (drops tx/op). */
export declare function tripleFromDatom(value: unknown): Triple;
//# sourceMappingURL=triple.d.mts.map