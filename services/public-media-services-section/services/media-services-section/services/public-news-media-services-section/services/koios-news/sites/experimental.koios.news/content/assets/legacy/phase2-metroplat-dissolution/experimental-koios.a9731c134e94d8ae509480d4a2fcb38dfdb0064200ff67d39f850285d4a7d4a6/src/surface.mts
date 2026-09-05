import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  articleCarrier,
  articlePublicationReport,
  type Article,
  type ArticlePublicationReport,
} from "@emsenn/metroplat/article";
import {
  articlesToJsonFeed,
  type JsonFeedMeta,
} from "@emsenn/metroplat/codecs/text/json/feed";
import { jsonResource as jsonCarrier } from "@emsenn/metroplat/codecs/text/json";
import { articleToNewsArticleJsonLd } from "@emsenn/metroplat/codecs/text/json/schema-org";
import {
  carriersToStylesheet,
  livingWebIndieWebProfile,
  type CssAuthoredRule,
  type CssCarrierSet,
} from "@emsenn/metroplat/codecs/text/css";
import { articlesToAtom, type ArticleFeedMeta } from "@emsenn/metroplat/codecs/text/xml/atom";
import { articlesToRss, type RssFeedMeta } from "@emsenn/metroplat/codecs/text/xml/rss";
import { articlesToNewsSitemap } from "@emsenn/metroplat/codecs/text/xml/sitemap";
import { articleToHtmlPage } from "@emsenn/metroplat/projections/article-html";
import { robotsTxt } from "@emsenn/metroplat/projections/robots";
import { buildStaticSite, type StaticSiteArticleCarrier } from "@emsenn/metroplat/projections/static-site";
import {
  articleToThemedPageStylesheet,
  livingWebIndieWebPageProfile,
  type ThemedPageProfile,
  type ThemedPageStyleClaim,
} from "@emsenn/metroplat/projections/themed-page";
import {
  readFormBody,
  readJsonBody,
  readTextBody,
} from "@emsenn/metroplat/services/http/app";

import {
  adPerformanceEvent,
  adPerformanceReadingAtRoot,
  advertisingAdsTxt,
  advertisingLoaderHtml,
  advertisingPolicy,
  advertisingPrivacyParagraph,
  advertisingSlotHtml,
  advertisingStyleClaims,
  appendAdImpressionAtRoot,
  koiosAdvertisingResponseHeaders,
  type AdvertisingPolicy,
} from "./advertising/index.mjs";
import {
  koiosItems,
  koiosMasthead,
  loadPosts,
  type KoiosItem,
  type KoiosMasthead,
  type KoiosPost,
  type KoiosReference,
} from "./content.mjs";
import { projectDeskQueue } from "./desk.mjs";
import { topicSubject } from "./topics.mjs";
import {
  articleFingerprintJson,
  articleFingerprintPng,
  articleFingerprintSvg,
  FINGERPRINT_IMAGE_HEIGHT,
  FINGERPRINT_IMAGE_WIDTH,
} from "./fingerprint.mjs";
import {
  appendViewAssertion,
  dayStamp,
  viewAssertion,
  viewCounts,
  viewStore,
} from "./views.mjs";
import { jsonRepr, textRepr, type Context, type Resource } from "./http-compat.mjs";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const defaultPostsDir = resolve(packageRoot, "content/posts");

const SITE_DESCRIPTION = "Koios.News public dispatches.";
const DEFAULT_PAGE_DATE = "2025-02-15";
const MEDTOP_SCHEME = "http://cv.iptc.org/newscodes/mediatopic/";

const SITE_NAV = Object.freeze([
  Object.freeze({ href: "/", label: "Posts" }),
  Object.freeze({ href: "/topics", label: "Topics" }),
  Object.freeze({ href: "/archive", label: "Archive" }),
  Object.freeze({ href: "/standards", label: "Standards" }),
  Object.freeze({ href: "/corrections", label: "Corrections" }),
  Object.freeze({ href: "/about", label: "About" }),
  Object.freeze({ href: "/privacy", label: "Privacy" }),
  Object.freeze({ href: "/feed.xml", label: "RSS" }),
] as const);

const KOIOS_THEME = Object.freeze({
  ink: "#ece8de",
  inkSoft: "#9a958a",
  surface: "#141310",
  surfaceDeep: "#1c1a16",
  surfaceEdge: "#3a352c",
  rule: "#ece8de",
  accent: "#ff5a42",
  tint: "rgba(236,232,222,0.06)",
  darkInk: "#ece8de",
  darkInkSoft: "#9a958a",
  darkSurface: "#141310",
  darkSurfaceDeep: "#1c1a16",
  darkSurfaceEdge: "#3a352c",
  darkRule: "#ece8de",
  darkAccent: "#ff5a42",
  darkTint: "rgba(236,232,222,0.06)",
  sans: "\"Archivo\", system-ui, -apple-system, \"Segoe UI\", sans-serif",
  serif: "Georgia, \"Times New Roman\", serif",
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  measure: "40rem",
});
const KOIOS_THEME_REGIME = "koios.news/mill-dark-web-2";

const koiosMillPageClaims: readonly ThemedPageStyleClaim[] = Object.freeze([
  Object.freeze({
    id: "koios-mill-page",
    locus: "page",
    declarations: Object.freeze({
      "--koios-ink": KOIOS_THEME.ink,
      "--koios-ink-soft": KOIOS_THEME.inkSoft,
      "--koios-surface": KOIOS_THEME.surface,
      "--koios-surface-deep": KOIOS_THEME.surfaceDeep,
      "--koios-surface-edge": KOIOS_THEME.surfaceEdge,
      "--koios-rule": KOIOS_THEME.rule,
      "--koios-accent": KOIOS_THEME.accent,
      "--koios-tint": KOIOS_THEME.tint,
      "--koios-measure": KOIOS_THEME.measure,
      "max-width": "66rem",
      margin: "0 auto",
      padding: "0 1.5rem",
      "overflow-wrap": "break-word",
      hyphens: "auto",
    }),
  }),
  Object.freeze({
    id: "koios-mill-page-dark",
    locus: "page",
    condition: Object.freeze({ media: "(prefers-color-scheme: dark)" }),
    declarations: Object.freeze({
      "--koios-ink": KOIOS_THEME.darkInk,
      "--koios-ink-soft": KOIOS_THEME.darkInkSoft,
      "--koios-surface": KOIOS_THEME.darkSurface,
      "--koios-surface-deep": KOIOS_THEME.darkSurfaceDeep,
      "--koios-surface-edge": KOIOS_THEME.darkSurfaceEdge,
      "--koios-rule": KOIOS_THEME.darkRule,
      "--koios-accent": KOIOS_THEME.darkAccent,
      "--koios-tint": KOIOS_THEME.darkTint,
    }),
  }),
  Object.freeze({
    id: "koios-mill-entry",
    locus: "entry",
    declarations: Object.freeze({
      "background-color": "transparent",
      "border-inline-start": "0",
      "box-shadow": "0 0 0 transparent",
      "max-width": "var(--koios-measure)",
      margin: "0 auto",
      padding: "0",
    }),
  }),
  Object.freeze({
    id: "koios-mill-article-header",
    locus: "header",
    declarations: Object.freeze({
      "border-block-end": "0",
      "margin-block-end": "0",
      "padding-block-end": "0",
    }),
  }),
  Object.freeze({
    id: "koios-mill-title",
    locus: "title",
    declarations: Object.freeze({
      "font-family": KOIOS_THEME.sans,
      "font-size": "2.25rem",
      "font-weight": "800",
      "letter-spacing": "0",
      "line-height": "1.02",
      "margin-block-end": "0.7rem",
      "text-transform": "none",
    }),
  }),
  Object.freeze({
    id: "koios-mill-byline",
    locus: "byline",
    declarations: Object.freeze({
      color: "var(--koios-accent)",
      "font-family": KOIOS_THEME.sans,
      "font-size": "0.74rem",
      "font-weight": "700",
      "letter-spacing": "0",
      "text-transform": "uppercase",
    }),
  }),
  Object.freeze({
    id: "koios-mill-published",
    locus: "published",
    declarations: Object.freeze({
      color: "var(--koios-ink-soft)",
      "font-family": KOIOS_THEME.sans,
      "font-size": "0.74rem",
      "font-weight": "600",
      "letter-spacing": "0",
      "text-transform": "uppercase",
    }),
  }),
  Object.freeze({
    id: "koios-mill-content",
    locus: "content",
    declarations: Object.freeze({
      "font-size": "1.15rem",
      "line-height": "1.65",
    }),
  }),
  Object.freeze({
    id: "koios-mill-content-h2",
    locus: "content",
    selector: ".metroplat-themed-page .e-content h2",
    declarations: Object.freeze({
      "border-top": "2px solid var(--koios-rule)",
      "font-family": KOIOS_THEME.sans,
      "font-size": "1.4rem",
      "font-weight": "800",
      "letter-spacing": "0",
      "margin-top": "2.2rem",
      "padding-top": "0.8rem",
      "text-transform": "uppercase",
    }),
  }),
  Object.freeze({
    id: "koios-mill-content-links",
    locus: "content",
    selector: ".metroplat-themed-page .e-content a",
    declarations: Object.freeze({
      color: "var(--koios-accent)",
      "text-decoration": "underline",
      "text-underline-offset": "2px",
    }),
  }),
  Object.freeze({
    id: "koios-mill-sources",
    locus: "sources",
    declarations: Object.freeze({
      "border-block-start": "5px solid var(--koios-rule)",
      "margin-block-start": "2rem",
      "padding-block-start": "1rem",
    }),
  }),
  ...advertisingStyleClaims(Object.freeze({
    inkSoft: "var(--koios-ink-soft)",
    rule: "var(--koios-rule)",
  })),
]);

