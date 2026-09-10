// content.mts — the content store read: markdown posts (content/posts)
// decoded through the front-matter codec and projected into news claim sets.
//
// Each post becomes a claim set whose cells carry the post's front matter as
// potential claims, cited to the post's provenance (its original permalink for
// the WordPress-era archive, the mill's gate trail for new posts). A post that
// shipped (draft: false) carries its editorial gates as claimed evidence —
// the archive posts were published on the predecessor site; that publication
// is the witness. Draft posts assert no status and stay withheld.
import { contentFarmPostClaimSet, readContentFarmPostFile, readContentFarmPostFiles, } from "@emsenn/organizing-a-content-farm";
import { renderMarkdownWithBibliography } from "./researching/sourcing/bibliography.mjs";
function maybeString(value) {
    if (value === undefined || value === null || value === "")
        return undefined;
    return String(value);
}
/** Project a decoded post document into a news claim set. */
export function postClaimSet(slug, document) {
    return contentFarmPostClaimSet({ slug, document, fallbackCitation: `koios:post:${slug}` });
}
function postFromReading(reading) {
    const document = reading.document;
    const slug = reading.slug;
    const claimSet = reading.claims.claimSet;
    const author = maybeString(document.frontMatter["author"]);
    return Object.freeze({
        slug,
        document,
        claimSet,
        wireInput: Object.freeze({
            algebra: claimSet,
            slug,
            bodyHtml: `<article>${renderMarkdownWithBibliography(document.body, document.frontMatter)}</article>`,
            ...(author === undefined ? {} : { author }),
        }),
    });
}
/** Decode one post file into its store reading. */
export function postFromFile(path) {
    return postFromReading(readContentFarmPostFile(path, {
        fallbackCitation: (slug) => `koios:post:${slug}`,
    }));
}
/** Read every post in the content store (ignores section index files). */
export function loadPosts(dir) {
    return Object.freeze(readContentFarmPostFiles(dir, {
        fallbackCitation: (slug) => `koios:post:${slug}`,
    }).map(postFromReading));
}
//# sourceMappingURL=content.mjs.map