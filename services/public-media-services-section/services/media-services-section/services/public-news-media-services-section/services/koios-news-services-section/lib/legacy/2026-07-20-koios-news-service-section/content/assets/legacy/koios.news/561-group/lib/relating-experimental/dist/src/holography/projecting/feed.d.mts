import type { EAVTRecord } from "../../codecs/eavt.mjs";
import type { Witness } from "./cells.mjs";
import { type StateView } from "./state.mjs";
import { type WitnessStore } from "./store.mjs";
/** A feed: how to witness one observation, and which attributes are functional. */
export interface Feed<Observation> {
    readonly name: string;
    /** Turn one observation, witnessed at `at`, into EAVT cells. */
    readonly cellize: (observation: Observation, at: Witness) => readonly EAVTRecord[];
    /** Attributes holding one value at a time (latest witness wins on projection). */
    readonly functional: readonly string[];
}
/** Witness one observation: append only the cells new since the last witness.
 *  Returns the count of genuinely new rows — this feed's per-witness growth. */
export declare function witnessObservation<Observation>(store: WitnessStore, feed: Feed<Observation>, observation: Observation, at: Witness): {
    readonly appended: number;
};
/** Project the feed's current view and write it to the state tier. */
export declare function projectFeedState<Observation>(store: WitnessStore, feed: Feed<Observation>): StateView;
//# sourceMappingURL=feed.d.mts.map