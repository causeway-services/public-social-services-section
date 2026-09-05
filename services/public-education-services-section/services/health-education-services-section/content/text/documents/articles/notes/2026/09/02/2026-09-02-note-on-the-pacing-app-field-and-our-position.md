---
title: "The Pacing App Field and Our Position"
description: "A meet-then-beat market analysis of the biometric-guided pacing app market for the IACI audience — Visible, Bearable, Guava, and generic HRV apps — measuring their data-capture ergonomics, wearable integrations, and algorithm transparency, and stating our falsifiable structural advantage: cited, epistemically-labeled signals over an open algorithm, sold twice — once to the human app, once as a per-call x402 agent API."
date-created: 2026-09-02
type: competitive-analysis
in-service-of: lib/emsenn/services/561-group/services/public-services-section/services/public-social-services-section/services/public-education-services-section/services/health-education-services-section
name: note-on-the-pacing-app-field-and-our-position
keywords:
  - pacing
  - biometric-monitoring
  - heart-rate-variability
  - myalgic-encephalomyelitis
  - infection-associated-chronic-illness
  - x402
  - agent-native-marketplace
tags:
  - published
status: published
authors:
  - Claude Fable
---

## What this analyzes

This note runs the meet-then-beat procedure against the App/API dimension the
founder moved 2026-09-02 (see the [section README](../../../../../../../../README.md)),
which is a distinct arena from the [IACI education field note](2026-09-02-note-on-the-iaci-education-field-and-our-position.md)
sitting beside it. The receiver here is a person managing myalgic
encephalomyelitis, long COVID, or another infection-associated chronic
illness (IACI) who wears a heart-rate or HRV-capable device and wants that
data turned into pacing guidance that keeps exertion inside their own
metabolic and autonomic ceiling — the job is "tell me, from my own body's
signal, whether today is a day to push or a day to rest, without either
diagnosing me or lying to me about what the signal actually proves." A
second, distinct receiver exists for the same underlying computation: an
agent or downstream application that wants the same biometric-pacing
intelligence as a machine-payable call, not a human subscription — the x402
agent-API face this dimension proposes.

Scope: this note covers apps and platforms that turn a person's own
biometric stream into pacing guidance, not the broader symptom-tracker or
patient-education markets (the sibling note above covers education
incumbents; a plain, non-biometric symptom tracker like Guava is included
here only insofar as it competes for the same wrist-real-estate and daily
habit).

## Incumbent portfolio, classified

| Product | Role | Basis for inclusion |
|---|---|---|
| Visible | same-job incumbent | the field's dedicated pacing app; Polar-manufactured armband, proprietary PacePoints score, explicitly targets ME/CFS and Long COVID |
| Bearable | same-job incumbent (generalist) | general symptom/mood tracker with correlation reports and Fitbit/Apple-Health/Google-Fit biometric import; widely used in the ME/CFS and Long COVID patient community |
| Guava | same-job incumbent (generalist) | chronic-illness health tracker naming ME/CFS and Long COVID explicitly, syncs a wide device roster (Fitbit, Garmin, Oura, WHOOP), no pacing-specific feature |
| Generic HRV apps (Oura, WHOOP, Elite HRV, and similar readiness-score products) | reference implementation | show the baseline UX for daily HRV capture and a computed daily score, without IACI framing or pacing-specific guidance |

Visible is the only product in this portfolio purpose-built for pacing;
Bearable and Guava are same-job incumbents by breadth (a user could run
either as their whole tracking-and-pacing workflow) rather than by
specialization. The generic HRV apps are a reference class for daily-capture
ergonomics, not a same-job incumbent for pacing guidance specifically — none
of them frame their score as exertion pacing for post-exertional malaise.

## Measured evidence

All figures below were observed 2026-09-01/02 (UTC). First-party pages were
fetched directly where they resolved; where a first-party pricing page
404'd, the figure is marked as corroborated by independent secondary
sources rather than confirmed first-party, per house discipline — never
presented as a directly-observed first-party fact when it wasn't.

### Visible

- **Product and hardware.** Visible Band 2.0, manufactured by Polar,
  continuous heart-rate and HRV tracking, screenless, ~5-day battery
  (confirmed first-party, makevisible.com, fetched 2026-09-01).
- **PacePoints.** Described first-party as "a personal energy budget you
  spend across the day" with "real-time over-exertion alerts." The scoring
  formula is not published: Visible's own site states only that it runs
  "the most advanced algorithms and features, updated monthly by our data
  scientists" — no methodology, weights, or validation citation is
  disclosed for the score itself (confirmed first-party, makevisible.com,
  fetched 2026-09-01). This is the load-bearing fact for the BEAT
  hypothesis below and it is directly observed, not inferred.
- **Pricing.** makevisible.com's `/pricing` and `/join` paths both
  returned HTTP 404 on direct fetch 2026-09-02 — no first-party pricing
  page could be located this session. Two independent secondary sources
  (a web-search aggregation and the third-party comparison site
  aelivra.co, self-dated "verified July 2026") agree on: membership
  $19.99/month or $179.88/year ($14.99/month effective), Visible Band 2.0
  $79.70 one-off. **Unverified first-party; corroborated by two
  independent secondary sources; not directly observed on makevisible.com
  this session.**
