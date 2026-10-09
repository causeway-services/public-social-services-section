# Ask: questions, decisions, spreadsheets and stakeholders

*Companion to Course 2, Ask Questions to Make Data-Driven Decisions. Before
you start: Chapter 1's analysis process.*

## What you will be able to do

- Classify a business problem by type, and turn it into specific, answerable
  questions.
- Use structured thinking to define a problem's scope before touching data.
- Distinguish quantitative from qualitative data, and reports from
  dashboards, and say how each supports a decision.
- Enter data and write formulas and functions in a spreadsheet, using
  relative and absolute references correctly.
- Identify stakeholders, align their expectations, and communicate progress.

## From a worry to a question

The board said: "Weekend visits are down. Why?" That's a worry, not yet a
question an analysis can answer. Before collecting anything, an analyst
pins down what kind of problem it is and what exactly needs answering.

The course sorts the problems data can help with into six types:

- **Making predictions:** what will happen? (Visits next summer.)
- **Categorizing:** which group does each thing belong to? (Which patrons are
  weekend regulars.)
- **Spotting something unusual:** what doesn't fit? (A day with zero visits,
  likely a broken counter.)
- **Identifying themes:** what patterns run through qualitative answers?
  (Survey comments about parking.)
- **Discovering connections:** how are separate things related? (Hours and
  visits.)
- **Finding patterns:** what changes over time? (Visits by month.)

The board's problem is chiefly *discovering connections* (what's linked to the
fall?) with some *finding patterns* (when did it start?).

## Asking good questions

A good question for an analysis is specific, measurable, action-oriented,
relevant and time-bound. That's an adaptation of George Doran's 1981 advice
for writing management objectives [@doran1981]. Compare:

| Weak | Better |
|---|---|
| Why are visits down? | How did Saturday and Sunday visits at each branch change between September 2025–March 2026 and the same months a year earlier? |
| Do people like the library? | What share of surveyed patrons rated weekend hours "convenient" or "very convenient," by branch? |
| Should we change hours? | Did branches whose Saturday opening hours were shortened lose a larger share of Saturday visits than branches whose hours didn't change? |

