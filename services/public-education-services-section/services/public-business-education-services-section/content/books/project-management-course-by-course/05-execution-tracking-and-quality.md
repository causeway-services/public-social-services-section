# Execution I: tracking, change and quality

*Companion to Course 4, Project Execution, first half. Before you start:
Chapter 3's schedule and Chapter 4's budget and risk register.*

## What you will be able to do

- Decide what to track on a running project, and measure schedule and cost
  performance with earned value.
- Run a change through a change control process.
- Manage the four kinds of task dependency and escalate a blocked one.
- Distinguish quality planning, assurance and control, and apply the
  plan-do-check-act cycle.
- Measure customer satisfaction, run a retrospective, and use data to make and
  present a decision.

## What to track

Once the plan is approved, it becomes the **baseline**: the schedule, budget
and scope that progress is measured against. Execution is doing the work and,
at the same time, watching the gap between the work and the baseline. Track
five things: the schedule (are tasks finishing when planned?), the budget
(is spending where planned?), the scope (is the work still what was agreed?),
the risks (are any triggers firing?), and quality (does the work meet its
standards?).

Summarize each in a status a busy sponsor can read in a glance: on track, at
risk, or off track. Then back each status with numbers.

## Earned value

A budget report that says "we've spent $5,500 of $11,500" tells you almost
nothing. Is that good? It depends on how much work that money bought and how
much was supposed to be done by now. **Earned value management** answers
both at once by comparing three numbers at a point in time
[@fleming-koppelman2010]:

- **Planned value (PV):** the budgeted cost of the work scheduled to be done
  by now.
- **Earned value (EV):** the budgeted cost of the work actually done by now.
- **Actual cost (AC):** what the work done by now actually cost.

From them come two gaps and two ratios:

- **Schedule variance** SV = EV − PV. Negative means behind schedule.
- **Cost variance** CV = EV − AC. Negative means over budget.
- **Schedule performance index** SPI = EV / PV. Below 1 means behind.
- **Cost performance index** CPI = EV / AC. Below 1 means over budget.

With the **budget at completion (BAC)**, the total baseline, you can forecast
the **estimate at completion (EAC)**. If the cost performance so far is
expected to continue, EAC = BAC / CPI. If the overrun was a one-off and the
rest of the work should cost what was planned, EAC = AC + (BAC − EV). Which
formula fits is a judgment about why the numbers are what they are.

Earned value works best when work can be measured in completed pieces. For
work whose "percent complete" is a guess, count finished work packages
rather than estimating partial progress.

## Changes and dependencies

Plans change. What matters is that changes are decided, not drifted into.
A **change control process** has five steps:

1. Someone submits a **change request**, in writing.
2. The project manager analyzes its impact on scope, schedule, budget, risk
   and quality.
3. The person or group with authority decides: the sponsor, or on large
   projects a change control board.
4. If approved, the baseline is updated.
5. The change is communicated to everyone affected.

Dependencies need active management too. There are four logical kinds:

- **Finish-to-start (FS):** B can't start until A finishes. The most common.
- **Start-to-start (SS):** B can't start until A starts.
- **Finish-to-finish (FF):** B can't finish until A finishes.
- **Start-to-finish (SF):** B can't finish until A starts. Rare; think of a
  night shift that can't end until the day shift begins.

Dependencies on people outside the team, such as a vendor or another
department, are the ones most likely to slip, and the team can't fix them
directly. Track them explicitly, confirm them before they're due, and when one
is blocked, **escalate**: tell the person with the authority to unblock it,
early, with the impact and a specific request.

## Quality

**Quality** is how well the project's outputs meet their requirements and
the needs behind them. It's managed at three levels:

- **Quality planning** sets the standards: what "good" means for each
  deliverable, and how it's checked.
- **Quality assurance** checks the process: are we working in a way that
  produces good results?
- **Quality control** checks the product: does this deliverable meet its
  standard? Inspection, testing and review are quality control.

Improvement follows a loop that W. Edwards Deming taught to managers in
Japan and the United States and credited to his mentor Walter Shewhart:
**plan-do-check-act (PDCA)** [@deming1986]. Deming later preferred "study" to
"check", so you'll also see PDSA. Plan a change, do it on a small scale, check the results against what you
expected, and act: adopt the change, abandon it, or run the loop again.
**Continuous improvement** is running that loop as a habit rather than once.

Quality is judged in the end by the customer. **Customer satisfaction** is
measured by asking: a short survey, interviews, or a single score. One widely
used score is the **Net Promoter Score (NPS)**, which Frederick Reichheld
introduced in 2003: ask how likely the respondent is to recommend the
organization to a friend or colleague, on a scale of 0 to 10; count 9s and 10s as promoters and 0 to 6 as detractors;
NPS is the percentage of promoters minus the percentage of detractors
[@reichheld2003]. Treat a single score as a prompt to ask why, not an answer.

## Retrospectives

A **retrospective** is a meeting where the team looks back at a stretch of
work to improve how it works. Don't wait for the end of the project; hold one
after each milestone or cycle, while there's still time to use what's
learned.

A retrospective only works if people can speak honestly. Norman Kerth, who
wrote the standard handbook on them, opened each one with what he called the
Prime Directive: that "everyone did the best job they could, given what they
knew at the time, their skills and abilities, the resources available, and
the situation at hand" [@kerth2001]. The purpose is to fix the process, not to
blame a person.

