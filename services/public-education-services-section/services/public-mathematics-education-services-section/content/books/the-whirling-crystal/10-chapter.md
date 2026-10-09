# Chapter 10: The Manifold Running

Chapter 1 opened this book’s story with a line from the founder’s own 2026-03-28 log, written before most of the mathematics in the chapters between then and now existed. Read again, with the typos left exactly as written, because this book does not annotate a founder’s own words:

> what we have over any data is a filtered spatiotemporal manifold, where what has been Determined becomes the structure for the entanglement of what is Necessary and Possible, and that entanglement is governed by the relatioanl configuration of the Determined.

**OWNER-STATED (2026-03-28).** This chapter is about the moment that sentence stopped being only a sentence. A working piece of code now exists that takes a filtered manifold, a determined structure, and an entanglement of what remains possible, and computes with them, in an ordinary JavaScript package running on ordinary hardware. This chapter reads that code directly, names exactly what runs, and then looks at the one live instrument, under construction this week, that is trying to put real news stories through it.

## The kernel’s five files

**IMPLEMENTED.** `@red-cup-engineering/predicated-inference-kernel` carries five source modules whose exports realize, piece by piece, the data classes the March log reached for. Nothing in this section is aspirational; every function named below is read directly from the package’s current source.

### The charge: `four.mjs`

A **charge** is a pair `{pos, neg}` of independent evidence bits — the same FOUR structure Chapters 3, 4, and 8 have already built up from different directions, here realized as four exported operations plus two readouts:

``` text
joinK(a, b)   // knowledge join: accumulate evidence, never discard it
meetK(a, b)   // knowledge meet
joinT(a, b)   // truth join
meetT(a, b)   // truth meet
negate(a)     // FOUR's involution
leqK(a, b)    // the knowledge order
kHeight(a)    // pos + neg: 0 at unknown, 1 at held or denied, 2 at contested
readFour(a)   // "unknown" | "held" | "denied" | "contested"
```

The module’s own header is explicit about what it is and is not: “This module is the kernel’s `{pos,neg}` bit reading of that charge: every law below is metrologic’s, applied through the reading; nothing is defined here.” The actual join, meet, and negation laws are imported from `@lenticule-science/metrologic/bilattice/charge`, the shared math package Chapter 4’s Chu-space machinery also rests on; this module is a thin, honest re-presentation of that math in the kernel’s own bit vocabulary, not a second implementation of FOUR.

### The context: `context.mjs`

A **context**, in the sense of Formal Concept Analysis, is a set of objects, a set of attributes, and an incidence relation between them, with an optional denial lane so an object can be witnessed as *not* bearing an attribute as well as bearing one. The module implements the Galois machinery this generates directly:

``` text
makeContext(objects, attributes, incidencePairs, denialPairs)
intent(ctx, A)       // attributes shared by every object in A
extent(ctx, B)       // objects sharing every attribute in B
closeAttrs(ctx, B)   // the Galois double prime B''
dgBasis(ctx)         // the Duquenne-Guigues canonical basis, by Ganter's algorithm
lawfulBasis(ctx)     // the basis restricted to premises some object actually realizes
```

The module’s own comment states plainly what this basis is for in this system: “The basis is not an analysis artifact here — it IS the machine’s compiled knowledge.” `lawfulBasis` exists specifically to avoid classical explosion: an implication whose premise no object realizes has an empty extent, so its closure is vacuously everything — “ex falso” — and the module deliberately filters those out so a contradiction stays a local, contested cell instead of forcing every attribute true everywhere.

### The two nuclei: `nuclei.mjs`

This is where the March log’s “entanglement… governed by the relational configuration of the Determined” gets an exact, running form. A **valuation** is a map from `(object, attribute)` pairs to FOUR charges. Two separate closure operators act on it:

