# Koios intelligence briefing

## Thread

Five-custody thread (org-layering.md, 2026-09-01):
- science: [Agent-Readable Claim Infrastructure](../../../../../../../../../../../../../science-services-section/services/information-science-services-section/services/communication-science-services-section/services/media-science-services-section/services/news-media-science-services-section/content/text/triage/claim-infrastructure.md) (news-media-science-services-section) — studies the exact economic object this product sells: a structured, agent-readable claim/provenance archive monetized as premium feeds and briefings, not articles
- engineering: [News Media Engineering Services Section](../../../../../../../../../../../../../engineering-services-section/services/media-engineering-services-section/services/news-media-engineering-services-section/README.md) — owns the claim-state infrastructure, per-claim conformance, and warrant-preserving pipeline engineering the koios claim store this package reads is built on
- operations: [ScheduleDelivery Service](../../../../../../../../../../../../../operations-services-section/services/agent-services-section/services/scheduled-activity-delivery-service/README.md) — the Cold Red Gate scheduler that actually runs koios-news's routine publication cadence feeding the store this briefing measures
- 561-group: [Koios.News restart plan](../../../../../../../../../../../../../561-group-services-section/services/561-group-operations-services-section/services/561-group-enterprise-services-section/services/561-group-board-of-directors/services/561-group-board-of-directors-leader-movement-team/services/561-group-board-of-directors-leader-assistant-services-section/content/text/documents/articles/notes/2026/08/16/2026-08-16-koios-news-restart-plan.md) — the board's actual restart/monetization plan for koios-news, the governing decision this briefing product arms
- public: self (this section) — the named-subscriber premium face over the free koios.news site

theory-base: [Agent-Readable Claim Infrastructure](../../../../../../../../../../../../../science-services-section/services/information-science-services-section/services/communication-science-services-section/services/media-science-services-section/services/news-media-science-services-section/content/text/triage/claim-infrastructure.md) — its monetization-path survey (premium feeds, validators, conformance products) is this package's theory base for pricing a $50/month briefing over the same claim store.

This package is the counterpoint enterprise beside koios.news's general news
mission: a named-subscriber intelligence briefing (target ~20 subscribers at
~$50/month) built on the same machine backend as the free site — the
`sites/koios.news/store/<category>/<slug>.json` sourced-claim store, where
every asserted fact carries a `provenance.witness` and `provenance.citation`.
koios.news remains a general news site; this package adds a premium product
line beside it, never in place of it.

It does not replace, deploy, or schedule anything the parent settlement
already owns. It reads the store read-only and writes only its own
`data/records/`.

## What it measures

`src/topic-distribution.mjs` exports `computeClaimTopicDistribution`, a pure
function that walks every category directory in the store, and returns:

- per-category file and claim counts;
- a secondary breakdown by each claim's `force` and `status`;
- a recency histogram bucketed by each claim's `time.asserted` month.

Run it against the real store:

```sh
node scripts/measure-claim-topic-distribution.mjs
```

Measured on 2026-08-31 against the real 1,195-file store (4,770 claims):
`collapse-tech` is the corpus's strongest single category, both by file count
(144 of 1,195) and by claim count (576 of 4,770) — ahead of `collapse-politics`
(141 files), `collapse-finance` (119), `culture` (112), `politics` (111), and
`economy` (102). Every observed claim in the corpus carries `force: "alleges"`
and `status: "supported"`; that uniformity is itself a real, measured finding,
not an assumption. The corpus spans two months, `2026-06` (2,360 claims) and
`2026-07` (2,410 claims).

`collapse-tech`'s stories cluster on tech-infrastructure fragility, digital
sovereignty, and cybersecurity-geopolitics (cloud-sovereignty retreats,
critical-infrastructure cyberattacks, AI-tooling sovereignty disputes,
defense-tech supply chains) — a coherent, well-evidenced beat for a premium
briefing, not a forced label.

## Recording the launch state

`scripts/record-intelligence-briefing-launch-state.mjs` recomputes the
distribution, attaches the pricing rationale and funnel plan below, and
records one dated snapshot through
`@red-cup-engineering/semantic-record-journal-service` into this package's own
`data/records/journal/` (the service's own fixed `data/logs/YYYY/MM/DD/`
custody shape, nested beneath `data/records/` per house convention — this
package never hand-rolls a journal writer):

```sh
node scripts/record-intelligence-briefing-launch-state.mjs
```

## Pricing

Target: **$50/month, ~20 subscribers.** Comparables found by WebSearch
(August 2026), each cited in the recorded launch-state snapshot:

