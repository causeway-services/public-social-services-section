---

title: MUD Transcript
kind: structure
layer: program
derived_from: computer/structure/computer-snapshot
uses: []
produces: []
used_by:
  - program/mud-server/operator/persist-world
  - program/mud-server/operator/execute-command
produced_by:
  - program/mud-server/operator/persist-world
---

Program-level snapshot/transcript carrier capturing ordered events and state
changes for replay/audit.

## Definition
- Carrier: derived from [Computer Snapshot](../../../computer/structure/computer-snapshot.md),
  extended with an ordered log of commands, results, and world deltas.
- Fields: snapshot id/hash, timestamp, provenance, world state digest,
  ordered events (command + outcome), and integrity hash.
- Purpose: support persistence, crash recovery, and replay for debugging or
  storytelling.

## Invariants
- Order-preserving: events are recorded in evaluation/trace order.
- Integrity: hashes cover world digest + event log; verifies on load.
- Replayable: applying the log to the referenced snapshot reproduces the world
  state up to observational equivalence.

## Proof
- Derived from: [Computer Snapshot](../../../computer/structure/computer-snapshot.md).
- Shows that: extending snapshots with ordered events yields a replayable
  transcript that remains consistent with computer storage semantics.
