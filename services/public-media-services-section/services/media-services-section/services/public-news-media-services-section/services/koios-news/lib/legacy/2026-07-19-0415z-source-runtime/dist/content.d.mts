import { type FrontMatterDocument, type NewsClaimSet } from "@emsenn/organizing-a-content-farm";
/** A post projected for the wire: its canonical claim set plus the rendered
 * body. (Koios's own shape — the standalone newswire package is retired; the
 * surfaces are rendered at the site, see surface.mts.) */
export type KoiosWireInput = Readonly<{
    algebra: NewsClaimSet;
    slug: string;
    bodyHtml: string;
    author?: string;
}>;
export type KoiosPost = Readonly<{
    slug: string;
    document: FrontMatterDocument;
    claimSet: NewsClaimSet;
    wireInput: KoiosWireInput;
}>;
/** Project a decoded post document into a news claim set. */
export declare function postClaimSet(slug: string, document: FrontMatterDocument): NewsClaimSet;
/** Decode one post file into its store reading. */
export declare function postFromFile(path: string): KoiosPost;
/** Read every post in the content store (ignores section index files). */
export declare function loadPosts(dir: string): readonly KoiosPost[];
//# sourceMappingURL=content.d.mts.map