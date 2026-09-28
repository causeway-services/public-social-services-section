# Chapter 3: Why Predication Forces Four

Chapter 2 established the shape of a predication cell: a triple, subject, predicate, object, with a valuation assigned separately from the cell itself. This chapter is about what that valuation can actually be worth. The claim this chapter proves is specific and strong: a predication’s result is not free to take any number of values. It is forced, by an argument with six falsifiable steps, into exactly four — no fewer, no more. This is the corpus’s own central result at what it calls the predicating level, and it is worth reading the argument in full, because its force comes from the fact that each step names, explicitly, what would break it.

## Two independent bits of evidence

Start from the plainest possible observation about what happens when you assert or deny something. Support and refutation are not the same signal, and they do not have to arrive together, or at all. You can have positive evidence for a claim with no negative evidence against it. You can have negative evidence with no positive. You can have neither. And, crucially, you can have both — someone asserts it, someone else denies it, and neither report cancels the other. One boolean bit cannot distinguish “nobody has said anything about this” from “somebody said it’s false,” and it cannot distinguish “everyone agrees” from “people disagree.” Two independent bits can:

| evidence pair | reading                |
|---------------|------------------------|
| `(0, 0)`      | unknown / told nothing |
| `(1, 0)`      | held / told true       |
| `(0, 1)`      | denied / told false    |
| `(1, 1)`      | contested / told both  |

**DOCUMENTED** (`Obsmetrologia/Language/Positing/FiberAlgebra.lean` docstring frames this as the settling nuclear quartet’s evidence structure; the four-cell table itself is stated directly in the glass-sponge architecture note, §5, and matches the six-step proof below exactly). This is not yet a proof that four is the *only* possible number of values; it is the observation that motivates looking for one. The proof itself, when the corpus states it formally, goes further:it shows that two independent bits are not merely a convenient encoding, but a forced consequence of what a minimal predication is.

## The six-step proof

The proof lives in a research-journal entry dated May 27, 2026, deep in an early working name for this program’s predication apparatus (`SPOTCOMP`, short for the multi-agent computer platform’s predication library). The entry states plainly what it is:

> “This is the central result of the predicating level. Every other piece of structure at this level (the four predication-cells, the trace, the projection, the settling, the bilattice machinery, the regime tower) is downstream of this result.” (`lib/emsenn/services/561-group/services/engineering-services-section/services/computer-engineering-services-section/services/computer-systems-engineering-services-section/services/agent-computer-system-engineering-services-section/services/agent-computer-platform-system-engineering-services-section/services/multi-agent-computer-platform-system-engineering-services-section/apps/spotcomp/hacking/articulating/library/aperiodic-articulation-category/library/aperiodic-articulation-cell/library/potential-aperiodic-articulation-cell/predicating/docs/dev/journal/2026-05-27-fregean-predication-forces-four-proof.md`)

The note itself grades the argument as settled mathematics, presented as “positive falsifiable plain English”: each of six steps is stated as a positive claim, together with an explicit description of the counter-example that would break it. This book grades the argument **DOCUMENTED** rather than PROVED, because it is a prose forcing argument and not itself a Lean theorem — but two of its direct consequences are independently PROVED in Lean, and this chapter shows exactly which ones below.

**Step 1 — Frege’s result.** Every minimal complete predication has exactly two argument-slots, subject and object, connected by a predicate. The falsifier: exhibit any complete, truth-evaluable predication with zero, one, three, or more slots, where “complete” means it has a truth value and “minimal” means no smaller sub-structure already has one. The proof: a predicate is Frege’s unsaturated function; remove it and there is no function to saturate; remove the subject or the object and that slot stays open, with no truth value possible. All three of subject, predicate, object are necessary and, together, sufficient. Predications with more slots reduce to compositions of binary ones; a unary predicate like “X is red” is the special case of a binary one, “X is-color red.”

