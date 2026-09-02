import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  listStoreClaimFiles,
  newsSitemapXml,
  projectStoreFeedArtifacts,
  readStoreArticle,
  readStoreFeedItems,
  writeStoreFeedArtifacts,
} from "../src/store-feed-delivery.mjs";

const fixtures = join(import.meta.dirname, "fixtures", "store");

test("listStoreClaimFiles lists every claim file in deterministic category order", () => {
  const files = listStoreClaimFiles(fixtures);
  assert.equal(files.length, 5);
  assert.deepEqual(files.map((entry) => entry.category), ["culture", "technology", "technology", "war", "war"]);
});

test("listStoreClaimFiles rejects a missing store root", () => {
  assert.throws(() => listStoreClaimFiles(join(fixtures, "does-not-exist")), /store root does not exist/);
});

test("readStoreArticle extracts the flat wire fields from claim predicates", () => {
  const [alpha] = listStoreClaimFiles(fixtures).filter((entry) => entry.path.endsWith("alpha-story.json"));
  const article = readStoreArticle(alpha);
  assert.equal(article.title, "Alpha Story");
  assert.equal(article.url, "https://example.com/alpha");
  assert.equal(article.summary, "Alpha summary from the technology desk.");
  assert.equal(article.publishedRaw, "Sat, 18 Jul 2026 12:00:00 +0000");
});

test("readStoreArticle rejects a file missing the title claim", () => {
  const temp = mkdtempSync(join(tmpdir(), "koios-store-feed-test-"));
  try {
    const path = join(temp, "no-title.json");
    writeFileSync(path, JSON.stringify({ subject: "no-title", claims: [{ proposition: { predicate: "url", object: "https://example.com/x" } }] }));
    assert.throws(() => readStoreArticle({ category: "technology", path }), /title claim is required/);
  } finally { rmSync(temp, { recursive: true, force: true }); }
});

test("readStoreArticle rejects a non-HTTP(S) url claim", () => {
  const temp = mkdtempSync(join(tmpdir(), "koios-store-feed-test-"));
  try {
    const path = join(temp, "bad-url.json");
    writeFileSync(path, JSON.stringify({ subject: "bad-url", claims: [{ proposition: { predicate: "title", object: "Bad URL" } }, { proposition: { predicate: "url", object: "not-a-url" } }] }));
    assert.throws(() => readStoreArticle({ category: "technology", path }), /url claim must be an absolute http\(s\) URL/);
  } finally { rmSync(temp, { recursive: true, force: true }); }
});

test("readStoreFeedItems merges a cross-filed article, keeps the newer instance's fields as canonical, and skips unparseable dates", () => {
  const { items, skipped } = readStoreFeedItems(fixtures);
  assert.equal(items.length, 2);
  assert.equal(skipped.length, 2);
  assert.deepEqual(skipped.map((entry) => entry.subject).sort(), ["delta-story", "gamma-story"]);
  assert.equal(skipped.find((entry) => entry.subject === "gamma-story").reason, "missing published claim");
  assert.equal(skipped.find((entry) => entry.subject === "delta-story").reason, "unparseable published claim");

  const [first, second] = items;
  assert.equal(first.url, "https://example.com/alpha");
  assert.equal(second.url, "https://example.com/beta");
  // The technology-desk instance (12:00) is newer than the culture-desk
  // instance (09:00) on the same URL, so its title/summary win the merge.
  assert.equal(first.title, "Alpha Story");
  assert.equal(first.summary, "Alpha summary from the technology desk.");
  assert.deepEqual(first.tags, ["culture", "technology"]);
  assert.equal(first.published, "2026-07-18T12:00:00.000Z");
});

test("newsSitemapXml keeps only the newest two days of items", () => {
  const { items } = readStoreFeedItems(fixtures);
  const xml = newsSitemapXml(items);
  assert.match(xml, /<loc>https:\/\/example\.com\/alpha<\/loc>/);
  assert.doesNotMatch(xml, /<loc>https:\/\/example\.com\/beta<\/loc>/);
  assert.match(xml, /xmlns:news="http:\/\/www\.google\.com\/schemas\/sitemap-news\/0\.9"/);
});

