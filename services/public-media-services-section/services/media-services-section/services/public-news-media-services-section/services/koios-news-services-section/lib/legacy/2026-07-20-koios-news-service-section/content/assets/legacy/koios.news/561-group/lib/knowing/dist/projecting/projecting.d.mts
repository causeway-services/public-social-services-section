/**
 * projecting — wire-safe projections of knowing's real carriers.
 *
 * The learning-verb morphisms return REAL upstream carriers (AgentCell, AgentSite,
 * AgentLearning) and thin carriers wrapping them (Explanation, Curriculum,
 * NextStep, Knowledge). Those carriers hold CellSets and Ordinals with embedded
 * fundamental-sequence FUNCTIONS — huge and non-serializable; sending them raw to
 * `jsonResource` previously hung the CLI. This module mirrors relating-experimental
 * separating carriers from their codec/serving: each morphism's full carrier stays
 * composable in-process, and the boundary action calls one of these projections to
 * get a faithful, BOUNDED wire form (counts + small samples, never raw CellSets or
 * ordinal closures) before serialization.
 *
 * These are pure functions, projections only — they never reconstruct or summarize
 * the morphism's job; they read a carrier into a JSON-safe shape. Each wire shape is
 * a knowing-owned carrier in `./schemas.mjs`: an `as const` JSON-Schema literal read
 * by `FromSchema` and registered by `carrierFrom`.
 */
import type { Ordinal, SettlingIncrement } from "@emsenn/relating";
import type { Explanation, Curriculum, NextStep, Knowledge, SettledResearch, KnowingEntry, KnowingTrace, KnowingLessons, KnowingLesson } from "../researching/index.mjs";
import type { OrdinalProjection, IncrementProjection, CellProjection, SiteProjection, LessonProjection, LearningProjection, ExplanationProjection, CurriculumProjection, NextStepProjection, KnowledgeProjection, ResearchProjection } from "./schemas.mjs";
export type { OrdinalProjection, IncrementProjection, CellProjection, SiteProjection, LessonProjection, LearningProjection, ExplanationProjection, CurriculumProjection, NextStepProjection, KnowledgeProjection, ResearchProjection, };
/** Project an ordinal to a bounded reading (never walking a limit's fundamental sequence). */
export declare function projectOrdinal(ordinal: Ordinal): OrdinalProjection;
/** Project a settling increment (its CellSet is reduced to a count). */
export declare function projectIncrement(increment: SettlingIncrement): IncrementProjection;
/** Project an AgentCell to a bounded wire form. */
export declare function projectCell(cell: KnowingEntry): CellProjection;
/** Project an AgentSite to a bounded wire form (the trace as a counted sample). */
export declare function projectSite(site: KnowingTrace): SiteProjection;
/** Project a lesson (its restriction CellSet is reduced to a count). */
export declare function projectLesson(lesson: KnowingLesson): LessonProjection;
/** Project an AgentLearning to a bounded wire form. */
export declare function projectLearning(learning: KnowingLessons): LearningProjection;
/** Project an Explanation to a bounded wire form (the derivation as a counted sample). */
export declare function projectExplanation(explanation: Explanation): ExplanationProjection;
/** Project a Curriculum to a bounded wire form. */
export declare function projectCurriculum(curriculum: Curriculum): CurriculumProjection;
/** Project a NextStep to a bounded wire form. */
export declare function projectNextStep(nextStep: NextStep): NextStepProjection;
/** Project a Knowledge carrier to a bounded wire form. */
export declare function projectKnowledge(knowledge: Knowledge): KnowledgeProjection;
/** Project a SettledResearch carrier to a bounded wire form. */
export declare function projectResearch(research: SettledResearch, isCertified: boolean): ResearchProjection;
//# sourceMappingURL=projecting.d.mts.map