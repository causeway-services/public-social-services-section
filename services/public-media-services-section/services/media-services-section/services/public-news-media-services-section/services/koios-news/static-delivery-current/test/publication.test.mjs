import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { buildPublication, readPosts } from "../src/publication.mjs";

const fixtures = join(import.meta.dirname, "fixtures", "posts");
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const ni = (bytes) => `ni:///sha-256;${createHash("sha256").update(bytes).digest("base64url")}`;
function addBaselineArtifact(baseline, file, bytes) {
  const path = join(baseline, file);
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, bytes);
  const manifestPath = join(baseline, "manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  manifest.artifacts.push({ file, sha256: sha256(bytes), bytes: bytes.length });
  manifest.artifacts.sort((left, right) => Buffer.compare(Buffer.from(left.file), Buffer.from(right.file)));
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}
test("builds the minimum deterministic public surface and excludes drafts", () => {
  const temp = mkdtempSync(join(tmpdir(), "koios-static-test-"));
  try {
    const output = join(temp, "site");
    const result = buildPublication({ contentDir: fixtures, outputDir: output });
    assert.equal(result.publishedPostCount, 2);
    assert.match(readFileSync(join(output, "index.html"), "utf8"), /First public item/);
    assert.doesNotMatch(readFileSync(join(output, "index.html"), "utf8"), /Private draft/);
    assert.match(readFileSync(join(output, "posts", "first-post", "index.html"), "utf8"), /NewsArticle/);
    assert.match(readFileSync(join(output, "feed.xml"), "utf8"), /<rss version="2.0">/);
    assert.match(readFileSync(join(output, "sitemap.xml"), "utf8"), /https:\/\/koios.news\/posts\/first-post/);
    assert.match(readFileSync(join(output, "sitemap.xml"), "utf8"), /https:\/\/koios.news\/posts\/old-public/);
    assert.doesNotMatch(readFileSync(join(output, "news-sitemap.xml"), "utf8"), /old-public/);
    const audit = JSON.parse(readFileSync(join(output, "newswire-audit.json"), "utf8"));
    assert.equal(audit.posts[0].slug, "first-post");
    assert.match(audit.posts[0].sourceSha256, /^[a-f0-9]{64}$/);
    assert.equal(JSON.parse(readFileSync(join(output, "operations.json"), "utf8")).status, "generated-without-operations-input");
    assert.equal(existsSync(join(output, ".koios-static-delivery-current")), false);
    assert.throws(() => buildPublication({ contentDir: fixtures, outputDir: output }), /output exists/);
  } finally { rmSync(temp, { recursive: true, force: true }); }
});

test("emits Open Graph and Twitter Card metadata on the home page and article pages", () => {
  const temp = mkdtempSync(join(tmpdir(), "koios-static-test-"));
  try {
    const output = join(temp, "site");
    buildPublication({ contentDir: fixtures, outputDir: output });
    const home = readFileSync(join(output, "index.html"), "utf8");
    assert.match(home, /<meta property="og:type" content="website">/);
    assert.match(home, /<meta property="og:site_name" content="Koios.News">/);
    assert.match(home, /<meta property="og:title" content="Koios.News">/);
    assert.match(home, /<meta property="og:url" content="https:\/\/koios\.news\/">/);
    assert.match(home, /<meta name="twitter:card" content="summary">/);
    assert.doesNotMatch(home, /article:published_time/);
    const article = readFileSync(join(output, "posts", "first-post", "index.html"), "utf8");
    assert.match(article, /<meta property="og:type" content="article">/);
    assert.match(article, /<meta property="og:title" content="First public item — Koios\.News">/);
    assert.match(article, /<meta property="og:url" content="https:\/\/koios\.news\/posts\/first-post">/);
    assert.match(article, /<meta property="article:published_time" content="\d{4}-\d{2}-\d{2}T00:00:00Z">/);
    assert.match(article, /<meta property="article:section" content="Technology">/);
    assert.match(article, /<meta name="twitter:title" content="First public item — Koios\.News">/);
    assert.match(article, /<meta name="twitter:description" content="[^"]+">/);
  } finally { rmSync(temp, { recursive: true, force: true }); }
});

