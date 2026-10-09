# Ideate: competitive audits and generating solutions

*Companion to Course 2, Start the UX Design Process, second half. Before you
start: Chapter 2's problem statement.*

## What you will be able to do

- Plan and run a competitive audit, and evaluate competitors against
  heuristics.
- Reframe a problem as "How might we" questions.
- Generate many solutions quickly with sketching techniques such as Crazy
  Eights, then converge on the strongest.
- Explain why generating before judging leads to better designs.
- Check a solution idea against the user's journey.

## Competitive audits

A **competitive audit** examines what competitors do, to learn from their
strengths and gaps. **Direct competitors** offer the same thing to the same
people (another tool-lending library's app). **Indirect competitors** meet the
same need another way (a hardware store's rental counter; a neighborhood
lending group chat).

Run one in steps:

1. State the goal: what do you need to learn?
2. List three to five direct and two or three indirect competitors.
3. Choose criteria: features, first impressions, interaction, accessibility,
   visual design, content, pricing.
4. Use each product as a user would, and record what you find in a table.
5. Summarize strengths to learn from and gaps to fill.

Jakob Nielsen's ten **usability heuristics** are a standard set of criteria
[@nielsen1994]. They include: visibility of system status; match between
system and the real world; user control and freedom; consistency and
standards; error prevention; recognition rather than recall; flexibility and
efficiency of use; aesthetic and minimalist design; helping users recognize,
diagnose and recover from errors; and help and documentation. A competitive
audit that scores each product on them is a **heuristic evaluation**.

Audit to learn, not to copy. Copying a competitor's design fixes you to
their assumptions.

## Diverge, then converge

Ideation has two movements. First **diverge**: produce many ideas, including
odd ones, without judging. Then **converge**: compare, combine and choose.
Mixing the two, judging each idea as it appears, kills ideas before they
develop.

The order matters because of **design fixation**: in experiments by David
Jansson and Steven Smith, senior engineering students and practicing
mechanical engineers shown an example design before designing reproduced its
features, including its flaws, more than those shown nothing [@jansson-smith1991]. The first idea in the room anchors
everything after it. The remedies are procedural: generate alone before
sharing, generate a quantity before choosing, and look at competitors after
your own sketches, not before.

## How might we

A **"How might we" (HMW)** question reframes a problem as an opportunity
open to many answers. "How" assumes it can be solved; "might" allows that any
idea may not work; "we" makes it shared. Start from the problem statement and
pain points:

- Pain point: tools are out when members arrive.
- HMW: How might we let members know a tool is available before they travel?
- HMW: How might we hold a tool for a member who's on the way?
- HMW: How might we make returning on time effortless?

Good HMWs are neither too broad ("How might we fix borrowing?") nor so narrow
they contain the answer ("How might we add a calendar widget?").

## Sketching ideas

Sketching is the fastest way to explore ideas visually; drawing skill doesn't
matter. **Crazy Eights**, from the design sprint, asks each person to fold a
sheet into eight panels and sketch eight ideas in eight minutes, one per
minute [@knapp2016]. The time pressure pushes past the first obvious idea.

Then converge:

- Each person presents their sketches briefly.
- The group marks strong parts of any sketch with dot votes.
- The Decider, or the group, chooses what to develop, often combining parts
  of more than one sketch.

Check each chosen idea against the journey map: does it relieve a pain point
at a real stage? Does it add new steps somewhere else? An idea that removes
the phone call but adds three screens of sign-up may move the pain rather
than remove it.

## Worked example: ideating for the tool library

**Competitive audit (excerpt).**

| Competitor | Type | Strength | Gap |
|---|---|---|---|
| Another city's tool library app | Direct | Live availability per tool | No reservations; screen reader skips tool names |
| Hardware store rental counter | Indirect | Online booking with pickup time | Expensive; no neighborhood feel |
| Neighborhood lending group chat | Indirect | Fast, personal | No record of who has what |

On Nielsen's heuristics, the direct competitor scores poorly on *visibility
of system status* (reservations aren't confirmed) and *consistency* (icons
change meaning between screens).

**HMWs** as above, plus "How might we serve members who don't have
smartphones?"

**Crazy Eights.** Four volunteers produce 32 sketches. Ideas include a
tool-by-tool availability list, a map of the library's shelves, a "hold for
two hours" button, a text-message service for members without smartphones, a
return countdown on the home screen, and a Spanish-language toggle.

**Converging.** Dot votes cluster on: the availability list, the two-hour
hold, text reminders, and the text-message service. Checked against the
journey map, the hold removes the travel anxiety pain point; the text service
keeps members without smartphones included.

## Key terms

- **Competitive audit; direct and indirect competitors.**
- **Usability heuristics; heuristic evaluation.**
- **Diverge; converge; design fixation.**
- **How might we.**
- **Crazy Eights; dot voting.**

## Check yourself

1. Is a hardware store's rental counter a direct or indirect competitor to
   the tool library? Why?
2. Name five of Nielsen's ten usability heuristics.
3. What did Jansson and Smith find when designers saw an example first?
4. Why generate ideas alone before discussing them?
5. Rewrite "How might we add a map?" as a better HMW.
6. What is Crazy Eights, and what's it for?
7. How do you check a chosen idea against the user journey?

## Answers

1. Indirect: it meets the same need (using a tool without buying it) in a
   different way, as a paid rental rather than a membership library.
2. Any five of: visibility of system status; match between system and the
   real world; user control and freedom; consistency and standards; error
   prevention; recognition rather than recall; flexibility and efficiency of
   use; aesthetic and minimalist design; help users recognize, diagnose and
   recover from errors; help and documentation.
3. They reproduced its features, flaws included: design fixation.
4. To avoid fixating on the first idea shared and to get more, and more
   varied, ideas before judging.
5. For example: "How might we help members find a tool quickly once they're
   at the library?" It states the need without dictating the solution.
6. Sketching eight ideas in eight minutes, one per panel, to push past the
   first obvious idea.
7. Walk the journey map stage by stage and ask whether the idea relieves a
   real pain point there without adding new ones elsewhere.

*Next: Chapter 4 turns the chosen ideas into wireframes and prototypes.*
