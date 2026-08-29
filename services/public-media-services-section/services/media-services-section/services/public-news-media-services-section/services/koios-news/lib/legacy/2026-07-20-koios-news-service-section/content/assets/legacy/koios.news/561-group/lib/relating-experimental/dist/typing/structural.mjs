export const unknownType = Object.freeze({ kind: "unknown" });
export const neverType = Object.freeze({ kind: "never" });
export const primitive = (name) => Object.freeze({ kind: "primitive", name });
export const literal = (value) => Object.freeze({ kind: "literal", value });
export const array = (element) => Object.freeze({ kind: "array", element });
export const tuple = (elements) => Object.freeze({ kind: "tuple", elements: Object.freeze([...elements]) });
export const ref = (name) => Object.freeze({ kind: "ref", name });
export const objectType = (fields, rest = null) => Object.freeze({ kind: "object", fields: Object.freeze([...fields]), rest });
/** The coproduct, normalized: drop `never`, collapse a singleton, dedupe by shape. */
export function union(members) {
    const flat = members.flatMap((m) => (m.kind === "union" ? m.members : [m])).filter((m) => m.kind !== "never");
    const seen = new Map();
    for (const m of flat)
        seen.set(JSON.stringify(m), m);
    const distinct = [...seen.values()];
    if (distinct.length === 0)
        return neverType;
    if (distinct.length === 1)
        return distinct[0];
    return Object.freeze({ kind: "union", members: Object.freeze(distinct) });
}
/** The meet (intersection), normalized: drop `unknown`, collapse a singleton. */
export function intersection(members) {
    const flat = members.flatMap((m) => (m.kind === "intersection" ? m.members : [m])).filter((m) => m.kind !== "unknown");
    if (flat.length === 0)
        return unknownType;
    if (flat.length === 1)
        return flat[0];
    return Object.freeze({ kind: "intersection", members: Object.freeze(flat) });
}
//# sourceMappingURL=structural.mjs.map