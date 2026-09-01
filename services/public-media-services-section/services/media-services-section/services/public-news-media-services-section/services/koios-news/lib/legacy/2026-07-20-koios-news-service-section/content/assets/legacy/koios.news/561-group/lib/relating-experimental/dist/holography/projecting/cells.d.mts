import { type EAVTRecord } from "../../codecs/eavt.mjs";
import type { JsonValue } from "../../codecs/json.mjs";
/** The witness time coordinate — a scalar mark (an ISO string, a block number). */
export type Witness = JsonValue;
/** One witnessed cell. `value` may be rich (object/array), never undefined. */
export declare function cell(entity: JsonValue, attribute: JsonValue, value: JsonValue, at: Witness): EAVTRecord;
/** Witness a fixed set of attributes of one entity, skipping absent values. */
export declare function attributesOf(entity: JsonValue, source: Readonly<Record<string, unknown>>, attributes: readonly string[], at: Witness): EAVTRecord[];
//# sourceMappingURL=cells.d.mts.map