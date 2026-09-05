# Teraum

A region of the [emsean paracosm](../README.md). The most code-developed
of the regions: there is content in the Racket
[`qtops/archive/teraum-mud/`](../../../engineering/toys/qtops/archive/teraum-mud/)
and [`qtops/archive/teraum-racket-mud/`](../../../engineering/toys/qtops/archive/teraum-racket-mud/),
Fennel content in [`tab/archive/teraum/`](../../../engineering/toys/tab/archive/teraum/),
and a MASH importer at [`tools/import_teraum.py`](../../../engineering/tools/agentics/mash/tools/import_teraum.py)
plus its lore variant.

This directory will hold the same content extracted from those engine
repos into the markdown+YAML schema, so that one source feeds all
consumers (TAB, qtOps, hugo, MASH).

## Layout

- `places/` — areas, regions, rooms.
- `beings/` — peoples, characters, named NPCs.
- `things/` — objects, items, artifacts.
- `terms/` — Teraum-local vocabulary.
- `texts/` — Teraum-local prose, lore, in-world documents.

See [the schema](../../SCHEMA.md) for entry conventions.
