---
title: Execute Command
kind: operator
layer: program
status: someday
derived_from: computer/operator/evaluate-step
uses:
  - program/mud-server/structure/mud-session
  - program/mud-server/structure/mud-command
  - program/mud-server/structure/mud-world-state
produces:
  - program/mud-server/structure/mud-session
  - program/mud-server/structure/mud-world-state
  - computer/structure/computer-failure
---

Applies a validated [MUD Command](../structure/mud-command.md) to the
[MUD World State](../structure/mud-world-state.md) within a
[MUD Session](../structure/mud-session.md).

## Definition
- Inputs: [MUD Session](../structure/mud-session.md) with ready command queue
  and a [MUD Command](../structure/mud-command.md) to execute; world bindings.
- Outputs: updated session and world state, or
  [Computer Failure](../../../computer/structure/computer-failure.md).
- Behaviour:
  1. Check preconditions (permissions, cooldowns, reachability).
  2. Apply world mutation (move, speak, combat, item use) respecting trace
     ordering and measurement/recognition invariants.
  3. Update session bindings (location, effects) and enqueue resulting events.
  4. On failure, emit failure and roll back any partial mutation.

## Invariants
- Subject reduction: world/session remain well-typed under MUD schemas.
- Ordering: execution respects evaluation/trace order; no out-of-order writes.
- Failure atomicity: failures leave world/session unchanged.

## Proof
- Derived from: [Computer Evaluate Step](../../../computer/operator/evaluate-step.md).
- Uses: [MUD Session](../structure/mud-session.md),
  [MUD Command](../structure/mud-command.md),
  [MUD World State](../structure/mud-world-state.md).
- Shows that: refining the computer evaluation step with MUD-specific semantics
  yields safe command execution over the world/session carriers.
