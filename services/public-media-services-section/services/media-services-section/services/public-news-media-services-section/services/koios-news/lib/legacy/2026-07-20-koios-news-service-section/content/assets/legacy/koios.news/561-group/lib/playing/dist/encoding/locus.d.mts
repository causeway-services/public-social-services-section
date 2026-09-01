import type { Locus } from "../index.mjs";
import type { Json } from "./json.mjs";
/** Encode a locus to its address array (root is `[]`). */
export declare function encodeLocus(value: Locus): Json;
/** Decode an address array back to the frozen `Locus`; `TypeError` on non-integer entries. */
export declare function decodeLocus(json: unknown): Locus;
//# sourceMappingURL=locus.d.mts.map