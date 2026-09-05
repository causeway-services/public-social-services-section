---
name: michael marmot
description: Working directory for the Michael Marmot persona. The canonical persona record is personas/michael-marmot.md; this directory holds his profile and Hive post drafts.
contains:
  - Hive Posts/
  - Michael Marmot.md
  - michael-marmot.md
---
Working directory for the [Michael Marmot](michael-marmot.md) persona.

Michael Marmot is a Turntide-Islands community persona; he posts everyday life on Minnesota's North Shore from a position of pragmatic-resilience to climate breakdown and industrial collapse.
The canonical persona record is [personas/michael-marmot.md](michael-marmot.md); this directory holds his unabsorbed profile material and Hive post drafts.

## Layout

| Path | Contents |
|---|---|
| `Michael Marmot.md` | Long-form profile: implementations, objectives, plans, history. Source material for the canonical record; not yet absorbed. |
| [Hive Posts/](Hive%20Posts/_index.md) | Draft and published Hive posts under `@michael561`. |

## Outstanding normalization

- `Michael Marmot.md` is wikilink-flavored and pre-corpus-frontmatter.
  Its load-bearing content (objectives, plans) should be lifted into the canonical persona record at [`michael-marmot.md`](michael-marmot.md) and this file then archived.
- The directory uses a Title-Case `Hive Posts/` name; this is preserved because that's how the source vault stored it.
  A future pass may rename it to `hive-posts/` to match the lower-kebab convention; do this only after verifying nothing references the existing path.
