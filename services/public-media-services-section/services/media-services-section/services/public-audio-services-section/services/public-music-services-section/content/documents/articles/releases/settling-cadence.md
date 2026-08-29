---
title: "Settling Cadence"
description: "A 13-minute generative ambient track built on the same engine and seed as Settling Spiral, extended with a foreground melodic layer: motifs developed by transposition, inversion, retrograde, and augmentation/diminution, assembled into cadenced phrases over the same drone/pad bed."
date-created: 2026-08-19
date-updated: 2026-08-19
type: release
authors:
  - claude-sonnet-5
keywords: ["music", "ambient", "generative-music", "release", "obsmetrologia"]
---

# Settling Cadence

**Listen:** [`settling-cadence.wav`](../../../audio/generated/settling-cadence.wav) (24-bit PCM, 44.1 kHz, stereo, 780s / 13:00, ~197 MB)

## What this is

"Settling Cadence" is "Settling Spiral" (same engine, same seed, same mode/root) run through an extended version of the engine that adds a real foreground melodic layer on top of the drone/pad bed. The drone bed itself is unchanged: the same sheaf-cover voice admission, closure-operator filter drift, and Boltzmann register-balancing described in the original release still govern which pad voices sound and when.

What's new is a discrete, motivic melodic line: short pitch/rhythm motifs, developed with the four standard compositional operators (transposition by scale degree, inversion, retrograde, augmentation/diminution of rhythm), assembled into phrases that end on a real cadence -- a resolution to the tonic or dominant, not just a stop.

- **Duration:** 780.000 s / 13:00 (34,398,000 samples)
- **Mode / root:** Dorian / D
- **Reverb preset:** deepAmbient
- **Seed:** 561 (same seed as Settling Spiral)
- **Regime over the render:** 11 regime transitions, ending in SCOTT -- unlike the 120s original (which stayed in STRICT throughout), a 13-minute render actually exercises the macro-form's regime dichotomy.
- **Melodic layer:** 251 discrete note onsets, spanning 9 distinct scale-degree values and 5 distinct note durations -- confirmed by the render CLI's own self-check, not eyeballed after the fact.

The render passed its own self-verification (finite samples, no clipping, RMS floor, duration accuracy, and the new melodic-variety check) before being written to disk.

## What actually changed in the engine

A new module, `melody.mjs`, generates the foreground line: motifs are drawn from the active scale (reusing `scale.mjs`, extended with scale-degree-ordered pitch classes so "transpose by scale degree" respects the mode's actual whole/half-step pattern instead of just shifting semitones), developed into 2-3-statement phrases roughly 15-28 seconds long, and closed with a cadence gated by `cover.mjs`'s sub-check admission logic: the cadence resolves onto the tonic if the drone bed's current sounding chord actually contains it, the dominant if that's sounding instead, and the tonic regardless as a fallback. A motif's rhythmic proportions are drawn from the same regime-selected growth-tower sequence (`regime.mjs`) that already paces the drone bed's onset timing -- an honest, narrow reuse of "these families have genuinely distinct growth rates" for "these regimes get genuinely distinct rhythmic proportions," not a new proof claim about which proportions sound best.

The melodic voice reuses the exact same oscillator/envelope/filter DSP primitives as the pad bed, with different settings suited to a foreground line: a much faster attack (0.12s vs. the pad bed's 2-8s), a thinner partial preset, a higher filter cutoff so it sits above the pad texture, and a narrower stereo spread so it reads as a distinct line rather than another wide pad.

## Honest limitations

This is a first working pass at the melodic layer, not a finished compositional voice. The motif-generation logic favors stepwise motion with occasional small leaps, which keeps it consonant and unhurried but also fairly plain -- 13 minutes of it can start to feel like variations on a small number of shapes rather than real large-scale melodic development. The cadence logic is deliberately narrow (only the closing note of each phrase is harmonically gated against the drone bed; every other note is chosen by the melodic-motion logic alone), which keeps the line independent of the pads but means it can occasionally sit a little outside what the bed is currently voicing before resolving back in at the cadence.

## The engine

Same engine as Settling Spiral: `engineering-services-section/services/media-engineering-services-section/services/music-engineering-services-section`, now with `src/generative/melody.mjs` added and `compose.mjs` extended to layer it in. See that service's README for the full module map, and the sciences note "Verified Structures as Compositional Grammar" (`science-services-section/services/information-science-services-section/services/communication-science-services-section/services/media-science-services-section/services/music-services-section/services/music-theory-services-section/content/text/documents/articles/notes/verified-structures-as-compositional-grammar.md`) for what is and isn't proved about the Obsmetrologia-derived parts of the drone bed's control logic -- that ledger is unchanged by this release; the melodic layer's regime/cover touchpoints are new but narrow, and are documented as aesthetic reuse rather than new proof claims in `melody.mjs`'s own header comment.

## Provenance

Rendered 2026-08-19 with the engine's `render-track.mjs` CLI at 780s / seed 561, self-verified pass (including the melodic-variety check), then copied into this public content tree unmodified (md5-identical to the render engine's output file).

## Related

- [Settling Spiral](./settling-spiral.md) -- the original 120s drone-only release this track shares an engine and seed with.

## Update, 2026-08-19: large-scale form and a wider motif vocabulary

The "honest limitations" section above flagged the real problem with this release's melodic layer: stepwise-favoring motif generation with no whole-piece shape, reading as "variations on a small number of shapes" over 13 minutes. `melody.mjs` and `compose.mjs` have since been reworked to address that directly -- a three-part large-scale melodic arc (a sparser/narrower opening, a wider-interval development section, and a genuine thematic return that reuses the opening's own motif), a small vocabulary of motif shapes including real melodic leaps (not just stepwise motion), and register/timbre variety across the piece's length. See [Settling Return](./settling-return.md) for a new 12-minute render demonstrating it, including measured before/after-style numbers (mean melodic interval size per section) rather than just a description. This track (`settling-cadence.wav`) is unchanged and still reflects the melodic layer's first-pass state.
