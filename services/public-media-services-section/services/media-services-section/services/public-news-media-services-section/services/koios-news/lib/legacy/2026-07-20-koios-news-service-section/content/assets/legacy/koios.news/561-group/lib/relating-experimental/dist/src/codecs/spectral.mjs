/**
 * codecs/spectral — native-number boundary helpers for spectral polynomial
 * carriers. The polynomial arithmetic stays exact (Integer coefficients); these
 * read coefficients to/from native integers only at the representation boundary.
 */
import { integerPolynomial } from "../articulating/predicating/positing/settling/analysis/spectral.mjs";
import { fromInt, toInt } from "./exact-number.mjs";
/** Build an IntegerPolynomial from native integer coefficients (ascending degree). */
export const polyFromInts = (values) => integerPolynomial(values.map(fromInt));
/** Read an IntegerPolynomial's coefficients as native integers (ascending degree). */
export const polyToInts = (poly) => Object.freeze(poly.map(toInt));
//# sourceMappingURL=spectral.mjs.map