**Step 2 — Each slot is binary.** For each argument-position, the position is either filled (saturated) or it is not. There is no third, partial, or fractional option. The falsifier: exhibit an argument- position whose status is neither filled nor unfilled. The proof: saturation is the act of supplying an entity; an entity is either supplied or it is not, and “partial saturation” is not an act that can happen.

**Step 3 — The two slots are independent.** The subject’s saturation status does not constrain the object’s, or vice versa; any combination of the two is realizable. The falsifier: exhibit a binary predicate whose object-slot cannot be filled independently of its subject-slot, for a reason inherent to the slots themselves rather than an incidental typing constraint. The proof: subject and object are structurally distinct, type-asymmetric components of a predicate’s signature — Frege’s own asymmetry theorem — so filling one never constrains the other, and the joint state space is a genuine Cartesian product.

**Step 4 — Two independent binary variables give four joint states.** `(off, off)`, `(on, off)`, `(off, on)`, `(on, on)`. The falsifier: standard arithmetic. `2 × 2 = 4`. The note is explicit that this step is finitary and combinatorial, and that falsifying it falsifies arithmetic itself — the strongest possible ground for a step in an argument.

**Step 5 — None of the four is redundant.** Each joint state is realizable and corresponds to a distinct epistemic state; collapsing any two loses information the others cannot recover. The falsifier: exhibit two of the four states that are interchangeable in every predication without loss. The proof works through the four states concretely: `(off, off)` is ⊥, told nothing — a real state, since a position can exist without being predicated about; `(on, off)` is **t**, told positive, the textbook “true”; `(off, on)` is **f**, told negative, the textbook “false”; and `(on, on)` is ⊤, told both — contradiction-as-recorded-state, distinct from told-nothing because evidence *did* accumulate, just contradictory evidence. The crucial separation: ⊥ and ⊤ are both truth-neutral, but for opposite reasons — no evidence versus contradictory evidence — and a value algebra that conflates them, like classical `{true, false}` or Kleene’s three-valued `{true, false, undefined}` where one “undefined” has to serve as both, cannot hold the distinction.

**Step 6 — The four states carry two independent orders, forming a bilattice.** A knowledge order — how much evidence has accumulated — and a truth order — which direction the evidence points — that disagree on every non-trivial comparison. The falsifier: exhibit a single total order capturing both dimensions at once, or show the two orders coincide. The proof gives both Hasse diagrams directly. Knowledge order: ⊥ ≤ *t*, ⊥ ≤ *f*, *t* ≤ ⊤, *f* ≤ ⊤ — ⊥ least evidence, ⊤ most, *t* and *f* equally informative but different in content, side by side in the middle. Truth order: *f* ≤ ⊥, *f* ≤ ⊤, ⊥ ≤ *t*, ⊤ ≤ *t* — *f* most false, *t* most true, ⊥ and ⊤ both truth-neutral but for opposite reasons, side by side in the middle. `t` and `f` are knowledge-incomparable but truth- comparable; ⊥ and ⊤ are truth-incomparable but knowledge- comparable. No single total order captures both. The structure carrying both orders is Belnap’s bilattice FOUR, and the note cites the exact external result that pins it down uniquely:

> “By Fitting (2002), FOUR is the free bounded distributive bilattice on one generator — minimal, canonical, unique up to isomorphism.” (2026-05-27-fregean-predication-forces-four-proof.md, Step 6)

## Where the corpus’s own Lean anchors this

The six-step argument is prose, not Lean. What Chapter 2’s Lean structure already anchors, and what this chapter’s argument names, is where the truth/knowledge two-order distinction reappears as a machine-checked fact rather than an argued one. The relevant module, already read in full, is `FiberAlgebra.lean`, and its own header states exactly which side of the six-step argument it is formalizing:

> “We also prove **the finding** (`cross_order_not_knowledge_nucleus`): a *truth*-closure is **not** a *knowledge* nucleus — it is not even knowledge-inflationary.” (`lib/emsenn/services/561-group/services/science-services-section/services/information-science-services-section/services/math-services-section/services/obsmetrological-services-section/lib/obsmetrologia/Obsmetrologia/Language/Positing/FiberAlgebra.lean`)

