# Order before distance

## Teaching question

What mathematical structure can we know when we know which events may precede
which other events, but have not yet chosen—or cannot yet recover—a notion of
distance?

## The core distinction

A distance answers a quantitative question: *how far apart are these two
objects?* An order answers a relational question: *may this one come before
that one?* Those are different kinds of information. A causal order can rule
out possibilities and organize events even when it cannot assign lengths,
durations, angles, or a unique embedding.

For this lesson, model events as elements of a set `E` with a relation `≺`.
Read `x ≺ y` as “x causally precedes y.” A strict partial order is:

- irreflexive: never `x ≺ x`;
- transitive: if `x ≺ y` and `y ≺ z`, then `x ≺ z`;
- not necessarily total: two events can be incomparable.

One may instead use a reflexive convention `x ≼ x`; the choice changes the
axioms' spelling, not the teaching point. Students should state which
convention they use.

The causal-set program takes this distinction seriously. Its basic object is
a locally finite partially ordered set: causal order supplies qualitative
causal structure, while local finiteness supplies discrete volume information.
Surya's review explains the central reconstruction motivation: in Lorentzian
settings, causal order together with volume information can encode far more of
the spacetime geometry than either does alone. Sorkin's review develops the
same program as a route to discrete gravity. Neither claim says that an
arbitrary poset is already a metric space or a physically faithful spacetime.

## A worked finite example

Let `E = {a,b,c,d}` and let the covering relations be

`a ≺ b`, `a ≺ c`, `b ≺ d`, and `c ≺ d`.

Transitivity also gives `a ≺ d`. The events `b` and `c` are incomparable. The
order therefore describes a diamond: one event can influence two mutually
incomparable events, either of which can influence a later event.

What does this establish?

- `a` is before `d`.
- There are two distinct chains from `a` toward `d`.
- `b` and `c` are not causally ordered by the supplied relation.

What does it *not* establish?

- that `b` and `c` are equally far from `a`;
- that either chain has a specified duration;
- that the diagram's drawn angles or edge lengths have meaning;
- that there is a unique metric or embedding realizing the order.

Drawing a Hasse diagram is a visualization of order. The ink's Euclidean
geometry is not automatically geometry of the represented system.

## Why this matters for kinematic space

Later lessons will treat extended objects—boundary intervals or bulk
geodesics—as points of another space. Czech, Lamprou, McCandlish, and Sully
show how a kinematic space of geodesics in AdS3 can carry a Crofton form tied
to boundary entanglement data. That sophisticated construction depends on
being disciplined about which relations are primitive and which geometric or
information-theoretic quantities are derived. This opening lesson therefore
trains the habit needed later: do not smuggle a metric conclusion into an
order-theoretic premise.

## Established claims and scope limits

1. Partial orders can represent causal precedence while leaving some pairs
   incomparable. This is elementary order theory.
2. In the causal-set approach, causal order and local finiteness are distinct
   ingredients; local finiteness is associated with discrete volume. This is
   an established description of that research program, not evidence that the
   program is experimentally confirmed.
3. Results relating causal structure to Lorentzian conformal geometry require
   hypotheses. They do not license “every poset determines a unique metric.”
4. Kinematic-space constructions have precise settings and inputs. The
   interval/geodesic construction in holography should not be generalized to
   every “space of relations” without a new argument.

## Negative control

Invalid inference: “The longest chain between two events has three links, so
their physical distance is exactly three units.”

Why invalid: chain length is an order-derived combinatorial quantity. Turning
it into a physical length requires a model, scaling, sampling assumptions, and
usually additional geometric information. The order alone does not provide
those choices.

## Cinematic direction

Begin with points floating in darkness. Connections appear only when one event
can influence another. Rotate the drawing so its apparent Euclidean lengths
change while the arrows and comparabilities stay invariant. Build the
four-event causal diamond, visually separate its transitive closure from its
covering relations, then dissolve the drawn ruler. End by transforming each
interval into a luminous point in a new space, foreshadowing kinematic space
without claiming that construction has already been derived.

## Assessment

Given a five-event relation, the learner must:

1. test irreflexivity and transitivity;
2. identify incomparable pairs;
3. draw a Hasse diagram;
4. list two statements determined by the order;
5. reject at least one metric conclusion that the order does not determine.

## Primary sources

- Sumati Surya, “The causal set approach to quantum gravity,” *Living Reviews
  in Relativity* 22, 5 (2019), arXiv:1903.11544.
  https://arxiv.org/abs/1903.11544
- Rafael D. Sorkin, “Causal Sets: Discrete Gravity,” in *Lectures on Quantum
  Gravity* (2005), arXiv:gr-qc/0309009.
  https://arxiv.org/abs/gr-qc/0309009
- Bartłomiej Czech, Lampros Lamprou, Samuel McCandlish, and James Sully,
  “Integral Geometry and Holography,” *JHEP* 10 (2015) 175,
  arXiv:1505.05515.
  https://arxiv.org/abs/1505.05515

## Rights and reuse boundary

This packet is original synthesis produced for the Harmonious Union. Its reuse
grant covers the packet text for NotebookLM transformation, mathematics
curriculum products, and public YouTube release. The cited papers retain their
own rights; links and attributed claims do not transfer or relicense them.
