import { type Theme } from "@emsenn/computing-with-the-web/theming";
import { type AdPlacement, type AdPlacementDecision } from "@emsenn/organizing-a-content-mill";
export type KoiosThemeContext = Readonly<{
    /** The masthead byline; falls back to the page description when absent. */
    tagline?: string;
    /** AdSense (or compatible) publisher id, e.g. "ca-pub-…". Absent → no ad markup at all. */
    adClient?: string;
    /** Ad slot ids by position. Only positions present render. */
    adSlots?: Readonly<{
        header?: string;
        inArticle?: string;
        footer?: string;
    }>;
    /** Enable the first-party view beacon (POST /hit). */
    beacon?: boolean;
    /** Absolute or site-relative social preview image for this rendering. */
    socialImage?: string;
    /** Media type for the social preview image when the URL alone is ambiguous. */
    socialImageType?: string;
    /** Human alternative text for social preview images. */
    socialImageAlt?: string;
    /** Open Graph locale, e.g. en_US. */
    socialLocale?: string;
    /** Article first-publication timestamp for Open Graph article metadata. */
    articlePublishedTime?: string;
    /** Article last-modified timestamp for Open Graph article metadata. */
    articleModifiedTime?: string;
    /** Article author profile URL for Open Graph article metadata. */
    articleAuthor?: string;
    /** Article section for Open Graph article metadata. */
    articleSection?: string;
    /** Article tags for Open Graph article metadata. */
    articleTags?: readonly string[];
    /** Article fingerprint carrier exposed beside the SVG glyph. */
    articleFingerprintJson?: string;
    /** Site-wide A-Ads units available until AdSense takes over. */
    aAdsUnits?: readonly string[];
    /** Suppress the site-wide masthead A-Ads slot on pages with their own lead inventory. */
    suppressMastheadAAds?: boolean;
}>;
export declare const DEFAULT_A_ADS_UNITS: readonly string[];
export declare function chooseAAdsPlacement(key: string, placement: AdPlacement, units?: readonly string[]): AdPlacementDecision;
export declare function declaredAAdsPlacement(unit: string | undefined, placement: AdPlacement, key: string): AdPlacementDecision | undefined;
export declare function aAdsSlotHtml(decision: AdPlacementDecision | undefined): string;
export declare const koiosTheme: Theme;
//# sourceMappingURL=theme.d.mts.map