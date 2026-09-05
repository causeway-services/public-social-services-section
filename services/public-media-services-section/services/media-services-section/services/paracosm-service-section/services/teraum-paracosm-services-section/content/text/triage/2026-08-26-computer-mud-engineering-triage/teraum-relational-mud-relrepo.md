---
title: "Teraum — the Relational MUD"
specialization: project
date-created: 2026-04-05
serves: paradigm-applications
goal:
  - paradigm-applications
campaign: prove-the-paradigm
serves-system: application
scope: application
absorbs:
  - operations/engineering/triage/software/teraum-racket-mud/
  - operations/engineering/triage/content/relationality/triage/relational-hyperverse/domains/src/domains/toys/domains/teraum/
entity-types: [room, object, npc, player, region]
channels: [world-tick, player-input, room-broadcast]
requires-from-substrate: [telnet-or-websocket-server, input-parser, respond-primitive, entity-type-declaration, room-migration-from-racket]
scaling-path: [5-rooms, full-ack-city, green-delta-region, npcs-with-dialog, crafting-economy, multiplayer, federated-world-state]
paradigm-features: [navigation-as-graph-traversal, look-as-fiber-query, take-as-predication-reduction, dialog-as-respond, world-as-tower, capability-mixin]
existing-content: "dozens of room files in triage as markdown; full Racket implementation; Ack city, Arathel county, Green Delta mapped"
enabled-by: mash-tui
---

**room**: Required: description, exits (list of `direction: room-ref` pairs as flat keys — `exit-north: room-ref`, `exit-south: room-ref`), contains (list of object/npc refs). Optional: region-ref, ambient-text, light-level.
**object**: Required: description, location-ref (room or player inventory), takeable (boolean). Optional: weight, use-effect, properties.
**npc**: Required: description, location-ref, dialog (reference to dialog-tree entity or inline response). Optional: inventory, behaviors, movement-pattern.
**player**: Required: name, location-ref. Session-linked — player entity created on connect, location updated on move, inventory updated on take/drop.
**region**: Required: description, contains (list of room-refs). Optional: climate, governance, history, map-coordinates.

Exit encoding (flat, EAVT-compatible): `exit-north: tavern`, `exit-south: market-square`, `exit-up: rooftop`. Each is a single predicate. Navigation = follow the exit-predicate matching the player's direction command.

"Look" = query room's fiber: return description + exits + contains. "Take X" = check X.takeable, move X.location from room to player. "Talk to NPC" = `respond(npc, {channel: dialog, payload: player-message})`. All three operations use the substrate's existing primitives.

Absorbed from triage: the Racket implementation has a full world-map (Ack wards: Brass, Dock, Copper, Red, Tin, North, Squash, Sugar Heights; Bellybrush village; Arathel county; Green Delta region; Castle Oru; Helmets Dent; Culver Estate; Jacob's Folly; Gloaming), object definitions, and room interconnections. Migration = convert Racket room structs to FARS markdown+frontmatter, preserving exits/descriptions/objects. The relational-hyperverse triage already has many rooms AS markdown — these need frontmatter standardization, not rewriting.

## Consolidated material from teraum-relational-mud-old-archive.md

Structured claims from source frontmatter:

```yaml
name: teraum-relational-mud
specialization: project
date-created: 2026-04-05
serves: paradigm-applications
goal:
  - paradigm-applications
campaign: prove-the-paradigm
serves-system: application
scope: application
absorbs:
  - operations/engineering/triage/software/teraum-racket-mud/
  - operations/engineering/triage/content/relationality/triage/relational-hyperverse/domains/src/domains/toys/domains/teraum/
entity-types: [room, object, npc, player, region]
channels: [world-tick, player-input, room-broadcast]
requires-from-substrate: [telnet-or-websocket-server, input-parser, respond-primitive, entity-type-declaration, room-migration-from-racket]
scaling-path: [5-rooms, full-ack-city, green-delta-region, npcs-with-dialog, crafting-economy, multiplayer, federated-world-state]
paradigm-features: [navigation-as-graph-traversal, look-as-fiber-query, take-as-predication-reduction, dialog-as-respond, world-as-tower, capability-mixin]
existing-content: "dozens of room files in triage as markdown; full Racket implementation; Ack city, Arathel county, Green Delta mapped"
enabled-by: mash-tui
```
