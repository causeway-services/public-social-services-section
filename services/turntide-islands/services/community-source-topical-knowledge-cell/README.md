# Community-Source Topical Knowledge Cell

A pure, side-effect-free rules layer for a URL-lead knowledge pipeline,
distinct from the direct first-person contributor market
(`lib/management/knowledge-contribution-market.mjs` at the settlement root).
A community member offers a URL lead; the lead is fetched and analyzed
externally; the fetched evidence and analysis are reconciled into a
`CommunitySourceKnowledgeRecord` carrying an inference-provenance receipt; a
non-authoritative "saleable" projection is derived that withholds contributor
identity, roster reference, and raw bytes; topic/id/since queries are then
fulfilled against the corpus with no ranking. The two pipelines are
complementary, not duplicates.

The module refuses, by construction, any input shaped like Discord message
content, a credential-shaped key, a private or internal hostname, or a
contributor reference that is not an opaque `urn:tti:contributor:...` value.
It has no imports beyond `node:crypto`.

## Install

```sh
npm install
```

Reads resolve through the per-project `.npmrc` (private scopes routed to
Google Artifact Registry's virtual repo).

## Verify

```sh
npm test
```

Runs `node --check` over `src/*.mjs` and `test/*.test.mjs`, then
`node --test test/*.test.mjs`, then `npm pack --dry-run`.

## Exports

- `admitCommunitySourceLead(lead)` — admits or refuses an offered URL lead.
- `reconcileFetchedSource(admission, fetchEvidence, analysisEvidence, reconciledAtIso)`
  — reconciles fetched bytes and analysis evidence into a knowledge record.
- `projectSaleableKnowledge(record)` — derives the identity-withheld
  projection of a reconciled record.
- `fulfillCommunityKnowledgeQuery(query, records, evaluationInstantIso)` —
  answers a topic/id/since query against a corpus of reconciled records.
- `contentDigest(value)` — the `sha256:...` content digest used
  throughout the module.
- `WITHHELD_EFFECTS` — the frozen list of effects this module never performs
  itself: `discord-write`, `message-text-import`,
  `contributor-identity-resale`, `credential-custody`, `fetch`, `inference`,
  `storage`, `publication`, `ranking`, `price-conversion`,
  `payment-settlement`.

Consumed at the settlement root via
`lib/management/community-source-topical-knowledge-cell.mjs`, a
compatibility re-export (`export * from "@causeway-services/community-source-topical-knowledge-cell"`).
