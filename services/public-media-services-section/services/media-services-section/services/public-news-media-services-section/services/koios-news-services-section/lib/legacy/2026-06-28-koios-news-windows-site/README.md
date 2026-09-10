# koios-news

**Koios.
News** — a collapse-aware news publication at **koios.news**, and an autonomous content mill.
This one repo is three things: the deployable **site** (a served 561-group workspace package), the **mill** that writes it, and the editorial **workshop** around both.

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

## The served site (`src/`)

`@emsenn/koios.news` is a workspace package on the 561.group serving pattern (web-server app, port 18802).
It reads the content store — markdown posts with front matter in `content/posts/` — through the front-matter codec, projects each post into a news claim set with witnessed provenance, and serves the full newswire surface set:

- item pages with **NewsArticle JSON-LD** and h-entry microformats, at `/posts/<slug>`
- a summary **homepage** and `/about`
- **RSS** (`/feed.xml`), **Atom** (`/feed.atom`), **JSON Feed** (`/feed.json`), h-feed
- web and Google News **sitemaps**, `robots.txt`, ninjs artifacts
- the public **gate audit** (`/newswire-audit.json`) — every post's editorial evidence
- **ad slots** (render only when `KOIOS_NEWS_AD_CLIENT` is configured) and a **privacy-light view counter**: a `POST /hit` beacon (path + referrer host only — no IPs, no cookies, no identifiers) appending to an append-only trace, folded at `/views.json`

```sh
pnpm --filter @emsenn/koios.news run serve   # http://127.0.0.1:18802
pnpm --filter @emsenn/koios.news run verify  # typecheck
pnpm --filter @emsenn/koios.news run deploy:doctor # local/VPS readiness
pnpm --filter @emsenn/koios.news run deploy:plan   # dry-run VPS handoff plan
pnpm --filter @emsenn/koios.news run deploy:stage  # local workspace-subset staging
pnpm --filter @emsenn/koios.news run deploy:rehearse # stage, install, cone-build, clean up
pnpm --filter @emsenn/koios.news run deploy:ship   # dry-run remote rsync/ssh; pass -- --apply to execute
pnpm --filter @emsenn/koios.news run deploy:remote-check # read-only VPS preflight once SSH env exists
pnpm --filter @emsenn/koios.news run deploy:self-check # sequential CLI sanity check
pnpm --filter @emsenn/koios.news run deploy:probe  # wait for public/newsroom readiness after restart
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
The root `deploy-caddy` script reads `site-admin.config.json`, so Koios projects both `koios.news` and `newsroom.koios.news` into managed Caddy blocks and systemd user services; ship and remote-check commands use the same endpoint service names for restart/status operations.
`deploy:remote-check` is a read-only SSH preflight for the configured VPS path, Node/Corepack runtime, synchronized workspace shape, and user services; it stays skipped until the same `KOIOS_DEPLOY_*` env vars are ready.
Use `deploy:self-check` when validating the deploy cockpit itself; it runs help, bad-option, missing-value, dry-run plan, source-gate apply, and `--allow-dirty` source-gate probes sequentially after a single build so Windows does not get multiple `pnpm` processes fighting over the lockfile.

## The mill (`producing-content.config.json`)

One cycle is one invocation; recurrence is cron's job:

```sh
pnpm --filter @emsenn/koios.news run mill
```

The cycle is the shared `@emsenn/producing-content/content-farm` engine, with Koios declared as an instance config: seed terms, beat sources, Search Console property, front-matter namespace, voice, model, gates, content store, and data store.
Demand folds seed terms, earned views, Search Console material from `data/records/search-console.json` when present, and coverage decay.
Runs append to `data/logs/mill-runs.jsonl`; records live under `data/records/`.

## The workshop

An agent launched in this repo *is* Nik Koios (the editor).
`AGENTS.md` is the identity; the skills under `working/` are the job for sessions where Nik works a story by hand; `memory/` and `dev/docs/journal/` carry durable state and the narrative record.

## Cloning everything

```sh
git clone --recurse-submodules git@github.com:emsenn/koios-news.git
```
