import { type JsonValue } from "./json.mjs";
import { type Projector } from "../holography/index.mjs";
import { type ChargeCarrier } from "../articulating/predicating/positing/bilattice-charge.mjs";
/** A subject-predicate-object cell — the triple an EAVT witnesses. */
export type Cell = {
    readonly subject: JsonValue;
    readonly predicate: JsonValue;
    readonly object: JsonValue;
};
/** A cell paired with its charge over the bilattice. */
export type ChargedCell = {
    readonly cell: Cell;
    readonly charge: ChargeCarrier;
};
/** The SPO triple projected from an EAVT row. */
export type EAVTTriple = {
    readonly s: JsonValue;
    readonly p: JsonValue;
    readonly o: JsonValue;
};
/** The IANA-style media type for an EAVT JSONL carrier. */
export declare const EAVT_JSONL = "application/eavt+jsonl; charset=utf-8";
/** An EAVT tuple: `[entity, attribute, value, time]` — the asserted form. */
export type EAVT = readonly [entity: JsonValue, attribute: JsonValue, value: JsonValue, time: JsonValue];
/** The object spelling of EAVT used by JSON bodies and human-authored documents. */
export type EAVTRecord = {
    readonly e: JsonValue;
    readonly a: JsonValue;
    readonly v: JsonValue;
    readonly t: JsonValue;
};
/** A Datom: an EAVT plus the reading computed about that cell — the received form. */
export type Datom = readonly [entity: JsonValue, attribute: JsonValue, value: JsonValue, time: JsonValue, reading: JsonValue];
/** Whether a JSON value is shaped like an EAVT tuple. */
export declare function isEavtShape(value: JsonValue): boolean;
/** Normalize a tuple or object row into the canonical `{e,a,v,t}` record. */
export declare function eavtRecord(row: EAVT | EAVTRecord): EAVTRecord;
/** The content identity of a witness row: a hash of its canonical record. An
 *  unchanged cell re-witnesses to a byte-identical id and dedupes to zero cost. */
export declare function eavtId(row: EAVT | EAVTRecord): string;
/** Read an EAVT JSONL document into normalized records (malformed lines skipped). */
export declare function parse(content: string): EAVTRecord[];
/** Serialize witness records as canonical EAVT JSONL (object spelling). */
export declare function serialize(rows: readonly (EAVT | EAVTRecord)[]): string;
/** Serialize Datoms as canonical JSONL (tuple spelling, five parts). */
export declare function serializeDatoms(datoms: readonly Datom[]): string;
/** Normalize a row into the EAVT tuple spelling. */
export declare function toEavt(value: EAVT | EAVTRecord): EAVT;
/** Merge witness logs by content identity, sorted by id — the monotone union. */
export declare function mergeEavtLogs(...logs: readonly (readonly (EAVT | EAVTRecord)[])[]): EAVT[];
/** Unfold a JSON object/array into object-spelled EAVT rows keyed by JSON Pointer. */
export declare function unfoldJson(value: JsonValue, opts: {
    readonly base?: string;
    readonly t: JsonValue;
}): EAVTRecord[];
/** Fold object-spelled EAVT rows produced by unfoldJson back into a JSON object. */
export declare function foldJson(rows: readonly (EAVT | EAVTRecord)[]): JsonValue;
/** The SPO triple witnessed by an EAVT row (drops time). */
export declare function eavtTriple(row: EAVT | EAVTRecord): EAVTTriple;
/** An EAVT → the cell it witnesses, charged with its witnessed potential. The
 *  value is derived from present-side evidence; nothing negative is admitted. */
export declare function eavtToCell(e: EAVT): ChargedCell;
/** A charged cell → its EAVTs: one per present-side witness. The absent side is
 *  never an EAVT — you do not witness an absence; falsity is derived, not claimed. */
export declare function cellToEavt(charged: ChargedCell): EAVT[];
/** The E-A-V-T order: compare canonical-json keys component by component. */
export declare function eavtOrder(x: EAVT, y: EAVT): number;
/** The EAVT projector: a restriction of JSONL recognizing rows of EAVT shape. */
export declare const eavtProjector: Projector<JsonValue>;
//# sourceMappingURL=eavt.d.mts.map