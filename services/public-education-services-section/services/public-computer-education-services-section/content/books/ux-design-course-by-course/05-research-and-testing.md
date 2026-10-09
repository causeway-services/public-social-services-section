# Research and testing: usability studies and insights

*Companion to Course 4, Conduct UX Research and Test Early Concepts. Before
you start: Chapter 4's low-fidelity prototype.*

## What you will be able to do

- Write a research plan with goals, questions, measures, method,
  participants and a script.
- Respect participants' privacy and consent.
- Run moderated and unmoderated usability studies, decide how many people to
  test, and take useful notes.
- Reduce bias in research and recruit inclusively.
- Synthesize observations with an affinity diagram into themes and insights.
- Present insights and iterate on a design.

## Planning a study

Research answers questions the team can't answer by opinion. A **research
plan** keeps a study focused and lets others check it. It sets out:

1. **Background:** why the study is happening now.
2. **Goals:** what the team wants to learn.
3. **Research questions:** specific questions the study will answer.
4. **Key performance indicators (KPIs):** the measures that will answer them.
5. **Method:** how the study runs.
6. **Participants:** who takes part and how they're recruited.
7. **Script:** the introduction, tasks and follow-up questions, word for word.

Methods differ along a few lines. **Primary** research you conduct yourself;
**secondary** research uses others' findings. **Qualitative** research
explores why (interviews, observation); **quantitative** research measures
how many or how much (surveys, analytics). **Behavioral** methods watch what
people do; **attitudinal** methods ask what they think.

Common usability KPIs:

- **Task success rate:** the share of participants who complete a task.
- **Time on task.**
- **Error rate:** mistakes per task.
- **System Usability Scale (SUS):** John Brooke's ten-item questionnaire,
  scored 0 to 100 [@brooke1996].

## Consent and privacy

Participants are people, not data sources. Get **informed consent**: explain
what the study involves, how recordings and notes will be used and stored,
that taking part is voluntary, and that they can stop at any time. Collect
only what you need, store it securely, remove names from notes and clips, and
delete recordings when the project no longer needs them.

## Usability studies

A **usability study** asks people to try realistic tasks with a design while
the team observes, to find where it helps and where it fails.

- In a **moderated** study, a facilitator guides the participant, in person
  or remotely, and can ask follow-up questions. Richer, slower.
- In an **unmoderated** study, participants complete tasks alone, usually
  through an online tool that records them. Faster and cheaper, with no
  chance to ask why.

Participants are often asked to **think aloud**, saying what they're
thinking as they work. Tasks should be realistic and not reveal the answer:
"You want to start a tiling project on Saturday. Use the app to make sure you
have what you need," not "Click Reserve."

**How many participants?** Jakob Nielsen and Thomas Landauer modeled how
many problems a test finds as more people take part. In their data each user
found about 31 percent of the problems, so five users found about 85 percent,
and they recommended a series of small rounds over one large one
[@nielsen-landauer1993]. Laura Faulkner tested that with 60 users on one
system: random groups of five found anywhere from 55 to 99 percent of the
problems, 85 on average, while groups of ten never found less than 80
[@faulkner2003]. Both findings stand. Five people per round, per distinct
group of users, is a sound habit for iterative, qualitative testing. It isn't
a guarantee for any single round, it doesn't cover more than one user group at
once, and it's too few for measuring quantities like success rates with any
precision.

