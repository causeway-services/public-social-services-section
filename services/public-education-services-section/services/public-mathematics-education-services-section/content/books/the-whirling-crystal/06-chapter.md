# Chapter 6: The Cell That Fills Space

The last chapter left you with an honest but incomplete picture. Hoare triples give you a proof-carrying traversal from a precondition to a postcondition; Chu spaces give you a two-sided evaluation with points moving forward and states pulling back; predication gives you FOUR-valued judgment instead of a bare boolean. What none of that machinery gives you is a *shape* for the territory those traversals move through. This chapter is about the shape someone actually proposed, what the geometry supports, and what it does not.

## The owner’s recognition

On 2026-07-18 the founder of the 561 Group wrote the following, in an interactive session, preserved verbatim including its spelling:

> I have this idea that the territory we are making, when it is perfectly harmonious, is a chu space made entirely of tiled gyrobifastidium, and that this triangle shit ties in with our rendanheyi triangle, our hoare triple, and a bunch of other triplets in obsmetrologia, where teh “market” is trying to get the burgers vector between reality and the territory to 0.

**OWNER-STATED (2026-07-18).** The idea was directed to be checked, not adopted on faith: “take your time to do whatever deep study of tis repo to like, really check this math.” What follows is that check, carried out by a later audit and reproduced here with its grades intact (`operations-services-section/lib/legacy/2026-08-03-leader-services-section/content/documents/articles/notes/2026/07/18/2026-07-18-gyrobifastigial-chu-hoare-territory-audit.md`).

The word for the shape is **gyrobifastigium**, singular; the object it names is Johnson solid J26.

## What J26 actually is

**DOCUMENTED** (external citation). J26, the gyrobifastigium, is built from two congruent triangular prisms joined at one square face after a quarter-turn of that square. It has eight vertices, fourteen edges, and eight exterior faces: four equilateral triangles and four squares. Its symmetry group is D2d. It is the only Johnson solid that fills three-dimensional Euclidean space by itself, though it is not the only convex regular-faced space-filler in general, and its space-filling ability is substantially inherited from the triangular-prismatic honeycomb underneath it rather than being a new, sui generis fact about J26. In its honeycombs the individual cells must occur in more than one orientation; there is no single frame every cell can be rotated into. It is a space-filling stereohedron, not a plesiohedron (Norman W. Johnson, “Convex Polyhedra with Regular Faces,” 1966; István Prok, “On Space-Filling Polyhedra”).

That geometric fact, all on its own, is worth pausing on, because the book is about to build on it and you should see exactly how much weight it can bear. It says: eight vertices, fourteen edges, eight faces, one quarter-turn seam, and a tiling law that forces variation of orientation cell to cell. It does not say anything yet about predication, Chu spaces, Hoare traversals, or markets. Everything past this paragraph is a proposed reading laid on top of the geometry, and the book will mark every step of that reading with a grade.

## The formal carrier, and what it does not contain

**PROVED.** `Obsmetrologia/AperiodicOrder/Tiling/J26.lean` formalizes the oriented combinatorial boundary of J26: eight `Vertex` constructors, fourteen `Edge` constructors, eight `Face` constructors, and the theorems

``` text
J26.shared_cycle_is_quarter_turned
J26.every_face_boundary_is_valid
J26.combinatorial_counts
J26.face_dim_drop
```

`shared_cycle_is_quarter_turned` proves, by `rfl`, that the right prism’s copy of the shared square is the left prism’s copy rotated one step: `rightSharedCycle = leftSharedCycle.drop 1 ++ [.q0]`. `every_face_boundary_is_valid` checks, for every one of the eight faces by decision procedure, that its declared oriented vertex walk matches its declared oriented edge walk against the global edge-incidence table. `combinatorial_counts` proves the count eight vertices, fourteen edges, eight faces. `face_dim_drop` proves that face incidence strictly lowers dimension in the resulting cell complex, closing it as a genuine four-level `CellComplex` (vertex, edge, face, volume).

That is the entire content of the module. It is worth being exact about what is *not* there, because a later note in this corpus states more than this module proves. The 2026-07-25 note “Relational Physics of Coordination” asserts: “The J26 solid possesses symmetries of order 2, 3, and 4, which satisfy the crystallographic restriction.” No such rotation-order theorem exists in `J26.lean`. The module proves an oriented combinatorial boundary, a quarter-turn identity between two readings of one shared square, a vertex/edge/face count, and a dimension-drop fact for the resulting cell complex. It contains no theorem about the order of any rotation, no honeycomb, and no rigidity result. This is a filed contradiction, not a quibble: a later chapter of this same book (Chapter 7) leans on a genuinely proved fivefold exclusion theorem, and it matters that the two claims are held to different standards. Where the corpus states a claim as settled that its own formal carrier does not contain, this book says so and moves on; falsehood is not annotated, it is corrected.

