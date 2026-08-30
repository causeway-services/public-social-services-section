# Koios News Service Section

This settlement supplies warrant-preserving news-domain services that any
publication may hire. It is not the `koios.news` masthead and does not own that
publication's corpus, editorial voice, beat portfolio, attention policy,
advertising, URLs, publication approval, or delivery authority. `koios.news`
is its first customer and proving ground, not the boundary of its mission.

The Service Section has one executable ActivityStreams message boundary:

```sh
npm run describe
printf '%s\n' "$ACTIVITY" | npm run settle -- 2026-07-18T18:00:00.000Z
```

`describe` advertises only operations the settlement can actually perform.
`settle` routes one exact solicitation or accepted contract to the owning
operation, records the result in the provider's append-only event log, and
returns the first durable response when a watcher replays the same message.
It does not discover providers or schedule work for a customer publication.

## Current production recovery chassis

The retired customer aggregate is not the production boundary. Its surviving
functions now live in small package-local carriers:

- [`runtime-current`](runtime-current/README.md) admits the retained provider
  topology without credentials or effects;
- [`services/editorial-admission-receipt`](services/editorial-admission-receipt/README.md)
  verifies retained local editorial evidence without claiming issuer authority;
- [`services/editorial-publication-authority`](services/editorial-publication-authority/README.md)
  verifies externally supplied Ed25519 exact-manuscript or receipt-bound
  standing-policy authority, without creating keys, grants, policy, or trust;
- [`tools/authority-ceremony-current`](tools/authority-ceremony-current/README.md)
  prepares unsigned authority artifacts, verifies externally made
  signatures against public-key maps, and writes path-only routine artifacts
  without ever accepting an admission or handling a private key;
- [`routine-publication-current`](routine-publication-current/README.md) forms
  one exact-admission-gated offline candidate while leaving the source corpus
  unchanged;
- the root `koios-news-routine-operation` bin admits only the exact retained
  ScheduleDelivery actor, capability, and routine-demand shape; its declared
  runtime closure can consume signed editorial authority exactly once and
  write one offline candidate from a fixed local job, while refusing absent or
  mutable trust/configuration and never deploying;
- [`static-delivery-current`](static-delivery-current/README.md) deterministically
  builds and seals the public site, feeds, discovery surfaces, and accountability
  pages; and
- [`cloudflare-release-current`](cloudflare-release-current/README.md) separates
  dry-run planning, independently signed exact-action release authority,
  durable one-use consumption, preview deployment, bounded preview probe,
  release, and pre-bound rollback.

The end-to-end local integration test proves that private publication receipts
remain above the `public/` upload root and that every uploaded input file is
sealed by the static manifest. See [`OPERATIONS.md`](OPERATIONS.md) for the
current production procedure and the remaining activation gates.

The Section now advertises a two-stage evidence spine. Its admissible research
packet service composes two separately contracted provider results without
reading or writing either provider's or customer's territory:

```text
Newscable SourceBundleDelivery + Corpus Management recovery/projection
  -> fresh current-source claims + digest-bound prior-research context
  |  typed refusal before prose or unlicensed corpus inference
```

Current-provider claims may enter the evidence cut. Recovered prior research
remains contextual reporting leads until separately sourced; the service never
promotes old notes into present-tense newsroom facts. The customer must name
the exact primary-source URLs because primary-source classification is an
editorial judgment, not something the provider infers from URL rank.

The licensed editorial state service then measures what that packet can
faithfully sustain before prose is commissioned:

```text
assignment + admitted research packet + genre law
  -> source-bound assertions + licensed passage plan
  |  typed refusal before writer inference
```

Both operations intentionally perform no generative inference. They preserve
source assertions as attributed evidence and construct the record
deterministically. A writer may consume the resulting bounded brief to produce
prose; a separately authorized editor still decides whether the exact
manuscript may be published.
