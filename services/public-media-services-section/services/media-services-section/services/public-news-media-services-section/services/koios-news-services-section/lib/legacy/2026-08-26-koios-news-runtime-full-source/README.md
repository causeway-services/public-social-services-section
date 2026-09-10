# koios-news

**Koios.News** — a general news publication with systems-analysis depth at **koios.news**, with a contract-driven newsroom and deterministic public surface.
This settlement owns the deployable **site**, its publication policy and corpus,
and the issue operation that hires separately governed newsroom services.

```
koios-news  (this repo)
├─ package.json  @emsenn/koios.news — the served workspace package
├─ producing-content.config.json  content-farm instance configuration
├─ src/          site app, theme, content store read, view counter, the mill
├─ AGENTS.md     "You are Nik Koios" — identity, Koios Thought, voice
├─ working/      the job, as gerunds (each a skill + its tools)
│   ├─ researching/  · writing/  · editing/
├─ memory/       what is true now, across sessions
├─ dev/docs/     dev journal
├─ content/  → koios-news-content   the content store (posts/, authors/, rejected/)
└─ data/     → koios-news-data       logs/ (jsonl traces) + records/ (json)
```

## The public carrier and local renderer (`src/`)

`@emsenn/koios.news` renders the immutable public artifact served by the
Cloudflare Worker `koios-news-primary`. Port 18802 is a local development
preview only; Cold Red Gate is not a public origin, mirror, fallback, or
rollback target for `koios.news`.
It reads the content store — markdown posts with front matter in `content/posts/` — through the front-matter codec, projects each post into a news claim set with witnessed provenance, and serves the full newswire surface set:

- item pages with **NewsArticle JSON-LD** and h-entry microformats, at `/posts/<slug>`
- a summary **homepage** and `/about`
- **RSS** (`/feed.xml`), **Atom** (`/feed.atom`), **JSON Feed** (`/feed.json`), h-feed
- web and Google News **sitemaps**, `robots.txt`, ninjs artifacts
- the public **gate audit** (`/newswire-audit.json`) — every post's editorial evidence
- **ad slots** (render only when `KOIOS_NEWS_AD_CLIENT` is configured) and a **privacy-light view counter**: a `POST /hit` beacon (path + referrer host only — no IPs, no cookies, no identifiers) appending to an append-only trace, folded at `/views.json`

```sh
pnpm --filter @emsenn/koios.news run serve   # local development preview on http://127.0.0.1:18802
pnpm --filter @emsenn/koios.news run verify  # typecheck
pnpm --filter @emsenn/koios.news run deploy:doctor # local/VPS readiness
pnpm --filter @emsenn/koios.news run deploy:plan   # dry-run VPS handoff plan
pnpm --filter @emsenn/koios.news run deploy:stage  # local workspace-subset staging
pnpm --filter @emsenn/koios.news run deploy:rehearse # stage, install, cone-build, clean up
pnpm --filter @emsenn/koios.news run deploy:ship   # dry-run remote rsync/ssh; pass -- --apply to execute
pnpm --filter @emsenn/koios.news run deploy:remote-check # read-only VPS preflight once SSH env exists
pnpm --filter @emsenn/koios.news run deploy:self-check # sequential CLI sanity check
pnpm --filter @emsenn/koios.news run deploy:probe  # wait for the persistent newsroom carrier
```

Env: `KOIOS_NEWS_HOST` / `KOIOS_NEWS_PORT`, `KOIOS_NEWS_AD_CLIENT` (AdSense publisher id), `KOIOS_NEWS_DATA` (view-trace and mill-trace directory).
VPS handoff env: `KOIOS_DEPLOY_HOST`, `KOIOS_DEPLOY_USER`, `KOIOS_DEPLOY_PATH`, and `KOIOS_DEPLOY_SSH_KEY`.
Pass `-- --help` to any `deploy:*` script to read the deploy cockpit modes and path/env options.
Deploy commands also load an untracked package-local `.koios-deploy.env` file when present:

```sh
KOIOS_DEPLOY_HOST=ops.561.group
KOIOS_DEPLOY_USER=koios
KOIOS_DEPLOY_PATH=/srv/koios.news
KOIOS_DEPLOY_SSH_KEY=~/.ssh/koios_news
```

