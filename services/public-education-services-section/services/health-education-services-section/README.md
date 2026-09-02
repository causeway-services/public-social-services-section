# Health Education Services Section

Founder-moved 2026-09-01: an infection-associated chronic illness
public-education program. Research-paper-quality synthesis of the science
feeds three public artifact classes — civic-education videos, ebooks, and
articles. The program's stated purpose is dual, not merely dual-use: it
exists to educate the public honestly on this illness class, **and** it
exists to force repair and deepening of upstream machinery the org already
owns but has not proven at this scope — the YouTube fleet, the literature
tooling, the fabrication pipeline. A production run that cannot clear the
existing quality bar is itself a finding about that machinery, not just
about this program.

## Thread

Five-custody thread (org-layering.md, 2026-09-01):

- **science**: [Myalgic Encephalomyelitis Services Section](../../../../../../../science-services-section/services/natural-science-services-section/services/biological-science-services-section/services/medical-science-services-section/services/myalgic-encephalomyelitis-services-section/README.md)
  and its sibling [Long COVID Services Section](../../../../../../../science-services-section/services/natural-science-services-section/services/biological-science-services-section/services/medical-science-services-section/services/long-covid-services-section/README.md)
  — both now on disk, each naming its own thread-mate debts (engineering,
  operations, 561-group, public — this program is one answer to their
  shared "public" debt). The **infection-associated-chronic-illness**
  umbrella glossary term also now exists
  (`medical-science-services-section/content/text/glossary/terms/infection-associated-chronic-illness.md`).
- **engineering**: the shared primitives this program's production line will
  call, none of them owned by this section — video: [`@red-cup-engineering/youtube-services-section`](../../../../../../../engineering-services-section/services/computer-engineering-services-section/services/computer-systems-engineering-services-section/services/web-services-section/services/web-platform-services-section/services/web2-platform-services-section/services/web2-media-platform-services-section/youtube-services-section/package.json)
  and [`@red-cup-engineering/video-rendering-services-section`](../../../../../../../engineering-services-section/services/computer-engineering-services-section/services/computer-data-services-section/services/computer-content-services-section/services/computer-media-content-services-section/services/video-rendering-services-section/package.json);
  ebook: [`@red-cup-engineering/ebook-production-services-section`](../../../../../../../engineering-services-section/services/computer-engineering-services-section/services/computer-data-services-section/services/computer-content-services-section/services/documents-services-section/services/ebook-production-services-section/README.md);
  literature synthesis: [scholarly-literature-services-section](../../../../../../../engineering-services-section/services/computer-engineering-services-section/services/computer-data-services-section/services/computer-content-services-section/services/documents-services-section/services/scholarly-literature-services-section/README.md)
  — now a real OpenAlex/PubMed/CrossRef retrieval primitive normalizing to
  CSL-JSON, source-only (unpublished to the registry).
