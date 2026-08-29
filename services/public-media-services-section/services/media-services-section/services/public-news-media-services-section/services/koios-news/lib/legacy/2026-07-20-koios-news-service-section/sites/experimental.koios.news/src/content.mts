import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import {
  articleCarrier,
  cell,
  charge,
  chargeValue,
  claim,
  composeFibers,
  mark,
  meme,
  predicateOfClaim,
  predicationSite,
  token,
  type Article,
  type Meme,
  type Valuation,
} from "@emsenn/metroplat";
import { vaultToCarriers, type VaultArticleCarrier } from "@emsenn/metroplat/codecs/text/markdown/vault";

export type KoiosReference = Readonly<{
  id: string;
  type: string;
  title: string;
  URL: string;
  "container-title"?: string;
  issued?: string | number | Readonly<{ "date-parts": readonly (readonly number[])[] }>;
}>;

export type KoiosCorrection = NonNullable<Article["corrections"]>[number];

export type KoiosMeta = Readonly<{
  seo_term?: string;
  tweet?: string;
  beat?: string;
  gates_clear?: boolean;
  standards_reviewed_at?: string;
}>;

export type KoiosFrontMatter = Readonly<{
  title: string;
  date: string;
  draft: boolean;
  author?: string;
  description?: string;
  summary?: string;
  keywords: readonly string[];
  categories: readonly string[];
  tags: readonly string[];
  koios: KoiosMeta;
  references: readonly KoiosReference[];
  corrections: readonly KoiosCorrection[];
  license?: string;
  license_url?: string;
  syndication_rights?: string;
}>;

export type KoiosClaimProjection = Readonly<{
  kind: "koios.news.claim-projection";
  article: Article;
  memes: readonly Meme[];
  valuation: Valuation;
  provenance: readonly KoiosReference[];
}>;

export type KoiosPost = Readonly<{
  slug: string;
  frontMatter: KoiosFrontMatter;
  article: Article;
  bodyHtml: string;
  claims: KoiosClaimProjection;
}>;

export type KoiosMasthead = Readonly<{
  title: "Koios.News";
  siteUrl: "https://koios.news";
  author: Readonly<{ name: "Nik Koios"; url: "/about" }>;
  publisher: "Koios.News";
  language: "en";
  itemPath: "/posts";
}>;

export type KoiosItem = Readonly<{
  slug: string;
  headline: string;
  summary: string;
  url: string;
  published: string;
  section?: string;
  keywords: readonly string[];
  author: string;
  isPublic: boolean;
  image?: string;
}>;

export const koiosMasthead: KoiosMasthead = Object.freeze({
  title: "Koios.News",
  siteUrl: "https://koios.news",
  author: Object.freeze({ name: "Nik Koios", url: "/about" }),
  publisher: "Koios.News",
  language: "en",
  itemPath: "/posts",
});

function record(value: unknown): Readonly<Record<string, unknown>> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Readonly<Record<string, unknown>>
    : Object.freeze({});
}

function maybeString(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  return String(value);
}

function requiredString(value: unknown, field: string): string {
  const text = maybeString(value);
  if (text === undefined) throw new TypeError(`Koios post frontmatter missing ${field}`);
  return text;
}

function booleanValue(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return false;
}

function strings(value: unknown): readonly string[] {
  if (value === undefined || value === null || value === "") return Object.freeze([]);
  if (Array.isArray(value)) return Object.freeze(value.flatMap((item) => strings(item)));
  return Object.freeze([String(value)]);
}

function reference(value: unknown): KoiosReference | null {
  const source = record(value);
  const id = maybeString(source["id"]);
  const type = maybeString(source["type"]);
  const title = maybeString(source["title"]);
  const URL = maybeString(source["URL"]);
  if (id === undefined || type === undefined || title === undefined || URL === undefined) return null;
  const containerTitle = maybeString(source["container-title"]);
  const issued = issuedDate(source["issued"]);
  return Object.freeze({
    id,
    type,
    title,
    URL,
    ...(containerTitle === undefined ? {} : { "container-title": containerTitle }),
    ...(issued === undefined ? {} : { issued }),
  });
}

