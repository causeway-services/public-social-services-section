# Koios Node, Guix, and OCI packaging status — 2026-08-29

## Decision

Package the exact scheduler-admitted Koios operation under the repository's
pinned Guix channel. Do not turn the broader provider, editorial, ActivityPub,
Cloudflare, or customer-custody system into one container. Those boundaries
have distinct authorities and mutable state; merging them would obscure rather
than improve the production design.

The resulting Guix package and Docker-format archive are reproducible runtime
carriers only. They contain no private key, credential, signed grant, job,
schedule, accepted provider offer, publication effect, or mutable production
state.

## Proven npm dependency closure

The Koios service-section source is a Node ESM package with tracked
`package.json` and `package-lock.json` files. The read-only
[`dependency-closure`](../../../../../tools/dependency-closure/README.md)
audit covers all eight active root/provider/release-carrier lockfiles and
verifies all 268 unique SRI-addressed artifact bytes, with zero missing
artifacts. The eighth lock explicitly seats the package-local
`wrangler@4.127.1` Cloudflare effect tool; it is not part of the scheduled
Guix runtime.

The portable-cache exporter writes those bytes and URL index records under
`cache/_cacache`, the path npm 11 gives pacote for a configured `--cache cache`
root. A clean proof on Node `24.19.0` and npm `11.17.0` copied only each tracked
manifest and lockfile into empty directories and completed
`npm ci --offline --ignore-scripts` for the root, all six active providers,
and the Cloudflare carrier. The resulting carrier executable reported exact
Wrangler version `4.127.1`.

A fresh all-platform export was archived twice with bytewise member ordering,
epoch mtimes, and numeric owner/group zero; both 433,704,960-byte builds had
SHA-256
`cc74178b35b98059063e42f80d6037361405161c52661c3c860f6db698d1b028`.
It is installed read-only on Cold Red Gate at
`/home/emsenn/services/koios-news-closures/koios-news-npm-closure-20260829-v2.tar`.
Its remote checksum matched, and an empty-directory Cloudflare-carrier install
completed offline there on Node `24.16.0` and npm `11.13.0`, yielding Wrangler
`4.127.1`. The previous carrier remains present. This proves a portable npm
source/reifier closure; it does not by itself pin the interpreter.

## Proven Guix runtime

The root `channels.scm` pins upstream Guix at
`0bc7063da67b286c7faf1ead87a732be81100550`. Because the host Guix 1.4.0 cannot
directly evaluate that revision, `guix/bootstrap-channels.scm` supplies an
authenticated first hop before the production channel is evaluated.

[`guix/phezi/ochage/packages/koios-news.scm`](../../../../../../../../../../../../../../../../../../../../../guix/phezi/ochage/packages/koios-news.scm)
defines one package with the pinned channel's `node@24.18.0`, Bash, the exact
Koios `package.json`, selected operation, operation configuration, and five
declared runtime files. Source custody is resolved from the module location,
not the caller's working directory. It intentionally performs no npm install:
this selected operation has no third-party runtime imports.

After the package-local static carrier gained deterministic taxonomy, archive,
production-continuity surfaces, and fail-closed XML feed metadata validation,
the package rebuilt successfully as
`/gnu/store/c388any00d4ld3y6dmkm5yzzc34qapnj-koios-news-scheduled-runtime-0.0.7`.
Inspection through ScheduledActivityDelivery reproduced the repository target
exactly:

- package digest: `ni:///sha-256;ohuN9iyYU5FtjXqyMGGpJ_Eabzfp3GjTkh_JcVoMK1o`
- selected-bin digest: `ni:///sha-256;tXHnX4I-Ulux5FO0QH4WpyolBJ92Nsu1lKObfNZSgdo`
- runtime-entry digest: `ni:///sha-256;jrF7_XTfBHBRC2Tw8PEyIKWX1hJdrX-jv-vKL7oRY40`
- static-publication source digest:
  `ni:///sha-256;xVj9UqytLFIG65KX8ztgfzWWGTYmlzGdkVf6XUHASZ0`
- routine-publication source digest:
  `ni:///sha-256;7757YrJ7R5-tuxQvAvu2l5yY_n1byUG5Yqx8A2ZbHGY`
- operation-configuration digest:
  `ni:///sha-256;Sc0nkwI7aU5Dk6RO4cuAazDZpWBpg_I1D33zVuo7wAE`