test("replaces only prior current artifacts after the staging marker is removed", () => {
  const temp = mkdtempSync(join(tmpdir(), "koios-static-test-"));
  try {
    const prior = join(temp, "prior");
    buildPublication({ contentDir: fixtures, outputDir: prior });
    assert.equal(existsSync(join(prior, ".koios-static-delivery-current")), false);
    assert.doesNotThrow(() => buildPublication({ contentDir: fixtures, outputDir: prior, replace: true }));
    for (const name of ["arbitrary", "malformed"]) {
      const output = join(temp, name); mkdirSync(output);
      if (name === "malformed") writeFileSync(join(output, "manifest.json"), "not json");
      else writeFileSync(join(output, "notes.txt"), "not a carrier");
      assert.throws(() => buildPublication({ contentDir: fixtures, outputDir: output, replace: true }), /unrecognized output directory/);
    }
    const marked = join(temp, "old-marked"); mkdirSync(marked); writeFileSync(join(marked, ".koios-static-delivery-current"), "koios.news static-delivery-current v1\n");
    assert.doesNotThrow(() => buildPublication({ contentDir: fixtures, outputDir: marked, replace: true }));
  } finally { rmSync(temp, { recursive: true, force: true }); }
});
test("refuses malformed drafts before producing an artifact", () => {
  const temp = mkdtempSync(join(tmpdir(), "koios-static-test-"));
  try {
    writeFileSync(join(temp, "bad.md"), "---\ntitle: Bad\ndate: 2026-08-02\ndraft: maybe\nslug: bad\n---\nNo.\n");
    assert.throws(() => readPosts(temp), /bad.md: draft must be true or false/);
    writeFileSync(join(temp, "bad.md"), "---\ntitle: Bad\ndate: 2026-08-02\ndraft: false\nslug: bad\nlicense: CC BY 4.0\nlicense_url: javascript:alert(1)\n---\nNo.\n");
    assert.throws(() => readPosts(temp), /license_url must be an absolute HTTPS URL/);
  } finally { rmSync(temp, { recursive: true, force: true }); }
});
test("refuses XML-invalid controls in RSS and Atom projected metadata", () => {
  const temp = mkdtempSync(join(tmpdir(), "koios-static-test-"));
  try {
    const post = join(temp, "bad-feed.md");
    const write = (frontMatter) => writeFileSync(post, `---\n${frontMatter}\ndate: 2026-08-02\ndraft: false\nslug: bad-feed\n---\nPublic body.\n`);
    write("title: Bad\u000btitle");
    assert.throws(() => readPosts(temp), /title contains a control character not permitted in RSS or Atom/);
    write("title: Good\nauthor: Bad\u000bauthor");
    assert.throws(() => readPosts(temp), /author contains a control character not permitted in RSS or Atom/);
    write("title: Good\ndescription: Bad\u000bdescription");
    assert.throws(() => readPosts(temp), /description contains a control character not permitted in RSS or Atom/);
  } finally { rmSync(temp, { recursive: true, force: true }); }
});
test("records an operations pass-through with exact input provenance", () => {
  const temp = mkdtempSync(join(tmpdir(), "koios-static-test-"));
  try {
    const operations = join(temp, "operations.json");
    writeFileSync(operations, '{"state":"read-only"}\n');
    buildPublication({ contentDir: fixtures, outputDir: join(temp, "site"), operationsPath: operations });
    const reading = JSON.parse(readFileSync(join(temp, "site", "operations.json"), "utf8"));
    assert.equal(reading.state, "read-only");
    assert.equal(readFileSync(join(temp, "site", "operations.json"), "utf8"), '{"state":"read-only"}\n');
    const manifest = JSON.parse(readFileSync(join(temp, "site", "manifest.json"), "utf8"));
    assert.match(manifest.provenance.operationsInput.sha256, /^[a-f0-9]{64}$/);
    assert.equal(Object.hasOwn(manifest.provenance.operationsInput, "path"), false);
    assert.equal(JSON.stringify(manifest).includes(temp), false);
  } finally { rmSync(temp, { recursive: true, force: true }); }
});
test("carries retained discovery, accountability, metadata, and legacy surfaces without mutable aggregates", () => {
  const temp = mkdtempSync(join(tmpdir(), "koios-static-test-"));
  try {
    const output = join(temp, "site");
    buildPublication({ contentDir: fixtures, outputDir: output, legacyRedirects: { "/2026/08/29/first-public-item/": "/posts/first-post" } });
    for (const file of ["feed.atom", "feed.json", "news-sitemap.xml", "robots.txt", "404.html", "about/index.html", "privacy/index.html", "standards/index.html", "corrections/index.html", "2026/08/29/first-public-item/index.html"]) assert.ok(readFileSync(join(output, file), "utf8"));
    const article = readFileSync(join(output, "posts", "first-post", "index.html"), "utf8");
    assert.match(article, /class="h-entry"/);
    assert.match(article, /"@type":"NewsArticle"/);
    assert.match(readFileSync(join(output, "feed.atom"), "utf8"), /www\.w3\.org\/2005\/Atom/);
    assert.equal(JSON.parse(readFileSync(join(output, "feed.json"), "utf8")).version, "https://jsonfeed.org/version/1.1");
    assert.match(readFileSync(join(output, "news-sitemap.xml"), "utf8"), /xmlns:news=/);
    assert.match(readFileSync(join(output, "robots.txt"), "utf8"), /Sitemap: https:\/\/koios\.news\/news-sitemap\.xml/);
    const manifest = JSON.parse(readFileSync(join(output, "manifest.json"), "utf8"));
    assert.deepEqual(manifest.exclusions, ["/hit", "/views.json", "/healthz", "/newsroom", "/cable", "/mcp", "/operators", "/private"]);
    assert.equal(manifest.artifacts.some((artifact) => artifact.file === "views.json"), false);
  } finally { rmSync(temp, { recursive: true, force: true }); }
});

