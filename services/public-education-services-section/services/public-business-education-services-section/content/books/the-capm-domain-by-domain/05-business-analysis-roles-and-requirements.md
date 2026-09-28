# Domain 4, part 1: business analysis roles, communication and requirements

*Covers Domain 4, Tasks 1 to 3. Before you start: Chapter 2's stakeholder
register.*

## What you will be able to do

- Explain what business analysis is and why stakeholders must be identified
  before requirements are gathered.
- Distinguish stakeholder roles such as process owner, process manager,
  product manager and product owner, and internal from external roles.
- Choose a communication channel for a situation, and explain why the
  business analyst's communication between teams matters.
- Classify requirements, choose an elicitation technique for a situation, and
  match user stories, use cases and other tools to scenarios.
- Explain a requirements traceability matrix and a product backlog.

## What business analysis is

**Business analysis** is the work of understanding a need and defining a
solution that meets it. *The PMI Guide to Business Analysis* describes it as
identifying needs, recommending solutions, and eliciting, analyzing,
specifying, communicating and managing requirements
[@pmi-ba-guide2017]. The person doing it may be titled business analyst,
product owner, systems analyst or requirements engineer, or may be the
project manager on a small project.

Business analysis and project management overlap but aren't the same. The
project manager is accountable for delivering the project; the business
analyst is accountable for making sure what's delivered is what's needed.
When the two work well together, the project delivers the right thing on
time.

## Stakeholder roles and why they're identified

Requirements come from people. A stakeholder nobody identifies is a set of
requirements nobody collects, which surfaces later as a change request, a
rejected deliverable, or a system nobody uses. That's the answer to the
outline's question of why stakeholders are identified in the first place.

Roles the exam distinguishes:

