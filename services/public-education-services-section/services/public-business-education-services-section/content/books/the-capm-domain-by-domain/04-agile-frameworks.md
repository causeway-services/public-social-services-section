# Domain 3: Agile frameworks and methods

*Covers Domain 3, Tasks 1 to 5. Before you start: Chapter 1's life cycles.*

## What you will be able to do

- Compare the pros and cons of adaptive and predictive approaches, and judge
  when an organization's structure, assets and environment support adaptive
  work.
- Plan iterations: name the units of adaptive planning, weigh the pros and
  cons of iterating, translate a WBS into backlog items, and name the inputs
  for scope.
- Explain how adaptive tracking differs from predictive tracking, and
  identify the artifacts of an adaptive project.
- Distinguish the components of Scrum, Extreme Programming, SAFe and Kanban.
- Define success for an adaptive task, and prioritize a backlog.

## Adaptive against predictive

Adaptive approaches plan in short cycles and deliver usable pieces often.
Their core statement is the 2001 Agile Manifesto: individuals and
interactions over processes and tools; working software over comprehensive
documentation; customer collaboration over contract negotiation; responding
to change over following a plan [@agile-manifesto-2001].

| | Adaptive: pros | Adaptive: cons |
|---|---|---|
| Value | Delivers value early and often | Final scope and cost are less certain up front |
| Change | Absorbs changing requirements cheaply | Needs discipline to avoid endless change |
| Feedback | Frequent customer feedback reduces the risk of building the wrong thing | Needs customers available throughout |
| Team | Motivated, self-organizing teams | Needs dedicated, cross-functional people |
| Documentation | Less overhead | Can be too little for regulated work |

Predictive is the mirror image: more certainty about scope, cost and dates up
front, at the price of expensive late change and late feedback.

## When the organization supports adaptive work

**Structure.** Adaptive teams work best when they're dedicated, stable and
cross-functional. A **colocated** team can talk constantly; a **virtual** team
needs shared tools, overlapping hours and deliberate communication. A
**matrix** structure can undercut adaptive work when team members are split
across projects and answer to functional managers. A strongly **hierarchical**
culture may resist self-management and expect detailed plans up front.

PMI calls the surrounding conditions **enterprise environmental factors
(EEFs)**, conditions outside the team's control such as culture, structure,
regulation, market and infrastructure, and **organizational process assets
(OPAs)**, the organization's own plans, processes, policies, templates and
knowledge bases [@pmbok7]. Factors that make adaptive work easier include:

- leaders who support experimentation and accept evolving scope (EEF);
- contracts and funding that allow scope to change (EEF);
- collaboration tools and co-located space (EEF);
- templates for backlogs and definitions of done, and lessons from past
  adaptive projects (OPA);
- policies that let teams release often (OPA).

The *Agile Practice Guide* also stresses **servant leadership**: a leader
whose first job is to serve the team by removing obstacles and building its
capability, rather than directing each task [@agile-practice-guide2017].

## Planning iterations

The logical units of adaptive planning:

- An **iteration** (in Scrum, a **sprint**) is a fixed timebox, usually one to
  four weeks, that produces a usable increment.
- A **release** delivers one or more increments to users.
- The **product roadmap** shows the planned sequence of releases toward the
  product's goals.

| Iterating: pros | Iterating: cons |
|---|---|
| Frequent feedback and course correction | Overhead of planning and review each cycle |
| Early, visible progress | Harder to see the whole cost and date early |
| Risk surfaces early | Work must be split into small valuable pieces, which takes skill |

