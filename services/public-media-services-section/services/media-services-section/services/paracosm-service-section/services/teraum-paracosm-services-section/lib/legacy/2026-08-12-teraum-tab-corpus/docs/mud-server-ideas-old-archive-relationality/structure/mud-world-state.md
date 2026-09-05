---

name: mud-world-state
kind: structure
layer: program
derived_from: computer/structure/relational-state
uses: []
produces: []
used_by:
  - program/mud-server/operator/execute-command
  - program/mud-server/operator/persist-world
produced_by:
  - program/mud-server/operator/persist-world
---

Program-level projection of the computer relational state into a MUD shard:
rooms, exits, entities, items, and event history as recognitions and relations.

## Definition
- Carrier: projection of [Computer Relational State](../../../computer/structure/relational-state.md)
  containing MUD-specific recognitions (rooms, exits, entities, inventory,
  effects).
- Fields: world graph (rooms/exits), entity registry (players/NPCs), inventory,
  active effects/conditions, event log pointers (for transcripts).
- Access: read/write only through program operators that refine the computer
  kernel (e.g., execute-command, persist-world).

## Invariants
- Type coherence: recognitions stored respect schemas for world topology,
  entities, and items.
- Trace order: updates follow the evaluation/trace order from the computer
  evaluation state; no out-of-order mutations.
- Persistence-ready: state can be serialized via computer snapshots without
  loss of invariants.

## Proof
- Derived from: [Computer Relational State](../../../computer/structure/relational-state.md).
- Shows that: specialising the relational state to MUD recognitions yields a
  world carrier suitable for the MUD server while preserving kernel semantics.
