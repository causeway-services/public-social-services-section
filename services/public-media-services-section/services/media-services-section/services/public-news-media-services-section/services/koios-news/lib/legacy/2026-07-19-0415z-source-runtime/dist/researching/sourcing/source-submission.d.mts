import { gatherRelatedSources, isOutOfFrame, syndicationItemFromSubmission, type BeatFitScore, type GatheredSources, type SourceSubmissionCultivated, type SourceSubmissionJudgment, type SourceSubmissionOutOfFrame, type SubmissionAppraisal, type SubmitSourceOptions as FarmSubmitSourceOptions, type SubmittedSource } from "@emsenn/organizing-a-content-farm";
import type { FarmProperty } from "@emsenn/organizing-a-content-farm";
export { gatherRelatedSources, isOutOfFrame, syndicationItemFromSubmission, type BeatFitScore, type GatheredSources, type SourceSubmissionCultivated, type SourceSubmissionJudgment, type SourceSubmissionOutOfFrame, type SubmissionAppraisal, type SubmittedSource, };
export type SubmitSourceOptions = Omit<FarmSubmitSourceOptions, "property"> & Readonly<{
    property?: FarmProperty;
}>;
export declare function appraiseSubmission(submitted: SubmittedSource, property: FarmProperty, options?: Readonly<{
    threshold?: number;
}>): SubmissionAppraisal;
export declare function submitSource(submitted: SubmittedSource, options?: SubmitSourceOptions): Promise<SourceSubmissionJudgment>;
//# sourceMappingURL=source-submission.d.mts.map