- **Evidence claims.** First-party copy cites "86% of members report
  feeling more in control" and "91% report better energy management" (self-
  reported outcome survey framing, not a controlled study) and references
  a Frontiers in Digital Health publication without a specific DOI
  extracted this session. Wikipedia (accessed 2026-09-02, largely 2022-
  vintage content) records that as of 2022 "no clinical trials on Visible's
  effectiveness have been conducted," and that Visible partnered with
  Imperial College London in July 2023 on two observational studies
  (menstrual-cycle effects on Long COVID symptoms; epidemiology/economic
  impact) — neither is a validation of the PacePoints score itself.
- **Data capture.** Continuous heart rate, HRV, resting heart rate from the
  Band; self-reported sleep quality, symptoms, emotional/social exertion,
  medication, infections. Clinician-report generation is offered
  first-party ("generate reports and share your data with healthcare
  providers"); export format not specified in the fetched content.

### Bearable

- **Pricing.** Free tier: unlimited custom-metric tracking, weekly reports.
  Premium: $6.99/month or $34.99/year (frequently discounted to $18.99/year
  per a third-party review), 7-day free trial, plus a sponsorship program
  funding Premium for people who can't pay (confirmed via
  choosingtherapy.com review, fetched 2026-09-02; bearable.app's own
  homepage, fetched the same session, returned a garbled "$34.99 monthly"
  figure inconsistent with every other source checked — the
  choosingtherapy.com figure is preferred here as internally consistent
  with the independent App-Store IAP price list, which includes $6.99 and
  $34.99 among its many regional/tier entries. **Conflict noted and
  resolved on cross-source consistency, not first-party single-source
  confirmation.**).
- **Wearable integration.** Syncs Google Fit, Apple Health, and Fitbit
  directly; importable metrics include HRV, resting heart rate, body
  temperature, steps, weight, blood pressure. Oura, Garmin, and Samsung
  Health integrations are listed as planned, not live, as of the fetched
  content (confirmed first-party, bearable.app, fetched 2026-09-02).
- **Correlation and algorithm.** Ships 30+ correlation/pattern/trend
  reports and custom "Experiments." No scoring methodology or algorithm
  documentation is published for how correlations are computed or ranked
  (confirmed absent from both the first-party site and a third-party
  clinical review).
- **Framing.** General-purpose chronic-illness/mood tracker, not
  pacing-specific; "reviewed by clinicians at Cedar Sinai" is cited as an
  endorsement, not a validation study of any Bearable feature.

### Guava

- **Pricing.** Free: $0/year. Premium: $78/year ($8/month), gating an
  emergency card, automated cross-data health insights, unlimited profile
  managers, automated lab-result detection, an AI visit-prep assistant, and
  food-photo nutrient detection (confirmed first-party, guavahealth.com/plans,
  fetched 2026-09-02).
- **Audience.** First-party marketing explicitly names ME/CFS, Long COVID,
  POTS, EDS, and MCAS as target conditions (confirmed first-party,
  guavahealth.com, fetched 2026-09-02).
- **Wearable integration.** Broadest device roster measured in this
  portfolio: Fitbit, Apple Health, Google Fit, Garmin, Dexcom, FreeStyle
  Libre, Omron, Withings, WHOOP, Oura — over 100,000 connected providers
  and devices claimed. No HRV-specific feature is advertised despite
  syncing HRV-capable devices (WHOOP, Oura); the sync is device-level, not
  signal-specific (confirmed first-party, guavahealth.com, fetched
  2026-09-02).
- **Pacing and validation.** No pacing-specific feature is named anywhere
  in the fetched first-party content. "Automatic health insights" and
  correlation claims carry no citation, methodology disclosure, or
  peer-reviewed backing in the fetched content — the strongest
  epistemic-transparency gap of the three named incumbents.

### Generic HRV apps (reference class)

