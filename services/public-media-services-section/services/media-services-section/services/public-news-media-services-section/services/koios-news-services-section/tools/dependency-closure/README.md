# Koios npm dependency closure

`dependency-closure.mjs` audits only the active Koios root lockfile, the
explicit `cloudflare-release-current/package-lock.json` release-carrier lock,
and the lockfiles of its immediate providers in `services/`. It uses each
lockfile artifact's SRI `integrity` as the identity and verifies the actual
bytes before counting or copying them. It does not use the network or mutate
the cache, Verdaccio storage, or package manifests.

The carrier lock is included because `wrangler@4.127.1` is a package-local
release dependency and must be materialized before an offline carrier install.
The enumeration is intentionally not recursive: adding another nested package
to the closure is an explicit custody decision.

Audit the local npm content cache and write a machine-readable result:

```sh
node tools/dependency-closure/dependency-closure.mjs audit --manifest /tmp/koios-closure-audit.json
```

Create a portable content-addressed bundle only when every locked artifact is
present and verifies:

```sh
node tools/dependency-closure/dependency-closure.mjs export --output /tmp/koios-closure
```

Create the strongest portable npm-cache materialization: the same verified
bytes and one index-v5 record per locked resolved URL:

```sh
node tools/dependency-closure/dependency-closure.mjs export-cache --output /tmp/koios-closure
npm ci --offline --ignore-scripts --cache /tmp/koios-closure/cache
```

The exported npm cache root contains its cacache data at `cache/_cacache`, the
layout npm actually passes to pacote when invoked with `--cache .../cache`.
Existing matching index records are copied verbatim. If the local cache has
verified content but lacks its URL index record, the exporter creates the
minimal deterministic HTTP/cacache record (`time: 0`) from the lock URL,
integrity, and verified byte length; each such record is named in the manifest.
This is an evidence-preserving materialization. Validate it with the target npm
version before relying on it for deployment.

The exporter itself proves exact source-byte closure. A separate clean
`npm ci --offline --ignore-scripts` against the exported cache is required to
prove npm-reifier closure for a particular package, Node, and npm version.

An extracted Verdaccio storage directory can be searched with `--source` or
`--verdaccio-backup`; backup archives (`.tar.zst`) are supported by
`--verdaccio-backup` when GNU tar and zstd are installed. Sources are read-only.
The exporter exits `1` on missing artifacts and records every missing artifact,
its integrity, URL, version, and lockfile locations in the manifest.

Run fixture-only tests with:

```sh
node --test tools/dependency-closure/test/*.test.mjs
```
