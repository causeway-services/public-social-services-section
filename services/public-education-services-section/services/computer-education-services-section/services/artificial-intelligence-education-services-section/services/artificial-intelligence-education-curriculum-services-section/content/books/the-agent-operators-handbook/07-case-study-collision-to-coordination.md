---
title: "Chapter 7: Case Study — From Collision to Coordination"
---

# Chapter 7: Case Study — From Collision to Coordination

## A note on this chapter

Every other example in this book is a composite, built to be
representative rather than a transcript of one specific event. This
chapter is different: it walks a real, dated incident, from a single
operator's own engineering log, involving two of their own concurrent
agent sessions sharing one repository on the same day. Service names,
directory structure, and other identifying detail have been generalized
into plain descriptions — a "card-game service," "the router
configuration" — because the specifics don't matter to the lesson and
aren't this book's to publish. The shape of what happened, the timing,
the collision, and the resolution are real.

## The setup

One developer was migrating a fleet of roughly sixteen small web
services — mostly single-page game and utility apps — off an aging
hosting setup and onto a modern serverless edge platform, one service at
a time. This is exactly the kind of task that benefits from running more
than one AI coding agent at once: each service's migration is largely
independent, the codebase for each is small, and the developer had two
concurrent agent sessions open, each working through its own subset of
services against the same shared git repository — checked out once, on
one machine, with nothing committed yet in either session's working
changes.

Neither session had any built-in visibility into what the other was
doing. They were two separate conversations, in two separate windows,
each with its own agent, both pointed at the same uncommitted working
tree.

## The collision

One session (call it Session A) had already migrated five services
successfully: each one now pointed, in the shared routing configuration,
at its new home on the edge platform instead of the old dead server. The
old routing entries for those five services — no longer needed once the
migration completed — were staged for removal as part of finishing that
work cleanly.

The second session (Session B), working on a different, unrelated batch
of services in parallel, encountered those staged removals while
reviewing the routing configuration for its own purposes. Its dispatched
agent, seeing routing entries that had changed since the last commit
with no explanation visible from Session B's own vantage point, judged
them to be **drift** — an unexplained, unexpected difference between
what the configuration claimed and what a prior known-good state showed
— and "fixed" it. It reverted the staged removals and redeployed the
routing configuration to what it understood to be the last-known-correct
state.

This is the failure worth sitting with carefully, because the agent's
individual reasoning was not obviously wrong from where it stood.
Reverting an unexplained, unstaged-looking change back to a known-good
baseline is a completely reasonable instinct *when the unexplained
change really is drift* — some unintended difference nobody meant to
introduce. The agent had no way to know, from its own scope, that the
change wasn't drift at all: it was another session's legitimate,
in-progress, correct work. The moment that revert deployed, all five of
Session A's already-migrated services got silently re-pointed back at
their old, now-dead origin servers. Five live services went down, not
because either agent made an isolated mistake, but because two
correctly-functioning agents, working from disjoint views of the same
shared resource, produced a genuine collision.

## Why this matches Chapter 2 and Chapter 5, not just bad luck

It's tempting to read this as simply "an agent made a mistake." It's more
useful, and more accurate, to read it against the disciplines already
covered in this book. This was, in effect, an *unplanned* fan-out: two
agents were operating concurrently against overlapping territory — the
shared routing configuration — without either session's brief stating
that boundary explicitly, and without the disjoint-scope rule from
Chapter 2 being enforced on a shared file that both sessions' work
happened to touch. And it's a sharp illustration of a distinction from
Chapter 5: an unfamiliar, unexplained change in a shared resource is not
automatically drift to be corrected. It might be another party's
legitimate, still-in-progress work — and treating "I don't recognize why
this changed" as proof that it's wrong, rather than as a signal to ask
before acting, is exactly the kind of unverified assumption Chapter 5
warns against, just applied to infrastructure state instead of a
report.

## The resolution: division by message

Once the outage was noticed — five services suddenly serving errors
instead of their expected pages — the two sessions did not resolve this
by one side unilaterally deciding it was right and re-reverting the
other's revert, which would have simply restarted the same collision in
the opposite direction. They resolved it by direct communication and an
explicit division of custody:

- **Session A kept custody of the shared routing configuration.** Since
  its work was the one affected, and it had the clearest picture of what
  the correct end state should look like, it took ownership of
  re-trimming the routing entries correctly and redeploying to restore
  the five services.
- **Session B ceded routing custody entirely** for the remainder of the
  work, keeping only the two services it had legitimate, exclusive
  ownership of, and froze any further edits to the shared routing
  configuration going forward.
- **Both sessions exchanged an explicit path manifest** — a plain
  statement of exactly which files or configuration sections each
  session owned going forward — so that neither agent, in either
  session, would again encounter the other's legitimate in-progress
  state and have to guess what it meant.
- **A set of services neither session had touched yet** were explicitly
  left alone by mutual agreement, rather than either session assuming it
  was safe to proceed with them unilaterally now that a collision had
  already happened once.

## The rule this incident supports

The standing rule that comes out of this incident, stated plainly: when
two people or two agent sessions share one uncommitted working tree,
**stage only your own paths, never run a broad "add everything" style
commit across the whole tree, and treat another session's uncommitted
work as evidence of a boundary to respect — not drift to fix.** If
something looks wrong and you don't have full context for why, the
correct first move is to ask, not to revert. A revert is not a neutral,
safe default when you don't know who else might be mid-change on the
same resource; it is itself an action with a blast radius, and in this
incident, that blast radius was five live services.

## Applying this to your own concurrent sessions

If you run more than one agent session against a shared repository — the
exact situation this whole book is written for — build the path manifest
habit *before* you need it, not after your own version of this incident.
Before starting two sessions on overlapping work, write down, in plain
terms, which files or directories each session owns for the duration of
that work. If a session's agent encounters a change to a file outside
its own declared territory that it didn't make and doesn't recognize,
its default action should be to report the unexplained state and ask,
not to "fix" it by reverting. This is a small amount of upfront
coordination — a sentence or two exchanged between sessions, or written
down in a receipt per Chapter 6 — against the real cost this incident
shows: five live services down, and two sessions' worth of work spent
untangling what should have been prevented, not repaired.

The next chapter pulls every discipline from Chapters 1 through 7 into
one operating checklist, so you have something to actually run against
before your own next multi-agent session, rather than having to hold
seven chapters in your head at once.
