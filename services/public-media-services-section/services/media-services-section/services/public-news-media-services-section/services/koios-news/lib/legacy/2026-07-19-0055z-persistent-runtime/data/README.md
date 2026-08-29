# koios-news-data

The data store for **Koios.
News** (koios.news).
Mounted as the `data/` submodule of the `koios-news` repo; `@emsenn/content-production/content-farm` and the served package write here through the farm data layout.

```
journals/  append-only causal and operational event streams: deployments,
           contract events, corrections, attention, and process logs.
ledgers/   append-only accountable exchanges and quantities: provider use,
           source claims, delivery, advertising, revenue, and costs.
records/   durable adjudications and research artifacts whose exact bytes are
           independently addressed, plus current readout documents.
state/     explicitly mutable local working state such as assignment state.
```

Runtime-generated files (the live `.jsonl` traces, the fetched `search-console.json`) are gitignored — they regenerate.
The repo tracks the layout; the box holds the data.
