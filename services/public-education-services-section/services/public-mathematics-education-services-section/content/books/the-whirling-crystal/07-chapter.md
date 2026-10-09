# Chapter 7: The Dervish

Chapter 6 ended with a warning: a J26 territory does not, and cannot on present evidence, iron every discrepancy out to zero. This chapter is about the specific defect the corpus has spent the most formal effort on: a fivefold rotational obstruction, nicknamed the whirling dervish, that a real, machine-checked theorem excludes from ever settling into a lattice at all. Some of what follows is proved outright. Some of it is one of the most carefully guarded open questions in the whole corpus, and this chapter will not blur the line between the two, because the corpus itself did not.

## Why five is different

Ordinary crystals tile the plane with rotational symmetries of order 2, 3, 4, or 6. Order 5 is excluded — this is the crystallographic restriction theorem, familiar from any course that covers wallpaper groups. The corpus formalizes a specific, narrow version of that fact as a family of quadratic surds.

**PROVED.** `Obsmetrologia/Dynamics/Flow/ChromaticTileGap.lean` proves, for a family of path-graph “chromatic tiles” indexed by a coordination number, that the spectral gap of the tile’s Laplacian takes the value `2 - sqrt(d)` for the crystallographic family, where `d` ranges from 1 to 4 and corresponds to tile orders `N` in `{2, 3, 4, 6}`:

``` text
Flow.tile_gap_char_root : (2 - sqrt d)^2 + (4 - d) = 4 * (2 - sqrt d)
```

for `1 <= d <= 4`. The five-site tile’s gap does not fit that family. Its gap is a different quadratic surd, `(3 - sqrt 5) / 2`, satisfying a different characteristic equation with `a = 3` instead of `a = 2`:

``` text
Flow.tile5_gap_char_root : (3 - sqrt 5)^2 + 4 = 6 * (3 - sqrt 5)
```

and the theorem that actually names the exclusion is stated as a conjunction of “this value does not fit the crystallographic family” and “here is its own characteristic equation”:

``` text
Flow.tile5_first_noncrystallographic_quadratic_surd :
    ¬ (5 <= 2 * 2) ∧ (3 - sqrt 5)^2 + 4 = 6 * (3 - sqrt 5)
```

Read that first conjunct literally: it is the statement `¬ (5 <= 4)`, proved by decision procedure. That is the entire crystallographic exclusion, in its exact machine-checked form: the pentagon’s coordination number does not satisfy the bound the crystallographic family’s own construction requires. It is a small, precise fact, and it is proved. It is not a general classification of quasicrystals, not a claim about Penrose tilings, and not a claim about any continuum aperiodic order; the module’s own documentation says so directly. What it establishes is narrower and, for that reason, solid: the pentagon’s gap value is a `sqrt`-constructible number, but not one reachable inside the family that covers the crystallographic orders.

## The disclination that carries it

A crystallographic-restriction theorem about spectral gaps is one thing. A defect that actually lives on a lattice and can be tracked as it moves is another, and the corpus has both.

**PROVED.** `ObsmetrologiaPhysicalScience/CondensedMatter/Defect.lean` builds a concrete triangular-lattice (“hexagonal frame group”) carrier. A frame is a vector in the Eisenstein-integer plane; the rotation `rot` turns it by one sixth of a full turn, and the frame orbit of the base vector `(1, 0)` closes at exactly six applications and no fewer (`Disclination.frame_orbit_six`, `Disclination.frame_orbit_not_before_six`). A six-coordinated site’s boundary loop develops back to the identity — flat, no defect (`Disclination.hex_loop_closes`). A five-coordinated site is a **disclination**: its boundary loop returns the frame rotated by one unit — one quantum of rotational holonomy — and its own boundary loop, iterated, first closes at the *sixth* traversal, not the fifth (`Disclination.five_loop_frame`, `Disclination.five_loop_does_a_six`). A seven-coordinated site carries the opposite charge, and a five-seven pair at zero separation annihilates completely (`Disclination.five_seven_annihilate`). Held apart at a positive separation, the same pair becomes a **dislocation**: trivial rotational holonomy, but a nonzero *translational* holonomy — a genuine Burgers vector, exactly the object Chapter 6 defined carefully — growing linearly in the separation:

``` text
Disclination.dipole_burgers_linear (sep : Nat) :
    develop (dipoleLoop sep) start = ((1, 0), (0, -sep))
```

with the vanishing condition proved as a biconditional, `Disclination.dipole_burgers_zero_iff_contact`, and additivity across a whole configuration of such pairs proved as `Disclination.config_burgers_additive` and `Disclination.config_burgers_zero_iff_contact`.

## The slide, and what it cannot discharge

The corpus also proves a dynamics: a way for a configuration of these paired defects to relax toward the vacuum, one step at a time.

**PROVED.** `slide` moves every separation in a configuration one step closer to contact (`List.map Nat.pred`). The total obstruction — the sum of separations — never increases under a slide (`Disclination.sum_slide_le`), strictly decreases whenever an unannihilated pair remains (`Disclination.sum_slide_lt`), and the fixed points of the slide are exactly the fully annihilated configurations, the vacua (`Disclination.slide_fixed_iff_vacuum`). Iterating the slide for as many steps as the largest separation in a configuration drives the whole configuration’s Burgers vector to zero (`Disclination.slide_collapse`). All four facts are bundled as `Disclination.obstruction_descent`. This is the market of Chapter 6, in its most literal and smallest possible form: a lawful, provably terminating relaxation dynamics on translational content.

Here is the fact that gives this chapter its title. Suppose one five-coordinated disclination is left *unpaired*, with no matching seven-cone anywhere in its configuration. Its rotational charge — the frame rotation, not the translational displacement — is invariant under every stage of the slide, because the slide only edits straight segments, and a straight segment carries no frame rotation at all:

``` text
Disclination.unpaired_disclination_survives_descent (seps : List Nat) :
    (forall k, (develop (unpairedLoop (slideIter k seps)) start).1 = (1, -1))
    /\ (forall k, (develop (unpairedLoop (slideIter k seps)) start).1 ≠ start.1)
    /\ (develop (configLoop (slideIter (seps.foldr max 0) seps)) start).2 = (0, 0)
```

Read plainly: the market’s relaxation dynamics discharges the whole translational content of a configuration of paired defects down to zero — every dipole eventually annihilates — while the one unpaired five-site’s rotational quantum is exactly the same, at every stage, forever. It never returns to the identity frame. The only thing that can discharge it is an opposite, seven-coordinated cone (`Disclination.seven_neutralizes_unpaired`). This is a defect the market’s own relaxation dynamics can detect and price, but provably cannot repair on its own. It is the un-dischargeable whirl. Two of the territory audit’s own requested countermodels — a configuration with `b = 0` and nonzero rotational holonomy, and a candidate for a lawful protected border — are discharged mathematically by this single theorem.

## The pentagon underneath the disclination

The most recent addition to this line of work joins the disclination’s own boundary to a completely different mathematical object: the contextuality scenario used to demonstrate that quantum mechanics cannot be explained by any classical hidden-variable model.

**PROVED.** The five-site’s boundary loop, iterated six times, is thirty unit steps (`iterateLoop 5 6`, thirty entries). `ObsmetrologiaPhysicalScience/QuantumContextuality/DisclinationLink.lean` assigns each of those thirty steps two coordinates: a link coordinate `i mod 5`, naming which of the five cone edges the step traverses, and a frame coordinate `i mod 6`, naming the developed rotational phase. Because `30 = 5 * 6` and the two moduli are coprime, the coordinates are jointly injective and jointly surjective on the thirty steps, realized by an explicit Chinese-remainder witness:

``` text
crtStep(a, b) = (6a + 25b) mod 30
```

The developed state and the frame coordinate determine each other exactly (`DisclinationLink.frame_carries_state`, `DisclinationLink.state_carries_frame`), and consecutive-step adjacency on the thirty-step boundary descends, along the link coordinate, onto a five-cycle graph — and that five-cycle is exactly the KCBS exclusivity graph, the pentagon on which the Klyachko-Can-Binicioglu-Shumovsky contextuality scenario is built:

``` text
DisclinationLink.five_site_link_is_kcbs_pentagon
```

