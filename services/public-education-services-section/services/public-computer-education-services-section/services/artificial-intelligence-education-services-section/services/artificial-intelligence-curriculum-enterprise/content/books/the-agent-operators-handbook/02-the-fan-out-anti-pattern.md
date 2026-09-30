---
title: "Chapter 2: The Fan-Out Anti-Pattern"
---

# Chapter 2: The Fan-Out Anti-Pattern

## More agents is not more thoroughness

Once you've dispatched a handful of subagents and watched them come back
with real, useful results, a specific temptation shows up: a broad task
arrives, and running several agents against it in parallel *feels* like
the thorough version of doing it — surely eight agents each reading a
slice of the codebase will catch more than one agent reading the whole
thing sequentially?

Usually not. This is the fan-out anti-pattern, and it is worth a whole
chapter because it is expensive in a way that's easy to miss: every
additional dispatch costs real tokens and real wall-clock time, and if
the split doesn't actually change what you conclude, you've paid that
cost for nothing. Worse, a careless fan-out multiplies the failure modes
from Chapter 1 — now you have several incomplete briefs instead of one,
several agents each guessing at scope boundaries, and a reconciliation
problem waiting for you once the reports land.

## The question that decides it

Before splitting a task across multiple agents, ask exactly one question:
**does splitting this into N agents change the answer, or would one
agent working through the material sequentially reach the same
conclusion for a fraction of the cost?**

If the honest answer is "one agent would reach the same conclusion," the
fan-out is not adding thoroughness. It's adding overhead dressed as
thoroughness — the same failure mode as an unwarranted single dispatch
from Chapter 1, just multiplied.

## The three-part test

Fan out only when all three of these hold:

**1. The resulting lots (the pieces you divide the task into) are few
enough to name individually.** If you
can't write, in the brief itself, a short list of exactly what each
agent owns — "Agent A: the payments service; Agent B: the notifications
service; Agent C: the admin dashboard" — you don't have a real split, you
have a vague intention to divide work that you're hoping the agents will
sort out among themselves. They won't sort it out; they'll each do their
own version of the whole task, or collide on the parts that overlap.

**2. Each lot is genuinely disjoint.** No two agents should read or
touch the same file. This is not a nicety — it's the difference between
parallel work and a race condition. Two agents editing the same file
concurrently is exactly how confirmed, correct work gets silently
clobbered by a second agent that didn't know the first one had already
fixed it.

**3. Each lot needs independently gathered evidence.** Not a different
slice of the *same* search — a genuinely separate body of evidence that
one agent reading sequentially would still have to gather separately
anyway. If three agents would all end up running the same three
commands and reading the same five files, just from different starting
points, that's one task wearing a three-agent costume.

## What a legitimate split looks like

A split by genuinely separate capability passes the test. If your
product runs on three physically separate deployment targets — say, an
iOS app, an Android app, and a web backend — and you need to know
whether a recent API contract change broke each client, that's three
disjoint codebases, three separate build toolchains, and three bodies of
evidence that don't overlap. One agent per client is a real split: each
lot is nameable, disjoint, and needs its own evidence (you can't learn
whether the iOS app broke by reading the Android app's code).

Contrast this with "clean up all the outdated comments in the codebase."
Splitting that into "one agent per directory" looks like the same shape
— nameable lots, disjoint file territory — but fails the third leg of
the test. Every one of those agents is doing the identical task
(scanning for outdated comments) against the identical kind of evidence
(reading files and judging staleness), just on a different slice of the
same corpus. One agent walking the whole tree sequentially reaches the
same conclusions; splitting it doesn't change what you learn, it just
turns one bounded read into N bounded reads that you now have to
reconcile.

## "One agent per directory" is not a plan

This is worth stating bluntly because it's the single most common
disguised fan-out: taking a broad, singular task and mechanically
dividing it by directory, by file type, or by "give everyone something
to do," rather than by a genuine difference in what evidence each lot
requires. It looks organized. It produces a tidy-looking brief with
several named agents and clear boundaries. But if the underlying task
was one coherent judgment — "does this codebase still describe itself
accurately," "is this pattern used consistently" — dividing the *reading*
of it across agents does not divide the *judgment*. You still have to
reconcile N partial views into one coherent answer, and that
reconciliation cost is real and often larger than the cost you were
trying to save by parallelizing.

There's a real, documented version of this failure that's worth
internalizing as the canonical warning shape: a broad prose cleanup task
spawned eight parallel agents on a single session's own initiative,
burning meaningful tokens and time on cosmetic cleanup, while the actual
product the team was building sat with zero new code written that day.
Nobody decided "we should spend this budget on parallel prose cleanup
instead of building the product" — it happened because splitting felt
like the responsible, thorough move in the moment, and nobody asked the
one question first.

## A worked example

Suppose you maintain a monorepo with fourteen internal packages and you
want to know which ones still import a deprecated logging library ahead
of removing it. The fan-out instinct says: fourteen packages, fourteen
agents, one each.

Apply the test. Is this genuinely disjoint, nameable, independent
evidence? No — "does this package import the deprecated logging
library" is a single grep-shaped question with one search pattern and
one answer format, repeated fourteen times. One agent (or, more
precisely, one command) answers it for all fourteen packages in less
time than it takes to write fourteen briefs:

```
grep -rl "require(['\"]old-logger['\"])" packages/*/src
```

Now suppose the real task is different: you want each of three teams
that own three genuinely separate services (billing, notifications,
search) to migrate their own service off the deprecated library, because
the migration in each service requires different judgment calls about
what replaces the old logger's specific call sites, and those judgment
calls need each service's own context. That's a real split — three
disjoint codebases, three bodies of service-specific judgment, three
agents that don't need to read each other's territory. Name them
individually in the brief, give each its exact scope, and dispatch three,
not fourteen.

## Stating the decision a split would change

Before you write a multi-agent brief, write one sentence: "splitting this
into N agents changes the answer because ___." If you can't finish that
sentence honestly, don't split it — do it as one agent, or do it
yourself if it's small enough. This single habit is the whole chapter,
compressed: the fan-out anti-pattern survives on the unstated assumption
that more parallelism is free. It isn't. Price it before you spend it.

Chapter 3 turns to what happens once an agent — one agent, correctly
dispatched — is actually running, and something needs to change about
what it's doing before it finishes.
