# Agile II: backlog, sprints, Kanban and Agile in the organization

*Companion to Course 5, Agile Project Management, second half. Before you
start: Chapter 7.*

## What you will be able to do

- Build and order a Product Backlog of user stories and epics, and test a
  story against INVEST.
- Describe the five Scrum events, their timeboxes and their purpose, and the
  three artifacts with their commitments.
- Track a sprint with a board and a burndown chart, and explain velocity.
- Run work on a Kanban board with work-in-progress limits, and explain why
  limiting work in progress shortens delivery time.
- Plan value-driven delivery with a minimum viable product and a roadmap,
  and describe how Agile is coached and adopted across an organization.

## The Product Backlog, user stories and epics

The **Product Backlog** is the single ordered list of everything that might
be done to improve the product. The Product Owner orders it by value: the
most valuable, best-understood items at the top, larger and vaguer ones
further down. Since 2020, *The Scrum Guide* ties the backlog to a **Product
Goal**, the long-term objective it serves [@scrum-guide-2020].

Backlog items are often written as **user stories**: short descriptions of a
need from the point of view of the person who has it. The common template
is:

> As a *type of user*, I want *some goal* so that *some reason*.

Mike Cohn's *User Stories Applied* made stories standard practice in Agile
teams [@cohn2004]. A story is deliberately brief: it's a reminder to have a
conversation, not a full specification. Its detail comes from that
conversation and from its **acceptance criteria**, the conditions it must
meet to be accepted.

Bill Wake proposed the acronym **INVEST** for a good story [@wake2003]: it's
**I**ndependent (can be built on its own), **N**egotiable (details are open to
discussion), **V**aluable (to a user or customer), **E**stimable (the team can
size it), **S**mall (fits in a sprint) and **T**estable (you can tell when it's
done).

A story too big to finish in one sprint is an **epic**. Epics are broken into
smaller stories as they rise toward the top of the backlog. That ongoing work
of splitting, clarifying and sizing items is **backlog refinement**.

Teams often size stories in **story points**, a relative measure of effort,
complexity and uncertainty, rather than in hours: a 2-point story is roughly
twice a 1-point story. Relative sizes are easier to agree on than absolute
hours.

## Prioritizing by value

A backlog's order is its most important property. Two tools help:

- **MoSCoW**, from the Dynamic Systems Development Method: sort items into
  Must have, Should have, Could have and Won't have this time
  [@clegg-barker1994].
- **Value against effort:** do first what delivers the most value for the
  least effort.

## The five Scrum events

Scrum's events create regular points for inspection and adaptation. The
2020 guide sets a maximum length, a **timebox**, for each, scaled here for a
one-month sprint; shorter sprints get shorter events [@scrum-guide-2020]:

| Event | Timebox | Purpose |
|---|---|---|
| **Sprint** | One month or less | The container for all the others: a fixed period in which the team turns backlog items into a usable increment |
| **Sprint Planning** | Up to 8 hours | Decide why the sprint is valuable (the Sprint Goal), what can be done, and how |
| **Daily Scrum** | 15 minutes | The Developers inspect progress toward the Sprint Goal and adapt their plan for the next day |
| **Sprint Review** | Up to 4 hours | Show the increment to stakeholders, inspect the outcome and decide what's next |
| **Sprint Retrospective** | Up to 3 hours | Inspect how the sprint went (people, process, tools) and plan improvements |

Counting the Sprint, that's five events. The guide calls the Sprint the
container for the other four, so you'll sometimes see "four events" too.

