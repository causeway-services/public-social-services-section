---
type: place
name: "airlock"
description: "The airlock of the Okaga, with port (on-board, currently open) and starboard (out-board, currently sealed) exits."
visual-description: "This is the airlock of a ship, with exits to port and starboard, on- and out-board respectively. Right now, the port airlock is open, and the starboard airlock is sealed."
behaviors: [area, noisy]
in-region: okaga
exits:
  port: bridge
noises:
  - [1, "A panel on the bulkhead to fore flashes green for a moment."]
---
