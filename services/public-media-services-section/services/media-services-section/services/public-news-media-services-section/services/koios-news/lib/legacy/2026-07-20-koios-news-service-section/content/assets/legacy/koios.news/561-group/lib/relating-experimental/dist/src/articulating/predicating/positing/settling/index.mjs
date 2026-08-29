/**
 * settling — finite settlement outcomes.
 *
 *   potential-scott-continuous-posit-cell --settling--> finite-settlement-cell
 *
 * The settlement filtration, the ordinal closure engine, the knowledge closure
 * and `settle`, the composed descent `induceRelation`, the predication cohomology,
 * and the settlement-filtration reads.
 */
export { induceRelation, relateRelations } from "./topology.mjs";
export { settle, knowledgeValuationClosure, knowledgeClosureTrace, knowledgeClosureSheaf, knowledgeClosureCells, truthValuationClosure, sameValuation, sameMeme, lastValuation, transportValuationAlongPredicationGenerators, possibilizeKnowledge, utteranceKnowledgeClosureCohomology, predicationValuationClosureFiniteStageJudgment, settlingStageOrdinalOfPredicationValuationClosureStage, valuationClosureLattice, knowledgeValuationClosureLattice, truthValuationClosureLattice, } from "./valuation-closure.mjs";
export { zeroOrdinal, successorOrdinal, limitOrdinal, ordinalLabel, finiteOrdinal, ordinalPlusFinite, omegaOrdinal, omegaMultipleOrdinal, omegaSquaredOrdinal, isZeroOrdinal, isSuccessorOrdinal, isLimitOrdinal, finiteOrdinalJudgment, finiteClosureRegime, scottClosureRegime, transfiniteClosureRegime, aperiodicClosureRegime, closureRegimeOfOrdinal, closureProcess, closeOrdinalProcess, closureOrbitOfProcess, closureSearchBlocks, closureStabilizationAt, closureStabilizationSearchHorizon, stabilizingSup, } from "./closure.mjs";
export { settlingStageOrdinal, initialSettlingStageOrdinal, successorSettlingStageOrdinal, limitSettlingStageOrdinal, judgeFinitudeOfSettlingStage, countableSettlingCofinality, uncountableSettlingCofinality, } from "./ordinal.mjs";
export { initialSettlingStageInput, successorSettlingStageInput, limitSettlingStageInput, settlingStageInput, readShapeOfSettlingStageOrdinal, settlingStageDesignatedCellSet, } from "./stage.mjs";
export { readDesignatedCellsOfValuation } from "./designation.mjs";
export { settlementFiltration } from "./filtration.mjs";
export { cohomologyOfValuation, cohomology, cohomologyOfCells, cohomologyLaplacian, cohomologyLaplacianOfCells, rankVanishing, rankIdentity, rankComparison, } from "./cohomology.mjs";
export { readIncrementsOfSettlementFiltration, readFiringsOfSettlementFiltration } from "./increment.mjs";
export { readLimitStagesOfSettlementFiltration, readNonScottFiringsOfSettlementFiltration } from "./limit.mjs";
export { readFirstCohomologyOfSettlementFiltration } from "./first-cohomology.mjs";
export { readClosureInvariantOfSettlementFiltration, readClosureEquivalenceOfSettlementFiltration } from "./invariant.mjs";
export { readGradedGapOfSettlementFiltration, readGradedGapFirstCohomologyRankIdentityOfSettlementFiltration } from "./gap.mjs";
export { readClassificationOfSettlementFiltration, readDepthOfSettlementFiltration, readDepthFiniteStageJudgmentOfSettlementFiltration } from "./classification.mjs";
export { fixedPoints } from "./fixed-point.mjs";
export { fixedPointGap, fixedPointGapInput } from "./fixed-point-gap.mjs";
export { fixedPointReading, fixedPointReadings, readCharge, informationOfSheaf } from "./fixed-point-reading.mjs";
export { valuationConsistency } from "./valuation-consistency.mjs";
export { sectionOf, predicationsFor, subjectsFor, chargeAtValues, partitionSection, topologyVitals } from "./section.mjs";
export { classifyFiring, classifyFiringOrbit, firingGrade, firingGrades, firingGenerator, negateFiringGenerator, firingFirstCohomology, firingGradeShadow, firingGradeCohomology, firingIndependence, firingSelfDuality, firingTypeMultiplicities, valuedFiringsOfSettlementFiltration, } from "./firing.mjs";
export { commutate, presheaf, presheafFromValuation, sheafFromValuation } from "./sheaf.mjs";
export * as analysis from "./analysis/index.mjs";
export * as geometry from "./geometry/index.mjs";
export * as dynamics from "./dynamics/substitution/index.mjs";
export { readFiringEventsOfSettlementFiltration, readCausalOrderOfSettlementFiltration } from "./geometry/temporal.mjs";
//# sourceMappingURL=index.mjs.map