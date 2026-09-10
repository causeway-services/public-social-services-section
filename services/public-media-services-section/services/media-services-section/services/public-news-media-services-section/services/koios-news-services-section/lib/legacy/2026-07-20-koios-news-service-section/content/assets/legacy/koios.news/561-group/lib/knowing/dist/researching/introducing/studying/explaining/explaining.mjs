/** explain : KnowingTrace → Explanation. */
export function explaining(trace) {
    const derivation = trace.trace.map((increment) => Object.freeze({
        kind: "knowing.derivation-step",
        stage: increment.source.shape.kind,
        addedCells: increment.added.cells.length,
        increment,
    }));
    return Object.freeze({ kind: "knowing.explanation", trace, derivation: Object.freeze(derivation) });
}
//# sourceMappingURL=explaining.mjs.map