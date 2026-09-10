# Koios routine-publication candidate (current)

This is the smallest offline operation that promotes one already-admitted Koios
Markdown draft into a deterministic static candidate.
It is dry-run by default.
It never invokes an inference provider, reads credentials, mutates the source
draft, contacts a network service, schedules work, or deploys to Cloudflare.

The corpus root, draft, admission record, signed publication grant, independently
configured public-key map, verification instant, offline production-baseline
directory, and output path are always explicit. The baseline is fully verified
before authority consumption and its schema, manifest digest, and artifact count
are bound into the plan and receipt.
The draft must be a regular direct child of that root; the static-delivery
contract consumes Markdown posts at that level.

```sh
# Read-only: validates the exact draft/admission binding and describes the candidate.
node bin/koios-news-routine-publication.mjs \
  --content /absolute/path/to/koios-content/posts \
  --draft /absolute/path/to/story.md \
  --admission /absolute/path/to/editorial-acceptance.json \
  --authority-grant /absolute/path/to/signed-publication-grant.json \
  --authority-keys /absolute/path/to/trusted-public-keys.json \
  --authority-now 2026-08-29T12:00:00.000Z \
  --production-baseline /offline/production/koios.news \
  --out /absolute/path/to/candidate

# Only this opt-in writes an offline candidate.
node bin/koios-news-routine-publication.mjs \
  --content /absolute/path/to/koios-content/posts \
  --draft /absolute/path/to/story.md \
  --admission /absolute/path/to/editorial-acceptance.json \
  --authority-grant /absolute/path/to/signed-publication-grant.json \
  --authority-keys /absolute/path/to/trusted-public-keys.json \
  --authority-now 2026-08-29T12:00:00.000Z \
  --production-baseline /offline/production/koios.news \
  --out /absolute/path/to/candidate \
  --replay-root /absolute/path/to/durable-authority-replay \
  --write
```

The admission document must be one JSON record from the current Koios
editorial-judgments ledger, copied without interpretation.
It must bind the exact SHA-256 of the draft and state all of:

```json
{
  "slug": "story",
  "manuscriptDigest": "sha256:<exact draft digest>",
  "disposition": "accept",
  "publishable": true,
  "serviceAccepted": true,
  "contract": "ni:///sha-256;GTSsfC0lmcjPLQvtlGmYwLJLCa9pirz1d8oUqRweioo",
  "selectedTool": "submit_editorial_acceptance",
  "toolSelectionValidated": true,
  "toolSelectionDigest": "<nonempty digest>"
}
```

This is the strict portable projection of the live Koios content gate:
the current application checks the latest matching `editorial-judgments` record
for those exact fields, then makes only the controlled publication-state
transition.
The retained application does **not** expose an independently verifiable,
signed, read-only ledger receipt outside its own customer territory.
The content-gate record alone is insufficient. Candidate formation also
requires a valid Ed25519 grant verified by
`editorial-publication-authority`. An exact-manuscript grant binds the exact
source digest and slug. A standing-policy grant additionally requires the
matching independently signed assessment receipt and its configured public-key
map. Missing, expired, malformed, mismatched, or untrusted authority is refused
before a candidate write. No private key or default trust root is included.

On `--write`, the whole corpus is copied into a temporary projection without
following symlinks; symlinks and special files are refused.
Only the exact relative draft is projected from `draft: true` to `draft: false`.
The complete candidate is staged first.
With `--replace`, a previously marked target is then removed and the staged
directory renamed into place; this is a marked two-phase replacement, not an
atomic directory swap.
It contains the static-delivery carrier beneath `public/` plus a private
root-level `routine-publication-receipt.json`. Pass only `public/` to a delivery
carrier; the receipt and marker contain custody coordinates and are never
public assets.
The plan and receipt record the authenticated grant digest and scope, corpus
digest and file count, source and admission digests, and the one deterministic change: `draft: true` becomes
`draft: false` in a temporary projection.
No source byte is changed.

Every write requires durable replay storage. The carrier stages and seals the
complete candidate first, then atomically creates a mode-0600 authority-use
record with `O_EXCL` and fsync before the final candidate rename. Reusing the
same exact grant/manuscript coordinate is refused, including with `--replace`.

If a process stops after that consumption record is durable but before the
candidate rename (or before the final parent-directory fsync), do not retry
`--write`: it deliberately preserves the marked `.next` candidate and refuses
to discard it. Finalize the exact retained candidate with its durable replay
record instead:

```sh
node bin/koios-news-routine-publication.mjs \
  --recover \
  --out /absolute/path/to/candidate \
  --replay-root /absolute/path/to/durable-authority-replay
```

Recovery checks the marked candidate's receipt-bound consumption coordinate
and exact receipt digest against the durable record. It also verifies the exact
public manifest digest, sealed artifact count, and every declared artifact's
path, byte count, and SHA-256, rejecting undeclared public files. It then
persists the retained tree again and performs only the final rename/fsync. It
does not revalidate, extend, or consume editorial authority, so it remains
available even if the original grant has expired.

```sh
npm run check && npm test
```