``` text
sigma(ctx, basis, v)   // closes a valuation under the lawful basis: held
                       // premises force held conclusions, witnessed
delta(ctx, v)          // transfers held evidence along the Galois closure
                       // of each object's own realized profile
settle(ctx, v, opts)   // iterates sigma and delta to a fixed point
```

The module’s own header names the exact caution Chapter 8 already raised about the truth and knowledge orders: “Both are KNOWLEDGE-order closures (they only add evidence), so they are not the truth-order quartet of `FiberAlgebra.lean`… `cross_order_not_knowledge_nucleus` is why the two must never be identified.” `settle` does not merely iterate blindly; it keeps books at every step, computing a `stepLedger` of knowledge gained (commits, mints, and jumps, in the module’s own vocabulary) and throwing an explicit error — “H-theorem violation” — if a firing step discharges no measurable knowledge gain, or if knowledge appears to grow with no witnessed firing behind it. This is a coded, enforced version of the free-energy descent Chapter 9 described in prose: the settle loop cannot silently cheat its own accounting. `obstructionsOf` reads out the settlement’s remaining contested cells — evidence that survived on both lanes without collapsing — exactly the paraconsistent residue Chapters 4 and 6 insisted must be allowed to persist rather than be forced to explode or flatten.

### The complex: `complex.mjs`

Where the kernel needs to measure how badly a set of cells disagree, it builds a weighted graph over attributes — a **conductance complex** — and reads its Laplacian:

``` text
makeComplex(attributes)
setConductance(cx, a, b, w)
laplacian(cx)
disagreementEnergy(cx, assignment)   // x^T L x
spectralGap(cx)                      // smallest nonzero eigenvalue
refusalNumber(cx, assignment)        // sqrt(disagreementEnergy / spectralGap)
```

`disagreementEnergy` is the standard quadratic form of a graph Laplacian, an exact measure of how much a given assignment of values across attributes disagrees with the conductances connecting them. The `refusalNumber` combines that energy with the complex’s spectral gap into a single number: how far a family of local claims sits from the nearest family that actually agrees, citing “closure-cones Theorem 10.14” in its own comment as the source of that reading. This is the sheaf-Laplacian machinery the glass-sponge architecture note describes in prose — “a sheaf Laplacian can localize disagreement energy and identify modes of poor agreement” — here as sixty lines of ordinary numerical linear algebra, using cyclic Jacobi rotations to find eigenvalues without any external dependency.

### The relations: `algebra.mjs`

The kernel’s own linear algebra replaces real-valued matrix multiplication with FOUR-valued relational composition. A relation matrix carries two independent boolean lanes, `pos` and `neg`, and composes through knowledge join and meet rather than addition and multiplication:

``` text
compose(A, B)          // (A tensor B), per lane
residualLeft(A, B)      // the GREATEST W with A tensor W <= B: an exact
                        // backward pass, no gradient descent
residualRight(B, W)     // the other adjoint: pulls a target back through a layer
trainLayer(examples)    // meets residuals across examples: monotone, exact
nucleus(A, step)        // closure under a monotone step to a fixed point
attend(Q, K)            // Chu-style attention: relevance scored per lane,
                        // contested columns flagged, never averaged away
```

The module’s own header states the contrast directly: “GPT’s layer is `y = Wx` over `(R, +, x)`; ours is `Y = X tensor W` over `(FOUR, joinK, meetK)`… The backward pass is EXACT: residuation `A\B` (the greatest `W` with `A tensor W <= B`) is a theorem, so learning a layer is one residuation and updates are monotone meets — no gradients, no epochs, every weight a charge.” This is a genuinely different computational substrate for a learned layer: instead of a real-valued weight adjusted by gradient descent toward a loss, a `pos`/`neg` relation refined monotonically, one meet at a time, that can never un-learn a fact it has already committed to a lane. Whether this substrate scales to anything resembling a large model is not addressed by the code itself; what is here is a working, exact algebra over FOUR-valued relations, running today.

## The tower next door: EAVT’s three levels

