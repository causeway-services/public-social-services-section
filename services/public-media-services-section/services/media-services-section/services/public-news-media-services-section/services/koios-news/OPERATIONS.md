# Koios.News current operations

This runbook describes the current packages, not the tombstoned customer
aggregate. Passing a check proves only the boundary named by that check.

## Known production state on 2026-08-29

- `https://koios.news/`, `feed.xml`, `sitemap.xml`, `operations.json`, and
  `newswire-audit.json` respond through Cloudflare. The live sitemap contains
  21 article routes.
- The standalone current static carrier builds the same 21 article-route set
  from the source corpus, but it is not by itself a production-parity carrier.
  The first minimum current build contained 38 files. The improved carrier now
  deterministically projects tags, topics, archive indexes, licenses, feeds,
  and sitemaps and contains 224 files, but the live, richer publication
  manifest seals 417 artifacts. It still lacks 228 baseline artifact paths.
  A verified 411-artifact continuity seed plus current regeneration now forms
  a 450-artifact candidate that retains every live path and passes the exact
  production-baseline gate. Never release the smaller standalone carrier
  merely because its article count matches.
  The Alex Odeh manuscript remains
  `draft: true` because no current authenticated editorial admission for its
  exact bytes was found.
- The retained ActivityPub actor is
  `https://bare-cedar-fog.561.group/actors/koios-news`; its WebFinger, actor,
  inbox custody, SQLite state, and user service are live. The retired
  `https://koios.news/activitypub/actor` identity is not used by the replacement
  scheduler.
- Legacy Clockkeeper custody was preserved and imported into an archival-only
  category. Its OOMing timer is disabled. The replacement ScheduleDelivery
  package and user units are staged on Cold Red Gate, but its timer is
  deliberately disabled and inactive until an accepted current schedule and
  exact target configuration exist.
- No checked-in file is a Cloudflare credential, editorial signature, active
  schedule, or release grant. Do not synthesize one from front matter or old
  aggregate records.
- The current root package advertises a declared, digest-bound
  `koios-news-routine-operation` runtime closure. It validates the exact Cold
  Red Gate provider envelope, reads one fixed local job pointer, keeps trusted
  public-key maps, continuity baseline, and output/replay roots outside that
  job, and can consume a valid Ed25519 publication grant to form one offline
  candidate. The job cannot select or override the baseline. It refuses
  before effects when any job, trust, freshness, admission, or replay condition
  is absent. It never deploys the candidate.
- Cold Red Gate's fixed target path now contains only the minimal Guix-built
  package: `package.json` and the six declared runtime files. The clean
  historical aggregate was moved intact to
  `/home/emsenn/services/koios-news-aggregate-preserved-20260829`; it is
  preservation evidence, not the scheduled target.
- The staged ScheduleDelivery carrier now executes admitted targets inside a
  Bubblewrap user/mount namespace. It exposes the immutable Node/runtime
  closure and admitted input paths read-only, hides unadmitted home and user
  runtime state, and makes only the fixed candidate and replay roots writable.
  Cold Red Gate passed the real namespace/capability assay and installed the
  exact user unit (SHA-256
  `ebe96deeac49fe9a46e59d83cf231bcc679c85cbe594096ebe2369e4747756ad`).
  Its environment file remains absent, it has zero accepted Koios schedules,
  and its timer remains disabled and inactive.

## Verify the local chassis

From this directory with Node 24.19 (minimums are recorded per package):

```sh
npm run check && npm test
npm run check --prefix runtime-current && npm test --prefix runtime-current && npm run inspect --prefix runtime-current
npm run check --prefix routine-publication-current && npm test --prefix routine-publication-current
npm run check --prefix schedule-delivery-activation-current && npm test --prefix schedule-delivery-activation-current
npm run check --prefix static-delivery-current && npm test --prefix static-delivery-current
npm run check --prefix cloudflare-release-current
npm test --prefix cloudflare-release-current
npm run check:wrangler --prefix cloudflare-release-current
npm run check --prefix tools/authority-ceremony-current
npm test --prefix tools/authority-ceremony-current
npm run check --prefix services/editorial-admission-receipt
npm test --prefix services/editorial-admission-receipt
npm pack --dry-run --prefix services/editorial-admission-receipt
npm run check --prefix services/editorial-publication-authority
npm test --prefix services/editorial-publication-authority
npm run check --prefix services/activitypub-retained-inbox-provider && npm test --prefix services/activitypub-retained-inbox-provider && npm pack --dry-run --prefix services/activitypub-retained-inbox-provider
node --test tools/dependency-closure/test/*.test.mjs
node tools/dependency-closure/dependency-closure.mjs audit \
  --manifest /var/tmp/koios-dependency-closure.json
```

