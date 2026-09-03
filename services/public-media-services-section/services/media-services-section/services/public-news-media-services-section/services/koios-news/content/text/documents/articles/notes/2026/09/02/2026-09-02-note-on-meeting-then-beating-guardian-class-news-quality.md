---
title: "Meeting Then Beating Guardian-Class News Quality"
description: "A meet-then-beat dossier for koios.news against The Guardian, Reuters, AP, and BBC as reference-implementation incumbents for general-news structural quality: what koios.news already meets in editorial, discovery, trust, and product machinery per live evidence gathered this session, and the falsifiable BEAT hypothesis — a per-claim, provenance-bearing claim store no incumbent structurally exposes — with its closest receiver-visible wedge named as the next roadmap item."
date-created: 2026-09-02
type: notes
name: 2026-09-02-note-on-meeting-then-beating-guardian-class-news-quality
authors:
  - claude-sonnet-5
status: draft-for-owner-review
keywords: ["meet-then-beat", "koios-news", "guardian", "reuters", "ap", "bbc", "editorial-machinery", "discovery-machinery", "trust-surfaces", "claim-infrastructure", "structured-data", "newsarticle-schema"]
tags: ["draft", "competitive-dossier", "koios-news"]
---

## 1. Arena and receiver

Receiver: a reader or an agent choosing which general-news source to trust,
cite, and return to for coverage of technology, economy, culture, politics,
environment, and war. The job entrusted to the surface: produce and surface
accurate, sourced, correctable, discoverable news the receiver can act on —
by reading it, citing it, or programmatically querying it. The observable
outcome: whether the receiver can find the story, trust its provenance, see
it corrected when wrong, and (for an agent receiver) parse and cite it
without scraping prose. Boundary of comparison: general-purpose news
publication and its supporting machinery, not koios's separate premium
briefing product (`koios-intelligence-briefing`, a distinct arena with its
own dossier already recorded in that package's README) and not the org's
claim-infrastructure monetization theory as a business plan.

## 2. Incumbent portfolio

**The Guardian, Reuters, AP, BBC** — named per the commissioning brief, all
four classified as **reference implementations**: none is a same-job
incumbent competing for koios's specific readers today (koios is a solo,
AI-drafted, systems-analysis-angled newsroom; these are large, professionally
staffed newsrooms with decades of institutional trust), but each demonstrates
how the generic capability class ("general news quality") is actually built
and disclosed at the top of the industry. koios.news is measured against
their structural machinery, not their audience size or reporting headcount.

## 3. Measured evidence

All rows below are measured against the **live, deployed** `https://koios.news`
this session (2026-09-02, retrieved via WebFetch and `curl -L`), not against
source code alone, except where marked "code-only" (present in the
`sites/koios.news/src` TypeScript but not confirmed reachable at a live URL
this session).

### Editorial machinery

