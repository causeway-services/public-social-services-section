# The Second Day

The Second Day is a health-synthesis newsletter about infection-associated chronic illness, including definitions, proposed mechanisms, and care evidence. Its canonical issue data and Markdown, paste-ready HTML, and feed renderings stay in `content/issues/`. The cited scientific corpus is shared with [the health curriculum](../health-education-curriculum-services-section/README.md) and the [medical-science material](../../../../../../../../../science-services-section/services/natural-science-services-section/services/biological-science-services-section/services/medical-science-services-section).

Draft delivery uses the shared newsletter engineering implementation and its Buttondown API capability. From this directory:

```sh
node ../../../../../../../../../engineering-services-section/services/computer-engineering-services-section/services/computer-data-engineering-services-section/services/computer-content-engineering-services-section/services/computer-documents-engineering-services-section/services/email-newsletter-engineering-services-section/scripts/publish-issue-draft.mjs content/issues/001 --feed-link https://secondday.561.group/issues/001 --data-root data
```

Set `BUTTONDOWN_API_KEY` in the environment. The operation validates and recomposes the issue, creates a Buttondown draft, and appends its returned identifier to `data/publications.jsonl`. Existing historical journal records remain available under `data/`. Sending an issue is a separate action. The paste-ready HTML also supports manual cross-posting to emsenn's personal Substack, *Letters to the Web*.

The archive name is `secondday.561.group`; this document does not establish that the archive is deployed. The historical pricing research suggested $5–10 per month, without establishing a selected price or an active subscription offer. Issue 001 exists; additional issues and sourcing/coherence review precede subscriber solicitation or payment collection.
