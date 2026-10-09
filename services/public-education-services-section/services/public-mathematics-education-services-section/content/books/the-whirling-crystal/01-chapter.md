# Chapter 1: The Absurd Beginning

Every research program has an actual first moment, even when the finished mathematics makes that moment hard to see later. This one’s first moment is not a theorem. It is a diary entry: the founder of the 561 Group, emsenn, sitting down on the morning of March 28, 2026, trying to talk themselves down from “weird math” and back toward something usable, and instead writing the seed of everything this book covers. This chapter reads that entry closely, quotes it at length, and shows what survived the trip from private meditation into working mathematics. Every claim in this chapter is **OWNER-STATED**: it is emsenn’s own words, quoted verbatim, dated, and nothing here claims more than that.

## Coming back from weird math

The log opens with an admission that the math it is about to describe is not, by ordinary standards, good math. emsenn writes:

> “The math… is only ever going to work as well as it works. My recent foray into it affirmed: by all known standards of math, it’s *broken* math. I can see where it breaks from normal math - or, from my perspective, where normal math inherits Platonic metaphysics - a lot more clearly, though, which should help, but that also means, I need to put it down and only pick it up to *use* it.” (`lib/emsenn/services/561-group/services/public-services-section/services/personal-services-section/emsenn-services-section/content/text/logs/personal-logs/2026/03/28/2026-03-28-1016-emsenn-personal-log.md`)

This is worth sitting with before moving on, because it sets the register for everything that follows in this book. The founder is not claiming to have discovered a hidden truth about mathematics. They are claiming to have found a place where their own thinking departs from the mathematics most working people were trained in, and they are explicit that the departure looks, from inside standard mathematics, like breakage. The honesty grading this book uses throughout — PROVED, IMPLEMENTED, DOCUMENTED, CONJECTURE, OPEN, OWNER-STATED — exists because this program started with that admission and never dropped it. A program that starts by admitting its own math might be broken has a specific obligation later, once parts of it *are* proved in Lean, to say clearly which parts those are and which parts are still just the founder talking.

## Harnessing the void

The entry’s real content begins with a question that sounds like a philosophy-class icebreaker and is treated, instead, as a live technical problem: “Why does something exist, instead of nothing.” emsenn’s answer moves fast:

> “But if we’re more specific, nothing is a configuration: it’s relationlessness, which is, unfortunately, a relation of having no relation with relating.” (2026-03-28-1016-emsenn-personal-log.md, “Harnessing the void”)

Read that sentence twice. It is doing real work. “Relationlessness” is being defined, but the definition offered — “a relation of having no relation with relating” — smuggles a relation back in on the way to denying one. emsenn notices this immediately and does not treat it as a mistake to fix. They treat it as the finding:

> “This sounds tautological, but being more specific again, we can see that ‘relation of having no relation with relating’ is a very specific thing: a subject (relation), a predicate (having no relation), and an object (the… object? the… subject again, but from a different perspective?)”

This is the first appearance, in this whole research program, of a subject-predicate-object shape emerging from trying to be precise about nothing at all. It is not yet the formal predication cell that Chapter 2 of this book builds in Lean — that comes from a different, later lineage, the org-roam predicate work discussed below — but it is the same intuition arriving from the philosophical side eleven months earlier: press hard enough on “no relation” and what you get back is not an absence, but a directed triple.

emsenn keeps pressing. The paradox does not resolve; it iterates:

> “And so, relating *must* be ‘having relation with something,’ which again sounds tautological until you turn it back toward our specific paradox: we’re now defining relationlessness as ‘the relation of having relation with ’… which has not actually *resolved* the paradox. But it has described it in more detail. Which is to say: we have a hypothesis for the theory for the hypothesis we’ve just created.”

And then the image that gives this book its title:

> “At this point, we have this little paradoxical contraption that takes Relationlessness, and through taking it seriously, creates a stream of directional Relating, which serves as a theory for hypothesis we just used to theorize about the *first* hypothesis, which itself was about a paradox. As this directional Relating moves through the structuration of theorem that asserted it originally, which is itself directional, the configuration is ‘spun’: one side facing toward conjecture, one side facing toward proof.”

“Spun” — a whirling configuration, one face toward conjecture, one face toward proof, generated by taking a paradox seriously instead of dismissing it — is exactly the shape this book’s title names. It is not a coincidence borrowed for marketing. It is the founder’s own word for the object this whole research program keeps rediscovering at every level: predication cells, Chu spaces, the gyrobifastigium’s own quarter-turn seam in the chapters that follow this half of the book. Two faces, one orientation, generated by refusing to let a paradox stay inert.

