---
name: editing
description: Gate a Koios.News draft with SEO, citation, frontmatter, and publication checks.
---

# Editing a Koios.News Post

Run:

```sh
pnpm run lint-post -- content/posts/<slug>.md
```

The gate checks:

- one and only one SEO term;
- SEO term in the first paragraph;
- SEO term in at least one `##` subheader;
- required frontmatter;
- non-empty primary-source references;
- each reference title and permalink is cited in the body;
- no fediverse, ActivityPub, or Hive terms;
- the file can be read through `loadPosts()` when it is public.

On pass, the script sets:

- `koios.gates_clear: true`;
- `koios.standards_reviewed_at: <current ISO timestamp>`.

Drafts remain withheld by default. For verification that must exercise the served item page, use:

```sh
pnpm run lint-post -- --release content/posts/<slug>.md
```