test("projects admitted flat metadata into deterministic taxonomy, archive, and feed surfaces", () => {
  const temp = mkdtempSync(join(tmpdir(), "koios-static-test-"));
  try {
    const output = join(temp, "site");
    buildPublication({ contentDir: fixtures, outputDir: output });
    for (const file of ["tags/index.html", "tags.json", "tags/ai/index.html", "tags/ai.json", "topics/index.html", "topics.json", "topics/technology/index.html", "topics/technology.json", "archive/index.html", "archive.json", "archive/2026/index.html", "archive/2026/08/index.html"]) assert.ok(readFileSync(join(output, file), "utf8"));
    const article = readFileSync(join(output, "posts", "first-post", "index.html"), "utf8");
    assert.match(article, /href="\/tags\/ai"/);
    assert.match(article, /href="\/topics\/technology"/);
    assert.match(article, /creativecommons\.org/);
    assert.match(article, /Reuse with attribution/);
    assert.match(article, /"keywords":\["determinism","static publishing"\]/);
    const tags = JSON.parse(readFileSync(join(output, "tags.json"), "utf8"));
    assert.deepEqual(tags.items.map((item) => item.slug), ["ai", "determinism", "static-publishing", "systems-analysis"]);
    const topic = JSON.parse(readFileSync(join(output, "topics", "technology.json"), "utf8"));
    assert.equal(topic.posts[0].slug, "first-post");
    const archive = JSON.parse(readFileSync(join(output, "archive.json"), "utf8"));
    assert.equal(archive.years[0].months[0].posts[0].slug, "first-post");
    assert.match(readFileSync(join(output, "feed.xml"), "utf8"), /<category>Technology<\/category><category>Systems Analysis<\/category><category>AI<\/category>/);
    assert.match(readFileSync(join(output, "feed.atom"), "utf8"), /<category term="Technology"\/>/);
    assert.deepEqual(JSON.parse(readFileSync(join(output, "feed.json"), "utf8")).items[0].tags, ["Technology", "Systems Analysis", "AI", "determinism", "static publishing"]);
    const map = readFileSync(join(output, "sitemap.xml"), "utf8");
    for (const path of ["/tags/ai", "/topics/technology", "/archive/2026", "/archive/2026/08"]) assert.match(map, new RegExp(`https://koios\\.news${path}`));
  } finally { rmSync(temp, { recursive: true, force: true }); }
});