## The four grades: Absurd, Possible, Necessary, Determined

From the paradox of relationlessness, emsenn derives a four-stage progression that becomes the ancestor of the Belnap FOUR this book proves is forced in Chapter 3. The derivation is philosophical, not formal — nothing here is PROVED in the Lean sense — but the shape is exact enough to recognize later:

> “Relationlessness, it would seem, is such an absurdity.
>
> However, if we look at what just happened, we can see that Relationlessness went from an absurd prior truth, to something that is trying to relate, to something that is relating, to something that has related.
>
> This is a progression from absurdity, to possibility, to necessity, to determination. However, critically, the determination is reliant on an absurdity, and so itself becomes the structure for future progressions of absurdity to determination.” (2026-03-28-1016-emsenn-personal-log.md, “Absurdity of knowledge”)

“Absurd,” in the sense emsenn is using it here, is defined earlier in the same section by its older philosophical meaning: “a thing that is true because it is true, and has no way to NOT be true.” Absurdity is not foolishness; it is unconditioned truth, the kind of truth you cannot argue your way out of because nothing grounds it except itself. From that unconditioned starting point, emsenn traces a determinate sequence: Absurd, Possible, Necessary, Determined. And the sequence closes on itself rather than terminating:

> “So, without any base case, without any ‘this is true’ or ‘this is false’ to rest things on, suddenly, everything familiar loses ground.
>
> The best you can say is: Well, given what we’re accepting as true, this is either trivially true, as in, not related to anything we’ve already done, and so its true because it says it is and we have no way to measure that: Absurd.
>
> Or, if it relates to something Absurd, then, it becomes, relative to that, Possible, which makes the Absurd Necessary, and given it’s the witness/structure for what’s Possible, then it’s Determined, making what’s Possible Necessary and making space for new Possibilities.
>
> Which is me trying to say rather than True/False, we end up with a much stranger logic, where there are superficially four values (Absurd, Possible, Necessary, and Determined), but Absurd and Determined are two ends of the same open inquiry, exciting new Possibilities and affirming what’s Necessary, respectively, so what looks like a four-valued truth system turns into something closer to a linear logic that does something like term normalization, where every relational configuration boils down to some configuration of various Absurdities.” (“The map is not the territory”)

Two things are worth making explicit here, because later chapters depend on the reader having seen them once in the founder’s own words. First, this four-value system is not offered as a replacement for classical true/false; it is offered as what you actually need once you take seriously that some claims are unconditioned (Absurd) and some claims are the settled residue of a whole chain of relating (Determined), with Possible and Necessary doing the connective work between them. Second, emsenn already senses, in March, that Absurd and Determined behave like two poles of one axis rather than four unrelated states — “two ends of the same open inquiry.” That intuition anticipates, without proving, the distinction Chapter 3 of this book proves formally: FOUR carries two independent orders, not one four-way partition, and Absurd/Determined sit at the extremes of one of those orders while Possible/Necessary sit at the extremes of the other. The March log gets there by feel; the May proof gets there by falsifiable argument; the Lean gets there by machine-checked theorem. All three are the same shape, arrived at three different ways, and this book is careful throughout to say which way is which.

## Not a map, but a snapshot of the rules

The section titled “The map is not the territory” contains the entry’s single most quoted line, and it earns the quotation. emsenn is working through what it would mean to apply this whole apparatus to real data systems — what does a `key: value` pair in a YAML frontmatter block actually assert, once you take the Absurd/Possible/Necessary/Determined apparatus seriously as a reading of it:

> “And if we remember that our Absurdities are Absurd because they, like Relationlessness, try to claim Relating without Relation, and this irreducible configuration is their oreitnation relative to that primitive Absurd configuration, then we can recongize that what we have over any data is a filtered spatiotemporal manifold, where what has been Determined becomes the structure for the entanglement of what is Necessary and Possible, and that entanglement is governed by the relatioanl configuration of the Determined.
>
> So, not a map, but a snapshot of the rules/structure that make the map’s subject Necessary.” (“The map is not the territory”)

