# Process: integrity, sampling and cleaning

*Companion to Course 4, Process Data from Dirty to Clean. Before you start:
Chapter 3's data types and SQL.*

## What you will be able to do

- Name the threats to data integrity and check data against them.
- Explain random sampling, compute a sample size and margin of error, and
  explain statistical power.
- Decide what to do when data is insufficient.
- Recognize the kinds of dirty data, and clean them in a spreadsheet and in
  SQL.
- Treat blank and conflicting values without changing the answer.
- Verify cleaning and document it in a changelog.

## Data integrity

**Data integrity** is the accuracy, completeness, consistency and
trustworthiness of data across its life cycle. It's threatened at every step:

- **Replication:** copies stored in different places drift apart.
- **Transfer:** a file export cuts off rows or garbles characters.
- **Manipulation:** a formula applied to the wrong range, a sort applied to
  one column only.
- **Human error, viruses, system failures:** typos, corrupted files, a door
  counter that stops counting.

Check integrity before analysis: row counts match the source; totals match a
known figure; dates cover the expected range; each branch appears as
expected.

## Samples and their size

When the whole population can't be measured, analysts use a **sample**. A
**random sample** gives every member a known chance of selection, so its
differences from the population are due to chance, which can be measured.
A sample drawn only from the easiest people to reach can't be repaired by
arithmetic.

Three quantities describe a sample's precision:

- **Confidence level:** how often the method would capture the true value
  across repeated samples, usually 95 percent.
- **Margin of error:** how far the estimate may be from the true value at that
  confidence.
- **Sample size:** how many were measured.

To estimate a proportion within a margin $e$ at 95 percent confidence, William
Cochran's formula gives the sample size [@cochran1977]:

$$n = \frac{1.96^2 \times p(1 - p)}{e^2}$$

With no prior guess for $p$, use 0.5, which gives the largest (safest) $n$.
For ±5 points: $n = 3.8416 \times 0.25 / 0.0025 \approx 384.2$, which rounds up to 385: sample sizes always round up, since a fraction of a person can't be surveyed and rounding down would miss the target margin. The margin
shrinks with the square root of the sample, so halving it takes four times
the sample. For a small population of size $N$, a finite-population
correction lowers the number needed: $n_{\text{adj}} = n / (1 + (n - 1)/N)$.
For a library's 2,000 card holders, the 385 becomes $385 / (1 + 384/2{,}000) \approx 323.0$, so 323.

A common rule says 30 is enough. That rule is about when a sample *mean*
starts to behave normally; it says nothing about the margin you need.

**Statistical power** is the probability that a test detects a real effect
of a given size. A study with low power can miss a real difference, so "no
significant difference" from a small sample isn't proof of none. Jacob Cohen
made power analysis standard: choose the smallest effect worth detecting and
the power wanted (often 80 percent), and compute the sample size from them
[@cohen1988].

## When data is insufficient

Data may be too little, too old, limited to one place, or still being
updated. The options: collect more; wait for the update; use a **proxy**
(a related measure, such as checkouts when door counts are missing); narrow
the question to what the data can answer; or report the limitation plainly.
What you shouldn't do is fill the gap silently.

## Dirty data and how to clean it

**Dirty data** is incomplete, incorrect or irrelevant to the problem. The
common kinds:

- **Duplicates:** the same record more than once, often from a re-import.
- **Outdated:** superseded by newer information.
- **Incomplete:** missing values.
- **Incorrect:** wrong values, such as typos or impossible numbers (a branch
  with 40,000 visitors in a day).