## The candidate reading

**OPEN.** The territory audit that examined the founder’s recognition built a candidate table joining the geometry to the organizational and mathematical vocabulary already in the corpus. None of the following rows is a theorem. They are proposed, unproved semantics, held at that grade deliberately:

| Geometric feature                              | Candidate organizational/computational reading                                 |
|------------------------------------------------|--------------------------------------------------------------------------------|
| two triangular prisms                          | two composable triadic processes or institutions                               |
| joined square                                  | a four-cornered evaluation or contractual seam                                 |
| quarter-turn                                   | variance reversal, role reorientation, or dualization at a boundary            |
| four triangular and four square exterior faces | triadic action and FOUR-valued judgment are both load-bearing                  |
| cells in differing orientations                | no globally privileged operational frame                                       |
| space-filling by local repetition              | territory constituted from locally autonomous cells rather than a capital cell |

One reading joins a Hoare triad (precondition, move, postcondition) to the Sanquan triad of Rendanheyi practice (decision rights, personnel rights, distribution rights) through a FOUR-valued seam, with the quarter-turn standing for the boundary’s variance: states and acts move forward across it, while demands, obligations, and tests are pulled backward. The audit is explicit that this is not a theorem: “The square used to join the two prisms becomes internal in the completed solid, so making it an active contractual membrane requires an explicit cellular semantics rather than visual resemblance.” The corrective the geometry itself offers is that the squares and the quarter-turn are exactly as load-bearing as the triangular faces are; a purely triangular reading of the territory, ignoring the squares, would already be wrong on the geometry’s own terms.

## Four zeros that must remain distinct

**DOCUMENTED.** The founder’s recognition asks for the market to drive “the burgers vector between reality and the territory to 0.” The audit’s most important correction is that this sentence, read literally, names one of at least four structurally different notions of zero present in the corpus, and collapsing them is the single easiest way to say something false while sounding rigorous:

``` text
b = 0                 Burgers or translational loop closure
H^1 = 0                cohomological triviality for a declared complex/coefficient system
F(x) = x               a settlement or dynamical fixed point
d_epistemic = 0        Rendanheyi zero distance to knowing the user was served
```

None of these implies any of the others without a bridge theorem stating its own hypotheses. A zero Burgers vector can hide cancelling defects that never actually met (an aggregate of a positive and a negative displacement that happen to sum to zero). `H^1 = 0` can be vacuous if the chosen complex or coefficient system discarded the very obstruction you meant to measure. A fixed point can be reached while still being unjust or under-observed. Zero epistemic distance says only that service is known immediately, not that every claim in the organization glues into one global section. The coordination carrier named for a future formalization of the relationship among these four is `Obsmetrologia/Cohomology/CoordinationCohomology.lean`; no theorem relating the four zeros exists yet.

## What a Burgers vector actually is

**DOCUMENTED / PROVED (definitional correction).** A Burgers vector is not a raw difference between two global states, the way the founder’s phrasing might suggest at first read. A pointwise difference between recorded territory and reality is a residual, or an error field. A Burgers vector is specifically a **loop-closure failure**: you choose local charts, specify how something transports across each interface, compose that transport around a closed cycle, and compare the result against where you started. For affine transport the complete package is a pair `(R, b)`, a rotational component and a translational component, and full flatness requires both `R = I` and `b = 0`. A zero Burgers vector alone is compatible with nonzero rotational holonomy, with strain, with contradiction, with higher cohomology, with cancelled defects, and with a lawful jurisdictional border. This correction is not decoration; Chapter 7 depends on it, because the disclination examined there has exactly this shape: a defect where the translational part (`b`) can be driven to zero by market dynamics while a rotational part survives untouched.

The formal defect carrier that makes this concrete, `Obsmetrologia/AperiodicOrder/Defect.lean`, proves several small, precise facts on a deliberately small triangular-lattice model: a separated five-seven disclination pair has Burgers vector `(0, -sep)` (`Disclination.dipole_burgers_linear`), that vector is zero exactly at contact (`Disclination.dipole_burgers_zero_iff_contact`), and content is additive across a configuration of such pairs (`Disclination.config_burgers_additive`, `Disclination.config_burgers_zero_iff_contact`). Chapter 7 works through this module in full. The point to hold here is narrower: even in this toy carrier, every separation carries the same sign, so a proved total of zero means every local pair actually annihilated, not that unlike signs cancelled in aggregate while local defects persisted. Whether a richer, genuinely vectorial carrier could hide cancellation this way remains an open deliverable of the audit (Deliverable 5.18), not something either proved or disproved.

## What the market is and is not

