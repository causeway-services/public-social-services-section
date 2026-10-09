# Domain 2: predictive, plan-based methods

*Covers Domain 2, Tasks 1 to 3. Before you start: Chapters 1 and 2.*

## What you will be able to do

- Say when a predictive approach fits, including how organizational structure
  affects it.
- Distinguish a predictive project's components: the charter, the project
  management plan and its subsidiary plans, the baselines, phases,
  deliverables, work packages and milestones.
- Describe typical activities in each process group.
- Build a work breakdown structure down to work packages, with a WBS
  dictionary.
- Apply the critical path method, including float and schedule compression.
- Apply a quality management plan and explain how integration ties the plan
  together.
- Identify the artifacts of a predictive project, and calculate cost and
  schedule variances and forecasts with earned value.

## When predictive fits

A predictive approach plans scope, schedule and cost up front and then
executes against that plan. It fits when:

- requirements are clear and stable;
- the technology and method are well understood;
- change late in the project is expensive or impossible (you can't redesign a
  foundation after pouring it);
- regulation or contract requires detailed plans and documentation up front.

**Organizational structure** affects how well a predictive project runs and
how much authority its manager has [@pmbok7]:

| Structure | Project manager's authority | Notes |
|---|---|---|
| Functional (hierarchical) | Little or none | Work flows through departments; the PM coordinates |
| Weak matrix | Low | PM is a coordinator; functional managers control resources |
| Balanced matrix | Low to moderate | Authority shared |
| Strong matrix | Moderate to high | PM often full-time, with a project management staff |
| Projectized | High to almost total | Teams organized around projects |

Predictive methods suit hierarchical organizations, whose clear lines of
authority match a plan that flows top-down. They also work for **virtual**
(distributed) teams, because a documented plan gives everyone the same
reference; **colocated** teams can rely more on conversation.

## The components of a predictive project

A predictive project is assembled from parts that the exam expects you to
tell apart:

| Component | What it is |
|---|---|
| Charter | Authorizes the project and names the project manager |
| Project management plan | Says how the project will be run; holds the subsidiary plans and baselines |
| Subsidiary plans | How each area (scope, schedule, cost, quality, risk and so on) is managed |
| Baselines | The approved scope, schedule and cost that performance is measured against |
| Phase | A stretch of the life cycle ending in a major deliverable or decision |
| Deliverable | A product, result or capability the project must produce |
| Work package | The lowest level of the WBS, estimated and assigned as a unit |
| Activity | A scheduled piece of work that produces part of a work package |
| Milestone | A significant point with zero duration |

## Activities in each process group

| Process group | Typical activities |
|---|---|
| Initiating | Develop the charter; identify stakeholders |
| Planning | Collect requirements; define scope; create the WBS; define and sequence activities; estimate durations and costs; build the schedule and budget; plan quality, resources, communications, risk, procurement and engagement |
| Executing | Direct the work; manage quality; acquire, develop and manage the team; manage communications; implement risk responses; conduct procurements; manage engagement |
| Monitoring and controlling | Monitor and control the work; perform integrated change control; validate and control scope; control schedule, costs, quality, resources, procurements; monitor risks, communications and engagement |
| Closing | Close the project or phase |

These follow *Process Groups: A Practice Guide* [@pmi-process-groups2022].
Note "validate scope" (the customer formally accepts deliverables) against
"control quality" (the team checks deliverables are correct): quality control
usually comes first.

## The work breakdown structure

The **WBS** decomposes the project's total scope into deliverables and then
into **work packages**, the lowest level, which can be estimated, scheduled,
assigned and controlled. The **100 percent rule** says the WBS contains all
the project's work and nothing more, and each level contains all of its
children's work. The **WBS dictionary** gives details for each element:
description, owner, acceptance criteria, estimates, and dependencies. The
scope statement, WBS and dictionary together form the **scope baseline**.

Work packages are then broken into **activities** for scheduling. The WBS is
about *what* is delivered; the activity list is about *how* and *when*.

## The critical path method

Activities are sequenced into a **network diagram** using the precedence
diagramming method. Dependencies have four logical types: finish-to-start
(most common), start-to-start, finish-to-finish and start-to-finish. They are
also classified by origin: **mandatory** (inherent in the work: you can't
test before building), **discretionary** (a preferred order the team chose),
**external** (outside the project: a permit) and **internal** (within it).
A **lead** lets a successor start before its predecessor finishes; a **lag**
adds a wait.

The **critical path method**, published by Kelley and Walker in 1959
[@kelley-walker1959], finds the longest path through the network, which sets
the shortest possible project duration:

1. **Forward pass:** early start (ES) of each activity is the largest early
   finish (EF) of its predecessors; EF = ES + duration.
