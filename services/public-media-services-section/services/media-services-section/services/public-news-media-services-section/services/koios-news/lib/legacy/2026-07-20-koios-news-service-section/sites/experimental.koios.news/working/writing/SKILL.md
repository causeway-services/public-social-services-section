---
name: writing
description: Draft a withheld Koios.News post from a research packet.
---

# Writing a Koios.News Post

Run:

```sh
pnpm run new-post -- working/researching/library/<brief>.md
```

The draft lands in `content/posts/` and stays withheld until the edit gate passes.

Required shape:

- one SEO term only, from `koios.seo_term`;
- term in the first paragraph;
- term in at least one `##` subheader;
- primary sources cited by title and permalink;
- collapse frame in every section;
- full frontmatter: `koios.{seo_term,beat,tweet}`, `references`, `license`, and `syndication_rights`;
- no fediverse, ActivityPub, or Hive framing.

The script produces a complete draft from the packet. Nik still owns judgment: revise the prose before release if the packet is weak or the cited sources do not support the frame.
