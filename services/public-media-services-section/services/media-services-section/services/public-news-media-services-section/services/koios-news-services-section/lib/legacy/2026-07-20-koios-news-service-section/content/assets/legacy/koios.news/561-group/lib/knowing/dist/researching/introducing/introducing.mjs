/**
 * introducing — SettledResearch → KnowingEntry: the entry reading of a research act.
 *
 * First derivative of a research act `r : X → C Y` (see ../category). introducing
 * reads the settled codomain `C Y` as knowing's ENTRY: that the act settled at all,
 * at what closure depth, with what first-cohomology obstruction. It reads relating's
 * settlement filtration DIRECTLY (`readDepthOfSettlementFiltration`,
 * `readFirstCohomologyOfSettlementFiltration`) — the same primitives animating's
 * `becoming` reads, here given knowing's epistemic reading rather than an agency one,
 * depending on no package but @emsenn/relating. Its codomain
 * (KnowingEntry) is the domain of the next step, `studying`.
 */
import { readDepthOfSettlementFiltration, readFirstCohomologyOfSettlementFiltration, freeSettlementFiltration, } from "@emsenn/relating";
/** introduce : SettledResearch → KnowingEntry. */
export function introducing(research) {
    const filtration = freeSettlementFiltration(research.settlement);
    return Object.freeze({
        kind: "knowing.entry",
        settlement: research.settlement,
        depth: readDepthOfSettlementFiltration(filtration),
        firstCohomology: readFirstCohomologyOfSettlementFiltration(filtration),
    });
}
//# sourceMappingURL=introducing.mjs.map