bundles the whole weld: the boundary closes at the sixth traversal, the two coordinates split the boundary exactly, and the KCBS context list is precisely the descended pentagon’s edge list (`DisclinationLink.kcbsContexts_eq_pentagon_edges`). The corpus’s own documentation is careful about what this bundle does and does not establish: “It does not identify the disclination’s holonomy quantum (one *sixth* turn, in the crystallographic frame group) with the D5 obstruction (a *fifth*-turn symmetry). Fivefold coordination is the crystallographic carrier’s registration of the non-crystallographic `d = 5`; that identification is exactly the open node.” Hold that sentence carefully; it is the hinge this whole chapter turns on.

## What KCBS itself proves

**PROVED.** Separately from the disclination, the KCBS pentagon has its own two-sided theorem, proved from scratch in the corpus. On five pairwise-exclusive yes/no measurements arranged on a five-cycle, no classical assignment respecting exclusivity can answer “yes” on more than two of them — the classical independence bound:

``` text
QuantumContextuality.kcbs_classical_bound : trueCount g <= 2
```

proved by decision procedure over all `2^5 = 32` assignments. The quantum-mechanical value realized by measuring the corresponding observables is exactly `sqrt(5)`:

``` text
QuantumContextuality.kcbsQuantumValue_eq_sqrt5 : kcbsQuantumValue = sqrtNat 5
```

and `sqrt(5)` strictly exceeds the classical bound of `2`, proved constructively with an explicit witness of the excess:

``` text
QuantumContextuality.kcbs_quantum_value_exceeds_classical :
    kcbsQuantumValue = sqrtNat 5 /\ 2 < kcbsQuantumValue
```

This is genuine, checked mathematics: the classical bound is a finite combinatorial fact about a five-cycle, and the quantum excess is a constructive real-number inequality, both proved with no hidden gaps.

## The Dervish Recurrence Conjecture

**CONJECTURE.** Before any of the Lean machinery above existed, an earlier note proposed that four apparently unrelated mathematical objects are really four different readouts of one underlying `D5`-equivariant fivefold obstruction, living over the golden field `Q(sqrt 5)`:

1.  the algebraic-geometric Dervish surface (related to the Togliatti quintic, a nodal quintic surface with the maximal 31 ordinary double points, organized in three fivefold families of lines);
2.  the KCBS contextuality pentagon, with contextual excess `sqrt(5) - 2`;
3.  the five-site golden spectral gap `(3 - sqrt 5) / 2 = 2 - phi`, where `phi = (1 + sqrt 5) / 2` is the golden ratio;
4.  Penrose and pentagrid quasicrystalline order, with its characteristic fivefold rotational symmetry and no translational period.

This note names its own status plainly: `research-frontier`. It is a conjecture in the ordinary mathematical sense — a proposed unification with named partial evidence and named missing pieces, not a proved theorem, and not yet even a fully stated one, since it explicitly lacks a formal `D5` carrier, a formal `C5` graph object, and a common golden-field normalization layer. What is documented, at DOCUMENTED grade rather than proved, is two specific numerical identities that make the four readouts look like the same object: the contextual excess `sqrt(5) - 2` equals `phi^(-3)`, and the five-site spectral gap `(3 - sqrt 5) / 2` equals `2 - phi`. Both identities are stated in the corpus; neither is proved in Lean.

## The open node

**OPEN.** Here is the exact shape of the gap between what is proved and what is conjectured, stated as precisely as the corpus states it. Two different fivefold-adjacent structures exist, proved, in this codebase:

- the disclination’s rotational holonomy, whose *own* period is six (it closes at the sixth traversal of a five-edge loop — a sixth-turn conserved quantity carried on a hexagonal frame group), and
- the KCBS pentagon’s contextual excess `sqrt(5) - 2`, which is a genuinely fifth-turn, `D5`-equivariant object.

The proved bridge, `five_site_link_is_kcbs_pentagon`, is a real and useful theorem: it shows that the disclination’s *boundary*, considered purely combinatorially, covers the same five-cycle the KCBS scenario is built on. What it does not do, and does not claim to do, is identify the disclination’s *sixth-turn conserved rotational quantum* with the *D5 fifth-turn obstruction* that gives KCBS its golden-field value. That identification is stated as a named, explicitly unready blueprint node:

``` text
thm:dervish-protected-holonomy
```

in `docs/blueprint/src/chapters/recurring-four/05-the-dervish-recurrence-conjecture.tex`, marked `\notready`. The proof obligation, stated by the note that introduced this bridge, is to construct “a golden-field valuation of the descended link carrying the conserved sixth-turn deficit to `sqrt(5) - 2`” — and the same note is explicit that “a countermodel is an acceptable and valuable result,” meaning the identification could turn out to be false, and that would itself be a genuine contribution.

This is the filed contradiction this chapter promised at the start. A different note in the corpus, “Relational Physics of Coordination” (2026-07-25), states flatly: “The disclination’s fivefold rotational defect is a protected holonomy: a topological defect that the market’s slide relaxation dynamics can detect but provably cannot discharge,” treating the fifth-turn identification as settled fact, without the hedge the 2026-07-19 note insists on. The 2026-07-19 note that actually built the bridge theorem is unambiguous that the identification is not ready. This book follows the more careful of the two: the disclination does survive descent, provably, and its surviving charge is a sixth-turn quantity; whether that sixth-turn quantity *is*, under some golden-field valuation, the same object as the KCBS pentagon’s fifth-turn contextual excess remains an open question with a named, not-yet-proved theorem statement.

## Sovereign whirl

**DOCUMENTED.** What the proved half of this chapter licenses, independent of how the open node resolves, is a genuine constitutional distinction. The territory’s own crystallographic symmetry law excludes order-five rotation; inside a settled territory, that exclusion reappears as a disclination whose rotational charge the relaxation dynamics can detect but cannot discharge. Something has to decide whether that surviving charge counts as damage — a flaw to keep grinding at — or as a protected border, a lawful seam the territory is obliged to hold rather than repair away. The mathematics forces the choice to be made; it does not make the choice. That is a constitutional act, not a mathematical one, and the corpus is explicit that it belongs to the founder. The note that proved the disclination-KCBS link puts the stakes this way:

> The organizational reading, kept at its honest strength: the market of the territory conjecture is defect discovery plus selective relaxation of what is classified repairable. The dervish-typed obstruction is the standing candidate for what must be classified protected — sovereign whirl at a named seam — because the mathematics already shows the relaxation dynamics cannot touch it. Perfect harmony, on the audit’s own slogan, is not the death of the dervish; it is the territory holding its dervishes at named seams.

## The one honest caveat

**OPEN.** One more thing has to be said plainly before this chapter closes, because it is easy to read the descent theorems above as more general than they are. The toy carrier used throughout this chapter gives every separation a single sign: it is a list of natural numbers, never signed integers, so the additivity theorem (`config_burgers_zero_iff_contact`) can only prove “total zero if and only if every individual separation is zero” — it cannot address whether unlike-signed defects, which this carrier cannot even represent, might cancel in aggregate while leaving real local damage behind. This is exactly Deliverable 5.18 of the territory audit, named there and still open: a genuinely vectorial defect carrier, capable of holding both positive and negative displacements, would be needed to settle that question, and no such carrier exists in this corpus yet. Nothing in this chapter should be read as ruling that possibility out.

## Ledger

