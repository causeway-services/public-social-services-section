---
title: "Chapter 6: Receipts as Inter-Session Memory"
---

# Chapter 6: Receipts as Inter-Session Memory

## The problem receipts solve

If you run agent sessions across multiple days, you'll hit this problem
within a week: you sit down, open a new session, and you cannot remember
— and neither can the agent — what got established yesterday. Did you
already check whether the rate limiter handles concurrent requests
correctly? Did you decide to use the old date format or the new one? Was
that bug actually fixed, or did you just confirm it existed and run out
of time?

A chat transcript technically contains the answer, buried somewhere in
however many thousand words of back-and-forth. But nobody re-reads a
full transcript to answer a specific question — it's too slow, and the
answer you need is mixed in with a lot of exploration, dead ends, and
conversational filler that isn't the answer. The fix is not "write
better notes to your future self in the chat." The fix is a different
kind of artifact entirely: a receipt.

## What a receipt is, and what it isn't

A **receipt** is a dated record of an outcome — what was checked, what
was found, what changed, what's still open — written so that a later
session (yours or a teammate's) can read it instead of re-deriving the
same state from scratch. It is not a transcript. A transcript is a log
of how a conversation went — every exploratory dead end, every
correction, every "wait, let me check something else first." A receipt
strips all of that away and keeps only the outcome.

This distinction matters because the two serve different purposes and
should not be conflated. If you write a receipt that includes every
step of the investigation rather than just its conclusion, you've
written a transcript with extra formatting — it's just as slow to extract
the answer from as the original conversation was.

A receipt is also distinct from a **living document** — a note, a guide,
a piece of reference material that gets revised in place as your
understanding improves. A receipt, once written, is a record of a
specific moment: what was true, or what was done, on that date. It
doesn't get edited later to reflect new understanding; a new receipt
gets written instead, dated later, that supersedes or extends it. This
is the same reason financial receipts don't get retroactively edited —
you don't erase Tuesday's receipt because Wednesday you learned
something new; you write Wednesday's receipt and let both stand as an
honest record of what was known when.

## The minimal shape of a receipt

You don't need special tooling to start doing this — the discipline
matters more than the format. A minimal receipt needs four things:

- **What was checked.** The specific investigation, command, or review
  that was performed.
- **What was found.** The actual outcome — not a summary that rounds
  up, per Chapter 5's rules about verbatim evidence.
- **What changed.** If the session resulted in an edit, a fix, a
  decision — state it plainly.
- **What remains open.** The honest boundary of what this receipt does
  *not* settle, so the next session doesn't assume more was resolved
  than actually was.

A receipt this size takes a few minutes to write and can save an hour of
re-derivation the next time someone — including you — needs to know
what happened.

## A worked example

Suppose you spent an afternoon investigating why a background job
occasionally processes the same record twice. Here's the difference
between a transcript-shaped note and a real receipt.

**Transcript-shaped (don't do this):**

> Looked into the duplicate-processing bug today. First checked if it
> was a database locking issue, spent a while reading the ORM docs,
> turned out that wasn't it. Then wondered if it was a retry-logic
> problem, dug into the queue consumer code, found some retry logic but
> it looked correct at first glance. Eventually noticed the job's
> idempotency key was being generated from a timestamp that isn't
> unique enough under load. Didn't fix it yet, need to think about
> whether to use a UUID instead or add a database constraint.

**Receipt (do this instead):**

> **2026-08-14 — duplicate background-job processing investigation**
> Checked: queue consumer's retry logic and the job's idempotency-key
> generation, against three days of production logs showing 40
> duplicate-processed records.
> Found: idempotency keys are generated from a millisecond timestamp,
> which collides under concurrent load — confirmed by reproducing two
> duplicate keys in a local load test at 50 concurrent jobs.
> Changed: nothing yet — this is a finding, not a fix.
> Open: decide between a UUID-based idempotency key or a database
> uniqueness constraint on the existing key; either fixes the root
> cause, but a constraint would surface the collision as a visible
> error instead of silently retrying, which may be the better failure
> mode to choose deliberately rather than by default.

Notice that the receipt is shorter than the transcript-shaped note, not
longer — cutting the exploratory narrative doesn't just make it faster
to read, it makes the actual finding easier to find. A teammate (or you,
two weeks later) picking this up can decide the open question in thirty
seconds of reading, instead of reconstructing the whole afternoon's
detour through ORM docs and retry-logic code that turned out not to be
the answer.

## When a reconciled finding set is itself a receipt

Chapter 5 covered reconciling multiple agents' reports into one coherent
picture before acting on them. That reconciled picture is itself exactly
the kind of thing that should become a receipt, written before the
session ends — not left to be re-derived by whoever picks up the work
next by reading through several separate agent transcripts and
re-reconciling them a second time. If you did the work of resolving a
disagreement between two investigations, or combining three partial
findings into one conclusion, write that conclusion down as a receipt.
The alternative — leaving the reconciliation implicit in your own head,
or scattered across several separate reports — means the next person (or
your own next session) either has to redo the reconciliation or, worse,
acts on just one of the un-reconciled partial reports without realizing
it was only part of the picture.

## Falsehood is removed, never annotated

One more rule belongs in this chapter because it governs how receipts
and living documents interact once something turns out to be wrong. When
a document — a receipt, a guide, a piece of reference material — turns
out to contain something false, the fix is to replace the false
statement with the true one. Not to append a correction note on top of
it. Not to add a bracketed "[UPDATE: this turned out to be wrong]" and
leave the original text sitting there for a reader to trip over. Not to
build a running log of "verified on this date" stamps next to every
claim.

This matters for a concrete reason, not just tidiness: a document that
accumulates correction-notes and provenance footnotes becomes
genuinely harder to read accurately over time. A reader has to figure
out which of several conflicting statements is the current truth, when
the document could have simply stated the current truth once. A receipt
is different from a living document here — a receipt, being a record of
a specific date, doesn't get corrected in place; a new receipt
supersedes it. But a living document — the guide, the reference note, the
architecture write-up — gets fixed in place: wrong text is deleted and
replaced with true text, cleanly, with nothing left behind marking where
the wrong version used to be.

## Receipts for decisions, not just findings

Everything above frames a receipt around an investigation — checked,
found, changed, open. The same shape works just as well for a decision
you made that wasn't strictly a bug hunt: which library you chose and
why, which of two architectural approaches you picked, why a price or a
deadline landed where it did. These are exactly the things a later
session (or a teammate) will otherwise ask about again, from scratch,
because the reasoning lived only in your head at the moment you decided.

> **2026-08-20 — choice of idempotency-key strategy**
> Checked: two options for fixing the duplicate-processing bug — a
> UUID-based key versus a database uniqueness constraint on the existing
> timestamp-based key.
> Found: a uniqueness constraint surfaces the collision as a visible
> database error on the rare occasions it still happens (useful — it's
> a signal something upstream is retrying too aggressively), while a
> UUID key would silently prevent the symptom without ever revealing
> that the aggressive retries are happening at all.
> Changed: added the uniqueness constraint, not a UUID key. Deliberately
> chose the option that surfaces the retry behavior as an error rather
> than hiding it.
> Open: the aggressive-retry behavior itself is unaddressed — the
> constraint fixes the duplicate-processing symptom but the underlying
> retry logic that causes rapid-fire duplicate attempts still needs its
> own look.

Notice this receipt does something a bug-fix receipt doesn't need to: it
records *why* the less obviously "complete" fix was chosen on purpose.
Six months later, if someone (including you) looks at this code and
wonders why a database constraint was preferred over a cleaner-looking
UUID approach, the receipt answers it in ten seconds instead of costing
someone an afternoon reverse-engineering the reasoning from the commit
alone.

## Building the habit

The habit this chapter asks you to build is small and mechanical: at the
end of any piece of work worth remembering, spend two minutes writing
four sentences — checked, found, changed, open — dated, saved somewhere
you (or a teammate) will actually look next time. It will feel like
unnecessary overhead the first several times you do it, because in the
moment, you remember everything. The payoff shows up two weeks later,
when you don't.

The next chapter puts every discipline from this book together in one
real, dated incident — not a composite example, an actual collision
between two concurrent agent sessions sharing one repository, walked
from the moment it went wrong to the moment it was resolved.
