# koios.news store feed delivery (current)

Revives koios.news's feed capability onto the current chassis and the current
primitive. It projects `sites/koios.news/store/<category>/<slug>.json` — the
sourced-claim store, one `{subject, claims}` file per syndicated article, one
subdirectory per category — into RSS, Atom, and JSON Feed artifacts through
`@red-cup-engineering/project-web-feed-artifacts-service`, plus a hand-rolled
Google News sitemap (a trivial format; no service exists or is needed for it).

This is a distinct corpus from the bylined posts that
[`static-delivery-current`](../static-delivery-current/README.md) projects
into the site's own `feed.xml`/`feed.atom`/`feed.json`/`sitemap.xml`/
`news-sitemap.xml`. The public surface composes the two: the static carrier
takes this carrier's output directory as `--wire` and mounts the feeds and
`wire.json` under `/wire/`, the verbatim claim objects under
`/claims/<category>/<slug>.json` (with a rendered ledger page beside each), and
renders the desks named by the site's `config/public-desks.json`. The root
`scripts/build-public-site.mjs` runs both steps in order.

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

Writes `feed.xml` (RSS 2.0), `feed.atom` (Atom 1.0), and `feed.json` (JSON Feed
1.1) over the newest 200 items, `news-sitemap.xml` (Google News, windowed to the
newest two days of items, capped at 1000 URLs), `wire.json` (every item, with
the path of each source claim object), and `claims/<category>/<slug>.json`
(every store file, byte-identical) under `--out`, and prints
`{itemCount, skippedCount, newest, oldest, files}` to stdout. Output paths are
overridable with `--rss-path`, `--atom-path`, `--json-path`, and
`--news-sitemap-path` for a caller that serves them from a different route.

```sh
npm install
npm run check && npm test
```