test("overlays a fully verified offline baseline while retaining sealed bytes", () => {
  const temp = mkdtempSync(join(tmpdir(), "koios-static-test-"));
  try {
    const baseline = join(temp, "baseline");
    buildPublication({ contentDir: fixtures, outputDir: baseline });
    const retained = Buffer.from([0, 1, 2, 253, 254, 255]);
    addBaselineArtifact(baseline, "continuity/retained.bin", retained);
    const baselineArtifacts = JSON.parse(readFileSync(join(baseline, "manifest.json"), "utf8")).artifacts.map(({ file }) => file);
    const content = join(temp, "posts");
    cpSync(fixtures, content, { recursive: true });
    writeFileSync(join(content, "new-current.md"), "---\ntitle: New current item\ndate: 2026-08-30\ndraft: false\nslug: new-current\n---\nCurrent corpus surface.\n");
    const first = join(temp, "first");
    const second = join(temp, "second");
    buildPublication({ contentDir: content, outputDir: first, productionBaselineDir: baseline });
    buildPublication({ contentDir: content, outputDir: second, productionBaselineDir: baseline });
    assert.deepEqual(readFileSync(join(first, "continuity", "retained.bin")), retained);
    for (const file of baselineArtifacts) assert.ok(readFileSync(join(first, file)));
    assert.match(readFileSync(join(first, "index.html"), "utf8"), /New current item/);
    assert.match(readFileSync(join(first, "feed.xml"), "utf8"), /new-current/);
    assert.equal(readFileSync(join(first, "manifest.json"), "utf8"), readFileSync(join(second, "manifest.json"), "utf8"));
    assert.equal(readFileSync(join(first, "continuity", "retained.bin")).equals(readFileSync(join(second, "continuity", "retained.bin"))), true);
    const finalManifest = JSON.parse(readFileSync(join(first, "manifest.json"), "utf8"));
    assert.ok(finalManifest.artifacts.some((artifact) => artifact.file === "continuity/retained.bin" && artifact.sha256 === sha256(retained)));
    assert.equal(finalManifest.artifacts.some((artifact) => artifact.file === "views.json"), false);
    assert.deepEqual(finalManifest.provenance.productionBaseline, { schema: "static-delivery-current/v1", kind: "koios.news.static-publication-manifest/v1", artifactCount: baselineArtifacts.length, manifestSha256: sha256(readFileSync(join(baseline, "manifest.json"))) });
  } finally { rmSync(temp, { recursive: true, force: true }); }
});

test("refuses corrupt, missing, traversal, and mutable baseline artifacts", () => {
  const temp = mkdtempSync(join(tmpdir(), "koios-static-test-"));
  try {
    const baseline = join(temp, "baseline");
    buildPublication({ contentDir: fixtures, outputDir: baseline });
    const rejected = (change, message) => {
      const copy = join(temp, `baseline-${Math.random()}`);
      cpSync(baseline, copy, { recursive: true });
      change(copy);
      assert.throws(() => buildPublication({ contentDir: fixtures, outputDir: join(temp, `out-${Math.random()}`), productionBaselineDir: copy }), message);
    };
    rejected((copy) => writeFileSync(join(copy, "index.html"), "corrupt"), /digest mismatch: index.html/);
    rejected((copy) => {
      const manifestPath = join(copy, "manifest.json"); const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
      manifest.artifacts[0].file = "../escape"; writeFileSync(manifestPath, JSON.stringify(manifest));
    }, /unsafe baseline artifact path/);
    rejected((copy) => {
      const manifestPath = join(copy, "manifest.json"); const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
      manifest.artifacts.push({ file: "views.json", sha256: sha256("{}"), bytes: 2 }); writeFileSync(join(copy, "views.json"), "{}"); writeFileSync(manifestPath, JSON.stringify(manifest));
    }, /excluded mutable route/);
    rejected((copy) => {
      const manifestPath = join(copy, "manifest.json"); const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
      manifest.artifacts.push({ file: "private/ledger.json", sha256: sha256("{}"), bytes: 2 }); mkdirSync(join(copy, "private")); writeFileSync(join(copy, "private", "ledger.json"), "{}"); writeFileSync(manifestPath, JSON.stringify(manifest));
    }, /excluded mutable route/);
    rejected((copy) => {
      const manifestPath = join(copy, "manifest.json"); const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
      manifest.artifacts.push({ file: "missing.txt", sha256: sha256("x"), bytes: 1 }); writeFileSync(manifestPath, JSON.stringify(manifest));
    }, /artifact is missing: missing.txt/);
    rejected((copy) => {
      const manifestPath = join(copy, "manifest.json"); const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
      const artifact = manifest.artifacts.find(({ file }) => file === "index.html"); rmSync(join(copy, "index.html")); symlinkSync("feed.xml", join(copy, "index.html"));
      assert.ok(artifact);
    }, /must not traverse a symlink: index.html/);
  } finally { rmSync(temp, { recursive: true, force: true }); }
});

