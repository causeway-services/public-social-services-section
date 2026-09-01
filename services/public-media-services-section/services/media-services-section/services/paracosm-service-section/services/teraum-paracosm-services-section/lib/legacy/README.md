# Teraum legacy custody

## Dedicated custody units (moved in from engineering, 2026-08-26)

These seven units were previously held in the computer MUD engineering
section's `lib/legacy` because that section's custody rule once kept
domain-owned worlds' reusable engine/mudlib ancestors there. That rule has
been reversed: Teraum's own history, including its engine/mudlib
generations, now lives entirely under Teraum's paracosm.

| Custody unit | Files | Disk usage | Principal material |
|---|---:|---:|---|
| `2020-01-05-teraum-racket-mud` | 622 | 49 MiB | pre-cleanup Teraum Racket MUD corpus from the Drive archive |
| `2020-10-09-teraum-mud` | 261 | 504 KiB | pre-cleanup standalone Teraum MUD corpus from the Drive archive |
| `2022-01-06-fennel-teraum-mud` | 7 | 34 KiB | compact Fennel Teraum server and map generation |
| `2025-12-15-teraum-docs` | 269 | 90 KiB | pre-cleanup Teraum documentation corpus from the Drive archive |
| `2026-07-05-teraum-docs` | 88 | 30 KiB | post-cleanup Teraum documentation repository generation |
| `2026-07-05-teraum-mud` | 18 | 24 KiB | post-cleanup Teraum MUD repository generation |
| `2026-07-05-teraum-racket-mud` | 266 | 23 MiB | post-cleanup Racket implementation, maps, libraries, and repository artifacts |

Figures carried over from the prior custody catalog at
`computer-mud-engineering-services-section/content/documents/catalogs/legacy-custody.md`;
not re-measured at move time.

## Relationship to `content/assets/legacy`

`../../content/assets/legacy/` already holds an older, uncurated asset dump
that includes several directories covering the same Teraum engine lineages
(`teraum-mud`, `teraum-racket-mud`, `racket-teraum-racket-mud-superrepo`,
`racket-racket-mud-ecosystem-teraum-data`, and others), mixed in with
non-Teraum-specific MUD/TAB/qtMUD material. The two collections have not
been deduplicated against each other — this move only relocated the
dedicated, dated custody units out of engineering; it did not reconcile them
with the older asset dump. That reconciliation (Git blob/content identity
dedup across both trees) remains a future pass.

## What did not move

Teraum-named subdirectories nested inside larger, non-Teraum-named forensic
snapshots (e.g. `windows-archive-tab-racket/teraum-racket-mud-superrepo`,
or `domains/models/domains/teraum` inside a Fennel MUD generation) were left
in place under `computer-mud-engineering-services-section/lib/legacy`,
consistent with that section's standing rule against tearing matching paths
out of larger preserved snapshots. Their locations are catalogued there.
