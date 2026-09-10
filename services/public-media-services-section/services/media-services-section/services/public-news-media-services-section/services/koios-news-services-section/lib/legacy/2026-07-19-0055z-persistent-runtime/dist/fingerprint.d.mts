import { type ArticleFingerprint as ContentArticleFingerprint, type ArticleFingerprintFacts as ContentArticleFingerprintFacts } from "@emsenn/organizing-a-content-mill";
import type { KoiosPost } from "./content.mjs";
import type { KoiosItem, KoiosMasthead } from "./surface.mjs";
export type ArticleFingerprintFacts = ContentArticleFingerprintFacts;
export type ArticleFingerprint = ContentArticleFingerprint;
export declare function articleFingerprintFacts(post: KoiosPost, item: KoiosItem, masthead: KoiosMasthead): ArticleFingerprintFacts;
export declare function articleFingerprint(post: KoiosPost, item: KoiosItem, masthead: KoiosMasthead): ArticleFingerprint;
export declare function articleFingerprintJson(post: KoiosPost, item: KoiosItem, masthead: KoiosMasthead): string;
export declare function articleFingerprintSvg(post: KoiosPost, item: KoiosItem, masthead: KoiosMasthead): string;
export declare function articleFingerprintPng(post: KoiosPost, item: KoiosItem, masthead: KoiosMasthead): Buffer;
export declare function articleFingerprintFigure(item: KoiosItem): string;
export declare function articleFingerprintImage(item: KoiosItem, loading?: "eager" | "lazy"): string;
//# sourceMappingURL=fingerprint.d.mts.map