**IMPLEMENTED.** A companion package, `eavt` (in the computer-data custody, standalone per the org’s own layering rule separating plain EAVT from its semantically typed SEAVT descendant), realizes the same March-log entanglement from a different angle: not a valuation over a context, but a trace of `{e, a, v, t}` rows — entity, attribute, value, transaction — accumulated over time. Its own source comment names the tower directly: “Level 0 asserted / Level 1 saturated = Fix(sigma) / Level 2 settled = Fix(sigma) cap Fix(delta).” Three functions realize the three levels, each a pure, non-mutating read of the same immutable trace:

``` text
saturate(rows, opts)          // sigma: drops retraction tombstones and
                               // whatever positive rows they retract
transfer(subject, rows, opts) // delta: accumulates a subject's rows into
                               // a settled fiber via FOUR knowledge join
stratify(subject, rows, opts) // asserted, saturated, and settled, together
```

The module’s own commentary is explicit that this is a genuine instance of the same nuclear-square structure the kernel’s `nuclei.mjs` and the Obsmetrologia `FiberAlgebra.lean` both name, adapted to a shape without a stored polarity field: “because the two nuclei commute… Fix(sigma) cap Fix(delta) = Fix(delta compose sigma): the canonical composition below already IS the intersection, nothing further to compute.” A row is never mutated or deleted; a retraction is itself a new row (`v === null`), an honest append-only undo rather than an erasure, matching this book’s running rule that falsehood in a record is corrected going forward, never blotted out of the history that produced it.

Every row in this trace carries its own content identity rather than an assigned or incremented key: `rowId(row)` computes the row’s RFC 6920 `ni:` URI over the RFC 8949 canonical CBOR encoding of the row itself, composed from two other house packages rather than reimplemented locally, so identical content always produces an identical identity and different content never collides. **IMPLEMENTED** (`rowId`, `dedupe`, `eavt.mjs`). This gives the append-only trace a G-Set semantics for free: appending the same row twice, whether by a retried write or two independent writers who happened to observe the same fact, never doubles its evidence, because `dedupe` groups by this exact content identity before anything downstream ever folds the trace. An entity born inside this trace is addressed the same way: `constituteEntity` hashes a genesis row with its own subject position held at a placeholder, then rewrites that placeholder to `<kind>:<digest>` — an address that verifies against its own content, rather than one assigned by any external authority, and the module’s own commentary is careful to call this the “sketch-lane” address rather than the full typed-envelope semantic identity the glass-sponge note specifies and still leaves open. **IMPLEMENTED** (`constituteEntity`, `entityAddress`, `eavt.mjs`).

## The instrument running

**IMPLEMENTED.** The clearest present test of whether any of this pays for itself is a live piece of work: a news property, built as JSON parameters over these shared engineering services rather than as its own bespoke daemon, with Koios.News as the first parameterization. Its own specification, dated 2026-09-02, states the design in full: each newsroom pulse runs intake, selection, claim extraction bought on the cheapest admitted inference lane, deterministic gates, independent assessment, and a pulse settlement record naming cost per story.

Reading the actual source in `apps/news-property/src/newsroom-day/`’s `claim-text.mjs`, `claims.mjs`, `knowledge.mjs`, and `settlement.mjs`, as of 2026-09-03, here is exactly what runs.