- runtime-closure digest: `ni:///sha-256;g27xfObrXzsUhpjHjEizZ617M9fRlyzcJ6rLl_4QpMk`

Executing the installed wrapper reached the operation and refused with status
2 because no private job environment was supplied. That is the expected
fail-closed result, not a posting attempt.

The changed runtime entry, configuration, routine publisher, and static
publisher were first installed on Cold Red Gate after a separate rollback copy
of all admitted package/runtime files. Their SHA-256 values are respectively
`8eb17bfd74df0470510b64f0f0f13220a597d6125dad7fa3bfebca2fba11638d`,
`49cd2793023b694e4393a44ee1cb806b30d9a5606983f2350f7df356ea3bc001`,
`efbe7b62b27b479fadbb142f02fbb6979c98fe7d5bc941b962ac7c03665b1c66`,
and `c558fd52acad2c5206eb9297f33b607f359619362697319d9157fa5d41c0499d`.
The remote Scheduler target inspection accepts the installed package as
schedulable and reproduces the package, selected-bin, static-source, and
runtime-closure digests above; the closure contains five declared runtime
files. This is package admission, not schedule activation.
The scheduler preflight still refuses activation: it found zero accepted Koios
schedules and the delivery environment file remains absent or unsafe. No
environment value was read, no schedule was enabled, and no operation ran.

The final custody cutover then staged the Guix package's exact
`libexec/koios-news` tree at a separate path and inspected it through
ScheduledActivityDelivery before changing the target. No user unit, active
process, or cron entry referenced the broader checkout. With the scheduler
disabled and inactive, the 120 MiB clean historical aggregate was atomically
moved intact to
`/home/emsenn/services/koios-news-aggregate-preserved-20260829`, and the 132
KiB minimal tree took the fixed
`/home/emsenn/services/koios-news-runtime` target path. Post-cutover inspection
reproduced every digest above. Direct preflight reached the expected status-2
job-manifest refusal, and structural scheduler preflight remained ready while
activation remained false.

The replacement scheduler carrier was subsequently hardened with Bubblewrap
target isolation. Its admitted process receives the resolved root-owned Node,
timeout, nice, and Bubblewrap executables; the complete immutable package
closure; and admitted inputs as read-only binds. `/home`, `/root`, and
`/run/user` are otherwise hidden, while only the fixed Koios candidate and
replay roots are writable. Cold Red Gate's real user/mount namespace assay
proved all Linux capability sets empty with `NoNewPrivs` set. The staged unit
matches the repository at SHA-256
`ebe96deeac49fe9a46e59d83cf231bcc679c85cbe594096ebe2369e4747756ad`;
its timer remains disabled and inactive, the narrow environment file is
absent, and structural preflight reports zero accepted Koios schedules.
The durability- and recovery-hardened Guix closure was then staged, inspected,
and moved to the fixed target while that timer remained disabled. A
ScheduleDelivery-shaped assay reached only the expected missing-private-job
refusal. The immediately
prior target is retained at
`/home/emsenn/services/koios-news-runtime-pre-recovery-8ff9f869913` and as the
read-only archive `pre-recovery-runtime-8ff9f869913.tar.gz` (SHA-256
`5bf8271e39d2fb0b9bd17f6b2135f80960f2d5ca8b3d695770c08326b4e30ad2`).
The earlier durability cutover target and archive also remain preserved.

## Proven Docker-format carrier

The pinned Guix produced
`/gnu/store/d2qkvijhnzmn7mha3qzz9ywpc7059bhn-koios-news-scheduled-runtime-docker-pack.tar.gz`
with SHA-256
`c37832f16c57a59e635adf84ba85f6327001a7051613428136c216c6b4e79f02`.
Its Docker archive metadata declares Linux/amd64, epoch creation time, tag
`koios-news-scheduled-runtime:latest`, and entrypoint
`/gnu/store/vbh5pavn9fmf1xx66y05bfysdqyl240v-profile/bin/koios-news-routine-operation`.
The layer diff ID is
`sha256:b831d15c401c0700864690e6364caa9c417cb02edaeb8d78910a1f8234fdbcab`.

Docker Desktop was not integrated with this WSL environment, so no daemon load
or registry publication is claimed. Instead, the archive root filesystem was
unpacked and the exact image entrypoint executed under a read-only, isolated
Bubblewrap root. A synthetic ScheduleDelivery-shaped work order reached the
operation and made the same expected status-2 refusal solely because
`KOIOS_NEWS_ROUTINE_PUBLICATION_JOB` was absent. It produced no territory
mutation.

