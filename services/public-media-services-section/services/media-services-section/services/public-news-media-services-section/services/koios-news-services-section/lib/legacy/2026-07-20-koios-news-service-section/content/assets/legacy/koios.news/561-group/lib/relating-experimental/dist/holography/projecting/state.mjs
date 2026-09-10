// holography/projecting/state — the current view projected from the witness log.
//
// The append-only log is the boundary; this projection is the bulk it determines
// (the read-model of the event-sourced ledger). Functional attributes hold one
// value at a time (latest witness by time wins); every other attribute
// accumulates the set of distinct witnessed values. Pure: a fold over the log.
import { canonical } from "../../codecs/json.mjs";
/** Project the current view from a witness log, given the functional attributes. */
export function projectStateView(log, functional) {
    const entities = new Map();
    for (const row of log) {
        const entityKey = canonical(row.e);
        const attribute = String(row.a);
        const accum = entities.get(entityKey) ?? { functional: new Map(), sets: new Map() };
        if (functional.has(attribute)) {
            const prior = accum.functional.get(attribute);
            if (prior === undefined || canonical(row.t) > canonical(prior.time)) {
                accum.functional.set(attribute, { value: row.v, time: row.t });
            }
        }
        else {
            const set = accum.sets.get(attribute) ?? new Map();
            set.set(canonical(row.v), row.v);
            accum.sets.set(attribute, set);
        }
        entities.set(entityKey, accum);
    }
    const view = {};
    for (const [entityKey, accum] of entities) {
        const entityView = {};
        for (const [attribute, { value }] of accum.functional)
            entityView[attribute] = value;
        for (const [attribute, set] of accum.sets)
            entityView[attribute] = Object.freeze([...set.values()]);
        view[entityKey] = Object.freeze(entityView);
    }
    return Object.freeze(view);
}
//# sourceMappingURL=state.mjs.map