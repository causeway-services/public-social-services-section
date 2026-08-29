---
name: researching
description: Assemble a Koios.News research packet from an M3 desk work item and M1 wire claim-state bundles.
---

# Researching a Koios.News Story

Research starts from the desk, not from an autonomous loop.

Run:

```sh
pnpm run new-brief -- "<desk term or slug>"
```

The script reads:

- M3 desk work items from the local desk projection;
- M1 wire claim-state bundles from the local cable store;
- the current Koios content model through the package build when available.

The output is a research packet in `working/researching/library/`. It includes the work item, the single SEO term, the beat, primary-source citations, local claim records, the collapse frame, and the metroplat primitives used to read the work.

Choose for revelation, not size. The event should expose a larger compounding system: climate breakdown, grid stress, insurance retreat, migration, capital pressure, public capacity, or resource politics.