- Intake genuinely projects arriving feed items into an EAVT store (`intakeFreshArrivals`, `projectArrivalsToEavt`), using the same EAVT machinery described above.
- **Claim text normalization is the script’s work, not the model’s.** `claim-text.mjs`’s `parseClaimLines` reads a provider’s plain-text response line by line — pipe-, tab-, or dash-delimited fields, tolerant of a leading list marker — and only falls back to hunting for a stray JSON blob when no line parses at all. `locateQuote` then finds each parsed quote verbatim inside the source item’s own text, an exact substring match first and a whitespace-normalized fallback second, and `normalizeClaimText` drops any claim whose quote cannot be located rather than inventing an offset for it. **OWNER-STATED (2026-09-03):** “JSON is a script’s job; the model writes contents” — this module is that ruling, running.
- `purchaseClaimExtraction` (`claims.mjs`) buys the claim-extraction lot, hands the provider’s plain text to `normalizeClaimText`, and builds the script-owned candidate object itself before the assay ever sees it. `assayKnowledgeVaultCandidate` then runs its full, unweakened check against that script-built object — the schema and evidence law are not loosened to accommodate a model that cannot itself produce clean JSON.
- Cross-source disagreement is genuinely detected and held, not voted on. `detectHeldContradictions` groups claims by normalized subject and predicate, and only when at least two independent source hosts assert at least two distinct objects does it emit a contradiction record — charged, in the code’s own words, as “FOUR top (both support and refutation charged) rather than resolving them by vote.” The source comment calls this “the FOUR top commodity” outright, naming the same paraconsistent commodity this book’s own chapters have built up from Frege through Chu spaces.
- The pulse now runs the kernel itself. `knowledge.mjs`’s `buildClaimKernelContext` builds a real predicated-inference-kernel formal context over one pulse’s admitted claims: objects are source hosts, attributes are claim identities (`subject`, `predicate`, `object`, opaque-keyed), and a host’s own assertion is incidence. The module’s own header states the design choice precisely: “The seed charges ONLY the positive incidence a host actually asserted — denial facts are left for `settle()` to derive from the context’s own static incidence… so each derived denial counts as one WIT rather than being asserted upfront.” `settle` (`nuclei.mjs`, described above) then runs unmodified over that context, and `pulseKnowledgeReadout` reads the settlement back out in the kernel’s own vocabulary: `wits` (the settlement’s own H-theorem-checked `ledger.initialDeficit`), `heldTops` (claim identities whose evidence, joined across every host that spoke to it, settles to FOUR’s top), `moltenFraction` (`heldTops` over the pulse’s total distinct claim identities), `obstructions` (the settlement’s own surviving contested-cell count), `disagreementEnergy` and `spectralGap` (from a conductance complex built over claim identities, weighted by how often two identities are co-asserted by the same host, read at the settled valuation), and `costPerWit` (the pulse’s total cost divided by `wits`, kept as an exact numerator/denominator fraction rather than a float, and `null` when `wits` is zero or the pulse carried no priced cost).
- `settlement.mjs`’s `recordPulseSettlement` calls `pulseKnowledgeReadout` on the pulse’s admitted claim rows and their summed cost and writes the result straight into the pulse settlement record’s own `knowledge` field, beside the per-story admitted/refused counts, providers, and cost this book has already described. A pulse settlement record is, as of this reading, both a receipted market transaction and a kernel readout in the same object.

One structural fact fell out of wiring the aggregate join across hosts rather than being designed in ahead of time: because a two-way disagreement makes each host’s own assertion the *other* host’s denial under `context.mjs`’s denial-lane convention, a single disagreement between exactly two sources on one claim molts both claim identities to FOUR top, not one — so a pulse’s held tops, whenever it has any two-way disagreements at all, always come in even counts.

**Live run, 2026-09-03.** Over 44 feeds, the pulse intook 1,161 items and selected 10 stories. It made 21 purchases on the local NPU lane (`llama3.2:3b`) and admitted 5 claims through the unweakened assay. It found 0 held contradictions across those 5 claims’ sources, so the kernel readout is honest rather than merely quiet: `wits` and `moltenFraction` both read 0, because a pulse whose admitted claims never disagreed genuinely gave `settle` no denial to derive and charge as evidence gained.

So the honest reading, as of this writing, is that the two sides of the wire the previous edition of this chapter described separately now run as one instrument. The news property puts a real, paraconsistent, receipted claim economy into production — script-normalized claim text with verbatim-located quotes, a genuinely unweakened assay, genuine FOUR-charged contradiction-holding, genuine per-story market cost accounting — and it reports that economy back out in the kernel’s own vocabulary: wits, molten fraction, held tops, obstructions, disagreement energy, spectral gap, and cost per wit as an exact fraction. What the numbers happened to say on this particular run — zero held contradictions, zero wits — is itself information about that day’s feeds, not a gap in the instrument reading them.

