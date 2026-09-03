// The wire: the koios.news claim store projected by store-feed-delivery
// (wire.json, feeds, verbatim claims/<category>/<slug>.json) rendered as
// desk pages and per-article claim ledgers. Pure over the projection's
// bytes: nothing here reads a clock or the store itself.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const bytewise = (left, right) => Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

export function readDesks(desksPath) {
  const parsed = JSON.parse(readFileSync(desksPath, "utf8"));
  if (!Array.isArray(parsed?.desks) || parsed.desks.length === 0) throw new Error(`desks file has no desks: ${desksPath}`);
  const seen = new Set();
  return Object.freeze(parsed.desks.map((desk) => {
    if (typeof desk.slug !== "string" || !SLUG.test(desk.slug) || seen.has(desk.slug)) throw new Error(`desk slug must be a unique lowercase slug: ${String(desk.slug)}`);
    if (typeof desk.title !== "string" || desk.title.trim() === "") throw new Error(`desk ${desk.slug} needs a title`);
    if (!Array.isArray(desk.categories) || desk.categories.some((category) => typeof category !== "string" || !SLUG.test(category))) throw new Error(`desk ${desk.slug} categories must be slugs`);
    seen.add(desk.slug);
    return Object.freeze({ slug: desk.slug, title: desk.title.trim(), description: typeof desk.description === "string" ? desk.description.trim() : "", categories: Object.freeze([...desk.categories]) });
  }));
}

/** Reads a store-feed-delivery output directory: wire.json plus every file beneath it. */
export function readWire(wireDir) {
  if (!existsSync(wireDir) || !statSync(wireDir).isDirectory()) throw new Error(`wire directory does not exist: ${wireDir}`);
  const indexPath = join(wireDir, "wire.json");
  if (!existsSync(indexPath)) throw new Error(`wire directory lacks wire.json: ${wireDir}`);
  const index = JSON.parse(readFileSync(indexPath, "utf8"));
  if (index?.kind !== "koios.news.wire/v1" || !Array.isArray(index.items)) throw new Error(`wire.json has an unsupported shape: ${indexPath}`);
  const files = new Map();
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((left, right) => bytewise(left.name, right.name))) {
      const path = join(directory, entry.name);
      const file = relative(wireDir, path).split(sep).join("/");
      if (entry.isDirectory()) visit(path);
      else if (entry.isFile()) files.set(file, readFileSync(path));
      else throw new Error(`wire directory contains an unsupported entry: ${file}`);
    }
  };
  visit(wireDir);
  const items = index.items.map((item) => {
    if (typeof item.url !== "string" || typeof item.title !== "string" || typeof item.published !== "string" || !Array.isArray(item.tags) || !Array.isArray(item.sources)) throw new Error(`wire item is malformed: ${JSON.stringify(item).slice(0, 120)}`);
    for (const source of item.sources) {
      if (typeof source.category !== "string" || !SLUG.test(source.category) || typeof source.slug !== "string" || !SLUG.test(source.slug)) throw new Error(`wire item source is malformed: ${item.url}`);
      if (!files.has(`claims/${source.category}/${source.slug}.json`)) throw new Error(`wire item names a claim file the projection lacks: claims/${source.category}/${source.slug}.json`);
    }
    let host = "";
    try { host = new URL(item.url).hostname.replace(/^www\./u, ""); } catch { throw new Error(`wire item url is not absolute: ${item.url}`); }
    return Object.freeze({ url: item.url, title: item.title, summary: typeof item.summary === "string" ? item.summary : undefined, published: item.published, day: item.published.slice(0, 10), host, tags: Object.freeze([...item.tags]), sources: Object.freeze(item.sources.map((source) => Object.freeze({ category: source.category, slug: source.slug, witness: source.witness, claimCount: source.claimCount }))) });
  }).sort((left, right) => bytewise(right.published, left.published) || bytewise(left.url, right.url));
  return Object.freeze({ items: Object.freeze(items), files });
}

/** Assigns wire items and bylined posts to desks by category; an item may sit on several desks. */
export function deskContents(desks, wireItems, posts, postCategorySlug) {
  return desks.map((desk) => {
    const categories = new Set(desk.categories);
    const items = wireItems.filter((item) => item.tags.some((tag) => categories.has(tag)));
    const deskPosts = posts.filter((post) => post.categories.some((category) => categories.has(postCategorySlug(category))));
    return Object.freeze({ ...desk, items: Object.freeze(items), posts: Object.freeze(deskPosts) });
  });
}

export function parseClaimFile(bytes, file) {
  let parsed;
  try { parsed = JSON.parse(bytes.toString("utf8")); } catch { throw new Error(`claim file is not valid JSON: ${file}`); }
  if (typeof parsed?.subject !== "string" || !Array.isArray(parsed.claims)) throw new Error(`claim file does not have the {subject, claims} shape: ${file}`);
  return parsed;
}

/** Counts by source host and by category — the coverage map. */
export function coverage(wireItems) {
  const hosts = new Map(), categories = new Map();
  for (const item of wireItems) {
    hosts.set(item.host, (hosts.get(item.host) ?? 0) + 1);
    for (const tag of item.tags) categories.set(tag, (categories.get(tag) ?? 0) + 1);
  }
  const sorted = (map) => [...map.entries()].sort((left, right) => right[1] - left[1] || bytewise(left[0], right[0])).map(([name, count]) => ({ name, count }));
  return Object.freeze({ itemCount: wireItems.length, newest: wireItems[0]?.published, oldest: wireItems.at(-1)?.published, hosts: sorted(hosts), categories: sorted(categories) });
}
