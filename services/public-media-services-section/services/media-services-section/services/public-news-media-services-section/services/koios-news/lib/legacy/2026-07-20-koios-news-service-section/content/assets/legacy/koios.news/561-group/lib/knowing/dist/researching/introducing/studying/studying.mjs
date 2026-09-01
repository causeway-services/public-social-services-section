/**
 * studying — KnowingEntry → KnowingTrace: the trace reading, nested under introducing.
 *
 * Second derivative. Studying opens the entry `introducing` read through its settling
 * trace — relating's `readIncrementsOfSettlementFiltration` over the settlement the
 * entry holds. The trace is the whole derivation that built the settlement (the
 * ≤_k-monotone closure orbit's increments). Reads only @emsenn/relating.
 * Its codomain (KnowingTrace) is the domain of the next steps, `explaining` and
 * `learning`.
 */
import { readIncrementsOfSettlementFiltration, freeSettlementFiltration } from "@emsenn/relating";
/** study : KnowingEntry → KnowingTrace. */
export function studying(entry) {
    return Object.freeze({
        kind: "knowing.trace",
        entry,
        trace: Object.freeze([...readIncrementsOfSettlementFiltration(freeSettlementFiltration(entry.settlement))]),
    });
}
//# sourceMappingURL=studying.mjs.map