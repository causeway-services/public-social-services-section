import type { Design } from "../index.mjs";
import type { Json } from "./json.mjs";
/** Encode a design to `{entries: [{locus, charge}, ...]}`. */
export declare function encodeDesign(value: Design): Json;
/** Decode `{entries: [{locus, charge}, ...]}` back to the frozen `Design`. */
export declare function decodeDesign(json: unknown): Design;
//# sourceMappingURL=design.d.mts.map