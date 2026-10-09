# Domain 4, part 2: roadmaps, methods and validating requirements

*Covers Domain 4, Tasks 4 to 6. Before you start: Chapter 5.*

## What you will be able to do

- Explain what a product roadmap is for, and decide which components go into
  which release.
- Describe how a business analyst works in predictive, adaptive and hybrid
  projects.
- Define acceptance criteria, and tell verification from validation.
- Decide whether a product is ready for delivery using a requirements
  traceability matrix or a product backlog.

## Product roadmaps

A **product roadmap** is a high-level, visual summary of where a product is
going: the goals, the major features or themes, and roughly when each
release will deliver them. It isn't a detailed schedule. Its job is to align
stakeholders on direction and order, and to give teams a context for the
backlog.

Good roadmaps are organized by outcomes or themes ("patients can manage
their own appointments"), show nearer releases in more detail than later
ones, and change as the team learns. A roadmap that never changes is a plan
pretending to be a roadmap.

**Deciding what goes in which release** weighs:

- **Value:** what delivers the most benefit soonest? The first release is
  often a **minimum viable product**, Eric Ries's term for the smallest
  version that delivers value and teaches the team what users want
  [@ries2011].
- **Dependencies:** what must exist before something else can work? Booking
  must exist before cancelling does.
- **Risk:** what's uncertain enough that early feedback is worth it?
- **Capacity and deadlines:** what can the team deliver by a fixed date,
  such as a regulatory deadline?
- **Transition needs:** what training, data migration or support must be
  ready with each release?

## How methodology shapes business analysis

**In predictive projects,** most requirements are elicited and documented
up front, in a requirements document or specification that stakeholders
formally approve. It becomes part of the scope baseline. After that, changes
go through change control. The analyst's work is heavy at the start and then
shifts to managing changes and supporting testing.

**In adaptive projects,** requirements are elicited continuously and just in
time. The backlog holds rough items far ahead and detailed, ready items near
the top. The analyst works inside the team, often alongside or as the
product owner, refining the backlog each iteration, writing stories and
acceptance criteria, and gathering feedback at each review. Detailed
documentation is lighter; conversation and working increments carry more.

**In hybrid projects,** both happen: fixed requirements for, say, a contract
or a regulated component, and an evolving backlog for the parts users shape.

| | Predictive | Adaptive |
|---|---|---|
| When requirements are detailed | Up front | Just in time, each iteration |
| Main artifact | Requirements document; RTM | Product backlog; user stories |
| Approval | Formal sign-off; change control | Product owner accepts each increment |
| Analyst's position | Often separate from delivery, a liaison | Inside the team |

## Acceptance criteria

**Acceptance criteria** are the conditions a deliverable or backlog item must
meet to be accepted by the customer or product owner. They make "done"
testable. Good criteria are specific, measurable, agreed before work starts,
and written from the user's or customer's point of view. The "given, when,
then" form works well:

> Given a patient with a booked appointment, when they reply "C" to the
> reminder text, then the appointment shows as confirmed at the front desk
> within one minute.

Acceptance criteria belong to one item; the **definition of done** applies to
every item (for example: tested, documented, accessible, deployed to the
test system).

The outline's phrase about acceptance criteria being "the action of defining
changes based on the situation" points to their role in adapting: when the
situation changes, the criteria are revisited with the product owner or
sponsor, and the change is agreed, not assumed.

## Verification, validation and readiness

Two checks come before delivery:

- **Verification** asks: did we build it right? Does it meet its
  specification? Testing against the requirements is verification.
- **Validation** asks: did we build the right thing? Does it meet the
  stakeholders' need? User acceptance testing and customer sign-off are
  validation.

**Is it ready for delivery?** In a predictive project, check the requirements
traceability matrix: every requirement in scope should trace to a design, a
build and a test that passed, and the customer should have validated the
deliverables. Any requirement without a passed test, or with an open defect
above an agreed severity, is a reason not to release. In an adaptive
project, check the backlog: each item in the release meets its acceptance
criteria and the definition of done, and the product owner has accepted it.
In both, the transition requirements (training, data migration, support)
must be ready too.

## Worked example: Riverside's roadmap and release decision

**Roadmap.**

| Release | Theme | Contents |
|---|---|---|
| 1 (MVP), month 5 | Patients can book online | View slots; book; text confirmation; import existing appointments; staff training |
| 2, month 7 | Patients manage their own appointments | Cancel; reschedule; reply-to-confirm reminders |
| 3, month 10 | Everyone can use it | Spanish and Vietnamese screens; screen-reader improvements |

Cancelling goes in release 2 because it depends on booking. Staff training and
the appointment import are transition requirements and must ship with release
1.

**How the analyst works.** The vendor contract and the privacy requirements
were specified up front and signed off (predictive). The booking screens are
refined in two-week sprints with the product owner (adaptive): a hybrid.

**Readiness for release 1.** The RTM shows 42 of 43 requirements with passed
tests. The exception is N1 (WCAG 2.1 AA): two screens fail color contrast.
The team fixes them, the test passes, and user acceptance testing with ten
patients validates the release. The front desk has finished training, the
appointment import has been rehearsed, and the product owner accepts. Release
1 is ready.

## Key terms

- **Product roadmap; release; minimum viable product.**
- **Predictive, adaptive and hybrid business analysis; requirements
  sign-off; backlog refinement.**
- **Acceptance criteria; given-when-then; definition of done.**
- **Verification; validation; user acceptance testing.**
- **Release readiness.**

## Check yourself

1. What is a product roadmap for?
   - A. Assigning tasks to team members each day
   - B. Showing direction and the order of releases at a high level
   - C. Recording each requirement's test status
   - D. Tracking actual costs
2. "Reschedule an appointment" depends on "book an appointment." Which
   release should reschedule go in?
   - A. Before booking
   - B. In the same release as booking or a later one
   - C. Only after all other features
   - D. It doesn't matter
3. In which approach does the business analyst typically elicit requirements
   just in time, refining the backlog every iteration?
   - A. Predictive
   - B. Adaptive
   - C. Waterfall
   - D. Critical path
4. User acceptance testing primarily performs:
   - A. Verification
   - B. Validation
   - C. Quality assurance of processes
   - D. Scope definition
5. What's the difference between acceptance criteria and a definition of
   done?
6. The RTM shows every requirement traced to a passed test except one
   security requirement whose test failed. What should the analyst advise?
   - A. Release; one failure is minor
   - B. Don't release until the failure is fixed and retested, or the sponsor
     formally accepts the risk
   - C. Remove the requirement from the RTM
   - D. Mark the test as passed
7. Write acceptance criteria in given-when-then form for "a patient cancels
   an appointment online."

## Answers

1. **B.** A roadmap shows direction and release order; A is task
   assignment, C is the RTM, D is cost tracking.
2. **B.** A dependent feature can't ship before what it depends on.
3. **B.** Just-in-time elicitation and continuous refinement are adaptive.
4. **B.** It checks the product meets users' needs: validation.
   Verification (A) checks it meets its specification.
5. Acceptance criteria are conditions specific to one item. The definition
   of done is a quality standard that applies to every item.
6. **B.** An untested security requirement means the product isn't ready;
   the decision to accept that risk belongs to the sponsor, formally. C and D
   falsify the record.
7. For example: "Given a patient with an appointment more than 24 hours
   away, when they choose Cancel and confirm, then the appointment is removed,
   the slot becomes available to others, and the patient receives a text
   confirming the cancellation."

*Next: Chapter 7 is a full practice exam.*