const themeProfile: ThemedPageProfile = Object.freeze({
  ...livingWebIndieWebPageProfile,
  siteName: koiosMasthead.title,
  lang: koiosMasthead.language,
  feeling: Object.freeze({
    ...livingWebIndieWebPageProfile.feeling,
    regime: KOIOS_THEME_REGIME,
    background: KOIOS_THEME.surface,
    foreground: KOIOS_THEME.ink,
    muted: KOIOS_THEME.inkSoft,
    surface: KOIOS_THEME.surface,
    accent: KOIOS_THEME.accent,
    border: KOIOS_THEME.rule,
    fontFamily: KOIOS_THEME.serif,
    monoFontFamily: KOIOS_THEME.mono,
    baseFontSize: "17px",
    measure: KOIOS_THEME.measure,
    customProperties: Object.freeze({
      "--koios-ink": KOIOS_THEME.ink,
      "--koios-ink-soft": KOIOS_THEME.inkSoft,
      "--koios-surface": KOIOS_THEME.surface,
      "--koios-surface-deep": KOIOS_THEME.surfaceDeep,
      "--koios-surface-edge": KOIOS_THEME.surfaceEdge,
      "--koios-rule": KOIOS_THEME.rule,
      "--koios-accent": KOIOS_THEME.accent,
      "--koios-tint": KOIOS_THEME.tint,
      "--koios-measure": KOIOS_THEME.measure,
    }),
    claims: koiosMillPageClaims,
  }),
});

type FeedArticle = Article & {
  readonly url: string;
};

type PublicProjection = Readonly<{
  masthead: KoiosMasthead;
  posts: readonly KoiosPost[];
  postsBySlug: ReadonlyMap<string, KoiosPost>;
  items: readonly KoiosItem[];
  itemsBySlug: ReadonlyMap<string, KoiosItem>;
  articles: readonly FeedArticle[];
}>;

type PageSpec = Readonly<{
  title: string;
  description: string;
  path: string;
  slug: string;
}>;

type CorrectionRecord = Readonly<{
  id: string;
  kind: "error" | "warning" | "note";
  correctedAt: string;
  articleSlug: string;
  articlePath: string;
  articleHeadline: string;
  summary: string;
  details?: string;
  href?: string;
  affectedSurfaces: readonly string[];
}>;

type NinjsSubject = Readonly<{
  name: string;
  code?: string;
  scheme?: string;
}>;

type NinjsRecord = Readonly<{
  uri: string;
  type: "text";
  version: string;
  language: string;
  headline: string;
  slugline: string;
  byline: string;
  firstcreated: string;
  versioncreated: string;
  pubstatus: string;
  copyrightholder: string;
  copyrightnotice?: string;
  description_text?: string;
  body_text: string;
  subject: readonly NinjsSubject[];
}>;

type NewswireCitation = Readonly<{
  id: string;
  type: string;
  title: string;
  url: string;
  containerTitle?: string;
  issued?: KoiosReference["issued"];
}>;

type NewswireAuditReport = Readonly<{
  kind: "koios.news.gate-report";
  slug: string;
  title: string;
  url: string;
  public: boolean;
  gates_clear: boolean;
  standards_reviewed_at: string | null;
  references: readonly KoiosReference[];
  citations: readonly NewswireCitation[];
  evidence: Readonly<{
    reference_count: number;
    claim_projection: KoiosPost["claims"]["kind"];
    gate_claim: "article.publication.gates_clear";
  }>;
}>;

function publicItems(items: readonly KoiosItem[]): readonly KoiosItem[] {
  return Object.freeze(items.filter((item) => item.isPublic));
}

function uniqueStrings(values: readonly (string | undefined)[]): readonly string[] {
  const seen = new Set<string>();
  return Object.freeze(values.flatMap((value) => {
    const trimmed = value?.trim();
    if (trimmed === undefined || trimmed === "") return [];
    const key = trimmed.toLowerCase();
    if (seen.has(key)) return [];
    seen.add(key);
    return [trimmed];
  }));
}

function canonicalUrl(masthead: KoiosMasthead, path: string): string {
  return `${masthead.siteUrl}${path === "/" ? "" : path}`;
}

function itemPath(item: KoiosItem): string {
  try {
    return new URL(item.url).pathname || `${koiosMasthead.itemPath}/${encodeURIComponent(item.slug)}`;
  } catch {
    return `${koiosMasthead.itemPath}/${encodeURIComponent(item.slug)}`;
  }
}

function articleForItem(post: KoiosPost, item: KoiosItem, masthead: KoiosMasthead): FeedArticle {
  const path = `${masthead.itemPath}/${encodeURIComponent(item.slug)}`;
  const url = `${masthead.siteUrl}${path}`;
  const tags = uniqueStrings([
    ...post.frontMatter.tags,
    ...post.frontMatter.categories,
    ...post.frontMatter.keywords,
    item.section,
  ]);
  const article = articleCarrier.assert({
    ...post.article,
    title: item.headline,
    slug: item.slug,
    author: item.author,
    date: item.published,
    draft: !item.isPublic,
    url,
    canonicalUrl: url,
    publicHref: path,
    ...(item.summary === "" ? {} : { summary: item.summary, description: item.summary }),
    ...(item.section === undefined ? {} : { section: item.section, beat: item.section }),
    ...(post.frontMatter.categories.length === 0 ? {} : { categories: post.frontMatter.categories }),
    ...(tags.length === 0 ? {} : { tags }),
    ...(item.keywords.length === 0 ? {} : { keywords: item.keywords }),
  }, `koios public article ${item.slug}`) as FeedArticle;
  return Object.freeze(article);
}

async function loadPublicProjection(postsDir = defaultPostsDir): Promise<PublicProjection> {
  const masthead = koiosMasthead;
  const posts = await loadPosts(postsDir);
  const postsBySlug = new Map(posts.map((post) => [post.slug, post]));
  const items = publicItems(koiosItems(posts, masthead));
  const itemsBySlug = new Map(items.map((item) => [item.slug, item]));
  const articles = items.flatMap((item) => {
    const post = postsBySlug.get(item.slug);
    return post === undefined ? [] : [articleForItem(post, item, masthead)];
  });
  return Object.freeze({ masthead, posts, postsBySlug, items, itemsBySlug, articles });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;");
}

function escapeScriptJson(value: unknown): string {
  return JSON.stringify(value).replace(/</gu, "\\u003c");
}

function styleElementContent(css: string): string {
  return css.replace(/<\/style/giu, "<\\/style").replace(/<!--/gu, "<\\!--");
}

function rule(
  id: string,
  locus: string,
  selector: string,
  declarations: Readonly<Record<string, string>>,
  sourceOrder: number,
  placement: Omit<CssAuthoredRule, "id" | "locus" | "selector" | "declarations" | "sourceOrder"> = {},
): CssAuthoredRule {
  return Object.freeze({ ...placement, id, locus, selector, declarations, sourceOrder });
}

