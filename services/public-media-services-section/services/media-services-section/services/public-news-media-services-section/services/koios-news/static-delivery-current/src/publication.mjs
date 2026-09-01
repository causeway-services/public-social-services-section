import { createHash } from "node:crypto";
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";

const MARKER = ".koios-static-delivery-current";
const ORIGIN = "https://koios.news";
// House ad server (@red-cup-engineering/advertising-services-section), v0
// unlisted workers.dev route. The footer slot fetches its creative
// client-side so build output stays byte-deterministic regardless of
// which creative is later served.
const HOUSE_AD_SERVER = "https://house-ads-server.morgan-sennhauser.workers.dev";
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/u;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const EXCLUDED_ARTIFACTS = new Set(["hit", "views.json", "healthz", "newsroom", "cable", "mcp", "operators", "private"]);
// XML 1.0 cannot represent these C0 controls.  The carrier emits RSS and Atom,
// so reject them at the Markdown boundary instead of generating a feed that
// looks escaped but is not parseable XML.
const XML_INVALID_CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u;

const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const bytewise = (left, right) => Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
const escapeHtml = (value) => String(value).replace(/[&<>"']/gu, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const escapeXml = escapeHtml;
const canonical = (path) => `${ORIGIN}${path}`;
const taxonomySlug = (value) => value.normalize("NFKD").replace(/[\u0300-\u036f]/gu, "").toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-+|-+$/gu, "");

function safeFeedText(value, file, field) {
  if (XML_INVALID_CONTROL.test(value)) throw new Error(`${file}: ${field} contains a control character not permitted in RSS or Atom`);
  return value;
}

function scalar(raw) {
  const value = raw.trim();
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null" || value === "~") return null;
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    if (value.startsWith('"')) { try { return JSON.parse(value); } catch { throw new Error(`invalid quoted scalar: ${value}`); } }
    return value.slice(1, -1).replace(/''/gu, "'");
  }
  if (value.startsWith("[") && value.endsWith("]")) {
    try { const decoded = JSON.parse(value); if (!Array.isArray(decoded) || !decoded.every((item) => typeof item === "string")) throw new Error(); return decoded; } catch { throw new Error(`only JSON string arrays are supported: ${value}`); }
  }
  return value;
}

