// researching/writing/manuscripts - Koios manuscript-write policy.
//
// The reusable draft-file write lives upstream in the content farm. Koios only
// supplies editor identity, default publishing terms, and Koios frontmatter.

import {
  createAssignmentDraftJsonSchema,
  createDraftManuscriptJsonSchema,
  normalizeCreateAssignmentDraftInput,
  normalizeCreateDraftManuscriptInput,
  writeContentFarmDraftManuscript,
  type CreateAssignmentDraftInput,
  type CreateDraftManuscriptInput,
  type CreateDraftManuscriptResult,
} from "@red-cup-engineering/organizing-a-content-farm";

import { KOIOS_EDITOR } from "../../config.mts";
import { referencesFromSourceUrls } from "../sourcing/reference-normalization.mts";
import { KOIOS_DEFAULT_LICENSE, KOIOS_DEFAULT_LICENSE_URL, KOIOS_DEFAULT_SYNDICATION_RIGHTS } from "./editing/standards.mts";

export {
  createAssignmentDraftJsonSchema,
  createDraftManuscriptJsonSchema,
  normalizeCreateAssignmentDraftInput,
  normalizeCreateDraftManuscriptInput,
  type CreateAssignmentDraftInput,
  type CreateDraftManuscriptInput,
  type CreateDraftManuscriptResult,
} from "@red-cup-engineering/organizing-a-content-farm";

function dayStamp(): string {
  return new Date().toISOString().slice(0, 10); // law-allow: wall-clock-as-data
}

export function createDraftManuscript(contentDir: string, input: CreateDraftManuscriptInput): CreateDraftManuscriptResult {
  return writeContentFarmDraftManuscript({
    contentDir,
    input,
    author: KOIOS_EDITOR,
    license: KOIOS_DEFAULT_LICENSE,
    licenseUrl: KOIOS_DEFAULT_LICENSE_URL,
    syndicationRights: KOIOS_DEFAULT_SYNDICATION_RIGHTS,
    category: "News",
    now: dayStamp,
    extraFrontMatter: Object.freeze({
      koios: Object.freeze({
        seo_term: input.seoTerm,
        beat: input.beat,
        gates_clear: false,
        ...(input.assignmentId === undefined ? {} : { assignment_id: input.assignmentId }),
      }),
    }),
  }).result;
}

export { referencesFromSourceUrls } from "../sourcing/reference-normalization.mts";
