import { type Witness } from "../holography/projecting/cells.mjs";
import { type WitnessStore } from "../holography/projecting/store.mjs";
import { type StateView } from "../holography/projecting/state.mjs";
import type { Feed } from "../holography/projecting/feed.mjs";
import type { JsonRecord, JsonValue } from "../codecs/json.mjs";
/** One scripted play. */
export interface Invocation {
    /** the caller — E. A transport/identity descriptor. */
    readonly caller: JsonValue;
    /** the verb — part of A. */
    readonly verb: string;
    /** the arguments — part of A. */
    readonly args: JsonRecord;
    /** the return value — V. */
    readonly value: JsonValue;
    /** the timestamp — T. */
    readonly at: Witness;
}
/** The invocation feed: one observation becomes one grain-of-change EAVT row. */
export declare const invocationFeed: Feed<Invocation>;
/** The dated, term-addressed witness store and feed name for a namespace's log. */
export declare function invocationStore(dataRoot: string, namespace: string, at: Witness): {
    readonly store: WitnessStore;
    readonly feed: string;
};
/** Witness one invocation, best-effort. Never throws: a witness failure must not
 *  change the action's output. Returns how many rows were genuinely new. */
export declare function witnessInvocation(dataRoot: string, namespace: string, invocation: Invocation): {
    readonly appended: number;
};
/** Project the current view of an invocation log (the read-model). */
export declare function projectInvocations(store: WitnessStore, feed: string): StateView;
//# sourceMappingURL=invocation.d.mts.map