function issuedDate(value: unknown): KoiosReference["issued"] | undefined {
  if (typeof value === "string" || typeof value === "number") return value;
  const dateParts = cslDateParts(value);
  if (dateParts !== undefined) return Object.freeze({ "date-parts": dateParts });
  if (Array.isArray(value) && value.length > 0) {
    const first = cslDateParts(value[0]);
    if (first !== undefined) return Object.freeze({ "date-parts": first });
  }
  return undefined;
}

function cslDateParts(value: unknown): readonly (readonly number[])[] | undefined {
  const source = record(value);
  const existing = source["date-parts"];
  if (Array.isArray(existing)) {
    return Object.freeze(existing.flatMap((part) =>
      Array.isArray(part) && part.every((item) => typeof item === "number")
        ? [Object.freeze([...part]) as readonly number[]]
        : []));
  }
  const year = source["year"];
  if (typeof year !== "number") return undefined;
  const month = source["month"];
  const day = source["day"];
  return Object.freeze([Object.freeze([
    year,
    ...(typeof month === "number" ? [month] : []),
    ...(typeof day === "number" ? [day] : []),
  ])]);
}

function references(value: unknown): readonly KoiosReference[] {
  if (!Array.isArray(value)) return Object.freeze([]);
  return Object.freeze(value.flatMap((item) => {
    const parsed = reference(item);
    return parsed === null ? [] : [parsed];
  }));
}

function correction(value: unknown): KoiosCorrection | null {
  const source = record(value);
  const code = maybeString(source["code"]);
  const message = maybeString(source["message"]);
  const severity = maybeString(source["severity"]);
  if (code === undefined || message === undefined) return null;
  if (severity !== "error" && severity !== "warning" && severity !== "note") return null;
  const gate = maybeString(source["gate"]);
  const href = maybeString(source["href"]);
  return Object.freeze({
    code,
    message,
    severity,
    ...(gate === undefined ? {} : { gate }),
    ...(href === undefined ? {} : { href }),
  });
}

function corrections(value: unknown): readonly KoiosCorrection[] {
  if (!Array.isArray(value)) return Object.freeze([]);
  return Object.freeze(value.flatMap((item) => {
    const parsed = correction(item);
    return parsed === null ? [] : [parsed];
  }));
}

function koiosMeta(value: unknown): KoiosMeta {
  const source = record(value);
  const seoTerm = maybeString(source["seo_term"]);
  const tweet = maybeString(source["tweet"]);
  const beat = maybeString(source["beat"]);
  const standardsReviewedAt = maybeString(source["standards_reviewed_at"]);
  const gatesClear = source["gates_clear"];
  return Object.freeze({
    ...(seoTerm === undefined ? {} : { seo_term: seoTerm }),
    ...(tweet === undefined ? {} : { tweet }),
    ...(beat === undefined ? {} : { beat }),
    ...(typeof gatesClear === "boolean" ? { gates_clear: gatesClear } : {}),
    ...(standardsReviewedAt === undefined ? {} : { standards_reviewed_at: standardsReviewedAt }),
  });
}

function frontMatterOf(source: Readonly<Record<string, unknown>>): KoiosFrontMatter {
  return Object.freeze({
    title: requiredString(source["title"], "title"),
    date: requiredString(source["date"], "date"),
    draft: booleanValue(source["draft"]),
    ...(maybeString(source["author"]) === undefined ? {} : { author: maybeString(source["author"])! }),
    ...(maybeString(source["description"]) === undefined ? {} : { description: maybeString(source["description"])! }),
    ...(maybeString(source["summary"]) === undefined ? {} : { summary: maybeString(source["summary"])! }),
    keywords: strings(source["keywords"]),
    categories: strings(source["categories"]),
    tags: strings(source["tags"]),
    koios: koiosMeta(source["koios"]),
    references: references(source["references"]),
    corrections: corrections(source["corrections"]),
    ...(maybeString(source["license"]) === undefined ? {} : { license: maybeString(source["license"])! }),
    ...(maybeString(source["license_url"]) === undefined ? {} : { license_url: maybeString(source["license_url"])! }),
    ...(maybeString(source["syndication_rights"]) === undefined ? {} : { syndication_rights: maybeString(source["syndication_rights"])! }),
  });
}

