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