function siteChromeStylesheet(): string {
  const carriers: CssCarrierSet = Object.freeze({
    kind: "rendering.css.carrierSet" as const,
    loci: Object.freeze(["site-header", "site-nav", "site-main", "story", "meta", "panel", "site-footer"]),
    fibers: Object.freeze([]),
    rules: Object.freeze([
      rule("koios-page-box", "site-main", ".koios-page", {
        "background-color": "var(--koios-surface)",
      }, 1),
      rule("koios-header", "site-header", ".koios-site-header", {
        "background-color": "var(--koios-surface)",
        "border-bottom": "5px solid var(--koios-rule)",
        color: "var(--koios-ink)",
        "margin-bottom": "2rem",
        "padding-top": "1.5rem",
      }, 2),
      rule("koios-brand", "site-header", ".koios-site-brand", {
        color: "var(--koios-ink)",
        "font-family": KOIOS_THEME.sans,
        "font-size": "2.4rem",
        "font-weight": "900",
        "letter-spacing": "0",
        "line-height": "0.9",
        "text-decoration": "none",
        "text-transform": "uppercase",
      }, 3),
      rule("koios-brand-wide", "site-header", ".koios-site-brand", {
        "font-size": "3.5rem",
      }, 4, { condition: Object.freeze({ media: "(min-width: 46rem)" }) }),
      rule("koios-brand-hover", "site-header", ".koios-site-brand:hover", {
        color: "var(--koios-accent)",
      }, 5),
      rule("koios-nav", "site-nav", ".koios-site-nav", {
        "border-top": "2px solid var(--koios-rule)",
        display: "flex",
        "flex-wrap": "wrap",
        gap: "1.4rem",
        "font-family": KOIOS_THEME.sans,
        "font-size": "0.8rem",
        "font-weight": "700",
        "letter-spacing": "0",
        "margin-top": "1.1rem",
        padding: "0.6rem 0",
        "text-transform": "uppercase",
      }, 6),
      rule("koios-nav-link", "site-nav", ".koios-site-nav a", {
        color: "var(--koios-ink)",
        "text-decoration": "none",
      }, 7),
      rule("koios-nav-link-hover", "site-nav", ".koios-site-nav a:hover", {
        color: "var(--koios-accent)",
      }, 8),
      rule("koios-nav-current", "site-nav", ".koios-site-nav a[aria-current=page]", {
        color: "var(--koios-accent)",
      }, 9),
      rule("koios-main", "site-main", ".koios-page-main", {
        margin: "0",
        "max-width": "none",
        padding: "0 0 2rem",
      }, 10),
      rule("koios-feed", "story", ".koios-story-list", {
        display: "grid",
        "grid-template-columns": "1fr",
      }, 11),
      rule("koios-feed-wide", "story", ".koios-story-list", {
        "column-gap": "2.5rem",
        "grid-template-columns": "1fr 1fr",
      }, 12, { condition: Object.freeze({ media: "(min-width: 46rem)" }) }),
      rule("koios-story", "story", ".koios-story", {
        "border-bottom": "1px solid var(--koios-rule)",
        "min-width": "0",
        padding: "1.4rem 0",
      }, 13),
      rule("koios-lead", "story", ".koios-story-lead", {
        "border-bottom": "5px solid var(--koios-rule)",
        "padding-bottom": "1.8rem",
      }, 14),
      rule("koios-lead-wide", "story", ".koios-story-lead", {
        "grid-column": "1 / -1",
      }, 15, { condition: Object.freeze({ media: "(min-width: 46rem)" }) }),
      rule("koios-story-link", "story", ".koios-story a", {
        color: "var(--koios-ink)",
        "text-decoration": "none",
      }, 16),
      rule("koios-story-link-hover", "story", ".koios-story a:hover", {
        color: "var(--koios-accent)",
      }, 17),
      rule("koios-story-head", "story", ".koios-story .p-name", {
        "font-family": KOIOS_THEME.sans,
        "font-size": "1.45rem",
        "font-weight": "800",
        "letter-spacing": "0",
        "line-height": "1.05",
        "margin-bottom": "0.4rem",
      }, 18),
      rule("koios-lead-head", "story", ".koios-story-lead .p-name", {
        "font-size": "2.1rem",
        "line-height": "1",
      }, 19),
      rule("koios-lead-head-wide", "story", ".koios-story-lead .p-name", {
        "font-size": "2.9rem",
      }, 20, { condition: Object.freeze({ media: "(min-width: 46rem)" }) }),
      rule("koios-story-summary", "story", ".koios-story .p-summary", {
        color: "var(--koios-ink)",
        "max-width": "60ch",
      }, 21),
      rule("koios-meta", "meta", ".koios-meta", {
        color: "var(--koios-ink-soft)",
        "font-family": KOIOS_THEME.sans,
        "font-size": "0.72rem",
        "font-weight": "600",
        "letter-spacing": "0",
        "text-transform": "uppercase",
      }, 22),
      rule("koios-kicker", "meta", ".koios-story > .p-category", {
        color: "var(--koios-accent)",
        display: "inline-block",
        "font-weight": "700",
        "margin-bottom": "0.45rem",
      }, 23),
      rule("koios-page-title", "site-main", ".koios-page-main > :is(.h-entry,.h-feed) > .p-name", {
        "border-bottom": "5px solid var(--koios-rule)",
        "font-family": KOIOS_THEME.sans,
        "font-size": "2.1rem",
        "font-weight": "900",
        "letter-spacing": "0",
        "line-height": "1.02",
        "margin-bottom": "1.1rem",
        "padding-bottom": "0.65rem",
        "text-transform": "uppercase",
      }, 24),
      rule("koios-page-title-wide", "site-main", ".koios-page-main > :is(.h-entry,.h-feed) > .p-name", {
        "font-size": "2.6rem",
      }, 25, { condition: Object.freeze({ media: "(min-width: 46rem)" }) }),
      rule("koios-page-links", "site-main", ".koios-page-main a", {
        color: "var(--koios-accent)",
        "text-underline-offset": "2px",
      }, 26),
      rule("koios-page-lists", "site-main", ".koios-page-main :is(ul,ol)", {
        "padding-left": "1.4rem",
      }, 27),
      rule("koios-panel", "panel", ".koios-panel", {
        "border-top": "1px solid var(--koios-rule)",
        "margin-top": "1.5rem",
        padding: "1.1rem 0",
      }, 28),
      rule("koios-panel-grid", "panel", ".koios-panel-grid", {
        display: "grid",
        gap: "1rem",
      }, 29),
      rule("koios-panel-heading", "panel", ".koios-panel :is(h2,h3,.p-name)", {
        "font-family": KOIOS_THEME.sans,
        "font-size": "1.35rem",
        "font-weight": "800",
        "letter-spacing": "0",
        "line-height": "1.05",
        "text-transform": "uppercase",
      }, 30),
      rule("koios-panel-link", "panel", ".koios-panel :is(h2,h3,.p-name) a", {
        color: "var(--koios-ink)",
        "text-decoration": "none",
      }, 31),
      rule("koios-panel-link-hover", "panel", ".koios-panel :is(h2,h3,.p-name) a:hover", {
        color: "var(--koios-accent)",
      }, 32),
      rule("koios-table", "panel", ".koios-table", {
        width: "100%",
        "border-collapse": "collapse",
        "font-family": KOIOS_THEME.mono,
        "font-size": "0.92rem",
      }, 33),
      rule("koios-table-cells", "panel", ".koios-table :is(th,td)", {
        "border-bottom": "1px solid var(--koios-rule)",
        "padding": "0.45rem",
        "text-align": "left",
      }, 34),
      rule("koios-footer", "site-footer", ".koios-site-footer", {
        "border-top": "5px solid var(--koios-rule)",
        color: "var(--koios-ink-soft)",
        "background-color": "var(--koios-surface)",
        "font-family": KOIOS_THEME.sans,
        "font-size": "0.82rem",
        padding: "1rem 0",
      }, 35),
    ]),
  });
  return carriersToStylesheet(carriers, {
    ...livingWebIndieWebProfile,
    regime: "koios.news/mill-web-2-chrome",
    defaultLayer: "overrides",
  });
}

function pageStyles(article: Article): string {
  return `${articleToThemedPageStylesheet(article, themeProfile)}\n${siteChromeStylesheet()}`;
}

function navHtml(currentPath: string): string {
  const links = SITE_NAV.map((entry) => {
    const current = entry.href === "/"
      ? currentPath === "/"
      : currentPath === entry.href || currentPath.startsWith(`${entry.href}/`);
    return `<a href="${escapeHtml(entry.href)}"${current ? ' aria-current="page"' : ""}>${escapeHtml(entry.label)}</a>`;
  }).join("");
  return `<nav class="koios-site-nav" aria-label="Site">${links}</nav>`;
}

function siteHeader(currentPath: string): string {
  return `<header class="koios-site-header"><a class="koios-site-brand" href="/">${escapeHtml(koiosMasthead.title)}</a>${navHtml(currentPath)}</header>`;
}