This is the Lean-checked form of Step 6’s claim that the two orders “disagree on every non-trivial comparison”: if a truth-closure — an operation that raises a value toward a truth pole — were secretly also a knowledge nucleus, the two orders would be quietly coupled, and the bigrading Step 6 argues for would collapse into one order wearing two names. The file proves the contravariant truth implication directly:

``` lean
def impT (a c : Obsmetrologia.Charge) : Obsmetrologia.Charge :=
  Obsmetrologia.Charge.ofSlots ((!a.pos) || c.pos) ((!a.neg) && c.neg)

theorem heyting_adj (a b c : Obsmetrologia.Charge) :
    meetT (meetT b a) c = meetT b a ↔ meetT b (impT a c) = b
```

**PROVED** (`Positing.FiberAlgebra.Charge.impT`, `Positing.FiberAlgebra.Charge.heyting_adj`, `FiberAlgebra.lean`). The file then builds the two commuting nuclei on the truth-order fiber — saturating *σ* and transferring *Δ* — and proves the identity that ties a composite nucleus’s fixed points back to each of its two factors:

``` lean
theorem fix_pi_iff (S : FiberNuclearSquare) (v : Valuation) :
    S.pi v = v ↔ (S.j1 v = v ∧ S.j2 v = v)
```

**PROVED** (`Positing.FiberAlgebra.FiberNuclearSquare.fix_pi_iff`, `FiberAlgebra.lean`). And, most directly relevant to this chapter’s argument, the file gives a sharp, concrete counterexample proving the two orders cannot be fused into one:

> “There is a valuation `v` whose truth-closure toward `kBot`… is **not** knowledge-above `v` — a truth-closure fails to be a knowledge nucleus, since it is not knowledge-inflationary.” (`FiberAlgebra.lean`, §7, docstring on `cross_order_not_knowledge_nucleus`)

``` lean
theorem cross_order_not_knowledge_nucleus :
    ∃ v : Valuation, ¬ fLeK v (fun φ => Obsmetrologia.Charge.joinT
      Obsmetrologia.Charge.kBot (v φ))
```

**PROVED** (`Positing.FiberAlgebra.cross_order_not_knowledge_nucleus`, `FiberAlgebra.lean`, witnessed by the sharp charge fact `meetK kTop (joinT kBot kTop) ≠ kTop`). This is the file’s own stated reason the two bilattice orders enter as a **bigrading** — two separate Heyting structures, one per order — rather than as two nuclei living in one shared square: the nuclear quartet’s own nuclei both live within the truth order, and the knowledge order is the orthogonal grade, never a second nucleus on the same algebra. That is a machine-checked fact standing behind the six-step argument’s Step 6, not a restatement of it — the six-step argument reasons about what a minimal predication forces; `FiberAlgebra.lean` proves, on the concrete valuation fiber the corpus actually uses, that the two orders it forces genuinely cannot be collapsed into each other.

## Classical equality, and its paraconsistent twin

Once predicating’s codomain is fixed as FOUR with two orders, the corpus draws a further consequence, stated in a research explanation dated alongside the proof: classical, two-valued equality is not something this system has to assume. It falls out as a theorem, derived from one of the two adjoint systems the two orders each supply:

> “Classical equality is the ≤_(*t*)-Lawvere image of the constant-**t** valuation: \$\$=\_E \\:=\\ \exists_g^t(\mathbf{1}\_q^t), \qquad =\_E(s, o) = \begin{cases} \mathbf{t} & s = o, \\ \mathbf{f} & s \neq o. \end{cases}\$\$ This is standard two-valued classical equality. It is *derived* from the ≤_(*t*)-adjoint apparatus, not postulated.” (`why-predication-is-not-simply-fregean.md`, “The two adjoint systems and the derivation of classical equality”) **DOCUMENTED**

