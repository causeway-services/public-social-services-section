# Turntide Islands

Turntide Islands is a Discord-native community settlement built as a
sovereign RMN membrane: every market it runs — the knowledge vault, the
contributor market, union media, locality answers, steward inference — is
typed admissions, typed refusals, content-addressed records, and witnessed
writes, with circuits that machine-check how far each value path is from
closing. Every activation record reads honestly: `not-admitted` means
nothing has been admitted, and no path claims a state it hasn't earned. The
package name is `@causeway-services/turntide-islands-settlement`, per the
ruling that Turntide/Farstone packages belong under @causeway-services.

## Component map

- **Community operations** — reusable reporting, scheduling, observation,
  and witness-journal packages now live under
  [`operations-services-section/services/community-operations-services-section`](../../../../../operations-services-section/services/community-operations-services-section/).
  This public service provides their runtime content and configuration.
- **`services/`** — remaining public-facing leaf packages:
  - [`community-source-topical-knowledge-cell`](services/community-source-topical-knowledge-cell/README.md)
    — URL-lead community knowledge curation.
  - [`turntide-steward-inference-procurement-service`](services/turntide-steward-inference-procurement-service/README.md)
    — bounded steward inference procurement market.
  - [`turntide-union-media-syndication-service`](services/turntide-union-media-syndication-service/README.md)
    — Union Media contract, admissions, auction, and settlement.
- **Discord engineering** — the Discord application implementation is
  [`@red-cup-engineering/turntide-islands-discord-platform`](../../../../../engineering-services-section/services/computer-engineering-services-section/services/computer-systems-engineering-services-section/services/web-services-section/services/web-platform-services-section/services/web2-platform-services-section/services/web2-social-platform-services-section/services/discord-services-section/services/turntide-islands-discord-platform/): gateway
  interactions, the steward CLI, the vault/checkout/provider-offer HTTP
  surface, and the union-media ActivityPub origin. It consumes this public
  service's content and configuration through an explicit boundary.
- **`lib/management/`** — public-service-specific shims and management;
  community-running scripts live in Community Operations.
- **`lib/schemas/`** — shared schema definitions. **`lib/legacy/`** —
  archived, superseded source, not part of the live tree.
- **`content/`** — the settlement's content-addressed records: `admissions`,
  `circuits`, `configurations`, `contracts`, `documents`, `offices`,
  `products`, `provider-admissions`, `service-admissions`, `solicitations`,
  `terms`. This is the record layer every `not-admitted`/`admitted`
  disposition in the code reads against.
- **`data/`** — runtime state: `agency` (e.g. the Zelo work roster) and
  `news-editions`.
- **`test/`** — root-level integration tests (`node --test test/*.test.mjs`),
  exercising the management scripts and services together.

## Install

```sh
npm install
```

resolves the public leaf services alongside the engineering and operations
packages they consume.

**Registry**: reads resolve through the per-project `.npmrc`, which sets a
default registry (a local proxy cache) and scopes the private
`@red-cup-engineering` scope to Google Artifact
Registry's virtual repo (`https://us-central1-npm.pkg.dev/five-six-one-group-dev/npm/`).
Each publishable leaf package carries its own matching `.npmrc`.
Publishing (not needed for ordinary install/verify) must target the
Artifact Registry sovereign-npm repo explicitly and requires a fresh
`gcloud auth print-access-token` in `~/.npmrc`; a package's own scoped
`.npmrc` silently overrides an explicit `--registry` flag during publish and
must be moved aside first.

## Verify

```sh
npm test
```

runs the public settlement's integration tests. Engineering and Community
Operations verify independently in their sections; each remaining
`services/*` package also provides its own `npm test` command.

## Deployment

Deployment targets a GCE box (`bare-cedar-fog-cloud-mirror`, under the
existing content-addressed release convention) for the stateful, always-on
Discord gateway server and the steward CLI, and Cloud Run for the
stateless, least-authority union-media ActivityPub origin, with secrets in
Google Secret Manager rather than a checked-in `.env`. The full reasoning —
including the registry-strategy recommendation and the sequenced work
packages (`WP-DEPLOY-01` through `WP-DEPLOY-09`) — is recorded in the
deployment architecture memo.

## Further reading

- [`content/texts/documents/roadmaps/turntide-islands-community-roadmap.md`](content/texts/documents/roadmaps/turntide-islands-community-roadmap.md)
  — the live product roadmap and twelve-capability acceptance standard.
- [`content/texts/documents/articles/research-articles/ideas/`](content/texts/documents/articles/research-articles/ideas/)
  — source-bounded product and research ideas, including the plural identity,
  character, persona, and masks track.
- [`content/text/documents/working-notes/2026-08-20-turntide-islands-synthesis.md`](content/text/documents/working-notes/2026-08-20-turntide-islands-synthesis.md)
  — a working synthesis of the 2026-08-20 repair-and-recon campaign:
  Turntide's three-descriptions framing (philosophical, technical, social),
  an honest assessment of the machine's state, and the roadmap across
  personas, web presence, product lanes, and the proof-of-adaptation/DAO
  arc.
- [Discord/community research commissioned during that campaign](../../../../../science-services-section/services/engineering-science-services-section/services/computer-science-services-section/services/computer-systems-science-services-section/services/web-science-services-section/services/web-platform-science-services-section/services/web2-platform-science-services-section/services/web2-social-platform-science-services-section/services/discord-science-services-section/content/text/documents/articles/notes/turntide-islands/)
  — platform and community study retained in Lenticule Science.
