/**
 * researching — research : Memory → SettledResearch. The base morphism.
 *
 * A directed-relational-research act is `r : X → C Y` with C the settlement
 * comonad: `research` folds a memory's document relations into one settled topology
 * (the fold itself lives in `memory/settleMemoryFiltration`, the single place the
 * `induceRelation`/`relateRelations` pull-push is written) and reads its closure
 * regime. The codomain `SettledResearch` is the domain of the next morphism,
 * `introducing`. This function is the morphism; nothing wraps it.
 */
import { readClassificationOfSettlementFiltration, freeSettlementFiltration, } from "@emsenn/relating";
import { settleMemoryFiltration } from "../memory/index.mjs";
/** research : Memory → SettledResearch. Null only for an empty memory. */
export function research(memory) {
    const folded = settleMemoryFiltration(memory);
    if (folded === null)
        return null;
    const regime = readClassificationOfSettlementFiltration(freeSettlementFiltration(folded)).regime.kind;
    return Object.freeze({
        kind: "knowing.research.settled",
        settlement: folded,
        regime,
        onShell: regime !== "ordinal.closure.regime.aperiodic",
    });
}
/** A research act is certified when it is on-shell (factors through a C-coalgebra). */
export function certified(research) {
    return research.onShell;
}
//# sourceMappingURL=researching.mjs.map