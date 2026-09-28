# Chapter 2: Frontmatter Is Predication

Chapter 1 ended with two unfinished lineages: a philosophical one that gave this program Base and Claim, a directional pair, and an engineering one that gave it a genuine subject-predicate-object triple, built from Org-roam nodes. This chapter is where those lineages meet a third, independent source — a research note that reads ordinary Markdown frontmatter as literal Fregean function application — and where the resulting triple gets formalized, in Lean, as a proved structure with a name: the predication cell.

A note on what this chapter is and is not about. Markdown frontmatter is the easiest way to show a beginner what a saturation and a fiber actually look like, because every reader already has files with `key: value` blocks at the top. It is this program’s own origin illustration, not its production representation. The founder has since ruled directly on the difference, and this chapter states that ruling plainly before working through the illustration, so no reader mistakes the demonstration for the architecture. The language the org actually represents its claims in is RMN, and the store that carries those claims through time is SEAVT; both are introduced later in this chapter, and both are why the frontmatter reading, useful as a first demonstration, was never adopted as more than that.

## Frontmatter as function application: the origin illustration

The claim at the center of this section is the program’s origin point, not its destination, and it is stated plainly in a March 2026 research note, marked `status: draft`, meaning it is offered by the lab as its own position and not yet settled beyond that:

> “A markdown file with YAML frontmatter encodes a set of subject-predicate-object triples: the file is the subject, each key is a predicate, and each value is an object. This is not a metaphor. It is Frege’s function-argument structure (Frege 1879) implemented in a plain-text format now standard across millions of repositories.” (`lib/emsenn/services/561-group/services/science-services-section/services/philosophy-services-section/services/relationality-services-section/content/text/documents/articles/notes/2026/03/28/2026-03-28-note-on-yaml-frontmatter-as-fregean-predicate-fibration.md`, Abstract) **DOCUMENTED**

Frege’s actual insight, which the note is invoking directly, is that a predicate is not a label stuck onto a subject; it is an unsaturated function, incomplete until you hand it an argument. “Is red” is not a property sitting on a shelf waiting to be attached to things; it is a gap, waiting to be filled by something. Applied to a frontmatter block:

``` sourceCode
---
authors: emsenn
extends: legibility
---
```

the note reads `authors` as an unsaturated predicate, incomplete until applied to both a subject (the file itself) and an object (`emsenn`), and writes the function application directly:

    authors(this-file) = emsenn
    extends(this-file) = legibility

**DOCUMENTED** (same carrier, §1.2). The claim being made is specific and worth restating precisely, because it is easy to round it down into a looser metaphor: the note is not saying frontmatter is *like* an RDF triple, or *inspired by* Frege. It is saying that when a YAML parser reads `authors: emsenn` out of a file, the operation the parser performs — reading a key, looking up its value, associating both with the file that contains them — literally *is* the operation Frege calls function application, with the file as argument, the key as function, and the value as result. Whether that identification survives close scrutiny, or whether it is looser than the note claims, is not something this book settles either way; it states the note’s claim, grades it DOCUMENTED because no proof accompanies it, and moves on to what the note builds on top of that claim.

## Fibers: what a predicate is worth, across a whole vault

Given that reading, the note asks what happens once you have not one file but a whole vault of them, all using the same predicate keys. Take one key, say `authors`. Collect every value that key ever takes, across every file in the vault. The note calls this collection the key’s **fiber**:

> “Let *V* be a vault: a set of markdown files, each with YAML frontmatter. Let *K* be the set of all keys that appear in any file’s frontmatter. For each key *k* ∈ *K*, define the **fiber** *F*_(*k*) as the set of all values that *k* takes across all files in *V*: *F*_(*k*) = {*v* : ∃*f* ∈ *V* such that *k*(*f*) = *v*}” (2026-03-28-note-on-yaml-frontmatter-as-fregean-predicate-fibration.md, §2.1) **DOCUMENTED**

