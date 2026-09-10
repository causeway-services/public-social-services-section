---
title: Persist World
kind: operator
layer: program
status: someday
derived_from: computer/operator/storage
uses:
  - program/mud-server/structure/mud-world-state
  - program/mud-server/structure/mud-transcript
produces:
  - program/mud-server/structure/mud-transcript
  - computer/structure/computer-failure
---

Saves or restores the [MUD World State](../structure/mud-world-state.md) and
associated [MUD Transcript](../structure/mud-transcript.md) using the computer
storage operator.

## Definition
- Inputs: current world state and transcript descriptor (id/hash).
- Outputs: updated [MUD Transcript](../structure/mud-transcript.md) after save,
  or restored world/transcript on load; otherwise a
  [Computer Failure](../../../computer/structure/computer-failure.md).
- Behaviour:
  - Save: validate world/transcript integrity, invoke computer storage to
    persist snapshot + event log, return updated transcript id/hash.
  - Load: retrieve snapshot + log, verify integrity, reconstruct world state
    and transcript carriers; on failure, emit failure and leave state unchanged.

## Invariants
- Integrity: hashes/digests must match on save/load.
- Fidelity: round-tripping world + transcript yields observationally equivalent
  state.
- Failure purity: failures do not mutate world or transcript.

## Proof
- Derived from: [Computer Storage](../../../computer/operator/storage.md).
- Uses: [MUD World State](../structure/mud-world-state.md) and
  [MUD Transcript](../structure/mud-transcript.md).
- Shows that: refining computer storage with MUD payloads yields persistence
  suitable for the MUD server while preserving kernel semantics.
