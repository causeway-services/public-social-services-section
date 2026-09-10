---

name: mud-command
kind: structure
layer: program
derived_from: computer/structure/computer-recognition
uses: []
produces: []
used_by:
  - program/mud-server/operator/parse-command
  - program/mud-server/operator/execute-command
produced_by:
  - program/mud-server/operator/parse-command
---

Program-level command carrier representing a parsed, validated action request
from a session.

## Definition
- Carrier: derived from [Computer Recognition](../../../computer/structure/computer-recognition.md),
  but scoped to the MUD command grammar (verbs, targets, adverbs).
- Fields: verb (move/look/say/etc.), arguments (targets/directions), session
  context (player/entity reference), metadata (timestamp, provenance).
- Purpose: normalize player/NPC input into recognised actions executable over
  the MUD world.

## Invariants
- Validated: commands must be syntactically well-formed and refer to reachable
  entities/rooms.
- Authorised: commands respect session permissions (admin/player).
- Traceable: includes provenance for auditing and transcript replay.

## Proof
- Derived from: [Computer Recognition Carrier](../../../computer/structure/computer-recognition.md).
- Shows that: restricting recognitions to the MUD command grammar yields an
  executable action carrier aligned with the computer recognition semantics.
