# Paracosms

Imaginary worlds maintained as structured corpora. Markdown bodies for
prose, YAML frontmatter for engine-consumable structure. Each paracosm
is a directory tree under this root.

A paracosm here is a sustained imaginative engagement plus a self-
consistent fictional reality that generates narratives — both psychological
paracosm and literary secondary world. The directory layout makes that
reality navigable; [the schema](SCHEMA.md) makes it parseable.

## Current paracosms

- [`emsean-paracosm/`](emsean-paracosm/) — the speculative world
  accompanying the research program. Currently two regions:
  [Teraum](emsean-paracosm/teraum/) and [Okaga](emsean-paracosm/okaga/).
- [`groundhog-autonomous-zone/`](groundhog-autonomous-zone/) — a separate
  paracosm grown out of personal logs, conversations, and lived imaginary
  practice. Different content shape from the emsean paracosm.
- [`hevi-mala/`](hevi-mala/) — fiction project centered on a clinic and
  relay outpost (Markaz 9) in the Hala Basin, a fictionalized post-2011
  northeast-Syria border region. Worlding-guide complete; first story
  ("Radio Silence") in.
- [`durham-2030/`](durham-2030/) — speculative fiction setting:
  Durham, NC in 2030 under TESCREAL-arcology governance. Written
  winter 2023.
- [`earth/`](earth/) — paracosm of stories grounded in the real Earth
  (folktales, fictions in actual locations). Currently a seed entry.

## Layout

Every paracosm follows the same kind-of-thing layout:

    <paracosm>/
      README.md
      terms/   — paracosm-wide vocabulary
      texts/   — paracosm-wide narratives, lore, cosmology
      <region>/                       (optional, for paracosms with regions)
        places/   beings/   things/   terms/   texts/

`terms/` and `texts/` appear at both paracosm and region levels. Paracosm-
wide material (cosmology, language families, cross-region lore) lives at
the outer level; region-local glossary and prose at the inner.

Leaf directories (`places/`, `beings/`, `things/`, etc.) come into being
when their first entry is written. Don't pre-create empty ones.

## Consumers

The same source files feed multiple consumers:

- **MUD engines** ([TAB](../../../engineering/toys/tab/) for Fennel,
  [qtOps](../../../engineering/toys/qtops/) for Racket) parse frontmatter
  into runtime entities.
- **Hugo** renders entries as web pages, body prose visible.
- **MASH** witnesses each frontmatter field as a (subject, predicate,
  object) claim into the substrate.

A new entry doesn't choose its consumers; the schema specifies what each
consumer reads.
