# Empathize and define: understanding users and their problems

*Companion to Course 2, Start the UX Design Process, first half. Before you
start: Chapter 1's design process.*

## What you will be able to do

- Interview users without leading them, and include people at the margins.
- Build an empathy map, a persona, user stories and a user journey map from
  research.
- Identify and categorize pain points.
- Write a problem statement, a hypothesis statement and a value proposition.
- Apply what psychology says about attention, choice and movement to a
  design.

## Learning from users

Empathy in UX means understanding users' needs, goals and feelings from their
point of view. It comes from research, not imagination. The most common
starting method is the **user interview**: a one-to-one conversation about a
person's experience.

Good interviews:

- Ask **open questions** ("Tell me about the last time you borrowed a tool"),
  not yes-or-no ones.
- Ask about **past behavior**, which people report reasonably well, rather
  than predictions ("Would you use an app?"), which they don't.
- Avoid **leading questions** ("Wouldn't it be easier to book online?").
- Follow up: "Why?" "What happened next?"
- Include people at the edges: members with disabilities, members without
  smartphones, members who speak another language at home. Designing for the
  people most likely to be excluded surfaces problems everyone has.

## Empathy maps and personas

An **empathy map** organizes what you learned about a user into four
quadrants: what they **say** (quotes), **think** (what they may not say),
**do** (actions observed), and **feel** (emotions). It's a quick way to make
a pile of notes into a picture of a person.

A **persona** is a fictional but research-based profile of a type of user:
their goals, needs, frustrations, context and relevant traits. Alan Cooper
popularized personas as a way to keep a team designing for specific people
instead of an "elastic user" who bends to fit whatever the team wants to build
[@cooper1999]. Personas should rest on research, focus on goals and behavior
rather than demographics, and avoid stereotypes. Most projects need two to
four.

## User stories and journey maps

A **user story** states one need from a persona's point of view:

> As a *type of user*, I want to *action* so that *benefit*.

"As a weekend renovator, I want to see which tools are in before I leave home
so that I don't make a wasted trip."

A **user journey map** follows a persona through a task, stage by stage. For
each stage it records the persona's **actions**, their **emotions**, the
**pain points** they hit, and **opportunities** for the design to help. A
journey map shows where in a process things go wrong, which a single
interview quote can't.

## Pain points

A **pain point** is any problem that frustrates a user or stops them. Pain
points show up in different places:

- **Financial:** costs too much, or hidden costs.
- **Product:** the thing itself fails or confuses.
- **Process:** the steps are slow, long or unclear.
- **Support:** help is hard to reach or unhelpful.

Accessibility barriers are pain points too, often the most severe, because
they can stop a person entirely.

## Defining the problem

The define stage turns research into a clear statement of what to solve.

A **problem statement** names the user, their need and the insight behind it:

> *User* needs *need* because *insight*.

"Weekend renovators need to know a tool's availability before they travel
because a wasted trip costs them half a day of a two-day project."

The d.school calls this a **point of view** [@dschool2010]. A good one is
specific to a user, states a need rather than a solution ("needs to know
availability," not "needs an app"), and carries an insight that explains why.

A **hypothesis statement** proposes how a design might solve it, as
something testable:

> If *we do this*, then *this outcome* will follow.

"If members can see live availability on their phones, then fewer will make
wasted trips."

A **value proposition** says why someone would use the product: the benefit
it delivers and why it's better than the alternatives. List what the product
does, and for each, what it gives the user.

## Psychology and human factors

**Human factors** is the study of how people's physical and mental
capabilities shape their use of products. A few findings every designer uses:

- **Mental models:** people predict how something works from their
  experience of similar things. Following conventions lets them reuse those
  models.
- **Cognitive load:** working memory is small. Every extra choice, field and
  instruction costs attention. Show only what the task needs.
- **Hick's law:** the time to choose grows with the number of options,
  roughly with the logarithm of their number [@hick1952]. Long menus slow
  people down; grouped and prioritized options help.
- **Fitts's law:** the time to reach a target grows with its distance and
  shrinks with its size [@fitts1954]. Make important buttons large and near
  where the hand or pointer already is.

## Worked example: empathy and definition at the tool library

**Interviews.** Eight members: three weekend renovators, two retirees, a
student, a member who uses a screen reader, and a member who speaks Spanish at
home. Open questions about their last borrowing.

**Empathy map (Dana, weekend renovator).** Says: "I called twice and the saw
was out both times." Thinks: this isn't worth the hassle. Does: calls on
Tuesday, drives over Saturday. Feels: frustrated, rushed.

**Persona.** *Dana, 34, the weekend renovator.* Goal: finish home projects
on weekends without buying tools used once. Frustrations: phone hours clash
with work; wasted trips. Context: plans on Friday nights, borrows on Saturday
mornings.

**User story.** "As a weekend renovator, I want to reserve a tool on Friday
night so that it's waiting when I arrive on Saturday."

**Journey map (borrowing a tile saw):**

| Stage | Action | Emotion | Pain point | Opportunity |
|---|---|---|---|---|
| Plan | Checks project needs | Hopeful | None | Suggest related tools |
| Check availability | Waits for phone hours, calls | Annoyed | Process: calls only two evenings | Show live availability |
| Travel | Drives over | Anxious | Tool may be gone | Hold a reservation |
| Pick up | Signs paper form | Neutral | Process: slow paperwork | Digital check-out |
| Return | Forgets date | Embarrassed | No reminder | Send a reminder |

**Problem statement:** "Weekend renovators need to know a tool is available
and held for them before they travel, because a wasted trip costs half a day
of a two-day project."

**Hypothesis:** "If members can see availability and place a hold online,
then wasted trips will drop and more members will borrow on weekends."

## Key terms

- **User interview; open, leading and closed questions.**
- **Empathy map: says, thinks, does, feels.**
- **Persona; user story; user journey map.**
- **Pain point: financial, product, process, support.**
- **Problem statement (point of view); hypothesis statement; value
  proposition.**
- **Human factors; mental model; cognitive load; Hick's law; Fitts's law.**

## Check yourself

1. Rewrite "Would you use an app to reserve tools?" as an interview question
   that asks about past behavior.
2. What are the four quadrants of an empathy map?
3. Why did Cooper argue for personas?
4. What does a journey map show that a single interview quote can't?
5. What's wrong with the problem statement "Members need an app"?
6. Write a hypothesis statement for adding return reminders.
7. By Fitts's law, why should "Reserve" be a large button near the tool's
   name?
8. Classify this pain point: members can't reach the library by phone during
   their working hours.
9. Write a user story and a one-sentence value proposition for the tool
   library's text reminders.

## Answers

1. For example: "Tell me about the last time you borrowed a tool. How did you
   find out whether it was available?"
2. Says, thinks, does, feels.
3. To keep the team designing for specific, researched people instead of a
   vague "user" that stretches to justify any feature.
4. Where in a sequence of steps people struggle, and how their feelings
   change along the way.
5. It names a solution, not a need, and has no insight saying why.
6. For example: "If members get a text reminder the day before a tool is
   due, then more tools will come back on time."
7. Because time to reach a target falls as the target gets bigger and closer
   to where the user's attention and pointer already are.
8. A process pain point (it could also be read as a support pain point):
   the steps depend on limited phone hours.
9. For example: "As a busy member, I want a text the day before a tool is
   due so that I return it on time." Value proposition: "Reminders mean no
   late returns, without having to remember due dates."

*Next: Chapter 3 generates solutions.*