- **operations**: no dedicated operations package — the pattern this program
  will run under is the GitHub Actions free lane the org's other five
  channels already use, e.g. [business-education-youtube-services-section's `test-and-image.yml`](../../../../../public-computer-services-section/services/public-web-services-section/services/public-web2-services-section/services/public-youtube-services-section/services/business-education-youtube-services-section/.github/workflows/test-and-image.yml):
  a free `ubuntu-24.04` runner, a scheduled cron job, a Docker-built channel
  image, OAuth secrets injected from GitHub's own secret store. This
  program's channel, once it has an identity, is a sixth instance of that
  pattern, not a new one.
- **561-group**: no section yet. The [2026-09-01-0300 goal-stack roadmap](../../../../../../../561-group-services-section/services/561-group-operations-services-section/services/561-group-enterprise-services-section/services/561-group-enterprise-project-management-services-section/data/records/2026-09-01-0300-goal-stack-roadmap.json)'s
  `first-moneyday-earning-stack` thread names its counterpoint wing as eight
  built enterprises (institutional-annual-contracts,
  indigenous-data-governance-consulting, emsenn-one-of-one-artifacts,
  crowdfunded-cultural-tech-campaign, the paid live cohort,
  koios-intelligence-briefing, world-hosting, forecasting) — none of them is
  this program. A ninth counterpoint-wing enterprise entry for this program
  is a named debt against that roadmap record, not yet written there.
- **public**: [Health Education Curriculum Services Section](services/health-education-curriculum-services-section/README.md)
  — seated 2026-09-01, owning the ebook line
  (`@emsenn/health-education-curriculum-enterprise`, *Understanding
  Infection-Associated Chronic Illness*); the future channel and article
  lines remain unseated.

theory-base: the medical-science-services-section thread above; this
carrier adds no science of its own; it only names where the science already
lives and what does not yet exist.

## App/API dimension (founder-moved 2026-09-02)

Alongside the video/ebook/article production line above, the founder moved a
second shape for this program: a pacing-support app for the IACI audience,
built over a biometric-intelligence engineering layer that is separately
sold as an x402 agent API — the same computed intelligence offered once to a
human-facing app and again, per call, to paying agents. The precedent for
this split is already live and deployed: [paid-ephemeris-gateway](../../../../../../../public-computer-services-section/services/public-web-services-section/services/public-web-divination-services-section/services/astrology-services-section/services/astrology-emphemeris-services-section/README.md)
sells the Ephemeris Tracking Team's product as x402-gated HTTP routes
(USD 0.04 / USD 0.32 per call, Coinbase Bazaar discovery) while a separate
face owns the product itself — the pacing dimension proposes the identical
separation, not a new pattern.

This dimension's five-custody thread, distinct from the production-line
thread above:

- **science**: [Note on Biometric-Guided Pacing Evidence](../../../../../../../science-services-section/services/natural-science-services-section/services/biological-science-services-section/services/medical-science-services-section/services/myalgic-encephalomyelitis-services-section/content/text/documents/articles/notes/2026/09/02/2026-09-02-note-on-biometric-guided-pacing-evidence.md)
  in the Myalgic Encephalomyelitis Services Section — the evidence base
  bounding what any biometric-guided pacing feature may honestly claim
  (describe a person's own heart-rate/HRV history and flag deviation from
  their own baseline; never diagnose or claim to detect post-exertional
  malaise from biometric data alone, because the two-day-CPET marker is
  contested by an unreplicated 2026 non-replication and the HRV-prediction
  and biofeedback evidence is each a single small unreplicated cohort). The
  note also names the incumbent this dimension answers: Visible's
  PacePoints, whose scoring formula is unpublished. No general
  biometric-observation record schema yet exists in health-science custody;
  the nearest carrier is [nutrition-biometric-observation-v1.schema.json](../../../../../../../science-services-section/services/natural-science-services-section/services/biological-science-services-section/services/medical-science-services-section/services/medical-services-section/services/health-services-section/services/nutrition-services-section/lib/schemas/nutrition-biometric-observation-v1.schema.json),
  nutrition-scoped today (`recordType: "nutrition-biometric-observation"`) —
  generalizing it, or minting a pacing-scoped sibling, is a named debt, not
  done here.
- **engineering**: seated. [`pacing-intelligence-services-section`](../../../../../../../engineering-services-section/services/computer-engineering-services-section/services/computer-systems-engineering-services-section/services/personal-computer-systems-services-section/services/personal-health-computer-systems-engineering-services-section/services/pacing-intelligence-services-section/README.md)
  is published as `@red-cup-engineering/pacing-intelligence-services-section@0.1.0`,
  a sibling of
  [`nutrition-practice-system-services-section` and `tai-chi-practice-system-services-section`](../../../../../../../engineering-services-section/services/computer-engineering-services-section/services/computer-systems-engineering-services-section/services/personal-computer-systems-services-section/services/personal-health-computer-systems-engineering-services-section/README.md)
  under personal-health-computer-systems-engineering-services-section — pure
  biometric math (rolling baselines, morning deviation, the Workwell
  heart-rate heuristic, conservative PEM risk flags), no I/O, no diagnosis.
  The practitioner-facing pacing app itself remains unseated. Its paid
  gateway — the x402 agent-API face, following the paid-ephemeris-gateway
  shape above — is seated as
  [`paid-pacing-intelligence-gateway`](../../../../../../services/public-computer-services-section/services/public-web-services-section/services/public-web-health-services-section/services/pacing-services-section/services/paid-pacing-intelligence-gateway/README.md),
  consuming the compute package by exact registry pin.
- **operations**: unfilled debt. No CI/deploy pattern is chosen for either
  the app or the gateway; the GitHub Actions free lane named in the
  production-line's operations thread above is a candidate, unconfirmed.
- **561-group**: unfilled debt. Not named in the 2026-09-01-0300 goal-stack
  roadmap's counterpoint wing (see the 561-group line above); a tenth
  counterpoint-wing entry, separate from the production-line's already-named
  ninth-entry debt, is owed.
- **public**: unfilled debt. No app or gateway package is seated under this
  section or under health-education-curriculum-services-section. The
  agent-API side's rail is decided (x402, per the founder's move above); the
  human-facing app's own monetization rail is not — it inherits the
  Monetization rail uncertainty named below, unresolved for this program's
  human-facing surfaces generally.

