import type { KoiosPost } from "../../content.mjs";
import { type KoiosItem, type KoiosMasthead } from "../../surface.mjs";
import { type BibliographyReference, type SiteBibliographyReading } from "@emsenn/organizing-a-content-mill";
export type { BibliographyReference, CitedArticle, DomainBibliographyReading, DomainReferenceReading, SiteBibliographyReading, SourceKind, } from "@emsenn/organizing-a-content-mill";
export declare function referencesFromFrontMatter(frontMatter: Readonly<Record<string, unknown>>): readonly BibliographyReference[];
export declare function citedReferenceIds(markdown: string): readonly string[];
export declare function renderMarkdownWithBibliography(markdown: string, frontMatter: Readonly<Record<string, unknown>>): string;
export declare function bibliographyReading(posts: readonly KoiosPost[], items: readonly KoiosItem[], masthead: KoiosMasthead): SiteBibliographyReading;
//# sourceMappingURL=bibliography.d.mts.map