2. **Backward pass:** late finish (LF) of each activity is the smallest late
   start (LS) of its successors; LS = LF − duration.
3. **Total float** = LS − ES (or LF − EF). Activities with zero float are on
   the critical path.

**Free float** is how long an activity can slip without delaying the early
start of any successor.

To shorten a schedule, there are two **compression** techniques. **Crashing**
adds resources to critical-path activities, which raises cost. **Fast
tracking** runs activities in parallel that were planned in sequence, which
raises risk. Compressing an activity off the critical path doesn't shorten
the project.

Duration estimates can come from the three-point PERT formula,
(o + 4m + p) / 6 [@malcolm1959].

## Quality and integration

A **quality management plan** says which standards apply, how quality will
be assured (process) and controlled (product), and who is responsible.
Applying it means checking deliverables against its standards and acting on
the results. Three ideas come up on the exam:

- **Quality versus grade:** quality is meeting requirements; grade is a
  category of features. A low-grade product (basic features) can be high
  quality (no defects).
- **Cost of quality:** the cost of conformance (prevention, such as training;
  appraisal, such as testing) against the cost of nonconformance (internal
  failures found before delivery; external failures found by customers).
  Prevention is usually cheapest.
- **Manage quality versus control quality:** managing quality (quality
  assurance) checks that the processes will produce quality; controlling
  quality inspects outputs.

**Integration** is the knowledge area that ties the plans together. The
project management plan integrates all subsidiary plans and baselines, and
**integrated change control** reviews every change request for its effect on
all of them at once: a scope change touches schedule, cost, risk and quality
too. The outline's "integration management plan" refers to this integrating
role of the project management plan and its change control.

## Artifacts of a predictive project

Common artifacts: business case; charter; stakeholder register; project
management plan with its subsidiary plans and baselines; requirements
documentation and a requirements traceability matrix; scope statement, WBS
and WBS dictionary; activity list, network diagram and schedule (often a
Gantt chart); budget; RACI chart; risk register; issue log; change log;
assumption log; status reports; lessons learned register; final report.

## Earned value

Earned value management compares planned work, completed work and actual
cost at a point in time [@fleming-koppelman2010]:

| Measure | Formula | Meaning |
|---|---|---|
| Planned value (PV) | budgeted cost of work scheduled | What should be done by now |
| Earned value (EV) | budgeted cost of work performed | What is done, at planned cost |
| Actual cost (AC) | actual cost of work performed | What it cost |
| Schedule variance (SV) | EV − PV | Negative: behind |
| Cost variance (CV) | EV − AC | Negative: over budget |
| Schedule performance index (SPI) | EV / PV | Below 1: behind |
| Cost performance index (CPI) | EV / AC | Below 1: over budget |
| Budget at completion (BAC) | total baseline | The planned total |
| Estimate at completion (EAC) | BAC / CPI | If current cost performance continues |
| | AC + (BAC − EV) | If the variance won't recur |
| | AC + (BAC − EV) / (CPI × SPI) | If both cost and schedule performance persist |
| Estimate to complete (ETC) | EAC − AC | What remains to be spent |
| Variance at completion (VAC) | BAC − EAC | Negative: forecast over budget |
| To-complete performance index (TCPI) | (BAC − EV) / (BAC − AC) | The CPI needed on remaining work to finish on budget |

A memory aid: every variance starts with EV, and negative is bad. Every index
puts EV on top, and below 1 is bad.

## Worked example: Riverside's schedule and earned value

**The network, in weeks:**

| Activity | Depends on | Duration |
|---|---|---|
| A Write requirements | none | 3 |
| B Select vendor | A | 4 |
| C Order hardware | A | 2 |
| D Configure system | B | 5 |
| E Install hardware | C | 3 |
| F Train staff | D, E | 2 |
| G Go live | F | 1 |

Forward pass: A 0–3; B 3–7; C 3–5; D 7–12; E 5–8; F starts at the later of
D's and E's finishes, 12, and ends at 14; G 14–15. The project takes 15
weeks.

Backward pass: G 14–15; F 12–14; D 7–12; E must finish by 12, so starts by 9;
B 3–7; C must finish by E's late start, 9, so starts by 7; A 0–3.

| Activity | ES | LS | Total float |
|---|---|---|---|
| A | 0 | 0 | 0 |
| B | 3 | 3 | 0 |
| C | 3 | 7 | 4 |
| D | 7 | 7 | 0 |
| E | 5 | 9 | 4 |
| F | 12 | 12 | 0 |
| G | 14 | 14 | 0 |

