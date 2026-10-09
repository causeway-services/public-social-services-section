---
title: "Chapter 8: Building Your Own Operating Discipline"
---

# Chapter 8: Building Your Own Operating Discipline

## Why a checklist, and why now

Seven chapters of individual discipline are only useful if you can
actually run them under real conditions — mid-afternoon, three things
going at once, a deadline you're behind on. Nobody consults a book
chapter by chapter in that moment. What you need instead is a compressed
operating checklist you can hold in your head, or pin next to your
screen, that captures the decision points from every chapter in the
order you'll actually hit them.

This chapter is that checklist, followed by guidance on adopting it
gradually rather than all at once, since trying to adopt seven new habits
simultaneously is its own way to fail.

## Before you dispatch

- **Is this dispatch actually warranted?** Can the result change your
  next decision, or do you already know what you'll do regardless of
  what comes back? (Chapter 1)
- **If you're considering more than one agent: does the split change the
  answer?** Run the three-part test — nameable lots, genuinely disjoint,
  independently-needed evidence — before fanning out. "One agent per
  directory" is not a plan by itself. (Chapter 2)
- **Does the brief state all four required things?** Outcome, exact
  scope, permitted operation, and what "done" measures. Read your own
  brief back as if you were a stranger who will never talk to you again.
  (Chapter 1)
- **If more than one agent will touch a shared resource — code, config,
  infrastructure — have you drawn the boundary explicitly?** Write the
  path manifest before you need it, not after a collision teaches you
  to. (Chapter 7)

## While an agent is running

- **A steering message queues for the next tool call, not instantly.**
  If something urgent changed underneath the agent, send the message
  immediately, but don't assume it has taken effect until you see the
  agent's next action confirm it. (Chapter 3)
- **Never say "done" before it's true on disk** — to the agent, to a
  teammate, to yourself. (Chapter 3)
- **A stuck agent gets one nudge, not a string of them:** check the
  process, kill it if hung, try once in the foreground, report the real
  outcome, stop. (Chapter 3)
- **Stopping a parent doesn't stop its children.** If you needed to stop
  an agent because its plan was wrong, check for and stop anything it
  spawned separately. (Chapter 3)

## When something interrupts you

- **Absence of a report is not evidence of failure.** Don't assume, and
  don't start a replacement agent on the same files before checking.
  (Chapter 4)
- **Find the original agent and its actual current state first.**
  Terminal report if it finished, live status if it's still running.
  (Chapter 4)
- **Re-observe the real file state — don't trust your memory of the
  plan.** (Chapter 4)
- **Redispatch only the measured residual**, with the prior report as
  context. Redoing everything "to be safe" is usually the most expensive
  option on the table, not the safest one. (Chapter 4)

## When a report lands

- **No verbatim evidence, no acceptance.** Send it back for the exact
  command and exact output if it's missing. (Chapter 5)
- **"I didn't find X" and "X doesn't exist" are different claims** — know
  which one the report is actually making. (Chapter 5)
- **"I delegated this" is a status update, not a result.** Wait for the
  real finding. (Chapter 5)
- **Verify the one load-bearing claim yourself** before you forward "it
  works" to anyone else. (Chapter 5)
- **Calibrate ceremony to actual consumers** — don't manufacture process
  weight a one-caller change doesn't need. (Chapter 5)
- **A "blocked" report should name what a competent outsider would try**,
  and why your specific setup rules it out. (Chapter 5)
- **Multiple reports get reconciled before any of them get acted on** —
  dedupe, and record genuine disagreements rather than silently picking
  a side. (Chapter 5)

## At the end of a session

- **Write the receipt: checked, found, changed, open.** Four sentences,
  dated, stored where you'll actually look next time. (Chapter 6)
- **A reconciled finding set is a receipt too** — write it down before
  the session ends rather than leaving it to be re-derived. (Chapter 6)
- **If something you wrote earlier turned out to be false, fix it in
  place.** Delete the wrong statement and replace it with the true one —
  no correction notes, no append-only pile of "verified on" stamps on a
  living document. (Chapter 6)

## Adopting this gradually

Trying to run all of the above from day one, on every task, is a
reliable way to give up on it within a week — the overhead feels large
before the habit is automatic, even though it's genuinely small once it
is. A more durable path:

**Week 1: the brief.** Just the four elements from Chapter 1 — outcome,
scope, permitted operation, done-measure — on every dispatch, nothing
else. This alone eliminates the single most common failure mode
(confident, wrong work from an incomplete brief) and is the highest-leverage
habit in the book.

**Week 2: receiving.** Add the discipline of demanding verbatim evidence
and verifying the one load-bearing claim yourself before forwarding a
result. This is where you'll start catching things the brief alone
doesn't prevent.

**Week 3: receipts.** Start writing the four-sentence receipt at the end
of any session whose findings you'd regret losing. You'll feel the payoff
the first time a receipt saves you from re-deriving something you'd
otherwise have forgotten.

**Week 4 and after: concurrency discipline.** Once the first three habits
are automatic, the fan-out test, steering rules, recovery procedure, and
path-manifest habit from Chapters 2, 3, 4, and 7 become the layer that
protects you specifically when you're running more than one agent at
once — which, if you started this book because you already do that,
is the layer you were probably most impatient to reach. It's placed last
in this adoption sequence anyway, because the single-agent disciplines
underneath it are what make concurrent operation survivable in the
first place; skipping straight to running several agents at once with an
undisciplined brief and no receiving discipline just multiplies the
first three failure modes instead of preventing the concurrency-specific
ones.

## The test that tells you it's working

You'll know this discipline has actually taken hold, not just been read
about, the first time one of the following happens and you notice
yourself doing the right thing by reflex, not by consulting a checklist:
you catch yourself about to accept a rounded-up "tests pass" and ask for
the number instead; you catch yourself about to dispatch a fourth agent
on a task that one agent would have finished just as well; you come back
from an interruption and check status before redispatching anything. The
checklist above is scaffolding. The goal is for the scaffolding to
become unnecessary — for the discipline to just be how you operate.

Chapter 9 collects twelve common situations into quick, scannable
diagnoses you can check a live problem against without rereading this
whole book. The appendix that follows it collects the five templates
referenced across this book — the brief template, the fan-out decision
checklist, the recovery runbook, the minimal receipt format, and the
coordination protocol — in one place, ready to copy and adapt to your
own work.
