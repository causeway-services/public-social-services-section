---
title: "Glossary"
---

# Glossary

Plain-language definitions for every term this book uses in a specific
sense. None of these are specialized jargon — they're ordinary words this
book pins down precisely so a chapter doesn't have to re-explain itself
every time it uses one.

**Agent.** A large-language-model-driven tool that can read files, run
commands, write code, and take multiple steps toward a goal without a
human approving each individual action. This book assumes you're already
using one (Claude Code, Codex, or something comparable) and focuses
entirely on how to run more than one well.

**Subagent.** An agent dispatched by another agent (or by you, through
your primary agent) to handle a bounded piece of work. A subagent starts
with no memory of the conversation that dispatched it — see Chapter 1.

**Dispatch.** The act of handing a bounded task to an agent or subagent
to work on, typically without your continuous supervision of every step.

**Brief.** The complete instruction set you hand an agent when you
dispatch it. See Chapter 1 for what a complete one requires.

**Scope.** The exact boundary of what an agent is permitted to read,
investigate, or change — ideally named as specific files or directories,
never a vague topic.

**Permitted operation.** The explicit statement of how far an agent may
act: read-only investigation, a proposed patch for review, or an
authorized edit. See Chapter 1.

**Fan-out.** Dispatching more than one agent in parallel against pieces
of a larger task. Legitimate when the pieces are genuinely disjoint and
independently evidenced (Chapter 2); an anti-pattern when the split is
cosmetic — the same task divided for headcount rather than because it
changes the answer.

**Steering.** Sending a message to an already-running agent to correct
or redirect it. Takes effect at the agent's next tool call, not
instantly. See Chapter 3.

**Interrupted commission.** A dispatched task whose report never
reached you — because a session restarted, a connection dropped, or you
simply lost track of it — whose absence is not evidence that the
underlying work failed. See Chapter 4.

**Residual work.** The measured, still-unfinished portion of an
interrupted task, as distinct from the whole original task — the thing
you redispatch after recovery, per Chapter 4, instead of starting over.

**Report.** The output an agent returns when it finishes (or stops)
working on a dispatched task. Treated, per Chapter 5, as a claim to be
checked against evidence, not an automatic truth.

**Verbatim evidence.** An exact command and its exact, literal output —
a test count, a line count, an exit code — as opposed to a paraphrased
summary that may round a partial result up to a full one.

**Receipt.** A dated, short record of an outcome — what was checked,
found, changed, and left open — written so a later session or person can
read it instead of re-deriving the same ground truth. See Chapter 6.
Distinct from a transcript (a full log of how a conversation went) and
from a living document (reference material revised in place over time).

**Living document.** A note, guide, or piece of reference material that
gets corrected in place as understanding improves — the wrong statement
is deleted and replaced with the true one, never annotated with a
correction note left sitting beside it.

**Drift.** An unexplained difference between what a system or
configuration claims and what it's actually doing — as distinct from
another person's or session's legitimate in-progress work, which is not
drift merely because you don't yet know why it changed. See Chapter 7.

**Path manifest.** An explicit, exchanged statement of which files or
directories each person or session owns during a period of concurrent
work on a shared repository — how you divide custody without a central
lock. See the appendix template.

**Concurrent session.** Two or more separate agent-driven working
sessions operating against the same shared repository or resource at the
same time, whether run by the same person or different people.

**Done.** Whatever fixed, checkable standard you named in the brief —
never a vague sense that things seem finished. If "done" wasn't defined
in the brief, it isn't defined at all, and any claim of it is a guess.