The whole collection of fibers, one per key, is what the note calls the vault’s **predicate fibration**: a structure that categorical logicians recognize, in a much richer form, as a hyperdoctrine — a base category of contexts, with each context assigned its own lattice of propositions. A vault’s frontmatter fibration is, the note is careful to say, the degenerate case of that idea:

> “The predicate fibration of a vault is a degenerate case. The base category is the discrete set *K* of predicate keys (no morphisms between keys). Each fiber *F*_(*k*) is a set (not a Heyting algebra — there is no implication structure within a fiber). There are no reindexing maps because the base is discrete.” (§2.3) **DOCUMENTED**

“Degenerate” is doing real work here and should not be read as a disparagement. The note is explicit that this minimal, flattest possible case is worth naming precisely for two reasons: it already exists, without anyone building it, in every vault with consistent frontmatter, and it can be enriched in specific, named ways without inventing new machinery — three enrichments, stated directly: if the values within a fiber carry a natural order (`status: draft` before `status: review` before `status: published`), the fiber becomes a poset and, with it, a Heyting algebra; if keys themselves are related (`extends` and `extended-by` as duals of each other), morphisms appear in the base category and the fibration acquires reindexing maps; and if files sit in a directory structure that supplies context, the base category gains hierarchical structure. Each enrichment is a real step toward a full hyperdoctrine, and none of them requires the vault’s author to know what a hyperdoctrine is in order to write frontmatter that has one.

## Divergence as emergent schema, not imposed schema

The note’s third claim is the most practically useful one, and it is worth stating exactly because it inverts how most knowledge-management tooling works. Traditional systems — RDF, OWL — are schema-first: you define an ontology, then populate it, and anything that does not conform is an error. The predicate fibration is schema-free in a specific, load- bearing sense:

> “If 800 files assert `authors: emsenn` and one file asserts `authors: emsen`, the fibration does not call this an error. It reports a divergence: one value in the `authors` fiber that appears once where another appears 800 times.” (§3.1) **DOCUMENTED**

The number is not incidental to this book’s discussion; it is the concrete worked example the source carrier itself uses, and it is worth keeping because it is exactly the shape of question a fiber lets you ask that a rigid schema cannot: not “is this value valid,” but “how well- worn is this value, relative to everything else asserted under the same key.” A typo, a legitimate exception, and an evolving convention all produce the same kind of divergence signal, and the fibration is honest that it cannot tell them apart on its own — a human or an agent still has to look. What the fibration buys is making the question askable at all, without first having written down, by hand, what counts as a violation.

## The triadic cell that came before

The frontmatter note builds its case from Frege and from RDF, both external literatures. But this program’s own account of what a predication cell actually *is*, structurally, comes from a different and earlier carrier: a term in the corpus’s own “voidmath” work, dated several weeks before the frontmatter note, defining the cell directly:

> “A **predication cell** is an ordered triple *ϕ* = (*s*,*p*,*o*) where *s* is a subject (an entity), *p* is a predicate, and *o* is an object (also an entity).” (`lib/emsenn/services/561-group/services/science-services-section/lib/legacy/2026-08-17-archive-emsenn-net-research/witnesses/library/domains/humanities/domains/math/domains/voidmath/terms/predication-cell.md`) **DOCUMENTED**

The distinction this term insists on, and which matters directly for what follows in this chapter, is that the cell is a bare shape — where a value *could* be assigned — and is not itself a value:

> “The cell is the smallest unit at which a predication valuation can assign a value. The value lives in a residuated bilattice **L**^(⋈) associated to the predicate; the cell is *where* the value is assigned, the value is *what* is assigned. Predication cells are not relations in their own right — they are the directed triadic shapes that relations *take* when written out.”

A valuation, written *v* : cells → *A*_(*p*), is a separate act from the cell’s existence. This distinction matters for the whole book, not just this chapter: a frontmatter line like `bilattice-homomorphism: bilattice` is not, on this reading, the assertion “is-bilattice- homomorphism-to-bilattice is true.” It is the *existence* of a cell — the claim that this specific morphism has this specific codomain — with its truth value a wholly separate question, settled (or not) by a valuation applied afterward. Chapter 3 of this book is entirely about what values a valuation can actually take; this chapter is about the shape of the cell those values get assigned to.

