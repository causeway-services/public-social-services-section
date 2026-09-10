import { type SeedKeyword } from "../../demand.mjs";
import { type ContentFarmTaxonomyKind, type ContentFarmTaxonomyReading } from "@emsenn/organizing-a-content-farm";
export type TaxonomyKind = ContentFarmTaxonomyKind;
export type TaxonomyReading = ContentFarmTaxonomyReading;
export declare function taxonomyReading(input: Readonly<{
    taxonomy: TaxonomyKind;
    slug: string;
    title: string;
    count: number;
    url: string;
    latestPublished?: string;
    seeds?: readonly SeedKeyword[];
}>): TaxonomyReading;
//# sourceMappingURL=taxonomy.d.mts.map