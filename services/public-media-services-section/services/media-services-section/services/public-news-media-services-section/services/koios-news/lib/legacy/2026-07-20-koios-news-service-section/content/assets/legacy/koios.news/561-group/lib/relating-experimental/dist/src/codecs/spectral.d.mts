/**
 * codecs/spectral — native-number boundary helpers for spectral polynomial
 * carriers. The polynomial arithmetic stays exact (Integer coefficients); these
 * read coefficients to/from native integers only at the representation boundary.
 */
import { type IntegerPolynomial } from "../articulating/predicating/positing/settling/analysis/spectral.mjs";
import type { Integer } from "../articulating/predicating/positing/settling/analysis/exact-number.mjs";
/** Build an IntegerPolynomial from native integer coefficients (ascending degree). */
export declare const polyFromInts: (values: readonly number[]) => IntegerPolynomial;
/** Read an IntegerPolynomial's coefficients as native integers (ascending degree). */
export declare const polyToInts: (poly: readonly Integer[]) => readonly number[];
//# sourceMappingURL=spectral.d.mts.map