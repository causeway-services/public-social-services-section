import type { ChargeValue } from "@emsenn/relating";
import type { Json } from "./json.mjs";
/** Encode a charge value to its stable name tag (e.g. `"stable"`). */
export declare function encodeCharge(value: ChargeValue): Json;
/** Decode a charge-name tag back to the frozen `ChargeValue`; `TypeError` on a bad tag. */
export declare function decodeCharge(json: unknown): ChargeValue;
//# sourceMappingURL=charge.d.mts.map