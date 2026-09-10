---
title: "Teraum — an open-world RPG library in pure FARS"
part-of: paradigm-applications
serves: [ordering-first-computation, sunday-funday-sprint]
description: "The world of Teraum encoded as FARS entities. Rooms, NPCs, items, and quests are markdown files with predicates. Navigation is messaging. Looking is an empty message. The world IS the graph."
source-material:
  - operations/command/personnel/emsenn/projects/writing/fiction/teraum/
  - operations/engineering/triage/content/relationality/triage/relational-hyperverse/domains/src/domains/toys/domains/teraum/
theory-source: operations/command/ideas/predication-world-sim.md
---

# Teraum on FARS

The world of Teraum — emsenn's fictional setting — encoded as pure FARS predication. No game engine, no rule processor, no special code. Rooms are entities. Exits are predicates. Navigation is `message(room, {go: direction})`. Looking is `message(room)`.

The MUD room files already exist in the relational-hyperverse triage. The encyclopedia entries exist in emsenn's writing project. This research project brings them together as a FARS world — demonstrating that the predication algebra can run an open-world RPG with zero domain-specific code.