## What is still ahead, named honestly

**OPEN.** The architecture note that first laid out this whole compute picture lists its own open obligations without softening them, and this book inherits that list rather than pretending it is shorter than it is. Among the items still unbuilt or unproved as this book goes to print: the continuous multi-cell J26 honeycomb Chapter 6 needed and did not get; an earned rigidity argument for that honeycomb, should it ever be built; the weld from a coordination-cost bit count to physical joules that Chapter 9 spent its whole length declining to claim; the identification of the disclination’s sixth-turn conserved quantity with the KCBS pentagon’s fifth-turn obstruction that Chapter 7 left as a named, unready blueprint node; and IPAccounting on production units — turning the cost figures this chapter just described from a settlement record into a running profit-and-loss line an operator could actually read. None of these are decorative gaps. Each is a specific, named theorem or engineering task with its own carrier in this corpus, and each is exactly as unfinished as this book has said, chapter by chapter, that it is.

## The manifold, running

Here is what this chapter has actually shown, stripped of ambition. The March 2026 sentence about a filtered spatiotemporal manifold, structured by the Determined and entangling the Necessary and the Possible, is no longer only a sentence. A cell is a `(subject, predicate, object)` triple. A charge is a `{pos, neg}` pair with a real, checked algebra. A context is a formal-concept-analysis structure with a real Galois basis. A valuation is a map that two named, distinct closure operators can act on, with their commutation and their difference both respected in code, not merely in prose. Settlement is a loop that keeps its own free-energy books and refuses to lie about them. History is a trace that only grows, readable at three distinct levels without ever being rewritten. And one real, live product is buying claims from a real market, holding real contradictions as data rather than resolving them by force, and paying for all of it in receipts anyone can add up. What remains — the pieces named as open in this chapter and the ones before it — remains open, and this book has tried, chapter by chapter, to say exactly which pieces those are.

## Ledger