function articleOf(slug: string, frontMatter: KoiosFrontMatter, body: string): Article {
  const koios = Object.freeze({
    ...frontMatter.koios,
  });
  const candidate = {
    title: frontMatter.title,
    slug,
    author: frontMatter.author ?? koiosMasthead.author.name,
    date: frontMatter.date,
    draft: frontMatter.draft,
    ...(frontMatter.description === undefined ? {} : { description: frontMatter.description }),
    ...(frontMatter.summary === undefined ? {} : { summary: frontMatter.summary }),
    ...(frontMatter.koios.beat === undefined ? {} : { beat: frontMatter.koios.beat, section: frontMatter.koios.beat }),
    ...(frontMatter.koios.seo_term === undefined ? {} : { seoTerm: frontMatter.koios.seo_term }),
    ...(frontMatter.keywords.length === 0 ? {} : { keywords: frontMatter.keywords }),
    ...(frontMatter.categories.length === 0 ? {} : { categories: frontMatter.categories }),
    ...(frontMatter.tags.length === 0 ? {} : { tags: frontMatter.tags }),
    ...(Object.keys(koios).length === 0 ? {} : { koios }),
    ...(frontMatter.references.length === 0 ? {} : { references: frontMatter.references }),
    ...(frontMatter.corrections.length === 0 ? {} : { corrections: frontMatter.corrections }),
    ...(frontMatter.license === undefined ? {} : { license: frontMatter.license }),
    ...(frontMatter.license_url === undefined ? {} : { license_url: frontMatter.license_url }),
    ...(frontMatter.syndication_rights === undefined ? {} : { syndication_rights: frontMatter.syndication_rights }),
    body,
  };
  return articleCarrier.assert(candidate, `koios post ${slug}`) as Article;
}

function claimEvidence(slug: string, frontMatter: KoiosFrontMatter) {
  const witnesses = frontMatter.references.length === 0
    ? [mark({ kind: "koios.post.provenance", slug })]
    : frontMatter.references.map((item) => mark({ kind: "koios.reference", slug, reference: item }));
  return Object.freeze([Object.freeze(witnesses), Object.freeze([])] as const);
}

function claimMeme(slug: string, predicate: string, object: unknown, frontMatter: KoiosFrontMatter): Meme {
  return meme(
    cell(
      token(mark(`koios:post:${slug}`)),
      predicateOfClaim(claim(mark(predicate))),
      token(mark(object)),
    ),
    charge(chargeValue("potential"), claimEvidence(slug, frontMatter)),
  );
}