Use `.koios-deploy.env.example` as the tracked template for that local secret file.
Pass `-- --deploy-env <path>` to use a different local file; process environment values override the file.
Relative `KOIOS_DEPLOY_SSH_KEY` values in a deploy env file resolve from that file's directory.
Until those are set, `deploy:plan` stays a dry-run cockpit surface.
`KOIOS_DEPLOY_SSH_KEY` must point to an existing private key path; `~` is expanded.
The Windows deploy cockpit also checks for local `ssh` and `rsync`; `deploy:ship -- --apply` stays blocked until both are available.
On this Windows machine, the working `rsync` path is MSYS2 (`C:\msys64\usr\bin\rsync.exe`); if it disappears, reinstall it with `pacman -S --needed rsync` from MSYS2 and keep `C:\msys64\usr\bin` on `PATH`.
When MSYS2 rsync is used, the deploy plan renders the rsync transport key path as `/c/Users/...` while direct `ssh` preflight commands keep the Windows `C:\Users\...` path.
Workspace sync uses rsync `--relative` so entries like `lib/relating`, `services/http-server`, `sites/koios.news`, and `scripts/deploy-caddy.js` keep their repository paths on the VPS.
`deploy:stage` materializes the computed workspace subset under `.tmp/` without contacting the VPS.
`deploy:stage` uses the same local `rsync` actuator and exclusions as the remote handoff, so staging proves the transfer shape before rehearsal builds anything.
`deploy:doctor` and `deploy:plan` report the git status of the exact workspace source subset that would be synchronized, so deploy review can see dirty root files and package pointers before rsync runs.
Rehearse a staged deploy with `pnpm install --frozen-lockfile`, `pnpm --filter @emsenn/jsnode-ick... run build`, `pnpm --filter @emsenn/koios.news... run build`, and staged `node scripts/deploy-caddy.js --domain ... --skip-build` checks; the ellipses matter because the staged copy intentionally excludes existing package `dist/` directories.
The deploy subset also includes root `scripts/deploy-caddy.js` plus `@emsenn/jsnode-ick`, because JSNode ICK owns the workspace package graph and served JS/Node topology surfaces.
`deploy:rehearse` runs that full local rehearsal and removes the generated `.tmp` stage unless called with `-- --keep-stage`.
`deploy:ship` is apply-gated: without `-- --apply` it reports the local verify, read-only remote path/runtime preflight, `rsync`, post-sync remote workspace shape verification, remote install/build, root `scripts/deploy-caddy.js --domain ... --apply`, and final `systemctl --user restart` commands; with `-- --apply` it refuses to run until all `KOIOS_DEPLOY_*` env vars are valid.
Apply-mode `deploy:ship` also refuses to run from a dirty workspace sync subset unless passed `-- --allow-dirty`, so live deploys require an explicit acknowledgement when local source/package state is unsettled.
The legacy VPS web deploy cockpit is retired. `site-admin.config.json` has no
endpoints, and no Koios systemd web-unit template remains in this package, so
it cannot project either `koios.news` or a Koios subdomain from Cold Red Gate.
Public publication delivery is a separate Cloudflare contract. Persistent
processes on Cold Red Gate are private contracted machinery and return
artifacts or receipts; they do not acquire a public hostname by being durable.
`deploy:remote-check` is a read-only SSH preflight for the configured VPS path, Node/Corepack runtime, synchronized workspace shape, and user services; it stays skipped until the same `KOIOS_DEPLOY_*` env vars are ready.
Use `deploy:self-check` when validating the deploy cockpit itself; it runs help, bad-option, missing-value, dry-run plan, source-gate apply, and `--allow-dirty` source-gate probes sequentially after a single build so Windows does not get multiple `pnpm` processes fighting over the lockfile.

## The mill (`producing-content.config.json`)

The old generic mill remains available as a compatibility instrument. It is no
longer the normal publication scheduler. A routine issue begins when the
separately sovereign Scheduled Activity Delivery Service delivers one exact
publication pulse. Contract the schedule from Koios's own customer side:

```sh
pnpm --filter @emsenn/koios.news run issue:contract-pulser
```

The following raw ingress is a boundary diagnostic, not the normal scheduler.
The publication never fabricates the provider identity:

```sh
printf '%s\n' "$ACTIVITY" | pnpm --filter @emsenn/koios.news run issue:pulse
printf '%s\n' "$ACTIVITY" | pnpm --filter @emsenn/koios.news run newsroom:pulse
```

The issue controller admits the exact policy in
`lib/law/publication-issue-policy.json`, resumes open work before creating more,
and returns one assignment or one typed refusal. It cannot draft, edit,
publish, deploy, or select an inference model. The newsroom runner refuses to
operate without the controller's exact assignment. The controller contract is
`content/contracts/publication-issue-pulse.json`. The admitted provider is
`urn:ame:scheduled-activity-delivery-service`, carrying only the exact
`urn:capability:koios-news:scheduled-issue-pulse:v1` capability. The first
carrier is local stdio and exact package-operation admission; it does not yet
claim remote ActivityPub delivery or cryptographic HTTP actor authentication.

An external clock still has to call the provider's `run-due` operation. That
clock does not author a pulse or receive newsroom authority: it only gives the
provider an instant at which to settle its already accepted schedules.

`producing-content.config.json` still declares sources, seed terms, Search
Console property, voice, gates, content store, and data store. Those are inputs
to publication-owned attention and customer-side service contracts; they are
not authority for the generic content-farm engine to publish by itself.

## The workshop

An agent launched in this repo receives no ambient Editor-in-Chief or scheduler
authority. `AGENTS.md` points to the publication's roster, pulse boundary, and
records. The older skills under `working/`, `memory/`, and `dev/docs/journal/`
remain prior-art and exceptional manual instruments; they are not the routine
newsroom scheduler.

## Cloning everything

```sh
git clone --recurse-submodules git@github.com:emsenn/koios-news.git
```
