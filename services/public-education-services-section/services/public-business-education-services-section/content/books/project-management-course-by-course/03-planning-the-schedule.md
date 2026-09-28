# Planning I: from scope to schedule

*Companion to Course 3, Project Planning, first half. Before you start:
Chapter 2's scope and deliverables.*

## What you will be able to do

- Tell a task from a milestone.
- Break a project's scope into a work breakdown structure.
- Estimate task durations four ways, including a three-point estimate, and
  get honest estimates from the people doing the work.
- Draw the dependencies among tasks and find the critical path and each
  task's float.
- Read and build a Gantt chart, and check a schedule against the team's
  capacity.

## Tasks and milestones

A **task** is a piece of work that takes time and someone does: "train
volunteers." A **milestone** is a point in time that marks something
important being reached: "pantry ready to open." A milestone has no
duration. It's a checkpoint, and it's usually the end of a group of tasks.

Milestones give the sponsor a short list to watch. Nobody outside the team
needs the 40 tasks, but everyone can follow six milestones.

## The work breakdown structure

A **work breakdown structure (WBS)** is a hierarchy that breaks the project's
total scope into smaller and smaller pieces. The top is the whole project.
The next level is the major deliverables. Below that, the work that produces
each deliverable, down to **work packages**: pieces small enough to estimate,
assign to one owner, and track.

Two rules make a WBS useful:

- **The 100 percent rule.** Each level contains all of the work of the level
  above it, and nothing outside the scope. If a piece of work isn't in the
  WBS, it isn't in the project.
- **Deliverables, not activities, at the upper levels.** Organize by what's
  produced ("shelving installed"), and let the tasks appear at the bottom.

How small is small enough? A common guide is that a work package should take
no longer than one reporting period, such as a week, so its progress shows up
in the next status report.

## Estimating time

Four estimating techniques cover most needs:

- **Analogous:** base the estimate on a similar past task. Quick, and only as
  good as the similarity.
- **Parametric:** multiply a rate by a quantity. If one volunteer can sort 40
  boxes an hour and there are 400 boxes, that's 10 volunteer-hours.
- **Bottom-up:** estimate each work package and add them up. Slower, and the
  most accurate.
- **Three-point:** ask for an optimistic time (o), a most likely time (m) and
  a pessimistic time (p), and combine them.

The three-point estimate comes from PERT, a method the U.S. Navy developed in
the late 1950s for its Polaris program. PERT weights the most likely time
four times as heavily as the extremes [@malcolm1959]:

$$E = \frac{o + 4m + p}{6}$$

where $E$ is the expected time.

Because the pessimistic time is usually further from the most likely time
than the optimistic one is, the expected time usually comes out longer than
the most likely guess. That's the point: it builds in the risk that people
leave out when they give one number.

The best estimates come from the people who'll do the work. Ask them
directly, ask for a range rather than a single number, and ask what they're
assuming. Watch for two biases: people underestimate familiar work they
enjoy, and anyone who expects their estimate to become a deadline pads it.

## Dependencies and the critical path

Tasks depend on each other. The most common dependency is
**finish-to-start**: shelving can't be installed until it's delivered. Draw
the tasks as boxes and the dependencies as arrows and you get a **network
diagram**.

In 1959 James Kelley and Morgan Walker published the **critical path method
(CPM)** for scheduling such networks [@kelley-walker1959]. Its insight is
that the project's duration isn't the total of all task durations, because
some tasks run in parallel. The duration is the length of the **longest
path** through the network. That path is the **critical path**: delay any
task on it and the whole project finishes late.

Tasks off the critical path have **float** (also called slack): the amount of
time they can slip without delaying the project. Float tells you where you
have room and where you have none.

To find them, do two passes through the network:

1. **Forward pass.** Starting at time zero, give each task an **early
   start** (the latest early finish among the tasks it depends on) and an
   **early finish** (early start plus duration). The largest early finish is
   the project's duration.
2. **Backward pass.** Starting from the project's end, give each task a
   **late finish** (the earliest late start among the tasks that depend on
   it) and a **late start** (late finish minus duration).
3. **Float** is late start minus early start. Tasks with zero float form the
   critical path.

Duration and effort aren't the same thing. Two volunteers working in
parallel for three days is six person-days of effort but three days of
duration. The critical path measures duration; the budget, in Chapter 4,
measures effort.

## Gantt charts and capacity

A **Gantt chart** draws each task as a horizontal bar on a calendar, in
order, with its dependencies. It's the most common picture of a schedule
because anyone can read it: bars that end later mean later. Most project
software builds one from the task list, durations and dependencies.

A schedule is only real if the people exist to do it. **Capacity planning**
checks how many hours each person has available against how many the
schedule asks of them in each week. If the volunteer coordinator is
scheduled for 30 hours of pantry work in a week when they have 15, either the
work moves, someone else does it, or the schedule slips. This is where a
schedule that looks fine on paper usually breaks.