The critical path is A, B, D, F, G: 3 + 4 + 5 + 2 + 1 = 15 weeks. The hardware
chain has 4 weeks of total float, but it sits in different places. C's free
float is E's early start minus C's early finish, 5 − 5 = 0: any slip in C
delays E's early start, even though it doesn't yet delay the project. E's free
float is F's early start minus E's early finish, 12 − 8 = 4. If the sponsor wants go-live two weeks sooner,
crashing D (paying the vendor for a second configurer) or fast-tracking B and
D (starting configuration on the leading vendor's platform before the
contract is signed, at a risk) are the options; speeding up E does nothing.

**Earned value at week 10.** BAC = $72,000. PV = $45,000; EV = $40,000; AC =
$44,000.

- SV = 40,000 − 45,000 = −$5,000; SPI = 40,000 / 45,000 ≈ 0.89. Behind.
- CV = 40,000 − 44,000 = −$4,000; CPI = 40,000 / 44,000 ≈ 0.91. Over budget.
- EAC = 72,000 / (40,000 / 44,000) = 72,000 × 1.1 = $79,200.
- ETC = 79,200 − 44,000 = $35,200. VAC = 72,000 − 79,200 = −$7,200.
- TCPI = (72,000 − 40,000) / (72,000 − 44,000) = 32,000 / 28,000 ≈ 1.14.

The remaining work would have to be done about 14 percent more efficiently
than planned to finish on the baseline. The forecast of $79,200 is still
inside the $80,000 budget but uses almost all of the reserve, so the project
manager reports it to the sponsor with a recovery plan.

## Key terms

- **Charter, project management plan, subsidiary plans, baselines, phase,
  deliverable, work package, activity, milestone.**
- **Functional, weak matrix, balanced matrix, strong matrix, projectized;
  virtual and colocated teams.**
- **WBS; work package; WBS dictionary; scope baseline; 100 percent rule.**
- **Precedence diagramming; FS, SS, FF, SF; mandatory, discretionary,
  external, internal dependencies; lead; lag.**
- **Critical path; total float; free float; crashing; fast tracking.**
- **Quality vs grade; cost of quality; manage quality vs control quality;
  validate scope.**
- **Integrated change control.**
- **PV, EV, AC, SV, CV, SPI, CPI, BAC, EAC, ETC, VAC, TCPI.**

## Check yourself

1. A project manager in a weak matrix needs a specialist for two weeks. Who
   most likely controls whether they get one?
   - A. The project manager
   - B. The specialist's functional manager
   - C. The customer
   - D. The PMO
2. Which document holds a work package's acceptance criteria, owner and
   estimates?
   - A. The WBS dictionary
   - B. The Gantt chart
   - C. The charter
   - D. The issue log
3. In the Riverside network, hardware installation (E) is delayed by 3 weeks.
   What happens to the go-live date?
   - A. It moves 3 weeks later.
   - B. It moves 1 week later.
   - C. It doesn't move.
   - D. It moves 4 weeks later.
4. To finish sooner, the team starts testing before development is complete.
   This is:
   - A. Crashing
   - B. Fast tracking
   - C. Resource leveling
   - D. Adding a lag
5. PV = $100,000, EV = $90,000, AC = $120,000. What are SV and CV, and what
   do they say?
6. With BAC = $200,000 and CPI = 0.8, what's the EAC if cost performance
   continues? What's the VAC?
7. Which is a cost of conformance?
   - A. Rework after testing finds a defect
   - B. Warranty repairs
   - C. Training staff on the new procedure
   - D. Lost customers
8. In the Riverside network, what are C's total float and free float, and why
   do they differ?
9. The customer formally accepts a completed deliverable. Which process is
   this?
   - A. Control quality
   - B. Validate scope
   - C. Close project
   - D. Manage quality

## Answers

1. **B.** In a weak matrix, functional managers control resources.
2. **A.** The WBS dictionary details each WBS element.
3. **C.** E has 4 weeks of float, so a 3-week delay is absorbed. A 5-week
   delay would move the date by 1 week.
4. **B.** Overlapping sequential activities is fast tracking; crashing (A)
   adds resources.
5. SV = 90,000 − 100,000 = −$10,000 (behind schedule). CV = 90,000 −
   120,000 = −$30,000 (over budget).
6. EAC = 200,000 / 0.8 = $250,000. VAC = 200,000 − 250,000 = −$50,000.
7. **C.** Training is prevention, a cost of conformance. A is an internal
   failure; B and D are external failures.
8. Total float 4 weeks; free float 0. C can slip 4 weeks without delaying the
   project, but any slip at all delays E's early start, because E follows C
   directly and E's own float absorbs the delay.
9. **B.** Validating scope is the customer's formal acceptance. Control
   quality (A) is the team's check for correctness, usually done first.

*Next: Chapter 4 covers Domain 3, Agile frameworks.*