The dependency audit currently covers eight active lockfiles and verifies 268
unique SRI-addressed source artifacts. Its all-platform exported npm cache has
also produced clean offline `npm ci --ignore-scripts` installations for the
root, every active lockfile-bearing provider, and the Cloudflare carrier on
Node 24.19/npm 11.17. The latter yields the exact package-local
`wrangler@4.127.1`; the effecting CLI has no caller-selected executable
override. The exact selected operation additionally builds under the pinned
Guix channel with Node 24.18 and as a deterministic Docker-format carrier.
Evaluate that manifest with:

```sh
TMPDIR=/var/tmp ./guix/check-koios-news-runtime
```

The package and image contain only the selected operation closure: no job,
key, credential, grant, schedule, publication authority, or mutable state.
Checksums, build commands, Scheduler digests, and the isolated-entrypoint assay
are recorded in
[`content/notes/2026/08/29/2026-08-29-koios-node-guix-oci-packaging-status.md`](content/notes/2026/08/29/2026-08-29-koios-node-guix-oci-packaging-status.md).
The current static publisher and its new OCI carrier are installed on Cold Red
Gate, but the carrier is inert. Preflight still correctly refuses because no
safe delivery environment or accepted Koios schedule is installed. The
verified continuity root is installed read-only at
`/home/emsenn/services/koios-news-baselines/koios-continuity-baseline-20260829`;
an eventual narrow environment must name it through
`KOIOS_NEWS_ROUTINE_PUBLICATION_BASELINE_ROOT`.

The root suite also contains one integrated fixture rehearsal. It invokes the
actual scheduled operation with a ScheduleDelivery-shaped pulse, forms and
externally signs fixture editorial and action-specific release grants through
the authority-ceremony API, writes the offline candidate, exercises preview
authority consumption, byte-probes an in-memory `workers.dev` representation,
and exercises release plus rollback binding through an injected executor. This
proves composition and separation of the current boundaries without using a
production key, credential, network request, provider schedule, Wrangler
process, or publication effect. It is not evidence of a live release.

## Read-only production audit and alert boundary

Run the production audit with the receipts available to the operator:

```sh
node bin/koios-news-production-audit.mjs \
  --release-receipt /path/to/cloudflare-release-receipt.json \
  --schedule-transition-receipt /path/to/schedule-transition-receipt.json \
  --scheduler-tick /path/to/latest-scheduler-tick.json \
  --backup-receipt /path/to/off-provider-backup-receipt.json \
  --restore-receipt /path/to/fresh-restore-receipt.json
```

The command is read-only and always emits one JSON audit. It checks the live
manifest against the Cloudflare release receipt, samples sealed public assets,
probes the feed, sitemap, operations, newswire audit, ActivityPub actor, and
WebFinger, and checks schedule and recovery receipts. It exits nonzero whenever
`alertRequired` is true, so a timer or monitor can use the exit status without
scraping prose.

An on-provider rollback version is not an off-provider backup. Missing backup
or fresh-restore evidence produces `status: "degraded"`, `recoveryReady: false`,
and a nonzero exit. Backup evidence must be an accepted
`koios.news.off-provider-backup-receipt/v1` bound to the live production
manifest and sealed backup object; restore evidence must be an accepted
`koios.news.fresh-restore-receipt/v1` binding that same production manifest to
the freshly restored manifest. Arbitrary JSON does not satisfy either check.
A scheduler receipt that reports `transport-failure` or a
`targetResponseProblem` remains a failure even if the child process exited zero
and says `offline-candidate-written`; that contradiction needs operator review,
not a green timer dashboard.

Create the recovery evidence in an operator-owned location outside the
activation and Cloudflare trees. Both destination directories and both receipt
paths must be absent; the tool never overwrites them:

```sh
node bin/koios-news-production-recovery.mjs backup \
  --source /path/to/exact/public \
  --backup /operator/backups/koios-news/RELEASE/public \
  --receipt /operator/backups/koios-news/RELEASE/backup-receipt.json

node bin/koios-news-production-recovery.mjs restore \
  --backup /operator/backups/koios-news/RELEASE/public \
  --backup-receipt /operator/backups/koios-news/RELEASE/backup-receipt.json \
  --restore /operator/backups/koios-news/RELEASE/restore-rehearsal/public \
  --receipt /operator/backups/koios-news/RELEASE/restore-receipt.json
```

Backup validates every manifest-sealed artifact, rejects symlinks and extra
files, copies exact bytes, revalidates the copy, and seals the full directory
tree. Restore first revalidates that seal, copies into a fresh directory, then
revalidates every artifact and the full tree before issuing its receipt. These
receipts prove this local copy and rehearsal; they do not by themselves prove
geographic separation or durable retention policy.

