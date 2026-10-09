# Foundations: data, analysis and the analyst's work

*Companion to Course 1, Foundations: Data, Data, Everywhere. No
prerequisites.*

## What you will be able to do

- Define data, data analysis and a data ecosystem, with examples.
- Describe analytical thinking and apply it to a question.
- Name the stages of the data life cycle and the phases of an analysis, and
  compare two process models.
- Say what spreadsheets, query languages, visualization tools and
  programming languages each do in an analyst's work.
- Describe the data analyst's role and what it means to be a fair one.

## Data, analysis and ecosystems

Start with a door. Each branch of Maple County Library has a counter on its
entrance that adds one every time someone walks in. At midnight it records
the day's total. That number, "Eastside, Saturday 14 March, 312," is a piece
of **data**: a recorded fact about the world. A year of those numbers, for
five branches, is a **data set**.

**Data analysis** is collecting, transforming and organizing data to
draw conclusions, make predictions and support decisions. The board's
question, "why did weekend visits fall?", is what turns the door counts from
a record into something to analyze.

A **data ecosystem** is everything involved in producing, managing, storing,
organizing, analyzing and sharing data: the door counters, the library's
checkout system, the county's database server, the spreadsheet a branch
manager keeps, and the people who use each. Analysts work inside an
ecosystem, and much of the job is knowing where the data you need lives and
how it got there.

People sometimes use **data analytics** for the whole field and **data
analysis** for the act of analyzing; this book follows that usage. **Data
science** overlaps with both but usually emphasizes building models and new
methods; a data analyst usually answers questions with data that exists.

## Analytical thinking

**Analytical thinking** is identifying and defining a problem, then solving
it with data in an organized, step-by-step way. It has recognizable habits:

- **Seeing it:** picturing the data, often as a chart or table.
- **Strategizing:** deciding what to do first, what data to use, and how to
  stay focused on the question.
- **Keeping the problem in view:** returning to what the board asked, not
  what's interesting.
- **Looking for connections:** noticing that two things move together, and
  then asking whether one causes the other.
- **Big picture and detail:** moving between the whole system's trend and one
  branch's Saturday.

A useful single technique is the **five whys**: ask why, and keep asking of
each answer, until you reach something you can act on. "Weekend visits fell."
Why? "Saturday visits fell; Sundays were flat." Why? "Concentrated at two
branches." Why? That's where data comes in.

## The data life cycle and the analysis process

Data has a **life cycle** of its own, whatever anyone does with it:

1. **Plan:** decide what data is needed and how it will be managed.
2. **Capture:** collect or bring it in.
3. **Manage:** store, maintain and protect it.
4. **Analyze:** use it to answer questions.
5. **Archive:** keep it, out of active use, for as long as it may matter.
6. **Destroy:** remove it securely when it's no longer needed or allowed.

An **analysis** has its own process. Google's certificate organizes the work
into six phases, and so do courses 2 to 6:

1. **Ask:** define the problem and what success looks like.
2. **Prepare:** find and collect the data, and judge whether it's fit.
3. **Process:** clean and check it.
4. **Analyze:** organize, transform and calculate to find the answer.
5. **Share:** present the findings so people can act.
6. **Act:** the decision-makers use the findings.

It's one model among others. The Cross-Industry Standard Process for Data
Mining (CRISP-DM), published in 2000 by a consortium of companies, also has
six phases: business understanding, data understanding, data preparation,
modeling, evaluation and deployment [@chapman2000]. The two line up closely.
Both start from the business question, both spend much of their effort
preparing data, and both are loops: what you learn in analysis often sends
you back to ask a better question. John Tukey, who named **exploratory data
analysis** in 1977, argued that the first job with any data is to look at it
openly, before testing any idea about it [@tukey1977].

## The analyst's tools

Four kinds of tool carry most of the work:

- **Spreadsheets** (Google Sheets, Microsoft Excel) hold data in rows and
  columns and calculate with formulas. They're fast to start with and
  anyone can open them, and they're error-prone at scale: studies of
  real-world spreadsheets have found errors in a large share of them
  [@panko1998].
