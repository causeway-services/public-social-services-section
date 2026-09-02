# Health Education Newsletter Services Section

Founder-moved 2026-09-02 ("we could spin this into a substack people
would love to pay for"): a second named-subscriber newsletter product,
sibling to
[koios-intelligence-briefing](../../../public-media-services-section/services/media-services-section/services/public-news-media-services-section/services/koios-news/services/koios-intelligence-briefing/README.md)
and built on the same shape — a paid periodical over a verified,
citation-disciplined corpus, distributed to named subscribers rather than
an anonymous feed. Where koios-intelligence-briefing sells a
machine-backed news briefing over the koios claim store,
this section sells a synthesis briefing over the health-education
program's own literature corpus: infection-associated chronic illness
(IACI) mechanisms, definitions, and care evidence, drawn from the same
CSL-JSON-cited sources the curriculum ebook cites.

## Thread

Five-custody thread (org-layering.md, 2026-09-01), following the
koios-intelligence-briefing precedent:

- **science**: the verified IACI corpus — the
  [structured literature-review synthesis](../../../../../../../../../science-services-section/services/natural-science-services-section/services/biological-science-services-section/services/medical-science-services-section/services/long-covid-services-section/content/text/theories/predication-literature-review-long-covid-mechanisms.md)
  in Long COVID Services Section (`references:` a CSL-JSON pool, the same
  frontmatter shape the newsletter-issue-production package below reads),
  alongside its
  [Long COVID Services Section](../../../../../../../../../science-services-section/services/natural-science-services-section/services/biological-science-services-section/services/medical-science-services-section/services/long-covid-services-section/README.md)
  and
  [Myalgic Encephalomyelitis Services Section](../../../../../../../../../science-services-section/services/natural-science-services-section/services/biological-science-services-section/services/medical-science-services-section/services/myalgic-encephalomyelitis-services-section/README.md)
  parents, and the
  [infection-associated-chronic-illness](../../../../../../../../../science-services-section/services/natural-science-services-section/services/biological-science-services-section/services/medical-science-services-section/content/text/glossary/terms/infection-associated-chronic-illness.md)
  umbrella glossary term — the same science base the sibling
  [health-education-curriculum-services-section](../health-education-curriculum-services-section/README.md)
  ebook already draws from. This section adds no science of its own.
- **engineering**: [Newsletter Issue Production Services Section](../../../../../../../../../engineering-services-section/services/computer-engineering-services-section/services/computer-data-services-section/services/computer-content-services-section/services/documents-services-section/services/newsletter-issue-production-services-section/README.md)
  (`@red-cup-engineering/newsletter-issue-production-services-section`),
  founded under documents custody the same day as this carrier —
  platform-neutral issue fabrication (`validateIssue`, `renderMarkdown`,
  `renderPasteHtml`, `renderFeedItem`) over the same
  `{title, dek, sections, references}` shape the koios-intelligence-briefing
  precedent named. It renders an issue; it does not publish, schedule, or
  syndicate one to any platform — no code here calls out to Substack, RSS
  hosting, or any other distribution surface. That gap is a named debt:
  **platform-syndication is unbuilt.** Today's issue is composed and
  rendered by hand through this package's CLI, not pushed anywhere by a
  machine.
- **operations**: distribution, stated honestly. Canonical custody of
  every issue stays in this repository (`content/issues/<NNN>/`, this
  section's own carriers) — the repository is authoritative, not a mirror
  of whatever a platform holds. Substack is the audience/network-facing
  reader surface, not the system of record. Verified this session
  (WebSearch, 2026-09): Substack's 2026 Developer API is a profile-search
  endpoint (LinkedIn-handle lookup against public creator profiles) and a
  separate analytics Publisher API (post/subscriber metrics) — **neither
  is an official posting or publishing endpoint.** Substack has **no
  official publish API** as of this research. Third-party unofficial
  posting tools exist (apisubstack.com, Narrareach) but are not Substack's
  own machinery and are not adopted here. The publishing ceremony is
  therefore: this package renders `renderPasteHtml`'s Substack-paste-safe
  HTML (h2/h3/p/blockquote/a/strong/em only), and the founder pastes that
  rendering into Substack's own editor by hand. Substack account creation
  and every actual publish action are founder's-hands items, per the
  bodily-harm autonomy rule (an account signup and its consent flow are
  asks only the founder's own identity can perform) — this carrier does
  not propose an account name or handle.
- **561-group**: a second subscriber product beside
  [koios-intelligence-briefing](../../../public-media-services-section/services/media-services-section/services/public-news-media-services-section/services/koios-news/services/koios-intelligence-briefing/README.md)
  in the counterpoint-monetization wing. Neither product is yet named in
  the [2026-09-01-0300 goal-stack roadmap](../../../../../../../../../561-group-services-section/services/561-group-operations-services-section/services/561-group-enterprise-services-section/services/561-group-enterprise-project-management-services-section/data/records/2026-09-01-0300-goal-stack-roadmap.json)'s
  counterpoint wing under this section's own name — the parent
  [Health Education Services Section](../../README.md) README already
  names a ninth counterpoint-wing entry as a debt against that record; a
  tenth (or the same ninth, reused) entry for this newsletter is the same
  kind of debt, not yet written there. Monetization tier is open: field
  research (WebSearch, comparables survey) suggests a **$5-10/month**
  range for a niche health-synthesis newsletter — cited here as research,
  not as a founder decision, per the same fence
  koios-intelligence-briefing's README states (no subscriber solicited,
  no payment taken, until the founder clears that gate).
- **public**: the newsletter itself. Its name is **unruled** — "Exertium"
  has been proposed, but this is a proposal awaiting the founder's
  ruling, not a settled name. Nothing in this section, its content
  carriers, or any linked carrier should be read as having adopted that
  name yet.

## Issue 001

`content/issues/001/` exists as a directory in this section and is
currently empty — no issue carrier has been landed into it yet. Composing
issue 001 through the newsletter-issue-production package's CLI, from the
verified IACI corpus named above, is the section's next concrete step.

## The fence (do not cross this)

Following koios-intelligence-briefing's own rule directly: no subscriber
has been solicited and no payment has been taken for this product. That
gate opens only once a real issue exists and clears the same
sourcing-discipline and coherence bars the koios precedent applied to its
own sample issue — not decided by this carrier.