## Worked example: scheduling the Eastside pantry

The WBS, to the second level:

- 1 Eastside Weekend Pantry
  - 1.1 Site: agreement, inspection
  - 1.2 Fit-out: shelving, cold storage
  - 1.3 Volunteers: recruitment, training
  - 1.4 Families: sign-up process, outreach
  - 1.5 Opening: soft opening, handover to operations

Seven tasks for the core schedule, in working days:

| Task | Depends on | Duration |
|---|---|---|
| A Sign building-use agreement | none | 5 |
| B Recruit volunteers | A | 10 |
| C Order shelving | A | 3 |
| D Shelving delivery | C | 6 |
| E Install shelving | D | 2 |
| F Train volunteers | B | 3 |
| G Soft opening | E, F | 1 |

B's duration came from a three-point estimate. The volunteer coordinator gave
7 days optimistic, 10 most likely and 19 pessimistic: $(7 + 40 + 19) / 6 =
11$. The team rounded to 10 after the coordinator pointed out that a school
newsletter goes out on day 6, which makes the pessimistic case unlikely. An
estimate is a judgment the formula informs, not replaces.

**Forward pass.** A: 0 to 5. B: 5 to 15. C: 5 to 8. D: 8 to 14. E: 14 to 16.
F: 15 to 18. G starts after both E (16) and F (18), so at 18, and finishes at
19. The project takes 19 working days.

**Backward pass.** G: late finish 19, late start 18. F and E must finish by
18: F's late start is 15, E's is 16. D must finish by 16, so it starts by
10. C must finish by 10, so it starts by 7. B must finish by 15, so it starts
by 5. A must finish by the earlier of B's and C's late starts, 5, so it starts
at 0.

| Task | Early start | Late start | Float |
|---|---|---|---|
| A | 0 | 0 | 0 |
| B | 5 | 5 | 0 |
| C | 5 | 7 | 2 |
| D | 8 | 10 | 2 |
| E | 14 | 16 | 2 |
| F | 15 | 15 | 0 |
| G | 18 | 18 | 0 |

The critical path is **A, B, F, G**: 5 + 10 + 3 + 1 = 19. The shelving chain
has 2 days of float. That tells the project manager where to watch: a
volunteer recruitment that runs a day late delays the opening; a shelving
delivery a day late doesn't.

Capacity check: B and F both fall on the volunteer coordinator. B needs about
4 hours a day of their time and F needs 6. The coordinator has 5 pantry hours
a day, so F is overloaded. The fix is to have a second trainer run half of
the sessions, which the project manager negotiates with the coordinator's
manager.

## Key terms

- **Task; milestone.**
- **Work breakdown structure (WBS); work package; 100 percent rule.**
- **Analogous, parametric, bottom-up and three-point estimates.**
- **PERT expected time:** (o + 4m + p) / 6.
- **Dependency; finish-to-start; network diagram.**
- **Critical path:** the longest path through the network; sets the
  project's duration.
- **Float (slack):** how long a task can slip without delaying the project.
- **Forward pass, backward pass; early and late start and finish.**
- **Gantt chart; capacity planning.**
- **Duration vs effort.**

## Check yourself

1. Is "district inspection passed" a task or a milestone? Why?
2. State the 100 percent rule.
3. A painter gives estimates of 2, 4 and 12 days. What's the PERT expected
   time?
4. In the Eastside network, the shelving delivery (D) arrives three days late.
   Does the opening move? By how much?
5. In the same network, volunteer training (F) takes one extra day. Does the
   opening move?
6. Two people each work four days on a task, side by side. What are the
   task's duration and its effort?
7. What does capacity planning check that the critical path doesn't?
8. One volunteer sorts 40 boxes an hour, and 600 boxes arrive. Which
   estimating technique gives the effort, and what is it?

## Answers

1. A milestone. It marks a point reached and takes no time itself; the work
   leading to it (preparing for and hosting the inspection) is the tasks.
2. Each level of the WBS contains all the work of the level above it, and
   the WBS as a whole contains all of the project's scope and nothing outside
   it.
3. (2 + 16 + 12) / 6 = 5 days.
4. Yes, by one day. D has 2 days of float, so the first 2 days of delay are
   absorbed, and the third delays E and then G.
5. Yes, by one day. F is on the critical path, with zero float.
6. Duration is four days. Effort is eight person-days.
7. Whether the people assigned have enough available hours in each period to
   do what the schedule asks of them.
8. Parametric: a rate times a quantity. 600 / 40 = 15 volunteer-hours.

*Next: Chapter 4 finishes the plan with budget, procurement, risk and
communication.*
