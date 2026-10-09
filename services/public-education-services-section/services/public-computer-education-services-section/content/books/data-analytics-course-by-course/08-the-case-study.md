# The case study: a portfolio piece from start to finish

*Companion to Course 8, Google Data Analytics Capstone: Complete a Case
Study. Before you start: Chapters 2 to 7.*

## What you will be able to do

- Tell a capstone, a case study and a portfolio apart.
- Plan a case study that runs through all six phases, from a question to a
  recommendation.
- Check each phase's output against a list of what makes it good.
- Present the case study so an employer can see how you work, not only what
  you found.

## Capstone, case study, portfolio

A **capstone** is a final project that draws on everything a program taught.
A **case study** is a written account of one analysis: the question, the
data, what you did and why, what you found, and what you recommend. A
**portfolio** is a collection of your work that employers can look at, with a
case study as its centerpiece.

The course asks you to complete a case study and put it in a portfolio
[@google-da-2026]. It offers structured options with a provided scenario and
data, or the choice of your own question and public data. This chapter doesn't
describe the course's scenarios or answer them. It gives you a checklist for
each phase, so you can judge your own work, and it uses Maple County, the
example you've followed through this book, as a model of a finished one.

## Choosing a question and data

If you choose your own, pick a question you care about, that a decision
depends on, and that public data can answer. Good sources of **open data**
include government statistics portals, city open-data sites, public transit
feeds and research repositories. Check the license, the metadata and how the
data was collected, as in Chapter 3.

Scope it small. A focused question answered well beats a sprawling one
answered vaguely.

## A checklist for each phase

**Ask** (Chapter 2)

- A problem statement: the problem, who has it, the decision it serves.
- Three to five specific, measurable questions.
- The stakeholders, and what each needs.

**Prepare** (Chapter 3)

- Each data source, where it came from, its license, and its credibility.
- The data's structure (columns, types, scales) and whether it's tidy.
- Its limitations and any bias, stated plainly.
- How personal information is protected, if there is any.

**Process** (Chapter 4)

- The tool chosen for cleaning (spreadsheet, SQL or Python) and why.
- Every cleaning step, in a changelog: duplicates, inconsistent values, types,
  missing and conflicting values, and how each was treated.
- Verification: counts and totals before and after, explained.

**Analyze** (Chapter 5)

- The calculations, in a form someone else can rerun (formulas, a query or a
  notebook).
- Summaries broken down by the groups that matter, not only totals.
- Alternatives considered before any causal claim.

**Share** (Chapter 6)

- Two to four visualizations, each with a title that states its message, a
  zero baseline for bars, direct labels and alt text.
- The limitations, in the presentation itself.

**Act**

- A recommendation of one to three concrete actions, each tied to a finding.
- What to measure next to check the recommendation worked.

## Presenting it

An employer reading your case study wants to see how you think. So:

- **Lead with the answer.** One paragraph at the top: the question, what you
  found, what you recommend.
- **Show your reasoning,** especially the choices: why this data, why this
  cleaning rule, why this chart.
- **Show your work** in a form they can open: a shared notebook, a query file,
  a published Tableau dashboard.
- **Be honest about limits.** Saying what the data can't show is a skill
  employers look for.
- **Keep it readable:** headings for the six phases, short paragraphs, charts
  that stand on their own.

Put the case study on a portfolio site or a code-hosting profile, with a
one-line description of each project and a link to the full write-up.

## Worked example: Maple County as a case study

**Summary (the top paragraph).** "Maple County Library's weekend visits fell
10 percent. Almost 90 percent of the drop came from the two branches that
shortened Saturday hours, where Saturday visits fell by a quarter; the other
three changed by under 2 percent. I recommend restoring Saturday mornings at
those two branches and measuring the next three months."

**What the reader can open:** the SQL query that builds the season table; the
pandas notebook that reproduces it; the changelog; the Tableau chart with alt
text.

**Limitations stated:** 11 branch-days of unknown visits; a survey of people
who still visit, with a margin of about ±10 points for the two branches; the
link between hours and visits is a correlation, with the alternatives that
were checked.

**Reviewing one phase against its checklist:** the first draft's Process
section said "cleaned the data." The checklist asks for every step; the
revision lists the four steps and the row counts, with the changelog attached.

## Key terms

- **Capstone; case study; portfolio.**
- **Open data; license.**
- **Reproducible analysis.**

## Check yourself

1. What's the difference between a case study and a portfolio?
2. Name two things the Prepare section of a case study should state about
   each data source.
3. A draft says "I removed the bad rows." What should replace it?
4. Why lead a case study with the answer rather than the method?
5. Name three things you would link so an employer can check your work.
6. Why include limitations in a portfolio piece meant to impress?

## Answers

1. A case study is one written account of an analysis; a portfolio is a
   collection of work that can include more than one case study.
2. Any two of: where it came from; its license; its credibility; its
   structure and types; its limitations and bias; how personal data is
   protected.
3. A precise account of which rows were removed, by what rule, how many, and
   why, recorded in the changelog.
4. Because readers, including employers, want the conclusion first and read
   the method to judge it.
5. Any three of: the query file, the notebook, the changelog, the published
   dashboard, the cleaned data set.
6. Because stating what the data can't show is part of sound analysis, and
   employers look for it.

*Next: the study plan.*