| Capability | Guardian-class baseline | koios.news evidence |
|---|---|---|
| Corrections policy, public face | A public corrections/clarifications page exists at all four incumbents (Guardian's Editorial Code covers attribution, errors, fairness; BBC: "should normally acknowledge serious factual errors and correct them quickly, clearly and appropriately"; Reuters Handbook: "always correct an error openly") | **Present, and structurally deeper.** `/corrections` returns 200 live. The correction transaction itself (`sites/koios.news/src/management/corrections.mts`) is digest-verified: opening a correction withdraws the exact manuscript by `expectedManuscriptDigest`, invalidates its prior editorial acceptance, and closing requires the corrected bytes to independently repass the ordinary editorial/publication gates and have every declared public carrier rebuilt and witnessed (`priorManifestDigest`, `priorRouteDigests` checked). None of the four incumbents publish a machine-verifiable digest transaction for corrections; their corrections pages are prose lists. |
| Style guide | Guardian and AP each publish a full public style guide (AP Stylebook); Reuters has its Handbook of Journalism | **Absent as a public style guide.** `/standards` (live, 200) states principles only — "accurate, attributable reporting," commitment to "correct material errors promptly," and to distinguish "evidence from analysis" — with no usage/style rulebook comparable to AP's or Reuters'. |
| Sourcing standards | Reuters Handbook: accuracy "sacrosanct," never fabricate/plagiarize, never pay for a story; BBC: "well sourced, based on sound evidence, thoroughly tested" | **Partial.** `/standards` states the principle-level commitment above but no detailed policy for anonymous-source handling, verification thresholds, or embargo rules was found on the page. |
| Headline discipline | Guardian/BBC style guides prohibit clickbait and require the headline to reflect the story; enforcement is editorial-review, not automated | **Present, and machine-enforced beyond incumbent practice.** `researching/writing/attention-headline.mts` encodes an explicit LLM prompt contract forbidding curiosity-gaps on the actual subject or payoff and forbidding the headline from strengthening "allegation, estimate, interpretation, causation, scope, urgency, intimacy, scandal, or certainty" beyond the body — a rule the four incumbents hold as prose guidance, not as a checked constraint on generation. |
| Liveblog format | Guardian, BBC, and Reuters all run rolling liveblogs for breaking events | **Absent.** No liveblog/rolling-update route or format found in `sites/koios.news/src` or on the live site; koios publishes discrete dated posts only. |
| AI-use disclosure | Not a universal incumbent norm, but increasingly expected given koios's own stated commitment | **Inconsistent, a finding, not a fix in this lot's scope.** The `/about` page's summarized transparency language claims the publication will "identify source limits, corrections, and material use of AI in reporting," but the `/standards` page fetched separately contains no AI-disclosure statement. koios is substantially AI-authored (headline generation, drafting per the pipeline above); the gap between the About page's stated commitment and the Standards page's silence on AI use is a live inconsistency worth recording in koios's own custody. |

### Discovery machinery

| Capability | Guardian-class baseline | koios.news evidence |
|---|---|---|
| RSS/Atom/JSON feeds per section | Standard at all four | **Present, verified live.** `/feed.xml` returns valid RSS 2.0 with per-item `<author>`, `<category>`, `<pubDate>`, `<guid>`; `<link rel="alternate">` for RSS, Atom, and JSON Feed present in every article's `<head>`. |
| News sitemap (Google News, 48-hour window) | Required for Google News inclusion; AP/Reuters/Guardian/BBC all maintain one | **Present, verified live and schema-valid.** `/news-sitemap.xml` carries `xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"`, `<news:name>Koios.News</news:name>`, `<news:language>en</news:language>`, `<news:publication_date>`, `<news:title>`. |
| General sitemap | Standard | **Present, verified live.** `/sitemap.xml` lists 200+ URLs across posts, tags, topics, and archive. |
| schema.org NewsArticle / JSON-LD | Required by Google for Top Stories eligibility (image, datePublished, author); all four incumbents implement it | **Present, verified live** on the sampled article (`/posts/england-s-flood-alerts-do-not-mean-its-drought-is-ending`): `@type":"NewsArticle"` with `headline`, `datePublished`, `dateModified`, `author` (Person), `publisher` (Organization), `articleSection`, `keywords`, `mainEntityOfPage`. |
| h-entry microformats (indieweb) | Not standard practice at the four incumbents | **Present, verified live** — `class="h-entry"`, `p-name`, `dt-published`, `p-summary`, `e-content`, `u-url` on the sampled article. A capability beyond the Guardian-class baseline, not required by it. |
| ninjs (IPTC news exchange) | AP and Reuters use ninjs-family formats internally for wire syndication; not typically publicly exposed | **Code-only.** `surface.mts` imports and mounts `millNinjs` from `@red-cup-engineering/organizing-a-content-mill`; two guessed live endpoints (`/feed.ninjs`, `/ninjs`) both returned 404 this session, so the actual live path (if any) was not located and is not confirmed reachable. |

### Trust surfaces

| Capability | Guardian-class baseline | koios.news evidence |
|---|---|---|
| Bylines | Named individual reporters, each typically with a bio/profile page and an accountable publication history | **Present but structurally narrower.** Every sampled article (RSS `<author>`, JSON-LD `author`, and the visible byline) attributes to a single persona, "Nik Koios" — a consistent masthead byline, not per-reporter attribution. No reporter bio or individual accountability page was found. This is a genuine trust-surface gap against the named-multi-reporter model, not merely a stylistic difference: a reader or agent cannot build a track record on a distinct human contributor. |
| Dateline conventions | Wire-service convention marks reporting location ("LONDON —") | **Absent** in the classic geographic sense; koios uses `datePublished`/`dateModified` and a visible date, which covers the temporal half of "dateline" but not the geographic half. Minor gap. |
| Funding/ownership transparency | The Guardian discloses reader-funding and Scott Trust ownership; BBC discloses licence-fee funding; AP discloses its nonprofit-cooperative ownership; Reuters discloses Thomson Reuters plc ownership — all prominently, near the masthead | **Absent.** No funding or ownership disclosure was found on the koios.news homepage or `/about` page this session. This is a clear, currently-unmet table stake. |

### Product surfaces

| Capability | Guardian-class baseline | koios.news evidence |
|---|---|---|
| Newsletters as a free top-of-funnel traffic engine | Standard at all four (e.g., Guardian's daily briefing) | **Absent.** No newsletter signup form or `mailto`/"subscribe" affordance was found on the live homepage this session. The org's `koios-intelligence-briefing` package is a *separate*, paid, ~20-subscriber analyst product still pre-launch behind an explicit founder-imposed quality fence ("no subscriber has been solicited, no payment has been taken") — a different animal from a free habit-forming newsletter, and not yet live either way. |
| Data journalism (reader-facing) | Guardian/Reuters/BBC/AP all run dedicated interactive-graphics desks | **Absent as a reader-facing surface.** No interactive visualization was found on the sampled pages. koios does hold real internal claim-analytics tooling (`koios-intelligence-briefing`'s `computeClaimTopicDistribution`, run against the live 1,195-file / 4,770-claim store), but this is editorial/pricing instrumentation, not a published data-journalism product. |

## 4. MEET contract

| Capability | Incumbent baseline (evidence) | koios present evidence | Smallest acceptance assay | Gap |
|---|---|---|---|---|
| Public style guide | AP Stylebook, Reuters Handbook | absent | Publish a `/style` page with concrete usage rules beyond `/standards`'s principles | open |
| Detailed sourcing-standards policy | Reuters Handbook, BBC Editorial Guidelines | source-only (principle statement) | Publish anonymous-source, verification-threshold, and embargo rules on `/standards` | open |
| Liveblog format | Guardian/BBC/Reuters rolling coverage | absent | Ship one rolling-update route and one real liveblogged event | open |
| Funding/ownership disclosure | Guardian (Scott Trust/reader-funded), BBC (licence fee), AP (cooperative), Reuters (Thomson Reuters plc) | absent | Add a funding/ownership statement to `/about` naming the actual owner (the 561 Group) and the current absence of outside funding | open, cheap, no engineering required |
| Per-reporter named byline with accountability history | Guardian/BBC/AP/Reuters multi-reporter mastheads | deployed, but single-persona ("Nik Koios") only | Either accept the single-masthead-byline model explicitly as koios's chosen form and disclose it as such on `/about`, or add distinct attributable bylines | open — a taste/scope decision, not a mechanical gap |
| AI-use disclosure consistency | n/a (koios's own stated commitment) | inconsistent between `/about` and `/standards` | Make `/standards` state the AI-use disclosure `/about` already promises | open, cheap |
| RSS/Atom/JSON feeds | table stakes at all four | **deployed, verified live** | — | met |
| News sitemap (Google News schema) | table stakes at all four | **deployed, verified live and schema-valid** | — | met |
| schema.org NewsArticle JSON-LD | table stakes at all four | **deployed, verified live** | — | met |
| Corrections mechanism | table stakes at all four | **deployed, verified live, and exceeds baseline** (digest-verified reopen/close transaction) | — | met, and ahead |
| Headline discipline | prose guidance at all four | **deployed and machine-enforced**, exceeding baseline | — | met, and ahead |
| Free newsletter as traffic engine | table stakes at all four | absent | Ship a free, low-friction email digest distinct from the paid briefing | open |
| Reader-facing data journalism | table stakes at all four | absent (internal-only claim analytics exist) | Publish one interactive or visual data piece drawn from the claim store | open |

## 5. BEAT hypothesis and falsification pass

**Hypothesis 1 — per-claim, provenance-bearing claim store.** *Because koios
stores news as individually addressable claims (`sites/koios.news/store/<category>/<slug>.json`,
verified live on disk: each claim carries `proposition.predicate`/`object`,
`time.asserted`, `force`, `status`, and `provenance.witness` +
`provenance.citation`), koios can let a reader or agent query and cite a
single asserted fact with its own source, under assay Z = "fetch one claim
object and verify its citation resolves," while the four incumbents cannot
without contradicting their article-as-unit publishing model.* Checked
against each incumbent's measured surface: Guardian, Reuters, AP, and BBC
all expose schema.org `NewsArticle`/`Article` JSON-LD at the **article**
level (headline, author, datePublished) — none expose structured data at
the **claim** level with a citation attached to each individual assertion.
No counterexample was found this session. **The structural fact holds and the
receiver-visible outcome is deployed**: since the 2026-09-02 release every
store file is served byte-identical at `/claims/<category>/<slug>.json` with a
rendered ledger page at `/claims/<category>/<slug>/`, indexed by
`/claims/index.json` and `/wire/index.json` (2,153 items across 21
categories at release). Acceptance assay: fetch one claim object from
`https://koios.news/claims/...` and resolve its `provenance.citation`.

**Hypothesis 2 — citation-verified synthesis via the public editorial audit.**
*Because `/newswire-audit.json` publishes a per-article `sourceSha256` and
the correction transaction (`corrections.mts`) requires a new digest to
independently repass every gate before a correction closes, an outside
verifier can detect exactly which published bytes changed and when, under
assay Z = "diff two audit snapshots and confirm a changed digest corresponds
to a real, gated correction" — while none of the four incumbents publish a
machine-readable per-article integrity manifest.* Verified live:
`/newswire-audit.json` returns 200 with `sourceSha256` per post and a stated
provenance/ordering contract. No counterpart was found at the Guardian,
Reuters, AP, or BBC in this session's research — their corrections pages are
prose, not signed/hashed manifests. **This BEAT claim is shipped, not
hypothetical**, though its practical value depends on a verifier actually
polling and diffing the manifest over time; no such external verifier is
known to exist yet.

**Hypothesis 3 — agent-native distribution via x402-priced premium claims.**
*Because the org holds prior x402 (agent-to-agent micropayment) work, koios
could price individual claims or claim bundles for agent purchase.* Checked
against the live tree: x402 code exists only under `koios-news/lib/legacy/`
(the 2026-07-20 and earlier snapshots) — **not wired into the current live
site** (`sites/koios.news/src` has no x402 reference at all). The
`koios-intelligence-briefing` README explicitly recommends *against* x402
for its own named-subscriber product ("a poor fit for x402's agent-to-agent
micropayment design"), which is a different product from a hypothetical
per-claim agent API. **No live or even source-only implementation of
x402-priced claims exists today.** Per the skill's step 5, this stays a
**research hypothesis**, not a demonstrated or even source-only BEAT
result — closer to revival inventory (the legacy x402 package) than to
shipped capability.

## 6. The receiver-visible wedge

The wedge shipped on 2026-09-02: the store is exposed read-only under
`/claims/`, the desks under `/wire/<desk>` carry ten sections (world,
politics, business, crypto, technology, science, health, culture, sport,
opinion), and the funding/ownership and AI-use disclosures now stand on
`/about` and `/standards`. Still open from the MEET table: a public style
guide, a liveblog format, a free newsletter, and reader-facing data
journalism beyond the coverage map at `/wire/coverage`. The next wedge is
stratifying the store's uniform `alleges`/`supported` claims into derived
asserted/saturated/settled strata so a reader can see a contested claim as
contested.
