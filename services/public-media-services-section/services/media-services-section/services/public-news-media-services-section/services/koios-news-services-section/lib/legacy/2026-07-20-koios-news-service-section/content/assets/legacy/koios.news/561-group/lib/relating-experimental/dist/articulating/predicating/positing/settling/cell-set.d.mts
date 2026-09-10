/**
 * settling/cell-set — cell-set representatives and relative complement.
 *
 * Small set operations on cells under structural cell coincidence: dedupe to
 * representatives, and the cells of one list not coincident with any in another.
 */
import { type Cell } from "../../predication.mjs";
/** The coincidence-deduped representatives of a cell list. */
export declare const cellSetRepresentatives: (values: readonly Cell[]) => readonly Cell[];
/** The cells of `left` not coincident with any cell of `right`. */
export declare const relativeCellComplement: (left: readonly Cell[], right: readonly Cell[]) => readonly Cell[];
//# sourceMappingURL=cell-set.d.mts.map