## Build a continuity candidate and test the parity gate

Use a new output path:

```sh
node static-delivery-current/bin/koios-news-static-delivery.mjs \
  --content sites/koios.news/content/posts \
  --production-baseline /path/to/verified/koios-continuity-baseline-20260829 \
  --out /var/tmp/koios-static-candidate/public

node cloudflare-release-current/bin/koios-news-cloudflare-release.mjs plan \
  --candidate /var/tmp/koios-static-candidate/public \
  --binding cloudflare-release-current/content/koios-news-primary-binding.json
```

The baseline must be a complete offline directory whose legacy or current
manifest and every sealed byte pass the static carrier's verifier. The
extracted Cold Red Gate seed is read-only; the static carrier copies it into
fresh staging, regenerates current corpus-dependent surfaces, removes its
private staging marker, and seals the complete result. Before any release
ceremony, save the exact live
`https://koios.news/manifest.json` response outside the repository and retain
its observed `x-koios-release` header as evidence. A release plan and grant
must receive those exact bytes through `--production-baseline`. The carrier
rejects release when any path sealed by that legacy baseline is absent from the
candidate. The smaller standalone carrier is expected to refuse; the verified
450-artifact continuity rehearsal retains all 417 live paths.

The static output is not publication authority. For a new article, use
`routine-publication-current` with a `draft: true` source, the exact editorial
record, a signed publication grant, an independently configured public-key
map, and durable replay storage. Its candidate root contains a private marker and
`routine-publication-receipt.json`; only its `public/` child may be passed to
Cloudflare.

## Prepare authority without repository private keys

Use [`tools/authority-ceremony-current`](tools/authority-ceremony-current/README.md)
to create canonical unsigned editorial or action-specific Cloudflare grant
payloads, obtain a signature from an external signing device, attach it only
after verification against an independently configured public-key map, and
form the exact path-only routine job/environment artifacts. It has no
private-key handling and writes mode-0600 create-only artifacts outside this
repository. It does not create an admission, grant, trusted key, schedule, or
Cloudflare credential; an operator must supply each separately.

## Release sequence

The Cloudflare plan prints inert, exact templates for the required signed
release grant and rollback binding. An independent trusted-key map must admit
the Ed25519 issuer, and separate grants must bind the `preview` and `release`
actions, exact candidate manifest bytes, exact binding bytes, fixed target,
canonical validity window, and unique grant IDs. The effecting command also
requires an explicit trusted `--now`, a durable `--replay-root`, and a new
immutable `--receipt-out`; the grant is consumed before Wrangler starts. An
operator must also supply a freshly observed current production version. On
2026-08-29, the package-local Wrangler authenticated through the existing local
OAuth profile and observed version
`11bfc9a3-4dc3-4069-954a-9b667042ccac`; refresh that observation immediately
before a release rather than treating the dated value as permanent. The
carrier additionally requires the real process environment's
`CLOUDFLARE_ACCOUNT_ID` to equal the fixed account; it never prints credentials
or Wrangler output.

1. For a routine-publication candidate, run the no-effect `enqueue` command
   against its `public/` child, adjacent routine receipt, exact binding, and
   production baseline. The create-only mode-0600 envelope binds all four
   digests but grants no provider or release authority.
2. Determine the constrained `*.workers.dev/` URL for the deterministic preview
   worker named by the plan, then run `preview --apply` with that URL, the exact
   candidate, binding, preview-only signed grant, trusted-key map, explicit
   time, durable replay root, and new receipt. After deployment, the carrier
   compares provider readbacks to identify exactly one new 100 percent version
   and byte-probes every sealed asset before writing success evidence.
3. Run the independent `probe` command with that URL and a new receipt path. It refuses
   redirects, has a 15-second request bound, byte-compares the manifest, and
   verifies representative sealed assets.
4. Run `release --apply` with a distinct release-only signed grant, the exact
   observed production manifest supplied as `--production-baseline`, the same
   independently configured key map and replay root, the accepted probe
   receipt, rollback binding, explicit time, and a new receipt path.
5. The release carrier again requires provider readback and byte-probes every
   sealed production asset at exactly `https://koios.news/` before writing its
   immutable success receipt. Independently probe article/feed routes after
   release. If they do not match the candidate, execute only the pre-bound
   positional rollback command.

No release has been performed by this runbook. The package-local Wrangler and
existing Cloudflare OAuth profile now prove read access to the fixed account,
but they are not editorial or release authority and were not used for a
mutation.

