// content.mts — the content store read: markdown posts (content/posts)
// decoded through the front-matter codec and projected into news claim sets.
//
// Each post becomes a claim set whose cells carry the post's front matter as
// potential claims, cited to the post's provenance (its original permalink for
// the WordPress-era archive, the mill's gate trail for new posts). A post that
// shipped (draft: false) carries its editorial gates as claimed evidence —
// the archive posts were published on the predecessor site; that publication
// is the witness. Draft posts assert no status and stay withheld.

import {
  contentFarmPostClaimSet,
  readContentFarmPostFile,
  readContentFarmPostFiles,
  type ContentFarmPostFileReading,
  type FrontMatterDocument,
  type NewsClaimSet,
} from "@red-cup-engineering/organizing-a-content-farm";

import { renderMarkdownWithBibliography } from "./researching/sourcing/bibliography.mts";

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

function maybeString(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  return String(value);
}

/** Project a decoded post document into a news claim set. */
export function postClaimSet(slug: string, document: FrontMatterDocument): NewsClaimSet {
  return contentFarmPostClaimSet({ slug, document, fallbackCitation: `koios:post:${slug}` });
}

function postFromReading(reading: ContentFarmPostFileReading): KoiosPost {
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
export function postFromFile(path: string): KoiosPost {
  return postFromReading(readContentFarmPostFile(path, {
    fallbackCitation: (slug) => `koios:post:${slug}`,
  }));
}

/** Read every post in the content store (ignores section index files). */
export function loadPosts(dir: string): readonly KoiosPost[] {
  return Object.freeze(readContentFarmPostFiles(dir, {
    fallbackCitation: (slug) => `koios:post:${slug}`,
  }).map(postFromReading));
}
