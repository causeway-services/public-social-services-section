# koios.news store feed delivery (current)

Revives koios.news's feed capability onto the current chassis and the current
primitive. It projects `sites/koios.news/store/<category>/<slug>.json` — the
sourced-claim store, one `{subject, claims}` file per syndicated article, one
subdirectory per category — into RSS, Atom, and JSON Feed artifacts through
`@red-cup-engineering/project-web-feed-artifacts-service`, plus a hand-rolled
Google News sitemap (a trivial format; no service exists or is needed for it).

This is a distinct corpus and a distinct build from
[`static-delivery-current`](../static-delivery-current/README.md), which
projects `content/posts` (koios's own bylined articles) into its own
`feed.xml`/`feed.atom`/`feed.json`/`sitemap.xml`/`news-sitemap.xml`. The two
carriers do not share an output directory today; wiring them into one public
surface — a merged feed, or a distinct `/wire/` namespace for syndicated
coverage — is a product decision for whoever owns that merge, not something
this carrier presumes.

An article cross-filed under more than one category (same `url` claim
recurring in multiple category directories) becomes one feed item carrying
every category as a tag; the newest-published instance's title and summary
win. An article with no parseable `published` claim is excluded from every
artifact and reported in `skipped`, never guessed at with a build-time clock.

```sh
node bin/koios-news-store-feed-delivery.mjs \
  --store /absolute/path/to/sites/koios.news/store \
  --out /absolute/path/to/output/dir
```

Writes `feed.xml` (RSS 2.0), `feed.atom` (Atom 1.0), `feed.json` (JSON Feed
1.1), and `news-sitemap.xml` (Google News, windowed to the newest two days of
items, capped at 1000 URLs) under `--out`, and prints
`{itemCount, skippedCount, newest, oldest, files}` to stdout. Output paths are
overridable with `--rss-path`, `--atom-path`, `--json-path`, and
`--news-sitemap-path` for a caller that serves them from a different route.

```sh
npm install
npm run check && npm test
```
