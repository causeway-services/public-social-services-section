import { EMPTY_WITNESS_ROOT, identifyJsonSemanticContent } from "@red-cup-engineering/semantic-content-identify-service";
const rmnSemanticId = (value) => identifyJsonSemanticContent({ objectKind: "rsc-quiescent.record", value, witnessRoot: EMPTY_WITNESS_ROOT }).token;

const XML_ENTITIES = Object.freeze({ amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" });

function decodeXml(value) {
  return String(value ?? "")
    .replace(/&#x([0-9a-fA-F]+);/gu, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/gu, (_, decimal) => String.fromCodePoint(Number.parseInt(decimal, 10)))
    .replace(/&(amp|lt|gt|quot|apos);/gu, (_, name) => XML_ENTITIES[name]);
}
function removeCdata(value) { return String(value ?? "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gu, "$1"); }
function tidyXmlText(value) { return decodeXml(removeCdata(value)).replace(/\s+/gu, " ").trim(); }
function stripXmlTags(value) { return decodeXml(removeCdata(value).replace(/<[^>]+>/gu, " ")).replace(/\s+/gu, " ").trim(); }
function xmlTag(block, name) { return block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "iu"))?.[1] ?? ""; }
function xmlAttr(block, name, key) { return block.match(new RegExp(`<${name}\\b[^>]*\\b${key}="([^"]*)"`, "iu"))?.[1] ?? ""; }
function boundedCount(value, fallback = 20) { return Number.isInteger(value) && value > 0 ? Math.min(value, 100) : fallback; }
function sleep(milliseconds) { return new Promise((resolve) => setTimeout(resolve, milliseconds)); }

async function fetchText(url, source, io) {
  const fetchImpl = io.fetchImpl ?? fetch;
  const retries = Number.isInteger(source.retries) && source.retries >= 0 ? Math.min(source.retries, 6) : 4;
  for (let attempt = 0; ; attempt += 1) {
    const response = await fetchImpl(url);
    if (response.ok) return response.text();
    if ((response.status === 429 || response.status >= 500) && attempt < retries) { await (io.backoff ?? sleep)(Math.min(1000 * 2 ** attempt, 30_000)); continue; }
    throw new Error(`fetch failed: ${response.status} for ${url}`);
  }
}

function item(value) {
  if (typeof value.url !== "string" || value.url === "" || typeof value.title !== "string" || value.title === "") throw new TypeError("syndication item requires URL and title");
  return Object.freeze({ type: "SyndicationItem", url: value.url, title: value.title, ...(value.id ? { id: value.id } : {}), ...(value.summary ? { summary: value.summary } : {}), ...(value.authors?.length ? { authors: Object.freeze(value.authors) } : {}), ...(value.published ? { published: value.published } : {}), ...(value.categories?.length ? { categories: Object.freeze(value.categories) } : {}), ...(value.source ? { source: value.source } : {}) });
}

export function parseFeed(xml) {
  const text = String(xml); const atom = /<entry[\s>]/iu.test(text) && !/<item[\s>]/iu.test(text);
  const blocks = text.match(atom ? /<entry[\s>][\s\S]*?<\/entry>/giu : /<item[\s>][\s\S]*?<\/item>/giu) ?? [];
  return Object.freeze(blocks.flatMap((block) => {
    const title = tidyXmlText(xmlTag(block, "title"));
    const url = atom ? (xmlAttr(block, "link", "href") || tidyXmlText(xmlTag(block, "id"))) : tidyXmlText(xmlTag(block, "link"));
    if (!title || !url) return [];
    const summary = stripXmlTags(xmlTag(block, "content:encoded") || xmlTag(block, "content") || xmlTag(block, "summary") || xmlTag(block, "description"));
    const published = tidyXmlText(xmlTag(block, atom ? "updated" : "pubDate") || xmlTag(block, "published") || xmlTag(block, "dc:date"));
    const authors = [...block.matchAll(/<(?:author|dc:creator)(?:\s[^>]*)?>([\s\S]*?)<\/(?:author|dc:creator)>/giu)].map((match) => stripXmlTags(String(match[1] ?? "").includes("<name>") ? xmlTag(match[1] ?? "", "name") : match[1])).filter(Boolean);
    return [item({ id: tidyXmlText(xmlTag(block, atom ? "id" : "guid")) || url, url, title, summary, authors, published, source: atom ? "atom" : "rss" })];
  }));
}

export function parseArxiv(xml) {
  return Object.freeze(String(xml).split("<entry>").slice(1).flatMap((entry) => {
    const block = entry.split("</entry>")[0] ?? ""; const url = tidyXmlText(xmlTag(block, "id")); const title = tidyXmlText(xmlTag(block, "title"));
    if (!url || !title) return [];
    return [item({ id: url, url, title, summary: tidyXmlText(xmlTag(block, "summary")), authors: [...block.matchAll(/<name>([\s\S]*?)<\/name>/gu)].map((match) => tidyXmlText(match[1])), published: tidyXmlText(xmlTag(block, "published")), categories: [...block.matchAll(/<category[^>]*\bterm="([^"]+)"/gu)].map((match) => match[1]).filter(Boolean), source: "arxiv" })];
  }));
}

function arxivUrl(source) {
  if (typeof source.query !== "string" || source.query === "") throw new TypeError("arxiv source requires a query");
  const params = new URLSearchParams({ search_query: source.query, start: "0", max_results: String(boundedCount(source.max, 10)), sortBy: source.sortBy ?? "submittedDate", sortOrder: source.sortOrder ?? "descending" });
  return `http://export.arxiv.org/api/query?${params}`;
}

function parseJsonFeed(text, base, maximum) {
  const parsed = JSON.parse(text); if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.items)) throw new TypeError("JSON Feed must carry an items array");
  return Object.freeze(parsed.items.slice(0, maximum).flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const url = typeof entry.url === "string" ? entry.url : typeof entry.id === "string" ? entry.id : ""; const title = typeof entry.title === "string" ? entry.title : "";
    if (!url || !title) return [];
    const summary = typeof entry.summary === "string" ? entry.summary : typeof entry.content_text === "string" ? entry.content_text.slice(0, 400) : undefined;
    const authors = Array.isArray(entry.authors) ? entry.authors.flatMap((author) => author && typeof author === "object" && typeof author.name === "string" ? [author.name] : []) : [];
    return [item({ url, title, summary, authors, published: typeof entry.date_published === "string" ? entry.date_published : undefined, source: base })];
  }));
}

export async function acquireSyndicationSource(source, io = {}) {
  const maximum = boundedCount(source.max);
  if (source.adapter === "rss") {
    const url = source.url ?? source.query; if (typeof url !== "string" || url === "") throw new TypeError("RSS or Atom source requires a URL");
    return parseFeed(await fetchText(url, source, io)).slice(0, maximum);
  }
  if (source.adapter === "arxiv") return parseArxiv(await fetchText(arxivUrl(source), source, io)).slice(0, maximum);
  if (source.adapter === "newswire") {
    if (typeof source.url !== "string" || source.url === "") throw new TypeError("JSON Feed source requires a base URL");
    const url = `${source.url.replace(/\/?$/u, "/")}feed.json`; return parseJsonFeed(await fetchText(url, source, io), source.url, maximum);
  }
  throw new TypeError(`unknown syndication carrier: ${source.adapter}`);
}

function slug(value) { return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/gu, "-").replace(/^-+|-+$/gu, "").slice(0, 96).replace(/-+$/u, "") || "source-report"; }
function semanticIdFromWitnessJournal(value) { return rmnSemanticId(value); }

export function sourceBundle(itemValue, { wire, asserted, witness }) {
  const point = itemValue.url;
  const entries = [["title", itemValue.title], ["url", itemValue.url], ...(itemValue.summary ? [["summary", itemValue.summary]] : []), ...(itemValue.published ? [["published", itemValue.published]] : [])];
  const claims = entries.map(([name, state]) => {
    const body = { type: "GroundedPredication", predicate: { type: "UnsaturatedPredicate", id: `urn:rmn:predicate:source-reports-${name}`, domain: "SyndicationSource", codomain: "Text" }, grounding: { point, state }, outcome: { positiveEvidence: true, negativeEvidence: false }, evidence: { witness, source: itemValue.url, observedAt: asserted } };
    return Object.freeze({ id: semanticIdFromWitnessJournal(body), ...body });
  });
  const body = { type: "SyndicationSourceBundle", wire, subject: slug(itemValue.title || itemValue.url), source: itemValue, claims: Object.freeze(claims), observedAt: asserted };
  return Object.freeze({ id: semanticIdFromWitnessJournal(body), ...body });
}
