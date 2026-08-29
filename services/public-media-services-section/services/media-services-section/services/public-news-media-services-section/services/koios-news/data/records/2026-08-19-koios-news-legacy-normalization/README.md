---
title: "Koios.News legacy normalization"
type: corpus-normalization-record
date: 2026-08-19
status: complete
---

# Koios.News legacy normalization

## Boundary

The package census searched all package manifests below the top-level 561 Group
legacy library for `@emsenn/koios.news`, `@causeway-services/koios-news`, and the Koios
service-section identity. It found the VPS runtime/service witnesses listed
below plus package copies internal to the retained service-section snapshot.
Path and content searches also found Koios articles, Nik Koios persona records,
publication images, and authoring skills in older research/drive corpora. Those
are content or personnel witnesses owned by their existing corpora, not runtime
states, and were not uprooted by this package normalization.

## Retained states

| Destination in `lib/legacy` | Files | Disposition |
| --- | ---: | --- |
| `2026-07-18-vps-runtime` | 925 | Distinct earlier source/runtime with live view data through July 18. |
| `2026-07-18-publication-projections` | 1,058 | Two materially different candidate/shadow public projections, removed from transient dot-directories. |
| `2026-07-19-0055z-persistent-runtime` | 4,923 | Persistent carrier runtime, including its exact installed dependency graph; enriched with the later append-only replay event from the otherwise covered `0048Z` partial witness. Gitlink text was normalized from `.git` to inert `_git` files without changing bytes. |
| `2026-07-19-0350z-deployed-runtime` | 409 | Build-only deployed state; path-subset of the next state but with 25 changed code/configuration payloads. |
| `2026-07-19-0415z-source-runtime` | 515 | First source-bearing state; adds 121 paths and changes the primary-inspection/publication contract. |
| `2026-07-19-0525z-persistent-runtime` | 1,024 | Content/data/store-bearing state with correction-publication contract; adds 603 paths and changes seven source/configuration payloads from `0415Z`. |
| `2026-07-19-0534z-editorial-bridge` | 2 | Unique editorial-assessment and LISS bridge patch, not byte-covered by the later runtime. |
| `2026-07-19-service-section-publication-projections` | 2,645 | Published, candidate, correction-route, and shadow projections removed from service-section temp directories. |
| `2026-07-20-deployment-revisions` | 114 | Meaningful deployed, staged, and editorial-integration code revisions formerly hidden in runtime deployment temp directories. |
| `2026-07-20-runtime` | 2,934 | Later source/runtime state; differs from `0525Z` by 3,759 added, 23 removed, and 587 changed paths before transient projection extraction. |
| `2026-07-20-koios-news-service-section` | 9,160 | Cohesive service/app/domain snapshot, including its internal Koios provider and experimental site topology. |
| `2026-07-20-service-section-deployment-revisions` | 2 | Two distinct admissible-research deployment revisions formerly hidden as staging/backup files. |

The pre-existing Windows member was renamed from
`2026-06-28-koios.news-windows-site` to
`2026-06-28-koios-news-windows-site` so it satisfies the library's dated-name
contract. No external literal address referenced the former name.

## Contraction and carrier coverage

- `koios-news-runtime.partial-20260719T0048Z` had no path absent from the
  persistent runtime after normalizing `_git` spelling. Its two-line contract
  journal is fully present in the retained state, so the partial source was
  retired rather than preserved as a redundant snapshot.
- `koios-persistent-carrier.tar.gz` was unpacked and fully covered before
  retirement. Its Koios tree is present in the retained persistent runtime;
  the sole content difference is the deliberately added replay journal event.
- The carrier's richer, semantically distinct clockkeeper payload was not
  covered by the earlier four-file Linux Time witness. It is retained at Linux
  Time `lib/legacy/2026-07-19-persistent-clockkeeper-service`; its package check
  passes.
- Runtime and service-section `shadow-a` projections were semantically equal to
  `shadow-b` after removing volatile generation instants; their only raw
  changes were generated desk/source timestamps and dependent manifest hashes.
  Only the latter projection was retained. Wrangler's generated three-file
  no-op dry runs and empty `.wrangler` state were retired as reproducible
  process output.
- Empty carrier timestamp directories `20260719T0350Z`, `0415Z`, `0525Z`, and
  `0534Z` were removed. Unrelated carrier ancestry was left intact.

## Verification

- All retained first-party `.mjs` files (excluding vendored dependencies and
  embedded older asset libraries) pass `node --check`.
- All retained first-party `.json` files pass `jq empty`.
- The persistent carrier's Koios payload has zero uncovered paths; its one
  changed journal has all source lines in the enriched target. The partial
  runtime has zero uncovered or changed paths.
- The destination validator reports no duplicate whole snapshots after the
  dated-name repair: 26,147 files, zero errors, and 5,903 shared-payload review
  warnings. Shared files inside meaningfully distinct historical states are
  expected and do not make those whole states redundant.
- Literal scans found no live references to the retired partial, timestamped
  carrier paths, or VPS site address outside retained historical/owner records.
