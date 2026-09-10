// researching/sourcing/source-submission - Koios' source-submission fiber.
//
// The source-submission desk is now a producing-content/content-farm carrier:
// submitted source -> appraisal -> gathered intake -> cultivation. Koios only
// supplies its configured farm property by default and re-exports the upstream
// vocabulary for existing newsroom scripts.
import { appraiseSubmission as appraiseFarmSubmission, gatherRelatedSources, isOutOfFrame, submitSource as submitFarmSource, syndicationItemFromSubmission, } from "@emsenn/organizing-a-content-farm";
import { koiosFarmProperty } from "../../demand.mjs";
export { gatherRelatedSources, isOutOfFrame, syndicationItemFromSubmission, };
export function appraiseSubmission(submitted, property, options = {}) {
    return appraiseFarmSubmission(submitted, property, options);
}
export async function submitSource(submitted, options = {}) {
    return submitFarmSource(submitted, {
        ...options,
        property: options.property ?? koiosFarmProperty(),
    });
}
//# sourceMappingURL=source-submission.mjs.map