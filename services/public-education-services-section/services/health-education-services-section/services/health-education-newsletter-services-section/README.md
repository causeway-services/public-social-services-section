# Health Education Newsletter Services Section

Founder-moved 2026-09-02 ("we could spin this into a substack people
would love to pay for"): a second named-subscriber newsletter product,
sibling to
[koios-intelligence-briefing](../../../../../public-media-services-section/services/media-services-section/services/public-news-media-services-section/services/koios-news/services/koios-intelligence-briefing/README.md)
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
  precedent named. It renders an issue; it does not itself publish,
  schedule, or syndicate one to any platform — no code in this package
  calls out to Buttondown, Substack, RSS hosting, or any other
  distribution surface. This section's own publish lane
  (`scripts/publish-issue-draft.mjs`, see operations below) is what calls
  out to a platform — creating a Buttondown draft — after composing
  through this package.
- **operations**: distribution, stated honestly. Canonical custody of
  every issue stays in this repository (`content/issues/<NNN>/`, this
  section's own carriers) — the repository is authoritative, not a mirror
  of whatever a platform holds. This section's own publish lane is
  `scripts/publish-issue-draft.mjs`: it verifies and re-composes an issue
  directory's renderings (`@red-cup-engineering/newsletter-issue-production-services-section`),
  creates a **Buttondown draft** from the composed Markdown through
  `@red-cup-engineering/buttondown-services-section`'s `createDraftEmail`
  (refusing cleanly, before any network call, when `BUTTONDOWN_API_KEY`
  is unset), and records a publication receipt. It creates drafts only —
  no code here sends an issue; that step stays a founder's-hands action
  in Buttondown's own dashboard. Substack is a separate surface: emsenn's
  existing personal Substack ("emsenn's Letters to the Web", documented
  in
  [emsenn-web-services-section](../../../../../../../personal-services-section/emsenn-services-section/services/emsenn-web-services-section/README.md))
  is a **founder-identity cross-post** lane, not this newsletter's system
  of record or its publish platform. Verified this session (WebSearch,
  2026-09): Substack's 2026 Developer API is a profile-search endpoint
  (LinkedIn-handle lookup against public creator profiles) and a separate
  analytics Publisher API (post/subscriber metrics) — **neither is an
  official posting or publishing endpoint.** Substack has **no official
  publish API** as of this research; third-party unofficial posting tools
  exist (apisubstack.com, Narrareach) but are not Substack's own
  machinery and are not adopted here. So the Substack cross-post ceremony
  stays manual: this package's `renderPasteHtml` produces Substack-paste-safe
  HTML (h2/h3/p/blockquote/a/strong/em only), and the founder pastes that
  rendering into Substack's own editor by hand under their own
  founder-identity account, per the bodily-harm autonomy rule (an account
  signup and its consent flow are asks only the founder's own identity
  can perform) — this carrier does not propose an account name or
  handle for that surface. The newsletter is **The Second Day** (see
  public, below); every issue's title and byline carry that masthead, and
  each issue's feed link points at `secondday.561.group`, the archive
  subdomain decided 2026-09-02 and not deployed as of that date.
- **561-group**: a second subscriber product beside
  [koios-intelligence-briefing](../../../../../public-media-services-section/services/media-services-section/services/public-news-media-services-section/services/koios-news/services/koios-intelligence-briefing/README.md)
  in the counterpoint-monetization wing. The
  [2026-09-02-0140 goal-stack roadmap](../../../../../../../../../561-group-services-section/services/561-group-operations-services-section/services/561-group-enterprise-services-section/services/561-group-enterprise-project-management-services-section/data/records/2026-09-02-0140-goal-stack-roadmap.json)'s
  counterpoint wing names the infection-associated chronic illness
  program, this newsletter included, as its ninth enterprise; the
  program's parent is the
  [561 Group Medical Services Section](../../../../../../../../../561-group-services-section/services/561-group-operations-services-section/services/561-group-medical-services-section/README.md). Monetization tier is open: field
  research (WebSearch, comparables survey) suggests a **$5-10/month**
  range for a niche health-synthesis newsletter — cited here as research,
  not as a founder decision, per the same fence
  koios-intelligence-briefing's README states (no subscriber solicited,
  no payment taken, until the founder clears that gate).
- **public**: the newsletter itself, **The Second Day**, a Culvert Health
  product (decided 2026-09-02 under the decision law; the
  [naming note](../../../../../../../../../561-group-services-section/services/561-group-operations-services-section/services/561-group-medical-services-section/content/text/documents/articles/notes/2026/09/02/2026-09-02-note-on-naming-the-medical-divisions.md)
  carries the reasoning). Issue mastheads carry that name.

## Issue 001

`content/issues/001/` carries issue 001: `issue-001.json` (the canonical
issue carrier) and its three composed renderings (`issue.md`,
`issue.paste.html`, `issue.feed-item.rss.xml`), drafted from the verified
IACI corpus named above and repaired against a fidelity review and a
reader review. The section's next concrete step is issues 002-003, which
the fence below requires before any subscriber is solicited.

## The fence (do not cross this)

Following koios-intelligence-briefing's own rule directly: no subscriber
has been solicited and no payment has been taken for this product. That
gate opens only once a real issue exists and clears the same
sourcing-discipline and coherence bars the koios precedent applied to its
own sample issue — not decided by this carrier.