Existing bilattice-valued first-order logics in the wider literature — the note names BD∆ (Băutu et al.), Kamide–Zohar 2008, and Běhounek–Daňková–Dvořák 2020 — postulate classical equality as a primitive built into their bilattices. This program’s claim is that the postulate is unnecessary: on its predication-hyperdoctrine, classical equality is a theorem, recovered by working only in the ≤_(*t*) adjoint system and applying its own comprehension structure to the diagonal. The same construction, run through the *other* adjoint system instead, gives a second, paraconsistent equality:

> “Paraconsistent equality is the ≤_(*k*)-Lawvere image of the constant-⊤ valuation: \$\$\Delta_E^k \\:=\\ \exists_g^k(\mathbf{1}\_q^k), \qquad \Delta_E^k(s, o) = \begin{cases} \top & s = o, \\ \bot & s \neq o. \end{cases}\$\$ Both equalities arise from the same diagonal specialization *g*; they differ only in which adjoint system supplies the ∃. Neither is postulated; both are forced.” (same carrier) **DOCUMENTED**

And the note draws the consequence for what classical, Boolean logic actually *is*, on this reading — not a rival framework to predication, but what remains once you throw away everything predication adds:

> “Boolean isn’t a parallel framework. Boolean is what’s *left over* when you take the predication-hyperdoctrine and project out everything PCT adds beyond it — the ≤_(*k*) axis, the ⊥ and ⊤ values, the paraconsistent equality, the two-axis evidence structure.” (“So: where does Boolean live?”) **DOCUMENTED**

## A filed contradiction: two copies of the same claim

This projection claim — that classical logic is a *recovered* fragment of predication, not an alternative to it — exists in the corpus in two copies, one in the current Obsmetrologia documentation tree and one in a superseded legacy archive, and the two copies disagree about how the claim should be presented, in a way that matters directly to this book’s own honesty rule. The current copy is careful to say the claim belongs to this lab specifically:

> “This projection claim belongs to the lab’s predication program. It must not be misattributed to a generic curriculum or to the separate literatures on Fregean predication, bilattices, or categorical logic.” (`lib/emsenn/services/561-group/services/science-services-section/services/information-science-services-section/services/math-services-section/services/obsmetrological-services-section/lib/obsmetrologia/docs/verso/mark/content/utterance/articulating/content/articulation-cell/content/potential-articulation-cell/predicating/docs/explanations/why-predication-is-not-simply-fregean.md`, opening) **DOCUMENTED**

The legacy copy, kept in the relationality section’s archive of an earlier state of the same document family, presents the identical mathematics but frames it very differently:

> “This is what current graduate students of bilattice-valued categorical logic are expected to know — and what causes most confusion when someone newer to the area carries Fregean priors into reading PCT records.” (`lib/emsenn/services/561-group/services/science-services-section/services/philosophy-services-section/services/relationality-services-section/lib/legacy/2026-06-30-infomaterial/docs/verso/mark/content/utterance/articulating/content/articulation-cell/content/potential-articulation-cell/predicating/docs/explanations/why-predication-is-not-simply-fregean.md`, opening)

Both files carry the identical proof content — the same two-axis evidence structure, the same derivation of classical and paraconsistent equality, the same reference list. The disagreement is entirely in how the claim’s *ownership* is presented: the current copy insists the projection theorem is a specific, dated result of this lab’s own predication program, not general knowledge; the legacy copy presents the same content as settled background any competent graduate student would already know, which quietly erases whose result it actually is and invites exactly the kind of borrowed-prestige misattribution the current copy explicitly warns against. This book grades the current, corrected copy higher: it is the version that survives in the live Obsmetrologia documentation tree, and it directly addresses and forecloses the framing the legacy copy uses, rather than the reverse.

## Four stages, one pipeline

