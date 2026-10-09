# Prepare: collecting, judging and organizing data

*Companion to Course 3, Prepare Data for Exploration. Before you start:
Chapter 2's questions.*

## What you will be able to do

- Decide how to collect data for a question, and tell first-, second- and
  third-party data apart.
- Classify data by type and measurement scale, and organize a table so each
  variable is a column and each observation a row.
- Identify biased data and judge a source's credibility.
- Apply the principles of data ethics and privacy, and use open data
  responsibly.
- Describe relational databases, keys and metadata, and write basic SQL to
  select, filter and sort.
- Organize and protect files.

## Collecting data

**First-party** data is collected by the organization itself (the library's
door counts). **Second-party** data is another organization's first-party
data, shared directly (the school district's attendance calendar). **Third-
party** data comes from an outside provider that didn't collect it for you
(census estimates of each branch's neighborhood).

Collection decisions to make before collecting: which data answers the
question; how much (the whole population, or a sample; Chapter 4); over what
time frame; and from which sources. At Maple County, a year of daily counts
from every branch is the whole population of visits, so no sampling is
needed; the patron survey is a sample.

## Data types and scales

Every column has a **type**:

- **Quantitative:** numbers you can do arithmetic with. **Discrete** if
  counted (visits), **continuous** if measured (minutes spent).
- **Qualitative (categorical):** labels. **Nominal** if unordered (branch
  name), **ordinal** if ordered (rating from "poor" to "excellent").

S. S. Stevens's four **scales of measurement** say which operations a column
supports [@stevens1946]: **nominal** (count and compare equal), **ordinal**
(rank), **interval** (add and subtract; temperatures, calendar dates),
**ratio** (all arithmetic, with a true zero; visits, dollars). Averaging a
1-to-5 rating treats it as interval data, which the scale doesn't guarantee;
report its median or the share of each answer instead.

In a spreadsheet or database, columns also have a **data type** the software
enforces: number, text (string), date, Boolean (true or false). A number
stored as text won't add up, which is one of the commonest cleaning chores.

## Organizing a table

Data can be **structured** (in rows and columns with a fixed schema) or
**unstructured** (text, images, audio). Analysts usually work with
structured data.

Hadley Wickham set out three rules for **tidy data**: each variable forms a
column, each observation forms a row, and each type of observational unit
forms a table [@wickham2014]. Karl Broman and Kara Woo gave practical rules
for spreadsheets in the same spirit: be consistent, put just one thing in a
cell, use a single rectangle of data per sheet, no empty cells where a value
is known, write dates as YYYY-MM-DD, don't use font color or highlighting as
data, and keep raw data untouched [@broman-woo2018].

Two layouts of the same Saturday visits. Wide:

| Branch | 2025 | 2026 |
|---|---|---|
| Eastside | 5,410 | 3,902 |

Long (tidy):

| Branch | Year | Saturday visits |
|---|---|---|
| Eastside | 2025 | 5,410 |
| Eastside | 2026 | 3,902 |

**Wide** data puts a variable's values across columns (one column per year);
**long** data puts each observation in its own row. Long data is easier to
filter, group and chart; wide data is easier for people to read.

## Bias and credibility

**Biased data** systematically misrepresents what it's meant to describe.
Kinds to watch for:

- **Sampling bias:** the sample doesn't represent the population (the
  in-branch survey).
- **Observer bias:** people record what they expect to see.
- **Interpretation bias:** ambiguous results read in line with prior belief.
- **Confirmation bias:** looking for, or favoring, evidence for what you
  already think.

To judge a **source's credibility**, ask: Who collected it, and do they have
a reason to shade it? How was it collected, and is the method documented? Is
it original, or copied from somewhere you should check instead? Is it
complete for the question? Is it current? Is it cited, so others can trace
it? Google's course packs these questions into a short checklist; the
questions are what matter.

**Open data** is data anyone may use and share, usually under a license that
states the terms: government statistics, public transit feeds, research data
sets. It's free to use, not free of the duty to check it.

## Ethics and privacy

Data about people carries obligations to them. A 1973 U.S. government report
set out the **fair information practices** that most privacy law still
follows: no secret record-keeping systems; people can find out what's
recorded about them and how it's used; data collected for one purpose isn't
used for another without consent; people can correct their records; and
organizations must keep the data reliable and prevent misuse [@hew1973]. The
European Union's General Data Protection Regulation of 2016 states its
principles as lawfulness, fairness and transparency; purpose limitation;
data minimization; accuracy; storage limitation; integrity and
confidentiality; and accountability [@gdpr2016].

For an analyst, those come down to practice:

- **Consent and transparency:** people know what's collected and why.
- **Minimization:** collect and keep only what the question needs.
- **Privacy:** protect identities; **anonymize** or **aggregate** before
  sharing (report visits by branch, never by patron).
- **Purpose limitation:** use data only for purposes compatible with why it
  was collected.

Libraries have a strong tradition here: checkout histories are treated as
confidential. The Maple County analysis uses counts and aggregated checkouts,
never who borrowed what.

## Databases and SQL

A **relational database** stores data in tables that relate to one another
through shared columns. E. F. Codd set out the relational model in 1970
[@codd1970]. Each table has a **primary key**, a column whose value uniquely
identifies each row (`branch_id`), and may have **foreign keys**, columns that
refer to another table's primary key (`visits.branch_id` refers to
`branches.branch_id`).

