---
title: "Chapter 1: The Complete Brief"
---

# Chapter 1: The Complete Brief

## What a subagent actually knows

Start with an uncomfortable fact about how these tools work: when you
dispatch a subagent, it starts with nothing. It has not read your earlier
messages in this conversation. It does not know what you tried five
minutes ago, what you ruled out, or what "obviously" you meant when you
typed four words and hit enter. It knows exactly, and only, what is in
the text you hand it, plus whatever it can discover by reading files,
running commands, and calling tools once it starts working.

This sounds obvious once it's stated. In practice, almost everyone
violates it constantly, because writing to a subagent *feels* like
writing to a colleague. You've been in the conversation. The colleague
metaphor leaks context you don't realize you're leaning on: shared
history, shared assumptions about what "clean up the auth module" means,
a shared sense of what's out of bounds. A subagent has none of that. It
is, for the purposes of the task you're about to hand it, a highly
capable stranger who read only the paragraph you wrote.

The single biggest lever you have over whether a dispatched agent
produces the thing you wanted is whether the brief you wrote is complete.
A complete brief does not guarantee good work — an agent can still
misjudge something, misread a file, or make a reasonable call you'd have
made differently. But an *incomplete* brief guarantees confidently wrong
work, because the agent will not stop and ask; it will fill the gap with
its own best guess and proceed as if that guess were a given fact. The
guess is usually plausible. It is also usually not what you meant.

## The four things every brief needs

A complete brief states four things, in whatever order reads naturally,
but all four have to be there:

**1. The requested outcome.** Not the action — the outcome. "Look at the
payment webhook handler" is an action with no outcome attached; the agent
doesn't know when it's done looking, or what it's looking *for*. "Find
out whether the payment webhook handler correctly verifies the
provider's signature before processing a refund event, and report the
exact line where verification happens or is missing" is an outcome. The
agent knows when it has an answer.

**2. The exact scope.** Name the files, directories, or boundary
explicitly. "The auth module" is not a scope; `src/auth/` is. If the task
touches configuration, tests, or a sibling package, say so explicitly —
an agent that isn't told a boundary will guess one, and it may guess
wider or narrower than you intended. When you're running more than one
agent at once (which is most of what this book is about), an unstated
scope is how two agents end up editing the same file without either of
them knowing.

