# Analyze: organizing, combining, aggregating and calculating

*Companion to Course 5, Analyze Data to Answer Questions. Before you start:
Chapter 4's clean data.*

## What you will be able to do

- Sort and filter data in a spreadsheet and in SQL.
- Convert and format values, including dates and text.
- Combine tables with SQL joins and spreadsheet lookups.
- Aggregate with GROUP BY, conditional functions and pivot tables.
- Calculate with formulas, subqueries and temporary tables.
- Summarize with descriptive statistics, and avoid reading correlation as
  cause or trusting an aggregate that hides its groups.

## Sorting and filtering

**Sorting** puts rows in order; **filtering** shows only rows that meet a
condition. In a spreadsheet, sort the whole table, never one column, or rows
come apart. In SQL, `ORDER BY` sorts and `WHERE` filters:

```sql
SELECT branch_id, visit_date, visitors
FROM visits
WHERE day_of_week = 'Saturday' AND visitors IS NOT NULL
ORDER BY visitors DESC;
```

Test for a missing value with `IS NULL` or `IS NOT NULL`; `= NULL` never
matches anything.

## Converting and formatting

Data often arrives in the wrong type or shape:

- **Numbers stored as text** won't sum. In SQL, `CAST(visitors AS INTEGER)`;
  in a spreadsheet, `=VALUE(A2)`.
- **Dates** in mixed formats: convert to one date type (`CAST(... AS DATE)`)
  and display as YYYY-MM-DD. Extract parts with `EXTRACT(YEAR FROM
  visit_date)` or the spreadsheet's `=YEAR(A2)`, `=WEEKDAY(A2)`. Date
  functions are where SQL dialects differ most: `EXTRACT` works in BigQuery,
  PostgreSQL and MySQL, while SQLite uses `strftime('%Y', visit_date)` and has
  no date type to cast to.
- **Text** joined or split: `CONCAT(first, ' ', last)` or `=A2&" "&B2`;
  `=LEFT()`, `=RIGHT()`, `=MID()`, `=LEN()`.

**Formatting** (currency, percentages, decimals) changes how a value looks,
not the value. Keep calculation columns unformatted until the end.

## Combining tables

The question needs visits *and* hours, which live in different tables. A
**join** combines rows from two tables on a shared key:

- **INNER JOIN:** only rows with a match in both tables.
- **LEFT JOIN:** every row from the left table, with matching right-table
  values or `NULL` where none match.
- **RIGHT JOIN:** the reverse.
- **FULL OUTER JOIN:** every row from both, matched where possible.

```sql
SELECT b.name, v.visit_date, v.visitors, h.sat_hours
FROM visits AS v
INNER JOIN branches AS b ON v.branch_id = b.branch_id
LEFT JOIN hours AS h
  ON v.branch_id = h.branch_id
 AND EXTRACT(YEAR FROM v.visit_date) = h.year;
```

The aliases (`v`, `b`, `h`) keep column names unambiguous. This join matches
hours by calendar year; the worked example below labels September-to-March
seasons first, because that's how the question is framed. A LEFT JOIN to
`hours` keeps visits even for a year the hours sheet doesn't cover, which then
show up as `NULL` hours for you to investigate.

In a spreadsheet, a **lookup** does a simple join, one column at a time:

- `=VLOOKUP(A2, Hours!$A$2:$C$6, 3, FALSE)` finds A2 in the first column of
  the range and returns the third column. `FALSE` demands an exact match;
  forgetting it is a classic error.
- `=XLOOKUP(A2, Hours!$A$2:$A$6, Hours!$C$2:$C$6)` does the same with
  separate lookup and return ranges, can look left, and returns an error you
  can see when nothing matches.

## Aggregating

**Aggregation** collapses many rows into summaries. In SQL, aggregate
functions (`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`) with `GROUP BY`:

```sql
SELECT branch_id,
       COUNT(*) AS days,
       SUM(visitors) AS total,
       AVG(visitors) AS mean_per_day
FROM visits
WHERE day_of_week = 'Saturday'
GROUP BY branch_id
HAVING SUM(visitors) > 1000;
```

`WHERE` filters rows before grouping; `HAVING` filters groups after. Note that
`COUNT(*)` counts rows and `COUNT(visitors)` counts non-null values, so the two
differ exactly by the unknown days.

In a spreadsheet: `=SUMIF(range, criterion, sum_range)`, `=COUNTIF()`,
`=AVERAGEIF()`, and their multi-condition forms `=SUMIFS()` and so on. A
**pivot table** groups and summarizes without formulas: choose the rows (such
as branch), the columns (such as year), the values (such as the sum of
visitors), and filters.

## Calculating with subqueries and temporary tables

Complex questions are easier in steps. A **subquery** is a query inside
another:

```sql
SELECT branch_id, visitors
FROM visits
WHERE visitors > (SELECT AVG(visitors) FROM visits);
```

