// researching/sourcing/source-submission - Koios' source-submission fiber.
//
// The source-submission desk is now a producing-content/content-farm carrier:
// submitted source -> appraisal -> gathered intake -> cultivation. Koios only
// supplies its configured farm property by default and re-exports the upstream
// vocabulary for existing newsroom scripts.

import {
  appraiseSubmission as appraiseFarmSubmission,
  gatherRelatedSources,
  isOutOfFrame,
  submitSource as submitFarmSource,
  syndicationItemFromSubmission,
  type BeatFitScore,
  type GatheredSources,
  type SourceSubmissionCultivated,
  type SourceSubmissionJudgment,
  type SourceSubmissionOutOfFrame,
  type SubmissionAppraisal,
  type SubmitSourceOptions as FarmSubmitSourceOptions,
  type SubmittedSource,
} from "@red-cup-engineering/organizing-a-content-farm";
import type { FarmProperty } from "@red-cup-engineering/organizing-a-content-farm";

import { koiosFarmProperty } from "../../demand.mjs";

export {
  gatherRelatedSources,
  isOutOfFrame,
  syndicationItemFromSubmission,
  type BeatFitScore,
  type GatheredSources,
  type SourceSubmissionCultivated,
  type SourceSubmissionJudgment,
  type SourceSubmissionOutOfFrame,
  type SubmissionAppraisal,
  type SubmittedSource,
};

export type SubmitSourceOptions = Omit<FarmSubmitSourceOptions, "property"> & Readonly<{
  property?: FarmProperty;
}>;

export function appraiseSubmission(
  submitted: SubmittedSource,
  property: FarmProperty,
  options: Readonly<{ threshold?: number }> = {},
): SubmissionAppraisal {
  return appraiseFarmSubmission(submitted, property, options);
}

export async function submitSource(
  submitted: SubmittedSource,
  options: SubmitSourceOptions = {},
): Promise<SourceSubmissionJudgment> {
  return submitFarmSource(submitted, {
    ...options,
    property: options.property ?? koiosFarmProperty(),
  });
}
