---
title: "Appendix: Five Templates"
---

# Appendix: Five Templates

Five reusable artifacts, one per core discipline. Copy these, strip the
bracketed placeholders, and adapt the wording to your own workflow — none
of this requires any particular tool, only the habit of filling in every
field before you dispatch, steer, recover, receive, or coordinate.

## 1. The brief template

```
OUTCOME: [What you need to know or have changed, stated as a result,
not an action.]

SCOPE: [Exact paths, files, or directories. State explicitly what is
OUT of scope, especially if another agent or person has territory
nearby.]

PERMITTED OPERATION: [Choose one — Read-only investigation / Proposed
patch for review / Authorized edit.]

DONE MEANS: [A fixed, checkable standard: an exact command and the
expected kind of output, or an exact acceptance check. Not "make sure
it's good."]

REQUIRED IN THE REPORT: exact commands run, exact output (counts, exit
codes), and an explicit "found X" vs. "did not find evidence of X"
distinction for any negative claim.

RELEVANT CONTEXT THE AGENT CANNOT DISCOVER ON ITS OWN: [Anything you
know that isn't in the code or obvious from the repository — a known
gap, a decision already made, a constraint from outside the codebase.]
```

## 2. The fan-out decision checklist

Before splitting a task across more than one agent, answer all three.
If any answer is no, do it as one agent instead.

```
[ ] Can I name each lot individually, right now, in one sentence each?

[ ] Is each lot genuinely disjoint — no two agents will read or write
    the same file?

[ ] Does each lot need independently-gathered evidence, not just a
    different slice of the same search?

One sentence: "Splitting this into N agents changes the answer
because ___." If you can't finish this sentence honestly, don't split
it.
```

## 3. The recovery runbook

For when a dispatched agent's report never arrived.

```
STEP 1 — LOCATE: Find the original agent (and any children it spawned).
Do not dispatch a replacement yet.
  - Still running? -> observe/steer it; do not start a second writer on
    the same files.
  - Finished? -> read its actual terminal report before touching
    anything it may have written.
  - Failed or vanished? -> note its last known command, output, and
    exactly which paths it had touched.

STEP 2 — RE-OBSERVE: Check the real state of the files/repository right
now. Do not rely on your memory of the pre-interruption plan.
  - What is confirmed done (verified, not assumed)?
  - What is confirmed not-done?
  - What is genuinely unknown, and needs a direct check before you
    proceed?

STEP 3 — REDISPATCH THE RESIDUAL ONLY: Brief a new agent (or resume the
original) with exactly the unfinished portion, plus the prior agent's
report as context. Do not redo confirmed-complete work "to be safe."
```

## 4. The minimal receipt format

```
[DATE] — [one-line description of the work]

CHECKED: [what was investigated, reviewed, or run]

FOUND: [the actual outcome — exact counts/output where relevant, not a
rounded-up summary]

CHANGED: [what was actually modified, fixed, or decided — or "nothing
yet, this is a finding" if applicable]

OPEN: [what this receipt does NOT settle — the honest boundary of what
remains undecided or unverified]
```

## 5. The coordination protocol (path manifests)

For two or more people, or two or more concurrent agent sessions,
sharing one repository.

```
Before starting concurrent work on a shared repository:

SESSION/PERSON A owns: [exact paths or files — nothing implied, nothing
"probably fine to touch"]

SESSION/PERSON B owns: [exact paths or files, disjoint from A's list]

SHARED / NEITHER OWNS YET: [explicitly name anything both might touch —
these paths are frozen until one side claims them or the work finishes]

RULE IN EFFECT: stage and commit only your own declared paths; never a
broad "add everything" commit across the shared tree. If you encounter
a change outside your own declared territory that you don't recognize
and can't explain, the default action is to ASK, not to revert or
"fix" it. Treat it as someone else's legitimate in-progress work until
you have direct confirmation otherwise.

ON COLLISION: settle by direct message, not by unilaterally re-reverting
the other side's revert. Re-divide custody explicitly (who owns the
contested resource going forward), restore what was lost, and update
this manifest before resuming.
```

---

That's the whole discipline. None of it requires a framework, a new
tool, or a platform migration — it requires writing four extra sentences
before you dispatch, four more before you accept a report, and four more
when a session ends. The cost is measured in minutes. The failure modes
it prevents — redone work, silently overwritten files, a "done" that
wasn't true, five services quietly repointed at dead servers — are
measured in hours, at minimum, and sometimes in the credibility of
whatever "done" claim you forward next.
