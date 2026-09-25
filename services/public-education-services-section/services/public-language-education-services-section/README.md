# Public Language Education Services Section

This section is the public program scope for **iYappy** (the owner-ratified 2026-09-02 pun on *iyapi*). iYappy is a multi-language learning program whose first public focus is Lakȟótiyapi / Lakota. On 2026-09-02, [iyappy.561.group](https://iyappy.561.group) publicly served its finite Lakota course through VICTOR 0.1.7, TUFTE 0.8.2, and education-platform-service 0.2.2 in Worker `41dd3c9f-b017-4425-b37f-1f346fc33b38`. Its [deployment carrier](sites/iyappy.561.group/README.md) uses the exact manifest pin supplied by the [generic TUFTE engineering owner](../../../../../../../engineering-services-section/services/computer-engineering-services-section/services/computer-systems-engineering-services-section/services/web-services-section/services/web-interface-services-section/services/tufte/README.md).

## Composition

iYappy is a configured public instance of existing platforms. It owns the brand, domain, course, source, language policy, and configuration; it does not own a separate scheduler, state machine, or site builder.

| Concern | Existing owner | iYappy use |
| --- | --- | --- |
| Website composition, build, assets, and releases | [VICTOR](../../../../../../../engineering-services-section/services/computer-engineering-services-section/services/computer-systems-engineering-services-section/services/computer-systems-publishing-engineering-services-section/apps/victor/README.md) | Public site configuration |
| Presentation | [TUFTE](../../../../../../../engineering-services-section/services/computer-engineering-services-section/services/computer-systems-engineering-services-section/services/web-services-section/services/web-interface-services-section/services/tufte/README.md), `early-mac` | Shared presentation theme |
| Corpus compiler, checkers, controller, sessions, review, and progress | [education-platform-service](../../../../../../../engineering-services-section/services/computer-engineering-services-section/services/computer-systems-engineering-services-section/services/computer-game-system-services-section/services/education-platform-service/package.json) | Shared course platform; Equivo is a thin adapter/bootstrap and iYappy is a configured projector |
| Lakota lexical and morphological evidence | [lakota-language-algebra](../../../../../../../science-services-section/services/information-science-services-section/services/communication-science-services-section/services/linguistics-services-section/services/lakota-language-algebra/README.md) | Finite current capability only; no productive grammar or pronunciation grader |
| Frontier, belief, and maturity work | [Ascent system design](../../../../../personal-services-section/services/emsenn-services-section/services/emsenn-languages-services-section/services/emsenn-language-learning-services-section/content/text/documents/articles/references/a-system-design-for-language-learning.md) | Mandarin and personal prototypes; not an active public app |

## Multilingual source map

The public program can parameterize a course, adapter, and source policy by
language. This is a map of source capabilities, not a publication or learner
readiness assay. The five current fibers live in the canonical [linguistics
section](../../../../../../../science-services-section/services/information-science-services-section/services/communication-science-services-section/services/linguistics-services-section/README.md), each exports `.`, `./bundle`, and `./tag`, and each uses the language-neutral `@red-cup-engineering/agentic-communication-engine` engine.

| Language fiber and manifest version | Source capability and current limit |
| --- | --- |
| [English 0.1.7](../../../../../../../science-services-section/services/information-science-services-section/services/communication-science-services-section/services/linguistics-services-section/services/english-language-algebra/package.json) | SVO attachment, segmentation, and lexical data; the lexicon and bare regular-verb anchoring remain incomplete. |
| [Lakota 0.1.4](../../../../../../../science-services-section/services/information-science-services-section/services/communication-science-services-section/services/linguistics-services-section/services/lakota-language-algebra/package.json) | Curated finite stems and SOV attachment; productive person morphology is absent. |
| [Latin 0.1.4](../../../../../../../science-services-section/services/information-science-services-section/services/communication-science-services-section/services/linguistics-services-section/services/latin-language-algebra/package.json) | Case features and roles support free-order readings. |
| [Mandarin 0.1.2](../../../../../../../science-services-section/services/information-science-services-section/services/communication-science-services-section/services/linguistics-services-section/services/mandarin-language-algebra/package.json) | Dictionary-based segmentation, classifiers, and curated verbs; tone is not modeled. |
| [Toki Pona 0.1.4](../../../../../../../science-services-section/services/information-science-services-section/services/communication-science-services-section/services/linguistics-services-section/services/tokipona-language-algebra/package.json) | Isolating morphology, SVO attachment, and structural particles; content words remain on the noun floor, without ordinary verb anchoring. |

The existing [Panini composing app](../../../../../../../science-services-section/services/information-science-services-section/services/communication-science-services-section/services/linguistics-services-section/apps/panini/package.json) takes a fiber name or raw bundle and exposes load, read, settle, judgment, rendering, and receipts over all five fibers. Its public-learning integration has not been assayed. A public iYappy course therefore needs its own per-language source, course, and adapter policy; personal study records do not become public material automatically.

The separate [Lakota corpus](../../../../../../../science-services-section/services/information-science-services-section/services/communication-science-services-section/services/linguistics-services-section/services/lakota-language-corpus/README.md) preserves a manifest, maturity and research records, and 27 finite paradigm rows. Its package still identifies a legacy `@emsenn/communicating`/`@emsenn/relating` runtime, so it is finite corpus evidence rather than a current productive grammar or a public-course readiness claim.

Morgan's personal [languages section](../../../../../../services/personal-services-section/emsenn-services-section/services/emsenn-languages-services-section/README.md) holds English, Latin, Lakota, Mandarin, and a shared method with belief, SRS, frontier, and maturity work. The frontier is currently Mandarin-specific, and its belief adapter reads private personal state; both need parameterization before public reuse. The [Eco-industrialism curriculum](../../content/text/documents/articles/notes/eco-industrialism-curriculum.md) contains only a planned scientific-Latin lesson. French method notes and an Arabic `communicating-in-arabic` lead remain recovery material, as do the [legacy GitHub language packages](../../../../../../../science-services-section/services/information-science-services-section/services/communication-science-services-section/services/linguistics-services-section/content/assets/legacy/github-language-packages/language-parsing/README.md) and the linguistics section's `lib/legacy/` lineage; no additional active fiber was found in this bounded survey.

The related [predicated-computing program](../../../../../../../science-services-section/content/text/documents/articles/notes/2026/09/02/2026-09-02-the-predicated-computing-program.md) treats media in a language as a parameterization over a fiber and a typed translation judgment. Its witnessed-field corpus material is a cross-program asset, not an iYappy learner-course claim.

Current discovery is bounded and repeatable. A fresh instance of the [Bare Cedar
Fog Markdown vault service](../../../../../../../561-group-services-section/services/561-group-computer-services-section/services/computer-machine-services-section/services/persistent-computer-machine-services-section/services/bare-cedar-fog-services-section/services/bare-cedar-fog-markdown-vault-services-section/README.md) returned current science/public-vault material for English, Lakota, Latin, Mandarin, and Toki Pona with carrier readings disabled and the scope filter applied before candidate caps. Long-running MCP processes need reload; fresh instances supplied this evidence. Unregistered literal keywords now return `path-evidence`, not fabricated semantic proof.

```js
search_markdown_lightcone({
  keywords: ["mandarin"], query: "Mandarin", generation: "current",
  vaultIds: ["science-services", "public-services"],
  includeCarrierReadings: false, candidateLimit: 100, limit: 12,
});
```

The generic typed [MetroPlat path-corpus reader](../../../../../../../engineering-services-section/services/computer-engineering-services-section/services/computer-systems-engineering-services-section/services/agent-computer-system-engineering-services-section/services/multi-agent-computer-system-engineering-services-section/services/multi-agent-computer-platform-engineering-services-section/services/agentic-enterprise-computer-platform-engineering-services-section/apps/metroplat/src/search/path-corpus.mts) streams the existing filesystem primitive. Its updated distribution read the whole repository with the bounded Panini query below: 297,725 files seen, 128 retained and indexed, `truncated: true`, six results, 6.528 seconds, and 112,148 KiB peak RSS; results included the Panini CLI, manifest, and source, plus marked legacy-path leads.

```js
readPathCorpus(root, {
  query: "panini", limit: 6, maxFiles: 128, maxBytesPerFile: 4096,
});
```

Panini loading of all five fibers was verified, not learning quality. The current JSNode catalog still misses Panini, so a single catalog result cannot establish absence. The ops.561.group OAuth proxy exists, but path-corpus was neither activated in this session's MetroPlat allowlist nor verified through public operations. LAGOON's world-record pusher remains narrow, and a MARSH broker is desired but unimplemented; this section makes no activation or broker-completeness claim.

## Program frame

The requested meet-then-beat objective spans guided courses (Duolingo), pronunciation feedback (TonePerfect), recall (Anki), reading and learner-imported content (LingQ), conversation (Speak), and Lakota learning (Owóksape). iYappy has no mastery, parity, or unique-capability claim. Its public frame keeps per-modality evidence separate from scheduling; makes source, correction, and variation visible; keeps kin and speaker consent explicit; and treats learning and documentation as a feedback loop. A desired story or text may guide curricula. Typology transfer and source-verified generated practice remain research until validated.

| Public comparator | Documented public surface | Comparator-assay limit |
| --- | --- | --- |
| [Duolingo](https://www.duolingo.com/) | Browser view, 2026-09-02 19:01:45Z: bite-sized lessons; reading, writing, listening, speaking, and tailored learning | Outcomes unverified; no account used |
| [TonePerfect](https://toneperfect.app/) | Browser view, 2026-09-02 19:02:35Z: free five-word diagnosis with tone, initial, final feedback, and native audio | Microphone flow unassayed |
| [Anki](https://docs.ankiweb.net/exporting.html) | Documentation, 2026-09-02 19:00:45Z: exporting saves part of a collection as text or a packaged Anki deck | Import and authoring flows unassayed |
| [LingQ](https://www.lingq.com/en/) | Documented product-page claim, fetched 2026-09-02 19:00:45Z: choose from its library or import content | Account flows and outcomes unverified |
| [Speak](https://www.speak.com/) | Documented product-page claim, fetched 2026-09-02 19:00:46Z: Premium Plus advertises personalized lessons, mistake-based review, and Made for You lessons | Account and conversation quality unassayed |
| [Owóksape](https://owoksape.com/) | Browser view, 2026-09-02 19:01:58Z: Lakota app login/demo with Learn, Review, and Progress | Content completion unassayed |

Published and effective dates are unknown for these observations. No accounts or microphones were tested.

| House end-to-end capability | Current state | Acceptance gap |
| --- | --- | --- |
| Start a lesson, receive feedback, and resume | Observed 2026-09-02: all 12 checks completed across six finite Lakota forms; wrong answers retried, Enter submitted, NFD input was accepted, and saved state reloaded | No mastery or learning-outcome claim |
| Consented reference, recording, and audio feedback | Absent | Consent, recording state, feedback, and withdrawal work together in one observed flow |
| Portable review state | Observed 2026-09-02: export/import restored all 12 checks in a fresh context; malformed and wrong-theme imports preserved all 12 checks; denied storage remained usable | No portability or parity claim |
| Imported text lesson | Absent | A learner imports text and completes an attributable lesson from it |
| Source-calibrated conversation | Research only | A reviewed conversation uses source-visible limits and returns usable feedback |
| Source-chart links and metadata hiding | Observed 2026-09-02: per-lesson charts linked to `#page=20` and `#page=46`; raw form IDs and exercise metadata were not exposed | Live verification also passed denied-storage, 390px mobile, and no-JavaScript-error checks |

## Design sources

The public program retains the detailed [system design](../../../../../personal-services-section/services/emsenn-services-section/services/emsenn-languages-services-section/services/emsenn-language-learning-services-section/content/text/documents/articles/references/a-system-design-for-language-learning.md), [architecture view](../../../../../personal-services-section/services/emsenn-services-section/services/emsenn-languages-services-section/services/emsenn-language-learning-services-section/content/text/documents/articles/references/ascent-architecture-arc42.md), [Five Instruments](../../../../../personal-services-section/services/emsenn-services-section/services/emsenn-languages-services-section/services/emsenn-language-learning-services-section/content/text/documents/articles/notes/2026-08-21-the-game-the-flywheel-and-the-five-instruments.md), and [Witnessed Field theory](../../../../../../../science-services-section/services/information-science-services-section/services/communication-science-services-section/services/linguistics-services-section/content/text/documents/articles/notes/2026-08-20-language-as-witnessed-field-working-theory.md). Zint Kola is a separate elder-companion program; any future corpus contribution is optional and must not automatically feed iYappy.