| Role | Responsibility |
|---|---|
| **Sponsor** | Funds and champions the initiative; approves the business case |
| **Process owner** | Accountable for a business process end to end, including its design and performance (the clinic's head of patient access owns "booking an appointment") |
| **Process manager** | Runs the process day to day within the owner's design (the front-desk supervisor) |
| **Product manager** | Owns a product's strategy and roadmap across its life, often across many projects |
| **Product owner** | On an Agile team, maximizes the value of the product by managing and ordering the backlog |
| **Subject matter expert** | Supplies specialist knowledge (a nurse on triage rules) |
| **End user** | Uses the solution (patients; front-desk staff) |
| **Business analyst** | Elicits, analyzes and manages requirements; bridges business and delivery |

**Internal** stakeholders are within the performing organization: staff,
managers, the sponsor. **External** stakeholders are outside it: customers,
patients, vendors, regulators, the public. External stakeholders are often the
most affected and the least available, so analysts plan deliberately how to
reach them.

## Communication

The business analyst stands between groups who speak different languages:
patients and clinicians describe needs; developers and vendors describe
features and constraints. Miscommunication between them is the most common
cause of building the wrong thing. So the analyst translates in both
directions, confirms understanding, and writes decisions down.

The *PMBOK Guide* sorts communication methods into three kinds [@pmbok7]:

- **Interactive:** two-way and real-time; meetings, calls, workshops. Use
  for decisions, negotiation and anything ambiguous.
- **Push:** sent to recipients; email, memos, reports. Use when people need
  to know but not discuss.
- **Pull:** placed where people fetch it; shared sites, knowledge bases,
  dashboards. Use for large audiences and reference material.

Choosing a channel: a formal **report** for status and record; a
**presentation** to explain a recommendation to decision-makers; a
**workshop** to reach agreement across groups; a **one-on-one** for a
sensitive concern; an **information radiator** (a visible board) for a team's
daily state.

## Requirements and how to gather them

*The PMI Guide to Business Analysis* classifies requirements
[@pmi-ba-guide2017]:

- **Business requirements:** the organization's high-level needs and
  objectives. "Reduce phone hold time by half."
- **Stakeholder requirements:** what a stakeholder group needs. "Patients
  need to book outside clinic hours."
- **Solution requirements:** what the solution must do (**functional**,
  "the system sends a reminder 24 hours before") and how well
  (**nonfunctional**, "pages load within 2 seconds"; accessibility;
  security).
- **Transition requirements:** what's needed to move from current to future
  state and then aren't needed any more. "Import existing appointments; train
  staff."

**Elicitation** is drawing requirements out of stakeholders and sources. Match
the technique to the situation:

| Technique | Use when |
|---|---|
| **Interviews** | You need depth from individuals, or the topic is sensitive |
| **Workshops** (facilitated sessions) | Different groups must agree quickly |
| **Focus groups** | You want reactions and attitudes from a representative group of users |
| **Surveys** | You need input from many people, far apart |
| **Observation** | People can't easily describe what they do; you watch them work |
| **Document analysis** | Existing rules, forms or systems hold requirements |
| **Prototyping** | Users need to see something to react to it |
| **Brainstorming** | You want many ideas before choosing |
| **Lessons learned** | A past project met similar needs |

**Tools for recording requirements**, matched to scenarios:

- A **user story** ("As a patient, I want..., so that...") suits adaptive
  work: small, conversational, valuable to a user [@cohn2004].
- A **use case**, from Ivar Jacobson's work, describes step by step how an
  actor interacts with a system to reach a goal, including alternate and
  error paths [@jacobson1992]. It suits complex interactions and systems where
  edge cases matter.
- A **process model** (a flowchart or swimlane diagram) suits changes to how
  work flows between people.
- A **wireframe** or **prototype** suits screen design.
- A **data dictionary** suits information-heavy systems.

## Traceability: the matrix and the backlog

A **requirements traceability matrix (RTM)** is a table that links each
requirement backward to its source and business objective, and forward to the
design, the build and the test that proves it. It answers two questions: why
does this requirement exist, and has it been delivered and tested? It also
shows the impact of a change: follow the links from the changed requirement.

In adaptive work the **product backlog** does the same job in a lighter form.
Each item carries its value (why) and acceptance criteria (how it will be
proved), and the Definition of Done ensures each is tested. Many teams also
link backlog items to epics and objectives, which gives the same traceability.

## Worked example: analysis at Riverside

**Stakeholders.** The head of patient access is the process owner for booking;
the front-desk supervisor is the process manager; the clinic's director is
the sponsor; the vendor's product manager owns their product's roadmap;
patients are external end users; a state health privacy regulator is an
external stakeholder whose rules are requirements.

**Elicitation plan.**

- Observation of the front desk for two mornings, since staff don't notice
  the workarounds they use.
- A survey of 300 patients by text and paper, covering booking habits and
  phone access.
- A focus group of eight older patients.
- Document analysis of the privacy regulations and the current booking
  policy.
- A workshop with clinicians and the front desk to agree on booking rules.

**Requirements, classified.**

| ID | Requirement | Type |
|---|---|---|
| B1 | Cut average phone hold time by half within six months of go-live | Business |
| S1 | Patients can book outside clinic hours | Stakeholder |
| F1 | The system sends a text reminder 24 hours before each appointment | Solution, functional |
| N1 | Booking screens meet WCAG 2.1 AA | Solution, nonfunctional |
| T1 | Existing appointments are imported before go-live | Transition |

**An RTM row.**

| Req. | Source | Objective | Design | Test | Status |
|---|---|---|---|---|---|
| F1 | Survey: 62% want reminders | B1 (fewer no-shows means fewer rebooking calls) | Reminder rules, section 4 | Test case T-17 | Passed |

**Communication.** The weekly status goes to the sponsor as a push report;
design decisions are made in interactive workshops; the requirements and RTM
live on a shared site (pull) that the vendor can read.

## Key terms

- **Business analysis; business analyst.**
- **Process owner; process manager; product manager; product owner; subject
  matter expert; end user; internal and external stakeholders.**
- **Interactive, push and pull communication.**
- **Business, stakeholder, solution (functional, nonfunctional) and
  transition requirements.**
- **Elicitation: interviews, workshops, focus groups, surveys, observation,
  document analysis, prototyping.**
- **User story; use case; process model; wireframe.**
- **Requirements traceability matrix; product backlog.**

## Check yourself

1. Who is accountable for the design and performance of a business process
   end to end?
   - A. Process manager
   - B. Process owner
   - C. Product owner
   - D. End user
2. Front-desk staff can't explain the shortcuts they use when the phones are
   busy. Which elicitation technique fits best?
   - A. Survey
   - B. Document analysis
   - C. Observation
   - D. Brainstorming
3. "The system must be available 99.9% of the time" is which kind of
   requirement?
   - A. Business
   - B. Functional
   - C. Nonfunctional
   - D. Transition
4. The team needs input from 2,000 patients across the county. Which
   technique fits best?
   - A. Interviews
   - B. Survey
   - C. Focus group
   - D. Observation
5. A booking flow has many alternate paths (slot taken, patient not
   registered, payment needed). Which tool records it best?
   - A. A user story
   - B. A use case
   - C. A RACI chart
   - D. A burndown chart
6. A regulator changes a privacy rule. Which artifact shows fastest which
   designs and tests are affected?
   - A. Stakeholder register
   - B. Requirements traceability matrix
   - C. Issue log
   - D. Communications plan
7. A design dispute between clinicians and front-desk staff needs resolving
   this week. Which communication type fits?
   - A. Push
   - B. Pull
   - C. Interactive
   - D. None; let the vendor decide
8. Why identify stakeholders before gathering requirements?

## Answers

1. **B.** The process owner is accountable end to end; the process manager
   (A) runs it day to day.
2. **C.** Observation reveals what people do but can't describe.
3. **C.** Availability is a quality of the solution, so nonfunctional.
4. **B.** Surveys reach many people cheaply; the others don't scale.
5. **B.** Use cases capture step-by-step interactions including alternate
   and error paths.
6. **B.** The RTM traces each requirement to designs and tests, so the
   impact of a change can be followed.
7. **C.** Disputes and decisions need two-way, real-time communication.
8. Because requirements come from stakeholders: one who isn't identified
   won't be consulted, and their needs surface late as changes or rejection.

*Next: Chapter 6 completes Domain 4: roadmaps, methods and validation.*
