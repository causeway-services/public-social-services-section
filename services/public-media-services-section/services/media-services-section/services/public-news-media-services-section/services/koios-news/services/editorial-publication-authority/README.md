# Koios editorial publication authority

This package only verifies externally issued authority. It has no private-key
handling, key generation, signing operation, issuer registry, policy chooser,
or default trusted key. A caller must independently configure both trust roots.

Grant and assessment files are JSON: recursively lexicographic keys,
no insignificant whitespace, and exactly one final LF. The Ed25519 signature
covers the UTF-8 JSON object with `signature` omitted. Public keys
and signatures are unpadded base64url encodings of respectively 32 and 64 raw
bytes. Key identifiers, grant identifiers, slugs, SHA-256 digests, and UTC
timestamps are deliberately narrow so two implementations cannot silently
reinterpret a signed authority.

Key and signature admission is strict across Node/OpenSSL versions: public keys
and signature `R` values must be non-small-order Ed25519 points, and
the signature scalar must be. This package does not rely on the host
runtime to reject low-order encodings.

`verifyPublicationAuthority` validates a supplied exact manuscript against one
of two signed grants:

- `exact-manuscript` carries the exact manuscript digest and slug.
- `standing-policy` carries a policy digest and additionally requires an
  independently Ed25519-verified accepting assessment receipt for the exact
  manuscript with the same policy digest.

Both grant and assessment have an inclusive `issuedAt` and exclusive
`expiresAt` window. `verifyPublicationAuthority` is read-only and does **not**
grant an effect. An effecting caller must use `consumePublicationAuthority`
with durable atomic `consumeIfUnused(consumptionId)` replay storage; without
that store it fails closed. An exact-manuscript grant has one use coordinate.
A standing policy has one coordinate per exact manuscript digest, so it can
govern routine work while neither reassessment nor receipt replay can publish
the same manuscript twice.

The current `editorial-admission-receipt` service remains a local unsigned
custody proof. It is intentionally not accepted here as an assessment receipt.
`routine-publication-current` continues to form only offline candidates until
its effecting boundary is configured with explicit keys and durable replay
storage.