**Metadata** is data about data: what each column means, its units, who
collected it and when, how it's been changed. Without metadata, "visits" in
one table and "entries" in another may or may not be the same thing.

**SQL** retrieves data with **queries**. The core of SQL is standard, but
databases differ in their functions; this book's queries follow BigQuery, the
database the course uses, and say so where another database would differ. The
core pattern:

```sql
SELECT branch_id, visit_date, visitors
FROM visits
WHERE day_of_week = 'Saturday'
  AND visit_date >= '2025-09-01'
ORDER BY visit_date;
```

- `SELECT` names the columns (or `*` for all).
- `FROM` names the table.
- `WHERE` filters rows; combine conditions with `AND` and `OR`; test text
  with `=` and patterns with `LIKE 'East%'`.
- `ORDER BY` sorts (add `DESC` for descending).
- `LIMIT 10` returns only the first ten rows, useful for a first look.

## Organizing and protecting files

Name files so they sort and explain themselves: `2026-03-14_door-counts_eastside_v02.csv`
(date first, in YYYY-MM-DD; no spaces; a version number). Keep one folder per
project, with raw data, working files and outputs separated. Protect data
with **access control** (only those who need it can open it), **backups**,
and **version control**, so changes can be traced and undone.

## Worked example: preparing Maple County's data

**Sources:** door counts (first-party, facilities database); hours (first-
party, operations spreadsheet); survey (first-party sample); neighborhood
population estimates (third-party, census).

**Credibility check on the door counts:** collected automatically, so
observer bias is low; but a broken counter records zeros. The facilities
manager's log lists the dates counters were out: metadata the analysis needs.

**Tidy layout.** The hours sheet is wide (a column per year); the analyst
reshapes it to long form (`branch`, `year`, `sat_hours`) so it can be joined
to visits.

**A first query:**

```sql
SELECT branch_id, visit_date, visitors
FROM visits
WHERE day_of_week IN ('Saturday', 'Sunday')
  AND visit_date BETWEEN '2024-09-01' AND '2026-03-31'
ORDER BY branch_id, visit_date
LIMIT 20;
```

The first 20 rows confirm the columns and dates look right before pulling
everything.

**Ethics.** The survey export includes patrons' email addresses. The analyst
removes them before analysis; they aren't needed to answer the question.

## Key terms

- **First-, second- and third-party data.**
- **Quantitative (discrete, continuous) and qualitative (nominal, ordinal);
  measurement scales; data types.**
- **Structured and unstructured data; tidy data; wide and long formats.**
- **Sampling, observer, interpretation and confirmation bias; credibility;
  open data.**
- **Fair information practices; consent; minimization; anonymization.**
- **Relational database; primary key; foreign key; metadata.**
- **SQL: SELECT, FROM, WHERE, ORDER BY, LIMIT, LIKE, IN, BETWEEN.**
- **Access control; version control; file naming.**

## Check yourself

1. Classify each column: branch name; number of visitors; satisfaction (1 to
   5); temperature at opening, °F.
2. A sheet has columns `Branch`, `Jan`, `Feb`, `Mar` with visits in each.
   Is it wide or long? What would its tidy form's columns be?
3. Name four of Broman and Woo's rules for spreadsheet data.
4. A manager expects Riverside's drop to be about parking and reads every
   ambiguous comment as parking-related. What bias is this?
5. What's the difference between a primary key and a foreign key?
6. Write a query returning all columns for Sundays at branch 3, newest first.
7. Why remove patrons' email addresses before analysis?

## Answers

1. Nominal (qualitative); discrete quantitative (ratio); ordinal; interval.
2. Wide. Tidy: `Branch`, `Month`, `Visits`, one row per branch per month.
3. Any four: be consistent; one thing per cell; one rectangle per sheet; no
   empty cells for known values; ISO dates (YYYY-MM-DD); no color as data;
   keep raw data untouched; write a data dictionary; make backups.
4. Confirmation bias (and interpretation bias).
5. A primary key uniquely identifies each row of its own table; a foreign key
   refers to the primary key of another table.
6. `SELECT * FROM visits WHERE branch_id = 3 AND day_of_week = 'Sunday'
   ORDER BY visit_date DESC;`
7. Data minimization and privacy: they aren't needed for the question, and
   holding them adds risk to patrons.

*Next: Chapter 4 checks and cleans the data.*
