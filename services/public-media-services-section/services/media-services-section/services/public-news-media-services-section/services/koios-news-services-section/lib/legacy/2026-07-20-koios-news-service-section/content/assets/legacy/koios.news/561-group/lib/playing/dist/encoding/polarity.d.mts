import type { Polarity } from "../index.mjs";
import type { Json } from "./json.mjs";
/** Encode a polarity to its name tag. */
export declare function encodePolarity(value: Polarity): Json;
/** Decode a polarity-name tag back to the frozen `Polarity`; `TypeError` on a bad tag. */
export declare function decodePolarity(json: unknown): Polarity;
//# sourceMappingURL=polarity.d.mts.map