| Claim                                                                                                                                                                                                                                   | Grade                                | Exact theorem, module, or carrier                                                                                                                    |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| FOUR charge `{pos, neg}` with `joinK`, `meetK`, `joinT`, `meetT`, `negate`, `leqK`, `kHeight`, `readFour`                                                                                                                               | IMPLEMENTED                          | `four.mjs`, `predicated-inference-kernel`                                                                                                            |
| Formal context with `intent`, `extent`, `closeAttrs`, `dgBasis`, `lawfulBasis` (the Duquenne-Guigues basis as compiled knowledge)                                                                                                       | IMPLEMENTED                          | `context.mjs`, `predicated-inference-kernel`                                                                                                         |
| Two knowledge-order nuclei `sigma`/`delta`, `settle` with an enforced free-energy step ledger, `obstructionsOf` for surviving contested cells                                                                                           | IMPLEMENTED                          | `nuclei.mjs`, `predicated-inference-kernel`                                                                                                          |
| Conductance complex with `laplacian`, `disagreementEnergy`, `spectralGap`, `refusalNumber`                                                                                                                                              | IMPLEMENTED                          | `complex.mjs`, `predicated-inference-kernel`                                                                                                         |
| FOUR-valued relational algebra: `compose`, exact `residualLeft`/`residualRight`, monotone `trainLayer`, `nucleus`, `attend`                                                                                                             | IMPLEMENTED                          | `algebra.mjs`, `predicated-inference-kernel`                                                                                                         |
| Three-level EAVT tower: `saturate` (Fix sigma), `transfer` (Fix delta), `stratify` (asserted/saturated/settled)                                                                                                                         | IMPLEMENTED                          | `eavt.mjs`, `eavt-engineering-services-section`                                                                                                      |
| Row identity is the RFC 6920 `ni:` URI of the row’s canonical CBOR encoding; `dedupe` gives the trace G-Set semantics; entity addresses are self-verifying, not externally assigned                                                     | IMPLEMENTED                          | `rowId`, `dedupe`, `constituteEntity`, `entityAddress`, `eavt.mjs`                                                                                   |
| The news property’s newsroom-day pulse genuinely projects intake to EAVT, buys claims from the inference market, and records a pulse settlement with per-story exact cost                                                               | IMPLEMENTED                          | `newsroom-day.mjs`, `newsroom-day/intake.mjs`, `newsroom-day/claims.mjs`, `newsroom-day/settlement.mjs`, `apps/news-property`                        |
| Cross-source disagreement is held as FOUR top (`{support: true, refutation: true}`), never resolved by vote                                                                                                                             | IMPLEMENTED                          | `detectHeldContradictions`, `recordHeldContradiction`, `newsroom-day/claims.mjs`, `newsroom-day/settlement.mjs`                                      |
| Plain-text claim lines are normalized by script, not the model; each quote is located verbatim in the source item’s own text before a claim is built, or the claim is dropped                                                           | IMPLEMENTED                          | `parseClaimLines`, `locateQuote`, `normalizeClaimText`, `newsroom-day/claim-text.mjs`                                                                |
| The assay runs its full, unweakened check against the script-built claim candidate object, never a schema loosened for the model                                                                                                        | IMPLEMENTED                          | `assayKnowledgeVaultCandidate` over `builtCandidate`, `newsroom-day/claims.mjs`                                                                      |
| The pulse’s admitted claims are settled through a real predicated-inference-kernel formal context (source hosts as objects, claim identities as attributes), with `settle` deriving denials rather than the seed asserting them upfront | IMPLEMENTED                          | `buildClaimKernelContext`, `settle`, `newsroom-day/knowledge.mjs`                                                                                    |
| The pulse settlement’s own knowledge readout: `wits`, `heldTops`, `moltenFraction`, `obstructions`, `disagreementEnergy`, `spectralGap`, and `costPerWit` as an exact fraction                                                          | IMPLEMENTED                          | `pulseKnowledgeReadout`, `newsroom-day/knowledge.mjs`; embedded into the settlement record by `recordPulseSettlement`, `newsroom-day/settlement.mjs` |
| A two-way disagreement on one claim molts both claim identities to FOUR top under the aggregate join across hosts (each host’s assertion is the other’s denial), so a pulse’s held tops come in even counts                             | IMPLEMENTED (structural consequence) | `buildClaimKernelContext`’s denial-pair construction, `newsroom-day/knowledge.mjs`                                                                   |
| Live run, 2026-09-03: 44 feeds, 1,161 items intook, 10 stories selected, 21 purchases on the local NPU lane (`llama3.2:3b`), 5 claims admitted through the unweakened assay, 0 held contradictions, `wits` and `moltenFraction` both 0  | IMPLEMENTED (live run)               | `newsroom-day/settlement.mjs` pulse settlement record, direct run, `apps/news-property`, 2026-09-03                                                  |
| “JSON is a script’s job; the model writes contents”                                                                                                                                                                                     | OWNER-STATED                         | 2026-09-03                                                                                                                                           |
| “what we have over any data is a filtered spatiotemporal manifold, where what has been Determined becomes the structure for the entanglement of what is Necessary and Possible”                                                         | OWNER-STATED                         | 2026-03-28, `2026-03-28-1016-emsenn-personal-log.md`                                                                                                 |
| The continuous multi-cell J26 honeycomb, the honeycomb’s rigidity argument, the Landauer-to-joules weld, and the disclination sixth-turn/KCBS fifth-turn identification remain open                                                     | OPEN                                 | `2026-08-01-note-on-the-content-addressed-glass-sponge-semantic-compute-complex.md` §26; carried forward from Chapters 6, 7, and 9 of this book      |
