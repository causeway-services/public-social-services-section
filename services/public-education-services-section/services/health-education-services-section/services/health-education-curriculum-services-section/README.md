# Health Education Curriculum Services Section

`@emsenn/health-education-curriculum-enterprise` -- the infection-associated
chronic illness (IACI) public-education knowledge-product line's first
product: a sellable ebook, *Understanding Infection-Associated Chronic
Illness* (`content/books/understanding-infection-associated-chronic-illness/`,
`scripts/build-ebook.mjs`), delegating pandoc/build-record assembly to
[`@red-cup-engineering/ebook-production-services-section`](../../../../../../../../../engineering-services-section/services/computer-engineering-services-section/services/computer-data-services-section/services/computer-content-services-section/services/documents-services-section/services/ebook-production-services-section/README.md)
the same way the sibling
[artificial-intelligence-education-curriculum-services-section](../../../computer-education-services-section/services/artificial-intelligence-education-services-section/services/artificial-intelligence-education-curriculum-services-section/README.md)
does for *The Agent Operator's Handbook*.

## Chapter order

`listChapters()` in ebook-production-services-section orders chapters by
filename sort only -- it takes no explicit ordering input. Following the
same numeric-prefix convention the-agent-operators-handbook uses, this
book's chapters arrive from parallel writers under their bare topic names
and must be landed into `content/books/understanding-infection-associated-chronic-illness/`
with these prefixes, in this order:

| landed filename          | source                          |
| ------------------------- | -------------------------------- |
| `00-front-matter.md`      | this section (already present)   |
| `01-what-is-iaci.md`      | parallel writer's `what-is-iaci.md` |
| `02-long-covid.md`        | parallel writer's `long-covid.md`   |
| `03-mechanisms.md`        | parallel writer's `mechanisms.md`   |
| `04-pem-pacing.md`        | parallel writer's `pem-pacing.md`   |
| `05-reading-research.md`  | parallel writer's `reading-research.md` |

All six files are landed. `npm run build-ebook` produces both EPUB and
PDF from them; the build record's `chapterSet.files` lists all six in
this order and its `chapterSet.count` is 6.

## Citations

All six chapters carry a `references` frontmatter map of CSL-JSON items
keyed by citation id and cite them inline with `[@id]` markers.
`scripts/build-ebook.mjs` delegates to ebook-production-services-section's
`collectReferences` to merge those maps across chapters (deduping an id
repeated with identical CSL-JSON, throwing if the same id names two
different works) and passes the merged set to pandoc's `--citeproc` with
the `book.latex` template's CSL bibliography macros. The current build's
record reports `referencesCount: 60` with a `References` section landing
in both `dist/understanding-infection-associated-chronic-illness/understanding-infection-associated-chronic-illness.epub`
and the sibling `.pdf`.

## Thread

Five-custody thread (org-layering.md, 2026-09-01):

- **science**: [Long COVID Services Section](../../../../../../../../../science-services-section/services/natural-science-services-section/services/biological-science-services-section/services/medical-science-services-section/services/long-covid-services-section/README.md)
  -- the definitional history (WHO/RECOVER/NASEM), prevalence uncertainty,
  and honest mechanistic map that chapters 02 and 03 draw from directly;
  its own README names this section's custody ("public") as one of its
  unseated thread-mate debts, and this carrier is one answer to that.
  The **myalgic-encephalomyelitis-services-section** sibling supplies the
  post-exertional-malaise/pacing material chapter 04 draws from, and
  names the same "public" debt. The
  **infection-associated-chronic-illness** umbrella glossary term
  (`medical-science-services-section/content/text/glossary/terms/infection-associated-chronic-illness.md`)
  grounds chapter 01's naming.
- **engineering**: [Ebook Production Services Section](../../../../../../../../../engineering-services-section/services/computer-engineering-services-section/services/computer-data-services-section/services/computer-content-services-section/services/documents-services-section/services/ebook-production-services-section/README.md)
  -- owns the pandoc build/cover/record machinery, including the
  `collectReferences`/`--citeproc` citation wiring, `scripts/build-ebook.mjs`
  delegates to (wired dependency, pinned `0.1.7`, not a debt). The
  **scholarly-literature-services-section**'s OpenAlex/PubMed/CrossRef
  retrieval primitive is the tool chapter 05 ("reading the research")
  teaches readers to use in spirit; its `resolve-doi.mjs` was used by hand
  to reconcile conflicting duplicate CSL entries against CrossRef when
  this book's chapters were landed, but this section does not itself call
  it at build time -- no code dependency, a named debt if a future edition
  wants live citation lookups wired into the build rather than hand-cited
  and hand-reconciled sources.
- **operations**: no dedicated operations package. The pattern the org's
  other public knowledge-product lines use once a channel exists is the
  GitHub Actions free lane (see the AI-curriculum sibling's README for the
  concrete example); this section has no channel yet, so no operations
  package is seated -- named debt, not fabricated.
- **561-group**: no dedicated child section under `561-group-enterprise-services-section`
  exists for this venture; it lives only as this curriculum-services-section
  under public custody, same as its AI-curriculum sibling before it.
- **public**: no downstream consumer exists yet. The AI-curriculum
  sibling has a live YouTube channel section consuming its lesson
  products; this program's channel identity is still an unmade
  founder's-hands decision per [health-education-services-section](../../README.md)'s
  "Dimensions and uncertainties" -- named debt, not seated ahead of that
  decision.

## Entanglement debts

- **live citation lookup**: chapter 05 teaches readers to evaluate primary
  literature but this section does not call scholarly-literature-services-section
  itself to fetch or verify citations at build time.
- **561-group enterprise seat**: no dedicated child section under
  `561-group-enterprise-services-section` for this venture yet.
- **public consumer**: no channel, article line, or other downstream
  public surface consumes this ebook yet -- the ebook is the first
  product of a program whose channel identity is still unmade.
- **operations package**: no scheduled-delivery or CI wiring exists for
  this section; it has nothing scheduled yet to wire.