And the term is explicit, in language this book will return to twice more before the chapter ends, that the cell cannot be simplified below three coordinates:

> “The cell shape itself never collapses below three coordinates; the binary base *E* × *E* of the entity index is the minimal index, and unary predicates are derived structurally rather than admitted as a separate primitive.” (predication-cell.md, “The directed triadic structure”) **DOCUMENTED**

This is the exact sentence Chapter 1 promised would matter, and it is worth being precise about what it forbids. It is not merely saying “predication has three parts, usually.” It is saying that even the apparent counterexample — a unary predicate, like “is red,” which seems to need only one entity — does not actually shrink the cell to two coordinates. Instead, the term explains, a unary predicate is what you get when the predicate has been pre-projected onto the subject or object diagonal: formally, one of the predicate category’s own projection generators has already been applied, collapsing subject and object onto the same entity, but the cell underneath is still a triple, (*s*,*p*,*s*), not a genuine pair. There is no shorter form. The term calls this the “minimum writable form” in which the relationlessness paradox from Chapter 1 can be expressed — language that ties this whole engineering lineage back to the philosophical one, even though the two developed separately.

## A filed reversal, same day

Not every carrier in this corpus agrees with itself on first pass, and this program’s own house law is explicit that when two carriers disagree, the honest move is to state both readings and say which one the corpus grades higher — never to quietly smooth the disagreement over. This chapter has an unusually clean example, because both readings appear in the *same* note, on the *same* day, August 10, 2026.

The note in question is an engineering research note working out how to model an npm binary-dependency graph — the “Node Operations Graph,” or NOG — as a network of Hoare-shaped operations. Partway through, its author rules on how a manifest’s `key: value` fields should be treated as predication cells, and the first ruling is a simplification:

> “A PredicationCell, as NOG uses it, is an address that a charge is posited onto — not a forced `(subject, predicate, object)` triple. The base case is one token, one charge: `token → Charge`, the token being the key itself… The `(subject, predicate, object)` triple is not the definition of a predication cell; it is what a *relation between two already-addressed cells* looks like.” (`lib/emsenn/services/561-group/services/561-group-services-section/services/561-group-operations-services-section/services/561-group-enterprise-services-section/services/561-group-board-of-directors/services/561-group-board-of-directors-leader-movement-team/content/text/documents/articles/notes/2026/08/10/2026-08-10-note-on-node-operations-graph.md`, “Ruling, 2026-08-10,” item 2) **DOCUMENTED**

That is Reading A: a predication cell is, at bottom, just an address holding one charge — a simple key-to-value map — and the triple only shows up later, once two such addresses get related to each other. It is a reasonable simplification, and it is not obviously wrong on its face.

Later the same day, the note reverses itself, and does so by going back to the voidmath term this chapter has already quoted and reading it again, more carefully:

> “Ruling item 2 said a PredicationCell, for NOG’s purposes, is a bare address (`token → Charge`)… **That is wrong, and it is wrong against the actual source of this material, not just a matter of taste.** The original theory — voidmath, `terms/predication-cell.md`, dated 2026-04-28, months before the current Obsmetrologia Lean rewrite, the real ancestor of everything F.1–F.2 built on — says the opposite, in its own words: ‘The cell shape itself never collapses below three coordinates…’ There is no address primitive underneath predication. The directed triple (*s*,*p*,*o*) is the bedrock.” (same carrier, “Correction, same day: Ruling item 2 above is reversed. Predication is irreducibly triadic.”) **DOCUMENTED**