- **Query languages**, above all **SQL** (Structured Query Language),
  retrieve and combine data from databases. They handle millions of rows and
  record exactly what was done.
- **Visualization tools** such as Tableau turn data into charts and
  interactive dashboards.
- **Programming languages** such as Python combine all three and make an
  analysis repeatable from start to finish.

A working analyst uses all four and picks by the job: a spreadsheet for a
quick look at a small table, SQL to pull and join from the database, Python
for anything that must be repeated, Tableau to share.

## The analyst's role and fairness

A data analyst turns questions into answers with data, and answers into
something people can act on. The job appears in every industry: in a
hospital, a school district, a retailer, a transit agency, a library. The
titles vary (data analyst, business analyst, operations analyst, reporting
analyst), but the six phases are the same.

**Fairness** means an analysis doesn't create or reinforce bias against
people. It starts with asking who's in the data and who isn't, whether the
way data was collected treats groups differently, and how a conclusion might
affect each group. At Maple County, a survey collected only inside branches
can't speak for people who stopped coming, who may be exactly the people the
board most needs to hear from. A fair analyst says so, and looks for the
missing voices.

## Worked example: framing Maple County's question

**Data and ecosystem.** Door counts (daily, by branch) live in the facilities
system; checkouts in the library's catalog system; opening hours in a
spreadsheet the operations manager keeps; the patron survey in a survey
tool's export. Four sources, four owners.

**Analytical thinking.** The five whys so far: visits fell → on Saturdays →
concentrated at two branches → ? The next why needs the hours spreadsheet.

**Tools.** A spreadsheet to look at the hours list (five rows). SQL to pull a
year of daily counts (about 1,800 rows) and join them to the hours. Tableau
to show the board. Python if the library wants the same report every month.

**Process.** Ask: what does the board need to decide? (Next year's weekend
hours.) Prepare: collect the four sources. Process: check the door counts for
days a counter broke. Analyze: compare Saturday visits before and after any
change in hours. Share: one chart and a short recommendation. Act: the board
sets hours.

**Fairness.** The survey sample is people who still visit. The analyst plans
to add a short mailed survey of card holders who haven't visited this year.

## Key terms

- **Data; data set; data analysis; data analytics; data ecosystem.**
- **Analytical thinking; five whys.**
- **Data life cycle:** plan, capture, manage, analyze, archive, destroy.
- **Analysis process:** ask, prepare, process, analyze, share, act.
- **CRISP-DM; exploratory data analysis.**
- **Spreadsheet; SQL; visualization tool; programming language.**
- **Fairness.**

## Check yourself

1. What makes "Eastside, Saturday 14 March, 312" data, and what makes a year
   of such records something to analyze?
2. Name the six phases of the analysis process in order.
3. Name the six stages of the data life cycle. Which one is most often
   forgotten?
4. Which CRISP-DM phase corresponds most closely to "process"?
5. You need to combine a year of daily visits with each branch's hours and
   repeat the report monthly. Which tools fit, and why?
6. Why might a survey handed out inside branches give an unfair picture of
   why visits fell?
7. What did Tukey argue is the first thing to do with a new data set?

## Answers

1. It's a recorded fact about the world. A question (why did visits fall?)
   makes the collection something to analyze.
2. Ask, prepare, process, analyze, share, act.
3. Plan, capture, manage, analyze, archive, destroy. Destroy is often
   forgotten: data kept past its purpose is a privacy and security risk.
4. Data preparation.
5. SQL to pull and join the data from the database, and Python (or a
   scheduled SQL query) to repeat it monthly; a spreadsheet is fine for a
   one-off look at a small table.
6. It reaches only people who still visit, and misses those who stopped, who
   may be the ones whose reasons matter most.
7. To look at it openly, exploring before testing any particular idea
   (exploratory data analysis).

*Next: Chapter 2 turns the board's worry into a question the data can answer.*
