---
title: "Chapter 9: Field Diagnoses — Common Situations, Quickly Placed"
---

# Chapter 9: Field Diagnoses — Common Situations, Quickly Placed

The previous eight chapters build the discipline from first principles.
This chapter is a different kind of reading: short, situation-shaped
entries you can scan when something specific has already gone wrong (or
is about to), to place it against the right chapter fast, without
re-reading the whole book. Each entry names the symptom, the likely
cause, the fix, and where to read the full reasoning.

## "The agent said it fixed the bug, but the bug is still there."

**Likely cause:** the report was accepted without verbatim evidence — a
summary like "fixed the failing test" was taken at face value instead of
the exact command output that would have shown whether the fix actually
took, or only addressed part of the problem.

**Fix:** don't accept "fixed" as a terminal state. Require the exact
command and its exact output as part of every report, and if a prior
report didn't include it, go run the command yourself before trusting
the claim further.

**Read:** Chapter 1 (briefing for verbatim evidence), Chapter 5
(receiving a report without accepting an unverified claim).

## "Two agents wrote to the same file and now it's a mess."

**Likely cause:** either the fan-out test was skipped (the task was
split without confirming the lots were genuinely disjoint), or two
separate sessions were run concurrently on overlapping territory without
an explicit division of ownership.

**Fix:** stop both agents. Assess the actual current state of the file —
not what either agent claims it did — and manually reconcile it once,
by hand if necessary, before dispatching anything else against that
file. Going forward, draw an explicit boundary (a path manifest) before
running concurrent work on any shared resource.

**Read:** Chapter 2 (the fan-out test's disjointness requirement),
Chapter 7 (the real incident this exact failure produced), the
coordination-protocol template in the appendix.

## "I came back to my laptop and I don't know if the agent finished."

**Likely cause:** an interrupted session with no report received — this
is not a sign that anything went wrong, only that the loop between you
and the agent broke.

**Fix:** do not dispatch a replacement yet. Find the original agent (and
anything it may have spawned), get its actual current status or terminal
report, and re-observe the real file state before deciding what, if
anything, still needs doing.

**Read:** Chapter 4, in full — this is exactly the situation it's
written for.

## "The agent kept saying 'still waiting' for twenty minutes."

**Likely cause:** either a genuinely hung process the agent is polling
without noticing it's dead, or a build/test step that's legitimately
slow and the agent's repeated status messages just look like a stall.

**Fix:** apply the one-nudge rule once — check whether the underlying
process is actually alive, kill it if it's hung, try the step yourself
in the foreground once, and act on the real answer. Don't send a sixth
"are you still there?" hoping for a different result than the first
five got.

**Read:** Chapter 3, "The one-nudge rule for a stuck agent."

## "I stopped the agent, but something is still editing my files."

**Likely cause:** the stopped agent had spawned a child agent to handle
part of its task, and stopping the parent didn't stop the child — it
kept running as its own independent task.

**Fix:** check for any tasks the stopped agent may have spawned and stop
them individually; don't assume stopping the top-level task stopped
everything underneath it.

**Read:** Chapter 3, "Stopping an agent, and its children."

## "A report says a task is blocked, and I don't know if that's really true."

**Likely cause:** the report is describing a limitation in your specific
tooling or setup and phrasing it as if the underlying goal itself were
impossible.

**Fix:** ask the report to name what a competent person, unconstrained
by your particular setup, would try next — and then state specifically
why your actual constraints rule that out. "Our wrapper for X doesn't
support this" is a fact about the wrapper, not proof that X can't be
done.

**Read:** Chapter 5, "'Blocked' needs to say what a competent outsider
would try."

## "I have six agent reports and I don't know what to believe."

**Likely cause:** several agents' findings landed close together and got
acted on individually, in arrival order, instead of being reconciled
into one coherent picture first.

**Fix:** hold all the reports together before acting on any single one.
Deduplicate overlapping findings, and where two reports genuinely
disagree, write down the disagreement explicitly rather than picking
whichever one you happen to trust more without evidence for the choice.

**Read:** Chapter 5, "Reconciling multiple reports before acting on any
one."

## "I can't remember what I already figured out about this bug three days ago."

**Likely cause:** the prior session's findings live only in a chat
transcript, which nobody re-reads in full to answer a specific question,
rather than in a short, dated receipt written at the time.

**Fix:** going forward, write the four-line receipt — checked, found,
changed, open — at the end of any session whose findings you'd regret
losing. For the immediate problem, there's no shortcut: you'll need to
either re-derive it or search the transcript this once, and let that
cost be the reminder to write the receipt next time.

**Read:** Chapter 6, in full.

## "A document in my notes contradicts itself — one section says X, another says the opposite."

**Likely cause:** something in the document turned out to be wrong at
some point, and instead of being replaced, the correction got appended
as a new note or bracketed aside next to the original false statement,
leaving both versions sitting in the same document.

**Fix:** delete the false statement and replace it with the true one.
Don't leave a "correction" marker next to the original — a reader
shouldn't have to figure out which of two conflicting statements is
current.

**Read:** Chapter 6, "Falsehood is removed, never annotated."

## "I'm about to split a big task across five agents — should I?"

**Likely cause:** not yet determined — this is the moment to check,
before it becomes a cause of anything.

**Fix:** run the three-part test before dispatching anything: can you
name each of the five lots individually, is each one genuinely disjoint
from the others, and does each one need independently-gathered evidence
rather than a different slice of the same search? If any answer is no,
collapse it to fewer agents, or one.

**Read:** Chapter 2, in full, and the fan-out decision checklist in the
appendix.

## "The agent asked to confirm something I thought I'd already told it."

**Likely cause:** either the brief genuinely left that detail out (a gap
worth closing next time), or the agent is correctly declining to guess
at something ambiguous instead of silently picking an interpretation —
which is the behavior you actually want, even though it feels like
friction in the moment.

**Fix:** answer the question, then check whether the brief could have
included that answer up front. If the same kind of question keeps
recurring across similar tasks, that's a signal to add it as a standing
element of your brief template rather than answering it fresh every
time.

**Read:** Chapter 1, "The four things every brief needs."

## "A teammate's agent reverted something my agent had just finished."

**Likely cause:** exactly the shape of the real incident in Chapter 7 —
two concurrent sessions, no explicit division of a shared resource, and
one agent treating the other's legitimate work as unexplained drift to
be corrected.

**Fix:** don't let either side re-revert unilaterally. Settle it by
direct message: agree who has custody of the contested resource going
forward, restore what was lost, and write down an explicit path manifest
before either of you touches that resource again.

**Read:** Chapter 7, in full, and the coordination-protocol template in
the appendix.

## Using this chapter

None of these ten entries is a substitute for the reasoning in the
chapter it points to — they're a fast way to place a live situation
against the right discipline when you don't have time to reread eight
chapters from scratch. If a situation you hit isn't listed here, the
underlying test still applies: what does the brief that started this
task actually say, what evidence backs the claim you're about to act on,
and have you measured the real state of things or are you working from
memory and assumption? Every entry above, worked backward, reduces to
one of those three questions.