That is Reading B: the triple is not an add-on that appears once two addresses relate; it is the bedrock, and the “one token, one charge” reading was a simplification that quietly dropped a coordinate the source material had already insisted could not be dropped. The correction goes on to show that even the current Lean’s reflexive seed construction — where a bare utterance (*t*,*c*) becomes the triple (*t*,*c*,*t*), subject and object both filled by the token — is not a counterexample to the triadic claim. It is exactly the “unary predicate as pre-projected diagonal” case the voidmath term already predicted: the honest degenerate form for a claim encountered before its real subject is known, not evidence that a bare pair was ever sufficient.

Which reading does the corpus grade higher? This is not a case of two carriers quietly disagreeing while both stay on the books; it is a single author, in a single note, explicitly retracting the first reading against its own named source and stating plainly that the retraction is not a matter of taste. The corpus’s own verdict is Reading B: predication is irreducibly triadic, and the reflexive seed is a degenerate instance of a triple, not proof that a pair would do. This book follows that verdict, and the Lean structure below is built to match it exactly.

## The proved structure

Everything above is design and interpretation — DOCUMENTED, not proved. The place this chapter’s claim actually earns a PROVED grade is in the Obsmetrologia Lean corpus, where the predication cell is a checked structure with checked theorems about it, not a term-file description of one. The file is short enough to read in full, and its own header states the claim this whole chapter has been building toward directly:

> “A predicate asserted over a cell is an **arrow**; predicates compose (associatively, with identities) and so **generate a category** — the *predication category*. This is the literal sense in which category theory is not filed nearby but is *what this morphism produces*.” (`lib/emsenn/services/561-group/services/science-services-section/services/information-science-services-section/services/math-services-section/services/obsmetrological-services-section/lib/obsmetrologia/Obsmetrologia/Language/Predicating/Cell.lean`)

The structure itself is declared exactly as the voidmath term described it, as a triple with no coordinate collapsed:

``` lean
structure PredicationCell where
  subject : Entity
  predicate : Predicate
  object : Entity
  deriving DecidableEq, Repr, Inhabited
```

**PROVED** (`Obsmetrologia.PredicationCell`, `Cell.lean`). The seed that turns a bare utterance into this triple is exactly the reflexive construction the “Correction, same day” note above defends as the honest unary case, not a counterexample:

``` lean
def seed (u : Utterance) : PredicationCell := ⟨u.token, u.claim, u.token⟩
```

**PROVED** (`Obsmetrologia.PredicationCell.seed`, `Cell.lean`). The file proves four generating operations on cells — converse, subject- projection, object-projection, and specialization — and two of its theorems are worth naming exactly, because they are the machine-checked form of the “directed triadic structure” the voidmath term only argued for in prose. Converse swaps subject and object:

``` lean
def converse (φ : PredicationCell) : PredicationCell := ⟨φ.object, φ.predicate, φ.subject⟩
```

and the file proves both that converse is its own inverse and that, whenever subject and object genuinely differ, converse produces a *different* cell rather than the same one read backwards:

``` lean
theorem converse_converse (φ : PredicationCell) : converse (converse φ) = φ := rfl

theorem converse_ne (φ : PredicationCell) (h : φ.subject ≠ φ.object) :
    converse φ ≠ φ
```

**PROVED** (`Obsmetrologia.PredicationCell.converse`, `Obsmetrologia.PredicationCell.converse_ne`, `Cell.lean`). This last theorem is the exact machine-checked statement of what the voidmath term called the cell’s directionality: “the predicate holds *of* *s* in relation to *o*, not of *o* in relation to *s*.” A prose claim that orientation matters is now a proved fact about a Lean structure that cannot be equal to its own converse except in the degenerate case where subject and object already coincide.

Two threads from Chapter 1 meet here and finish differently than they started. The philosophical lineage gave a directional pair, Base and Claim, reducible to a left-base and a right-base. The engineering lineage, through the Org-roam predicate work, gave a genuine triple in which every coordinate was already an addressable node. What this chapter has shown is that the corpus’s own formal answer sides with the second lineage, not the first — and it sides with it not by fiat, but because an author who tried the simpler pair-based reading found it contradicted the corpus’s own earlier, more careful source, and said so in writing the same day. The next chapter asks a sharper question about what lives *inside* one of these cells: not the shape of the triple, but the values a valuation can assign to it — and shows that the answer is forced, by a six-step argument with named falsifiers, to be exactly four.