function postClaims(slug: string, frontMatter: KoiosFrontMatter, article: Article): KoiosClaimProjection {
  const fieldClaims: readonly Readonly<{ predicate: string; object: unknown }>[] = Object.freeze([
    { predicate: "article.title", object: frontMatter.title },
    { predicate: "article.date", object: frontMatter.date },
    { predicate: "article.author", object: frontMatter.author ?? koiosMasthead.author.name },
    { predicate: "article.summary", object: frontMatter.summary ?? frontMatter.description ?? "" },
    { predicate: "article.section", object: frontMatter.koios.beat ?? frontMatter.categories[0] ?? "" },
    ...frontMatter.keywords.map((keyword) => ({ predicate: "article.keyword", object: keyword })),
    ...frontMatter.categories.map((category) => ({ predicate: "article.category", object: category })),
    ...frontMatter.tags.map((tag) => ({ predicate: "article.tag", object: tag })),
    ...frontMatter.references.map((item) => ({ predicate: "article.references", object: item.URL })),
    ...(frontMatter.license === undefined ? [] : [{ predicate: "article.license", object: frontMatter.license }]),
    ...(frontMatter.license_url === undefined ? [] : [{ predicate: "article.license_url", object: frontMatter.license_url }]),
    { predicate: "article.publication.gates_clear", object: frontMatter.koios.gates_clear === true },
  ].filter((entry) => entry.object !== ""));
  const memes = Object.freeze(fieldClaims.map((entry) => claimMeme(slug, entry.predicate, entry.object, frontMatter)));
  const site = predicationSite(memes.map((item) => item.cell));
  return Object.freeze({
    kind: "koios.news.claim-projection" as const,
    article,
    memes,
    valuation: composeFibers(memes, site.base),
    provenance: frontMatter.references,
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;");
}

function renderInlineMarkdown(value: string): string {
  return escapeHtml(value)
    .replace(/`([^`]+)`/gu, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/gu, (_match, label: string, href: string) => {
      if (/^(?:javascript|data):/iu.test(href)) return label;
      return `<a href="${escapeHtml(href)}">${label}</a>`;
    });
}

export function renderMarkdownBody(markdown: string): string {
  const normalized = markdown.replace(/\r\n?/gu, "\n").trim();
  if (normalized === "") return "<article></article>";
  const lines = normalized.split("\n");
  const blocks: string[] = [];
  for (let index = 0; index < lines.length;) {
    const line = lines[index]!;
    if (line.trim() === "") {
      index++;
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.+)$/u);
    if (heading !== null) {
      const level = heading[1]!.length;
      blocks.push(`<h${level}>${renderInlineMarkdown(heading[2]!)}</h${level}>`);
      index++;
      continue;
    }
    const paragraph: string[] = [];
    while (index < lines.length && lines[index]!.trim() !== "") {
      paragraph.push(lines[index]!.trim());
      index++;
    }
    blocks.push(`<p>${renderInlineMarkdown(paragraph.join(" "))}</p>`);
  }
  return `<article>\n${blocks.join("\n")}\n</article>`;
}

function postFromCarrier(carrier: VaultArticleCarrier): KoiosPost {
  const frontMatter = frontMatterOf(carrier.frontMatter);
  const article = articleOf(carrier.carrier.slug, frontMatter, carrier.carrier.body);
  return Object.freeze({
    slug: article.slug,
    frontMatter,
    article,
    bodyHtml: renderMarkdownBody(article.body),
    claims: postClaims(article.slug, frontMatter, article),
  });
}

async function vaultFilesFromDir(dir: string): Promise<Readonly<Record<string, string>>> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: Record<string, string> = {};
  for (const entry of entries) {
    if (!entry.isFile() || !/\.md$/iu.test(entry.name)) continue;
    files[entry.name] = await readFile(join(dir, entry.name), "utf8");
  }
  return Object.freeze(files);
}

export async function loadPosts(dir: string): Promise<readonly KoiosPost[]> {
  const ingestion = vaultToCarriers(await vaultFilesFromDir(dir));
  return Object.freeze(ingestion.carriers
    .filter((carrier): carrier is VaultArticleCarrier => carrier.kind === "article")
    .map(postFromCarrier)
    .filter((post) => !post.frontMatter.draft)
    .sort((left, right) => right.frontMatter.date.localeCompare(left.frontMatter.date) || left.slug.localeCompare(right.slug)));
}

export function koiosItem(post: KoiosPost, masthead: KoiosMasthead = koiosMasthead): KoiosItem {
  const url = `${masthead.siteUrl}${masthead.itemPath}/${encodeURIComponent(post.slug)}`;
  const fingerprint = `${masthead.siteUrl}/fingerprints/${encodeURIComponent(post.slug)}.png`;
  return Object.freeze({
    slug: post.slug,
    headline: post.frontMatter.title,
    summary: post.frontMatter.summary ?? post.frontMatter.description ?? "",
    url,
    published: post.frontMatter.date,
    ...(post.frontMatter.koios.beat === undefined ? {} : { section: post.frontMatter.koios.beat }),
    keywords: Object.freeze([...post.frontMatter.keywords]),
    author: post.frontMatter.author ?? masthead.author.name,
    isPublic: !post.frontMatter.draft && post.frontMatter.koios.gates_clear !== false,
    image: fingerprint,
  });
}

export function koiosItems(posts: readonly KoiosPost[], masthead: KoiosMasthead = koiosMasthead): readonly KoiosItem[] {
  return Object.freeze(posts.map((post) => koiosItem(post, masthead)));
}