| Claim                                                                                                                                                                                        | Grade                                                        | Exact theorem, module, or carrier                                                                                                             |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| The five-site tile gap `(3 - sqrt 5)/2` does not fit the crystallographic family (`d = 5` violates `d <= 4`)                                                                                 | PROVED                                                       | `Obsmetrologia.Flow.tile5_first_noncrystallographic_quadratic_surd`, `ChromaticTileGap.lean`                                                  |
| The crystallographic tile-gap family covers orders `N` in `{2,3,4,6}`                                                                                                                        | PROVED                                                       | `Obsmetrologia.Flow.tile_gap_char_root`, `ChromaticTileGap.lean`                                                                              |
| A six-coordinated site’s boundary loop is flat; a five-coordinated site returns the frame rotated and first closes at the sixth traversal                                                    | PROVED                                                       | `Obsmetrologia.AperiodicOrder.Defect.Disclination.hex_loop_closes`, `five_loop_frame`, `five_loop_does_a_six`, `Defect.lean`                  |
| A zero-separation five-seven pair annihilates; a separated pair is a dislocation with Burgers vector `(0, -sep)`, linear in separation                                                       | PROVED                                                       | `Disclination.five_seven_annihilate`, `dipole_burgers_linear`, `dipole_burgers_zero_iff_contact`                                              |
| The slide dynamics is non-increasing, strictly decreasing off the vacuum, fixed exactly at the vacuum, and collapses to zero Burgers content in finitely many steps                          | PROVED                                                       | `Disclination.sum_slide_le`, `sum_slide_lt`, `slide_fixed_iff_vacuum`, `slide_collapse`, `obstruction_descent`                                |
| An unpaired disclination’s rotational charge survives every stage of the slide descent and is never discharged except by an opposite cone                                                    | PROVED                                                       | `Disclination.unpaired_disclination_survives_descent`, `seven_neutralizes_unpaired`                                                           |
| The disclination’s thirty-step boundary splits into commuting link (mod 5) and frame (mod 6) coordinates, jointly injective and surjective, via `crtStep(a,b) = (6a+25b) mod 30`             | PROVED                                                       | `DisclinationLink.link_frame_injective`, `link_frame_surjective`, `crtStep`, `DisclinationLink.lean`                                          |
| The disclination’s boundary link descends exactly onto the KCBS pentagon; the KCBS contexts are the pentagon’s edges                                                                         | PROVED (propext only)                                        | `DisclinationLink.five_site_link_is_kcbs_pentagon`, `kcbsContexts_eq_pentagon_edges`                                                          |
| The classical independence bound on the KCBS pentagon is 2                                                                                                                                   | PROVED                                                       | `QuantumContextuality.kcbs_classical_bound`, `KCBS.lean`                                                                                      |
| The KCBS quantum value is exactly `sqrt(5)`, strictly exceeding the classical bound of 2                                                                                                     | PROVED                                                       | `QuantumContextuality.kcbsQuantumValue_eq_sqrt5`, `kcbs_quantum_value_exceeds_classical`, `two_lt_sqrtNat_five`                               |
| Contextual excess `sqrt(5) - 2 = phi^-3`; five-site gap `(3 - sqrt 5)/2 = 2 - phi`                                                                                                           | DOCUMENTED                                                   | `2026-08-16-note-on-561-group-as-meme-beadworkers.md` §3; `2026-07-02-conjecture-on-dervishes.md` §3                                          |
| The Dervish/Togliatti quintic, KCBS pentagon, five-site spectral gap, and Penrose/pentagrid order are four readouts of one `D5`-equivariant obstruction over `Q(sqrt 5)`                     | CONJECTURE                                                   | `2026-07-02-conjecture-on-dervishes.md`, status `research-frontier`                                                                           |
| The disclination’s sixth-turn conserved quantum is the same object as the KCBS pentagon’s fifth-turn `D5` obstruction                                                                        | OPEN                                                         | blueprint node `thm:dervish-protected-holonomy`, `\notready`; `2026-07-19-the-dervish-is-the-territorys-protected-defect.md`                  |
| “The disclination’s fivefold rotational defect is a protected holonomy… the market’s slide relaxation dynamics can detect but provably cannot discharge,” stated without the open-node hedge | DOCUMENTED, contradiction noted (contradicts the item above) | `2026-07-25-note-on-relational-physics-of-coordination.md` §6.2, contradicting `2026-07-19-the-dervish-is-the-territorys-protected-defect.md` |
| “Perfect harmony… is not the death of the dervish; it is the territory holding its dervishes at named seams”                                                                                 | DOCUMENTED                                                   | `2026-07-19-the-dervish-is-the-territorys-protected-defect.md`                                                                                |
| Whether unlike-signed defects can cancel in aggregate while leaving real local damage (a genuinely vectorial carrier is needed to test this)                                                 | OPEN                                                         | Territory audit Deliverable 5.18, `2026-07-18-gyrobifastigial-chu-hoare-territory-audit.md`                                                   |
