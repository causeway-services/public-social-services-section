# Koios runtime deployment provenance

This tool does not install or activate a runtime.  It seals a local Guix
closure and OCI archive into a create-only descriptor, then verifies a
materialized target against that descriptor and writes a create-only receipt.
The receipt records an interpreter mismatch rather than concealing it.

```sh
node bin/koios-runtime-provenance.mjs describe \
  --guix-runtime-root /gnu/store/.../libexec/koios-news \
  --guix-wrapper /gnu/store/.../bin/koios-news-routine-operation \
  --oci-archive /gnu/store/...-docker-pack.tar.gz --out /absolute/descriptor.json

node bin/koios-runtime-provenance.mjs verify \
  --target-root /home/emsenn/services/koios-news-runtime \
  --descriptor /absolute/descriptor.json --oci-archive /absolute/carrier.tar.gz \
  --selected-node /absolute/node --at 2026-08-30T14:43:05.000Z \
  --receipt /absolute/new-receipt.json
```

Both `--out` and `--receipt` must be absent absolute paths; they are opened
with create-exclusive mode and written `0600`.  A descriptor binds the target
package, selected operation closure, Guix wrapper and interpreter, and OCI
archive bytes.  Verification refuses file, symlink, descriptor, or archive
drift.  It reports, but does not hide, an interpreter identity mismatch.

Run `npm run verify` for focused checks.