**3. The permitted operation.** This is the one people skip most often,
and it's the one that causes the most expensive mistakes. State plainly
whether the agent may only *investigate* (read-only — report back, touch
nothing), propose a *patch for review* (write the change but don't
finalize it — a diff you'll look at before it lands), or make an
*authorized edit* (go ahead and change the files). These are three
different levels of trust, and an agent that isn't told which one it has
will sometimes pick the most helpful-seeming one on its own — which
usually means editing, because editing looks more like finishing the job
than reporting back does. If you wanted an investigation and get an edit
instead, that's not the agent misbehaving; that's a brief that never said
"read-only."

**4. What "done" measures.** A fixed, checkable standard — not a vague
sense of quality. "Make sure the tests pass" is vague until you name
*which* tests, with what command, and what count you expect. "Run `npm
test` in `packages/billing/` and report the exact pass/fail count" is
checkable. A brief that ends with "make sure it's good" is a brief that
lets an agent declare victory on its own say-so, and that is exactly how
a false "done" gets reported back to you.

## Why "verbatim evidence" matters more than a summary

Ask for exact commands and exact output, every time, in every report you
require back — a test count, a line count, an exit code, the literal
output of the command that proves the claim. Not "the tests pass now,"
but `node --test` producing `# pass 47` and `# fail 0`.

The reason this matters isn't paranoia about agents lying. It's that
"the tests pass now" is a summary, and summaries round up. An agent that
ran the test suite, saw 44 pass and 3 fail, fixed one of the three, and
ran out of budget on the other two will very naturally write "fixed the
failing tests" if you didn't ask for the count — not because it's being
dishonest, but because "fixed the failing tests" is a true statement
about *effort*, and it reads, to a skimming eye, like a true statement
about *outcome*. The exact count — 45 pass, 2 fail — tells you the actual
state in a way no adjective can. Demand the number every time, and you
will catch this long before it costs you a broken deploy.

## Deciding whether to dispatch at all

The most complete brief in the world is still wasted if the dispatch itself
wasn't warranted. Before you write a brief, ask one question: can the
result actually change your next decision? If you already know the
answer — you're dispatching to double-check something you're confident
about, or to "be thorough" on a task you could finish yourself in the
same amount of time it takes to write the brief — you're paying tokens
and wall-clock time for a report you were going to act on the same way
regardless of what it said. That's not caution. That's overhead dressed
as caution.

This becomes especially important once you're running several agents at
once, which is the whole subject of Chapter 2 — the temptation to spin up
"one more agent, just in case" scales with how easy dispatching has
become, and the discipline that keeps it from ballooning is asking this
question every single time, not just the first time.

## A worked example

Suppose you're a solo developer building a subscription billing API. You
want to know whether a recent refactor of the invoice-generation code
broke anything, and you also want a second agent to add a new endpoint
for partial refunds. Here is an incomplete brief for the first task,
followed by a complete one.

**Incomplete:**

> Check if the invoice refactor broke anything.

This tells the agent nothing about which files changed, what "broke"
means (a compile error? a test failure? a behavior change a human would
notice but no test catches?), whether it may fix what it finds, or how
it should report back. A capable agent will do *something* useful with
this — probably run the test suite and report whatever it sees — but
you've delegated every judgment call about what "checking" means to the
agent's guess, and you won't know which guesses it made unless you read
its full transcript.

**Complete:**

> Outcome: determine whether the invoice-generation refactor in commit
> a3f9e21 changed the computed total for any existing invoice fixture.
> Scope: `src/billing/invoices/` and its test fixtures in
> `test/fixtures/invoices/`; do not touch `src/billing/refunds/` — a
> second agent is working there concurrently.
> Permitted operation: read-only investigation. Do not edit any file.
> Done: run `npm test -- invoices` and report the exact pass/fail count.
> If any test fails, report the exact fixture name, the expected total,
> and the actual total the refactored code now produces. If all tests
> pass, additionally diff the refactor's arithmetic against the
> pre-refactor version at the parent commit and report whether the
> rounding behavior for fractional cents changed, since that's the one
> case the existing fixtures don't cover.

Notice what the complete version does that the incomplete one doesn't:
it names a specific commit, draws an explicit scope boundary that
protects a concurrently-working second agent's territory, states plainly
that this is read-only, gives an exact command and requires the exact
count, and — because the person writing the brief knows something the
agent doesn't (that the existing fixtures have a coverage gap around
rounding) — states that knowledge explicitly instead of hoping the agent
discovers it independently. A subagent cannot use context you have but
never wrote down.

## Briefs for ambiguous, non-technical decisions

Not every brief is about code. Once you're dispatching agents regularly,
you'll find yourself using them for judgment-adjacent tasks too — draft
a customer response, summarize a batch of support tickets, propose
names for a new feature flag. These feel less "brief-shaped" than a
scoped code change, and that feeling is exactly why they're worth extra
care: an ambiguous task invites an ambiguous brief, and an ambiguous
brief is where the agent's guess is most likely to diverge from what
you actually wanted, because there's no test suite or exit code to catch
the divergence for you.

The same four elements still apply, they just take different shapes.
The outcome is still a concrete deliverable ("a two-sentence response a
support lead could send as-is," not "help with this ticket"). The scope
is still a boundary ("only the eleven tickets tagged `billing-dispute`
from the past week," not "the support queue"). The permitted operation
still matters — draft for review is almost always right here, since a
customer-facing message going out without a human reading it first is a
much higher-stakes version of the "helpfully edited when it should have
only investigated" mistake from earlier in this chapter. And "done" still
needs a standard, even for something as soft as tone: "matches the
company's existing reply templates in `docs/support-templates/`,
addresses the specific complaint, and does not promise a refund amount"
is checkable in a way "sounds good" is not.

The instinct to relax the brief's rigor for a "softer" task is
understandable and wrong. Soft tasks are exactly where an agent's
plausible-sounding guess is hardest for you to catch at a glance,
because there's no failing test to flag it — only your own read of
whether the output feels right, which is a much weaker check than a
command's exit code.

## The habit to build

Before you dispatch, read your own brief back and ask: if I gave this
exact text to a competent stranger who has never seen this codebase and
will never talk to me again before reporting back, would they know
*only* what I intended them to know, and nothing they'd have to guess?
If there's a gap, that gap is a decision you're silently delegating to
whatever the agent guesses. Sometimes that's fine — not every ambiguity
matters. But it should be a decision you made on purpose, not one that
happened because you were in a hurry.

The next chapter covers a mistake that happens on the other side of this
same instinct: not an incomplete brief, but *too many* briefs, written
because splitting a task across several agents felt like being thorough
when it wasn't actually changing the answer.