/** A deliberately narrow codec for the top-level fields the carrier publishes. */
export function parsePost(source, file) {
  const lines = source.replace(/\r\n?/gu, "\n").split("\n");
  if (lines[0] !== "---") throw new Error(`${file}: missing opening front-matter delimiter`);
  const close = lines.indexOf("---", 1);
  if (close < 0) throw new Error(`${file}: missing closing front-matter delimiter`);
  const frontMatter = Object.create(null);
  for (const line of lines.slice(1, close)) {
    if (line.trim() === "" || /^\s/u.test(line)) continue; // nested editorial metadata is not public-carrier input.
    const match = /^([^:#][^:]*):(?:\s(.*))?$/u.exec(line);
    if (!match) throw new Error(`${file}: malformed front-matter line: ${line}`);
    const key = match[1].trim();
    if (Object.hasOwn(frontMatter, key)) throw new Error(`${file}: duplicate front-matter key ${key}`);
    frontMatter[key] = scalar(match[2] ?? "");
  }
  const body = lines.slice(close + 1).join("\n").trim();
  const stem = file.replace(/\.md$/u, "");
  const title = frontMatter.title;
  const date = frontMatter.date;
  const draft = frontMatter.draft;
  const slug = frontMatter.slug ?? stem;
  if (typeof title !== "string" || title.trim() === "") throw new Error(`${file}: title must be a non-empty string`);
  if (typeof date !== "string" || !ISO_DAY.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) throw new Error(`${file}: date must be YYYY-MM-DD`);
  if (typeof draft !== "boolean") throw new Error(`${file}: draft must be true or false`);
  if (typeof slug !== "string" || !SLUG.test(slug)) throw new Error(`${file}: slug must be lowercase URL-safe words`);
  if (slug !== stem) throw new Error(`${file}: slug must equal filename stem (${stem})`);
  if (body === "") throw new Error(`${file}: article body is empty`);
  for (const field of ["description", "summary"]) if (frontMatter[field] !== undefined && typeof frontMatter[field] !== "string") throw new Error(`${file}: ${field} must be a string when present`);
  const publicStrings = (field) => {
    const values = Array.isArray(frontMatter[field]) ? [...new Set(frontMatter[field].map((value) => value.trim()).filter(Boolean))] : [];
    if (values.length > 64 || values.some((value) => value.length > 128 || /[\u0000-\u001f\u007f]/u.test(value))) throw new Error(`${file}: ${field} contains unsafe or excessive public metadata`);
    return values;
  };
  const publicScalar = (field) => typeof frontMatter[field] === "string" && frontMatter[field].trim() ? frontMatter[field].trim() : undefined;
  const keywords = publicStrings("keywords"), license = publicScalar("license"), licenseUrl = publicScalar("license_url"), syndicationRights = publicScalar("syndication_rights");
  if ((licenseUrl !== undefined || syndicationRights !== undefined) && license === undefined) throw new Error(`${file}: license_url and syndication_rights need a license value`);
  if (licenseUrl !== undefined) { let url; try { url = new URL(licenseUrl); } catch { throw new Error(`${file}: license_url must be an absolute HTTPS URL`); } if (url.protocol !== "https:" || url.username || url.password) throw new Error(`${file}: license_url must be an absolute HTTPS URL without credentials`); }
  const publicTitle = safeFeedText(title.trim(), file, "title");
  const author = safeFeedText(typeof frontMatter.author === "string" && frontMatter.author.trim() ? frontMatter.author.trim() : "Koios.News", file, "author");
  const description = safeFeedText((frontMatter.description ?? frontMatter.summary ?? body.split(/\n\s*\n/u)[0]).trim(), file, "description");
  return Object.freeze({ file, title: publicTitle, date, draft, slug, body, author, description, categories: publicStrings("categories"), tags: [...new Set([...publicStrings("tags"), ...keywords])], keywords, license, licenseUrl, syndicationRights, sourceDigest: digest(source) });
}

export function readPosts(contentDir) {
  if (!existsSync(contentDir) || !statSync(contentDir).isDirectory()) throw new Error(`content directory does not exist: ${contentDir}`);
  const posts = readdirSync(contentDir, { withFileTypes: true }).filter((entry) => entry.isFile() && entry.name.endsWith(".md")).map((entry) => parsePost(readFileSync(join(contentDir, entry.name), "utf8"), entry.name));
  const seen = new Set();
  for (const post of posts) { if (seen.has(post.slug)) throw new Error(`duplicate post slug: ${post.slug}`); seen.add(post.slug); }
  return Object.freeze(posts.filter((post) => !post.draft).sort((left, right) => bytewise(right.date, left.date) || bytewise(left.slug, right.slug)));
}

function markdown(body) {
  const blocks = body.split(/\n\s*\n/gu).filter(Boolean);
  return blocks.map((block) => {
    const heading = /^(#{1,3})\s+(.+)$/u.exec(block);
    if (heading) { const level = heading[1].length; return `<h${level}>${inline(heading[2])}</h${level}>`; }
    const items = block.split("\n");
    if (items.every((line) => /^-\s+/u.test(line))) return `<ul>${items.map((line) => `<li>${inline(line.replace(/^-\s+/u, ""))}</li>`).join("")}</ul>`;
    return `<p>${inline(block.replace(/\n+/gu, " "))}</p>`;
  }).join("\n");
}
function inline(text) {
  const escaped = escapeHtml(text);
  return escaped.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/gu, '<a href="$2" rel="noopener noreferrer">$1</a>');
}
/** @param {{type?: "website"|"article", publishedTime?: string, section?: string}} [social] Open Graph/Twitter Card fields; `type` defaults to "website". */
function layout(title, description, body, canonicalPath = "/", jsonLd, social = {}) {
  const structuredData = jsonLd === undefined ? "" : `\n<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</gu, "\\u003c")}</script>`;
  const socialMeta = [
    `<meta property="og:type" content="${social.type ?? "website"}">`,
    `<meta property="og:site_name" content="Koios.News">`,
    `<meta property="og:title" content="${escapeHtml(title)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    `<meta property="og:url" content="${canonical(canonicalPath)}">`,
    ...(social.publishedTime === undefined ? [] : [`<meta property="article:published_time" content="${social.publishedTime}">`]),
    ...(social.section === undefined ? [] : [`<meta property="article:section" content="${escapeHtml(social.section)}">`]),
    `<meta name="twitter:card" content="summary">`,
    `<meta name="twitter:title" content="${escapeHtml(title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(description)}">`,
  ].join("\n");
  return `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>${escapeHtml(title)}</title>\n<meta name="description" content="${escapeHtml(description)}">\n<link rel="canonical" href="${canonical(canonicalPath)}">\n<link rel="alternate" type="application/rss+xml" href="/feed.xml" title="Koios.News RSS">\n<link rel="alternate" type="application/atom+xml" href="/feed.atom" title="Koios.News Atom">\n<link rel="alternate" type="application/feed+json" href="/feed.json" title="Koios.News JSON Feed">\n${socialMeta}${structuredData}\n</head>\n<body>\n<header><a href="/">Koios.News</a><nav aria-label="Primary"><a href="/topics">Topics</a> <a href="/tags">Tags</a> <a href="/archive">Archive</a> <a href="/about">About</a> <a href="/standards">Standards</a> <a href="/corrections">Corrections</a> <a href="/privacy">Privacy</a></nav></header>\n<main>\n${body}\n</main>\n<footer><a href="/topics">Topics</a> · <a href="/tags">Tags</a> · <a href="/archive">Archive</a> · <a href="/feed.xml">RSS</a> · <a href="/feed.atom">Atom</a> · <a href="/feed.json">JSON Feed</a> · <a href="/sitemap.xml">Sitemap</a> · <a href="/newswire-audit.json">Editorial audit</a><div id="house-ad-footer" data-slot="footer" data-property="koios-news"></div></footer>\n<script>(function(){var s="footer",p="koios-news",el=document.getElementById("house-ad-footer"),base="${HOUSE_AD_SERVER}";fetch(base+"/ad?slot="+s+"&property="+p).then(function(r){return r.ok?r.json():null;}).then(function(d){if(!d||!d.creative||!el)return;var a=document.createElement("a");a.href=base+"/click?slot="+s+"&property="+p+"&creative="+encodeURIComponent(d.creative.id);a.rel="sponsored noopener noreferrer";a.textContent=d.creative.title+" — "+d.creative.body;el.appendChild(a);}).catch(function(){});})();</script>\n</body>\n</html>\n`;
}
function postPage(post) {
  const url = canonical(`/posts/${post.slug}`);
  const taxonomy = [...post.categories.map((title) => `<a rel="tag" href="/topics/${taxonomySlug(title)}">${escapeHtml(title)}</a>`), ...post.tags.map((title) => `<a rel="tag" href="/tags/${taxonomySlug(title)}">${escapeHtml(title)}</a>`)].join(", ");
  const rights = post.license === undefined ? "" : `<aside><h2>Rights and republication</h2><p>This article is published under ${post.licenseUrl === undefined ? escapeHtml(post.license) : `<a rel="license" href="${escapeHtml(post.licenseUrl)}">${escapeHtml(post.license)}</a>`}.${post.syndicationRights === undefined ? "" : ` ${escapeHtml(post.syndicationRights)}`}</p></aside>`;
  const article = `<article class="h-entry"><h1 class="p-name">${escapeHtml(post.title)}</h1><p><time class="dt-published" datetime="${post.date}T00:00:00Z">${post.date}</time> · ${escapeHtml(post.author)}</p><p class="p-summary">${escapeHtml(post.description)}</p>${taxonomy === "" ? "" : `<p>Topics: ${taxonomy}</p>`}<div class="e-content">${markdown(post.body)}</div><p><a class="u-url" href="/posts/${post.slug}">Permalink</a></p>${rights}</article>`;
  return layout(`${post.title} — Koios.News`, post.description, article, `/posts/${post.slug}`, { "@context": "https://schema.org", "@type": "NewsArticle", headline: post.title, datePublished: `${post.date}T00:00:00Z`, dateModified: `${post.date}T00:00:00Z`, author: { "@type": "Person", name: post.author }, description: post.description, mainEntityOfPage: url, url, publisher: { "@type": "Organization", name: "Koios.News", url: ORIGIN }, ...(post.categories[0] === undefined ? {} : { articleSection: post.categories[0] }), ...(post.keywords.length === 0 ? {} : { keywords: post.keywords }), ...(post.licenseUrl === undefined ? {} : { license: post.licenseUrl }) }, { type: "article", publishedTime: `${post.date}T00:00:00Z`, ...(post.categories[0] === undefined ? {} : { section: post.categories[0] }) });
}
function homePage(posts) {
  const entries = posts.map((post) => `<article class="h-entry"><h2 class="p-name"><a class="u-url" href="/posts/${post.slug}">${escapeHtml(post.title)}</a></h2><p><time class="dt-published" datetime="${post.date}T00:00:00Z">${post.date}</time> · ${escapeHtml(post.author)}</p><p class="p-summary">${escapeHtml(post.description)}</p></article>`).join("\n");
  return layout("Koios.News", "General news with systems-analysis depth.", `<h1>Koios.News</h1>\n${entries || "<p>No published posts.</p>"}`, "/", { "@context": "https://schema.org", "@type": "NewsMediaOrganization", name: "Koios.News", url: ORIGIN });
}
function rss(posts) {
  const items = posts.map((post) => `<item><title>${escapeXml(post.title)}</title><link>${canonical(`/posts/${post.slug}`)}</link><guid isPermaLink="true">${canonical(`/posts/${post.slug}`)}</guid><pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate><description>${escapeXml(post.description)}</description><author>${escapeXml(post.author)}</author>${[...post.categories, ...post.tags].map((term) => `<category>${escapeXml(term)}</category>`).join("")}</item>`).join("");
  const buildDate = posts[0] ? new Date(`${posts[0].date}T00:00:00Z`).toUTCString() : "Thu, 01 Jan 1970 00:00:00 GMT";
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>Koios.News</title><link>${ORIGIN}/</link><description>General news with systems-analysis depth.</description><lastBuildDate>${buildDate}</lastBuildDate>${items}</channel></rss>\n`;
}
function atom(posts) {
  const updated = posts[0] ? `${posts[0].date}T00:00:00Z` : "1970-01-01T00:00:00Z";
  const entries = posts.map((post) => `<entry><id>${canonical(`/posts/${post.slug}`)}</id><title>${escapeXml(post.title)}</title><link href="${canonical(`/posts/${post.slug}`)}"/><updated>${post.date}T00:00:00Z</updated><published>${post.date}T00:00:00Z</published><summary>${escapeXml(post.description)}</summary>${[...post.categories, ...post.tags].map((term) => `<category term="${escapeXml(term)}"/>`).join("")}</entry>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom"><id>${ORIGIN}/</id><title>Koios.News</title><updated>${updated}</updated><link href="${canonical("/feed.atom")}" rel="self"/>${entries}</feed>\n`;
}
function jsonFeed(posts) {
  return `${JSON.stringify({ version: "https://jsonfeed.org/version/1.1", title: "Koios.News", home_page_url: `${ORIGIN}/`, feed_url: canonical("/feed.json"), items: posts.map((post) => ({ id: canonical(`/posts/${post.slug}`), url: canonical(`/posts/${post.slug}`), title: post.title, content_html: markdown(post.body), summary: post.description, date_published: `${post.date}T00:00:00Z`, authors: [{ name: post.author }], ...([...post.categories, ...post.tags].length === 0 ? {} : { tags: [...post.categories, ...post.tags] }) })) }, null, 2)}\n`;
}
function taxonomy(posts, field) {
  const entries = new Map();
  for (const post of posts) for (const title of post[field]) {
    const slug = taxonomySlug(title);
    if (slug === "") continue;
    const entry = entries.get(slug) ?? { slug, title, posts: [] };
    if (bytewise(title, entry.title) < 0) entry.title = title;
    entry.posts.push(post);
    entries.set(slug, entry);
  }
  return [...entries.values()].map((entry) => Object.freeze({ ...entry, posts: Object.freeze([...entry.posts].sort((left, right) => bytewise(right.date, left.date) || bytewise(left.slug, right.slug))) })).sort((left, right) => bytewise(left.slug, right.slug));
}
function archive(posts) {
  const years = new Map();
  for (const post of posts) {
    const [year, month] = post.date.split("-");
    const byMonth = years.get(year) ?? new Map();
    const entries = byMonth.get(month) ?? [];
    entries.push(post); byMonth.set(month, entries); years.set(year, byMonth);
  }
  return [...years.entries()].map(([year, months]) => Object.freeze({ year, months: Object.freeze([...months.entries()].map(([month, entries]) => Object.freeze({ month, posts: Object.freeze([...entries].sort((left, right) => bytewise(right.date, left.date) || bytewise(left.slug, right.slug))) })).sort((left, right) => bytewise(right.month, left.month))) })).sort((left, right) => bytewise(right.year, left.year));
}
function sitemap(posts, tags, topics, archives) {
  const dated = new Map(posts.map((post) => [`/posts/${post.slug}`, post.date]));
  const paths = ["/", "/about", "/privacy", "/standards", "/corrections", "/tags", "/topics", "/archive", ...posts.map((post) => `/posts/${post.slug}`), ...tags.map((tag) => `/tags/${tag.slug}`), ...topics.map((topic) => `/topics/${topic.slug}`), ...archives.flatMap((year) => [`/archive/${year.year}`, ...year.months.map((month) => `/archive/${year.year}/${month.month}`)])];
  const urls = paths.map((path) => `<url><loc>${canonical(path)}</loc>${dated.has(path) ? `<lastmod>${dated.get(path)}</lastmod>` : ""}</url>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>\n`;
}
function newsSitemap(posts) {
  // Google News accepts only recent articles.  Use the newest admitted source
  // date as the deterministic build reference instead of the wall clock, so
  // identical corpus bytes always produce identical sitemap bytes.
  const newest = posts[0] === undefined ? 0 : Date.parse(`${posts[0].date}T00:00:00Z`);
  const threshold = newest - (2 * 24 * 60 * 60 * 1000);
  const urls = posts.filter((post) => Date.parse(`${post.date}T00:00:00Z`) >= threshold).map((post) => `<url><loc>${canonical(`/posts/${post.slug}`)}</loc><news:news><news:publication><news:name>Koios.News</news:name><news:language>en</news:language></news:publication><news:publication_date>${post.date}T00:00:00Z</news:publication_date><news:title>${escapeXml(post.title)}</news:title></news:news></url>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${urls}</urlset>\n`;
}
function postList(posts) {
  return posts.map((post) => `<article><h2><a href="/posts/${post.slug}">${escapeHtml(post.title)}</a></h2><p><time datetime="${post.date}T00:00:00Z">${post.date}</time> · ${escapeHtml(post.description)}</p></article>`).join("\n");
}
function taxonomyIndexPage(kind, entries) {
  const label = kind === "tag" ? "Tags" : "Topics";
  const base = kind === "tag" ? "/tags" : "/topics";
  return layout(label, `${label} in the published Koios.News archive.`, `<h1>${label}</h1>${entries.map((entry) => `<article><h2><a href="${base}/${entry.slug}">${escapeHtml(entry.title)}</a></h2><p>${entry.posts.length} ${entry.posts.length === 1 ? "post" : "posts"}</p></article>`).join("\n") || `<p>No ${label.toLowerCase()}.</p>`}`, base);
}
function taxonomyPage(kind, entry) {
  const label = kind === "tag" ? "Tag" : "Topic";
  const base = kind === "tag" ? "/tags" : "/topics";
  return layout(`${label}: ${entry.title}`, `${entry.posts.length} published posts filed under ${entry.title}.`, `<h1>${label}: ${escapeHtml(entry.title)}</h1>${postList(entry.posts)}`, `${base}/${entry.slug}`);
}
function taxonomyJson(kind, entries) {
  const base = kind === "tag" ? "/tags" : "/topics";
  return `${JSON.stringify({ kind: `koios.news.static-${kind}-index/v1`, items: entries.map((entry) => ({ slug: entry.slug, title: entry.title, count: entry.posts.length, url: canonical(`${base}/${entry.slug}`), latestPublished: entry.posts[0]?.date })) }, null, 2)}\n`;
}
function taxonomyEntryJson(kind, entry) {
  const base = kind === "tag" ? "/tags" : "/topics";
  return `${JSON.stringify({ kind: `koios.news.static-${kind}/v1`, slug: entry.slug, title: entry.title, url: canonical(`${base}/${entry.slug}`), posts: entry.posts.map((post) => ({ slug: post.slug, title: post.title, url: canonical(`/posts/${post.slug}`), published: post.date })) }, null, 2)}\n`;
}
function archiveIndexPage(entries) {
  return layout("Archive", "Koios.News archive by publication month.", `<h1>Archive</h1>${entries.map((year) => `<section><h2>${year.year}</h2>${year.months.map((month) => `<p><a href="/archive/${year.year}/${month.month}">${year.year}-${month.month}</a> · ${month.posts.length} ${month.posts.length === 1 ? "post" : "posts"}</p>`).join("")}</section>`).join("") || "<p>No published posts.</p>"}`, "/archive");
}
function archiveYearPage(year) {
  return layout(`Archive: ${year.year}`, `Koios.News posts published in ${year.year}.`, `<h1>Archive: ${year.year}</h1>${year.months.map((month) => `<section><h2><a href="/archive/${year.year}/${month.month}">${year.year}-${month.month}</a></h2>${postList(month.posts)}</section>`).join("\n")}`, `/archive/${year.year}`);
}
function archiveMonthPage(year, month) {
  return layout(`Archive: ${year.year}-${month.month}`, `Koios.News posts published in ${year.year}-${month.month}.`, `<h1>Archive: ${year.year}-${month.month}</h1>${postList(month.posts)}`, `/archive/${year.year}/${month.month}`);
}
function archiveJson(entries) {
  return `${JSON.stringify({ kind: "koios.news.static-archive/v1", years: entries.map((year) => ({ year: year.year, months: year.months.map((month) => ({ month: month.month, posts: month.posts.map((post) => ({ slug: post.slug, title: post.title, url: canonical(`/posts/${post.slug}`), published: post.date })) })) })) }, null, 2)}\n`;
}
function staticPage(path) {
  const pages = {
    "/about": ["About Koios.News", "Koios.News is an independent public-interest news publication. We identify source limits, corrections, and material use of AI in reporting."],
    "/standards": ["Editorial standards", "We seek accurate, attributable reporting; distinguish evidence from analysis; correct material errors promptly; and retain publication provenance where available."],
    "/corrections": ["Corrections", "Material corrections are recorded with the affected article. To report a possible error, use the publication contact recorded with the applicable article."],
    "/privacy": ["Privacy", "This static carrier does not send a first-party view beacon and does not expose an aggregate attention route. It does not retain reader identifiers. Accountable attention remains suspended."],
  };
  const [title, text] = pages[path];
  return layout(title, text, `<h1>${escapeHtml(title)}</h1><p>${escapeHtml(text)}</p>`, path);
}
function audit(posts) {
  return { kind: "koios.news.static-editorial-audit/v1", generatedFrom: "front-matter-only", provenance: { carrier: "@causeway-services/koios-news-static-delivery-current", canonicalOrigin: ORIGIN, inputOrder: "filename lexical; public order: date descending then slug", generatedAt: "deterministic-from-input" }, posts: posts.map((post) => ({ slug: post.slug, url: canonical(`/posts/${post.slug}`), published: post.date, sourceSha256: post.sourceDigest, status: "published-front-matter-draft-false", categories: post.categories })) };
}
function operations(path, posts) {
  if (path !== undefined) {
    const bytes = readFileSync(path);
    try { JSON.parse(bytes); } catch { throw new Error(`operations input is not valid JSON: ${path}`); }
    // This route is consumed by existing public tooling. Pass the admitted
    // document through byte-for-byte; wrapping it would silently change its
    // public contract. Its provenance belongs in the build manifest.
    return Object.freeze({ contents: bytes, provenance: Object.freeze({ sha256: digest(bytes), bytes: bytes.length }) });
  }
  const generated = { kind: "koios.news.static-operations/v1", provenance: { carrier: "@causeway-services/koios-news-static-delivery-current", canonicalOrigin: ORIGIN, operationsInput: null, generatedAt: "deterministic-from-input" }, publicPostCount: posts.length, status: "generated-without-operations-input" };
  return Object.freeze({ contents: Buffer.from(`${JSON.stringify(generated, null, 2)}\n`), provenance: null });
}
function safeWrite(root, relativePath, bytes) {
  const path = resolve(root, relativePath);
  const rel = relative(root, path);
  if (rel === "" || rel === ".." || rel.startsWith(`..${sep}`)) throw new Error(`output path escaped carrier: ${relativePath}`);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, bytes);
}
function safeArtifactPath(file) {
  if (typeof file !== "string" || file === "" || file.includes("\\") || file.startsWith("/") || file.split("/").some((part) => part === "" || part === "." || part === ".." || part.startsWith("."))) throw new Error(`unsafe baseline artifact path: ${String(file)}`);
  if (file === MARKER || file === "manifest.json") throw new Error(`baseline manifest must not list control artifact: ${file}`);
  if (EXCLUDED_ARTIFACTS.has(file.split("/")[0])) throw new Error(`baseline manifest includes excluded mutable route: ${file}`);
  return file;
}
function safeLegacyRoute(route, file) {
  const parts = typeof route === "string" ? route.split("/").slice(1) : [];
  const cloudflareHeaders = file === "_headers" ? "urn:cloudflare-pages:_headers" : undefined;
  if (typeof route !== "string" || route.includes("\\") || route.includes("\u0000") || (route !== cloudflareHeaders && (!route.startsWith("/") || (route !== "/" && parts.some((part) => part === "" || part === "." || part === ".."))))) throw new Error(`unsafe baseline artifact route: ${String(route)}`);
  const indexRoute = file.endsWith("/index.html") ? `/${file.slice(0, -"/index.html".length)}` : file === "index.html" ? "/" : undefined;
  if (route !== `/${file}` && route !== indexRoute && route !== cloudflareHeaders) throw new Error(`baseline artifact route does not bind its file: ${file}`);
  return route;
}
function normalizedNiDigest(value, file) {
  const prefix = "ni:///sha-256;";
  if (typeof value !== "string" || !new RegExp(`^${prefix}[A-Za-z0-9_-]{43}$`, "u").test(value)) throw new Error(`production baseline manifest has invalid digest metadata: ${file}`);
  const encoded = value.slice(prefix.length), bytes = Buffer.from(encoded, "base64url");
  if (bytes.length !== 32 || bytes.toString("base64url") !== encoded) throw new Error(`production baseline manifest has invalid digest metadata: ${file}`);
  return bytes.toString("hex");
}
function regularBaselineFile(root, file) {
  let cursor = root;
  for (const part of file.split("/")) {
    cursor = join(cursor, part);
    if (!existsSync(cursor)) throw new Error(`baseline artifact is missing: ${file}`);
    if (lstatSync(cursor).isSymbolicLink()) throw new Error(`baseline artifact must not traverse a symlink: ${file}`);
  }
  if (!lstatSync(cursor).isFile()) throw new Error(`baseline artifact is not a regular file: ${file}`);
  return cursor;
}
/** Verify a sealed offline production baseline; optionally copy only its sealed files. */
export function seedProductionBaseline({ baselineDir, staging }) {
  const root = resolve(baselineDir);
  if (!lstatSync(root).isDirectory() || lstatSync(root).isSymbolicLink()) throw new Error(`production baseline must be a non-symlink directory: ${root}`);
  const manifestPath = join(root, "manifest.json");
  if (!existsSync(manifestPath) || lstatSync(manifestPath).isSymbolicLink()) throw new Error(`production baseline lacks a regular manifest.json: ${root}`);
  let manifest;
  try { manifest = JSON.parse(readFileSync(manifestPath, "utf8")); } catch { throw new Error(`production baseline manifest is not valid JSON: ${manifestPath}`); }
  const current = manifest?.kind === "koios.news.static-publication-manifest/v1";
  const legacy = manifest?.kind === "koios.static-publication-manifest" && manifest.profile === "cutover-candidate" && manifest.authority === "non-authoritative-cutover-candidate" && manifest.canonicalOrigin === ORIGIN && Number.isSafeInteger(manifest.routeCount) && manifest.routeCount > 0 && Number.isSafeInteger(manifest.aliasCount) && manifest.aliasCount >= 0;
  if ((!current && !legacy) || !Array.isArray(manifest.artifacts) || manifest.artifacts.length === 0) throw new Error(`production baseline manifest has an unsupported shape: ${manifestPath}`);
  if (legacy && manifest.routeCount > manifest.artifacts.length) throw new Error(`production baseline manifest has an unsupported route count: ${manifestPath}`);
  const paths = new Set();
  const artifacts = manifest.artifacts.map((artifact) => {
    if (artifact === null || typeof artifact !== "object") throw new Error("production baseline manifest has an invalid artifact");
    const expectedFields = legacy ? ["route", "file", "mediaType", "bytes", "digest"] : ["file", "sha256", "bytes"];
    if (Object.keys(artifact).length !== expectedFields.length || !expectedFields.every((field) => Object.hasOwn(artifact, field))) throw new Error("production baseline manifest has an invalid artifact shape");
    const file = safeArtifactPath(artifact.file);
    if (paths.has(file)) throw new Error(`production baseline manifest has duplicate artifact: ${file}`);
    paths.add(file);
    if (!Number.isSafeInteger(artifact.bytes) || artifact.bytes < 0) throw new Error(`production baseline manifest has invalid digest metadata: ${file}`);
    if (legacy) {
      safeLegacyRoute(artifact.route, file);
      if (typeof artifact.mediaType !== "string" || artifact.mediaType === "" || /[\u0000-\u001f\u007f]/u.test(artifact.mediaType)) throw new Error(`production baseline manifest has invalid media type: ${file}`);
      return { file, sha256: normalizedNiDigest(artifact.digest, file), bytes: artifact.bytes };
    }
    if (!/^[a-f0-9]{64}$/u.test(artifact.sha256)) throw new Error(`production baseline manifest has invalid digest metadata: ${file}`);
    return { file, sha256: artifact.sha256, bytes: artifact.bytes };
  });
  for (const artifact of artifacts) {
    const source = regularBaselineFile(root, artifact.file);
    const bytes = readFileSync(source);
    if (bytes.length !== artifact.bytes || digest(bytes) !== artifact.sha256) throw new Error(`production baseline artifact digest mismatch: ${artifact.file}`);
    if (staging !== undefined) safeWrite(staging, artifact.file, bytes);
  }
  return Object.freeze({ schema: legacy ? "legacy-cloudflare-release-current" : "static-delivery-current/v1", kind: manifest.kind, artifactCount: artifacts.length, manifestSha256: digest(readFileSync(manifestPath)) });
}
/** Read-only full baseline verification for planning and preflight. */
export function verifyProductionBaseline({ baselineDir }) {
  return seedProductionBaseline({ baselineDir });
}
function stagedArtifacts(staging) {
  const artifacts = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((left, right) => bytewise(left.name, right.name))) {
      const path = join(directory, entry.name);
      const file = relative(staging, path).split(sep).join("/");
      if (entry.isSymbolicLink()) throw new Error(`output must not contain symlinks: ${file}`);
      if (entry.isDirectory()) visit(path);
      else if (entry.isFile() && file !== MARKER && file !== "manifest.json") { const bytes = readFileSync(path); artifacts.push({ file, sha256: digest(bytes), bytes: bytes.length }); }
      else if (!entry.isFile()) throw new Error(`output contains unsupported entry: ${file}`);
    }
  };
  visit(staging);
  return artifacts.sort((left, right) => bytewise(left.file, right.file));
}
function recognizedPriorOutput(target) {
  if (!lstatSync(target).isDirectory() || lstatSync(target).isSymbolicLink()) return false;
  const marker = join(target, MARKER);
  if (existsSync(marker)) return !lstatSync(marker).isSymbolicLink() && lstatSync(marker).isFile() && readFileSync(marker, "utf8") === "koios.news static-delivery-current v1\n";
  const manifest = join(target, "manifest.json");
  if (!existsSync(manifest) || lstatSync(manifest).isSymbolicLink() || !lstatSync(manifest).isFile()) return false;
  try { return JSON.parse(readFileSync(manifest, "utf8"))?.kind === "koios.news.static-publication-manifest/v1"; } catch { return false; }
}
function prepareOutput(outputDir, replace) {
  const target = resolve(outputDir);
  if (target === resolve("/") || target === resolve(process.cwd())) throw new Error(`refusing broad output target: ${target}`);
  const staging = `${target}.next`;
  if (existsSync(staging)) { if (!existsSync(join(staging, MARKER))) throw new Error(`refusing unmarked staging directory: ${staging}`); rmSync(staging, { recursive: true }); }
  if (existsSync(target)) { if (!replace) throw new Error(`output exists; use --replace only for a recognized prior artifact: ${target}`); if (!recognizedPriorOutput(target)) throw new Error(`refusing to replace an unrecognized output directory: ${target}`); }
  mkdirSync(staging, { recursive: true });
  writeFileSync(join(staging, MARKER), "koios.news static-delivery-current v1\n");
  return { target, staging };
}

export function buildPublication({ contentDir, outputDir, operationsPath, productionBaselineDir, replace = false, legacyRedirects = {} }) {
  if (typeof contentDir !== "string" || typeof outputDir !== "string") throw new Error("contentDir and outputDir are required");
  const posts = readPosts(resolve(contentDir));
  const { target, staging } = prepareOutput(outputDir, replace);
  const baseline = productionBaselineDir === undefined ? null : seedProductionBaseline({ baselineDir: productionBaselineDir, staging });
  const operationsArtifact = operations(operationsPath, posts);
  const tags = taxonomy(posts, "tags");
  const topics = taxonomy(posts, "categories");
  const archives = archive(posts);
  const files = new Map([[MARKER, "koios.news static-delivery-current v1\n"], ["index.html", homePage(posts)], ["feed.xml", rss(posts)], ["feed.atom", atom(posts)], ["feed.json", jsonFeed(posts)], ["sitemap.xml", sitemap(posts, tags, topics, archives)], ["news-sitemap.xml", newsSitemap(posts)], ["robots.txt", `User-agent: *\nAllow: /\nSitemap: ${canonical("/sitemap.xml")}\nSitemap: ${canonical("/news-sitemap.xml")}\n`], ["404.html", layout("Not found", "The requested public page does not exist.", '<h1>Not found</h1><p>The requested public page does not exist. <a href="/">Return to Koios.News</a>.</p>', "/")], ["_headers", "/*\n  Content-Security-Policy: default-src 'self'; base-uri 'self'; frame-ancestors 'none'\n  Referrer-Policy: no-referrer\n  X-Content-Type-Options: nosniff\n  X-Frame-Options: DENY\n\n/feed.atom\n  Content-Type: application/atom+xml; charset=utf-8\n/feed.json\n  Content-Type: application/feed+json; charset=utf-8\n"], ["newswire-audit.json", `${JSON.stringify(audit(posts), null, 2)}\n`], ["operations.json", operationsArtifact.contents], ["tags/index.html", taxonomyIndexPage("tag", tags)], ["tags.json", taxonomyJson("tag", tags)], ["topics/index.html", taxonomyIndexPage("topic", topics)], ["topics.json", taxonomyJson("topic", topics)], ["archive/index.html", archiveIndexPage(archives)], ["archive.json", archiveJson(archives)]]);
  for (const entry of tags) { files.set(join("tags", entry.slug, "index.html"), taxonomyPage("tag", entry)); files.set(join("tags", `${entry.slug}.json`), taxonomyEntryJson("tag", entry)); }
  for (const entry of topics) { files.set(join("topics", entry.slug, "index.html"), taxonomyPage("topic", entry)); files.set(join("topics", `${entry.slug}.json`), taxonomyEntryJson("topic", entry)); }
  for (const year of archives) { files.set(join("archive", year.year, "index.html"), archiveYearPage(year)); for (const month of year.months) files.set(join("archive", year.year, month.month, "index.html"), archiveMonthPage(year, month)); }
  for (const path of ["/about", "/privacy", "/standards", "/corrections"]) files.set(join(path.slice(1), "index.html"), staticPage(path));
  for (const post of posts) files.set(join("posts", post.slug, "index.html"), postPage(post));
  const publicRoutes = new Set(["/", "/about", "/privacy", "/standards", "/corrections", "/tags", "/topics", "/archive", ...posts.map((post) => `/posts/${post.slug}`), ...tags.map((entry) => `/tags/${entry.slug}`), ...topics.map((entry) => `/topics/${entry.slug}`), ...archives.flatMap((year) => [`/archive/${year.year}`, ...year.months.map((month) => `/archive/${year.year}/${month.month}`)])]);
  for (const [legacyPath, target] of Object.entries(legacyRedirects)) {
    const route = legacyPath.replace(/\/+$/u, "") || "/";
    if (route === "/" || !route.startsWith("/") || !publicRoutes.has(target)) throw new Error(`legacy redirect must be a non-root internal path to a public route: ${legacyPath}`);
    files.set(join(route.slice(1), "index.html"), layout("Koios.News legacy route", "A historical Koios.News route.", `<h1>Koios.News legacy route</h1><p>This historical path is preserved. <a href="${escapeHtml(target)}">Continue to the current public surface.</a></p>`, target));
  }
  for (const [file, contents] of [...files].sort(([left], [right]) => bytewise(left, right))) safeWrite(staging, file, contents);
  const artifacts = stagedArtifacts(staging);
  const manifest = { kind: "koios.news.static-publication-manifest/v1", provenance: { carrier: "@causeway-services/koios-news-static-delivery-current", canonicalOrigin: ORIGIN, operationsInput: operationsArtifact.provenance, ...(baseline === null ? {} : { productionBaseline: baseline }), generatedAt: "deterministic-from-input" }, policy: { indexing: "production-indexable", attention: "suspended", mutableRoutes: "excluded", renderer: "node-builtins-only" }, exclusions: ["/hit", "/views.json", "/healthz", "/newsroom", "/cable", "/mcp", "/operators", "/private"], legacyRouteCount: Object.keys(legacyRedirects).length, limitations: ["Legacy paths are canonical HTML continuation pages; actual HTTP 3xx redirects need separately admitted host rules.", "It does not reproduce mutable attention/view routes, advertisements, fingerprints, deployment, DNS, or cutover authority.", "The generated audit proves the exact source bytes read by this carrier; it is not a substitute for the retained editorial-gate ledger."], publishedPostCount: posts.length, artifacts };
  const manifestText = `${JSON.stringify(manifest, null, 2)}\n`;
  safeWrite(staging, "manifest.json", manifestText);
  rmSync(join(staging, MARKER));
  if (existsSync(target)) rmSync(target, { recursive: true });
  renameSync(staging, target);
  return Object.freeze({ outputDir: target, publishedPostCount: posts.length, manifestSha256: digest(manifestText) });
}