The spelling is preserved exactly as written; the log is a fast working draft, not a polished paper, and the house rule against annotating falsehood does not extend to silently correcting an owner’s own typing. “Filtered spatiotemporal manifold” is the phrase that gives the subtitle of the second half of this book its name, and it is worth being precise about what emsenn is and is not claiming with it in March 2026. This is not a claim about physical spacetime. It is a claim about the shape of a data structure: what has already been settled (Determined) forms the ground against which what is still live (Necessary and Possible) gets its structure, and that ground itself changes over time as more gets settled — hence “spatiotemporal,” hence “filtered,” in the sense a filtration in algebra is a nested sequence of substructures that grows. Nothing in this March entry proves that reading; it proposes it. The later chapters of this book’s second half — on causal time, on the knowledge order as an append-only log, on the predicated-inference kernel’s actual `saturate`/`settle` machinery — are where that proposal gets tested against running code and, in places, proved.

## Base and Claim

The entry’s final practical move is the one that turns philosophy into a data model. emsenn is thinking concretely about frontmatter — the `title:`, `date-created:`, `authors:` block at the top of a Markdown file — and working out what kind of thing a frontmatter entry actually *is*, given everything just derived:

> “This means that what we’re doing with our frontmatter is essentially writing very simple sentences: `subject -> predicate -> object`.
>
> Only as I just spent too long explaining, we don’t *have* predicates, and we also dont’ have subjects or objects: we don’t have anything solid and true like those things are: instead, we have witnessing of relational configurations, each of which boils down to some sort of Absurdity.” (“Practical implications?”)

From there emsenn works toward the two data classes that everything in this program still uses under one name or another:

> “I think what I’m seeing is that I need at least two data classes, Token and Claim, with Claim being two tokens held in a directional/oriented relationship.”

And then, refining further, arrives at the terminology this book’s Ledger tables will keep citing:

> “So we need three classes: one for Bases, one for Tokens, and one for Claims… well, but now Claims and Tokens are the same thing: an oriented/directional relation between two Bases.
>
> So, ten *Bases*, five primitive *Claims*, and then the compound claim that all these things relate to the file, which means the file would have to be its own *Base*, and… what holds the Claims together?
>
> Philosophically
>
> Base to Base relation is a Claim Base to Claim relation is a Claim Claim to Claim relation is Claim
>
> So every Claim reduces to a pair of Bases, the left-base and right-base, to bring it back to the language at the start of the conversation.”

Two data classes, Base and Claim, with the rule that a Claim is always, underneath any apparent complexity, reducible to an ordered pair of Bases — a left-base and a right-base. This is not yet the formal predication cell of Chapter 2, which is a triple, subject-predicate- object, not a pair. The March entry is explicit that predicates are not yet a solid third thing here; a Claim in this early model is directional, but it is directional the way an edge in a directed graph is directional, not the way a predicate in a sentence names a relation between two named things. Getting from a directional pair to a genuine triple with a named predicate coordinate is exactly the work Chapter 2 does, drawing on a different, later source. It is worth being honest about that gap here rather than smoothing it into false continuity: the March log gives you Base and Claim, a pair-reducible model; the predication cell gives you subject, predicate, and object, a genuine triple that does not collapse into a pair. Both are real parts of this program’s history. They are not the same claim, and this book does not pretend otherwise.

## The three queries

The March entry closes with a research question, not an answer, and it is worth recording because the whole program’s practical shape still follows it. Having settled on Base and Claim as the two data classes, emsenn asks what you would actually want to *do* with a structure built from them:

> “So then we can query a base, and see the structure of the claims that ‘determine’ it - hold it to one side of the claim - and the claims that derive from it - hold it on the other.
>
> And if we query a claim, we’d get the structure of the claims and their underlying bases to see what’s used in supporting *that* particular claim.
>
> And if we query a claim that doesn’t exist, we’d get the structure that would support that particular claim.” (“Practical implications?”)

Three queries: given a base, find what determines it and what it determines; given a claim, find its supporting structure; given a missing claim, find the structure that *would* support it if it existed. The third query is the one worth pausing on, because it is not a query most database systems can even express. Asking “what structure would support this claim, if it existed” is asking the system to reason about its own possible extensions — exactly the kind of question a predication system valued in a bilattice, where “no evidence yet” and “false” are different states, can actually answer, and a plain two-valued database cannot. This March entry does not build that system. It asks for it, six weeks before the Fregean predication proof in Chapter 3 supplies the mathematics that makes the question answerable and roughly five months before a working predicated-inference kernel, discussed in the second half of this book, implements `saturate`, `settle`, and `obstructionsOf` functions that are direct, running answers to exactly these three queries.

## The other origin: Fregean predicates from org-roam

