/**
 * analysis/laplacian — spectral geometry of the relation graph.
 *
 * The relation graph of a section (terms as vertices, weighted by how many cells
 * relate each pair) carries the combinatorial Laplacian L = D − W. From it,
 * exactly over ℤ: the deviation operator (Lf)(x) = Σ_y w(x,y)(f(x)−f(y)); the
 * harmonic judgment Lf = 0 (witness/obstruction, not a float threshold); the
 * component count as the zero-eigenvalue multiplicity (rank deficiency); the
 * characteristic polynomial; and the weighted spanning-tree count (Matrix-Tree).
 * Reflexive cells contribute nothing. Carrier-valued throughout.
 */
import { termCoincides } from "../../../predication.mjs";
import {} from "../section.mjs";
import { charPoly, count, determinant, fromInteger, fromNatural, intAdd, intNegate, intOne, intZero, monus, rank, ratAdd, ratIsZero, ratMultiply, ratZero, } from "./exact-number.mjs";
const sameTerm = (left, right) => termCoincides(left, right);
/** The relation graph of a section. */
export function relationGraph(section) {
    if (section.entries.length === 0)
        throw new TypeError("an empty section presents no relation graph");
    const terms = [];
    const indexOf = (term) => {
        const found = terms.findIndex((candidate) => sameTerm(candidate, term));
        if (found !== -1)
            return found;
        terms.push(term);
        return terms.length - 1;
    };
    const pairs = [];
    for (const entry of section.entries) {
        const subject = indexOf(entry.cell.subject);
        const object = indexOf(entry.cell.object);
        if (subject !== object)
            pairs.push([subject, object]);
    }
    const weights = terms.map((_term, row) => terms.map((__term, column) => fromNatural(count(pairs.filter(([a, b]) => (a === row && b === column) || (a === column && b === row))))));
    return Object.freeze({
        kind: "meme-analysis.laplacian.graph",
        terms: Object.freeze(terms),
        weights: Object.freeze(weights.map((row) => Object.freeze(row))),
    });
}
/** The combinatorial Laplacian L = D − W, exact integer entries. */
export function laplacianOf(graph) {
    return Object.freeze(graph.weights.map((row, index) => Object.freeze(row.map((weight, column) => column === index ? row.reduce((sum, value) => intAdd(sum, value), intZero) : intNegate(weight)))));
}
const requireObservable = (graph, values) => {
    if (values.length !== graph.terms.length)
        throw new TypeError("an observable assigns a value to every term of the graph");
};
/** The deviation operator on a rational observable (exact, carrier-valued). */
export function deviationOf(graph, values) {
    requireObservable(graph, values);
    const laplacian = laplacianOf(graph);
    return Object.freeze(laplacian.map((row) => row.reduce((sum, entry, column) => ratAdd(sum, ratMultiply(fromInteger(entry), values[column])), ratZero)));
}
/** Whether an observable is a harmonic mode. */
export function harmonic(graph, values) {
    const deviations = deviationOf(graph, values);
    const failing = deviations.findIndex((value) => !ratIsZero(value));
    if (failing !== -1) {
        return Object.freeze({
            kind: "meme-analysis.laplacian.harmonic-obstruction",
            graph,
            values: Object.freeze([...values]),
            atTerm: graph.terms[failing],
            deviation: deviations[failing],
        });
    }
    return Object.freeze({ kind: "meme-analysis.laplacian.harmonic:witness", graph, values: Object.freeze([...values]) });
}
/** The connected-component count (zero-eigenvalue multiplicity = rank deficiency). */
export function componentCount(graph) {
    return monus(count(graph.terms), rank(laplacianOf(graph)));
}
/** The characteristic polynomial of L (the exact spectrum). */
export function spectrumPolynomial(graph) {
    return charPoly(laplacianOf(graph));
}
/** The weighted spanning-tree count (a reduced-Laplacian determinant; Matrix-Tree). */
export function treeCount(graph) {
    if (graph.terms.length === 1)
        return intOne;
    const laplacian = laplacianOf(graph);
    const reduced = laplacian.slice(1).map((row) => row.slice(1));
    return determinant(reduced);
}
//# sourceMappingURL=laplacian.mjs.map