Avoid three kinds of question: **leading** ones that suggest an answer ("Isn't
the drop caused by the new parking fees?"), **closed** ones that invite a yes
or no when you need an explanation, and **vague** ones that no data could
settle.

## Structured thinking

**Structured thinking** means recognizing the problem, organizing what you
know, finding the gaps, and choosing options before you start. Two tools make
it concrete:

- A **problem statement:** one or two sentences naming the problem, who has
  it, and what decision it serves. "The board must set next year's weekend
  hours by 1 June. It needs to know which changes in the last year are linked
  to fewer weekend visits, branch by branch."
- A **scope of work:** what will be delivered, when, from which data, and
  what's excluded. "Deliverables: one chart and a one-page memo by 15 May.
  Data: door counts, hours, survey. Excluded: the online catalog's usage."

Agreeing on both with the people who asked prevents the most common failure
in analysis: a good answer to the wrong question.

## Data for decisions

**Quantitative** data is measured in numbers: counts, amounts, durations.
**Qualitative** data describes qualities in words or categories: survey
comments, reasons given. Quantitative data tells you *what* and *how much*;
qualitative data often tells you *why*. The door counts show the drop; the
survey comments may explain it.

**Data-driven** decisions use facts to guide a choice. **Data-inspired**
decisions use data as one input among experience and judgment. Either way,
data informs a decision; it doesn't make it.

Findings reach decision-makers in two main forms:

- A **report** is a static summary of data at a point in time. Easy to
  produce and to read; out of date as soon as the data changes.
- A **dashboard** is a live display that updates as data changes and often
  lets users filter. Always current; takes more work to build and can
  overwhelm if it shows too much.

A **metric** is a single quantifiable measure, such as Saturday visits per
open hour. A **metric goal** is a target for it.

## Spreadsheet basics

A spreadsheet is a grid of **cells**, each named by column letter and row
number (B2). Every cell holds a value or a **formula**, which starts with `=`.

- **Operators:** `=B2+C2`, `=B2-C2`, `=B2*C2`, `=B2/C2`.
- **Functions** are named, prebuilt formulas: `=SUM(B2:B8)`,
  `=AVERAGE(B2:B8)`, `=COUNT(B2:B8)` (counts numbers), `=MIN(...)`,
  `=MAX(...)`. `B2:B8` is a **range**, every cell from B2 to B8.
- **Relative references** shift when you copy a formula: `=B2/C2` copied down
  one row becomes `=B3/C3`.
- **Absolute references** don't: `=B2/$C$1` copied down becomes
  `=B3/$C$1`. The `$` locks the column, the row, or both.

Common errors tell you what went wrong: `#DIV/0!` (dividing by zero or a
blank), `#VALUE!` (text where a number was expected), `#REF!` (a reference
to a deleted cell), `#NAME?` (a misspelled function name).

Spreadsheets are easy to get wrong. Raymond Panko's review of field audits
found errors in a large share of real spreadsheets [@panko1998]. Guard
against it: keep raw data on its own sheet, never type over it, and check
totals against another source.

## Stakeholders

**Stakeholders** are people who have invested in the project and will be
affected by its outcome: at Maple County, the board (who decide), the
director (who asked), branch managers (whose branches are measured), the
operations manager (who owns the hours list), and patrons (who live with the
result). There's also your own team: whoever reviews your work.

Align expectations early. Confirm with the person who asked what they need,
by when, and in what form. Ask what they already believe, since that tells
you what evidence they'll need to see. Communicate regularly, briefly, and
before surprises: tell the director that the counter data has gaps before
the chart shows them. When a request conflicts with the agreed scope, say so,
explain what it would cost in time, and let the person who owns the question
decide.

## Worked example: asking Maple County's question

**Problem type:** discovering connections, plus finding patterns.

**Problem statement:** as above.

**Questions:**

1. How did weekend visits change, by branch and by day, between the last
   seven months and the same seven months a year earlier?
2. Which branches changed their weekend hours in that time, and when?
3. Did branches whose hours shrank lose a larger share of visits?
4. What do surveyed patrons say about weekend hours?

**A first spreadsheet look.** The operations manager's hours sheet:

| | A | B | C | D |
|---|---|---|---|---|
| 1 | Branch | Sat hours 2025 | Sat hours 2026 | Change |
| 2 | Central | 8 | 8 | `=C2-B2` → 0 |
| 3 | Eastside | 8 | 5 | `=C3-B3` → −3 |
| 4 | Northfield | 8 | 8 | 0 |
| 5 | Riverside | 8 | 5 | −3 |
| 6 | Westgate | 6 | 6 | 0 |

`=COUNTIF(D2:D6,"<0")` returns 2: two branches cut Saturday hours. To show
each branch's share of the system's 2026 Saturday hours, `=C2/SUM($C$2:$C$6)`
in E2, copied down; the absolute range keeps the total fixed.

**Stakeholders:** the director agrees on the four questions and the 15 May
deadline, and asks that branch managers see their numbers before the board
does.

## Key terms

- **Problem types:** predictions, categorizing, spotting the unusual,
  themes, connections, patterns.
- **Specific, measurable, action-oriented, relevant, time-bound questions;
  leading, closed and vague questions.**
- **Structured thinking; problem statement; scope of work.**
- **Quantitative and qualitative data; data-driven and data-inspired
  decisions; report; dashboard; metric.**
- **Cell; formula; function; range; relative and absolute references.**
- **Stakeholder.**

## Check yourself

1. "Which patrons are likely to stop visiting next year?" is which problem
   type?
2. Rewrite "Are weekends bad?" as a specific, measurable, time-bound question.
3. What's wrong with "Don't you think the new parking fees drove people
   away?"
4. When would you choose a dashboard over a report?
5. Cell E2 holds `=C2/$C$7`. What does it become when copied to E3?
6. A formula returns `#DIV/0!`. What's the likely cause?
7. Why agree on a scope of work before starting?

## Answers

1. Making predictions (it also involves categorizing patrons).
2. For example: "How did the number of Saturday visits at each branch change
   between March 2025 and March 2026?"
3. It's a leading question: it suggests its own answer.
4. When the data changes often and people need the current state, or want
   to filter it themselves.
5. `=C3/$C$7`: the relative part moves down a row; the absolute part stays.
6. Dividing by zero or by a blank cell.
7. So the analysis answers the question the stakeholders need answered, by
   when they need it, and changes are agreed rather than drifted into.

*Next: Chapter 3 prepares the data.*