## What the org actually uses: RMN and SEAVT

The frontmatter fibration shows a beginner what a saturation and a fiber look like, on data anyone already has lying around. It is not what this program actually represents its claims in, and this chapter would be dishonest if it let the illustration stand in for the architecture. The representation language the org uses is **RMN**, Relation Model Notation: one typed, total grammar, not a family of per-domain dialects and not a synonym for arbitrary JSON. Its real grammar, read directly from the current implementation and confirmed independently against its own reduction engine, is small and exact:

> “Five types — `base | arrow Ty Ty | prod Ty Ty | unit | list Ty` — and eleven term forms: `Tm := var n | lam t | app t t | pair t t | fst t | snd t | star | mark s | coincide t t | cond t t t | fold t t t`. That’s it. Confirmed independently against the actual reduction engine… `step`, `dev`, and `normalize` each switch on exactly these eleven tags. Nothing else is a term constructor.” (`2026-08-10-note-on-node-operations-graph.md`, §F.2.4, corrected against `relation-model-notation-service/src/types.mjs` and `relation-model-notation-eval-service/src/index.mjs`) **IMPLEMENTED**

Charge, negation, and the join/meet operations Chapter 3 of this book builds toward are not separate RMN opcodes sitting alongside `var` and `lam`. They are helper functions composed from `mark`, `cond`, and `coincide` in a layer above the eleven real forms — a distinction the same note is explicit is easy to get wrong, because an earlier draft of this program’s own documentation got it wrong first and had to correct itself against the real source. This matters directly for how a cell is represented: an RMN predication cell is `(subject, predicate, object)` exactly as Chapter 2 has already built it in Lean — an address, not a value — and a charge is assigned to that address by a separate act, the same separation the voidmath term insisted on at the top of this chapter. Nothing about moving from a frontmatter illustration to RMN changes that separation; RMN is simply the typed, total language the org actually writes the address and the separately-assigned charge in, in place of an untyped YAML value.

What carries an RMN claim through time is a different structure again, one frontmatter has no analogue for at all: **SEAVT**, Semiotic EAVT.

> “Semiotic EAVT (SEAVT) is EAVT — the plain `{e, a, v, t}` row identity owned by `eavt-engineering-services-section` — specialized so that each of E, A, and V is meant to be RMN: a typed Relation Model Notation claim, rather than an untyped value. T stays the stored-time coordinate the plain package already carries.” (`lib/emsenn/services/561-group/services/engineering-services-section/services/computer-engineering-services-section/services/computer-systems-engineering-services-section/services/semiotic-computer-system-services-section/content/text/glossary/terms/seavt.md`) **DOCUMENTED**

A SEAVT row is not edited once written; it is journaled, append-only, into the witness journal, and its identity is committed with an opaque RFC 6920 `ni:` content-hash token — the same standard this book’s later chapters use for content addressing, already introduced in the glass-sponge architecture note. A SEAVT row on its own is only Level 0 of a three-level stratification, and the two further levels are never stored fields; they are derived passes over the journaled trace:

> “A SEAVT row is Level 0 of the braided tower: asserted… Level 1 — saturated, `Fix σ` (the past-stable fixed point). Level 2 — settled, `H* = Fix σ ∩ Fix Δ` (`σ` the past cone, `Δ` the future cone — separate nuclei, never lumped into one fold)… The executable carrier for this stratification is the plain EAVT package, `@red-cup-engineering/eavt` (0.5.0): its `saturate`, `transfer`, and `stratify` passes give Fix σ, Fix Δ, and H\* as separate derived passes over a trace, never a stored field.” (`seavt.md`, “Strata”) **IMPLEMENTED**