function siteFooter(masthead: KoiosMasthead): string {
  return `<footer class="koios-site-footer"><p>${escapeHtml(masthead.title)} publishes Web 2.0 HTML, feeds, sitemaps, and machine-readable JSON records.</p></footer>`;
}

function metaName(name: string, content: string): string {
  return `<meta name="${escapeHtml(name)}" content="${escapeHtml(content)}">`;
}

function metaProperty(property: string, content: string): string {
  return `<meta property="${escapeHtml(property)}" content="${escapeHtml(content)}">`;
}

function envText(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value === undefined || value === "" ? undefined : value;
}

function advertisingPolicyFromEnv(): AdvertisingPolicy {
  const aAdsUnits = envText("KOIOS_NEWS_A_ADS_UNITS")
    ?.split(",")
    .map((part) => part.trim())
    .filter((part) => part !== "") ?? [];
  return advertisingPolicy({
    adsense: { client: envText("KOIOS_NEWS_AD_CLIENT") },
    aAds: { units: aAdsUnits },
  });
}

function advertisingResponseHeaders(): Readonly<Record<string, string>> {
  return koiosAdvertisingResponseHeaders(advertisingPolicyFromEnv());
}

function responseHeadersForType(type: string): Readonly<Record<string, string>> | undefined {
  return type.startsWith("text/html") ? advertisingResponseHeaders() : undefined;
}

function koiosAdSlotHtml(position: "header" | "inArticle" | "footer", key: string): string {
  return advertisingSlotHtml(advertisingPolicyFromEnv(), {
    position,
    key,
    loci: Object.freeze(["main"]),
    label: `Advertisement ${position}`,
  });
}

function koiosAdLoaderHtml(): string {
  return advertisingLoaderHtml(advertisingPolicyFromEnv());
}

function viewBeaconHtml(): string {
  return "<script>(function(){try{var host='';try{host=document.referrer?new URL(document.referrer).host:''}catch(_e){}" +
    "var body=JSON.stringify({path:location.pathname+location.search,'referrer-host':host});" +
    "if(navigator.sendBeacon){navigator.sendBeacon('/hit',new Blob([body],{type:'application/json'}));}" +
    "else{fetch('/hit',{method:'POST',headers:{'content-type':'application/json'},body:body,keepalive:true});}}catch(_e){}})();</script>";
}

function adImpressionBeaconHtml(): string {
  return "<script>(function(){try{var sent=new WeakSet();var send=function(el){if(sent.has(el))return;sent.add(el);" +
    "var body=JSON.stringify({path:location.pathname+location.search,provider:el.getAttribute('data-provider'),slot:el.getAttribute('data-koios-ad-slot')});" +
    "if(navigator.sendBeacon){navigator.sendBeacon('/ad-impression',new Blob([body],{type:'application/json'}));}" +
    "else{fetch('/ad-impression',{method:'POST',headers:{'content-type':'application/json'},body:body,keepalive:true});}};" +
    "var slots=[].slice.call(document.querySelectorAll('[data-koios-ad-slot][data-provider]'));" +
    "if('IntersectionObserver'in window){var io=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){send(entry.target);io.unobserve(entry.target);}});},{threshold:0.25});slots.forEach(function(slot){io.observe(slot);});}" +
    "else{slots.forEach(send);}}catch(_e){}})();</script>";
}

function finalBodyScripts(): string {
  return `${koiosAdLoaderHtml()}${viewBeaconHtml()}${adImpressionBeaconHtml()}`;
}

function bodyRecord(value: unknown): Readonly<Record<string, unknown>> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Readonly<Record<string, unknown>>
    : Object.freeze({});
}

function firstField(record: Readonly<Record<string, unknown>>, names: readonly string[]): unknown {
  for (const name of names) {
    const value = record[name];
    if (value !== undefined) return value;
  }
  return undefined;
}

async function hitPayload(ctx: Context): Promise<Readonly<Record<string, unknown>>> {
  const query = Object.fromEntries(ctx.url.searchParams.entries());
  const contentType = String(ctx.req.headers["content-type"] ?? "").toLowerCase();
  if (contentType.includes("application/json")) {
    return Object.freeze({ ...query, ...bodyRecord((await readJsonBody(ctx.req, { maxBytes: 2048, empty: {} })).value) });
  }
  if (contentType.includes("application/x-www-form-urlencoded")) {
    return Object.freeze({ ...query, ...Object.fromEntries((await readFormBody(ctx.req, { maxBytes: 2048 })).value.entries()) });
  }
  const text = (await readTextBody(ctx.req, { maxBytes: 2048 })).value.trim();
  if (text === "") return Object.freeze(query);
  if (text.startsWith("{")) return Object.freeze({ ...query, ...bodyRecord(JSON.parse(text)) });
  return Object.freeze({ ...query, ...Object.fromEntries(new URLSearchParams(text).entries()) });
}

async function hitResource(dataRoot: string, ctx: Context) {
  const payload = await hitPayload(ctx);
  const assertion = viewAssertion({
    path: firstField(payload, ["path", "p"]),
    referrerHost: firstField(payload, ["referrer-host", "referrerHost", "referrer_host", "r"]),
    day: dayStamp(),
  });
  if (assertion === null) return textRepr("bad view assertion\n", 400);
  appendViewAssertion(viewStore(dataRoot), assertion);
  return textRepr("", 204);
}

async function adImpressionResource(dataRoot: string, ctx: Context) {
  const payload = await hitPayload(ctx);
  const event = adPerformanceEvent({
    path: firstField(payload, ["path", "p"]),
    provider: firstField(payload, ["provider"]),
    day: firstField(payload, ["day"]),
    section: firstField(payload, ["section"]),
    tags: firstField(payload, ["tags"]),
    impressions: firstField(payload, ["impressions"]),
    clicks: firstField(payload, ["clicks"]),
    revenueMicros: firstField(payload, ["revenueMicros"]),
  });
  if (event === null) return textRepr("bad ad impression\n", 400);
  appendAdImpressionAtRoot(dataRoot, event);
  return textRepr("", 204);
}

function pageArticle(projection: PublicProjection, spec: PageSpec): Article {
  const latestDate = projection.items[0]?.published ?? DEFAULT_PAGE_DATE;
  return articleCarrier.assert({
    title: spec.title,
    slug: spec.slug,
    author: projection.masthead.author.name,
    date: latestDate,
    draft: false,
    url: canonicalUrl(projection.masthead, spec.path),
    canonicalUrl: canonicalUrl(projection.masthead, spec.path),
    summary: spec.description,
    description: spec.description,
    section: "site",
    tags: Object.freeze(["Koios.News", "web"]),
    body: spec.description,
  }, `koios page ${spec.slug}`) as Article;
}

function pageHtml(projection: PublicProjection, spec: PageSpec, body: string): string {
  const article = pageArticle(projection, spec);
  const canonical = canonicalUrl(projection.masthead, spec.path);
  const styles = styleElementContent(pageStyles(article));
  return `<!DOCTYPE html>
<html lang="${escapeHtml(projection.masthead.language)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(spec.path === "/" ? projection.masthead.title : `${spec.title} - ${projection.masthead.title}`)}</title>
  <link rel="canonical" href="${escapeHtml(canonical)}">
  ${metaName("description", spec.description)}
  ${metaProperty("og:type", "website")}
  ${metaProperty("og:title", spec.title)}
  ${metaProperty("og:description", spec.description)}
  ${metaProperty("og:url", canonical)}
  ${metaProperty("og:site_name", projection.masthead.title)}
  <style data-metroplat-projection="themed-page-and-css">
${styles}</style>
</head>
<body class="metroplat-themed-page koios-page" data-metroplat-profile="${escapeHtml(KOIOS_THEME_REGIME)}">
${siteHeader(spec.path)}
${koiosAdSlotHtml("header", `${spec.path}:header`)}
<main class="koios-page-main" data-metroplat-locus="main">
${body}
</main>
${koiosAdSlotHtml("footer", `${spec.path}:footer`)}
${siteFooter(projection.masthead)}
${finalBodyScripts()}
</body>
</html>
`;
}

const MONTHS = Object.freeze([
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const);

function displayDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/u.exec(iso);
  if (match === null) return iso;
  const month = MONTHS[Number(match[2]) - 1];
  return month === undefined ? iso : `${month} ${Number(match[3])}, ${match[1]}`;
}