- **Inconsistent:** the same thing written different ways ("Eastside", "East
  Side ", "EASTSIDE"), or different formats (03/14/2026 and 2026-03-14).

**In a spreadsheet:**

- `=TRIM(A2)` removes extra spaces; `=UPPER()`, `=LOWER()`, `=PROPER()` fix
  case.
- Remove duplicates with the built-in tool, after checking with
  `=COUNTIF($A$2:$A$500,A2)>1`.
- Split one column into more than one with "split text to columns" (by a
  delimiter such as a comma).
- **Conditional formatting** highlights values outside a range; **data
  validation** stops bad values being entered.
- `=IFERROR(B2/C2,"")` replaces an error with a blank, which is honest only
  if a blank means "unknown."

**In SQL:**

```sql
SELECT DISTINCT                        -- drop exact duplicate rows
  UPPER(TRIM(branch_name)) AS branch,  -- one spelling per branch
  CAST(visit_date AS DATE) AS visit_date,
  visitors
FROM raw_visits
WHERE LENGTH(TRIM(branch_name)) > 0;   -- drop rows with no branch
```

Other functions you'll use: `SUBSTR(text, start, length)` to take part of a
string; `REPLACE(text, 'East Side', 'Eastside')`; `COALESCE(a, b)`, which
returns the first non-null value; and `CASE WHEN ... THEN ... ELSE ... END`
to recode values.

## Blank, zero and conflict

A cell can be in one of four states, and cleaning must keep them apart. A
four-valued logic of this kind, which Nuel Belnap proposed for computers
that combine information from sources that may be silent or disagree
[@belnap1977], fits data cleaning well:

- **Known value:** the counter recorded 312.
- **Known zero (or "no"):** the branch was closed, so 0 visitors is a fact.
- **Unknown:** the counter was broken, so the cell is **blank**. Nothing is
  known.
- **Conflicting:** the door counter says 312 and the manager's tally sheet
  says 280 for the same day.

The two classic cleaning mistakes collapse these. Filling blanks with zero
turns "unknown" into "nobody came," which drags every average down. Silently
keeping one of two conflicting values hides the conflict. Instead: leave
blanks as blank (SQL's `NULL`), exclude them from averages (as `AVG` does),
and count them; mark conflicts and resolve them by a stated rule ("the
counter wins unless the log shows it was broken"), recorded in the changelog.

The same idea is the basis of formal concept analysis's reading of a table,
where each cell says whether an object has an attribute; allowing cells to be
unknown or contested extends it to real, imperfect data [@ganter-wille1999].

## Verify and document

**Verification** confirms the cleaning worked and didn't break anything:

- Compare row counts and totals before and after; each difference should be
  explained by a cleaning step.
- Spot-check a sample of rows against the source.
- List the distinct values of each category column (a pivot table or
  `SELECT DISTINCT`) to catch spellings that survived.
- Check results against expectations with the people who know the data: "Is
  it plausible that Westgate had no Sunday visits? Yes, it's closed Sundays."

A **changelog** records every change: what was changed, why, when, by whom,
and how many rows it touched. It lets others trust and repeat the work, and
lets you undo a mistake.

## Worked example: cleaning Maple County's visits

The raw export has 3,712 rows.

1. **Duplicates.** `SELECT COUNT(*)` against `SELECT COUNT(*) FROM (SELECT
   DISTINCT * FROM raw_visits)` shows 3,712 against 3,650: 62 duplicate rows
   from a March re-import. Removed.
2. **Inconsistent names.** `SELECT DISTINCT branch_name` shows "Eastside",
   "East Side " and "EASTSIDE". `REPLACE(UPPER(TRIM(branch_name)), 'EAST SIDE',
   'EASTSIDE')` trims, uppercases and then joins the two words, giving one
   spelling.
3. **Broken counters.** The facilities log lists 11 days when a counter was
   out; those rows show 0. They're set to `NULL`, not left as 0, and counted
   in the report ("11 branch-days unknown").
4. **A conflict.** For 14 March at Eastside, the counter says 312 and the
   tally sheet 280. The rule "counter wins unless logged broken" keeps 312;
   the conflict is noted.
5. **Verification.** 3,650 rows remain; 11 visitor values are `NULL`; the
   system's total for 2025 matches the annual report's figure to within the
   known 11 missing days.

**Changelog excerpt:**

| Date | Change | Rows | Reason |
|---|---|---|---|
| 2026-04-02 | Removed exact duplicates | 62 | March re-import |
| 2026-04-02 | Standardized branch names | 214 | Three spellings of Eastside |
| 2026-04-02 | Set counter-outage days to NULL | 11 | Facilities outage log |

**Survey precision.** The patron survey has 250 responses. At 95 percent, the
margin for a proportion is at most $1.96\sqrt{0.25/250} \approx 0.062$, about
±6 points. That's enough to see large differences, not small ones, and the
report says so.

## Key terms

- **Data integrity; replication, transfer and manipulation errors.**
- **Random sample; confidence level; margin of error; sample size;
  statistical power.**
- **Insufficient data; proxy.**
- **Dirty data: duplicate, outdated, incomplete, incorrect, inconsistent.**
- **TRIM, COUNTIF, conditional formatting, data validation, IFERROR.**
- **DISTINCT, TRIM, UPPER, CAST, SUBSTR, REPLACE, COALESCE, CASE, NULL.**
- **Unknown versus zero; conflicting values.**
- **Verification; changelog.**

## Check yourself

1. Name four threats to data integrity.
2. What sample size estimates a proportion within ±4 points at 95 percent
   confidence, with no prior guess?
3. Why is "no significant difference" from a survey of 20 people weak
   evidence?
4. Name the five kinds of dirty data.
5. Write a SQL expression that turns " riverside " into "RIVERSIDE".
6. A counter broke for three days. Why shouldn't those days be recorded as 0
   visitors?
7. What four things should each changelog entry record, at least?

## Answers

1. Any four of: replication, transfer, manipulation, human error, viruses,
   system failures.
2. $3.8416 \times 0.25 / 0.0016 = 600.25$, rounded up to 601.
3. A sample that small has low power: it could easily miss a real
   difference.
4. Duplicate, outdated, incomplete, incorrect, inconsistent.
5. `UPPER(TRIM(' riverside '))`.
6. Zero means nobody came, which is false; the true number is unknown.
   Recording 0 lowers every total and average; `NULL` keeps the value
   unknown and out of averages.
7. What changed, why, when, and how many rows it affected (and who made it).

*Next: Chapter 5 analyzes the clean data.*
