---
title: "Rebuild Teraum and Okaga as predication library worlds — the first paradigm application content"
specialization: idea
date-created: 2026-04-06
source: captain-directive-sunday-funday
serves: [paradigm-applications, ordering-first-computation]
related-ideas:
  - predication-world-sim
  - zork-and-rogue-on-fars
  - predication-native-simulation
related-projects:
  - teraum-relational-mud
  - relational-mud
existing-content:
  encyclopedia: operations/command/personnel/emsenn/projects/writing/fiction/teraum/encyclopedia/
  adventures: operations/command/personnel/emsenn/projects/writing/fiction/teraum/adventures/
  narrator-agent: operations/command/personnel/emsenn/projects/writing/fiction/teraum/agents/teraum-narrator-agent.md
  okaga-fiction: operations/command/personnel/emsenn/projects/writing/fiction/okaga/
  racket-domains: operations/command/personnel/emsenn/projects/archive/emsops-qtmud-library/theories/teraum/
  racket-qualities: operations/command/personnel/emsenn/projects/archive/emsops-qtmud-library/qualities/
  worldbuilding-exercises: operations/command/personnel/emsenn/triage/writing-exercises/30-days-of-world-building.md
  tab-engine: operations/engineering/toys/tab/
  qtops-engine: operations/engineering/toys/qtops/
  triage-teraum: operations/command/personnel/emsenn/triage/teraum.md
---

## The idea

Teraum (the fantasy world with cities, regions, magic, calendars, races) and Okaga (the more personal fiction) already exist as content scattered across the repo — encyclopedia entries, Racket MUD domain code, worldbuilding exercises, fiction drafts. Rebuild them as predication library content where every entity (place, person, object, time, concept) is a markdown file with rich frontmatter that FARS can compute over.

This makes them:
1. **The first world content for the predication world sim** — playable environments running entirely on respond()
2. **Proof that the library structure works for fiction** — if Teraum's geography, magic system, and calendar work as FARS entities, any world does
3. **A convergent enrichment target** — enriching Teraum entities exercises the same algebra that enriching operational entities does, but with more creative freedom
4. **Published content** — the Hugo pipeline can render Teraum as a navigable website, the MUD interface can render it as a playable world, same FARS entities either way

## What exists

**Teraum encyclopedia** (personnel/emsenn/projects/writing/fiction/teraum/encyclopedia/):
- Places: halfling-country, teraumian-city, teraumian-continent, teraumian-region
- Times: teraumian calendar, seasons, solstices, equinoxes, year, month, day, Red Union calendar
- Terms: teraumian magic, teraumian geography
- Chronology text
- A narrator agent definition

**Teraum MUD domains** (archive/emsops-qtmud-library/theories/teraum/):
- Green Delta region with Ack city, Bellybrush town
- Gloaming region with Belcaer
- Cut region
- Qualities: Ackian, Deltan, Gloamer, Sherwyn, Stepper, Brusher, etc. — these ARE predication fibers in Racket

**Okaga** (personnel/emsenn/projects/writing/fiction/okaga/):
- Paracosm notes, fiction drafts

**TAB engine** (toys/tab/): the Fennel MUD engine that ran a version of Teraum
**qtOps engine** (toys/qtops/): the Racket MUD engine with Teraum qualities

## What "rebuild as predication library" means

Each Teraum entity becomes a library term or text at `library/theories/humanities/theories/media/theories/literature/theories/teraum/`:
- Places as terms with frontmatter: exits, contents, descriptions, climate, government
- People/races as terms with frontmatter: abilities, cultures, territories
- Magic system as terms with algebra: what composes with what, what restricts what — this IS ⊙/⇒
- Calendar as terms with temporal structure: seasons as predicates on time entities
- History as texts grounded in the chronology

The Racket qualities (ackian.rkt, deltan.rkt, etc.) translate directly to predicates. `(<>ackian thing)` in qtOps = adding Ackian predicates to an entity's fiber. The composition `(<>ackian (<>deltan thing))` = ⊙ on two quality fibers. It's the same algebra in a different language.

## Connection to the world sim

Once Teraum entities are FARS entities with rich fibers:
- `respond(ack-city, {action: "look"})` describes the city from its predicates
- `respond(player, {enters: ack-city})` composes the player's fiber with the city's
- `respond(magic-spell, {cast-on: target})` computes the spell's effect via ⊙/⇒
- The MUD is just respond() + a text renderer

And Teraum's magic system is the perfect test case for the algebra — if "fire spell meets water shield" computes correctly via ⊙/⇒ on elemental predicates, the algebra handles domain-specific composition.