## Newsletter dimension (founder-moved 2026-09-02)

A third shape, beside the video/ebook/article production line and the
pacing app/API dimension above: a paid, named-subscriber newsletter over
the program's own verified IACI literature corpus — "we could spin this
into a substack people would love to pay for." The precedent is the same
one the pacing dimension's x402 split cites for its own shape:
[koios-intelligence-briefing](../../../public-media-services-section/services/media-services-section/services/public-news-media-services-section/services/koios-news/services/koios-intelligence-briefing/README.md)
sells a named-subscriber briefing over the koios claim store; this
dimension is the identical product shape over this program's literature
corpus instead. Seated as
[health-education-newsletter-services-section](services/health-education-newsletter-services-section/README.md),
whose own README carries this dimension's full five-custody thread,
including the verified-today finding that Substack has no official
publish API and the resulting founder's-hands-only publishing ceremony.
Issue 001 is scaffolded (`content/issues/001/`, currently empty) but not
yet composed.

## Dimensions and uncertainties (preserved honestly, not resolved here)

- **Channel identity requires the founder's hands.** Per the bodily-harm
  autonomy rule, an account signup and its OAuth consent are asks only the
  founder's own identity can perform — this carrier does not propose which
  name, handle, or existing property the channel runs under, because that
  choice has not been made.
- **Monetization rail is undecided.** koios-intelligence-briefing's own
  README shows the pattern for reasoning about this once a product shape
  exists (x402 vs. Stripe/Substack-style named billing, chosen by whether
  buyers are agents or named humans); this program has not reached the
  point of having a sellable unit to price.
- **Audience-building is unplanned.** No funnel, subreddit, or distribution
  channel has been researched for this beat, unlike koios-intelligence-briefing's
  measured funnel work for `collapse-tech`.
- **"Infection-associated chronic illness" is field vocabulary** (NASEM and
  NIH usage — the NIH's own IACI research initiative and NASEM's 2024 Long
  COVID definition report use this umbrella), adopted by founder direction
  2026-09-01. It is not a house coinage; the glossary entry ruling it now
  exists — see the science-custody line above.

## Program edge, as of this carrier

Founding order, in sequence: (1) fleet repair — proving the YouTube,
literature, and fabrication primitives named above actually hold at
research-paper-synthesis quality — and science-base founding — landing the
long-covid sibling and the infection-associated-chronic-illness glossary
term — come first; (2) channel identity (the founder's hands item above)
comes second; (3) production — the first real video/ebook/article run —
comes third. Step (1)'s science-base founding has landed: the long-covid
sibling and the glossary term both exist on disk, and a curriculum
subsection ([health-education-curriculum-services-section](services/health-education-curriculum-services-section/README.md))
now owns the first production artifact, an ebook, with its front matter
written and its five chapters' landing order specified, awaiting the
chapters themselves from parallel writers. Step (2), channel identity, is
still the founder's-hands item above and remains unmade; a media
subsection and channel package stay unseated until it is.
