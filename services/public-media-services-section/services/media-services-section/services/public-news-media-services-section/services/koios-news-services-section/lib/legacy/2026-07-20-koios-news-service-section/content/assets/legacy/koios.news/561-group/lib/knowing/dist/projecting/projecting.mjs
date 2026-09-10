import { freeSettlementFiltration } from "@emsenn/relating";
/** The bounded sample size for any projected list. */
const SAMPLE = 12;
/** Project an ordinal to a bounded reading (never walking a limit's fundamental sequence). */
export function projectOrdinal(ordinal) {
    let depth = 0;
    let cursor = ordinal;
    while (cursor.kind === "ordinal.closure.ordinal.successor") {
        depth += 1;
        if (depth > 4096)
            return Object.freeze({ kind: ordinal.kind, finiteDepth: null });
        cursor = cursor.predecessor;
    }
    return Object.freeze({
        kind: ordinal.kind,
        finiteDepth: cursor.kind === "ordinal.closure.ordinal.zero" ? depth : null,
    });
}
/** Project a settling increment (its CellSet is reduced to a count). */
export function projectIncrement(increment) {
    return Object.freeze({
        stage: increment.source.shape.kind,
        ordinal: projectOrdinal(increment.stage.ordinal),
        addedCells: increment.added.cells.length,
    });
}
/** Project an AgentCell to a bounded wire form. */
export function projectCell(cell) {
    return Object.freeze({
        kind: "knowing.wire.cell",
        settled: true,
        depth: projectOrdinal(cell.depth.ordinal),
        firstCohomologyRank: cell.firstCohomology.generators.length,
        stages: freeSettlementFiltration(cell.settlement).stages.length,
    });
}
/** Project an AgentSite to a bounded wire form (the trace as a counted sample). */
export function projectSite(site) {
    return Object.freeze({
        kind: "knowing.wire.site",
        increments: site.trace.length,
        cellsAdded: site.trace.reduce((sum, increment) => sum + increment.added.cells.length, 0),
        trace: Object.freeze(site.trace.slice(0, SAMPLE).map(projectIncrement)),
    });
}
/** Project a lesson (its restriction CellSet is reduced to a count). */
export function projectLesson(lesson) {
    return Object.freeze({
        stage: lesson.increment.source.shape.kind,
        restrictionCells: lesson.restriction.cells.length,
    });
}
/** Project an AgentLearning to a bounded wire form. */
export function projectLearning(learning) {
    return Object.freeze({
        kind: "knowing.wire.learning",
        lessons: learning.lessons.length,
        sample: Object.freeze(learning.lessons.slice(0, SAMPLE).map(projectLesson)),
    });
}
/** Project an Explanation to a bounded wire form (the derivation as a counted sample). */
export function projectExplanation(explanation) {
    const step = (s) => Object.freeze({ stage: s.stage, addedCells: s.addedCells });
    return Object.freeze({
        kind: "knowing.explanation",
        steps: explanation.derivation.length,
        cellsAdded: explanation.derivation.reduce((sum, s) => sum + s.addedCells, 0),
        derivation: Object.freeze(explanation.derivation.slice(0, SAMPLE).map(step)),
    });
}
/** Project a Curriculum to a bounded wire form. */
export function projectCurriculum(curriculum) {
    return Object.freeze({
        kind: "knowing.curriculum",
        lessons: curriculum.lessons.length,
        sequence: Object.freeze(curriculum.lessons.slice(0, SAMPLE).map(projectLesson)),
    });
}
/** Project a NextStep to a bounded wire form. */
export function projectNextStep(nextStep) {
    return Object.freeze({
        kind: "knowing.next-step",
        step: nextStep.lesson === null ? null : projectLesson(nextStep.lesson),
        reason: nextStep.reason,
    });
}
/** Project a Knowledge carrier to a bounded wire form. */
export function projectKnowledge(knowledge) {
    return Object.freeze({
        kind: "knowing.knowledge",
        regime: knowledge.regime,
        certified: knowledge.certified,
        settledRelations: knowledge.settled.length,
        settled: Object.freeze(knowledge.settled.slice(0, SAMPLE).map(projectIncrement)),
    });
}
/** Project a SettledResearch carrier to a bounded wire form. */
export function projectResearch(research, isCertified) {
    return Object.freeze({
        kind: "knowing.research.settled",
        regime: research.regime,
        onShell: research.onShell,
        certified: isCertified,
        stages: freeSettlementFiltration(research.settlement).stages.length,
    });
}
//# sourceMappingURL=projecting.mjs.map