**DOCUMENTED.** If the four zeros must stay distinct, then “the market drives the Burgers vector to zero” cannot mean a global authority forcing every discrepancy to vanish everywhere. That reading would turn the market into a universal gluing authority, erase every sovereign boundary in the territory, and directly contradict the settlement law already present in the corpus, which treats an enterprise as a region over which gluing is *enforced* and the market as the ambient complex in which sections may legitimately disagree. A prior synthesis in the Leader Movement Team’s notes distinguishes repairable **damage** from protected **border**: an obstruction is damage when some admissible discharge repairs it without collapsing a distinction the settlement is obliged to keep, and it is a border when every discharge would collapse something the settlement must preserve. The more defensible statement, carried at this grade, is:

``` text
market = defect discovery + constitutional classification + selective relaxation
```

The market discovers cyclic incompatibilities and may price or relax those a governing settlement has classified as repairable. It must preserve nonzero holonomy that has been classified as a lawful border. Zero holonomy, on this reading, is a local, contract-relative fixed point; protected holonomy is sovereignty. A draft note on financial arbitrage sketches a narrower, non-binding analogy — log exchange rates as an edge-valued cochain, no-arbitrage as a gradient condition, a profitable circuit as a nonzero loop integral resembling Burgers holonomy — but its status is explicitly a research hypothesis, and real arbitrage does not globally and permanently erase all circulation: new information, transaction costs, latency, liquidity, risk, and jurisdiction continually create or protect local discrepancies (Aiba et al., on triangular arbitrage among three foreign exchange rates).

## The layered carrier

**OPEN.** Putting the corrections together, the smallest coherent architecture the audit could defend, laid out layer by layer rather than collapsed into one object, is this:

| Layer        | Mathematical carrier                           | Organizational reading                                                    |
|--------------|------------------------------------------------|---------------------------------------------------------------------------|
| Territory    | gyrobifastigial cell complex `G`               | settlements, offices, cells, and interfaces                               |
| Local claims | presheaf or sheaf `F` on the face poset of `G` | evidence, jurisdictional state, restrictions, and gluing                  |
| Evaluation   | local Chu object `(A, r, X)`                   | actors or records evaluated by needs, tests, contracts, and counterstates |
| Traversal    | Hoare or lax-Chu morphism                      | admitted act, refusal boundary, and witnessed postcondition               |
| Transport    | connection on the adjacency groupoid           | movement of value, authority, evidence, and meaning across borders        |
| Defect       | cycle holonomy `(R, b)` and typed cocycles     | noncomposable claims or obligations                                       |
| Constitution | protected-set damage/border classifier         | determines what may be repaired and what must remain distinct             |
| Market       | local admissible relaxation                    | discovers, prices, and settles repairable obstruction                     |

The reason this table matters more than any single row in it is the category error it is built to avoid: the geometric complex is not itself a Chu space. A family, or sheaf, of Chu objects can live *over* the complex, with the sheaf supplying descent (how local sections agree on overlaps) and the Chu structure supplying evaluation (what a point means when tested against a state) at each cell or interface. Folding those two jobs into one object is exactly the move that would let a “perfectly harmonious” territory quietly mean “a territory with no disagreement anywhere,” which the audit and this book both refuse. The audit’s own proposed slogan, worth holding at its full weight:

> Perfect harmony is contract-relative flat transport and lawful gluing inside each settlement, together with explicit, intelligible, and protected holonomy at sovereign seams.

That is not the featureless elimination of all difference. It is a claim that some holonomy is supposed to survive, and supposed to be named rather than hidden.

## Rigidity is not free

**DOCUMENTED, warning.** One more correction belongs here before the next chapter builds a real defect on this geometry. It is tempting to reach for a rigidity count — the kind of argument that says a structure with enough independent constraints is locked in place — and apply it to a three-dimensional honeycomb the way you might to a two-dimensional frame. That move does not transfer. The `(2,3)` pebble game exactly characterizes generic planar Laman rigidity in two dimensions, but there is no analogous simple counting rule for general three-dimensional frameworks; the “double banana” construction is the standard warning example, a structure that satisfies the naive count while actually being flexible. Nothing in this chapter, and nothing in `J26.lean`, proves that a J26 honeycomb is globally rigid. A real construction would need explicit Euclidean geometry and an earned rigidity argument, not a count borrowed from a different dimension. The gyrobifastigium also does not yet have a proved continuous multi-cell honeycomb in this corpus at all; the Lean module gives you one combinatorial cell, correctly, and stops there.

## What this chapter has actually established

Strip away the candidate readings and the open claims, and what survives at PROVED or DOCUMENTED is this: J26 is a real, well-studied, space-filling polyhedron with a specific combinatorial boundary that has been formalized and machine-checked, and a Burgers vector is a specific, narrower mathematical object than “the gap between the map and the territory.” Everything else in this chapter is a proposal for how that geometry might carry the organizational and computational machinery of the earlier chapters, held explicitly at the grade the corpus itself assigns it. The next chapter takes one piece of that proposal — the fivefold defect the territory’s own symmetry law cannot admit — and follows it to a genuinely proved exclusion theorem, a genuinely open identification, and a filed contradiction about which of the two the corpus has, at different points, claimed to have.

