import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { projectWebFeedArtifacts } from "@red-cup-engineering/project-web-feed-artifacts-service";

const HOME_PAGE_URL = "https://koios.news";
const CHANNEL_TITLE = "Koios.News — Wire";
const CHANNEL_DESCRIPTION = "Syndicated source coverage tracked by Koios.News.";
const LANGUAGE = "en";
const PUBLICATION_NAME = "Koios.News";
// Google News accepts only recently published articles; the legacy carrier
// used the same two-day window off the newest admitted item.
const NEWS_SITEMAP_WINDOW_MS = 2 * 24 * 60 * 60 * 1000;
const NEWS_SITEMAP_MAX_URLS = 1000;
// RSS/Atom/JSON Feed carry the newest items only; wire.json carries the whole store.
const FEED_MAX_ITEMS = 200;
// XML 1.0 cannot represent these C0 controls.
const XML_INVALID_CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u;

function bytewise(left, right) {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

function escapeXml(value) {
  return String(value).replace(/[&<>"']/gu, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]);
}

function toRfc3339(raw) {
  const parsed = new Date(raw);
  return Number.isNaN(parsed.valueOf()) ? undefined : parsed.toISOString();
}

function firstClaimValue(claims, predicate) {
  const claim = claims.find((claim_) => claim_?.proposition?.predicate === predicate);
  return claim === undefined ? undefined : claim.proposition.object;
}

/**
 * Lists every `{subject, claims}` JSON file beneath a koios claim-store root,
 * one subdirectory per category, in deterministic (category, then path)
 * order.
 *
 * @param {string} storeRoot Path to a koios claim-store root, e.g.
 *   `sites/koios.news/store`.
 * @returns {readonly {category: string, path: string}[]}
 * @throws {TypeError} When `storeRoot` is not a non-empty string.
 * @throws {Error} When `storeRoot` does not exist or is not a directory.
 */
export function listStoreClaimFiles(storeRoot) {
  if (typeof storeRoot !== "string" || storeRoot.length === 0) throw new TypeError("storeRoot must be a non-empty string");
  if (!existsSync(storeRoot) || !statSync(storeRoot).isDirectory()) throw new Error(`store root does not exist: ${storeRoot}`);
  const categories = readdirSync(storeRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  return Object.freeze(categories.flatMap((category) =>
    readdirSync(join(storeRoot, category), { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map((entry) => Object.freeze({ category, path: join(storeRoot, category, entry.name) }))
      .sort((left, right) => bytewise(left.path, right.path))));
}

/**
 * Reads and validates one store claim file, extracting the flat wire fields
 * (`title`, `url`, `summary`, `published`) the feed projection needs from its
 * `{subject, claims: [{proposition: {predicate, object}}]}` shape.
 *
 * @param {{category: string, path: string}} entry
 * @returns {{category: string, subject: string, url: string, title: string,
 *   summary: string|undefined, publishedRaw: string|undefined}}
 * @throws {Error} When the file is not valid claim JSON, or is missing a
 *   required `title`/`url` claim, or carries a value XML cannot represent.
 */
export function readStoreArticle({ category, path }) {
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`store file is not valid JSON: ${path}: ${error.message}`);
  }
  if (parsed === null || typeof parsed !== "object" || typeof parsed.subject !== "string" || !Array.isArray(parsed.claims)) {
    throw new Error(`store file does not have the {subject, claims} shape: ${path}`);
  }
  const title = firstClaimValue(parsed.claims, "title");
  const url = firstClaimValue(parsed.claims, "url");
  const summary = firstClaimValue(parsed.claims, "summary");
  const publishedRaw = firstClaimValue(parsed.claims, "published");
  const witness = parsed.claims.map((claim) => claim?.provenance?.witness).find((value) => typeof value === "string" && value.trim() !== "");
  if (typeof title !== "string" || title.trim() === "") throw new Error(`${path}: title claim is required`);
  if (typeof url !== "string" || !/^https?:\/\//u.test(url)) throw new Error(`${path}: url claim must be an absolute http(s) URL`);
  for (const [field, value] of [["title", title], ["summary", summary]]) {
    if (typeof value === "string" && XML_INVALID_CONTROL.test(value)) throw new Error(`${path}: ${field} contains a control character not permitted in RSS or Atom`);
  }
  return Object.freeze({
    category,
    subject: parsed.subject,
    url,
    title: title.trim(),
    summary: typeof summary === "string" && summary.trim() !== "" ? summary.trim() : undefined,
    publishedRaw: typeof publishedRaw === "string" && publishedRaw.trim() !== "" ? publishedRaw.trim() : undefined,
    witness: witness === undefined ? undefined : witness.trim(),
    slug: basename(path, ".json"),
    claimCount: parsed.claims.length,
  });
}

/**
 * Reads every store claim file beneath `storeRoot` and merges articles that
 * share the same source URL (cross-filed under multiple categories) into one
 * feed item carrying every category as a tag. An item with no parseable
 * `published` claim is excluded and reported separately, newest-instance
 * fields winning on merge.
 *
 * @param {string} storeRoot
 * @returns {{items: readonly {id: string, url: string, title: string,
 *   summary: string|undefined, published: string, tags: readonly string[]}[],
 *   skipped: readonly {path: string, category: string, subject: string,
 *   reason: string}[]}} `items` sorted newest-published first.
 */
export function readStoreFeedItems(storeRoot) {
  const files = listStoreClaimFiles(storeRoot);
  const byUrl = new Map();
  const skipped = [];
  for (const entry of files) {
    const article = readStoreArticle(entry);
    const published = article.publishedRaw === undefined ? undefined : toRfc3339(article.publishedRaw);
    if (published === undefined) {
      skipped.push({ path: entry.path, category: article.category, subject: article.subject, reason: article.publishedRaw === undefined ? "missing published claim" : "unparseable published claim" });
      continue;
    }
    const existing = byUrl.get(article.url);
    if (existing === undefined) {
      byUrl.set(article.url, { id: article.url, url: article.url, title: article.title, summary: article.summary, published, tags: new Set([article.category]), sources: [{ category: article.category, slug: article.slug, witness: article.witness, claimCount: article.claimCount }] });
      continue;
    }
    existing.tags.add(article.category);
    existing.sources.push({ category: article.category, slug: article.slug, witness: article.witness, claimCount: article.claimCount });
    if (bytewise(published, existing.published) > 0) {
      existing.published = published;
      existing.title = article.title;
      existing.summary = article.summary;
    }
  }
  const items = [...byUrl.values()]
    .map((item) => Object.freeze({ ...item, tags: Object.freeze([...item.tags].sort()), sources: Object.freeze([...item.sources].sort((left, right) => bytewise(left.category, right.category) || bytewise(left.slug, right.slug))) }))
    .sort((left, right) => bytewise(right.published, left.published) || bytewise(left.url, right.url));
  return Object.freeze({ items: Object.freeze(items), skipped: Object.freeze(skipped) });
}

/**
 * Builds a Google News sitemap over the newest two days of items (Google
 * News accepts only recently published articles), capped at the format's
 * 1000-URL limit.
 *
 * @param {readonly {url: string, title: string, published: string}[]} items
 *   Feed items, newest-published first.
 * @returns {string}
 */
export function newsSitemapXml(items) {
  if (items.length === 0) {
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n</urlset>\n`;
  }
  const threshold = Date.parse(items[0].published) - NEWS_SITEMAP_WINDOW_MS;
  const urls = items.filter((item) => Date.parse(item.published) >= threshold).slice(0, NEWS_SITEMAP_MAX_URLS);
  const body = urls.map((item) => `  <url><loc>${escapeXml(item.url)}</loc><news:news><news:publication><news:name>${escapeXml(PUBLICATION_NAME)}</news:name><news:language>${escapeXml(LANGUAGE)}</news:language></news:publication><news:publication_date>${escapeXml(item.published)}</news:publication_date><news:title>${escapeXml(item.title)}</news:title></news:news></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n${body}\n</urlset>\n`;
}

/**
 * Projects a koios.news claim-store into RSS, Atom, and JSON Feed artifacts
 * via `@red-cup-engineering/project-web-feed-artifacts-service`, plus a
 * Google News sitemap. Pure over the store's on-disk bytes: reads the store,
 * writes nothing.
 *
 * @param {{storeRoot: string, paths?: {rss?: string, atom?: string,
 *   json?: string, newsSitemap?: string}}} input
 * @returns {{artifacts: readonly {path: string, body: string, mediaType:
 *   string, source: string}[], itemCount: number, skippedCount: number,
 *   skipped: readonly object[], newest: string|undefined, oldest:
 *   string|undefined}}
 */
export function projectStoreFeedArtifacts({ storeRoot, paths = {} }) {
  const { items, skipped } = readStoreFeedItems(storeRoot);
  const channel = { title: CHANNEL_TITLE, homePageUrl: HOME_PAGE_URL, description: CHANNEL_DESCRIPTION, language: LANGUAGE };
  const feedItems = items.slice(0, FEED_MAX_ITEMS).map(({ id, url, title, summary, published, tags }) => ({
    id, url, title, published,
    ...(summary === undefined ? {} : { summary }),
    ...(tags.length === 0 ? {} : { tags }),
  }));
  const feedArtifacts = projectWebFeedArtifacts({
    channel,
    items: feedItems,
    paths: { rss: paths.rss ?? "feed.xml", atom: paths.atom ?? "feed.atom", json: paths.json ?? "feed.json" },
  });
  const newsSitemapArtifact = Object.freeze({
    path: paths.newsSitemap ?? "news-sitemap.xml",
    body: newsSitemapXml(items),
    mediaType: "application/xml; charset=utf-8",
    source: "feed:news-sitemap",
  });
  const wireArtifact = Object.freeze({
    path: paths.wire ?? "wire.json",
    body: `${JSON.stringify({ kind: "koios.news.wire/v1", itemCount: items.length, skippedCount: skipped.length, newest: items[0]?.published, oldest: items.at(-1)?.published, items: items.map((item) => ({ url: item.url, title: item.title, ...(item.summary === undefined ? {} : { summary: item.summary }), published: item.published, tags: item.tags, sources: item.sources.map((source) => ({ category: source.category, slug: source.slug, ...(source.witness === undefined ? {} : { witness: source.witness }), claimCount: source.claimCount, claims: `claims/${source.category}/${source.slug}.json` })) })) }, null, 2)}\n`,
    mediaType: "application/json; charset=utf-8",
    source: "store:wire",
  });
  // The store itself, exposed verbatim: one claim object per article, byte-identical to disk.
  const claimArtifacts = listStoreClaimFiles(storeRoot).map((entry) => Object.freeze({ path: `claims/${entry.category}/${basename(entry.path)}`, body: readFileSync(entry.path, "utf8"), mediaType: "application/json; charset=utf-8", source: "store:claims" }));
  return Object.freeze({
    artifacts: Object.freeze([...feedArtifacts.artifacts, newsSitemapArtifact, wireArtifact, ...claimArtifacts]),
    itemCount: items.length,
    skippedCount: skipped.length,
    skipped,
    newest: items[0]?.published,
    oldest: items.at(-1)?.published,
  });
}

/**
 * Runs `projectStoreFeedArtifacts` and writes every artifact under `outDir`,
 * creating parent directories as needed.
 *
 * @param {{storeRoot: string, outDir: string, paths?: object}} input
 * @returns {{itemCount: number, skippedCount: number, skipped: readonly
 *   object[], newest: string|undefined, oldest: string|undefined, files:
 *   readonly string[]}}
 */
export function writeStoreFeedArtifacts({ storeRoot, outDir, paths }) {
  const result = projectStoreFeedArtifacts({ storeRoot, paths });
  const files = [];
  for (const artifact of result.artifacts) {
    const target = join(outDir, artifact.path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, artifact.body);
    files.push(target);
  }
  return { itemCount: result.itemCount, skippedCount: result.skippedCount, skipped: result.skipped, newest: result.newest, oldest: result.oldest, files: Object.freeze(files) };
}
