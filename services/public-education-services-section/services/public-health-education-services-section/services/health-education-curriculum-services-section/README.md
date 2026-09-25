# Health education curriculum

This directory holds the public education curriculum and edition parameters for *Understanding Infection-Associated Chronic Illness*. The authoritative [six-chapter manuscript](../../../../../../../../../science-services-section/services/natural-science-services-section/services/biological-science-services-section/services/medical-science-services-section/content/books/understanding-infection-associated-chronic-illness) stays with the medical-science source material; the ebook manifest references it directly.

Build both EPUB and PDF from this directory:

```sh
node ../../../../../../../../../engineering-services-section/services/computer-engineering-services-section/services/computer-data-engineering-services-section/services/computer-content-engineering-services-section/services/computer-documents-engineering-services-section/services/ebook-engineering-services-section/apps/ebook-production-cli.mjs --manifest content/editions/understanding-infection-associated-chronic-illness.json
```

The shared ebook renderer sorts numbered chapter files and merges their CSL-JSON references for Pandoc citation processing. The chapters cover IACI definitions, Long COVID, proposed mechanisms, post-exertional malaise and pacing, and reading research. Existing distributions remain in `dist/`.

[PACE Yourself](content/curricula/pace-yourself/curriculum.json) is an independently reusable course over the medical source books. Its [YouTube configuration](channels/pace-yourself/config.json) controls video publication separately. No product sale or subscriber solicitation follows from an ebook build.
