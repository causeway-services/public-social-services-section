/**
 * holography — the projection kernel: how a *type* scopes to a resource.
 *
 * A holographic projector reads a boundary resource (a path + its content) into
 * carried items of some type `T`, and writes them back. A type is DEFINED BY
 * these morphisms (Yoneda), not by a folder or a spec. The codecs specialize
 * this kernel; each supplies its own `T` and its own recognize/read/write.
 *
 * Restriction is done HERE, in code — no `restricting/` directory.
 * `restrict(parent, …)` composes a child whose recognition ENTAILS the
 * parent's (`recognize_child = recognize_parent ∧ local`): a Curry–Howard
 * entailment edge. read/write inherit from the parent unless overridden, so
 * carrier-bearing behavior appears exactly at the node that owns it.
 *
 * Generic over the carried type `T`: this module imports nothing.
 */
/** Define a root projector (no parent). */
export function define(spec) {
    return { type: spec.type, parent: null, recognize: spec.recognize, read: spec.read, write: spec.write };
}
/** Restrict a parent into a child: recognition is conjoined (child ⊢ parent);
 *  read/write inherit unless overridden. */
export function restrict(parent, spec) {
    const local = spec.recognize;
    return {
        type: spec.type,
        parent,
        recognize: (resource) => parent.recognize(resource) && (local ? local(resource) : true),
        read: spec.read ?? parent.read,
        write: spec.write ?? parent.write,
    };
}
/** The entailment chain of a projector: itself, then everything it restricts, root last. */
export function entails(projector) {
    const chain = [];
    let p = projector;
    while (p) {
        chain.push(p);
        p = p.parent;
    }
    return chain;
}
/** A resource's most specific type: the deepest projector in the catalog that
 *  recognizes it (null if none). */
export function classify(resource, catalog) {
    let best = null;
    let bestDepth = -1;
    for (const projector of catalog) {
        if (!projector.recognize(resource))
            continue;
        const depth = entails(projector).length;
        if (depth > bestDepth) {
            best = projector;
            bestDepth = depth;
        }
    }
    return best;
}
//# sourceMappingURL=index.mjs.map