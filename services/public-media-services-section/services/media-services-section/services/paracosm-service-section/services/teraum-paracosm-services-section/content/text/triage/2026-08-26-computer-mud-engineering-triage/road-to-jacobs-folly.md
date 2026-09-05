---
type: place
name: "Road to Jacob's Folly"
description: "A stretch of road in the Gloaming of Teraum, leading toward Jacob's Folly."
visual-description: "This is a stretch of road in the Gloaming."
behaviors: [area, gloamer]
in-region: gloaming
---

Designer note: this place is defined in `road-to-jacobs-folly.rkt` but
is not connected to any other place in the qtops region's `#:links`.
The Gloaming's topology routes Central Longroad directly to Jacob's
Folly without an intermediate road. Triage decision needed: wire
this in (Central Longroad → here → Jacob's Folly) or remove.


---

<!-- source: archive/multi-user-dungeon/tab/worlds/teraum-relational-hyperverse-domains/domains/eastlands/domains/gloaming/road-to-jacobs-folly.md -->

## Imported source: archive/multi-user-dungeon/tab/worlds/teraum-relational-hyperverse-domains/domains/eastlands/domains/gloaming/road-to-jacobs-folly.md

---
id: teraum/eastlands/gloaming/road-to-jacobs-folly
name: road in the Gloaming
type: area
base:
  - teraum/eastlands/gloaming/outdoor-area
description: "This is a thin path in the Gloaming, leading from the Longroad to Jacob's Folly."
exits:
  east: teraum/eastlands/gloaming/jacobs-folly/outside
  southwest: teraum/eastlands/gloaming/south-longroad
---


---

<!-- source: archive/multi-user-dungeon/tab/worlds/teraum-relational-hyperverse-personal/domains/eastlands/domains/gloaming/road-to-jacobs-folly.md -->

## Imported source: archive/multi-user-dungeon/tab/worlds/teraum-relational-hyperverse-personal/domains/eastlands/domains/gloaming/road-to-jacobs-folly.md

---

name: road in the Gloaming
locates: area
base:
  - teraum/eastlands/gloaming/outdoor-area
description: "This is a thin path in the Gloaming, leading from the Longroad to Jacob's Folly."
exits:
  east: teraum/eastlands/gloaming/jacobs-folly/outside
  southwest: teraum/eastlands/gloaming/south-longroad
---