Asserted, saturated, settled: three genuinely different strata, kept genuinely separate rather than flattened into one lumped fold, computed fresh from the trace rather than cached as fields on the row. This is the same *σ*/*Δ* pairing Chapter 3’s `FiberAlgebra.lean` proves commute as two nuclei on the truth-order fiber, now realized as running code over a durable, content-addressed, append-only store — the “filtered spatiotemporal manifold” of Chapter 1’s March log, given an actual data structure five months later.

## Why not frontmatter

Given RMN and SEAVT, the founder’s own judgment about the frontmatter illustration this chapter opened with is direct, and this book states it exactly as given rather than softening it:

> “The YAML-frontmatter approach is strange and kind of bad.” **OWNER-STATED, 2026-09-03**

This is not a reversal this book is smoothing over; frontmatter was never adopted as the org’s working representation, and this chapter’s own opening section already named it an origin illustration rather than an architecture. But the founder’s judgment deserves its own reasons stated plainly, and the corpus already carries both of them.

The first reason goes back to the very same March 2026 log this book’s Chapter 1 quoted at length. Working through what a `key:` actually asserts, the founder caught the same problem a frontmatter-as-RDF reading runs into every time:

> “`:` almost never just means `Relating`, the way `=` in math cannot mean `equivalent` without defining (usually impliclty) the mathematical universe in which you’re operating. Which means that the map constructed via this geometry — and the physics of that relational world, its climate & weather — are skewed, twisted, and broken.” (2026-03-28-1016-emsenn-personal-log.md, “Practical implications?”) **OWNER-STATED**

A bare `key: value` pair never carries its own universe with it. RMN’s whole discipline — typed, total, one grammar, five types fixing what a term can even mean before it is written — exists specifically to supply the universe a frontmatter colon leaves implicit and, per the founder’s own March reading, “impliclty” broken.

The second reason is structural, and this chapter has already proved it without naming it as a limitation. The frontmatter fibration is, by its own source’s own description, the *degenerate* case of a hyperdoctrine: a discrete base with no morphisms between keys, and fibers that are bare sets, not lattices — “there is no implication structure within a fiber… there are no reindexing maps because the base is discrete.” A structure with no reindexing has no orders on its values, and a structure with no orders cannot carry FOUR’s own truth order and knowledge order the way Chapter 3 requires. Without those two orders there is no charge to assign, in the sense Chapter 2’s own predication cell needs a charge assigned to it, and without a charge there is no way to hold ⊤ — contested, told both — as a real, retained state rather than a contradiction the fibration has no room to represent. Nor does a discrete base give any structure for the trace SEAVT commits to time: no cover, no ordinal, nothing for *σ* and *Δ* to settle over. A frontmatter fibration cannot hold contradiction, and it cannot hold time; RMN cells with separately-assigned charge and a journaled SEAVT trace can hold both, and are what the org actually builds on.

## Ledger

| Claim                                                                                                                                                                                                                                                                    | Grade        | Exact theorem, module, or carrier                                                                                                                                         |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| YAML frontmatter’s `file -> key -> value` is literal Fregean function application, not metaphor                                                                                                                                                                          | DOCUMENTED   | `2026-03-28-note-on-yaml-frontmatter-as-fregean-predicate-fibration.md`, §1.2, status: draft                                                                              |
| The fiber *F*_(*k*) = {*v* : ∃*f*, *k*(*f*) = *v*}, and the vault’s predicate fibration is a degenerate hyperdoctrine (discrete base, set fibers, no reindexing)                                                                                                         | DOCUMENTED   | same carrier, §2.1, §2.3                                                                                                                                                  |
| Three enrichments toward a full hyperdoctrine: ordered fibers, dual keys, directory context                                                                                                                                                                              | DOCUMENTED   | same carrier, §2.3                                                                                                                                                        |
| Divergence in a fiber (e.g. 800 files asserting one value, 1 asserting another) is reported, not treated as a schema error                                                                                                                                               | DOCUMENTED   | same carrier, §3.1                                                                                                                                                        |
| “The cell shape itself never collapses below three coordinates; the binary base *E* × *E*… is the minimal index, and unary predicates are derived structurally rather than admitted as a separate primitive”                                                             | DOCUMENTED   | `voidmath/terms/predication-cell.md`, 2026-04-28                                                                                                                          |
| A predication cell’s value is assigned by a separate valuation *v* : cells → *A*_(*p*); the cell itself carries no value                                                                                                                                                 | DOCUMENTED   | `voidmath/terms/predication-cell.md`                                                                                                                                      |
| Filed reversal: a 2026-08-10 note first ruled a predication cell is “an address a charge is posited onto,” then the same day reversed to “predication is irreducibly triadic,” against its own named voidmath source — the corpus grades the triadic reading higher      | DOCUMENTED   | `2026-08-10-note-on-node-operations-graph.md`, “Ruling, 2026-08-10” item 2, and “Correction, same day”                                                                    |
| `structure PredicationCell` as an ordered triple (subject, predicate, object), no coordinate collapsible                                                                                                                                                                 | PROVED       | `Obsmetrologia.PredicationCell`, `Obsmetrologia/Language/Predicating/Cell.lean`                                                                                           |
| The seed of a bare utterance is the reflexive triple `⟨token, claim, token⟩`                                                                                                                                                                                             | PROVED       | `Obsmetrologia.PredicationCell.seed`, `Cell.lean`                                                                                                                         |
| Converse is an involution, and is not equal to the original cell whenever subject and object differ                                                                                                                                                                      | PROVED       | `Obsmetrologia.PredicationCell.converse_converse`, `Obsmetrologia.PredicationCell.converse_ne`, `Cell.lean`                                                               |
| RMN’s real grammar is five types (`base`, `arrow`, `prod`, `unit`, `list`) and eleven term forms (`var`, `lam`, `app`, `pair`, `fst`, `snd`, `star`, `mark`, `coincide`, `cond`, `fold`); charge and the join/meet operations are composed helpers, not separate opcodes | IMPLEMENTED  | `relation-model-notation-service/src/types.mjs`, `relation-model-notation-eval-service/src/index.mjs`, confirmed in `2026-08-10-note-on-node-operations-graph.md`, §F.2.4 |
| SEAVT specializes plain EAVT so each of E, A, and V is a typed RMN claim; T stays the stored-time coordinate; rows are journaled append-only and committed with an RFC 6920 `ni:` content-hash                                                                           | DOCUMENTED   | `content/text/glossary/terms/seavt.md`                                                                                                                                    |
| SEAVT’s three strata — Level 0 asserted, Level 1 saturated (`Fix σ`), Level 2 settled (`H* = Fix σ ∩ Fix Δ`) — are derived passes over the trace, never stored fields, realized by `@red-cup-engineering/eavt`’s `saturate`/`transfer`/`stratify`                        | IMPLEMENTED  | `seavt.md`, “Strata”; `@red-cup-engineering/eavt` (0.5.0), `src/eavt.mjs`                                                                                                 |
| “The YAML-frontmatter approach is strange and kind of bad”                                                                                                                                                                                                               | OWNER-STATED | 2026-09-03                                                                                                                                                                |
| “`:` almost never just means `Relating`… without defining (usually impliclty) the mathematical universe in which you’re operating”                                                                                                                                       | OWNER-STATED | 2026-03-28, `2026-03-28-1016-emsenn-personal-log.md`, “Practical implications?”                                                                                           |
| A degenerate fibration (discrete base, no reindexing, fibers as bare sets) has no orders and no charge, so it cannot hold contested/`⊤` as a retained state, and no cover or ordinal for a trace to settle over, so it cannot hold time                                  | DOCUMENTED   | `2026-03-28-note-on-yaml-frontmatter-as-fregean-predicate-fibration.md`, §2.3, read against `FiberAlgebra.lean` and `seavt.md`, “Strata”                                  |