The March log is this program’s philosophical origin, but it is not its only origin, and this chapter would misrepresent the record if it implied the predication-cell lineage in Chapter 2 grew directly out of the “relationlessness” meditation. It did not. It grew, independently, out of a much more mundane engineering problem emsenn had already been living with for months: how to structure the `:PROPERTIES:` drawer of an Org-roam note so that it says something machine-readable about how that note relates to others.

In a log entry from five months earlier, October 6, 2025, emsenn describes the practice directly:

> “So I didn’t do a good job writing much about it in my archive as I was reading about it, but I recently did a lot of reading into the Semantic Web, which led me to reading about resource description format and finally onto things like Fregean first-order predicates. This all coalesced around something I’d been slowly doing in my nodes anyway, which was writing a \[property\] into each Org-roam node, which has changed name and shape a few times, but I’m currently calling it the node-description \[property\].” (`lib/emsenn/services/561-group/services/public-services-section/services/personal-services-section/emsenn-services-section/content/text/logs/personal-logs/2025/10/06/2025-10-06-1126-emsenn-personal-log-about-building-fregean-predicates-from-org-roam-nodes.md`)

And the structural choice that mattered:

> “One way I’m thinking of this \[property\] is as a node’s secondary intension toward relational dynamics, and given that, the structure that seemed best was Fregian subject-predicate-object triplets, where each part of the triplet is another node in the database.”

This is the genuine first appearance, in the record, of the exact shape Chapter 2 formalizes: a subject-predicate-object triple in which every coordinate — not just subject and object, but the predicate too — is itself an addressable entity (in the Org-roam case, a node with its own stable ID). The log includes working Emacs Lisp that parses a node’s `RESOURCE-DESCRIPTION` property drawer into exactly that shape, extracting a `:subject-id`, `:predicate-id`, and `:object-id` from each entry. It is a practical tool built to solve a practical knowledge- management problem, written before the philosophical meditation on relationlessness, and it supplies the piece the March log is missing: a genuine third coordinate, not a collapsed pair.

Two lineages, then, feeding one program: a philosophical one, starting from “why does something exist instead of nothing” and arriving at Base and Claim; and an engineering one, starting from “how do I structure my notes” and arriving at subject-predicate-object triples where every coordinate is itself a node. Chapter 2 is where they meet, in a different carrier again — a March 2026 research note that reads ordinary Markdown frontmatter itself as Fregean predicate application, and a voidmath term that insists the resulting cell can never collapse below three coordinates. This book states the two origins as what they are: real, dated, and distinct, both true, neither one the whole story.

## Ledger

| Claim                                                                                                                                                         | Grade        | Exact theorem, module, or carrier                                                                          |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|------------------------------------------------------------------------------------------------------------|
| “It’s relationlessness, which is, unfortunately, a relation of having no relation with relating”                                                              | OWNER-STATED | 2026-03-28, `2026-03-28-1016-emsenn-personal-log.md`, “Harnessing the void”                                |
| The paradox of relationlessness “spins” a configuration, one side facing conjecture, one side facing proof                                                    | OWNER-STATED | 2026-03-28, `2026-03-28-1016-emsenn-personal-log.md`, “Harnessing the void”                                |
| The four grades Absurd, Possible, Necessary, Determined, with Absurd and Determined as two ends of one open inquiry                                           | OWNER-STATED | 2026-03-28, `2026-03-28-1016-emsenn-personal-log.md`, “Absurdity of knowledge”                             |
| “Not a map, but a snapshot of the rules/structure that make the map’s subject Necessary”; the data over any structure is “a filtered spatiotemporal manifold” | OWNER-STATED | 2026-03-28, `2026-03-28-1016-emsenn-personal-log.md`, “The map is not the territory”                       |
| Base and Claim as the two data classes; every Claim reduces to a left-base and a right-base                                                                   | OWNER-STATED | 2026-03-28, `2026-03-28-1016-emsenn-personal-log.md`, “Practical implications?”                            |
| The three queries: base to its determining/derived claims; claim to its supporting structure; missing claim to the structure that would support it            | OWNER-STATED | 2026-03-28, `2026-03-28-1016-emsenn-personal-log.md`, “Practical implications?”                            |
| Org-roam node-description drawers as Fregean subject-predicate-object triplets, each coordinate itself a node                                                 | OWNER-STATED | 2025-10-06, `2025-10-06-1126-emsenn-personal-log-about-building-fregean-predicates-from-org-roam-nodes.md` |