The forbidding clause quoted below sits inside a larger, declared structure worth laying out in full, because it shows exactly where predicating’s forced four-valued codomain sits relative to the rest of this program’s own category-theoretic pipeline. The corpus’s own predication-stage profile declares four stages, in a fixed order, each with its own category reading, its own regime, and its own generator kind:

> “stageOrder”: \[“articulating”, “predicating”, “positing”, “settling”\] (`predication-stage-profile.json`) **DOCUMENTED**

Articulating runs in an aperiodic regime and produces a potential articulation cell — the raw material Chapter 2’s predication cell is seeded from. Predicating runs in a transfinite regime, using a transfinite homotopy generator, and produces the predication category itself — the triple this book’s Chapter 2 already formalized in Lean. Positing runs in a Scott-continuous regime, taking a predication valuation plus a cell plus a datum, and producing a knowledge-order least-extended predication valuation. Settling runs in a finite regime, using a finite algebra generator, taking a Scott-continuous monotone trajectory frontier and producing a finite trace-family algebra or finite projection artifact. The profile is explicit that the direction only runs one way:

> “regimeOrder”: “aperiodic -\> transfinite -\> scott-continuous -\> finite”, “downstreamOnly”: true, “finiteDoesNotDefineUpstream”: true (`predication-stage-profile.json`, “direction”) **DOCUMENTED**

And it places FOUR itself with equal precision, at the very last, finite stage of the pipeline, specifically as a specialization rather than a starting point:

> “fourPlacement”: “settling-finite-predication-category”, “fourSpecializationOnly”: true, “finiteArtifactsDownstream”: true (`predication-stage-profile.json`, “finiteBoundary”) **DOCUMENTED**

This is the structural reason the six-step proof earlier in this chapter is stated carefully as forcing predicating’s *codomain-carrier* to be FOUR, and not as forcing the whole predication-stage pipeline to be built out of FOUR. The proof note itself is exact about the scope of its own claim, in language worth quoting once more because it draws the same boundary from the proof’s own side rather than the profile’s:

> “The four states themselves are realized as the four aperiodic-predication-cells (per the active tree’s realization that the 2×2 partition of FOUR IS the 2×2 partition of articulation-statuses, structural identity not analogy).” (2026-05-27-fregean-predication-forces-four-proof.md, “Where this lives in the active tree”) **DOCUMENTED**

The four predication-cell states — potential, active, stable, absurd — are the articulating stage’s own four-way partition, and the proof’s own claim is that this partition is structurally identical to FOUR’s own (0,0)/(1,0)/(0,1)/(1,1) evidence-pair structure, not merely analogous to it. That identity is stated at the *articulating* stage, upstream of predicating; the profile’s placement of FOUR at settling, downstream of predicating, is a separate, later specialization of the same four-valued shape, not a restatement of the same claim. Two different stages of one pipeline both land on four values, for two different, stated reasons, and this book keeps that distinction rather than treating “FOUR shows up twice” as one single fact.

## Never the global substrate

One further discipline this chapter has to state plainly, because it is easy for a reader excited about FOUR to overreach past what the corpus itself claims. The predication-stage machinery that grew out of the same May 2026 proof explicitly forbids treating FOUR as a universal foundation underneath everything:

> “forbids”: \[“FOUR as global substrate”, “finite row records as predicating codomain”\] (`lib/emsenn/services/561-group/services/engineering-services-section/services/computer-engineering-services-section/services/computer-systems-engineering-services-section/services/agent-computer-system-engineering-services-section/services/agent-computer-platform-system-engineering-services-section/services/multi-agent-computer-platform-system-engineering-services-section/apps/spotcomp/examples/predication-stage-profile.json`, stage “predicating”) **DOCUMENTED**

