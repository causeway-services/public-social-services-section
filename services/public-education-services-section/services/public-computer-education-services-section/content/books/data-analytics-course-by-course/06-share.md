# Share: visualizations, dashboards and data stories

*Companion to Course 6, Share Data Through the Art of Visualization. Before
you start: Chapter 5's finding.*

## What you will be able to do

- Choose a chart for what you need to show, using what's known about how
  accurately people read visual encodings.
- Design a chart that's honest, uncluttered and accessible.
- Describe how Tableau builds a view from dimensions and measures, and how it
  combines views into dashboards and stories.
- Structure a data story and a presentation around one message, including
  its limitations and the questions it will raise.

## Why show data

In 1973 F. J. Anscombe published four small data sets with the same means,
variances, correlation and fitted line; plotted, one is a straight line, one a
curve, one a line with an outlier and one a single distant point with a
vertical stack [@anscombe1973]. Summaries hide what a plot shows. A good
visualization lets its audience see a pattern, and a comparison, faster and
more reliably than a table.

## Choosing a chart

William Cleveland and Robert McGill tested how accurately people judge
quantities from different visual encodings. People were most accurate reading
**position along a common scale**, then position on unaligned scales, then
**length**, then **angle** and slope, and least accurate with **area**,
volume and **color** intensity [@cleveland-mcgill1984]. That's why bar and
dot charts, which use position and length, usually beat pie charts, which use
angle and area.

| To show | Use |
|---|---|
| Change over time | Line chart |
| Comparison across categories | Bar chart (horizontal if labels are long), sorted |
| Parts of a whole, few parts | Stacked bar; a pie only for two or three parts |
| Relationship between two measures | Scatter plot |
| Distribution of one measure | Histogram or box plot |
| Values by place | Map, but only if location matters |
| Exact values people must look up | Table |

## Honest, clear design

Edward Tufte's rule is to spend the ink on data: remove gridlines, borders,
shading and decoration that carry no information ("chartjunk"), and show the
data plainly [@tufte2001]. Some rules that keep a chart honest:

- **Bar charts start at zero.** A bar's length is its value; a cut-off axis
  exaggerates differences. Line charts may zoom to the data's range, labeled.
- **One message per chart,** stated in the title: "Saturday visits fell where
  hours were cut," not "Saturday visits by branch."
- **Label directly** instead of relying on a legend where possible.
- **Avoid 3D and dual axes,** which distort and confuse.
- **Use color to highlight,** one accent against gray, rather than to
  decorate.

## Accessible design

A chart must work for people with low vision, color blindness, or a screen
reader. The Web Content Accessibility Guidelines give concrete tests
[@wcag21]:

- **Don't use color as the only way** to convey information (WCAG success
  criterion 1.4.1): add labels, patterns or position.
- **Contrast:** text at least 4.5 to 1 against its background (1.4.3), and
  the graphical parts needed to understand a chart at least 3 to 1 (1.4.11).
- **Text alternatives:** give every chart **alt text** that states its
  message and main numbers (1.1.1).

Choose palettes that stay distinct for common forms of color blindness,
such as blue and orange rather than red and green.

## Tableau in brief

Tableau builds charts by dragging fields onto a view:

- **Dimensions** are categories (branch, season); **measures** are numbers
  Tableau aggregates (sum of visitors). Discrete fields appear as blue pills,
  continuous ones as green.
- **Rows and Columns** shelves set the chart's axes; the **Marks** card sets
  color, size, label, detail and tooltip; **Filters** limit the data.
- **Calculated fields** create new measures, such as percent change.
- A **dashboard** combines multiple views on one screen, with filters that act
  on all of them; a **story** sequences views or dashboards into a narrative.

Tableau Public, the free version, publishes work openly on the web, so never
publish data about identifiable people with it.

## Data stories, dashboards and presentations

A **data story** carries an audience from a question to a decision. Know
your audience and what they must decide. Choose one message. Build toward it:
the context (what the board asked), the finding (where the visits went), and
the implication (what it means for next year's hours). Show only the charts
that advance it.

A **dashboard** is for monitoring, not persuading. Stephen Few's guidance is
that a dashboard fits on one screen and shows, at a glance, the few measures
someone needs to watch, with the most important in the top left
[@few2006].

A **presentation** puts the story in front of people:

- State the conclusion in each slide's title.
- One idea per slide; the chart as the slide's main content.
- Say what the data can't show (**limitations**): the unknown days, the
  survey's margin of error, that the link is a correlation.
- Anticipate questions ("Did Sundays make up for it?") and have the answer
  ready.
- End with the decision it supports and a recommendation.

## Worked example: telling the board

**The main chart:** a horizontal bar chart of percent change in Saturday
visits by branch, sorted from largest fall, starting at zero. Eastside
(−27.9%) and Riverside (−24.5%) in the accent color; the other three in gray;
each bar labeled with its value. Title: "Saturday visits fell where hours were
cut." Subtitle: "Change in Saturday visits, Sep–Mar 2025–26 against a year
earlier."

**Alt text:** "Bar chart. Saturday visits fell 27.9 percent at Eastside and
24.5 percent at Riverside, the two branches whose Saturday hours were cut
from 8 to 5. The other three branches changed by less than 2 percent."

**The survey, carefully.** Of 96 respondents who use Eastside or Riverside, 58
(60 percent) named Saturday morning hours as a reason they visit less. With so
few respondents, the margin is about ±10 points, and respondents are people
who still visit. The slide says both.

**The story in five slides:**

1. The question: why did weekend visits fall 10 percent?
2. Saturday visits fell where hours were cut (the chart).
3. The remaining hours got busier, but not enough (visitors per open hour).
4. What patrons say, and what the survey can't tell us.
5. Recommendation: restore Saturday mornings at Eastside and Riverside and
   measure the next three months; limitations and next steps.

**A dashboard for branch managers:** weekly visits by day, this year against
last, one line chart per branch, filterable by branch, updated from the
database each Monday.

## Key terms

- **Anscombe's quartet.**
- **Visual encodings: position, length, angle, area, color.**
- **Line, bar, stacked bar, scatter plot, histogram, box plot, map, table.**
- **Data-ink; chartjunk; zero baseline.**
- **Accessibility: color not alone, contrast ratios, alt text.**
- **Tableau: dimension, measure, marks, filter, calculated field, dashboard,
  story.**
- **Data story; dashboard; limitations.**

## Check yourself

1. According to Cleveland and McGill, which encoding do people read most
   accurately?
2. Which chart for: (a) monthly visits over three years; (b) visits by
   branch this year; (c) the relationship between open hours and visits
   across 40 branch-weeks?
3. A bar chart's axis starts at 3,000 instead of zero. What's the problem?
4. Give two WCAG requirements that apply to a chart.
5. In Tableau, is "branch" a dimension or a measure? "Sum of visitors"?
6. Rewrite the chart title "Visits by branch" to state a message.
7. What's the difference between a dashboard and a data story?

## Answers

1. Position along a common scale.
2. (a) A line chart; (b) a sorted bar chart; (c) a scatter plot.
3. It exaggerates differences, because bar length no longer represents the
   value.
4. Any two: don't rely on color alone; contrast of at least 4.5:1 for text
   and 3:1 for graphical parts; alt text for the chart.
5. Branch is a dimension; sum of visitors is a measure.
6. For example: "Visits fell most at the branches that cut Saturday hours."
7. A dashboard lets people monitor current measures at a glance; a data
   story leads an audience through a finding to a decision.

*Next: Chapter 7 repeats the analysis in Python.*
