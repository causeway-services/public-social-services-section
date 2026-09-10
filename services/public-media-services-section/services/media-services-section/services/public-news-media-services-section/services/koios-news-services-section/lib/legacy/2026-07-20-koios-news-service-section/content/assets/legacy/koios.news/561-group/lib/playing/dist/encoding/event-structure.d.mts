import type { Event, EventPair, PrimeEventStructure } from "../index.mjs";
import type { Json } from "./json.mjs";
/** Encode an event to `{id, polarity}`. */
export declare function encodeEvent(value: Event): Json;
/** Decode `{id, polarity}` back to the frozen `Event`. */
export declare function decodeEvent(json: unknown): Event;
declare function encodePair(pair: EventPair): Json;
declare function decodePair(json: unknown, what: string): EventPair;
/** Encode a prime event structure to `{events, causality, conflict}`. */
export declare function encodeEventStructure(value: PrimeEventStructure): Json;
/** Decode `{events, causality, conflict}` back to the frozen `PrimeEventStructure`. */
export declare function decodeEventStructure(json: unknown): PrimeEventStructure;
/** Encode a single `[from, to]` edge pair (shared by arena symmetry codecs). */
export { encodePair as encodeEventPair, decodePair as decodeEventPair };
//# sourceMappingURL=event-structure.d.mts.map