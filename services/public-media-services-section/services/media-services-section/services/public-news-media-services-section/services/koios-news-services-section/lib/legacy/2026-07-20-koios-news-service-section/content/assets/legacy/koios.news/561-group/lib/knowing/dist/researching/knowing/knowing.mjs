/**
 * knowing — SettledResearch → Knowledge: the static ≤_k reading of a research act.
 *
 * Nested directly under researching (a sibling derivative to introducing).
 * Knowledge is "how much has been settled" — the bilattice knowledge order ≤_k.
 * This reads the research act's settled codomain: its closure regime and on-shell
 * judgment (whether it factors through a C-coalgebra, i.e. is certified) together
 * with the relations it actually settled — the firings of the settlement filtration.
 */
import { readFiringsOfSettlementFiltration, freeSettlementFiltration } from "@emsenn/relating";
import { certified } from "../researching.mjs";
/** know : SettledResearch → Knowledge. */
export function knowing(research) {
    return Object.freeze({
        kind: "knowing.knowledge",
        research,
        regime: research.regime,
        certified: certified(research),
        settled: readFiringsOfSettlementFiltration(freeSettlementFiltration(research.settlement)),
    });
}
//# sourceMappingURL=knowing.mjs.map