function readMinutes(body: string): number {
  const words = body.trim().split(/\s+/u).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function storyHtml(item: KoiosItem, post: KoiosPost, lead: boolean): string {
  const href = itemPath(item);
  const kicker = item.section ?? item.keywords[0] ?? post.frontMatter.categories[0];
  const meta = [
    `<time class="dt-published" datetime="${escapeHtml(item.published)}">${escapeHtml(displayDate(item.published))}</time>`,
    `${readMinutes(post.article.body)} min read`,
  ].join(" / ");
  return `<article class="koios-story${lead ? " koios-story-lead" : ""} h-entry">
${kicker === undefined ? "" : `<p class="koios-meta p-category">${escapeHtml(kicker)}</p>`}
<h2 class="p-name"><a class="u-url" href="${escapeHtml(href)}">${escapeHtml(item.headline)}</a></h2>
<p class="p-summary">${escapeHtml(item.summary)}</p>
<p class="koios-meta">${meta}</p>
</article>`;
}

function homepageHtml(projection: PublicProjection): string {
  const stories = projection.items.flatMap((item) => {
    const post = projection.postsBySlug.get(item.slug);
    return post === undefined ? [] : [{ item, post }];
  });
  const [lead, ...rest] = stories;
  const body = `<section class="h-feed">
<h1 class="p-name">${escapeHtml(projection.masthead.title)}</h1>
<p>${escapeHtml(SITE_DESCRIPTION)}</p>
<div class="koios-story-list">
${lead === undefined ? "<p>No public posts are available.</p>" : storyHtml(lead.item, lead.post, true)}
${rest.slice(0, 20).map((entry) => storyHtml(entry.item, entry.post, false)).join("\n")}
</div>
</section>`;
  return pageHtml(projection, {
    title: projection.masthead.title,
    description: SITE_DESCRIPTION,
    path: "/",
    slug: "home",
  }, body);
}

function aboutHtml(projection: PublicProjection): string {
  const body = `<article class="h-entry">
<h1 class="p-name">About Koios.News</h1>
<p>Koios.News is a collapse-aware autonomous news publication. It reads climate, technology, politics, and the economy as one compounding system, then turns sourced evidence into public articles, feeds, sitemaps, and standards records.</p>
<p>The editor is ${escapeHtml(projection.masthead.author.name)}. The publication applies imagination to facts: not to predict one future, but to make system pressure visible through public evidence.</p>
<p>Editorial standards are available at <a href="/standards">/standards</a>, with machine-readable status at <a href="/standards.json">/standards.json</a>.</p>
</article>`;
  return pageHtml(projection, {
    title: "About",
    description: "About Koios.News and its public editorial frame.",
    path: "/about",
    slug: "about",
  }, body);
}

function privacyHtml(projection: PublicProjection): string {
  const body = `<article class="h-entry">
<h1 class="p-name">Privacy</h1>
<p>Koios.News measures itself with a first-party view counter. When a page loads, your browser sends the <strong>path of the page</strong> and the <strong>host name of the referring site</strong>, if any. The server adds the day it witnessed the view.</p>
<p>That is the complete list. The counter records no IP addresses, no user agents, no cookies, no fingerprints, and no identifiers of any kind.</p>
<p>The counter's trace is an append-only EAVT witness log of those three facts. Its public fold is available at <a href="/views.json">/views.json</a>, so everything collected for this counter is also visible as aggregate per-path counts.</p>
<p>${escapeHtml(advertisingPrivacyParagraph(advertisingPolicyFromEnv()))}</p>
<p>Koios.News is Web 2.0 only: HTML pages, feeds, sitemaps, robots.txt, JSON records, and optional advertisement slots when configured.</p>
</article>`;
  return pageHtml(projection, {
    title: "Privacy",
    description: "Privacy posture for Koios.News public Web 2.0 resources.",
    path: "/privacy",
    slug: "privacy",
  }, body);
}

function standardsReading(projection: PublicProjection): ArticlePublicationReport {
  return articlePublicationReport(projection.articles);
}

function standardsHtml(projection: PublicProjection): string {
  const reading = standardsReading(projection);
  const rows = reading.candidates.slice(0, 50).map((candidate) => `<tr><th><a href="${escapeHtml(candidate.publicHref)}">${escapeHtml(candidate.title)}</a></th><td>${escapeHtml(candidate.status)}</td><td>${candidate.errorCount}</td><td>${candidate.warningCount}</td><td>${candidate.wordCount}</td></tr>`).join("\n");
  const policy = reading.policy.map((line) => `<li>${escapeHtml(line)}</li>`).join("\n");
  const body = `<article class="h-entry">
<h1 class="p-name">Editorial standards</h1>
<p>Koios.News projects public Article carriers through the metroplat article publication report. The current public set has ${reading.publishedCount} published-standard articles and ${reading.copyEditRequiredCount} copy-edit-required articles.</p>
<p><a href="/standards.json">standards.json</a></p>
<ul>${policy}</ul>
</article>
<table class="koios-table"><thead><tr><th>article</th><th>status</th><th>errors</th><th>warnings</th><th>words</th></tr></thead><tbody>${rows}</tbody></table>`;
  return pageHtml(projection, {
    title: "Editorial standards",
    description: "Article publication standards report for Koios.News.",
    path: "/standards",
    slug: "standards",
  }, body);
}

function slugLabel(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-+|-+$/gu, "") || "topic";
}