This forbidding clause sits inside a declared four-stage pipeline — articulating, predicating, positing, settling — each with its own category, its own regime (aperiodic, transfinite, Scott-continuous, finite), and its own explicit forbidden claims. FOUR belongs, by this profile’s own placement, specifically to the *finite, settling* end of that pipeline, not upstream of it: predicating itself runs in a transfinite regime, and only settling specializes down to the finite four-valued case. Treating FOUR as though it were the one substrate everything else in this program reduces to would be exactly the mistake this profile was written to catch. The six-step proof in this chapter forces predicating’s codomain to be FOUR; it does not force every category in this program’s whole pipeline to be built out of FOUR from the ground up, and the corpus’s own machinery says so explicitly.

## Ledger

| Claim                                                                                                                                                                                                                                                     | Grade                                                       | Exact theorem, module, or carrier                                                                                 |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------|
| Two independent evidence bits (positive, negative) give exactly four states: unknown, held, denied, contested                                                                                                                                             | DOCUMENTED                                                  | `FiberAlgebra.lean` docstring; glass-sponge note §5                                                               |
| The six-step forcing argument: two argument-slots, each binary, mutually independent, giving four joint states, none redundant, carrying two independent orders forming FOUR                                                                              | DOCUMENTED                                                  | `2026-05-27-fregean-predication-forces-four-proof.md`                                                             |
| By Fitting (2002), FOUR is the free bounded distributive bilattice on one generator, unique up to isomorphism                                                                                                                                             | DOCUMENTED (external citation, uncorroborated in this book) | `2026-05-27-fregean-predication-forces-four-proof.md`, Step 6                                                     |
| The truth-order Heyting adjunction `heyting_adj` and the contravariant truth implication `impT`                                                                                                                                                           | PROVED                                                      | `Positing.FiberAlgebra.Charge.impT`, `Positing.FiberAlgebra.Charge.heyting_adj`, `FiberAlgebra.lean`              |
| `fix_pi_iff`: a value is fixed by the composite nucleus iff fixed by both factor nuclei                                                                                                                                                                   | PROVED                                                      | `Positing.FiberAlgebra.FiberNuclearSquare.fix_pi_iff`, `FiberAlgebra.lean`                                        |
| A truth-closure is not a knowledge nucleus (the cross-order counterexample); truth and knowledge form a bigrading, never fused into one nucleus square                                                                                                    | PROVED                                                      | `Positing.FiberAlgebra.cross_order_not_knowledge_nucleus`, `FiberAlgebra.lean`                                    |
| Classical equality is derived, not postulated, from the truth-order adjoint system; paraconsistent equality is derived from the same diagonal via the knowledge-order system                                                                              | DOCUMENTED                                                  | `why-predication-is-not-simply-fregean.md` (obsmetrologia copy, current), “The two adjoint systems…”              |
| “Boolean is what’s left over when you project out everything predication adds”                                                                                                                                                                            | DOCUMENTED                                                  | same carrier, “So: where does Boolean live?”                                                                      |
| Filed contradiction: the current copy states the projection theorem as the lab’s own dated result, not to be misattributed; the legacy copy frames the same content as settled graduate-curriculum background — the corpus grades the current copy higher | DOCUMENTED, contradiction noted                             | obsmetrologia `why-predication-is-not-simply-fregean.md` (current) vs. relationality legacy copy of the same file |
| FOUR must never be treated as the program’s global substrate; it is placed specifically at the finite settling stage of a four-stage pipeline                                                                                                             | DOCUMENTED                                                  | `predication-stage-profile.json`, stage “predicating,” `forbids`                                                  |
| The four-stage pipeline (articulating, predicating, positing, settling) runs aperiodic to transfinite to Scott-continuous to finite, downstream only, with FOUR placed as a specialization only at the finite settling stage                              | DOCUMENTED                                                  | `predication-stage-profile.json`, “direction,” “finiteBoundary”                                                   |
| The four predication-cell states (potential, active, stable, absurd) at the articulating stage are structurally identical to FOUR’s own evidence-pair partition, not merely analogous                                                                     | DOCUMENTED                                                  | `2026-05-27-fregean-predication-forces-four-proof.md`, “Where this lives in the active tree”                      |
