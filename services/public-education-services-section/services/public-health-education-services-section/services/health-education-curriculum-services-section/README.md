# Health education curriculum

This directory holds the public education curriculum for *Understanding Infection-Associated Chronic Illness*. The authoritative [six-chapter manuscript and ebook manifest](../../../../../../../../../science-services-section/services/natural-science-services-section/services/biological-science-services-section/services/medical-science-services-section/content/books/understanding-infection-associated-chronic-illness) stay with the medical-science source material; the former second manifest here was removed rather than preserving two edition descriptions.

Build both EPUB and PDF from this directory:

```sh
node ../../../../../../../../../engineering-services-section/services/computer-engineering-services-section/services/computer-data-engineering-services-section/services/computer-content-engineering-services-section/services/computer-documents-engineering-services-section/services/ebook-engineering-services-section/apps/ebook-production-cli.mjs --manifest ../../../../../../../../../science-services-section/services/natural-science-services-section/services/biological-science-services-section/services/medical-science-services-section/content/books/understanding-infection-associated-chronic-illness/ebook.json
```

The shared ebook renderer sorts numbered chapter files and merges their CSL-JSON references for Pandoc citation processing. The chapters cover IACI definitions, Long COVID, proposed mechanisms, post-exertional malaise and pacing, and reading research. Edition state belongs under the medical-science section's `data/state/editions/understanding-infection-associated-chronic-illness/` directory.

[PACE Yourself](content/curricula/pace-yourself/curriculum.json) is an independently reusable course over the medical source books. Its [YouTube configuration](channels/pace-yourself/config.json) controls video publication separately. No product sale or subscriber solicitation follows from an ebook build.
