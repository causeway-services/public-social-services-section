---
title: "Chapter 5: Receiving a Report"
---

# Chapter 5: Receiving a Report

## The report is all that comes back

Once an agent finishes, the report it writes is, for all practical
purposes, the entire result of the work as far as anyone downstream is
concerned. You may be able to go re-read its full working transcript if
something seems off, but nobody actually does that by default — the
report is what gets read, what gets acted on, and what gets forwarded to
whoever asked you for the update. This makes the discipline of receiving
a report at least as important as the discipline of writing the brief
that produced it. A brilliant brief followed by an uncritically accepted
report gets you exactly as far as a sloppy brief — the failure just shows
up later, after you've already acted on something false.

## Send back anything missing verbatim evidence

If you asked for exact counts and exact output in Chapter 1's brief, and
the report comes back with "the tests are passing now" instead of the
actual command and its actual output, send it back. This is not
bureaucratic box-checking — it's the only real check you have on the gap
between "I did work that plausibly relates to success" and "I confirmed
the specific outcome you asked for." A rounded-up summary is not
evidence; it's a claim. Don't accept the claim in place of the number you
asked for.

## Absence of counter-evidence is not proof of absence

Watch for a specific, easy-to-miss slip in how reports phrase negative
findings. "I didn't find any references to the old API" and "the old API
has no remaining references" are different claims, and a report should
tell you which one it's making. The first is a statement about the
search that was performed — its scope, its method, its limits. The
second is a stronger claim about the actual state of the codebase, and
it's only as strong as the search behind it. An agent that grepped three
directories and found nothing has evidence for the first claim, not the
second — and a report that blurs the two is quietly asking you to accept
more certainty than the underlying work actually earned.

## "I delegated this" is not a result

Agents sometimes delegate part of their own task to a further subagent —
this is common and often reasonable — and then report back "I delegated
the deep dive on X to a specialist." That sentence is a status update
about *process*, not a finding. It tells you what happened next, not what
was learned. Wait for the actual result before you act on anything;
treating the delegation notice itself as a completed answer is how a
half-finished chain of work gets reported up as done at every level.

## Verify the one load-bearing claim yourself

You cannot re-verify everything an agent tells you — that would defeat
the purpose of dispatching work in the first place. But before you tell
anyone else (a teammate, a stakeholder, your own future self reading
notes later) that a task is done, pick the single claim the rest of your
confidence rests on and check it yourself. Run the test suite. Load the
page. Open the file and read the actual line. This isn't distrust of the
agent specifically — it's the same discipline you'd apply to any report
from any source, human or otherwise, before forwarding it as fact. The
cost is small: one command, one click, one file open. The alternative
cost — forwarding an unverified "it works" that turns out not to — is
much larger, and it lands on your credibility, not the agent's.

## Calibrate ceremony to actual consumers

A related but distinct discipline: don't demand more process than the
situation warrants. If you're a solo developer or a very small team, a
one-line change with a single caller doesn't need a deprecation period,
a compatibility shim, or a phased rollout plan — that ceremony exists to
protect real external consumers who can't all update at once, and
manufacturing it for a change nobody but you depends on just slows you
down without protecting anyone. The skill here is proportion: verify the
claim that matters, and don't manufacture process weight the actual
stakes don't require.

## "Blocked" needs to say what a competent outsider would try

When a report comes back saying a task is blocked, the report is only
useful if it tells you *why*, in a way you can evaluate. A report that
says "couldn't do X because our tool for X doesn't support it" is
telling you about a limitation in your own specific setup — it is not
telling you that X itself is impossible. A useful blocked report names
what a competent person, unconstrained by your particular tooling, would
try next, and then states specifically why your actual constraints rule
that out. "Our internal wrapper for sending email doesn't support
attachments" is a fact about the wrapper. It says nothing about whether
email with attachments is achievable — it just means the report should
say that, rather than implying the whole approach is a dead end.

## Reconciling multiple reports before acting on any one

When you've dispatched more than one agent — following Chapter 2's rules
for a legitimate fan-out — their reports will land separately, sometimes
close together, sometimes over hours. Resist the urge to act on the
first one that arrives. Wait for all of them (or decide explicitly that
you're proceeding without one that's overdue, and say so), then
reconcile the full set into one coherent picture before you act.

Reconciliation means: deduplicate findings that different agents
happened to both surface, and — this is the part people skip — where two
agents genuinely disagree about something, record the disagreement
rather than silently picking whichever report you happened to read
first or trust more on gut feel. A real disagreement between two
independent investigations is itself a finding worth keeping, not a
mess to be smoothed over by picking a winner without evidence.

## A worked example

You dispatch two agents to investigate a production incident: one to
check whether a recent deploy correlates with the start of elevated
error rates, one to check whether a third-party API the service depends
on had a documented outage in the same window.

Agent A reports: "Deploy timestamps don't line up cleanly with the error
spike — the spike started about eleven minutes before the deploy
completed." Agent B reports: "The third-party API's own status page
shows a partial outage starting nine minutes before your error spike,
lasting eighteen minutes."

A rushed read might treat Agent A's report as ruling out the deploy and
move straight to blaming the third-party outage. A careful reconciliation
instead holds both findings side by side: they don't contradict each
other, they corroborate the same conclusion from two independent angles
— the timing evidence and the external status page both point away from
the deploy and toward the outage. Before accepting that conclusion,
verify the one load-bearing claim yourself: pull up the third-party
status page directly and confirm the outage window with your own eyes,
rather than trusting Agent B's paraphrase of it. That one check is cheap.
Building a postmortem on an unverified paraphrase, and later discovering
the status page said something subtly different, is not.

## A second worked example: the confidently wrong "no issues found"

Consider a different shape of report than the incident-reconciliation
example above: you dispatch an agent to check whether a recent
dependency upgrade introduced any breaking API changes into your
codebase, and it comes back with "no issues found — the upgrade is
safe."

Before accepting this, apply the distinction from earlier in this
chapter. "No issues found" could mean the agent ran your full test
suite, it passed completely, and it additionally diffed the dependency's
changelog against your actual usage of its API and found no removed or
changed signatures you rely on — a strong claim, well-supported. It
could also mean the agent ran a quick grep for a few obviously renamed
functions, found none of those specific names, and stopped there — a
much weaker claim wearing the same confident sentence.

The report you should actually accept states which one it did, and
shows the verbatim evidence for it: which commands were run, what the
test suite's exact pass count was, and — if a changelog diff was
performed — what specifically was compared against what. If the report
just says "no issues found" with no evidence trail, that's not a
finding, per this chapter's opening rule — send it back and ask for the
verbatim evidence and the explicit scope of what was actually checked
before you rely on it for something as consequential as shipping a
dependency upgrade to production.

## What this buys you

None of this is about distrusting the agents you dispatch. It's the same
discipline you'd want applied to any report you receive from any source
before you act on it or pass it along — the discipline just matters more
here because dispatching several agents in parallel means several reports
landing at once, each one a candidate to be accepted uncritically under
time pressure. The next two chapters turn from single interactions to
the layer above them: how you carry what you've learned forward between
sessions, and what actually happened, in one real incident, when this
whole discipline was tested by two agents colliding on one shared
repository.