The new archive is installed read-only on Cold Red Gate at
`/home/emsenn/services/koios-news-closures/koios-news-scheduled-runtime-recovery-bound-20260829.tar.gz`;
its remote SHA-256 matched after staged transfer and atomic rename. The
previous carrier remains present. The new carrier is not active there and does
not authorize replacing the current host service.

## Proven production-continuity seed

The observed production manifest remained byte-identical during this work:
SHA-256
`813f4b402896f513d7a2fa0da4ae75937190eb83f67f8525ad5b1acabe48e701`,
with release header
`ni:///sha-256;gT9LQCiW9RPXovoNpK51k3GQ64P2f4UlrVsayr5I5wE` and 417 sealed artifacts.
The minimum standalone current renderer grew from 38 to 224 files, but still
could not preserve 228 of those paths and was correctly rejected by the
release gate.

The retained 2026-07-18 cutover candidate seals 405 artifacts. Every exact
digest could be resolved from retained repository custody even though its
projection directory was sparse. Six exact later-production artifacts not
regenerated by the current renderer were added to form a non-authoritative,
411-artifact continuity seed. Its manifest SHA-256 is
`b5e319371abb7597f0a859d496640ba2b6debacc9c90a44b4d1d3beba6050b39`.
The deterministic 7,372,800-byte archive has SHA-256
`cec1f52d43ecdf4fb774de5dfe4c71336ca17271cb30e0e18f4c5b492c007d3b`
and is installed read-only at
`/home/emsenn/services/koios-news-closures/koios-news-continuity-baseline-20260829.tar`.
Its verified extracted root is
`/home/emsenn/services/koios-news-baselines/koios-continuity-baseline-20260829`.

Overlaying the current 21-post corpus on that seed produced 450 sealed
artifacts with manifest SHA-256
`60aefebfa764022ce97e864603e99df4b78a59a1f63a56d64fb05d63fb8e58d7`.
The Cloudflare carrier accepted it against all 417 paths in the exact observed
production manifest; it adds 33 current taxonomy/archive artifacts, contains
no unsealed staging marker, and discloses no local filesystem paths. This is a
releaseable-shape rehearsal candidate, not an editorial admission, signed
release grant, preview receipt, Cloudflare deployment, or live publication.

## Observed Cloudflare operator state

The exact package-local Wrangler `4.127.1` authenticated through its existing
local OAuth profile to fixed account
`337e54ee6dc7d488933f473204a6d89e`. A read-only deployment listing observed
the current `koios-news-primary` deployment
`1bae7e36-88f7-493e-80b8-ab2d93ad8f50`, whose sole 100 percent version is
`11bfc9a3-4dc3-4069-954a-9b667042ccac`. Its provider annotation carries the
same `ni:///sha-256;gT9LQCiW9RPXovoNpK51k3GQ64P2f4UlrVsayr5I5wE`
release digest returned by the public site.

The authority ceremony's no-effect `rollback-binding` command formed a
mode-0600 binding for that explicitly observed version and reverified it
through the release carrier. This proves current read authority, target
selection, and rollback preparation. It is not a preview/release grant and no
Cloudflare mutation occurred.

## Reproduction boundary

Evaluate the manifest without building:

```sh
TMPDIR=/var/tmp ./guix/check-koios-news-runtime
```

Build the package or Docker-format carrier through both authenticated channel
hops:

```sh
guix time-machine -C guix/bootstrap-channels.scm -- \
  time-machine -C channels.scm -- \
  build -L guix -m guix/manifests/koios-news-runtime.scm

guix time-machine -C guix/bootstrap-channels.scm -- \
  time-machine -C channels.scm -- \
  pack -L guix -f docker \
  -S /bin=bin \
  --entry-point=bin/koios-news-routine-operation \
  -m guix/manifests/koios-news-runtime.scm
```

The profile produced by this manifest has no `/lib` or `/share` entry. An
earlier command spelling with `-S /lib=lib -S /share=share` therefore refuses;
only the existing `/bin` profile entry should be linked into the image.

Archive digests can change when any admitted runtime byte, package revision,
Guix channel, or archive construction input changes. A new digest therefore
requires the same inspection and execution assays. Registry publication, a
live container deployment, and a first authorized end-to-end post remain
separate unperformed operations.
