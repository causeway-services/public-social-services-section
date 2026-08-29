# AGENTS — @emsenn/relating

Relating, operationalized: a paraconsistent, transfinitely-valued linear logic of relations.
The package export map is the categorical surface: exports name domain/codomain classes, extrema/apex carriers, morphisms, and representation boundaries; scripts expose callable morphisms over the same surface.

## Before touching this package

- Read `package.json` — the `description`, `exports`, and `dependencies` are the contract.
- Run `pnpm run verify` before committing.
- Tests are theorem-shaped: the test name is a claim the test proves.

## Public surface

- `@emsenn/relating` (root: ordinary public API apex; rolls up carrier constructors, carrier types, readers, and morphisms)
- `@emsenn/relating/articulating` (+ `/predicating`, `/predicating/geometry`, `/predicating/geometry/spatial`, `/predicating/typed-theory`, `/predicating/positing`, `/predicating/positing/logic`, `/predicating/positing/settling`, `/predicating/positing/settling/geometry`, `/predicating/positing/settling/geometry/temporal`)
- `@emsenn/relating/articulating/predicating/positing/settling/analysis` (+ `/analysis/arithmetic`)
- `@emsenn/relating/analysis` (+ `/analysis/conservation`, `/analysis/differential`, `/analysis/evidence`, `/analysis/laplacian`, `/analysis/spectral`)
- `@emsenn/relating/codecs` (+ `/codecs/exact-number`, `/codecs/html`, `/codecs/path`, and the path leaves under `/codecs/path/object/attribute/file/flatfile/...
  `)
- `@emsenn/relating/holography`

Package binaries expose the POSIX pipeable morphisms; there is no package `./scripts` export.

## Internal module graph (relative imports only — never `@emsenn/relating/*` from within)

The source tree is the category-of-relating spine. There are three top-level source areas:

- `articulating` — the admission base (marks, the token/claim primitives, the utterance, carrier coincidence), and beneath it the whole descent: `predicating` (the predication cell, bilattice-relation, typed-theory, the predication logic, spatial geometry), `predicating/positing` (bilattice charge, fiber algebra, the linear-logic connectives), and `predicating/positing/settling` (closure, ordinal stages, firing, fixed points, cohomology, sections — with `analysis`, `geometry/temporal`, and `dynamics/substitution` hanging off it).
- `codecs` — standalone representation boundaries (node:path only): the path/serialization tree, exact-number, and the HTML/SHP projector.
- `holography` — the generic projection kernel the codecs specialize; imports nothing.

Imports run down the spine (articulating → predicating → positing → settling → analysis/geometry). There is no longer an `algebra`, `logic`, `topology`, `geometry`, or `analysis` top-level directory; each former bucket now lives at the point on the spine that generates it.

## Invariants to preserve

- This package performs no I/O it was not handed (fetch, clock, fs all enter as values).
- No runtime dependency may be added without a corresponding new export or documented rationale.
- `sideEffects: false` — no module-level side effects.
- The settling engine's deepest internals (closure-engine internals, carrier-assembly constructors, set-encoding internals under `src/articulating/predicating/positing/settling`) are not package exports; promote a carrier or morphism to a real public subpath rather than reaching past the curated surface.
