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
import { type PredicationTerm } from "../../../predication.mjs";
import { type SectionCarrier } from "../section.mjs";
import { type Integer, type Matrix, type Natural, type Rational } from "./exact-number.mjs";
/** The relation graph of a section: distinct terms, weighted adjacency (exact). */
export interface RelationGraphCarrier {
    readonly kind: "meme-analysis.laplacian.graph";
    readonly terms: readonly PredicationTerm[];
    readonly weights: Matrix;
}
/** The relation graph of a section. */
export declare function relationGraph(section: SectionCarrier): RelationGraphCarrier;
/** The combinatorial Laplacian L = D − W, exact integer entries. */
export declare function laplacianOf(graph: RelationGraphCarrier): Matrix;
/** The deviation operator on a rational observable (exact, carrier-valued). */
export declare function deviationOf(graph: RelationGraphCarrier, values: readonly Rational[]): readonly Rational[];
/** An observable that is a harmonic mode (deviation vanishes everywhere). */
export interface HarmonicWitness {
    readonly kind: "meme-analysis.laplacian.harmonic:witness";
    readonly graph: RelationGraphCarrier;
    readonly values: readonly Rational[];
}
/** An observable that is not harmonic (the first nonzero deviation). */
export interface HarmonicObstruction {
    readonly kind: "meme-analysis.laplacian.harmonic-obstruction";
    readonly graph: RelationGraphCarrier;
    readonly values: readonly Rational[];
    readonly atTerm: PredicationTerm;
    readonly deviation: Rational;
}
/** The result of judging an observable for harmonicity. */
export type HarmonicJudgment = HarmonicWitness | HarmonicObstruction;
/** Whether an observable is a harmonic mode. */
export declare function harmonic(graph: RelationGraphCarrier, values: readonly Rational[]): HarmonicJudgment;
/** The connected-component count (zero-eigenvalue multiplicity = rank deficiency). */
export declare function componentCount(graph: RelationGraphCarrier): Natural;
/** The characteristic polynomial of L (the exact spectrum). */
export declare function spectrumPolynomial(graph: RelationGraphCarrier): readonly Integer[];
/** The weighted spanning-tree count (a reduced-Laplacian determinant; Matrix-Tree). */
export declare function treeCount(graph: RelationGraphCarrier): Integer;
//# sourceMappingURL=laplacian.d.mts.map