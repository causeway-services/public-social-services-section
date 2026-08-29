import { type ApplyStandardsDefaultsResult, type NormalizeManuscriptReferencesResult, type PublishManuscriptResult, type RepairManuscriptHeadingsResult, type RepairManuscriptSeoHeadingResult, type StandardsReview, type FrontMatterDocument } from "@emsenn/organizing-a-content-farm";
export type { ApplyStandardsDefaultsResult, NormalizeManuscriptReferencesResult, PublishManuscriptResult, RepairManuscriptHeadingsResult, RepairManuscriptSeoHeadingResult, StandardsFinding, StandardsReview, StandardsSeverity, } from "@emsenn/organizing-a-content-farm";
type EditorialAcceptance = Readonly<{
    kind?: unknown;
    slug?: unknown;
    manuscriptDigest?: unknown;
    disposition?: unknown;
    publishable?: unknown;
    serviceAccepted?: unknown;
    provider?: unknown;
    model?: unknown;
    contract?: unknown;
    report?: unknown;
    selectedTool?: unknown;
    toolSelectionValidated?: unknown;
    toolSelectionDigest?: unknown;
    transition?: unknown;
}>;
export declare const KOIOS_DEFAULT_LICENSE = "CC BY 4.0";
export declare const KOIOS_DEFAULT_LICENSE_URL = "https://creativecommons.org/licenses/by/4.0/";
export declare const KOIOS_DEFAULT_SYNDICATION_RIGHTS = "Licensed under Creative Commons Attribution 4.0 International; Koios.News permits indexing, snippets, large image previews, feed distribution, Google Search/News/Discover surfaces, and other attributed downstream syndication.";
export declare function reviewManuscriptDocument(path: string, slug: string, document: FrontMatterDocument): StandardsReview;
export declare function reviewManuscriptStandards(contentDir: string, slug: string): StandardsReview;
export type PublicationAdmission = Readonly<{
    slug: string;
    publishable: boolean;
    standards: StandardsReview;
    editorialAcceptance: boolean;
    manuscriptDigest: string;
    acceptance?: EditorialAcceptance;
}>;
/** Read the whole publication gate without changing the manuscript. */
export declare function reviewPublicationAdmission(contentDir: string, slug: string): PublicationAdmission;
export declare function applyStandardsMetadataDefaults(contentDir: string, slug: string): ApplyStandardsDefaultsResult;
export declare function normalizeManuscriptReferences(contentDir: string, slug: string): NormalizeManuscriptReferencesResult;
export declare function repairManuscriptHeadings(contentDir: string, slug: string): RepairManuscriptHeadingsResult;
export declare function repairManuscriptSeoHeading(contentDir: string, slug: string): RepairManuscriptSeoHeadingResult;
export type RepairManuscriptEditorialSurfacesResult = Readonly<{
    slug: string;
    path: string;
    changed: readonly string[];
    review: StandardsReview;
}>;
export declare function capitalizeIndigenousInProse(markdown: string): string;
/** Repair carrier-level editorial surfaces without asking a model to emit
 * frontmatter. All text is extracted from already admitted manuscript text. */
export declare function repairManuscriptEditorialSurfaces(contentDir: string, slug: string): RepairManuscriptEditorialSurfacesResult;
export declare function publishManuscript(contentDir: string, slug: string): PublishManuscriptResult;
//# sourceMappingURL=standards.d.mts.map