## Failed or interrupted delivery recovery

Treat an effecting invocation without its immutable success receipt as
incomplete, including an exit-zero Wrangler process whose later provider
readback or byte probe failed. Do not retry its grant: the carrier consumes it
before Wrangler starts and a failed invocation deliberately burns it. Preserve
the command output, the candidate manifest, the grant/replay record, and any
provider response outside the repository for diagnosis.

If a release may have changed production, first re-observe and save the exact
live `manifest.json`, `x-koios-release` header, and current 100-percent
Cloudflare version. Compare them with the candidate and the prior version
named by the rollback binding. Only if the binding still names the observed
known-good prior version may the operator execute the exact positional
`wrangler rollback <VERSION_ID> --name koios-news-primary` command emitted by
the release plan. Then repeat the production byte probes and retain the new
observation. A stale dated version ID, a Cold Red Gate origin, or an old
rollback binding is never a recovery target.

After any scheduler invocation that is unexpected or fails before a durable
candidate receipt, keep `scheduled-activity-delivery-run-due.timer` disabled
and inactive. Inspect the provider journal and the fixed candidate/replay
roots, correct the missing authority/configuration, run the structural and
full preflight again, and obtain a new accepted schedule before a deliberate
enablement decision. No recovery step authorizes a new publication, preview,
or release grant.

## Routine production state

Koios routine delivery was activated on 2026-08-29 after all of the following
were established together:

1. an exact content admission plus either an Ed25519 exact-manuscript grant or
   a standing-policy grant paired with an independently signed assessment;
2. one package-selected local job manifest, independently configured public
   verification-key maps, the fixed read-only continuity baseline, fixed
   candidate/replay roots, and durable one-use authority consumption;
3. an accepted schedule targeting the retained Koios actor;
4. the narrow ScheduleDelivery environment file and installed Cold Red Gate
   timer; and
5. a separately authorized Cloudflare preview/release boundary, credentials,
   immutable probe receipt, and rollback binding.

The accepted daily schedule is
`ni:///sha-256;0NkBGGd95A3gbBujSkA5V0VxSdnDfyRvv3Q__VZ1tn0`, anchored at
`2026-08-29T14:00:00.000Z` with an 86,400-second interval. The provider timer
is enabled and polls every fifteen minutes. Its first occurrence exposed a
read-only mount-layout error before authority consumption; immutable job inputs
now live beneath the admitted baseline mount, and full activation preflight is
green.

The first live routine publication is the exact Alex Odeh manuscript. Its
production manifest SHA-256 is
`848505c44512087adb114e2ee38bb27c95ff46d292cd95c85ae0dd6d69d197a9`
with 457 sealed artifacts. Cloudflare deployment
`75f82116-93fd-4b8e-bd3b-84a54fda36a3` selected version
`a59429d7-28f3-4f2c-9f5f-c42dfa0cd0ec`; the release receipt binds the exact
candidate, preview probe, preceding production version, provider readback, and
served production observation. Editorial and Cloudflare private keys, grants,
replay records, observations, and receipts remain mode-0600 outside Git under
the operator activation root.

The fixed-job schedule was atomically transitioned to the queue-capable daily
schedule `ni:///sha-256;rtbyUMRWKEX9hbrdy6lFki-7KLvd3KhI5qk1P_1_RPI`, first
due at `2026-08-30T14:00:00.000Z`. Its inspected target binding is package
`ni:///sha-256;0yKUqiN6oBx3OPLC1hlEH_bI75jh8krJrrpXlejffHY`, selected bin
`ni:///sha-256;GT6O4vInCdejn2thcqFIqCq137OIwKsJ3X8abxTMvgI`, and runtime
closure `ni:///sha-256;Y2IXvgUmtT1AtDfxyD3XFrSNkU7ERomL7OPd4Z6uBPs`.
The predecessor was retired in the same provider-owned transition. Cold Red
Gate now selects one immutable routine-job file per pulse, records the claim
under the durable replay root, and keeps retries bound to the same exact job.

The first queued manuscript is the independently admitted and exactly signed
Atlantic mackerel report. Its baseline is the current 457-artifact production
manifest, so forming the next candidate retains the already published Alex
Odeh report. Queue supply still requires fresh reporting, independent
admission, and a finite editorial grant for each story. Cloudflare preview and
release remain a separate effect boundary after offline candidate formation;
do not confuse a healthy content queue with an unattended production release.

The separate [`schedule-delivery-activation-current`](schedule-delivery-activation-current/README.md)
package can form and structurally preflight the current provider-law
solicitation without activating a schedule. A returned provider offer binds
the target package, selected bin, and complete declared runtime closure.
