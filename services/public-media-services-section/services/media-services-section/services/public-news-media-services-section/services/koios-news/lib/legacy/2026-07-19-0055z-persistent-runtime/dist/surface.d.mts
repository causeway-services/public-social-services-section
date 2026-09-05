import { type Theme, type ThemeContext } from "@emsenn/computing-with-the-web/theming";
import type { Resource } from "@emsenn/http-server";
import { publicItems, type MillItem, type MillMasthead, type GateReport } from "@emsenn/organizing-a-content-mill";
import type { KoiosPost } from "./content.mjs";
/** The site identity the surfaces render under — the mill's masthead, plus the
 * koios theme the item pages are wrapped in. */
export type KoiosMasthead = MillMasthead & Readonly<{
    theme?: Theme;
    themeContext?: ThemeContext;
}>;
/** A post projected for the wire surfaces — the mill's lossy item view. */
export type KoiosItem = MillItem;
export type PublicationAuthority = "exact-editorial-acceptance" | "predecessor-publication-witness";
export { publicItems };
/** Project one post into a wire item by reading the cells koios wrote. */
export declare function koiosItem(post: KoiosPost, masthead: KoiosMasthead): KoiosItem;
/** Every post as a wire item. */
export declare function koiosItems(posts: readonly KoiosPost[], masthead: KoiosMasthead): readonly KoiosItem[];
/** The three feed serializations over the public items. */
export declare function koiosFeeds(masthead: KoiosMasthead, items: readonly KoiosItem[]): Readonly<{
    rss: string;
    atom: string;
    jsonFeed: string;
}>;
/** The gate report for every shipped post: koios's editorial gates are public. */
export declare function auditReports(posts: readonly KoiosPost[]): readonly GateReport[];
/** One item page: the mill's formed body (h-entry + provenance + NewsArticle
 * JSON-LD), wrapped in the masthead's theme. */
export declare function itemPageHtml(post: KoiosPost, item: KoiosItem, masthead: KoiosMasthead, theme: Theme, items?: readonly KoiosItem[], posts?: readonly KoiosPost[], publicationAuthority?: PublicationAuthority): string;
/** Every wire surface as web Resources: the three feeds, both sitemaps, robots,
 * the ninjs records, the gate audit, and the item pages. The homepage/about/etc
 * are the site's own (index.mts); these are the wire's distribution surfaces. */
export declare function surfaceResources(masthead: KoiosMasthead, items: readonly KoiosItem[], posts: readonly KoiosPost[], theme: Theme, publicationAuthorities?: ReadonlyMap<string, PublicationAuthority>): readonly Resource[];
//# sourceMappingURL=surface.d.mts.map