import { type EditorialStandardsReading as ContentEditorialStandardsReading } from "@emsenn/organizing-a-content-farm";
import { type ContentArchiveMonthReading, type ContentArchiveReading, type ContentArchiveYearReading } from "@emsenn/organizing-a-content-mill";
import { type App } from "@emsenn/http-server";
import { type KoiosThemeContext } from "./theme.mjs";
import { type KoiosItem, type KoiosMasthead } from "./surface.mjs";
import { type TaxonomyReading } from "./researching/sourcing/taxonomy.mjs";
export { KOIOS_DESCRIPTION, KOIOS_EDITOR, KOIOS_SITE_URL, KOIOS_TAGLINE, KOIOS_TITLE, DEFAULT_CONTENT_DIR, DEFAULT_DATA_DIR } from "./config.mjs";
export type KoiosSiteOptions = Readonly<{
    contentDir?: string;
    dataDir?: string;
    siteUrl?: string;
    adClient?: string;
    adSlots?: KoiosThemeContext["adSlots"];
    /** Disable all ad carriers for a non-authoritative shadow projection. */
    advertising?: boolean;
    /** Disable the mutable POST /hit beacon while retaining the live default. */
    beacon?: boolean;
    /**
     * `exact` admits only exact-manuscript independent acceptances.
     * `public-record` additionally carries predecessor-published articles during
     * controlled migration, while exposing that distinct authority publicly.
     * `legacy` preserves the predecessor server's historical behavior only.
     */
    editorialAdmission?: "legacy" | "public-record" | "exact";
    /** Frozen canonical routes witnessed on the predecessor publication. */
    predecessorPublicRoutes?: readonly string[];
    /** Day-stamp supplier for view witnesses; defaults to wall-clock testimony. */
    day?: () => string;
}>;
export declare function koiosMasthead(options?: KoiosSiteOptions): KoiosMasthead;
/** The site's wire items over the content store. */
export declare function koiosWireItems(options?: KoiosSiteOptions): readonly KoiosItem[];
export type SectionReading = Omit<TaxonomyReading, "kind" | "taxonomy"> & Readonly<{
    kind: "koios.section";
}>;
export type TagReading = Omit<TaxonomyReading, "kind" | "taxonomy"> & Readonly<{
    kind: "koios.tag";
}>;
export type ArchiveMonthReading = ContentArchiveMonthReading;
export type ArchiveYearReading = ContentArchiveYearReading;
export type ArchiveReading = ContentArchiveReading;
export type EditorialStandardsReading = ContentEditorialStandardsReading;
export type PublicationAuthority = "exact-editorial-acceptance" | "predecessor-publication-witness";
export type PublicationProvenanceReading = Readonly<{
    kind: "koios.publication-provenance";
    policy: "public-record-carry-forward/v1" | "exact-editorial-acceptance/v1" | "legacy-unclassified";
    articleCount: number;
    exactAcceptanceCount: number;
    predecessorWitnessCount: number;
    articles: readonly Readonly<{
        slug: string;
        path: string;
        authority: PublicationAuthority;
        manuscriptDigest: string;
        deterministicStandards: boolean;
        exactEditorialAcceptance: boolean;
    }>[];
}>;
/** Create the served Koios.News app over the content store. */
export declare function createKoiosNewsSiteApp(options?: KoiosSiteOptions): App;
//# sourceMappingURL=index.d.mts.map