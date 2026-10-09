---
title: "Chapter 10: Scaling This Discipline to a Team"
---

# Chapter 10: Scaling This Discipline to a Team

Everything up to this point has been written for one operator running
one or more agents. Most of it holds unchanged the moment a second
person joins — the brief still needs the same four elements, a report
still needs the same verbatim evidence, a receipt is still four
sentences. But a few things genuinely change shape once more than one
human is involved, and this closing chapter is about those.

## The brief becomes a shared artifact, not a private habit

When you're the only person dispatching agents, a complete brief lives
in your own head as a habit — you might not even write it down as a
formal document each time, because you're both the author and the sole
reader of your own shorthand. Once a second person starts dispatching
agents against the same codebase, that shorthand stops working. Person A
knows what "the usual scope boundaries" means; Person B, reading a brief
Person A wrote quickly, doesn't have that context and will fill the gap
with a guess, exactly the way an agent would.

The fix is not more process for its own sake — it's making the brief
template from the appendix an actual habit both people use, consistently
enough that a brief either of you writes is legible to the other without
a conversation first. If your team is small, this can be as simple as a
shared convention: every dispatch brief lives in a shared note or a PR
description, in the same shape as the appendix brief template, before the agent is
dispatched. The goal isn't bureaucracy. It's making sure the same
completeness that protects you from a subagent's guesswork also protects
your teammate from yours.

## Path manifests stop being optional

Chapter 7's case study happened between two sessions run by the same
person on the same day. With two different people running concurrent
agents, the odds of an unplanned collision go up, not down — you don't
have the advantage of being the same mind that might, by luck, avoid
stepping on your own toes. The path-manifest habit from the appendix
stops being a nice-to-have for careful operators and becomes close to a
requirement: before two people start concurrent agent-assisted work on a
shared repository, a two-line message — "I've got the payments service,
you've got notifications" — costs nothing and prevents exactly the
incident Chapter 7 describes.

Make the default assumption explicit on a team: an unfamiliar,
unexplained change in a shared file is someone else's legitimate
in-progress work until proven otherwise, never assumed drift to be
silently corrected. State this as a team norm, not just an individual
habit, because the failure mode it prevents doesn't respect who's
"supposed" to know better.

## Receipts become the team's shared memory, not just yours

A receipt written for your own future reference is useful. A receipt
written where a teammate can find it is a different order of useful —
it's how a team avoids two people independently re-deriving the same
finding, or one person's afternoon of investigation dying with them when
they're out sick the day someone else needs the answer. If your team
doesn't already have a shared, searchable place for dated receipts —
even something as simple as a shared folder of dated markdown files, or
a channel where receipts get posted in a consistent format — that's
worth setting up before your team's agent usage scales much further.
The four-field format from Chapter 6 doesn't change; only its
audience does.

## Reconciling reports across people, not just across agents

Chapter 5 covered reconciling multiple agents' reports before acting on
any one of them. On a team, this extends one level further: when two
people have each independently dispatched agents that touched related
territory, their conclusions need the same reconciliation treatment
before either gets treated as settled. This is a genuinely easy step to
skip, because each person feels confident in their own agent's report —
the discipline is remembering that "my agent's report" and "the actual
state of the system" are not the same thing, exactly as in Chapter 5,
and that two people's agents can disagree with each other the same way
two agents dispatched by one person can.

## What doesn't change

It's worth being explicit about what stays exactly the same, because the
temptation on a team is to reach for heavier process than the situation
actually needs. You do not need a formal agent-orchestration platform, a
dedicated approval workflow, or a role called "agent operations lead" to
run this discipline on a small team. The four-element brief, the
three-part fan-out test, the one-nudge rule, the three-step recovery
procedure, and the four-line receipt are all still exactly as
lightweight as they were for one person — they just now get written down
and shared instead of held in one person's head. Calibrate the ceremony
to your team's actual size, per Chapter 5's rule about proportion: a
three-person team sharing a Slack channel for receipts is enough process.
A three-person team doesn't need a change-management board for agent
dispatches.

## A team using more than one kind of agent

A specific version of the coordination problem shows up once a team is
big enough that different people have settled on different agentic
coding tools — one person runs Claude Code, another runs Codex, a third
uses something else entirely. It's worth being explicit that nothing in
this book is tool-specific. The brief's four elements, the fan-out test,
the steering behavior (a message queuing for the next tool call rather
than interrupting mid-action), the recovery procedure, the receiving
discipline, and the receipt format all describe how to operate *any*
agent that works by reading a brief, taking multiple autonomous steps,
and reporting back — the underlying shape every current agentic coding
tool shares, whatever its interface looks like.

This matters for a team decision that otherwise causes unnecessary
friction: don't standardize on one tool merely to make this discipline
easier to teach. The discipline transfers. What doesn't transfer
automatically is the coordination layer — a path manifest exchanged
between a Claude Code session and a Codex session needs to be just as
explicit as one exchanged between two sessions of the same tool, because
neither tool has any built-in awareness of what the other is doing to
the same shared repository. If anything, a team running more than one
agentic tool concurrently should treat the path-manifest habit as more
important, not less, since the two tools' sessions have zero shared
context with each other beyond what a human explicitly writes down and
passes between them.

## The single habit worth building first, on a team

If you're introducing this discipline to a team that's never had it, the
brief is still the highest-leverage place to start — the same as it was
for one operator in Chapter 8's adoption sequence. A team that gets one
thing right — every dispatch brief states outcome, scope, permitted
operation, and what "done" measures, in a shared, legible place — has
already prevented the majority of the failure modes this book exists to
name. Everything after that is refinement on top of a foundation that
was already doing the most important job.