Oura, WHOOP, Elite HRV, and similar readiness-score products were not
individually re-verified this session (out of the named portfolio's scope);
they are included as a reference class for daily-capture ergonomics — a
low-friction ring or strap, a single daily score, a trend graph — which any
entrant into this arena must reproduce the *feel* of, without inheriting
their non-IACI framing. **Unverified this session beyond public knowledge;
a dedicated pass belongs to whichever engineering carrier actually builds
the app's daily-capture surface.**

## What we must meet

| Capability | Incumbent baseline | Our present evidence | Acceptance assay |
|---|---|---|---|
| Data-capture ergonomics (low-friction daily HR/HRV entry, trend view) | Visible (purpose-built band), Bearable/Guava (multi-wearable sync), generic HRV apps (single daily score) | absent — no app exists | a person can log a full day's HR/HRV and see a trend graph in under 60 seconds without a manual data-entry form |
| Wearable integrations | Guava: broadest roster (10+ device classes); Bearable: Fitbit + Health-platform sync; Visible: dedicated Polar band | absent — no integration built | at minimum Apple Health / Google Fit sync, matching Bearable's baseline, before claiming parity |
| Daily-use UX that survives a bad-symptom day | Visible: single PacePoints number + alert; generic HRV apps: single readiness score | absent | a person symptomatic enough to need pacing guidance can still get an answer in one glance, no multi-screen navigation |
| Clinician-facing reports / data export | Visible: built-in report generation; Bearable: full export | absent | exportable, clinician-readable summary, matching Visible's stated capability |

None of these are structural advantages — they are table stakes every
same-job incumbent above already clears in some form. Building a pacing app
that does not clear them is not a competitive entry; it is a worse Visible.

## The BEAT hypothesis

**Because our biometric-pacing evidence base cites every claim to its
primary source and states what it does and does not establish (the
[Note on Biometric-Guided Pacing Evidence](../../../../../../../../../../../../../../../science-services-section/services/natural-science-services-section/services/biological-science-services-section/services/medical-science-services-section/services/myalgic-encephalomyelitis-services-section/content/text/documents/articles/notes/2026/09/02/2026-09-02-note-on-biometric-guided-pacing-evidence.md)),
we can ship a pacing app whose every computed signal carries a citation and
an epistemic-status label — "describes your own baseline," "flags deviation
from your own history," or "unvalidated heuristic, offered as a heuristic"
— which none of the three named incumbents does, because none of them
publish the methodology behind their headline score. Visible's PacePoints
formula is proprietary by its own admission; Bearable's and Guava's
correlation engines carry no published methodology. An open, cited
algorithm is falsifiable and auditable in a way a proprietary score
structurally cannot be, and it is the only way to honestly reflect that the
field's flagship marker (two-day CPET) is under live, unresolved
replication conflict rather than settled science.**

**Because the same computed intelligence is a machine-buyable good — an
x402-gated API selling per-call access to the biometric-pacing computation,
following the paid-ephemeris-gateway precedent
([astrology-emphemeris-services-section](../../../../../../../../../../../../../public-computer-services-section/services/public-web-services-section/services/public-web-divination-services-section/services/astrology-services-section/services/astrology-emphemeris-services-section/README.md),
USD 0.04–0.32 per call, Coinbase Bazaar discovery) — we can sell the
identical computation twice: once to a human subscriber through the app,
once per-call to an agent or downstream integration through the gateway.
None of the three named incumbents offers any API, paid or free, agent- or
human-keyed; their computation is locked to their own app's UI.**

### Trying to falsify it

Checked against each named incumbent's measured surface above:

- **Citation-per-signal.** Not found in Visible (proprietary formula, no
  per-number citation), Bearable (no methodology disclosure), or Guava (no
  citation on any correlation claim). Holds as a genuine gap, not merely
  an unmeasured one.
- **Open/auditable algorithm.** Not found in any of the three. Visible's
  own copy states the opposite — the algorithm is explicitly proprietary
  and undisclosed, confirmed first-party. Holds.
- **Machine-buyable per-call API.** No API surface, paid or free, was found
  in any of the three incumbents' fetched content, app-store listings, or
  developer documentation search. Holds as a genuine gap — this is
  the strongest and least contestable of the three legs, since it requires
  no interpretation of the incumbents' evidence claims, only the absence of
  a published API.

None of the three legs is falsified by the evidence gathered this session.
All three remain research hypotheses until an actual app and gateway exist
to test them against a real receiver — a complete spec is evidence the
competitive procedure ran, not evidence the advantage shipped.

## What would falsify this position going forward

1. **Visible, Bearable, or Guava publishes a methodology or opens an API.**
   Any of the three closing either gap collapses that leg of the BEAT
   hypothesis to a MEET gap. Visible's monthly "updated by our data
   scientists" cadence means its algorithm posture could change without
   notice; this note is a 2026-09-01/02 snapshot, not a standing fact.
2. **Citation-and-epistemic-labeling does not change what a symptomatic
   user actually trusts or acts on.** If a person mid-PEM-crash wants a
   single confident number, not a labeled, hedged one, the structural
   advantage could be real but not receiver-valued. This is untested
   against an actual receiver and is the single largest unknown in this
   note.
3. **The x402 agent-API leg has no discovered demand.** A machine-buyable
   biometric-pacing API is a structural capability, not a proven market;
   the ephemeris precedent proves the *shape* works for one product
   (astrology), not that agent demand exists for health-pacing calls
   specifically.

## Role in the app/API dimension

Per the [section README](../../../../../../../../README.md)'s App/API
dimension, `pacing-intelligence-services-section` and its paid gateway are
both unseated — no code exists yet to assay against this position. The
receiver-visible wedge this note owes the roadmap: the smallest version of
the "describe and flag against baseline, cite everything, never diagnose"
app surface, built on the evidence note's licensed capabilities, is the
first acceptance assay for the MEET table above; the x402 gateway's first
settled call, following the paid-ephemeris-gateway's own shape, is the
first acceptance assay for the BEAT hypothesis's third leg.