function titleLabel(slug: string): string {
  return slug.split("-").filter(Boolean).map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`).join(" ");
}

function topicOf(item: KoiosItem, post: KoiosPost): string | undefined {
  return item.section ?? post.frontMatter.koios.beat ?? post.frontMatter.categories[0];
}

function topicReadings(projection: PublicProjection): readonly Readonly<{
  slug: string;
  title: string;
  count: number;
  latestPublished: string;
  description: string;
}>[] {
  const topics = new Map<string, { title: string; count: number; latestPublished: string }>();
  for (const item of projection.items) {
    const post = projection.postsBySlug.get(item.slug);
    if (post === undefined) continue;
    const title = topicOf(item, post);
    if (title === undefined) continue;
    const slug = slugLabel(title);
    const existing = topics.get(slug) ?? { title, count: 0, latestPublished: item.published };
    existing.count += 1;
    if (item.published > existing.latestPublished) existing.latestPublished = item.published;
    topics.set(slug, existing);
  }
  return Object.freeze([...topics.entries()]
    .sort((left, right) => right[1].count - left[1].count || left[1].title.localeCompare(right[1].title))
    .map(([slug, topic]) => Object.freeze({
      slug,
      title: topic.title,
      count: topic.count,
      latestPublished: topic.latestPublished,
      description: `${topic.title} stories projected from koios.beat / IPTC topic metadata.`,
    })));
}

function topicsHtml(projection: PublicProjection): string {
  const cards = topicReadings(projection).map((topic) => `<article class="koios-panel h-entry">
<h2 class="p-name"><a class="u-url" href="/topics/${escapeHtml(topic.slug)}">${escapeHtml(topic.title)}</a></h2>
<p class="p-summary">${escapeHtml(topic.description)}</p>
<p class="koios-meta">${topic.count} ${topic.count === 1 ? "story" : "stories"} / latest ${escapeHtml(displayDate(topic.latestPublished))}</p>
</article>`).join("\n");
  const body = `<article class="h-entry">
<h1 class="p-name">Topics</h1>
<p>Topics are public sections derived from each article's Koios beat, with the article category as fallback.</p>
</article>
<div class="koios-panel-grid">${cards}</div>`;
  return pageHtml(projection, {
    title: "Topics",
    description: "Koios.News sections by koios.beat / IPTC topic metadata.",
    path: "/topics",
    slug: "topics",
  }, body);
}

function topicHtml(projection: PublicProjection, slug: string): string | null {
  const entries = projection.items.flatMap((item) => {
    const post = projection.postsBySlug.get(item.slug);
    if (post === undefined) return [];
    const topic = topicOf(item, post);
    return topic !== undefined && slugLabel(topic) === slug ? [{ item, post, topic }] : [];
  });
  if (entries.length === 0) return null;
  const title = entries[0]?.topic ?? titleLabel(slug);
  const body = `<article class="h-entry">
<h1 class="p-name">${escapeHtml(title)}</h1>
<p>${entries.length} ${entries.length === 1 ? "story" : "stories"} in this Koios.News topic.</p>
</article>
<div class="koios-story-list h-feed">
${entries.map((entry) => storyHtml(entry.item, entry.post, false)).join("\n")}
</div>`;
  return pageHtml(projection, {
    title,
    description: `${projection.masthead.title} stories in ${title}.`,
    path: `/topics/${slug}`,
    slug: `topic-${slug}`,
  }, body);
}

function publishedYearMonth(item: KoiosItem): { year: string; month: string } | null {
  const match = /^(\d{4})-(\d{2})/u.exec(item.published);
  return match === null ? null : { year: match[1]!, month: match[2]! };
}

function archiveHtml(projection: PublicProjection): string {
  const years = new Map<string, Map<string, KoiosItem[]>>();
  for (const item of projection.items) {
    const parts = publishedYearMonth(item);
    if (parts === null) continue;
    const months = years.get(parts.year) ?? new Map<string, KoiosItem[]>();
    months.set(parts.month, [...(months.get(parts.month) ?? []), item]);
    years.set(parts.year, months);
  }
  const cards = [...years.entries()].sort((left, right) => right[0].localeCompare(left[0])).map(([year, months]) => {
    const count = [...months.values()].reduce((sum, items) => sum + items.length, 0);
    const links = [...months.entries()].sort((left, right) => right[0].localeCompare(left[0])).map(([month, items]) => `<li><a href="/archive/${escapeHtml(year)}/${escapeHtml(month)}">${escapeHtml(MONTHS[Number(month) - 1] ?? month)} ${escapeHtml(year)}</a> (${items.length})</li>`).join("");
    return `<article class="koios-panel"><h2><a href="/archive/${escapeHtml(year)}">${escapeHtml(year)}</a></h2><p>${count} ${count === 1 ? "story" : "stories"}</p><ul>${links}</ul></article>`;
  }).join("\n");
  const body = `<article class="h-entry">
<h1 class="p-name">Archive</h1>
<p>${projection.items.length} public stories are available in the Koios.News archive.</p>
</article>
<div class="koios-panel-grid">${cards}</div>`;
  return pageHtml(projection, {
    title: "Archive",
    description: "Publication archive for Koios.News.",
    path: "/archive",
    slug: "archive",
  }, body);
}

function archiveYearHtml(projection: PublicProjection, year: string): string | null {
  const entries = projection.items.flatMap((item) => {
    const post = projection.postsBySlug.get(item.slug);
    const parts = publishedYearMonth(item);
    return post !== undefined && parts?.year === year ? [{ item, post }] : [];
  });
  if (entries.length === 0) return null;
  const months = [...uniqueStrings(entries.map((entry) => publishedYearMonth(entry.item)?.month))]
    .sort((left: string, right: string) => right.localeCompare(left));
  const body = `<article class="h-entry">
<h1 class="p-name">${escapeHtml(year)}</h1>
<p>${entries.length} ${entries.length === 1 ? "story" : "stories"} published in ${escapeHtml(year)}.</p>
<ul>${months.map((month) => `<li><a href="/archive/${escapeHtml(year)}/${escapeHtml(month)}">${escapeHtml(MONTHS[Number(month) - 1] ?? month)} ${escapeHtml(year)}</a></li>`).join("")}</ul>
</article>
<div class="koios-story-list h-feed">
${entries.map((entry) => storyHtml(entry.item, entry.post, false)).join("\n")}
</div>`;
  return pageHtml(projection, {
    title: `Archive: ${year}`,
    description: `${projection.masthead.title} stories from ${year}.`,
    path: `/archive/${year}`,
    slug: `archive-${year}`,
  }, body);
}

function archiveMonthHtml(projection: PublicProjection, year: string, month: string): string | null {
  const entries = projection.items.flatMap((item) => {
    const post = projection.postsBySlug.get(item.slug);
    const parts = publishedYearMonth(item);
    return post !== undefined && parts?.year === year && parts.month === month ? [{ item, post }] : [];
  });
  if (entries.length === 0) return null;
  const title = `${MONTHS[Number(month) - 1] ?? month} ${year}`;
  const body = `<article class="h-entry">
<h1 class="p-name">${escapeHtml(title)}</h1>
<p>${entries.length} ${entries.length === 1 ? "story" : "stories"} published in ${escapeHtml(title)}.</p>
</article>
<div class="koios-story-list h-feed">
${entries.map((entry) => storyHtml(entry.item, entry.post, false)).join("\n")}
</div>`;
  return pageHtml(projection, {
    title: `Archive: ${title}`,
    description: `${projection.masthead.title} stories from ${title}.`,
    path: `/archive/${year}/${month}`,
    slug: `archive-${year}-${month}`,
  }, body);
}

function correctionRecords(projection: PublicProjection): readonly CorrectionRecord[] {
  const records = projection.items.flatMap((item) => {
    const post = projection.postsBySlug.get(item.slug);
    if (post === undefined) return [];
    return (post.article.corrections ?? []).map((correction): CorrectionRecord => Object.freeze({
      id: `${post.slug}:${correction.code}`,
      kind: correction.severity,
      correctedAt: post.article.updated ?? post.article.date,
      articleSlug: post.slug,
      articlePath: itemPath(item),
      articleHeadline: item.headline,
      summary: correction.message,
      ...(correction.gate === undefined ? {} : { details: `Gate: ${correction.gate}` }),
      ...(correction.href === undefined ? {} : { href: correction.href }),
      affectedSurfaces: Object.freeze(["article page", "feeds", "sitemap", "schema.org JSON-LD"]),
    }));
  });
  return Object.freeze(records.sort((left, right) => right.correctedAt.localeCompare(left.correctedAt) || left.articleHeadline.localeCompare(right.articleHeadline)));
}

function correctionsHtml(projection: PublicProjection): string {
  const records = correctionRecords(projection);
  const entries = records.map((record) => `<article class="koios-panel h-entry">
<h2 class="p-name"><a class="u-url" href="${escapeHtml(record.articlePath)}">${escapeHtml(record.articleHeadline)}</a></h2>
<p class="koios-meta">${escapeHtml(record.kind)} / <time class="dt-published" datetime="${escapeHtml(record.correctedAt)}">${escapeHtml(displayDate(record.correctedAt))}</time> / <code>${escapeHtml(record.id)}</code></p>
<p class="p-summary">${escapeHtml(record.summary)}</p>
${record.details === undefined ? "" : `<p>${escapeHtml(record.details)}</p>`}
</article>`).join("\n");
  const body = `<article class="h-entry">
<h1 class="p-name">Corrections</h1>
<p>Koios.News correction records are folded from public Article carrier correction metadata. ${records.length} ${records.length === 1 ? "record is" : "records are"} currently declared.</p>
<p><a href="/corrections.json">corrections.json</a></p>
</article>
${records.length === 0 ? "<p>No corrections are currently declared in public article frontmatter.</p>" : `<div class="koios-panel-grid">${entries}</div>`}`;
  return pageHtml(projection, {
    title: "Corrections",
    description: "Corrections, clarifications, warnings, and notes declared on public Koios.News articles.",
    path: "/corrections",
    slug: "corrections",
  }, body);
}

function relatedStoriesHtml(post: KoiosPost, item: KoiosItem, projection: PublicProjection): string {
  const sourceTags = new Set([...post.frontMatter.tags, ...post.frontMatter.categories].map((value) => value.toLowerCase()));
  const related = projection.items.flatMap((candidate) => {
    if (candidate.slug === item.slug) return [];
    const candidatePost = projection.postsBySlug.get(candidate.slug);
    if (candidatePost === undefined) return [];
    const sharedTags = [...candidatePost.frontMatter.tags, ...candidatePost.frontMatter.categories]
      .filter((value) => sourceTags.has(value.toLowerCase()));
    const sameSection = item.section !== undefined && candidate.section !== undefined && item.section.toLowerCase() === candidate.section.toLowerCase();
    const score = sharedTags.length * 4 + (sameSection ? 2 : 0);
    return score === 0 ? [] : [{ item: candidate, sharedTags, sameSection, score }];
  }).sort((left, right) => right.score - left.score || right.item.published.localeCompare(left.item.published)).slice(0, 3);
  if (related.length === 0) return "";
  const cards = related.map((entry) => `<article class="koios-story h-entry">
<h3 class="p-name"><a class="u-url" href="${escapeHtml(itemPath(entry.item))}">${escapeHtml(entry.item.headline)}</a></h3>
<p class="p-summary">${escapeHtml(entry.item.summary)}</p>
<p class="koios-meta">${escapeHtml(uniqueStrings([...entry.sharedTags, entry.sameSection ? entry.item.section : undefined]).slice(0, 4).join(" / "))}</p>
</article>`).join("\n");
  return `<aside class="koios-panel" aria-labelledby="related-stories-title"><h2 id="related-stories-title">Related Stories</h2><div class="koios-panel-grid">${cards}</div></aside>`;
}

function correctionNoticeHtml(post: KoiosPost): string {
  const corrections = post.article.corrections ?? [];
  if (corrections.length === 0) return "";
  const entries = corrections.map((correction) => `<li><strong>${escapeHtml(correction.severity)}</strong>: ${escapeHtml(correction.message)}${correction.href === undefined ? "" : ` <a href="${escapeHtml(correction.href)}">More</a>`}</li>`).join("\n");
  return `<aside class="koios-panel" aria-labelledby="correction-notice-title"><h2 id="correction-notice-title">Corrections</h2><ol>${entries}</ol><p><a href="/corrections">Correction register</a></p></aside>`;
}

function articleRightsHtml(post: KoiosPost, item: KoiosItem): string {
  const license = post.frontMatter.license;
  const licenseUrl = post.frontMatter.license_url;
  const syndication = post.frontMatter.syndication_rights;
  if (license === undefined && licenseUrl === undefined && syndication === undefined) return "";
  const licenseText = licenseUrl === undefined
    ? escapeHtml(license ?? "Declared license")
    : `<a rel="license" href="${escapeHtml(licenseUrl)}">${escapeHtml(license ?? licenseUrl)}</a>`;
  return `<aside class="koios-panel" aria-labelledby="article-rights-title">
<h2 id="article-rights-title">Rights and republication</h2>
<p>This article is published under ${licenseText}. Reuse should credit ${escapeHtml(item.author)} and link the canonical article URL: <a href="${escapeHtml(item.url)}">${escapeHtml(item.url)}</a>.</p>
${syndication === undefined ? "" : `<p>${escapeHtml(syndication)}</p>`}
</aside>`;
}

function articlePageHtml(projection: PublicProjection, slug: string): string | null {
  const item = projection.itemsBySlug.get(slug);
  const post = projection.postsBySlug.get(slug);
  if (item === undefined || post === undefined) return null;
  const article = articleForItem(post, item, projection.masthead);
  const section = item.section ?? post.frontMatter.categories[0] ?? "News";
  const socialImage = item.image ?? `${projection.masthead.siteUrl}/fingerprints/${encodeURIComponent(item.slug)}.png`;
  const jsonLd = articleToNewsArticleJsonLd(article);
  const html = articleToHtmlPage(article, {
    lang: projection.masthead.language,
    siteName: projection.masthead.title,
    url: article.url,
    image: socialImage,
  });
  const headAdditions = [
    `  <script type="application/ld+json">${escapeScriptJson(jsonLd)}</script>`,
    `  ${metaProperty("article:section", section)}`,
    `  ${metaProperty("og:image", socialImage)}`,
    `  ${metaProperty("og:image:type", "image/png")}`,
    `  ${metaProperty("og:image:width", String(FINGERPRINT_IMAGE_WIDTH))}`,
    `  ${metaProperty("og:image:height", String(FINGERPRINT_IMAGE_HEIGHT))}`,
    `  ${metaName("twitter:card", "summary_large_image")}`,
    `  ${metaName("twitter:image", socialImage)}`,
    `  <style data-metroplat-projection="themed-page-and-css">\n${styleElementContent(pageStyles(article))}</style>`,
  ].join("\n");
  const extras = [
    correctionNoticeHtml(post),
    articleRightsHtml(post, item),
    relatedStoriesHtml(post, item, projection),
  ].filter((value) => value !== "").join("\n");
  return html
    .replace("</head>", `${headAdditions}\n</head>`)
    .replace("<body>", `<body class="metroplat-themed-page koios-page" data-metroplat-profile="${escapeHtml(KOIOS_THEME_REGIME)}">`)
    .replace("<main>", `${siteHeader(itemPath(item))}\n${koiosAdSlotHtml("header", `${itemPath(item)}:header`)}\n<main class="koios-page-main" data-metroplat-locus="main">`)
    .replace("</main>", `${koiosAdSlotHtml("inArticle", `${itemPath(item)}:inArticle`)}${extras === "" ? "" : `\n${extras}\n`}</main>`)
    .replace("</body>", `${koiosAdSlotHtml("footer", `${itemPath(item)}:footer`)}\n${siteFooter(projection.masthead)}\n${finalBodyScripts()}\n</body>`);
}

function feedMeta(masthead: KoiosMasthead, feedPath: string): RssFeedMeta & ArticleFeedMeta & JsonFeedMeta {
  return {
    id: `${masthead.siteUrl}${feedPath}`,
    title: masthead.title,
    homePageUrl: masthead.siteUrl,
    siteUrl: masthead.siteUrl,
    feedUrl: `${masthead.siteUrl}${feedPath}`,
    description: SITE_DESCRIPTION,
    language: masthead.language,
    author: masthead.author.name,
  };
}

function sitemapXml(masthead: KoiosMasthead, articles: readonly FeedArticle[]): string {
  const files = buildStaticSite(
    { articles: articles as readonly StaticSiteArticleCarrier[] },
    {
      siteUrl: masthead.siteUrl,
      title: masthead.title,
      description: SITE_DESCRIPTION,
      language: masthead.language,
      author: masthead.author.name,
      postsPath: masthead.itemPath.replace(/^\/+/u, ""),
      robots: { allow: ["/"] },
    },
  );
  const sitemap = files.get("sitemap.xml");
  if (sitemap === undefined) throw new Error("metroplat static-site projection did not produce sitemap.xml");
  return sitemap;
}

function postTopicSubject(post: KoiosPost | undefined): NinjsSubject | null {
  if (post === undefined) return null;
  const slugs = uniqueStrings([
    post.frontMatter.koios.beat,
    ...post.frontMatter.categories.map(slugLabel),
  ]);
  for (const slug of slugs) {
    const subject = topicSubject(slug);
    if (subject !== null) return Object.freeze({ name: subject.name, code: subject.code, scheme: MEDTOP_SCHEME });
  }
  return null;
}

function keywordSubjects(item: KoiosItem): readonly NinjsSubject[] {
  return Object.freeze(uniqueStrings(item.keywords).map((keyword) => Object.freeze({ name: keyword })));
}

function ninjsRecord(post: KoiosPost, item: KoiosItem, masthead: KoiosMasthead): NinjsRecord {
  const medtop = postTopicSubject(post);
  return Object.freeze({
    uri: item.url,
    type: "text" as const,
    version: "1",
    language: masthead.language,
    headline: item.headline,
    slugline: item.slug,
    byline: item.author,
    firstcreated: item.published,
    versioncreated: item.published,
    pubstatus: item.isPublic ? "usable" : "withheld",
    copyrightholder: masthead.publisher,
    ...(post.frontMatter.license === undefined ? {} : { copyrightnotice: post.frontMatter.license }),
    ...(item.summary === "" ? {} : { description_text: item.summary }),
    body_text: post.article.body,
    subject: Object.freeze([
      ...(medtop === null ? [] : [medtop]),
      ...keywordSubjects(item),
    ]),
  });
}

function ninjsRecords(projection: PublicProjection): readonly NinjsRecord[] {
  return Object.freeze(projection.items.flatMap((item) => {
    const post = projection.postsBySlug.get(item.slug);
    return post === undefined ? [] : [ninjsRecord(post, item, projection.masthead)];
  }));
}

function citation(reference: KoiosReference): NewswireCitation {
  return Object.freeze({
    id: reference.id,
    type: reference.type,
    title: reference.title,
    url: reference.URL,
    ...(reference["container-title"] === undefined ? {} : { containerTitle: reference["container-title"] }),
    ...(reference.issued === undefined ? {} : { issued: reference.issued }),
  });
}

function auditReport(post: KoiosPost, item: KoiosItem): NewswireAuditReport {
  return Object.freeze({
    kind: "koios.news.gate-report" as const,
    slug: post.slug,
    title: post.frontMatter.title,
    url: item.url,
    public: item.isPublic,
    gates_clear: post.frontMatter.koios.gates_clear === true,
    standards_reviewed_at: post.frontMatter.koios.standards_reviewed_at ?? null,
    references: post.frontMatter.references,
    citations: Object.freeze(post.frontMatter.references.map(citation)),
    evidence: Object.freeze({
      reference_count: post.frontMatter.references.length,
      claim_projection: post.claims.kind,
      gate_claim: "article.publication.gates_clear" as const,
    }),
  });
}

function auditReports(projection: PublicProjection): readonly NewswireAuditReport[] {
  return Object.freeze(projection.posts.map((post) => auditReport(
    post,
    projection.itemsBySlug.get(post.slug) ?? koiosItems([post], projection.masthead)[0]!,
  )));
}

function textResource(id: string, match: string | RegExp, type: string, body: (projection: PublicProjection) => string): Resource {
  return {
    id,
    match,
    methods: ["GET", "HEAD"],
    produces: [type],
    handler: async () => textRepr(body(await loadPublicProjection()), { type, headers: responseHeadersForType(type) }),
  };
}

function dynamicHtmlResource(
  id: string,
  match: string | RegExp,
  body: (projection: PublicProjection, path: string) => string | null,
): Resource {
  return {
    id,
    match,
    methods: ["GET", "HEAD"],
    produces: ["text/html; charset=utf-8"],
    handler: async (ctx) => {
      const html = body(await loadPublicProjection(), ctx.url.pathname);
      return html === null ? textRepr("not found\n", 404) : textRepr(html, {
        type: "text/html; charset=utf-8",
        headers: advertisingResponseHeaders(),
      });
    },
  };
}

function jsonResource(id: string, match: string, body: (projection: PublicProjection) => unknown, type = "application/json; charset=utf-8"): Resource {
  return {
    id,
    match,
    methods: ["GET", "HEAD"],
    produces: [type],
    handler: async () => jsonRepr(jsonCarrier(body(await loadPublicProjection()), id), { type }),
  };
}

function fingerprintSlug(path: string, extension: ".svg" | ".png" | ".json"): string {
  const file = path.split("/").filter(Boolean).at(-1) ?? "";
  return decodeURIComponent(file.replace(new RegExp(`${extension.replace(".", "\\.")}$`, "u"), ""));
}

function fingerprintResource(kind: "svg" | "png" | "json"): Resource {
  const extension = `.${kind}` as ".svg" | ".png" | ".json";
  const mediaType = kind === "svg" ? "image/svg+xml" : kind === "png" ? "image/png" : "application/ld+json";
  return {
    id: `koios.news.fingerprint.${kind}`,
    route: `/fingerprints/:slug${extension}`,
    match: new RegExp(`^/fingerprints/[^/]+\\${extension}$`, "u"),
    methods: ["GET", "HEAD"],
    produces: [mediaType],
    handler: async (ctx) => {
      const projection = await loadPublicProjection();
      const slug = fingerprintSlug(ctx.url.pathname, extension);
      const item = projection.itemsBySlug.get(slug);
      const post = projection.postsBySlug.get(slug);
      if (item === undefined || post === undefined) return textRepr("no such fingerprint\n", 404);
      if (kind === "png") {
        return {
          type: mediaType,
          body: articleFingerprintPng(post),
        };
      }
      return textRepr(
        kind === "svg"
          ? articleFingerprintSvg(post, item)
          : articleFingerprintJson(post, item, projection.masthead),
        { type: mediaType },
      );
    },
  };
}

export type KoiosSurfaceOptions = Readonly<{
  dataRoot?: string;
}>;

export function createKoiosSurfaceResources(options: KoiosSurfaceOptions = {}): readonly Resource[] {
  const dataRoot = resolve(options.dataRoot ?? packageRoot);
  return Object.freeze([
  textResource("koios.news.home", "/", "text/html; charset=utf-8", homepageHtml),
  textResource("koios.news.about", "/about", "text/html; charset=utf-8", aboutHtml),
  textResource("koios.news.privacy", "/privacy", "text/html; charset=utf-8", privacyHtml),
  {
    id: "koios.news.hit",
    match: "/hit",
    methods: ["POST"],
    handler: (ctx) => hitResource(dataRoot, ctx),
  },
  {
    id: "koios.news.ad-impression",
    match: "/ad-impression",
    methods: ["POST"],
    handler: (ctx) => adImpressionResource(dataRoot, ctx),
  },
  {
    id: "koios.news.views",
    match: "/views.json",
    methods: ["GET", "HEAD"],
    produces: ["application/json; charset=utf-8"],
    handler: async () => textRepr(`${JSON.stringify(viewCounts(viewStore(dataRoot)))}\n`, {
      type: "application/json; charset=utf-8",
    }),
  },
  {
    id: "koios.news.ads-performance",
    match: "/ads-performance.json",
    methods: ["GET", "HEAD"],
    produces: ["application/json; charset=utf-8"],
    handler: async () => jsonRepr(jsonCarrier(adPerformanceReadingAtRoot(dataRoot), "koios.news.ads-performance"), {
      type: "application/json; charset=utf-8",
    }),
  },
  {
    id: "koios.news.desks",
    match: "/desks.json",
    methods: ["GET", "HEAD"],
    produces: ["application/json; charset=utf-8"],
    handler: async () => jsonRepr(jsonCarrier(await projectDeskQueue(dataRoot), "koios.news.desks"), {
      type: "application/json; charset=utf-8",
    }),
  },
  {
    id: "koios.news.ads-txt",
    match: "/ads.txt",
    methods: ["GET", "HEAD"],
    produces: ["text/plain; charset=utf-8"],
    handler: async () => {
      const body = advertisingAdsTxt(advertisingPolicyFromEnv());
      return body === null ? textRepr("not found\n", 404) : textRepr(body, { type: "text/plain; charset=utf-8" });
    },
  },
  textResource("koios.news.standards", /^\/standards\/?$/u, "text/html; charset=utf-8", standardsHtml),
  jsonResource("koios.news.standards-json", "/standards.json", standardsReading),
  textResource("koios.news.topics", /^\/topics\/?$/u, "text/html; charset=utf-8", topicsHtml),
  dynamicHtmlResource("koios.news.topic", /^\/topics\/[a-z0-9-]+\/?$/u, (projection, path) =>
    topicHtml(projection, path.split("/").filter(Boolean)[1] ?? "")),
  textResource("koios.news.archive", /^\/archive\/?$/u, "text/html; charset=utf-8", archiveHtml),
  dynamicHtmlResource("koios.news.archive-year", /^\/archive\/\d{4}\/?$/u, (projection, path) =>
    archiveYearHtml(projection, path.split("/").filter(Boolean)[1] ?? "")),
  dynamicHtmlResource("koios.news.archive-month", /^\/archive\/\d{4}\/\d{2}\/?$/u, (projection, path) => {
    const parts = path.split("/").filter(Boolean);
    return archiveMonthHtml(projection, parts[1] ?? "", parts[2] ?? "");
  }),
  textResource("koios.news.corrections", /^\/corrections\/?$/u, "text/html; charset=utf-8", correctionsHtml),
  jsonResource("koios.news.corrections-json", "/corrections.json", (projection) => Object.freeze({
    kind: "koios.news.corrections",
    count: correctionRecords(projection).length,
    records: correctionRecords(projection),
    policy: Object.freeze([
      "Generated from public Article correction metadata only.",
      "Corrections are publication accountability records, not reader analytics.",
      "An empty register means no current public article declares a correction record.",
    ]),
  })),
  dynamicHtmlResource("koios.news.post", /^\/posts\/[^/]+\/?$/u, (projection, path) =>
    articlePageHtml(projection, decodeURIComponent(path.split("/").filter(Boolean)[1] ?? ""))),
  fingerprintResource("svg"),
  fingerprintResource("png"),
  fingerprintResource("json"),
  textResource("koios.news.feed.rss", "/feed.xml", "application/rss+xml", ({ masthead, articles }) =>
    articlesToRss(feedMeta(masthead, "/feed.xml"), articles)),
  textResource("koios.news.feed.atom", "/feed.atom", "application/atom+xml", ({ masthead, articles }) =>
    articlesToAtom(feedMeta(masthead, "/feed.atom"), articles)),
  textResource("koios.news.feed.json", "/feed.json", "application/feed+json", ({ masthead, articles }) =>
    articlesToJsonFeed(feedMeta(masthead, "/feed.json"), articles)),
  jsonResource("koios.news.ninjs", "/ninjs.json", ninjsRecords, "application/vnd.iptc.ninjs+json; charset=utf-8"),
  jsonResource("koios.news.newswire-audit", "/newswire-audit.json", auditReports),
  textResource("koios.news.sitemap", "/sitemap.xml", "application/xml", ({ masthead, articles }) =>
    sitemapXml(masthead, articles)),
  textResource("koios.news.news-sitemap", "/news-sitemap.xml", "application/xml", ({ masthead, articles }) =>
    articlesToNewsSitemap(articles, {
      siteUrl: masthead.siteUrl,
      pathPrefix: masthead.itemPath,
      publicationName: masthead.publisher,
      publicationLanguage: masthead.language,
    })),
  textResource("koios.news.robots", "/robots.txt", "text/plain", ({ masthead }) =>
    robotsTxt({
      sitemapUrl: `${masthead.siteUrl}/sitemap.xml`,
      sitemapUrls: [
        `${masthead.siteUrl}/sitemap.xml`,
        `${masthead.siteUrl}/news-sitemap.xml`,
      ],
      allow: ["/"],
      disallow: [],
    })),
  ]);
}

export const surfaceResources: readonly Resource[] = createKoiosSurfaceResources();
