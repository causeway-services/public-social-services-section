# Completed Migrations

One-shot admission/migration scripts that have already run to completion and
whose target state now exists directly in `services/`. Kept for provenance
(content-addressed URNs, decision-chain assertions) rather than for reuse —
each script hardcodes migration-specific URNs (product/decision/receipt
digests) that only ever resolve against the one ingress record they were
written against.

- `admit-accepted-reporting-product.mjs` — admitted the accepted
  `state-of-harmonious-union-reporting-service` product (14 artifacts) into
  `services/state-of-harmonious-union-reporting-service` after verifying the
  Accept chain (product → decision → decision receipt) against a fixed
  Leader omnibus direction. Idempotent replay guard: on rerun it checks the
  admitted tree's digest against the receipt on file rather than re-admitting.
  Its target (`services/state-of-harmonious-union-reporting-service`) exists
  and is populated, confirming the migration ran. Archived out of
  `lib/management/` on 2026-08-20 as part of repair-plan cleanup (WP-12) —
  nothing in `src/`, `test/`, or any package.json referenced it by filename
  or export.