test("accepts the strict legacy Cloudflare baseline manifest and rejects malformed legacy records", () => {
  const temp = mkdtempSync(join(tmpdir(), "koios-static-test-"));
  try {
    const legacy = join(temp, "legacy");
    mkdirSync(join(legacy, "history"), { recursive: true });
    const home = "legacy home\n", history = "legacy history\n", headers = "/*\n  X-Test: legacy\n";
    const records = [
      { route: "/", file: "index.html", mediaType: "text/html", bytes: Buffer.byteLength(home), digest: ni(home) },
      { route: "/history", file: "history/index.html", mediaType: "text/html", bytes: Buffer.byteLength(history), digest: ni(history) },
      { route: "urn:cloudflare-pages:_headers", file: "_headers", mediaType: "text/plain", bytes: Buffer.byteLength(headers), digest: ni(headers) },
    ];
    writeFileSync(join(legacy, "index.html"), home);
    writeFileSync(join(legacy, "history", "index.html"), history);
    writeFileSync(join(legacy, "_headers"), headers);
    const writeLegacy = (artifacts = records) => writeFileSync(join(legacy, "manifest.json"), `${JSON.stringify({ kind: "koios.static-publication-manifest", profile: "cutover-candidate", authority: "non-authoritative-cutover-candidate", canonicalOrigin: "https://koios.news", routeCount: 3, aliasCount: 0, artifacts }, null, 2)}\n`);
    writeLegacy();
    const output = join(temp, "output");
    buildPublication({ contentDir: fixtures, outputDir: output, productionBaselineDir: legacy });
    assert.equal(readFileSync(join(output, "history", "index.html"), "utf8"), readFileSync(join(legacy, "history", "index.html"), "utf8"));
    const provenance = JSON.parse(readFileSync(join(output, "manifest.json"), "utf8")).provenance.productionBaseline;
    assert.deepEqual(provenance, { schema: "legacy-cloudflare-release-current", kind: "koios.static-publication-manifest", artifactCount: 3, manifestSha256: sha256(readFileSync(join(legacy, "manifest.json"))) });
    const reject = (change, pattern) => {
      const copy = join(temp, `legacy-${Math.random()}`); cpSync(legacy, copy, { recursive: true }); change(copy);
      assert.throws(() => buildPublication({ contentDir: fixtures, outputDir: join(temp, `output-${Math.random()}`), productionBaselineDir: copy }), pattern);
    };
    reject((copy) => { const manifest = JSON.parse(readFileSync(join(copy, "manifest.json"), "utf8")); manifest.artifacts[0].digest = "ni:///sha-256;AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"; writeFileSync(join(copy, "manifest.json"), JSON.stringify(manifest)); }, /digest mismatch: index.html/);
    reject((copy) => { const manifest = JSON.parse(readFileSync(join(copy, "manifest.json"), "utf8")); manifest.artifacts[0].file = "../escape"; writeFileSync(join(copy, "manifest.json"), JSON.stringify(manifest)); }, /unsafe baseline artifact path/);
    reject((copy) => { const manifest = JSON.parse(readFileSync(join(copy, "manifest.json"), "utf8")); manifest.artifacts[0].unexpected = true; writeFileSync(join(copy, "manifest.json"), JSON.stringify(manifest)); }, /invalid artifact shape/);
    reject((copy) => { const manifest = JSON.parse(readFileSync(join(copy, "manifest.json"), "utf8")); manifest.artifacts[1].route = "/history/"; writeFileSync(join(copy, "manifest.json"), JSON.stringify(manifest)); }, /unsafe baseline artifact route/);
  } finally { rmSync(temp, { recursive: true, force: true }); }
});