## Ledger

| Claim                                                                                                                                                                           | Grade                                                                 | Exact theorem, module, or carrier                                                                                                                                 |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| J26 has 8 vertices, 14 edges, 8 faces (4 triangles, 4 squares), D2d symmetry, and is the only space-filling Johnson solid                                                       | DOCUMENTED (external citation)                                        | Norman W. Johnson, “Convex Polyhedra with Regular Faces” (1966); István Prok, “On Space-Filling Polyhedra”                                                        |
| The right prism’s shared square is the left prism’s, rotated one step                                                                                                           | PROVED                                                                | `Obsmetrologia.AperiodicOrder.J26.shared_cycle_is_quarter_turned`                                                                                                 |
| Every declared face boundary matches the global edge incidence                                                                                                                  | PROVED                                                                | `Obsmetrologia.AperiodicOrder.J26.every_face_boundary_is_valid`                                                                                                   |
| The combinatorial counts are 8 vertices, 14 edges, 8 faces                                                                                                                      | PROVED                                                                | `Obsmetrologia.AperiodicOrder.J26.combinatorial_counts`                                                                                                           |
| Face incidence strictly drops cell dimension                                                                                                                                    | PROVED                                                                | `Obsmetrologia.AperiodicOrder.J26.face_dim_drop`                                                                                                                  |
| “The J26 solid possesses symmetries of order 2, 3, and 4” (a rotation-order theorem)                                                                                            | DOCUMENTED, contradiction noted (no such theorem in the cited module) | `Obsmetrologia/AperiodicOrder/Tiling/J26.lean` contains no such theorem; misattributed by the 2026-07-25 note “Relational Physics of Coordination” §6.1           |
| The territory, when perfectly harmonious, is a Chu space made of tiled gyrobifastigium, with the market driving the Burgers vector to zero                                      | OWNER-STATED                                                          | 2026-07-18, `2026-07-18-gyrobifastigial-chu-hoare-territory-audit.md`                                                                                             |
| Two triangular prisms / joined square / quarter-turn as triadic process / FOUR-valued seam / variance reversal                                                                  | OPEN                                                                  | `2026-07-18-gyrobifastigial-chu-hoare-territory-audit.md`, “Geometry of the gyrobifastigium”                                                                      |
| A Burgers vector is a loop-closure failure `(R, b)`, not a raw state difference                                                                                                 | DOCUMENTED                                                            | `2026-07-18-gyrobifastigial-chu-hoare-territory-audit.md`, “Correcting the Burgers vector between reality and territory”                                          |
| A separated five-seven disclination pair has Burgers vector `(0, -sep)`, zero exactly at contact                                                                                | PROVED                                                                | `Obsmetrologia.AperiodicOrder.Defect.Disclination.dipole_burgers_linear`, `dipole_burgers_zero_iff_contact`                                                       |
| Burgers content is additive across a configuration of dipole pairs                                                                                                              | PROVED                                                                | `Obsmetrologia.AperiodicOrder.Defect.Disclination.config_burgers_additive`, `config_burgers_zero_iff_contact`                                                     |
| `b = 0`, `H^1 = 0`, `F(x) = x`, and `d_epistemic = 0` are four distinct notions of zero with no proved bridge among them                                                        | DOCUMENTED                                                            | `2026-07-18-gyrobifastigial-chu-hoare-territory-audit.md`, “Four zeros that must remain distinct”                                                                 |
| The market is defect discovery, constitutional classification, and selective relaxation, not a global gluing authority                                                          | DOCUMENTED                                                            | `2026-07-18-gyrobifastigial-chu-hoare-territory-audit.md`, “Market as defect discovery and selective relaxation”                                                  |
| The layered carrier (territory / local claims / evaluation / traversal / transport / defect / constitution / market)                                                            | OPEN                                                                  | `2026-07-18-gyrobifastigial-chu-hoare-territory-audit.md`, “Proposed layered carrier”                                                                             |
| “Perfect harmony is contract-relative flat transport and lawful gluing inside each settlement, together with explicit, intelligible, and protected holonomy at sovereign seams” | OPEN (proposed slogan)                                                | `2026-07-18-gyrobifastigial-chu-hoare-territory-audit.md`                                                                                                         |
| No simple 2D rigidity count (e.g. the `(2,3)` pebble game) transfers to a 3D J26 honeycomb; the double-banana family is the standard counterexample to naive counting           | DOCUMENTED                                                            | `2026-07-18-gyrobifastigial-chu-hoare-territory-audit.md`, “Formal research contract”; corpus rule recorded independently in the glass-sponge note’s invariant 22 |