test("newsSitemapXml over zero items is a well-formed empty urlset", () => {
  assert.match(newsSitemapXml([]), /<urlset[^>]*>\s*<\/urlset>/);
});

test("projectStoreFeedArtifacts emits RSS, Atom, JSON Feed, and a news sitemap over the merged items", () => {
  const result = projectStoreFeedArtifacts({ storeRoot: fixtures });
  assert.equal(result.itemCount, 2);
  assert.equal(result.skippedCount, 2);
  assert.equal(result.newest, "2026-07-18T12:00:00.000Z");
  assert.equal(result.oldest, "2026-07-16T08:00:00.000Z");
  assert.deepEqual(result.artifacts.map((artifact) => artifact.path), ["feed.xml", "feed.atom", "feed.json", "news-sitemap.xml"]);

  const rss = result.artifacts.find((artifact) => artifact.path === "feed.xml").body;
  assert.match(rss, /<rss version="2\.0"/);
  assert.match(rss, /<title>Alpha Story<\/title>/);
  assert.match(rss, /<category>culture<\/category>/);

  const atom = result.artifacts.find((artifact) => artifact.path === "feed.atom").body;
  assert.match(atom, /<feed xmlns="http:\/\/www\.w3\.org\/2005\/Atom"/);

  const jsonFeed = JSON.parse(result.artifacts.find((artifact) => artifact.path === "feed.json").body);
  assert.equal(jsonFeed.version, "https://jsonfeed.org/version/1.1");
  assert.equal(jsonFeed.items.length, 2);
  assert.equal(jsonFeed.items[0].url, "https://example.com/alpha");
});

test("projectStoreFeedArtifacts honors overridden artifact paths", () => {
  const result = projectStoreFeedArtifacts({ storeRoot: fixtures, paths: { rss: "wire/feed.xml", atom: "wire/feed.atom", json: "wire/feed.json", newsSitemap: "wire/news-sitemap.xml" } });
  assert.deepEqual(result.artifacts.map((artifact) => artifact.path), ["wire/feed.xml", "wire/feed.atom", "wire/feed.json", "wire/news-sitemap.xml"]);
});

test("writeStoreFeedArtifacts writes every artifact to disk under outDir", () => {
  const temp = mkdtempSync(join(tmpdir(), "koios-store-feed-test-"));
  try {
    const outDir = join(temp, "out");
    const result = writeStoreFeedArtifacts({ storeRoot: fixtures, outDir });
    assert.equal(result.files.length, 4);
    assert.match(readFileSync(join(outDir, "feed.xml"), "utf8"), /<rss version="2\.0"/);
    assert.match(readFileSync(join(outDir, "news-sitemap.xml"), "utf8"), /example\.com\/alpha/);
  } finally { rmSync(temp, { recursive: true, force: true }); }
});

test("the CLI writes artifacts and reports counts as JSON on stdout", () => {
  const temp = mkdtempSync(join(tmpdir(), "koios-store-feed-cli-test-"));
  try {
    const outDir = join(temp, "out");
    const bin = join(import.meta.dirname, "..", "bin", "koios-news-store-feed-delivery.mjs");
    const stdout = execFileSync(process.execPath, [bin, "--store", fixtures, "--out", outDir], { encoding: "utf8" });
    const result = JSON.parse(stdout);
    assert.equal(result.itemCount, 2);
    assert.equal(result.skippedCount, 2);
    assert.equal(result.files.length, 4);
    assert.match(readFileSync(join(outDir, "feed.json"), "utf8"), /jsonfeed\.org/);
  } finally { rmSync(temp, { recursive: true, force: true }); }
});

test("the CLI refuses an unknown option", () => {
  const temp = mkdtempSync(join(tmpdir(), "koios-store-feed-cli-test-"));
  try {
    const bin = join(import.meta.dirname, "..", "bin", "koios-news-store-feed-delivery.mjs");
    assert.throws(() => execFileSync(process.execPath, [bin, "--store", fixtures, "--out", join(temp, "out"), "--bogus", "x"], { encoding: "utf8", stdio: "pipe" }));
  } finally { rmSync(temp, { recursive: true, force: true }); }
});