A simple format asks three questions: What went well? What didn't? What will
we change? End with a short list of changes, each with an owner, and check
them at the next retrospective.

## Data-informed decisions

Data helps a project manager decide by replacing impressions with evidence.
Work in order: state the decision to be made; choose the few measures that
bear on it; collect them; look at them; decide. Prefer **leading
indicators**, which move before the outcome does (volunteer sign-ups), over
**lagging indicators**, which report it after the fact (families served), when
you still have time to act.

When presenting data, show the comparison the audience needs and remove
everything else. Edward Tufte's rule is to spend the ink on the data, not on
decoration [@tufte2001]. Use a line for change over time, bars to compare
categories, and a table when people need exact numbers. Put the conclusion
in the title: "Sign-ups are behind target" says more than "Volunteer
sign-ups."

## Worked example: week 3 at Eastside

**Earned value.** At the end of week 3, the schedule called for $6,000 of the
baseline's work to be done (PV). The work actually done was worth $5,000 at
planned cost (EV), and it cost $5,500 (AC). The baseline (BAC) is $11,500.

- SV = 5,000 − 6,000 = −$1,000: behind schedule.
- CV = 5,000 − 5,500 = −$500: over budget.
- SPI = 5,000 / 6,000 ≈ 0.83; CPI = 5,000 / 5,500 ≈ 0.91.
- If this cost performance continues, EAC = 11,500 / (5,000 / 5,500) =
  11,500 × 1.1 = $12,650, beyond even the $12,000 total budget.

The project manager asks why before reporting. The overrun was a $500 rush
fee paid once to move the shelving delivery forward. That won't recur, so
the better forecast is EAC = AC + (BAC − EV) = 5,500 + 6,500 = $12,000:
still over the baseline by $500, which the contingency reserve can cover.
The schedule gap is volunteer recruitment, on the critical path. Status: at
risk, with a recovery plan (a second recruitment push through the school
newsletter).

**A change request.** The principal asks whether the pantry could also open
Sunday afternoons. The programs manager records the request and analyzes it:
40 more volunteer hours a week, a second building-use agreement, and more
custodian time. The director decides to revisit it after the first month, and
everyone is told.

**Quality.** The standard for cold storage is 40°F or below, checked by
thermometer at opening and closing (quality control). The team also checks
that every volunteer on a shift holds a food-safety certificate (quality
assurance on the process).

**Satisfaction.** After two Saturdays, 50 families answered the recommend
question: 30 promoters, 12 passives, 8 detractors. NPS = 60% − 16% = 44. The
detractors' comments say the same thing: the line was outdoors in the cold.

**Retrospective and a PDCA loop.** The team's retrospective lists the line as
the top change. Plan: let families wait in the school lobby with numbered
tickets. Do: try it the next Saturday. Check: wait time outdoors falls to
zero and no one misses a turn. Act: adopt it.

## Key terms

- **Baseline.**
- **Earned value management:** PV, EV, AC; SV, CV; SPI, CPI; BAC, EAC.
- **Change request; change control; change control board.**
- **FS, SS, FF and SF dependencies; escalation.**
- **Quality planning, quality assurance, quality control.**
- **Plan-do-check-act (PDCA); continuous improvement.**
- **Customer satisfaction; Net Promoter Score.**
- **Retrospective.**
- **Leading and lagging indicators.**

## Check yourself

1. PV = $20,000, EV = $18,000, AC = $16,000. Calculate SV, CV, SPI and CPI.
   Is the project ahead or behind, over or under budget?
2. With a BAC of $50,000 and a CPI of 0.8, what's the EAC if performance
   continues as it has?
3. What's the difference between quality assurance and quality control?
4. Put the five steps of change control in order.
5. Out of 100 responses, 45 score 9 or 10, 35 score 7 or 8, and 20 score 0
   to 6. What's the NPS?
6. Which is a leading indicator for the Eastside pantry's goal of serving 60
   households a Saturday: families who signed up this week, or households
   served last Saturday?
7. What's the purpose of Kerth's Prime Directive?
8. Shelving delivery can't start until the order is placed. What kind of
   dependency is that? Two weeks before opening, the vendor stops answering.
   What should the project manager do?

## Answers

1. SV = 18,000 − 20,000 = −$2,000 (behind schedule). CV = 18,000 − 16,000 =
   +$2,000 (under budget). SPI = 0.9. CPI = 1.125.
2. 50,000 / 0.8 = $62,500.
3. Quality assurance checks the process used to produce the work; quality
   control checks the work product itself against its standard.
4. Submit the change request; analyze its impact; decide; update the
   baseline if approved; communicate the result.
5. 45% − 20% = 25.
6. Families who signed up this week: it moves before the outcome, while
   there's time to act.
7. To make it safe to speak honestly by agreeing at the start that the review
   is about improving the process, not blaming people.
8. Finish-to-start. Escalate early: tell the person with authority over the
   vendor relationship (the director, who signed the contract) what's
   blocked, what it will delay, and what's needed from them, such as a call
   to the vendor's manager.

*Next: Chapter 6 covers the people side of execution, and closing.*
