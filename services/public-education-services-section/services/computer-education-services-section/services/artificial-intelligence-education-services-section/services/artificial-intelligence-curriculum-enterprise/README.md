# Artificial Intelligence Education Curriculum Services Section

`@emsenn/artificial-intelligence-curriculum-enterprise` -- the AI/agentic-
operations education enterprise: prerequisite-ordered course curricula
(`content/curricula/`) with settled, SEAVT-evidenced lesson products
(`src/curriculum.mjs`), delivered over a signed A2A membrane
(`src/a2a-delivery-executor.mjs`, `src/serve-delivery-a2a.mjs`) to a
downstream customer (the YouTube education channel enterprise); a paid
live cohort teaching multi-agent operating discipline
(`content/lesson-briefs/multi-agent-operating-discipline-for-teams/`,
`scripts/record-cohort-launch.mjs`); and a sellable ebook, *The Agent
Operator's Handbook* (`content/books/the-agent-operators-handbook/`,
`scripts/build-ebook.mjs`, `scripts/record-ebook-launch.mjs`).

## Thread

Five-custody thread (org-layering.md, 2026-09-01):
- science: [Pedagogy Services Section](../../../../../../../../../../../science-services-section/services/social-science-services-section/services/education-science-services-section/services/pedagogy-services-section/README.md) -- studies curriculum and lesson design as objects of research (see its [note on designing curricula](../../../../../../../../../../../science-services-section/services/social-science-services-section/services/education-science-services-section/services/pedagogy-services-section/content/text/documents/notes/2026-03-01-note-on-designing-curricula.md), which models curricula as dependency graphs with completion criteria -- the same shape this section's `admitLessonProduct`/prerequisite logic implements); no science section studies AI/agentic-systems pedagogy or multi-agent operating discipline specifically -- **that founding study is absent, a named debt**
- engineering: [Ebook Production Services Section](../../../../../../../../../../../engineering-services-section/services/computer-engineering-services-section/services/computer-data-services-section/services/computer-content-services-section/services/documents-services-section/services/ebook-production-services-section/README.md) -- owns the pandoc build/cover/record machinery this section's `build-ebook.mjs` delegates to (wired dependency, not a debt); no engineering section yet owns curriculum/course-delivery machinery generally -- this section's `src/curriculum.mjs` is currently the only implementation of that capability
- operations: [Scheduled Activity Delivery Service](../../../../../../../../../../../operations-services-section/services/agent-services-section/services/scheduled-activity-delivery-service/README.md) -- the colony-owned, contracted, idempotent ActivityStreams delivery service this section's own bespoke `src/a2a-delivery-executor.mjs`/`src/serve-delivery-a2a.mjs` membrane parallels but does not yet consume (not wired -- named as a debt, not a fabricated link)
- 561-group: [561 Group Enterprise Services Section](../../../../../../../../../../../561-group-services-section/services/561-group-operations-services-section/services/561-group-enterprise-services-section/README.md) -- the org's enterprise-portfolio governance root; no dedicated knowledge-product/education-enterprise child seat exists yet for this venture specifically
- public: [Artificial Intelligence Education YouTube Services Section](../../../../../../../../../public-computer-services-section/services/public-web-services-section/services/public-web2-services-section/services/public-youtube-services-section/services/artificial-intelligence-education-youtube-services-section) -- the sibling public-facing channel that consumes this section's lesson products as its `curriculum-provider.json` source (a real, verified thread-mate in the same subject area; its own OAuth-program-owned repo is out of scope here and untouched)

## Entanglement debts

- **science founding study**: no section studies AI/agentic-systems
  pedagogy or multi-agent operating discipline as a subject; the pedagogy
  thread-mate above covers general curriculum/lesson design theory only.
- **operations wiring**: `scripts/record-cohort-launch.mjs` and
  `src/a2a-delivery-executor.mjs` implement their own scheduled-delivery
  membrane instead of consuming
  `@coesite-operations/scheduled-activity-delivery-service`; not attempted
  this pass -- migrating a working A2A delivery membrane onto a different
  service's contract shape is a real refactor, not a cheap wiring.
- **561-group enterprise seat**: this venture has no dedicated child
  section under `561-group-enterprise-services-section`; it currently
  lives only as this one curriculum-services-section under public custody.