The Daily Scrum is often called the **stand-up**. The guide no longer
prescribes the three classic questions (what I did yesterday, what I'll do
today, what's blocking me); the Developers can use any structure that
focuses on the Sprint Goal.

## The three artifacts and their commitments

Scrum has three **artifacts**, each paired with a **commitment** that says
what it's measured against:

| Artifact | Commitment |
|---|---|
| Product Backlog | Product Goal |
| Sprint Backlog: the Sprint Goal, the items chosen, and the plan to deliver them | Sprint Goal |
| Increment: a usable step toward the Product Goal | Definition of Done |

The **Definition of Done** is a formal description of the quality an
increment must meet. Work that doesn't meet it isn't part of the increment
and returns to the backlog.

## Tracking a sprint

A **task board** shows each item in columns such as To do, In progress and
Done. A **burndown chart** plots the work remaining in the sprint against the
days left; the line should fall toward zero by the sprint's end. A flat line
means work isn't finishing.

**Velocity** is the number of story points a team completes per sprint. Over
its last few sprints it gives a range for forecasting: a team averaging 20 points
can expect to finish about 20 next sprint. Velocity is for the team's own
planning. Comparing velocities between teams is meaningless, because each
team sizes points differently.

## Kanban

**Kanban** comes from Toyota's production system, and David Anderson adapted
it for knowledge work [@anderson2010]. It has no sprints and no set roles. It
has three core practices:

- **Visualize the work** on a board, one column per stage.
- **Limit work in progress (WIP):** set a maximum number of items in each
  in-progress column. When a column is full, nobody starts new work there;
  they help finish what's in it.
- **Manage flow:** measure how long items take to move through, and improve
  the process.

Why limit WIP? A result from queueing theory, **Little's law**, says that on
average the number of items in a system equals the rate they arrive times the
time each spends in it [@little1961]. Rearranged for a team: average time to
deliver an item equals work in progress divided by throughput. If a team
finishes 5 items a week and has 20 in progress, each takes about 4 weeks.
Halve the work in progress at the same throughput, and delivery time halves.
Starting less means finishing sooner.

## Agile across the organization

**Value-driven delivery** means delivering the most valuable things first and
getting them in front of users early. A **minimum viable product (MVP)**, in
Eric Ries's phrase, is the version that lets a team learn the most about
what customers want with the least effort [@ries2011]. A **product roadmap**
shows the planned sequence of releases toward the Product Goal, organized by
outcomes rather than dates alone, and it changes as the team learns.

Adopting Agile changes how people work, so it's change management
(Chapter 1). It goes better when leaders support it, a team starts with a
real project, and an **Agile coach** helps teams learn by doing. Coaches meet
the same obstacles repeatedly: managers who still assign tasks, stakeholders
who skip Sprint Reviews, and "Agile" used as a name for having no plan. For
many teams working together, organizations use scaling frameworks such as
the Scaled Agile Framework (SAFe) or Large-Scale Scrum (LeSS).

Agile has also created its own jobs: Scrum Master, Product Owner, Agile
coach, and project managers who work in hybrid settings.

## Worked example: three sprints on Eastside's sign-up process

**Product Goal:** "Every family who wants weekend food can sign up in under
five minutes, in the way that suits them."

**Product Backlog, top items, ordered:**

| # | Story | Points | MoSCoW |
|---|---|---|---|
| 1 | As a parent, I want a paper sign-up form sent home with my child so that I can sign up without a phone or computer. | 2 | Must |
| 2 | As a volunteer, I want a printed list of signed-up families each Saturday so that I can check people in quickly. | 1 | Must |
| 3 | As a parent who speaks Spanish, I want the form in Spanish so that I can fill it in myself. | 1 | Must |
| 4 | As a parent, I want to sign up by phone so that I can do it from work. | 3 | Should |
| 5 | As a parent, I want a text reminder on Friday so that I don't forget. | 5 | Could |
| 6 | Epic: online sign-up and scheduling | 13+ | Won't have this time |

Story 1 passes INVEST: it's independent of the others, open to discussion
(which details the form asks), valuable to parents, small, estimable, and
testable. Its acceptance criteria: fits on one page; asks household size and
dietary needs; returned forms reach the pantry by Thursday.

**Sprints** are one week, Monday to Saturday, so the events are scaled down:
Sprint Planning is one hour on Monday, the Daily Scrum is ten minutes by
phone, and the Sprint Review and Retrospective are held after the pantry
closes on Saturday.

- **Sprint 1.** Goal: families can sign up on paper. The team completes
  stories 1, 2 and 3 (4 points). At the Review, the family services lead and
  the principal see 38 returned forms. The Retrospective finds that forms
  came back late, so the team adds a Wednesday collection.
- **Sprint 2.** Goal: families can sign up by phone. Story 4 (3 points) is
  done, but the phone line was unanswered for an hour. The Definition of Done
  gains a line: "tested at the hours families call."
- **Sprint 3.** The team takes on story 5. Velocity over three sprints (4, 3
  and 5) forecasts 3 to 5 points a sprint.

The burndown for Sprint 2 was flat until Thursday because the phone number
wasn't approved; the Scrum Master escalated it to the director, and the line
fell by Saturday.

## Key terms

- **Product Backlog; Product Goal; backlog refinement.**
- **User story; acceptance criteria; INVEST; epic; story points.**
- **MoSCoW.**
- **Sprint, Sprint Planning, Daily Scrum (stand-up), Sprint Review, Sprint
  Retrospective; timebox.**
- **Sprint Backlog; Sprint Goal; Increment; Definition of Done.**
- **Task board; burndown chart; velocity.**
- **Kanban; WIP limit; Little's law.**
- **Value-driven delivery; MVP; product roadmap; Agile coach; SAFe; LeSS.**

## Check yourself

1. What does INVEST stand for?
2. Write a user story for a volunteer who wants to swap shifts.
3. What's the timebox for a Daily Scrum, and who is it for?
4. Match each artifact to its commitment: Product Backlog, Sprint Backlog,
   Increment.
5. A team completes 18, 22 and 20 points in three sprints. What's a
   reasonable forecast for the next sprint, and why shouldn't a manager
   compare it with another team's 40?
6. A team finishes 10 items a week and has 30 items in progress. By Little's
   law, about how long does an item take? What happens if WIP drops to 10?
7. What's an MVP for?

## Answers

1. Independent, Negotiable, Valuable, Estimable, Small, Testable.
2. For example: "As a volunteer, I want to offer my shift to other trained
   volunteers so that the shift is still covered when I can't come."
3. Fifteen minutes; it's for the Developers, to inspect progress toward the
   Sprint Goal and adapt their plan.
4. Product Backlog: Product Goal. Sprint Backlog: Sprint Goal. Increment:
   Definition of Done.
5. About 20 points (a range of 18 to 22). Story points are relative to each
   team's own sizing, so velocities can't be compared between teams.
6. 30 / 10 = 3 weeks. With WIP at 10 and the same throughput, about 1 week.
7. To learn the most about what customers want with the least effort, by
   putting a working version in front of them early.

*Next: Chapter 9 prepares you for the capstone.*