| Comparable | Price/month | Note |
| --- | ---: | --- |
| Stratechery Plus | $15 | 40,000+ paid subscribers |
| The Information | $42.25 | Pro tier $749/yr (~$62/mo) |
| Platformer | $10 | ~170K subscribers, 5% paid |
| Zero Day (Kim Zetter) | $10 | $25/mo "Special Friends and Sponsors" tier |
| The Maley Report | $49 | professional analyst briefing |
| FT Standard Digital | $45 | FT Premium Digital (incl. analyst briefings) is $75/mo |
| beehiiv 2026 market data | n/a | $10/mo is the generic anchor; niche verticals (investing $27, finance $20, business $15) command more; subscriber count near-20 vs. near-20,000 does not meaningfully move price — niche and differentiation do |

**Rationale (one paragraph):** $50/month sits well above the $10/month
generic-newsletter anchor beehiiv's 2026 market data describes, and inside the
$42-75/month band that professional analyst briefings actually charge (The
Information, The Maley Report, FT Premium Digital) — the tier this product
belongs in because it is not a curated-links digest but a machine-backed
briefing where every claim traces to a witness and citation in the koios
store, the source discipline a free feed does not surface and that a subscriber
paying for named analysis, not volume, is buying.

## Funnel

Measured niche (from the real distribution above): **collapse-tech**
(tech-infrastructure fragility / digital-sovereignty / cybersecurity-geopolitics).
Where that audience actually congregates, per WebSearch (August 2026):

- r/netsec, r/cybersecurity, r/blueteamsec (Reddit) — the practitioner
  communities cybersecurity professionals report actually using day to day.
- TechPolicy.Press — an existing publication covering the identical
  digital-sovereignty/AI-governance beat; its readership is this product's
  target readership.
- IAPP Navigate / Global Summit digital-sovereignty tracks — where this
  audience gathers in person.
- CSO Online, Security Boulevard — trade press this audience already reads.

**First concrete move:** once a sample issue independently clears the fence
below, share it as a free, value-first post in r/netsec or r/cybersecurity —
the source-disciplined analysis itself, no paywall link, no subscription ask
in that post. Audience-building precedes any revenue ask; this is the first
step of building that audience, not a sales pitch.

## The fence (do not cross this)

**No subscriber has been solicited. No payment has been taken.** The founder
imposed one explicit condition before either happens: the sample issue must be
genuinely good on its own merits. This session's honest judgment on the sample
issue at `content/text/documents/sample-issues/2026-08-31-koios-intelligence-briefing-sample-issue-01.md`:
it clears the sourcing-discipline bar (every story traces to a real claim file,
every citation is the store's own citation, nothing is invented) and it clears
the coherence bar (five stories on one measured beat, not a listicle). It does
**not** yet clear the editorial-polish bar a $50/month subscriber expects from
issue after issue — one issue proves the mechanism works, not that the cadence
holds. Do not solicit subscribers from this one issue alone; write two or three
more real issues first and get informal reader reaction before any ask.

## Machinery reused vs. new

Reused: the koios-news settlement's real claim store (read-only), the
`services/editorial-admission-receipt` package shape (package.json/src/cli/test
layout), and `@red-cup-engineering/semantic-record-journal-service` (pinned to
the actual latest registry version, 0.1.9, verified with `npm view` this
session — not the stale 0.1.6 the root package still pins).

New: this package itself — the topic-distribution algebra, the two operational
scripts, the test suite, this README, and the one sample-issue Markdown
carrier at `content/text/documents/sample-issues/`.

## First-dollar path (HANDS vs. ENGINEERING)

ENGINEERING (delivered by this work): the package, the measurer, the
launch-state record, the sample issue, this pricing/funnel writeup.

HANDS (a human must do this next, outside any repository): open a named
monthly-billing account. Recommended rail: **Stripe**, or a newsletter
platform's built-in billing (Substack/Ghost/Buttondown) if the founder wants
the masthead and billing in one product — not the org's x402/pseudonymous
rails. Twenty *named* monthly subscribers who expect a receipt, a renewal, and
support if a charge fails are a poor fit for x402's agent-to-agent
micropayment design; they need conventional subscription billing with
customer-support and dispute handling, which Stripe/Substack/Ghost/Buttondown
provide and x402 does not.

## Risks, honestly

- The sample issue proves the mechanism (real claims, real citations, a
  coherent beat); it does not prove a sustainable weekly/monthly cadence at
  the editorial quality a paying subscriber expects issue after issue.
- Audience-building precedes revenue: no distribution channel has been used
  yet, only researched. The first move above is a distribution step, not a
  sale.
- Every claim in the corpus is currently `force: "alleges"` /
  `status: "supported"` — the store has not yet recorded a disputed or
  refuted claim. That is an honest limit of the current corpus, not a defect
  of this package; briefings drawing on it should say "reported" rather than
  implying independent verification beyond the cited source.
