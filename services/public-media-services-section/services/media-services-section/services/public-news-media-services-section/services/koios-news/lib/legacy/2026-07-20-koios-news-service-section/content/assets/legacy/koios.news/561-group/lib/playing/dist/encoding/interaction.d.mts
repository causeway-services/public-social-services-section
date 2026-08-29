import type { InteractionReport } from "../index.mjs";
import type { Json } from "./json.mjs";
/** Encode an interaction report to `{normalForm, meetings, daimonLoci}`. */
export declare function encodeInteractionReport(value: InteractionReport): Json;
/** Decode `{normalForm, meetings, daimonLoci}` back to a frozen `InteractionReport`. */
export declare function decodeInteractionReport(json: unknown): InteractionReport;
//# sourceMappingURL=interaction.d.mts.map