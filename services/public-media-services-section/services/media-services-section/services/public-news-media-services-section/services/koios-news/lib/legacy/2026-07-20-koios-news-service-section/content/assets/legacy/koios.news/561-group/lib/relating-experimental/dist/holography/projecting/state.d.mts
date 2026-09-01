import { type JsonValue } from "../../codecs/json.mjs";
import type { EAVTRecord } from "../../codecs/eavt.mjs";
/** One entity's projected attributes: a functional value, or a set of values. */
export type EntityView = {
    readonly [attribute: string]: JsonValue;
};
/** The projected current view: each entity id to its attribute view. */
export type StateView = {
    readonly [entity: string]: EntityView;
};
/** Project the current view from a witness log, given the functional attributes. */
export declare function projectStateView(log: readonly EAVTRecord[], functional: ReadonlySet<string>): StateView;
//# sourceMappingURL=state.d.mts.map