# koios.news static delivery (current)

An independent Node 22+ ESM CLI for deterministic routine-publication bytes. It
does not import the tombstoned TypeScript aggregate, the retired newswire
package, or legacy organizer packages; it uses Node built-ins only.

```sh
node bin/koios-news-static-delivery.mjs \
  --content ../sites/koios.news/content/posts \
  --out /explicit/output/koios.news
```

The output directory is mandatory. The tool refuses an existing output unless
`--replace` is given and it is either a legacy marked staging artifact or an
unmarked final output with this carrier's regular v1 `manifest.json`. The
marker exists only while staging and is removed before final publication.
It never deploys, uploads, changes DNS, or writes the content source. Optional
`--operations path/to/operations.json` passes those admitted public bytes
through unchanged and records their SHA-256 provenance in `manifest.json`;
without it `operations.json` is a deterministic local readout.

For an explicit continuity migration, add `--production-baseline
/offline/production/site`. The offline baseline must have either this carrier's
v1 `manifest.json` or the legacy production `koios.static-publication-manifest`
with its exact cutover profile and authority. Each listed artifact must be a
regular file on a safe relative path whose byte count and SHA-256 (including
canonical `ni:///sha-256;` legacy digests) match before staging begins.
Verified files are copied into fresh staging and current corpus-dependent routes
are generated over them; the final manifest seals both retained and regenerated artifacts.
Symlinks, traversal, missing/corrupt artifacts, control files, and known
mutable routes are refused. This does not make historical taxonomy or
bibliography surfaces current.

Published input is Markdown with YAML-style front matter. Every post, including
a draft, must have a nonempty `title`, an ISO `date`, a boolean `draft`, a
lowercase filename-matching `slug`, and a nonempty body. A malformed draft
fails the entire build rather than silently entering a later posting run.

The carrier writes `index.html`, `posts/<slug>/index.html`, RSS, Atom, and
JSON Feed (`feed.xml`, `feed.atom`, `feed.json`), ordinary and Google News
sitemaps, `robots.txt`, static about/privacy/standards/corrections pages,
tag and topic indexes plus per-term HTML and JSON routes, archive index/year/month
pages plus `archive.json`, `404.html`, `newswire-audit.json`, `operations.json`,
and `manifest.json`.
The audit has source-byte SHA-256 values and the manifest lists every generated
carrier artifact.

At the top level only, string-array `categories`, `tags`, and `keywords`, plus
string `license`, `license_url`, and `syndication_rights`, are admitted as
public carrier metadata. Nested front matter remains intentionally opaque to
this tool. Categories become `/topics`; explicit tags and retained public
keywords become `/tags` because the current corpus uses `keywords` for its
public tag vocabulary. License URLs must be credential-free HTTPS URLs.

## Intentional parity limits

This is the routine public surface, not a replacement for the retained
application. Article pages carry a canonical URL, `NewsArticle` JSON-LD, and
microformats `h-entry`; supplied legacy paths become canonical HTML continuation
pages. Actual HTTP 3xx rules, topic/archive pages, fingerprints, ads, view
collection, mutable operations, editorial-ledger adjudication, and Cloudflare
delivery/cutover authority remain outside this carrier. Its front-matter audit
is provenance of this build input, not evidence that an article passed the
current independent editorial gate.

```sh
npm test
npm run verify
```
