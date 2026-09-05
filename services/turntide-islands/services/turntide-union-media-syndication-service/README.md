# Turntide Union Media Syndication Service

Turntide's Union Media contract, admissions, clearing, settlement, and
publication capability, independent of the aggregate settlement and the
Discord application. Covers the whole placement/bid/creative/auction path:
admitting a placement request and its creative, opening and clearing an
auction cycle, evaluating and admitting bids, admitting the resource
settlement once transfer and assay are complete, and rendering the placement
once settlement is authorized.

## Install

```sh
npm install
```

Reads resolve through the per-project `.npmrc` (private scopes routed to
Google Artifact Registry's virtual repo).

## Verify

```sh
npm test
```

Runs `node --check` over `src/*.mjs` and `test/*.test.mjs`, then
`node --test test/*.test.mjs`, then `npm pack --dry-run`.

## Exports

- `launchUnionMedia(options = {})` — launches the Union Media capability
  against its content-addressed product.
- `admitUnionMediaPlacementRequest`, `admitUnionMediaCreative`,
  `admitUnionMediaBid`, `admitUnionMediaResourceSettlement` — admission
  functions for each stage of the placement/bid/settlement path.
- `openUnionMediaAuctionCycle`, `clearUnionMediaAuctionCycle`,
  `evaluateUnionMediaBid` — auction cycle lifecycle.
- `deriveUnionMediaLocalNeedsPolicy(observations, input, options = {})` —
  derives a local-needs ranking policy from business evidence observations.
- `renderUnionMediaPlacement(admission, settlementAuthorization)` — renders
  a settled placement.
- `unionMediaLaunchAdmission(product)`, `unionMediaLaunchMessage(product)`
  — launch admission and messaging helpers.
- `UNION_MEDIA_CONTRACT`, `UNION_MEDIA_BID_INGRESS_CONTRACT`,
  `UNION_MEDIA_PLACEMENT_INGRESS_CONTRACT`, `UNION_MEDIA_MARKER`,
  `UNION_MEDIA_PRODUCT_PATH` — the module's fixed contract identities and
  its product content path.

Depends on `@red-cup-engineering/ni-services-section`,
`@red-cup-engineering/semantic-content-identify-service`,
`@causeway-services/turntide-witness-journal-binding-service`, and
`@red-cup-engineering/witness-journal-document-service`.
