# Koios Cloudflare release carrier (current)

This Node-only carrier seals a current static candidate, with file traversal and manifest artifacts in strict bytewise path order. Its default `plan` command is local and does not start Wrangler or contact Cloudflare.

The effecting path executes the exact package-local `wrangler@4.127.1` from
the committed npm lockfile. Install it with `npm ci`. The CLI deliberately has
no executable override, and execution verifies the locked package binary
before consuming one-use authority.

Before requesting a grant or attempting a deployment, run the no-effect local
preflight. It verifies the installed package-local Wrangler and lockfile, the
sealed candidate, fixed binding, and (when supplied) that the candidate retains
all artifacts named by an observed production baseline. It reports whether the
required account-selection variable is missing, matches, or mismatches, but
does not invoke Wrangler, read credentials, or contact Cloudflare. Thus its
`cloudflareAuthorization: not-checked` result is explicitly neither evidence
of absent credentials nor evidence of Cloudflare authentication or authority.

```sh
node bin/koios-news-cloudflare-release.mjs doctor \
  --candidate /absolute/candidate/public \
  --binding content/koios-news-primary-binding.json \
  --production-baseline /absolute/observed-production-manifest.json
```

```sh
node bin/koios-news-cloudflare-release.mjs plan \
  --candidate /absolute/candidate/public \
  --binding content/koios-news-primary-binding.json
```

The binding digest is SHA-256 of the exact binding-file bytes—not reserialized
JSON. A grant is exact JSON carrying an Ed25519 signature. Its scope
binds one action (`preview` or `release`), that binding digest, the exact
candidate-manifest digest, and the complete fixed Cloudflare target. The
signing key must be present in a separately configured trusted-key map; the
carrier has no signing capability. Issued and expiry times are compared only
to the explicit `--now` input, never an ambient process clock.
Rollback records also bind the exact binding bytes.

The checked-in binding is public topology, not a credential or release grant.
Pass only a routine candidate's `public/` directory. Its private marker and
`routine-publication-receipt.json` stay one directory above the Cloudflare
asset root.
The dry-run plan prints exact inert grant and rollback templates with the
candidate and binding digests filled in. An authority holder must still issue
and sign separate preview and release grants; an operator must supply the
observed current production version.

Preview and release require an explicit signed grant, `--authority-keys`,
`--now`, `--replay-root`, a new `--receipt-out`, and `--apply`. Grant use is
reserved as a mode-0600 create-only record and durably synced before Wrangler
starts. A failed command burns that grant rather than making an ambiguous
authority reusable. Wrangler deployments use `--assets` (and release uses
`--route koios.news/*`) with the explicit compatibility date `2026-08-29`;
they never pass `--account-id` or inherit an ambient compatibility date. Before execution, the
carrier requires `CLOUDFLARE_ACCOUNT_ID` to exactly match the fixed account, so
account selection is verified through environment/configuration.

An exit status of zero is not a success receipt. After an authorized effect the
carrier runs the fixed package-local `wrangler deployments list --name
koios-news-primary --json` readback, records its deployment and version IDs,
then requires an explicit observation URL and byte-compares the served
`manifest.json` and every publicly served, non-provider-managed sealed asset
before it writes the immutable success receipt. Directory indexes use
Cloudflare's directory routes, `404.html` is observed at `/404`, and
`_headers` is recorded as deployment configuration rather than a public asset.
The zone-managed `robots.txt` transform is bounded and recorded with its
observed digest and size instead of being falsely claimed as byte-identical to
the uploaded file. Preview URLs remain constrained to `*.workers.dev/`;
release observation is constrained to exactly `https://koios.news/`. A failed
readback or observation still burns the one-use grant and writes no receipt.

`enqueue` is a no-effect handoff for a routine candidate: it requires the
adjacent `routine-publication-receipt.json`, fixed binding, and a
parity-checked baseline, then creates a mode-0600 pending-release envelope.
It carries digests only and grants no preview, release, rollback, or provider
authority.

After a deployed preview is available, make a create-only acceptance receipt with an explicit safe HTTPS URL:

```sh
node bin/koios-news-cloudflare-release.mjs probe --candidate /absolute/candidate --binding binding.json --url https://preview.example.workers.dev/ --receipt-out preview-probe.json
```

The probe accepts only an HTTPS `*.workers.dev` directory URL, refuses redirects,
bounds each response to its sealed byte length with a 15-second request timeout,
and byte-compares `manifest.json` before verifying representative
first/middle/last sealed assets. Release accepts only a receipt that fully binds
the target, exact binding bytes, candidate manifest, and successful probe.
Receipt paths are create-only. Generated rollback syntax is
`wrangler rollback <VERSION_ID> --name koios-news-primary`.

Tests inject an in-memory fetch and command executor; they do not deploy or contact Cloudflare.

Release, unlike preview, also requires `--production-baseline` naming the exact observed live `koios.static-publication-manifest` bytes. Its signed scope carries that SHA-256; every baseline `artifacts[].file` must remain in the candidate (changed bytes are allowed). The current small static-delivery candidate is consequently refused against the observed 417-artifact legacy baseline until a parity-preserving candidate exists. Grants explicitly state `local-operator-admission` and `verifiedProviderAuthority: false`; they are not Cloudflare-side authority evidence.