**From WBS to iterations.** A predictive WBS decomposes deliverables into work
packages. An adaptive project decomposes the product into **epics** (large
bodies of work) and **user stories** (small, valuable, testable pieces from a
user's point of view). To translate a WBS into adaptive terms, map each
major deliverable to an epic, split the work beneath it into user stories,
order them in the product backlog by value, and pull the top ones into each
iteration's backlog.

**Inputs for scope** in adaptive work: the product vision; the roadmap; the
product backlog with its user stories and acceptance criteria; the
**definition of done** (the quality standard every increment meets); and
often a **definition of ready** (when a story is clear enough to start).
Scope is refined each iteration rather than fixed at the start.

## Tracking: adaptive against predictive

Predictive tracking compares progress with a baseline plan: Gantt charts,
earned value, variance reports. Adaptive tracking measures delivered value
and flow:

- A **burndown chart** plots work remaining against time; a **burnup chart**
  plots work completed and total scope, so scope changes are visible.
- **Velocity** is the amount of work, often in story points, a team completes
  per iteration; it forecasts how much fits in future iterations.
- A **cumulative flow diagram** plots how many items are in each state over
  time; widening bands show bottlenecks.
- **Cycle time** and **lead time** measure how long items take.

Adaptive tracking matters because the plan is expected to change: measuring
against a fixed baseline would report every learned improvement as a
variance.

## Artifacts of an adaptive project

Product vision; product roadmap; release plan; product backlog; iteration
(sprint) backlog; user stories with acceptance criteria; definition of done
and of ready; increments; task or Kanban board; burndown or burnup chart;
velocity record; retrospective actions. Visible displays of this information
are called **information radiators**.

## The frameworks

**Scrum** [@scrum-guide-2020]. A Scrum Team of usually ten or fewer: a
**Product Owner** (maximizes value; owns the product backlog), a **Scrum
Master** (the team's effectiveness; coaches Scrum) and **Developers** (build
each increment). Five events: the **Sprint** (one month or less) containing
**Sprint Planning**, the **Daily Scrum** (15 minutes), the **Sprint Review**
and the **Sprint Retrospective**. Three artifacts, each with a commitment:
**product backlog** (product goal), **sprint backlog** (sprint goal),
**increment** (definition of done).

**Extreme Programming (XP)** [@beck2004]. Focused on software engineering
practice. Values: communication, simplicity, feedback, courage and respect.
Practices include **pair programming** (two developers at one workstation),
**test-driven development** (write the test before the code), **continuous
integration**, **small releases**, **refactoring**, **collective code
ownership**, a **sustainable pace**, and a **whole team** that includes the
customer.

**Kanban** [@anderson2010]. A method for improving flow. Visualize the work on
a board; **limit work in progress** per stage; manage flow; make policies
explicit; implement feedback loops; improve collaboratively. Kanban has no prescribed iterations or roles:
work is **pulled** into a stage when there's capacity. By Little's law,
average lead time equals work in progress divided by throughput
[@little1961], which is why lowering WIP shortens delivery time.

**SAFe (Scaled Agile Framework)** [@safe]. A framework for coordinating many
Agile teams on one large product. Teams are grouped into an **Agile Release
Train** that plans together in a two-day planning event held every 8 to 12
weeks and delivers on a shared cadence. SAFe adds roles and structures for portfolio
and program levels that single-team frameworks lack.

Other names that may appear: **Lean** (eliminate waste, optimize flow),
**Scrumban** (Scrum with Kanban's board and WIP limits), and **hybrid**
approaches that mix adaptive and predictive parts.

## Success criteria and prioritization

An adaptive task succeeds when it meets its **acceptance criteria** and the
team's **definition of done**, and delivers the value it was chosen for.
Write acceptance criteria as testable statements, often in the form "Given a
situation, when an action, then a result."

Prioritizing the backlog is the Product Owner's call, informed by
stakeholders. Common techniques:

- **MoSCoW:** must have, should have, could have, won't have this time
  [@clegg-barker1994].
- **Value against effort:** highest value for lowest effort first.
- **Weighted shortest job first** (used in SAFe): cost of delay divided by
  job size; do small, urgent, valuable items first.
- **Risk-adjusted ordering:** tackle risky items early so the team learns
  sooner.

## Worked example: Riverside's booking screens

The WBS element **2.3 Patient booking interface** becomes an epic, split into
stories:

| Story | Points | MoSCoW |
|---|---|---|
| As a patient, I want to see open appointment times for my doctor so that I can choose one. | 5 | Must |
| As a patient, I want to book a chosen time so that I don't have to call. | 3 | Must |
| As a patient, I want a text confirming my booking so that I know it worked. | 2 | Must |
| As a patient, I want to cancel online so that the slot goes to someone else. | 3 | Should |
| As a patient, I want to pick a language so that I can read the screens. | 8 | Should |

Acceptance criteria for the second story: "Given an open slot, when I tap
Book and confirm, then the slot is reserved for me and disappears for others
within 5 seconds."

The team runs two-week sprints. Its velocity over three sprints is 9, 11 and
10 points. The first three stories (10 points) fit one sprint. A burnup chart
shows total scope rising from 13 to 21 points when the language story is
added, and completed work climbing toward it.

Meanwhile, the vendor's support requests are run on a Kanban board with a WIP
limit of 3 in "In progress." When requests pile up in "Waiting on vendor," the
cumulative flow diagram's band widens and the project manager escalates.

## Key terms

- **Adaptive, predictive; colocated, virtual; EEFs; OPAs; servant
  leadership.**
- **Iteration, sprint, release, roadmap; epic; user story; definition of
  done; definition of ready.**
- **Burndown, burnup, velocity, cumulative flow diagram, cycle time, lead
  time; information radiator.**
- **Scrum; XP (pair programming, test-driven development, continuous
  integration, refactoring); Kanban (WIP limits, pull); SAFe (Agile Release
  Train); Lean; Scrumban.**
- **Acceptance criteria; MoSCoW; weighted shortest job first.**

## Check yourself

1. Which is an organizational process asset that supports adaptive work?
   - A. A national data privacy law
   - B. The company's template for a definition of done
   - C. The market's demand for faster releases
   - D. The company's organizational culture
2. A team's velocity has been 18, 22 and 20. The next sprint's candidate
   stories total 35 points. What should happen?
   - A. Commit to all 35 and work overtime
   - B. Select about 20 points of the highest-priority stories
   - C. Extend the sprint to fit 35 points
   - D. Ask the Scrum Master to assign more developers
3. Which chart best shows that scope was added mid-project?
   - A. Burndown chart
   - B. Burnup chart
   - C. Gantt chart
   - D. Pie chart
4. Which practice belongs to Extreme Programming rather than Scrum?
   - A. Sprint Review
   - B. Pair programming
   - C. Product backlog
   - D. Daily Scrum
5. A support team has no sprints, pulls new work only when an item finishes,
   and caps "In progress" at four items. Which method is this?
   - A. Scrum
   - B. SAFe
   - C. Kanban
   - D. Predictive
6. Twelve Agile teams must deliver one product together and plan jointly on a
   shared cadence. Which framework is designed for this?
   - A. XP
   - B. SAFe
   - C. Kanban
   - D. PERT
7. Why does adaptive tracking not rely on a fixed baseline?
8. Translate the WBS deliverable "Staff training materials" into two user
   stories.

## Answers

1. **B.** A template is the organization's own asset (OPA). A, C and D are
   environmental factors (EEFs).
2. **B.** Velocity forecasts capacity; select roughly 20 points by priority.
   Overtime (A) isn't sustainable; sprints aren't extended (C); the Scrum
   Master doesn't assign work (D).
3. **B.** A burnup shows total scope as its own line; a burndown hides scope
   changes inside the remaining work.
4. **B.** Pair programming is an XP practice; the others are Scrum.
5. **C.** Pull, WIP limits and no iterations are Kanban.
6. **B.** SAFe coordinates many teams in an Agile Release Train.
7. Because scope is expected to change as the team learns; measuring against
   a fixed baseline would count every improvement as a deviation. Adaptive
   tracking measures delivered value and flow instead.
8. For example: "As a front-desk staff member, I want a one-page guide to
   rescheduling so that I can help a patient without searching," and "As a
   trainer, I want a practice booking account so that staff can rehearse
   before go-live."

*Next: Chapter 5 begins Domain 4, business analysis.*