**Notes.** Record **observations** (what happened: "paused 10 seconds on the
time picker; said 'which one is Saturday?'"), separately from
**interpretations** ("the date format is unclear"). One sticky note or row per
observation, tagged by participant.

## Bias in research

Bias can enter at every step:

- **Confirmation bias:** noticing what supports what you already believe.
- **Leading questions and tasks:** wording that suggests an answer.
- **Social desirability:** participants saying what they think you want to
  hear. Reassure them that you're testing the design, not them.
- **Primacy and recency:** remembering the first and last sessions best.
  Record everything.
- **Sampling bias:** testing only easy-to-reach people.

**Inclusive recruitment** counters the last: include people with
disabilities, older and younger users, speakers of other languages, and
people with little experience of technology, because they meet barriers
others never see.

## From observations to insights

An **affinity diagram** groups observations by similarity to reveal themes.
Hugh Beyer and Karen Holtzblatt made it a core step of contextual design
[@beyer-holtzblatt1998]. Put every observation on a note, group notes that
belong together without deciding the categories in advance, then name each
group. The names are **themes**.

An **insight** states what a theme means for the design, and why:

> *Users* *do or need something* because *reason*.

"Members misread the time picker because it lists dates without weekday
names."

Prioritize insights by how many participants they affected and how badly
(could they finish the task at all?).

## Sharing insights and iterating

Present insights so people act on them: lead with the most important; show
evidence (a short anonymized clip or quote); state the recommended change;
keep it short. Tailor the depth to the audience: designers want detail,
leaders want the decision and its impact.

Then **iterate**: change the design, and test again. Iteration is the design
process working as intended.

## Worked example: testing the tool library prototype

**Research plan.** Goal: learn whether members can find and hold a tool
without help. Questions: Can members tell whether a tool is available? Can
they place a hold for a time they choose? KPIs: task success rate, time on
task, SUS. Method: moderated remote usability study, think-aloud, 30 minutes.
Participants: five members, including one screen-reader user and one Spanish
speaker. Script: introduction, consent, three tasks, SUS, closing questions.

**Results.** Task "hold a tile saw for Saturday": 3 of 5 succeeded (60
percent). Two chose the wrong day. One participant's SUS answers were 4, 2, 5,
1, 4, 2, 5, 2, 4, 1. SUS scoring subtracts 1 from each odd-numbered answer and
subtracts each even-numbered answer from 5, then multiplies the sum by 2.5:
odd items give 3 + 4 + 3 + 4 + 3 = 17, even items give 3 + 4 + 3 + 3 + 4 =
17, and (17 + 17) × 2.5 = 85.

**Affinity diagram.** Themes: *dates are confusing*; *availability label is
clear*; *screen reader skips the hold button's label*.

**Insights.**

1. Members pick the wrong day because the time picker lists dates without
   weekday names. (Two of five; task failed.)
2. The screen reader announces the hold button as "button" because it has no
   text label. (One of one screen-reader user; task failed.)

**Iteration.** The picker now shows "Sat 14 Mar"; the button gets the label
"Hold this tool." The next round tests with five new members.

## Key terms

- **Research plan: background, goals, questions, KPIs, method, participants,
  script.**
- **Primary and secondary; qualitative and quantitative; behavioral and
  attitudinal research.**
- **Task success rate; time on task; error rate; System Usability Scale.**
- **Informed consent.**
- **Usability study: moderated, unmoderated; think-aloud.**
- **Observation versus interpretation.**
- **Confirmation bias; social desirability; primacy and recency; sampling
  bias; inclusive recruitment.**
- **Affinity diagram; theme; insight; iteration.**

## Check yourself

1. Name the seven parts of a research plan.
2. When would you choose an unmoderated study over a moderated one?
3. Rewrite the task "Click the Reserve button" so it doesn't reveal the
   answer.
4. What did Faulkner's 60-user study add to the "five users" rule?
5. Classify: "Participant 3 said 'where's Saturday?'" Observation or
   interpretation?
6. A participant answers all ten SUS items with 3. What's their score?
7. What's the difference between a theme and an insight?
8. What must a participant be told before a study begins?
9. Which bias does "we're testing the design, not you" counter, and why
   recruit people with disabilities?
10. How should insights be ordered when presented to leaders?

## Answers

1. Background, goals, research questions, KPIs, method, participants,
   script.
2. When you need results quickly or cheaply from more people and don't need
   to ask follow-up questions.
3. For example: "You want to use a pressure washer this weekend. Use the app
   to make sure one will be there for you."
4. That any single group of five can find far fewer problems than average
   (as few as 55 percent), so five per round works for iterative testing,
   not as a guarantee.
5. Observation.
6. Odd items: 5 × (3 − 1) = 10. Even items: 5 × (5 − 3) = 10. (10 + 10) × 2.5 =
   50.
7. A theme names a group of related observations; an insight says what it
   means for the design and why.
8. What the study involves, how recordings and notes will be used and stored,
   that taking part is voluntary, and that they can stop at any time.
9. Social desirability bias. People with disabilities meet barriers others
   don't, so including them surfaces problems a study would otherwise miss.
10. Most important first, with evidence and the recommended change, kept
    short.

*Next: Chapter 6 turns the design into high-fidelity mockups.*
