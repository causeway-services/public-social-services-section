---
title: "Chapter 4: Recovering an Interrupted Commission"
---

# Chapter 4: Recovering an Interrupted Commission

## Absence is not evidence of failure

Sooner or later, you'll dispatch an agent and its report will never
arrive — your session crashes, your laptop sleeps, the connection drops,
you close the wrong window, or you simply lose track of which of six
open threads was waiting on what. When you come back, there's a gap
where a report should be, and a real, working agent that may or may not
still be doing something to your files.

The instinct in that moment is almost always wrong, and it's worth
naming precisely why. The gap *feels* like evidence that something
failed — surely if the work had gone fine, you'd have gotten the report?
But the report's absence tells you nothing about the work. It tells you
only that the report didn't reach you, which can happen for reasons that
have nothing to do with whether the underlying task succeeded. The agent
may have finished cleanly ten minutes after you lost the thread. It may
still be running right now. Treating its absence as proof of failure and
acting on that assumption is how a solo operator ends up with two agents
writing to the same files, or a completed, correct piece of work getting
thrown away because nobody checked before starting over.

## The three-step recovery, in order

**1. Find the agent before you touch anything.** List the original
dispatched task and any children it may have spawned, and obtain one
current status or terminal report from that exact agent — not a new one,
not a guess, the actual one you lost track of. If it's still running,
your job right now is to observe it (and steer it, per Chapter 3, if
something needs correcting) — not to start a second, competing agent on
the same files "just to be safe." If it already finished, read its
actual report before you do anything else; don't assume you know what it
did because you know what you asked it to do.

**2. Re-observe the real state of the files.** Do not trust your memory
of the plan you had before the interruption. Look at what's actually on
disk right now: which files changed, what the diff contains, whether
tests pass, whether the change matches what you expected. Your
pre-interruption mental model of "it was probably about halfway through
step 3" is not evidence — it's a guess, and often a wrong one, because
agents don't always work through a task in the linear order you imagine.
Measure, don't remember.

**3. Redispatch only the measured residual.** Once you know, from actual
evidence, what's done and what isn't, redispatch a new brief that covers
only the remaining work — with the prior agent's report included as
context, so the new agent isn't starting from zero on a task that's
already 80% finished. Redoing the entire task "to be safe" is the
single most expensive mistake available here: it throws away real,
verified work, and it risks a second write clobbering a first write that
was actually correct.

## Why "redo the whole thing" feels safer than it is

It's worth sitting with why the instinct to restart from scratch is so
strong, because understanding the pull helps you resist it. Restarting
feels safe because it doesn't require you to trust anything about the
interrupted state — you don't have to verify what happened, you don't
have to reason about partial completion, you just wipe the slate and
start clean. That feeling of safety is an illusion built on skipping the
one step that actually determines whether restarting is safe: checking
whether the first attempt already produced something correct that a
restart would overwrite or duplicate.

If the interrupted agent had already, say, correctly migrated forty of
sixty files, "redo the whole thing" doesn't just waste the effort spent
on those forty — it risks a second pass making a different (and possibly
worse) decision about files that were already handled correctly, now
with no record of what the first pass's reasoning was. The measured
residual approach costs you a few minutes of investigation. The restart
approach can cost you hours of untangling two overlapping,
inconsistent attempts at the same work.

## A worked example

You dispatch an agent late in the day to migrate your project's test
suite from one assertion library to another across twenty test files —
a mechanical but non-trivial task, since each file's assertions need
individually correct translation, not a blind find-and-replace. Your
laptop goes to sleep mid-session. When you reopen it the next morning,
the conversation shows the dispatch but no completion report.

**Wrong recovery:** assume the migration never happened or is unreliable
since it was interrupted, and dispatch a fresh agent to "redo the test
suite migration from scratch," without checking anything first.

**Right recovery:**

1. Check whether the original agent's task is still listed as running,
   or whether it has a terminal status you can retrieve. Suppose you find
   it completed — it has a report, you just never saw it land.
2. Read that report. Suppose it says: seventeen of twenty files migrated
   and passing, two files skipped because their assertion style didn't
   map cleanly to a mechanical translation and needed a judgment call the
   agent flagged rather than guessed at, and one file the agent didn't
   reach before finishing its work.
3. Re-observe the actual repository state: run the test suite, confirm
   the seventeen claimed-migrated files really do pass under the new
   library (per Chapter 5, you verify the one load-bearing claim
   yourself rather than trusting the report blindly), and confirm the
   three remaining files are genuinely untouched.
4. Dispatch a new, narrow brief: migrate exactly the three remaining
   files, with the flagged judgment call on the two ambiguous ones stated
   explicitly as a decision for the new agent to make (or for you to make
   and hand it), and the prior agent's report attached as context so the
   new agent isn't rediscovering what the first one already learned about
   this codebase's assertion patterns.

This costs you the few minutes it takes to check status and read a
report. It saves you from re-migrating seventeen files that were already
correct, and from a second agent potentially making a different, silently
inconsistent choice on those same seventeen files if it had been told to
redo everything.

## When the agent itself, not just your connection to it, is the uncertain part

Everything above assumes the agent kept working fine and only your
visibility into it broke. Sometimes it's the other way around: your
session is intact, but you genuinely don't know whether the agent's
underlying process crashed, got rate-limited mid-task, or is still
quietly making progress on something slow. The recovery procedure is the
same, but step one takes a slightly different shape: instead of hunting
for a lost thread, you're checking whether a process you can still see
is actually alive and advancing, versus silently dead.

A practical version of this: if a long-running command an agent kicked
off (a large test suite, a slow build, a big file operation) hasn't
produced new output in a while, that's not automatically a hang — some
legitimate work is genuinely quiet for stretches. Look for advancing
evidence before assuming failure: a growing log file, a changing
timestamp on an output file, an open network connection still doing
something. Advancing evidence with no new console output is latency, not
a hang, and killing it prematurely just forces you to start that slow
step over from zero. No advancing evidence at all, over a period long
enough that the step should have produced something by now, is a
genuine suspected hang — and that's when the one-nudge rule from Chapter
3 applies: check it, kill it if it's truly wedged, and move on with a
measured understanding of what did and didn't complete, rather than a
guess.

## The forward test

A useful way to check whether you've internalized this chapter: when an
interrupted commission comes back to you, can you name, from actual
evidence rather than assumption, exactly which parts are confirmed done,
which are confirmed not-done, and which are genuinely unknown? If your
answer to any of those three categories is "I'm assuming," go measure it
before you dispatch anything else. The whole discipline in this chapter
is substituting five minutes of measurement for however many hours a
wrong assumption costs once two independent, uncoordinated attempts at
the same work start colliding.

The next chapter turns from the agent's side of the exchange to yours:
once a report does arrive — on time, complete, no interruption — what
should you actually do with it before you believe it?