A **common table expression** (`WITH`) or a **temporary table** (`CREATE
TEMP TABLE`) names an intermediate result so later steps can use it, and makes
the query readable from top to bottom.

## Describing what you found

Summaries of the clean data: **center** (mean, median) and **spread**
(range, standard deviation, interquartile range). Prefer the median when a
few extreme days (the book sale) would pull the mean. A **percent change** is
(new − old) / old.

Two traps stand between a summary and a conclusion:

- **Correlation isn't causation.** That visits fell where hours were cut
  shows the two go together. It doesn't prove the cut caused the fall;
  something else (road works outside both branches) could. Check for
  alternatives before claiming cause.
- **Aggregates can hide their groups.** In 1951 E. H. Simpson described how
  a relationship seen within every group can reverse when the groups are
  pooled [@simpson1951]. Always break a total down by its groups (branch, day,
  patron type) before trusting it.

## Worked example: where the visits went

A common table expression labels each Saturday by season and totals by branch:

```sql
WITH sat AS (
  SELECT branch_id, visitors,
         CASE
           WHEN visit_date BETWEEN '2024-09-01' AND '2025-03-31'
             THEN '2024-25'
           WHEN visit_date BETWEEN '2025-09-01' AND '2026-03-31'
             THEN '2025-26'
         END AS season
  FROM visits
  WHERE day_of_week = 'Saturday'
)
SELECT b.name, s.season, SUM(s.visitors) AS sat_visits
FROM sat AS s
JOIN branches AS b ON s.branch_id = b.branch_id
WHERE s.season IS NOT NULL
GROUP BY b.name, s.season
ORDER BY b.name, s.season;
```

The result, pivoted with a percent change added:

| Branch | Saturday hours cut? | 2024–25 | 2025–26 | Change |
|---|---|---|---|---|
| Central | No | 9,800 | 9,650 | −1.5% |
| Eastside | Yes, 8 to 5 | 5,410 | 3,902 | −27.9% |
| Northfield | No | 6,200 | 6,080 | −1.9% |
| Riverside | Yes, 8 to 5 | 4,900 | 3,700 | −24.5% |
| Westgate | No | 3,100 | 3,050 | −1.6% |
| **System** | | **29,410** | **26,382** | **−10.3%** |

The system lost 3,028 Saturday visits; the two branches that cut hours lost
1,508 + 1,200 = 2,708 of them, about 89 percent. The other three changed by
less than 2 percent each.

Visits per open hour tell a second story. Over about 30 Saturdays, Eastside
went from 5,410 / (30 × 8) ≈ 22.5 visitors an hour to 3,902 / (30 × 5) ≈ 26.0.
The hours that remained got busier, but not enough to make up the lost
morning.

The link between the cut and the drop is strong and specific, but it's a
correlation. The analyst checks alternatives: road works (none at either
branch), staff changes (none), and whether Sunday visits rose to compensate
(they didn't, by the same query with `'Sunday'`). The survey (Chapter 6)
adds patrons' own reasons.

## Key terms

- **Sort; filter; IS NULL.**
- **CAST; VALUE; EXTRACT; CONCAT; formatting.**
- **INNER, LEFT, RIGHT and FULL OUTER JOIN; alias; VLOOKUP; XLOOKUP.**
- **Aggregate function; GROUP BY; HAVING; SUMIF, COUNTIF, AVERAGEIF; pivot
  table.**
- **Subquery; common table expression; temporary table.**
- **Percent change; correlation versus causation; Simpson's paradox.**

## Check yourself

1. What's the difference between `WHERE` and `HAVING`?
2. You want every branch listed, including one with no visits recorded yet.
   Which join from `branches` to `visits`?
3. Write a `VLOOKUP` that finds A2 in `Hours!A2:C6` and returns the second
   column, exact match only.
4. Why might `COUNT(*)` and `COUNT(visitors)` return different numbers?
5. Saturday visits rose from 3,050 to 3,660. What's the percent change?
6. Visits fell at the two branches that cut hours. Name one alternative
   explanation you would check before saying the cut caused it.
7. What does a pivot table need you to choose?

## Answers

1. `WHERE` filters rows before grouping; `HAVING` filters groups after
   aggregation.
2. `branches LEFT JOIN visits`, so branches without matching visits still
   appear, with `NULL` visit values.
3. `=VLOOKUP(A2, Hours!$A$2:$C$6, 2, FALSE)`.
4. `COUNT(*)` counts every row; `COUNT(visitors)` skips rows where visitors
   is `NULL`.
5. (3,660 − 3,050) / 3,050 = 0.2, a 20 percent increase.
6. For example: construction or closures near those branches, a change in
   staffing or programs, a competing event, or visitors shifting to Sundays.
7. Which field goes in rows, which (if any) in columns, which values to
   summarize and how (sum, count, average), and any filters.

*Next: Chapter 6 shares the finding.*