test("carries a house ad footer slot on home and article pages, contextual-only (no cookies/tracking)", () => {
  const temp = mkdtempSync(join(tmpdir(), "koios-static-test-"));
  try {
    const output = join(temp, "site");
    buildPublication({ contentDir: fixtures, outputDir: output });
    const home = readFileSync(join(output, "index.html"), "utf8");
    const article = readFileSync(join(output, "posts", "first-post", "index.html"), "utf8");
    for (const html of [home, article]) {
      assert.match(html, /<div id="house-ad-footer" data-slot="footer" data-property="koios-news"><\/div>/);
      assert.match(html, /<script src="\/assets\/house-ad.js" defer><\/script>/);
      assert.doesNotMatch(html, /<script>/);
      assert.match(readFileSync(join(output, "assets", "house-ad.js"), "utf8"), /fetch\(base\+"\/ad\?slot="/);
      assert.match(readFileSync(join(output, "assets", "house-ad.js"), "utf8"), /base\+"\/click\?slot="/);
      assert.doesNotMatch(html, /document\.cookie/);
    }
    // Build output stays byte-deterministic: the slot only fetches its
    // creative client-side, never at build time.
    assert.equal(readFileSync(join(output, "index.html"), "utf8"), home);
  } finally { rmSync(temp, { recursive: true, force: true }); }
});

test("renders desks, the wire, and per-article claim ledgers from a store-feed projection", () => {
  const temp = mkdtempSync(join(tmpdir(), "koios-static-test-"));
  try {
    const output = join(temp, "site");
    const wireDir = join(import.meta.dirname, "fixtures", "wire");
    const desksPath = join(import.meta.dirname, "fixtures", "desks.json");
    assert.throws(() => buildPublication({ contentDir: fixtures, outputDir: output, wireDir }), /supplied together/);
    const result = buildPublication({ contentDir: fixtures, outputDir: output, wireDir, desksPath });
    assert.equal(result.publishedPostCount, 2);
    const home = readFileSync(join(output, "index.html"), "utf8");
    assert.match(home, /<link rel="stylesheet" href="\/assets\/site.css">/);
    assert.match(home, /href="\/wire\/sport"/);
    assert.match(home, /Beta match &lt;report&gt;/);
    assert.doesNotMatch(home, /<script>/);
    assert.match(home, /<script src="\/assets\/house-ad.js" defer><\/script>/);
    assert.ok(existsSync(join(output, "assets", "site.css")));
    assert.match(readFileSync(join(output, "assets", "house-ad.js"), "utf8"), /base="https:\/\/house-ads-server\.morgan-sennhauser\.workers\.dev"/);
    const headers = readFileSync(join(output, "_headers"), "utf8");
    assert.match(headers, /script-src 'self'; style-src 'self'/);
    assert.match(headers, /connect-src 'self' https:\/\/house-ads-server\.morgan-sennhauser\.workers\.dev/);
    const desk = readFileSync(join(output, "wire", "sport", "index.html"), "utf8");
    assert.match(desk, /aria-current="page"/);
    assert.match(desk, /href="\/claims\/sport\/beta-match\/"/);
    assert.match(readFileSync(join(output, "wire", "health", "index.html"), "utf8"), /Nothing filed yet/);
    const ledger = readFileSync(join(output, "claims", "sport", "beta-match", "index.html"), "utf8");
    assert.match(ledger, /"@type":"Claim"/);
    assert.match(ledger, /https:\/\/sport.example.org\/beta/);
    assert.equal(readFileSync(join(output, "claims", "sport", "beta-match.json"), "utf8"), readFileSync(join(wireDir, "claims", "sport", "beta-match.json"), "utf8"));
    assert.equal(readFileSync(join(output, "wire", "index.json"), "utf8"), readFileSync(join(wireDir, "wire.json"), "utf8"));
    assert.equal(readFileSync(join(output, "wire", "feed.xml"), "utf8"), readFileSync(join(wireDir, "feed.xml"), "utf8"));
    const index = JSON.parse(readFileSync(join(output, "claims", "index.json"), "utf8"));
    assert.equal(index.itemCount, 2);
    assert.deepEqual(index.categories.map((entry) => entry.category), ["sport", "technology"]);
    const sitemap = readFileSync(join(output, "sitemap.xml"), "utf8");
    assert.match(sitemap, /https:\/\/koios.news\/wire\/sport/);
    assert.match(sitemap, /https:\/\/koios.news\/claims\/technology\/alpha-story/);
    const coverageMap = JSON.parse(readFileSync(join(output, "wire", "coverage.json"), "utf8"));
    assert.deepEqual(coverageMap.hosts.map((entry) => entry.name), ["example.com", "sport.example.org"]);
    const first = readFileSync(join(output, "manifest.json"), "utf8");
    rmSync(output, { recursive: true });
    buildPublication({ contentDir: fixtures, outputDir: output, wireDir, desksPath });
    assert.equal(readFileSync(join(output, "manifest.json"), "utf8"), first, "wire build is deterministic");
  } finally { rmSync(temp, { recursive: true, force: true }); }
});
