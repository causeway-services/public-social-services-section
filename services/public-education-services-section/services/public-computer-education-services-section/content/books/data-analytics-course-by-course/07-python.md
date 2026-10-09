# Python: the analysis as a program

*Companion to Course 7, Introduction to Data Analysis Using Python. Before
you start: Chapters 4 and 5, whose cleaning and analysis this chapter
repeats in code.*

## What you will be able to do

- Explain what Python adds to an analyst's work, and run code in a Jupyter
  notebook.
- Use variables and the basic data types, and write functions with
  conditional logic.
- Repeat work with `for` and `while` loops, and clean text with string
  methods.
- Choose among lists, tuples, dictionaries, sets and NumPy arrays.
- Load, inspect, clean, filter, group, merge and bin data with pandas.

## Why Python

A spreadsheet analysis lives in clicks; a SQL analysis lives in a database.
A Python **script** or **notebook** holds the whole analysis, from loading raw
files to the final table, as text anyone can read, rerun and check. When the
board asks for the same report next month, you run it again.

A **Jupyter notebook** mixes **code cells**, which run and show their output
below, and **text cells** for explanation. Run cells in order from the top;
a notebook whose cells were run out of order can show results its code
doesn't produce. Before sharing, restart and run everything.

## Variables, types and functions

A **variable** names a value. Python works out its **type** from the value:

```python
branch = "Eastside"      # str (text)
visitors = 312           # int (whole number)
hours_open = 5.0         # float (decimal number)
is_open = True           # bool (True or False)

print(f"{branch}: {visitors / hours_open:.1f} visitors per hour")
# Eastside: 62.4 visitors per hour
```

The `f"..."` string (an **f-string**) inserts values into text; `:.1f` formats
a number with one decimal place.

A **function** packages steps under a name. **Conditional statements** choose
between paths with `if`, `elif` ("else if") and `else`; indentation marks what
belongs to each:

```python
def per_hour(visitors, hours):
    """Visitors per open hour, or None if the branch was closed."""
    if hours == 0:
        return None
    return visitors / hours

def busyness(visitors):
    if visitors >= 300:
        return "busy"
    elif visitors >= 150:
        return "steady"
    else:
        return "quiet"

per_hour(312, 5)    # 62.4
busyness(120)       # 'quiet'
```

Comparison operators are `==`, `!=`, `<`, `<=`, `>`, `>=`; combine conditions
with `and`, `or` and `not`. Clean code gives functions clear names, one job
each, and a **docstring** saying what they return.

## Loops and strings

A `for` loop repeats for each item in a collection; a `while` loop repeats as
long as a condition holds:

```python
daily = [312, 280, 0, 295]
total = 0
for count in daily:
    total += count        # total is now 887

week = 1
while week <= 3:
    print("week", week)
    week += 1
```

Strings have methods for cleaning, the same jobs as `TRIM` and `UPPER` in
Chapter 4. **Indexing** picks characters by position, starting at 0, and
**slicing** takes a range:

```python
name = "  east side  "
clean = name.strip().upper().replace("EAST SIDE", "EASTSIDE")
clean        # 'EASTSIDE'
clean[:4]    # 'EAST'  (positions 0 to 3)
len(clean)   # 8
```

## Data structures

| Structure | Written | Use |
|---|---|---|
| **List** | `["Central", "Eastside"]` | An ordered collection you can change |
| **Tuple** | `("09:00", "17:00")` | An ordered collection that shouldn't change |
| **Dictionary** | `{"Central": 8, "Eastside": 5}` | Look up a value by a key |
| **Set** | `{"EASTSIDE", "CENTRAL"}` | Unique items; duplicates vanish |
| **NumPy array** | `np.array([312, 280, 295])` | Numbers you calculate with all at once |

**NumPy** stores numbers in arrays and applies an operation to every element
at once (**vectorization**), which is both shorter and much faster than a
loop [@harris2020]:

```python
import numpy as np
counts = np.array([312, 280, 295, 301])
counts.mean()             # 297.0
counts * 2                # array([624, 560, 590, 602])
counts[counts > 290]      # array([312, 295, 301])  (Boolean masking)
```

## pandas: tables in Python

**pandas** adds the **DataFrame**, a table with named columns, and the
**Series**, a single column. Wes McKinney, who created pandas, describes it in
*Python for Data Analysis* [@mckinney2022]. The Maple County analysis from
Chapters 4 and 5, in pandas:

```python
import pandas as pd

# Load and inspect
visits = pd.read_csv("visits.csv", parse_dates=["visit_date"])
visits.head()        # first five rows
visits.info()        # columns, types, non-null counts
visits.describe()    # count, mean, std, quartiles for numeric columns

# Clean
visits["branch"] = visits["branch"].str.strip().str.upper()
visits = visits.drop_duplicates()
visits["visitors"].isna().sum()   # how many days are unknown
```

`isna()` finds missing values, which pandas shows as `NaN`. Leave them
missing: `sum()` and `mean()` skip them by default, which is what an unknown
day should do. Filling them with 0 (`fillna(0)`) would turn "unknown" into
"nobody came." (A column with missing values is stored as floats, so counts
show as 312.0.)

**Filtering** uses a Boolean mask, as in NumPy:

```python
saturdays = visits[visits["visit_date"].dt.day_name() == "Saturday"]
```

**Labeling, grouping and aggregating**, like the SQL `CASE` and `GROUP BY`:

```python
dates = saturdays["visit_date"]
season = pd.Series(pd.NA, index=saturdays.index, dtype="object")
season[dates.between("2024-09-01", "2025-03-31")] = "2024-25"
season[dates.between("2025-09-01", "2026-03-31")] = "2025-26"
saturdays = saturdays.assign(season=season).dropna(subset=["season"])

by_season = saturdays.groupby(["branch", "season"])["visitors"]
totals = by_season.sum().unstack()
old, new = totals["2024-25"], totals["2025-26"]
totals["change"] = (new - old) / old
```

`unstack()` turns the inner group (season) into columns: the pivot table of
Chapter 5.

**Merging**, like a SQL join:

```python
hours = pd.read_csv("hours.csv")
report = totals.reset_index().merge(hours, on="branch", how="left")
```

`how="left"` keeps every branch in `totals` even if `hours` lacks it, as a
LEFT JOIN does.

**Binning** sorts numbers into labeled ranges:

```python
saturdays = saturdays.assign(
    level=pd.cut(saturdays["visitors"], bins=[0, 150, 300, 1000],
                 labels=["quiet", "steady", "busy"], include_lowest=True)
)
saturdays["level"].value_counts()
```

`pd.cut` makes each bin include its right edge, so 150 is "quiet" and 151 is
"steady." It excludes the first bin's left edge unless you pass
`include_lowest=True`; without it, a day with 0 visitors would get no label at
all.

## Worked example: the monthly report as a script

The board wants the Saturday table every month. The analyst saves the pandas
steps above as one notebook, ending with:

```python
report["change"] = (report["change"] * 100).round(1)
report.sort_values("change").to_csv("saturday_report.csv", index=False)
```

Next month, the facilities export is replaced with the new one and the
notebook is rerun from the top: the same cleaning, the same `NaN` handling,
the same table. The changelog from Chapter 4 becomes the code itself: every
change the data went through is written in it.

## Key terms

- **Script; Jupyter notebook; code cell; text cell.**
- **Variable; str, int, float, bool; f-string.**
- **Function; docstring; if, elif, else; comparison and logical operators.**
- **for loop; while loop; string methods; indexing; slicing.**
- **List; tuple; dictionary; set; NumPy array; vectorization; Boolean
  mask.**
- **pandas; DataFrame; Series; read_csv; head; info; describe; isna;
  drop_duplicates; groupby; unstack; merge; cut; NaN.**

## Check yourself

1. What type does Python give `hours_open = 5.0`? And `"5"`?
2. Write a function `is_weekend(day)` that returns `True` for "Saturday" or
   "Sunday" and `False` otherwise.
3. What does `"Riverside"[0:5]` return?
4. You need a lookup from branch name to its Saturday hours. Which data
   structure?
5. What does `np.array([2, 4, 6]) * 10` return?
6. Why shouldn't you run `visits["visitors"].fillna(0)` before computing
   averages?
7. Which pandas method corresponds to a SQL LEFT JOIN, and which argument
   makes it a left join?
8. With `bins=[0, 150, 300, 1000]`, which label does a count of exactly 300
   get?

## Answers

1. `float`; `str` (text, because of the quotes).
2. For example:

   ```python
   def is_weekend(day):
       return day in ("Saturday", "Sunday")
   ```
3. `'River'` (positions 0 to 4).
4. A dictionary, keyed by branch name.
5. `array([20, 40, 60])`.
6. It turns unknown days into days with zero visitors, which lowers averages
   and totals; leaving them as `NaN` keeps them out of the calculation.
7. `merge`, with `how="left"`.
8. "steady": each bin includes its right edge, so the second bin runs from
   just above 150 up to and including 300.

*Next: Chapter 8 brings the whole process together in a case study.*
